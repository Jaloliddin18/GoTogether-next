export interface RobotTrackingRequest {
	requestId: string;
	requestType?: string;
	status?: string;
	bookTitle?: string;
	createdAt?: string;
}

export interface RobotTrackingEnvelope<T = any> {
	event: string;
	data: T;
}

export const ROBOT_TRACKING_REQUEST_EVENT = 'gotogether:robot-tracking-request';
export const ROBOT_TRACKING_STORAGE_KEY = 'gotogether.robotTracking.requests';
export const ROBOT_NOTIFICATION_STORAGE_KEY = 'gotogether.robotTracking.notifications';

const uniqueRequests = (requests: RobotTrackingRequest[]): RobotTrackingRequest[] => {
	const byId = new Map<string, RobotTrackingRequest>();
	requests.forEach((request) => {
		if (!request.requestId) return;
		byId.set(request.requestId, { ...byId.get(request.requestId), ...request });
	});
	return Array.from(byId.values()).slice(-8);
};

export const getRobotTrackingWsUrl = (): string => {
	const explicitUrl = process.env.NEXT_PUBLIC_WS_URL;
	if (explicitUrl) return explicitUrl;

	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	if (apiUrl) {
		try {
			const url = new URL(apiUrl);
			url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
			url.port = '3009';
			url.pathname = '';
			url.search = '';
			url.hash = '';
			return url.toString().replace(/\/$/, '');
		} catch {
			// Fall through to default.
		}
	}
	return 'ws://localhost:3009';
};

export const loadTrackingRequests = (): RobotTrackingRequest[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(ROBOT_TRACKING_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? uniqueRequests(parsed) : [];
	} catch {
		return [];
	}
};

export const rememberTrackingRequest = (request: RobotTrackingRequest): RobotTrackingRequest[] => {
	if (typeof window === 'undefined' || !request.requestId) return [];
	const nextRequests = uniqueRequests([...loadTrackingRequests(), request]);
	window.localStorage.setItem(ROBOT_TRACKING_STORAGE_KEY, JSON.stringify(nextRequests));
	return nextRequests;
};

export const announceTrackingRequest = (request: RobotTrackingRequest): void => {
	if (typeof window === 'undefined' || !request.requestId) return;
	rememberTrackingRequest(request);
	window.dispatchEvent(new CustomEvent(ROBOT_TRACKING_REQUEST_EVENT, { detail: request }));
};

export const parseTrackingEnvelope = (message: MessageEvent<string>): RobotTrackingEnvelope | null => {
	try {
		const parsed = JSON.parse(message.data);
		if (!parsed || typeof parsed.event !== 'string') return null;
		return { event: parsed.event, data: parsed.data ?? {} };
	} catch {
		return null;
	}
};

export const joinRobotRequestRoom = (socket: WebSocket, requestId: string): void => {
	if (!requestId || socket.readyState !== WebSocket.OPEN) return;
	socket.send(
		JSON.stringify({
			event: 'joinRequest',
			data: { requestId },
		}),
	);
};
