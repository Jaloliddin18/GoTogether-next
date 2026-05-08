import { Direction } from '../../enums/common.enum';
import { RobotStatus } from '../../enums/robot.enum';

export interface RobotPoseInput {
	floorId: string;
	x: number;
	y: number;
	theta: number;
}

export interface CreateRobotInput {
	robotId: string;
	name: string;
	status?: RobotStatus;
	battery?: number;
	isOnline?: boolean;
	currentRequestId?: string;
	currentPose?: RobotPoseInput;
}

interface RobotSearchInput {
	robotId?: string;
	name?: string;
	status?: RobotStatus;
	isOnline?: boolean;
	batteryMin?: number;
	batteryMax?: number;
}

export interface RobotsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: RobotSearchInput;
}
