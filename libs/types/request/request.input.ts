import { Direction } from '../../enums/common.enum';
import {
	DeliveryDestinationType,
	PaymentStatus,
	RequestStatus,
	RequestType,
} from '../../enums/request.enum';

export interface DestinationInput {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface CreateDeliveryRequestInput {
	bookId: string;
	requestType: RequestType;
	sessionId?: string;
	sourceInventoryId?: string;
	destinationType?: DeliveryDestinationType;
	destinationDeskId?: string;
	destination?: DestinationInput;
}

interface RequestsSearchInput {
	status?: RequestStatus;
	requestType?: RequestType;
	destinationType?: DeliveryDestinationType;
	paymentStatus?: PaymentStatus;
	bookId?: string;
	sourceInventoryId?: string;
	robotId?: string;
	memberId?: string;
	sessionId?: string;
	destinationDeskId?: string;
}

export interface RequestsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: RequestsSearchInput;
}

export interface SessionRequestsInquiry {
	page: number;
	limit: number;
	sessionId?: string;
	sort?: string;
	direction?: Direction;
}
