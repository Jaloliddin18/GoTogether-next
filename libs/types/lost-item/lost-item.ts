import {
	LostItemEventType,
	LostItemObjectType,
	LostItemPriority,
	LostItemStatus,
} from '../../enums/lost-item.enum';
import { TotalCounter } from '../property/property';

export interface LostItemLocation {
	source?: string;
	floorId?: string;
	x?: number;
	y?: number;
	patrolCheckpoint?: string;
}

export interface LostItemRecord {
	_id: string;
	robotId: string;
	eventType: LostItemEventType;
	objectType: LostItemObjectType;
	confidence: number;
	priority: LostItemPriority;
	detectedAt: Date;
	snapshotPath?: string;
	snapshotUrl?: string;
	location?: LostItemLocation;
	status: LostItemStatus;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LostItems {
	list: LostItemRecord[];
	metaCounter: TotalCounter[];
}

export interface LostItemSnapshotUploadResult {
	snapshotPath: string;
	snapshotUrl: string;
}
