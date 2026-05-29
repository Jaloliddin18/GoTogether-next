import { LostItemStatus } from '../../enums/lost-item.enum';

export interface UpdateLostItemStatusInput {
	lostItemId: string;
	status: LostItemStatus;
}
