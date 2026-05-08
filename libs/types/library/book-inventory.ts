import { Direction } from '../../enums/common.enum';
import {
	LibraryBookInventoryStatus,
	LibraryBookInventoryType,
	LibraryBookStorageZone,
} from '../../enums/library.enum';
import {
	LibraryBookPickup,
	LibraryBookShelf,
	LibraryPose,
	LibraryTotalCounter,
} from './common';

export interface LibraryBookInventory {
	_id: string;
	bookId: string;
	bookInventoryType: LibraryBookInventoryType;
	bookStorageZone: LibraryBookStorageZone;
	bookInventoryStatus: LibraryBookInventoryStatus;
	bookTotalQuantity: number;
	bookSoldQuantity: number;
	bookReservedQuantity: number;
	bookBorrowedQuantity: number;
	bookShelf: LibraryBookShelf;
	bookLocation: LibraryPose;
	bookPickup: LibraryBookPickup;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface LibraryBookInventories {
	list: LibraryBookInventory[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryBookInventorySearchInput {
	bookId?: string;
	bookInventoryType?: LibraryBookInventoryType;
	bookStorageZone?: LibraryBookStorageZone;
	bookInventoryStatus?: LibraryBookInventoryStatus;
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

export interface LibraryBookInventoriesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LibraryBookInventorySearchInput;
}
