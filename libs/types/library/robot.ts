import { Direction } from '../../enums/common.enum';
import { LibraryRobotStatus } from '../../enums/library.enum';
import { LibraryPose, LibraryTotalCounter } from './common';

export interface LibraryRobot {
	_id: string;
	robotId: string;
	name: string;
	status: LibraryRobotStatus;
	battery: number;
	isOnline: boolean;
	lastSeenAt?: Date;
	currentRequestId?: string | null;
	currentPose: LibraryPose;
	createdAt: Date;
	updatedAt: Date;
}

export interface LibraryRobots {
	list: LibraryRobot[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryRobotSearchInput {
	robotId?: string;
	name?: string;
	status?: LibraryRobotStatus;
	isOnline?: boolean;
	batteryMin?: number;
	batteryMax?: number;
}

export interface LibraryRobotsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LibraryRobotSearchInput;
}
