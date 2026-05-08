import { PickupDirection } from '../../enums/library.enum';

export interface LibraryTotalCounter {
	total?: number;
}

export interface LibraryMeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface LibraryMeFollowed {
	followingId: string;
	followerId: string;
	myFollowing: boolean;
}

export interface LibraryPose {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface LibraryBookShelf {
	section: string;
	row: string;
	level: string;
	slot?: string;
}

export interface LibraryBookPickup {
	gripperOpenWidthCm: number;
	gripperCloseWidthCm: number;
	gripHoldSeconds: number;
	pickupDirection: PickupDirection;
}
