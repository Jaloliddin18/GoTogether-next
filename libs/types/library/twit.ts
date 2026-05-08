import { Direction } from '../../enums/common.enum';
import { LibraryMember } from './member';
import { LibraryTotalCounter } from './common';

export interface LibraryTwit {
	_id: string;
	memberId: string;
	text: string;
	image?: string;
	likes: string[];
	likeCount: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: LibraryMember;
}

export interface LibraryTwits {
	list: LibraryTwit[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryCreateTwitInput {
	text: string;
	image?: string;
}

export interface LibraryTwitSearchInput {
	text?: string;
}

export interface LibraryTwitsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LibraryTwitSearchInput;
}

export interface LibraryTwitComment {
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
	memberData?: LibraryMember;
	meLiked?: boolean;
}

export interface LibraryTwitComments {
	list: LibraryTwitComment[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryCreateTwitCommentInput {
	twitId: string;
	text: string;
	parentCommentId?: string;
}

export interface LibraryUpdateTwitCommentInput {
	commentId: string;
	text: string;
}

export interface LibraryTwitCommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
}
