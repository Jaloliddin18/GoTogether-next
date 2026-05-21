import { useState, useEffect, useRef } from 'react';

export interface RobotPose {
	x: number;
	y: number;
	theta: number;
	floorId?: string;
}

export interface TimelineEntry {
	status: string;
	message: string;
	timestamp: string;
}

export interface UseRobotSocketReturn {
	connected: boolean;
	pose: RobotPose | null;
	robotStatus: string | null;
	battery: number | null;
	requestStatus: string | null;
	timeline: TimelineEntry[];
	bookNotFound: boolean;
	robotOffline: boolean;
	connectionError: string | null;
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
const TERMINAL_REQUEST_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED', 'BOOK_NOT_FOUND']);

function canOverrideRequestStatus(
	currentStatus: string | null,
	nextStatus: string | null,
): boolean {
	if (!nextStatus) return false;
	if (!currentStatus) return true;
	if (currentStatus === nextStatus) return true;
	if (TERMINAL_REQUEST_STATUSES.has(currentStatus) && !TERMINAL_REQUEST_STATUSES.has(nextStatus)) {
		return false;
	}
	return true;
}

function normalizeTimelineEntry(raw: unknown): TimelineEntry | null {
	if (!raw || typeof raw !== 'object') return null;
	const item = raw as Record<string, unknown>;
	if (!item.status || typeof item.status !== 'string') return null;
	return {
		status: item.status,
		message: typeof item.message === 'string' ? item.message : '',
		timestamp:
			typeof item.timestamp === 'string'
				? item.timestamp
				: new Date().toISOString(),
	};
}

export function useRobotSocket(requestId: string | null): UseRobotSocketReturn {
	const [connected, setConnected] = useState(false);
	const [pose, setPose] = useState<RobotPose | null>(null);
	const [robotStatus, setRobotStatus] = useState<string | null>(null);
	const [battery, setBattery] = useState<number | null>(null);
	const [requestStatus, setRequestStatus] = useState<string | null>(null);
	const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
	const [bookNotFound, setBookNotFound] = useState(false);
	const [robotOffline, setRobotOffline] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const retryCountRef = useRef(0);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const unmountedRef = useRef(false);
	const lastPoseRef = useRef<{ x: number; y: number } | null>(null);
	const requestStatusRef = useRef<string | null>(null);

	useEffect(() => {
		if (!requestId) return;
		unmountedRef.current = false;

		// Reset per-request state when requestId changes
		setPose(null);
		setRobotStatus(null);
		setBattery(null);
		setRequestStatus(null);
		setTimeline([]);
		setBookNotFound(false);
		setRobotOffline(false);
		setConnectionError(null);
		retryCountRef.current = 0;
		lastPoseRef.current = null;
		requestStatusRef.current = null;

		const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3009';

		const connect = () => {
			if (unmountedRef.current) return;
			if (retryCountRef.current >= MAX_RETRIES) {
				setConnectionError('Could not connect to the tracking service. Please refresh the page.');
				return;
			}

			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				if (unmountedRef.current) { ws.close(); return; }
				retryCountRef.current = 0;
				setConnectionError(null);
				ws.send(JSON.stringify({ event: 'joinRequest', data: { requestId } }));
			};

			ws.onmessage = (e: MessageEvent) => {
				if (unmountedRef.current) return;
				try {
					const msg = JSON.parse(e.data as string) as { event: string; data: Record<string, unknown> };
					const { event, data } = msg;

					switch (event) {
						case 'joined':
							setConnected(true);
							break;

						case 'robotPosition': {
							const newX = data.x as number;
							const newY = data.y as number;
							const prev = lastPoseRef.current;
							const dist = prev
								? Math.sqrt(Math.pow(newX - prev.x, 2) + Math.pow(newY - prev.y, 2))
								: Infinity;
							if (dist > 0.5) {
								lastPoseRef.current = { x: newX, y: newY };
								setPose({
									x: newX,
									y: newY,
									theta: data.theta as number,
									floorId: data.floorId as string,
								});
							}
							break;
						}

						case 'robotStatus':
							if (data.status) setRobotStatus(data.status as string);
							if (data.battery != null) setBattery(data.battery as number);
							break;

						case 'requestUpdated': {
							if (data.requestId && data.requestId !== requestId) break;
							const nextStatus =
								typeof data.status === 'string' ? data.status : null;
							const payloadTimeline = Array.isArray(data.timeline)
								? (data.timeline
									.map((entry) => normalizeTimelineEntry(entry))
									.filter(Boolean) as TimelineEntry[])
								: [];
							const canApplyStatus = canOverrideRequestStatus(
								requestStatusRef.current,
								nextStatus,
							);

							if (canApplyStatus) {
								requestStatusRef.current = nextStatus;
								setRequestStatus(nextStatus);
							}

							const payloadHasTerminal = payloadTimeline.some((entry) =>
								TERMINAL_REQUEST_STATUSES.has(entry.status),
							);
							if (payloadTimeline.length > 0 && (canApplyStatus || payloadHasTerminal)) {
								setTimeline(payloadTimeline);
							} else if (nextStatus && canApplyStatus) {
								setTimeline((prev) => [
									...prev,
									{
										status: nextStatus,
										message: typeof data.message === 'string' ? data.message : '',
										timestamp:
											typeof data.timestamp === 'string'
												? data.timestamp
												: new Date().toISOString(),
									},
								]);
							}
							break;
						}

						case 'deliveryReady':
							if (data.requestId && data.requestId !== requestId) break;
							if (!canOverrideRequestStatus(requestStatusRef.current, 'READY')) break;
							requestStatusRef.current = 'READY';
							setRequestStatus('READY');
							setTimeline((prev) => [
								...prev,
								{
									status: 'READY',
									message: (data.message as string) ?? 'Your book is ready for pickup.',
									timestamp: (data.timestamp as string) ?? new Date().toISOString(),
								},
							]);
							break;

						case 'bookNotFound':
							if (data.requestId && data.requestId !== requestId) break;
							requestStatusRef.current = 'BOOK_NOT_FOUND';
							setBookNotFound(true);
							setRequestStatus('BOOK_NOT_FOUND');
							setTimeline((prev) => [
								...prev,
								{
									status: 'BOOK_NOT_FOUND',
									message: (data.message as string) ?? 'Book not found on shelf.',
									timestamp: (data.timestamp as string) ?? new Date().toISOString(),
								},
							]);
							break;

						case 'robotOffline':
							setRobotOffline(true);
							break;

						case 'error':
							setConnectionError((data?.message as string) ?? 'Tracking connection error.');
							break;
					}
				} catch {
					// Silently ignore malformed messages
				}
			};

			ws.onclose = () => {
				if (unmountedRef.current) return;
				setConnected(false);
				retryCountRef.current += 1;
				retryTimerRef.current = setTimeout(connect, RETRY_DELAY_MS);
			};

			ws.onerror = () => {
				// onclose fires after onerror — let reconnect logic handle it
				ws.close();
			};
		};

		connect();

		return () => {
			unmountedRef.current = true;
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
			if (wsRef.current) {
				wsRef.current.onclose = null; // prevent retry-on-close during unmount
				wsRef.current.close();
			}
			setConnected(false);
		};
	}, [requestId]);

	return {
		connected,
		pose,
		robotStatus,
		battery,
		requestStatus,
		timeline,
		bookNotFound,
		robotOffline,
		connectionError,
	};
}
