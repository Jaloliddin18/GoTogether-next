import { PickupDirection } from '../../enums/library.enum';
import type { MeLiked, TotalCounter } from '../property/property';
import type { MeFollowed } from '../follow/follow';

export type LibraryTotalCounter = TotalCounter;
export type LibraryMeLiked = MeLiked;
export type LibraryMeFollowed = MeFollowed;

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
