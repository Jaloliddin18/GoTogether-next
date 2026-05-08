import { BookCategory, BookStatus, BookType } from '../../enums/book.enum';
import {
	BookInventoryStatus,
	BookInventoryType,
} from '../../enums/book-inventory.enum';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import {
	DeliveryDestinationType,
	PaymentStatus,
	RequestStatus,
	RequestType,
} from '../../enums/request.enum';
import { RobotStatus } from '../../enums/robot.enum';
import { TotalCounter } from '../property/property';

export interface RequestDestination {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface RequestTimelineItem {
	status: RequestStatus;
	message?: string;
	timestamp: Date;
}

export interface RequestError {
	code?: string;
	message?: string;
	timestamp?: Date;
}

export interface RequestBookData {
	_id: string;
	bookTitle: string;
	bookAuthor?: string;
	bookImages?: string[];
	bookCallNumber?: string;
	bookStatus?: BookStatus;
	bookType?: BookType;
	bookCategory?: BookCategory;
}

export interface RequestRobotData {
	_id: string;
	robotId: string;
	status: RobotStatus;
	isOnline: boolean;
	battery: number;
	currentPose?: RequestDestination;
	lastSeenAt?: Date;
}

export interface RequestInventoryShelfData {
	section: string;
	row: string;
	level: string;
	slot?: string;
}

export interface RequestInventoryPickupData {
	gripperOpenWidthCm: number;
	gripperCloseWidthCm: number;
	gripHoldSeconds: number;
	pickupDirection: string;
}

export interface RequestInventoryData {
	_id: string;
	bookInventoryType?: BookInventoryType;
	bookInventoryStatus?: BookInventoryStatus;
	bookLocation?: RequestDestination;
	bookShelf?: RequestInventoryShelfData;
	bookPickup?: RequestInventoryPickupData;
	bookTotalQuantity?: number;
	bookReservedQuantity?: number;
	bookBorrowedQuantity?: number;
	bookSoldQuantity?: number;
}

export interface RequestMemberData {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: MemberType;
	memberStatus?: MemberStatus;
}

export interface RequestTask {
	_id: string;
	bookId: string;
	sourceInventoryId: string;
	requestType: RequestType;
	robotId?: string;
	memberId?: string;
	sessionId?: string;
	destinationDeskId?: string;
	destinationType: DeliveryDestinationType;
	destination: RequestDestination;
	status: RequestStatus;
	paymentStatus: PaymentStatus;
	timeline: RequestTimelineItem[];
	error?: RequestError | null;
	bookData?: RequestBookData;
	robotData?: RequestRobotData;
	inventoryData?: RequestInventoryData;
	memberData?: RequestMemberData;
	createdAt: Date;
	updatedAt: Date;
}

export interface Requests {
	list: RequestTask[];
	metaCounter: TotalCounter[];
}
