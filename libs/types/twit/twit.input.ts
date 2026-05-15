import { Direction } from '../../enums/common.enum';

export enum TwitFeedType {
	FOR_YOU = 'FOR_YOU',
	FOLLOWING = 'FOLLOWING',
}

export interface CreateTwitInput {
	text: string;
	image?: string;
}

export interface TwitInquiry {
	_id: string;
}

interface TwitSearch {
	text?: string;
	memberId?: string;
}

export interface TwitsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: TwitSearch;
	feedType?: TwitFeedType;
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
