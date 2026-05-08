import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface TwitComment {
	_id: string;
	twitId: string;
	memberId: string;
	text: string;
	parentCommentId?: string;
	depth: number;
	likes: string[];
	likeCount: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
	meLiked?: boolean;
}

export interface TwitComments {
	list: TwitComment[];
	metaCounter: TotalCounter[];
}
