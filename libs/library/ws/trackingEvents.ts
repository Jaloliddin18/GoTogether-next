import {
	ROBOT_NOTIFICATION_STORAGE_KEY,
	RobotTrackingEnvelope,
} from './trackingClient';

export interface RobotNotification {
	id: string;
	requestId: string;
	robotId?: string;
	title: string;
	status: string;
	message?: string;
	timestamp: string;
	event: string;
}

const statusTitles: Record<string, string> = {
	QUEUED: 'Request queued',
	ASSIGNED: 'Robot assigned',
	DISPATCHED: 'Robot dispatched',
	NAVIGATING_TO_SHELF: 'Robot started moving',
	ARRIVED_AT_SHELF: 'Robot reached shelf',
	VERIFYING_BOOK: 'Checking requested book',
	BOOK_FOUND: 'Book found',
	BOOK_NOT_FOUND: 'Book could not be found',
	PICKING_UP: 'Picking up book',
	DELIVERING: 'Delivering to your desk',
	ARRIVED_AT_STUDENT: 'Robot arrived near your desk',
	READY: 'Your book is ready',
	COMPLETED: 'Delivery completed',
	FAILED: 'Delivery needs attention',
	CANCELLED: 'Request cancelled',
	RETURNING: 'Robot returning to dock',
};

const eventTitles: Record<string, string> = {
	robotOffline: 'Robot connection lost',
	bookNotFound: 'Book could not be found',
	deliveryReady: 'Your book arrived',
};

const toIsoTimestamp = (timestamp?: string): string => {
	if (!timestamp) return new Date().toISOString();
	const parsed = new Date(timestamp);
	return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const getStatus = (event: string, data: any): string => {
	if (event === 'deliveryReady') return 'READY';
	if (event === 'bookNotFound') return 'BOOK_NOT_FOUND';
	if (event === 'robotOffline') return 'FAILED';
	return data?.status ?? data?.state ?? 'ASSIGNED';
};

export const getRobotNotificationTitle = (status: string, event?: string): string => {
	if (event && eventTitles[event]) return eventTitles[event];
	return statusTitles[status] ?? 'Robot status updated';
};

export const createRobotNotification = (
	envelope: RobotTrackingEnvelope,
): RobotNotification | null => {
	const { event, data } = envelope;
	if (!['robotStatus', 'requestUpdated', 'robotOffline', 'bookNotFound', 'deliveryReady'].includes(event)) {
		return null;
	}

	const requestId = data?.requestId;
	if (!requestId) return null;

	const status = getStatus(event, data);
	const timestamp = toIsoTimestamp(data?.timestamp);
	return {
		id: `${requestId}-${event}-${status}-${timestamp}`,
		requestId,
		robotId: data?.robotId,
		title: getRobotNotificationTitle(status, event),
		status,
		message: data?.message,
		timestamp,
		event,
	};
};

export const loadRobotNotifications = (): RobotNotification[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(ROBOT_NOTIFICATION_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export const saveRobotNotifications = (notifications: RobotNotification[]): void => {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(ROBOT_NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(-30)));
};
