import {
	PaymentStatus,
	RequestErrorCode,
	RequestStatus,
} from '../../enums/request.enum';

export interface UpdateRequestStatusInput {
	requestId: string;
	status: RequestStatus;
	message?: string;
	errorCode?: RequestErrorCode;
	paymentStatus?: PaymentStatus;
}

export interface CancelRequestInput {
	requestId: string;
	sessionId?: string;
	reason?: string;
}
