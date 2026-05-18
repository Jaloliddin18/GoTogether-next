import { useState, useEffect, useRef } from 'react';

export interface RobotPose {
	x: number;
	y: number;
	theta: number;
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

		const wsUrl = process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007';

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

						case 'robotPosition':
							setPose({ x: data.x as number, y: data.y as number, theta: data.theta as number });
							break;

						case 'robotStatus':
							if (data.status) setRobotStatus(data.status as string);
							if (data.battery != null) setBattery(data.battery as number);
							break;

						case 'requestUpdated':
							setRequestStatus(data.status as string);
							setTimeline((prev) => [
								...prev,
								{
									status: data.status as string,
									message: (data.message as string) ?? '',
									timestamp: (data.timestamp as string) ?? new Date().toISOString(),
								},
							]);
							break;

						case 'deliveryReady':
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
