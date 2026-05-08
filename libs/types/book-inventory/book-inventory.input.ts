import { Direction } from '../../enums/common.enum';
import {
	BookInventoryStatus,
	BookInventoryType,
	BookStorageZone,
} from '../../enums/book-inventory.enum';

export interface BookShelfInput {
	section: string;
	row: string;
	level: string;
	slot?: string;
}

export interface BookInventoryLocationInput {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface BookInventoryPickupInput {
	gripperOpenWidthCm: number;
	gripperCloseWidthCm: number;
	gripHoldSeconds?: number;
	pickupDirection?: string;
}

export interface CreateBookInventoryInput {
	bookId: string;
	bookInventoryType: BookInventoryType;
	bookStorageZone: BookStorageZone;
	bookInventoryStatus?: BookInventoryStatus;
	bookTotalQuantity?: number;
	bookSoldQuantity?: number;
	bookReservedQuantity?: number;
	bookBorrowedQuantity?: number;
	bookShelf: BookShelfInput;
	bookLocation: BookInventoryLocationInput;
	bookPickup: BookInventoryPickupInput;
}

interface BookInventorySearchInput {
	bookId?: string;
	bookInventoryType?: BookInventoryType;
	bookStorageZone?: BookStorageZone;
	bookInventoryStatus?: BookInventoryStatus;
	floorId?: string;
	section?: string;
	row?: string;
	level?: string;
	slot?: string;
	minTotalQuantity?: number;
	maxTotalQuantity?: number;
	minSoldQuantity?: number;
	maxSoldQuantity?: number;
	minReservedQuantity?: number;
	maxReservedQuantity?: number;
	minBorrowedQuantity?: number;
	maxBorrowedQuantity?: number;
}

export interface BookInventoriesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: BookInventorySearchInput;
}
