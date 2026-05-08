import { Direction } from '../../enums/common.enum';
import {
	LibraryBookCategory,
	LibraryBookInventoryStatus,
	LibraryBookInventoryType,
	LibraryBookStatus,
	LibraryBookType,
	LibraryDeliveryDestinationType,
	LibraryPaymentStatus,
	LibraryRequestErrorCode,
	LibraryRequestStatus,
	LibraryRequestType,
	LibraryRobotStatus,
} from '../../enums/library.enum';
import { LibraryBookPickup, LibraryBookShelf, LibraryPose, LibraryTotalCounter } from './common';
import { LibraryMemberSummary } from './member';

export interface LibraryRequestTimelineItem {
	status: LibraryRequestStatus;
	message?: string;
	timestamp: Date;
}

export interface LibraryRequestError {
	code?: LibraryRequestErrorCode | string;
	message?: string;
	timestamp?: Date;
}

export interface LibraryRequestBookData {
	_id: string;
	bookTitle: string;
	bookAuthor?: string;
	bookImages?: string[];
	bookCallNumber?: string;
	bookStatus?: LibraryBookStatus;
	bookType?: LibraryBookType;
	bookCategory?: LibraryBookCategory;
}

export interface LibraryRequestRobotData {
	_id: string;
	robotId: string;
	status: LibraryRobotStatus;
	isOnline: boolean;
	battery: number;
	currentPose?: LibraryPose;
	lastSeenAt?: Date;
}

export interface LibraryRequestInventoryData {
	_id: string;
	bookInventoryType?: LibraryBookInventoryType;
	bookInventoryStatus?: LibraryBookInventoryStatus;
	bookLocation?: LibraryPose;
	bookShelf?: LibraryBookShelf;
	bookPickup?: LibraryBookPickup;
	bookTotalQuantity?: number;
	bookReservedQuantity?: number;
	bookBorrowedQuantity?: number;
	bookSoldQuantity?: number;
}

export interface LibraryRequestTask {
	_id: string;
	bookId: string;
	sourceInventoryId: string;
	requestType: LibraryRequestType;
	robotId?: string;
	memberId?: string;
	sessionId?: string;
	destinationDeskId?: string;
	destinationType: LibraryDeliveryDestinationType;
	destination: LibraryPose;
	status: LibraryRequestStatus;
	paymentStatus: LibraryPaymentStatus;
	timeline: LibraryRequestTimelineItem[];
	error?: LibraryRequestError | null;
	bookData?: LibraryRequestBookData;
	robotData?: LibraryRequestRobotData;
	inventoryData?: LibraryRequestInventoryData;
	memberData?: LibraryMemberSummary;
	createdAt: Date;
	updatedAt: Date;
}

export interface LibraryRequests {
	list: LibraryRequestTask[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryCreateDeliveryRequestInput {
	bookId: string;
	requestType: LibraryRequestType;
	sessionId?: string;
	sourceInventoryId?: string;
	destinationDeskId?: string;
	destination?: LibraryPose;
}

export interface LibraryRequestsSearchInput {
	status?: LibraryRequestStatus;
	requestType?: LibraryRequestType;
	destinationType?: LibraryDeliveryDestinationType;
	paymentStatus?: LibraryPaymentStatus;
	bookId?: string;
	sourceInventoryId?: string;
	robotId?: string;
	memberId?: string;
	sessionId?: string;
	destinationDeskId?: string;
}

export interface LibraryRequestsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LibraryRequestsSearchInput;
}

export interface LibrarySessionRequestsInquiry {
	page: number;
	limit: number;
	sessionId?: string;
	sort?: string;
	direction?: Direction;
}
