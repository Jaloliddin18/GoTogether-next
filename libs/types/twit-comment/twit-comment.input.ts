import { Direction } from '../../enums/common.enum';

export interface CreateTwitCommentInput {
	twitId: string;
	text: string;
	parentCommentId?: string;
}

export interface TwitCommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
}
