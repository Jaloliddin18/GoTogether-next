import { BookInventoryStatus } from '../../enums/book-inventory.enum';

interface BookShelfUpdateInput {
	section?: string;
	row?: string;
	level?: string;
	slot?: string;
}

interface BookLocationUpdateInput {
	floorId?: string;
	x?: number;
	y?: number;
	theta?: number;
}

interface BookPickupUpdateInput {
	gripperOpenWidthCm?: number;
	gripperCloseWidthCm?: number;
	gripHoldSeconds?: number;
	pickupDirection?: string;
}

export interface UpdateBookInventoryInput {
	_id: string;
	bookInventoryStatus?: BookInventoryStatus;
	bookTotalQuantity?: number;
	bookSoldQuantity?: number;
	bookReservedQuantity?: number;
	bookBorrowedQuantity?: number;
	bookShelf?: BookShelfUpdateInput;
	bookLocation?: BookLocationUpdateInput;
	bookPickup?: BookPickupUpdateInput;
	deletedAt?: Date;
}

export interface UpdateBookInventoryStatusInput {
	bookInventoryId: string;
	bookInventoryStatus: BookInventoryStatus;
}
