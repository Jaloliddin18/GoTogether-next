export enum LostItemEventType {
	LOST_ITEM_DETECTED = 'LOST_ITEM_DETECTED',
}

export enum LostItemObjectType {
	ID_CARD = 'ID_CARD',
	AIRPODS = 'AIRPODS',
	WATCH = 'WATCH',
	BOTTLE = 'BOTTLE',
	WALLET = 'WALLET',
	PHONE = 'PHONE',
	BOOK = 'BOOK',
	UNKNOWN = 'UNKNOWN',
}

export enum LostItemPriority {
	HIGH = 'HIGH',
	MEDIUM = 'MEDIUM',
	LOW = 'LOW',
}

export enum LostItemStatus {
	PENDING_REVIEW = 'PENDING_REVIEW',
	COLLECTED = 'COLLECTED',
	DISMISSED = 'DISMISSED',
}
