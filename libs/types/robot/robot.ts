import { RobotStatus } from '../../enums/robot.enum';
import { TotalCounter } from '../property/property';

export interface RobotPose {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface Robot {
	_id: string;
	robotId: string;
	name: string;
	status: RobotStatus;
	battery: number;
	isOnline: boolean;
	lastSeenAt?: Date;
	currentRequestId?: string;
	currentPose: RobotPose;
	createdAt: Date;
	updatedAt: Date;
}

export interface Robots {
	list: Robot[];
	metaCounter: TotalCounter[];
}
