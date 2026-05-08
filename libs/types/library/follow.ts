import { LibraryMember } from './member';
import { LibraryMeFollowed, LibraryTotalCounter } from './common';

export interface LibraryFollower {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	meFollowed?: LibraryMeFollowed[];
	followerData?: LibraryMember;
}

export interface LibraryFollowers {
	list: LibraryFollower[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryFollowing {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	meFollowed?: LibraryMeFollowed[];
	followingData?: LibraryMember;
}

export interface LibraryFollowings {
	list: LibraryFollowing[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryFollowInquiry {
	page: number;
	limit: number;
}
