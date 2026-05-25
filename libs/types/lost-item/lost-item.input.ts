import { Direction } from '../../enums/common.enum';
import {
	LostItemObjectType,
	LostItemPriority,
	LostItemStatus,
} from '../../enums/lost-item.enum';

interface LostItemsSearchInput {
	status?: LostItemStatus;
	objectType?: LostItemObjectType;
	priority?: LostItemPriority;
	robotId?: string;
	detectedAtFrom?: Date;
	detectedAtTo?: Date;
}

export interface LostItemsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LostItemsSearchInput;
}
