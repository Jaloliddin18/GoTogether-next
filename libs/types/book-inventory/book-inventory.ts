import {
	BookInventoryStatus,
	BookInventoryType,
	BookStorageZone,
} from '../../enums/book-inventory.enum';
import { TotalCounter } from '../property/property';

export interface BookShelf {
	section: string;
	row: string;
	level: string;
	slot?: string;
}

export interface BookInventoryLocation {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface BookInventoryPickup {
	gripperOpenWidthCm: number;
	gripperCloseWidthCm: number;
	gripHoldSeconds: number;
	pickupDirection: string;
}

export interface BookInventory {
	_id: string;
	bookId: string;
	bookInventoryType: BookInventoryType;
	bookStorageZone: BookStorageZone;
	bookInventoryStatus: BookInventoryStatus;
	bookTotalQuantity: number;
	bookSoldQuantity: number;
	bookReservedQuantity: number;
	bookBorrowedQuantity: number;
	bookShelf: BookShelf;
	bookLocation: BookInventoryLocation;
	bookPickup: BookInventoryPickup;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface BookInventories {
	list: BookInventory[];
	metaCounter: TotalCounter[];
}
