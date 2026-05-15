import { Direction } from '../../enums/common.enum';

export interface CreateTwitInput {
	text: string;
	image?: string;
}

export interface TwitInquiry {
	_id: string;
}

interface TwitSearch {
	text?: string;
}

export interface TwitsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: TwitSearch;
}

interface AllTwitsSearch {
	text?: string;
	memberId?: string;
	isDeleted?: boolean;
}

export interface AllTwitsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: AllTwitsSearch;
}
