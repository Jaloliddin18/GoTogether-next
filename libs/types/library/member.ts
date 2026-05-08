import {
	LibraryMemberAuthType,
	LibraryMemberStatus,
	LibraryMemberType,
} from '../../enums/library.enum';
import { LibraryMeFollowed, LibraryMeLiked, LibraryTotalCounter } from './common';

export interface LibraryMember {
	_id: string;
	memberType: LibraryMemberType;
	memberStatus: LibraryMemberStatus;
	memberAuthType: LibraryMemberAuthType;
	memberPhone: string;
	memberNick: string;
	memberPassword?: string;
	memberFullName?: string;
	memberImage: string;
	memberAddress?: string;
	memberDesc?: string;
	memberBooks: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
	meLiked?: LibraryMeLiked[];
	meFollowed?: LibraryMeFollowed[];
}

export interface LibraryMemberSummary {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: LibraryMemberType;
	memberStatus?: LibraryMemberStatus;
}

export interface LibraryMembers {
	list: LibraryMember[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryMemberProfile {
	member: LibraryMember;
	twitCount: number;
	followerCount: number;
	followingCount: number;
	isFollowing: boolean;
}
