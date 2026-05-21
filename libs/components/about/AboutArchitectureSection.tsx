import React from 'react';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import CloudSyncRoundedIcon from '@mui/icons-material/CloudSyncRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const ARCHITECTURE_FLOW = [
	{
		title: 'Student Web Platform',
		description: 'Students browse books, choose borrow or purchase, and submit delivery requests from the Next.js service.',
		Icon: LanguageRoundedIcon,
		meta: 'Next.js',
	},
	{
		title: 'Backend + Database',
		description: 'NestJS and GraphQL manage books, inventory, requests, robot assignment, and MongoDB records.',
		Icon: StorageRoundedIcon,
		meta: 'NestJS · MongoDB',
	},
	{
		title: 'MQTT Communication',
		description: 'Commands, robot status, and pose telemetry move between the service and the robot bridge.',
		Icon: HubRoundedIcon,
		meta: 'Command · Status · Pose',
	},
	{
		title: 'Cognitive Processing',
		description: 'Laptop-side processing handles route planning, state machine logic, QR and vision feedback, and motion decisions.',
		Icon: MemoryRoundedIcon,
		meta: 'Laptop bridge',
	},
	{
		title: 'TurtleBot + Gripper',
		description: 'The mobile robot navigates to the shelf, retrieves the book with the fixed gripper, and completes delivery.',
		Icon: PrecisionManufacturingRoundedIcon,
		meta: 'Robot execution',
	},
] as const;

const ARCHITECTURE_DETAILS = [
	{
		title: 'Mission Dispatch',
		description: 'Request validation, inventory source, robot assignment, and MQTT command preparation happen before movement starts.',
		Icon: SendRoundedIcon,
	},
	{
		title: 'Route & Vision Logic',
		description: 'BFS route planning, line and QR detection, shelf approach, and pickup confirmation guide the robot locally.',
		Icon: RouteRoundedIcon,
	},
	{
		title: 'Live Feedback Loop',
		description: 'Robot pose and status telemetry update backend state so the frontend can show delivery progress clearly.',
		Icon: CloudSyncRoundedIcon,
	},
] as const;

const AboutArchitectureSection = () => {
	return (
		<section className={'about-architecture-section'} aria-labelledby={'about-architecture-title'}>
			<div className={'container'}>
				<header className={'architecture-heading'}>
					<span className={'architecture-eyebrow'}>System Architecture</span>
					<h2 id={'about-architecture-title'}>From book request to robot delivery</h2>
					<p>
						같이Go connects the student-facing web service, backend request management, MQTT communication,
						laptop-side robot processing, and TurtleBot execution into one prototype delivery flow.
					</p>
				</header>

				<div className={'architecture-flow'} aria-label={'Book request system flow'}>
					{ARCHITECTURE_FLOW.map(({ title, description, Icon, meta }, index) => (
						<React.Fragment key={title}>
							<article className={'architecture-flow-card'}>
								<div className={'architecture-card-top'}>
									<span className={'architecture-card-icon'} aria-hidden={'true'}>
										<Icon />
									</span>
									<span className={'architecture-card-step'}>{String(index + 1).padStart(2, '0')}</span>
								</div>
								<h3>{title}</h3>
								<p>{description}</p>
								<span className={'architecture-card-meta'}>{meta}</span>
							</article>

							{index < ARCHITECTURE_FLOW.length - 1 && (
								<span className={'architecture-connector'} aria-hidden={'true'}>
									<ArrowForwardRoundedIcon />
								</span>
							)}
						</React.Fragment>
					))}
				</div>

				<div className={'architecture-details'} aria-label={'Architecture detail areas'}>
					{ARCHITECTURE_DETAILS.map(({ title, description, Icon }) => (
						<article className={'architecture-detail-card'} key={title}>
							<span className={'architecture-detail-icon'} aria-hidden={'true'}>
								<Icon />
							</span>
							<div>
								<h3>{title}</h3>
								<p>{description}</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
};

export default AboutArchitectureSection;
