import { Direction } from '../../enums/common.enum';

export interface CreateTwitInput {
	text: string;
	image?: string;
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
