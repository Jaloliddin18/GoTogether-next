import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Twit {
	_id: string;
	memberId: string;
	text: string;
	image?: string;
	likes: string[];
	likeCount: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Twits {
	list: Twit[];
	metaCounter: TotalCounter[];
}
