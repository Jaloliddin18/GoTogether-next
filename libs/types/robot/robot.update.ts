import { RobotStatus } from '../../enums/robot.enum';

interface RobotPoseUpdateInput {
	floorId?: string;
	x?: number;
	y?: number;
	theta?: number;
}

export interface UpdateRobotInput {
	_id?: string;
	robotId?: string;
	name?: string;
	status?: RobotStatus;
	battery?: number;
	isOnline?: boolean;
	currentRequestId?: string;
	currentPose?: RobotPoseUpdateInput;
}
