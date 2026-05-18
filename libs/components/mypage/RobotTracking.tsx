import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { Tooltip, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_SESSION_REQUESTS } from '../../../apollo/user/query';
import { useRobotSocket, TimelineEntry } from '../../hooks/useRobotSocket';
import { RequestStatus } from '../../enums/request.enum';
import { RobotStatus } from '../../enums/robot.enum';
import { REACT_APP_API_URL } from '../../config';
import { sweetMixinSuccessAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE = 3.4;
const SVG_W = 680;
const SVG_H = 340;

function rx(v: number) { return v * SCALE; }
function ry(v: number) { return (100 - v) * SCALE; }

const STOP_POINTS = [
	{ id: 'LIB_03', label: 'LIB 1', svg: { x: 56, y: 24 }, labelY: 29 },
	{ id: 'LIB_05', label: 'LIB 2', svg: { x: 116, y: 24 }, labelY: 29 },
	{ id: 'LIB_07', label: 'LIB 3', svg: { x: 176, y: 24 }, labelY: 29 },
	{ id: 'COM_03', label: 'COM 4', svg: { x: 292, y: 24 }, labelY: 29 },
	{ id: 'COM_05', label: 'COM 5', svg: { x: 352, y: 24 }, labelY: 29 },
	{ id: 'COM_07', label: 'COM 6', svg: { x: 412, y: 24 }, labelY: 29 },
];

const CHARGING_DOCK_POSE = { x: 50, y: 18, theta: 0 };

const TERMINAL_STATUSES = new Set([
	RequestStatus.COMPLETED,
	RequestStatus.FAILED,
	RequestStatus.CANCELLED,
	RequestStatus.BOOK_NOT_FOUND,
]);

const NON_ACTIVE_STATUSES = new Set([
	...TERMINAL_STATUSES,
	RequestStatus.QUEUED,
]);

// ─── Delivery tracker model ───────────────────────────────────────────────────

const TRACKER_STEPS = [
	{ label: 'Received', statuses: [RequestStatus.QUEUED], detail: 'Request received' },
	{ label: 'Assigned', statuses: [RequestStatus.ASSIGNED], detail: 'Robot assigned' },
	{ label: 'Dispatched', statuses: [RequestStatus.DISPATCHED], detail: 'Robot dispatched' },
	{ label: 'En Route', statuses: [RequestStatus.NAVIGATING_TO_SHELF], detail: 'Navigating to shelf' },
	{ label: 'At Shelf', statuses: [RequestStatus.ARRIVED_AT_SHELF, RequestStatus.VERIFYING_BOOK, RequestStatus.BOOK_FOUND], detail: 'Verifying book' },
	{ label: 'Picked Up', statuses: [RequestStatus.PICKING_UP, RequestStatus.DELIVERING], detail: 'Delivering to destination' },
	{ label: 'Ready', statuses: [RequestStatus.ARRIVED_AT_STUDENT, RequestStatus.READY], detail: 'Ready for pickup' },
	{ label: 'Delivered', statuses: [RequestStatus.COMPLETED], detail: 'Delivery completed' },
] as const;

type TrackerMode = 'idle' | 'normal' | 'bookNotFound' | 'failed' | 'cancelled';
type TrackerDotState = 'completed' | 'current' | 'pending' | 'failed' | 'warning';

interface TrackerStepView {
	label: string;
	dotState: TrackerDotState;
	timestamp: string | null;
}

interface TrackerViewModel {
	mode: TrackerMode;
	currentIndex: number;
	statusLabel: string;
	message: string;
	alertText: string | null;
	alertClass: 'warning' | 'danger' | null;
	steps: TrackerStepView[];
	completedSegments: number;
	activeSegmentIndex: number | null;
	failedSegmentIndex: number | null;
}

function formatTs(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function findStepTimestamp(timeline: TimelineEntry[], statuses: readonly RequestStatus[]): string | null {
	const hit = timeline.find((entry) => statuses.includes(entry.status as RequestStatus));
	return hit?.timestamp ? formatTs(hit.timestamp) : null;
}

function deriveTrackerViewModel(
	timeline: TimelineEntry[],
	requestStatus: string | null,
	hasActiveRequest: boolean,
): TrackerViewModel {
	const defaultSteps: TrackerStepView[] = TRACKER_STEPS.map((step) => ({
		label: step.label,
		dotState: 'pending',
		timestamp: null,
	}));

	if (!hasActiveRequest) {
		return {
			mode: 'idle',
			currentIndex: -1,
			statusLabel: 'Awaiting request',
			message: '',
			alertText: null,
			alertClass: null,
			steps: defaultSteps,
			completedSegments: 0,
			activeSegmentIndex: null,
			failedSegmentIndex: null,
		};
	}

	const reached = new Set(timeline.map((entry) => entry.status));
	let currentIndex = -1;

	for (let i = TRACKER_STEPS.length - 1; i >= 0; i--) {
		if (TRACKER_STEPS[i].statuses.some((status) => reached.has(status))) {
			currentIndex = i;
			break;
		}
	}

	let mode: TrackerMode = 'normal';
	if (requestStatus === RequestStatus.BOOK_NOT_FOUND || reached.has(RequestStatus.BOOK_NOT_FOUND)) mode = 'bookNotFound';
	if (requestStatus === RequestStatus.FAILED) mode = 'failed';
	if (requestStatus === RequestStatus.CANCELLED) mode = 'cancelled';

	if (mode === 'bookNotFound') currentIndex = 4;
	if ((mode === 'failed' || mode === 'cancelled') && currentIndex < 0) currentIndex = 0;

	const steps = TRACKER_STEPS.map((step, index): TrackerStepView => {
		let dotState: TrackerDotState = 'pending';

		if (mode === 'bookNotFound') {
			if (index < 4) dotState = 'completed';
			else if (index === 4) dotState = 'warning';
		} else if (mode === 'failed' || mode === 'cancelled') {
			if (index < currentIndex) dotState = 'completed';
			else if (index === currentIndex) dotState = 'failed';
		} else if (mode === 'normal') {
			if (index < currentIndex) dotState = 'completed';
			else if (index === currentIndex) dotState = 'current';
		}

		return {
			label: step.label,
			dotState,
			timestamp: (dotState === 'completed' || dotState === 'current')
				? findStepTimestamp(timeline, step.statuses)
				: null,
		};
	});

	const lastMessage = timeline[timeline.length - 1]?.message ?? '';
	const stepMeta = currentIndex >= 0 ? TRACKER_STEPS[currentIndex] : null;
	const statusLabel =
		mode === 'failed'
			? 'Failed · Delivery interrupted'
			: mode === 'cancelled'
			? 'Cancelled · Request cancelled'
			: mode === 'bookNotFound'
			? 'At Shelf · Book not found'
			: `${stepMeta?.label ?? 'Tracking'} · ${stepMeta?.detail ?? ''}`;

	let alertText: string | null = null;
	let alertClass: 'warning' | 'danger' | null = null;
	if (mode === 'bookNotFound') {
		alertText = 'Book not found at shelf — robot returning to dock';
		alertClass = 'warning';
	} else if (mode === 'failed') {
		alertText = 'Delivery failed — robot requires operator attention';
		alertClass = 'danger';
	} else if (mode === 'cancelled') {
		alertText = 'Delivery cancelled — tracking session ended';
		alertClass = 'danger';
	}

	let completedSegments = 0;
	let activeSegmentIndex: number | null = null;
	let failedSegmentIndex: number | null = null;

	if (mode === 'normal') {
		completedSegments = Math.max(0, currentIndex - 1);
		if (currentIndex > 0) activeSegmentIndex = currentIndex - 1;
	} else if (mode === 'bookNotFound') {
		completedSegments = 4;
	} else if (mode === 'failed' || mode === 'cancelled') {
		completedSegments = Math.max(0, currentIndex - 1);
		if (currentIndex > 0) failedSegmentIndex = currentIndex - 1;
	}

	return {
		mode,
		currentIndex,
		statusLabel,
		message: lastMessage,
		alertText,
		alertClass,
		steps,
		completedSegments,
		activeSegmentIndex,
		failedSegmentIndex,
	};
}

// ─── Target stop point resolution ────────────────────────────────────────────

function findTargetStop(callNumber: string | null | undefined) {
	if (!callNumber) return null;
	const norm = callNumber.toUpperCase().trim().replace(/\s+/g, '_');
	const exact = STOP_POINTS.find((sp) => sp.id === norm);
	if (exact) return exact;
	if (norm.startsWith('LIB')) return STOP_POINTS.find((sp) => sp.id.startsWith('LIB')) ?? null;
	if (norm.startsWith('COM')) return STOP_POINTS.find((sp) => sp.id.startsWith('COM')) ?? null;
	return null;
}

function callNumberToShelfLabel(callNumber: string | null | undefined): string {
	if (!callNumber) return '—';
	const norm = callNumber.toUpperCase();
	if (norm.startsWith('LIB')) return 'Library Books Section';
	if (norm.startsWith('COM')) return 'Commercial Books Section';
	return callNumber;
}

// ─── Robot status display helpers ─────────────────────────────────────────────

const ROBOT_STATUS_META: Record<string, { label: string; cls: string }> = {
	[RobotStatus.OFFLINE]:       { label: 'Offline',      cls: 'rt-status-badge--offline' },
	[RobotStatus.IDLE]:          { label: 'Idle',         cls: 'rt-status-badge--idle' },
	[RobotStatus.ASSIGNED]:      { label: 'Assigned',     cls: 'rt-status-badge--active' },
	[RobotStatus.NAVIGATING]:    { label: 'Navigating',   cls: 'rt-status-badge--active' },
	[RobotStatus.VERIFYING_BOOK]:{ label: 'Verifying',    cls: 'rt-status-badge--active' },
	[RobotStatus.PICKING_UP]:    { label: 'Picking up',   cls: 'rt-status-badge--active' },
	[RobotStatus.DELIVERING]:    { label: 'Delivering',   cls: 'rt-status-badge--active' },
	[RobotStatus.RETURNING]:     { label: 'Returning',    cls: 'rt-status-badge--active' },
	[RobotStatus.DOCKING]:       { label: 'Docking',      cls: 'rt-status-badge--active' },
	[RobotStatus.ERROR]:         { label: 'Error',        cls: 'rt-status-badge--error' },
	[RobotStatus.MAINTENANCE]:   { label: 'Maintenance',  cls: 'rt-status-badge--offline' },
};

function batteryClass(pct: number | null): string {
	if (pct == null) return '';
	if (pct > 60) return 'rt-battery-fill--good';
	if (pct > 30) return 'rt-battery-fill--warn';
	return 'rt-battery-fill--low';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FloorMapProps {
	poseX: number;
	poseY: number;
	poseTheta: number;
	targetStop: typeof STOP_POINTS[0] | null;
}

const FloorMap = ({ poseX, poseY, poseTheta, targetStop }: FloorMapProps) => {
	const svgX = rx(poseX);
	const svgY = ry(poseY);
	const rotDeg = -(poseTheta * 180) / Math.PI;

	return (
		<svg
			viewBox={`0 0 ${SVG_W} ${SVG_H}`}
			className="robot-svg"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Library floor map — Level 1"
		>
			<rect x={0} y={0} width={680} height={340} fill="#faf8f4" />

			{/* Layer 1: Room fills */}
			<rect x={0} y={0} width={228} height={102} className="rt-zone rt-zone--library" />
			<rect x={252} y={0} width={224} height={102} className="rt-zone rt-zone--commercial" />
			<rect x={0} y={102} width={680} height={102} className="rt-zone rt-zone--aisle" />
			<rect x={0} y={204} width={120} height={136} className="rt-zone rt-zone--reception" />
			<rect x={144} y={204} width={80} height={136} className="rt-zone rt-zone--dock" />
			<rect x={476} y={0} width={204} height={122} className="rt-zone rt-zone--desk" />
			<rect x={476} y={183} width={204} height={157} className="rt-zone rt-zone--desk" />

			{/* Layer 2: Architectural walls */}
			<rect x={0} y={0} width={680} height={340} fill="none" stroke="#2a3a5c" strokeWidth={8} rx={0} />
			<line x1={228} y1={0} x2={228} y2={102} className="rt-wall rt-wall--main" />
			<line x1={252} y1={0} x2={252} y2={102} className="rt-wall rt-wall--main" />
			<line x1={0} y1={102} x2={476} y2={102} className="rt-wall rt-wall--main" />
			<line x1={0} y1={204} x2={476} y2={204} className="rt-wall rt-wall--main" />
			<line x1={120} y1={204} x2={120} y2={340} className="rt-wall rt-wall--main" />
			<line x1={144} y1={204} x2={144} y2={340} className="rt-wall rt-wall--side" />
			<line x1={224} y1={204} x2={224} y2={340} className="rt-wall rt-wall--side" />
			<line x1={476} y1={0} x2={476} y2={340} className="rt-wall rt-wall--main" />
			<line x1={476} y1={122} x2={680} y2={122} className="rt-wall rt-wall--main" />
			<line x1={476} y1={183} x2={680} y2={183} className="rt-wall rt-wall--main" />

			{/* Layer 3: Furniture silhouettes */}
			<rect x={82} y={86} width={46} height={14} rx={1} className="rt-furniture" />
			<rect x={74} y={84} width={8} height={10} rx={1} className="rt-furniture" />
			<rect x={128} y={84} width={8} height={10} rx={1} className="rt-furniture" />

			<rect x={344} y={86} width={20} height={14} rx={1} className="rt-furniture" />

			<rect x={20} y={296} width={48} height={12} rx={1} className="rt-furniture" />
			<rect x={20} y={308} width={12} height={18} rx={1} className="rt-furniture" />
			<rect x={36} y={298} width={12} height={8} className="rt-furniture" />
			<line x1={42} y1={306} x2={42} y2={310} className="rt-furniture-line" />
			<rect x={38} y={310} width={8} height={2} className="rt-furniture" />

			<rect x={164} y={292} width={36} height={30} rx={2} className="rt-dock-platform" />
			<line x1={172} y1={298} x2={172} y2={318} className="rt-dock-contact" />
			<line x1={182} y1={298} x2={182} y2={318} className="rt-dock-contact" />
			<line x1={192} y1={298} x2={192} y2={318} className="rt-dock-contact" />

			<rect x={510} y={20} width={140} height={70} rx={2} className="rt-furniture" />
			<rect x={518} y={12} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={548} y={12} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={578} y={12} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={518} y={88} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={548} y={88} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={578} y={88} width={22} height={10} rx={1} className="rt-furniture" />

			<rect x={510} y={220} width={140} height={70} rx={2} className="rt-furniture" />
			<rect x={518} y={212} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={548} y={212} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={578} y={212} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={518} y={288} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={548} y={288} width={22} height={10} rx={1} className="rt-furniture" />
			<rect x={578} y={288} width={22} height={10} rx={1} className="rt-furniture" />

			{/* Layer 4: Room labels */}
			<text x={114} y={62} className="rt-zone-label" textAnchor="middle">Library Books</text>
			<text x={114} y={78} className="rt-zone-sublabel" textAnchor="middle">Physical Collection</text>
			<text x={364} y={62} className="rt-zone-label" textAnchor="middle">Commercial Books</text>
			<text x={364} y={78} className="rt-zone-sublabel" textAnchor="middle">Purchasable Items</text>
			<text x={238} y={153} className="rt-zone-label" textAnchor="middle">Navigation Aisle</text>
			<text x={238} y={165} className="rt-zone-sublabel" textAnchor="middle">Central Corridor</text>
			<text x={34} y={240} className="rt-zone-label" textAnchor="middle">Reception</text>
			<text x={34} y={258} className="rt-zone-sublabel" textAnchor="middle">Service Desk</text>
			<text x={184} y={236} className="rt-zone-label" textAnchor="middle">Charging Dock</text>
			<text x={184} y={252} className="rt-zone-sublabel" textAnchor="middle">Robot Station</text>
			<text x={580} y={68} className="rt-zone-label" textAnchor="middle">Desk A</text>
			<text x={580} y={80} className="rt-zone-sublabel" textAnchor="middle">6 Students</text>
			<text x={580} y={262} className="rt-zone-label" textAnchor="middle">Desk B</text>
			<text x={580} y={274} className="rt-zone-sublabel" textAnchor="middle">6 Students</text>

			{/* Layer 5: Stop points */}
			{STOP_POINTS.map((sp) => {
				const isTarget = targetStop?.id === sp.id;
				return (
					<g key={sp.id}>
						<rect
							x={sp.svg.x - 12}
							y={sp.svg.y - 12}
							width={24}
							height={24}
							className={`rt-stop-square${isTarget ? ' rt-stop-square--target' : ''}`}
						/>
						<text x={sp.svg.x} y={sp.labelY} className="rt-stop-label" textAnchor="middle">{sp.label}</text>
					</g>
				);
			})}

			<polygon
				points="96,274 104,282 96,290 88,282"
				className="rt-service-diamond"
			/>
			<text x={96} y={304} className="rt-service-label" textAnchor="middle">
				<tspan x={96} dy={0}>Service</tspan>
				<tspan x={96} dy={8}>Point</tspan>
			</text>

			{/* Layer 6: Robot indicator */}
			<g className="robot-arrow" style={{ transform: `translate(${svgX}px, ${svgY}px) rotate(${rotDeg}deg)` }}>
				<polygon points="0,-10 6,6 0,3 -6,6" className="rt-robot-arrow" />
			</g>
		</svg>
	);
};

// ─── Delivery Timeline ─────────────────────────────────────────────────────────

interface DeliveryTimelineProps {
	timeline: TimelineEntry[];
	requestStatus: string | null;
	hasActiveRequest: boolean;
	etaText?: string | null;
}

const DeliveryTimeline = ({ timeline, requestStatus, hasActiveRequest, etaText = null }: DeliveryTimelineProps) => {
	const tracker = useMemo(
		() => deriveTrackerViewModel(timeline, requestStatus, hasActiveRequest),
		[timeline, requestStatus, hasActiveRequest],
	);

	const segmentWidth = 100 / (TRACKER_STEPS.length - 1);
	const completedWidth = `${(tracker.completedSegments / (TRACKER_STEPS.length - 1)) * 100}%`;

	return (
		<div className="delivery-tracker">
			{tracker.alertText && tracker.alertClass && (
				<div className={`tracker-alert ${tracker.alertClass}`}>{tracker.alertText}</div>
			)}

			<div className="tracker-header">
				<div>
					<div className={`tracker-status-label${tracker.mode === 'idle' ? ' is-idle' : ''}`}>{tracker.statusLabel}</div>
					{tracker.message && <div className="tracker-message">{tracker.message}</div>}
				</div>
				{etaText && <div className="tracker-eta">Est. arrival: {etaText}</div>}
			</div>

			<div className="tracker-steps">
				<div className="tracker-connector">
					<div className="connector-completed" style={{ width: completedWidth }} />
					{tracker.activeSegmentIndex != null && (
						<div
							key={`active-segment-${tracker.activeSegmentIndex}`}
							className="connector-active"
							style={{
								left: `${tracker.activeSegmentIndex * segmentWidth}%`,
								width: `${segmentWidth}%`,
							}}
						/>
					)}
					{tracker.failedSegmentIndex != null && (
						<div
							className="connector-failed"
							style={{
								left: `${tracker.failedSegmentIndex * segmentWidth}%`,
								width: `${segmentWidth}%`,
							}}
						/>
					)}
				</div>

				{tracker.steps.map((step) => (
					<div key={step.label} className="tracker-step">
						<div className={`step-dot ${step.dotState}`}>
							{step.dotState === 'completed' && (
								<svg viewBox="0 0 16 16" className="step-icon" aria-hidden="true">
									<path d="M6.4 11.6 3.2 8.4l1.1-1.1 2.1 2.1 5.2-5.2 1.1 1.1-6.3 6.3Z" fill="currentColor" />
								</svg>
							)}
							{step.dotState === 'current' && (
								<svg viewBox="0 0 16 16" className="step-icon step-icon--arrow" aria-hidden="true">
									<polygon points="8,1 12,10 8,8 4,10" fill="currentColor" />
								</svg>
							)}
							{step.dotState === 'failed' && (
								<svg viewBox="0 0 16 16" className="step-icon" aria-hidden="true">
									<path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
								</svg>
							)}
							{step.dotState === 'warning' && (
								<svg viewBox="0 0 16 16" className="step-icon" aria-hidden="true">
									<path d="M8 2.2 14 13H2L8 2.2Z" fill="currentColor" />
									<rect x="7.35" y="5.7" width="1.3" height="4.2" fill="#fff" />
									<rect x="7.35" y="10.8" width="1.3" height="1.3" fill="#fff" />
								</svg>
							)}
						</div>
						<div className={`step-label ${step.dotState}`}>{step.label}</div>
						{step.timestamp && <div className="step-time">{step.timestamp}</div>}
					</div>
				))}
			</div>
		</div>
	);
};

// ─── Tracking Panel (right side) ─────────────────────────────────────────────

interface TrackingPanelProps {
	request: T | null;
	liveRobotStatus: string | null;
	liveBattery: number | null;
	connected: boolean;
	robotOffline: boolean;
}

const TrackingPanel = ({ request, liveRobotStatus, liveBattery, connected, robotOffline }: TrackingPanelProps) => {
	if (!request) {
		return (
			<div className="rt-panel">
				<div className="rt-empty-panel">
					<SmartToyOutlinedIcon className="rt-empty-icon" />
					<Typography className="rt-empty-title">No active delivery</Typography>
					<Typography className="rt-empty-body">
						Request a book from the Books section to track delivery here.
					</Typography>
				</div>
			</div>
		);
	}

	const { bookData, robotData } = request;

	const cover =
		bookData?.bookImages?.[0]
			? `${REACT_APP_API_URL}/${bookData.bookImages[0]}`
			: '/img/profile/defaultUser.svg';

	const robotStatus = liveRobotStatus ?? robotData?.status ?? null;
	const battery = liveBattery ?? robotData?.battery ?? null;
	const isOnline = robotOffline ? false : (robotData?.isOnline ?? false);
	const callNumber: string | null = bookData?.bookCallNumber ?? null;

	const statusMeta = robotStatus
		? (ROBOT_STATUS_META[robotStatus] ?? { label: robotStatus, cls: 'rt-status-badge--idle' })
		: null;

	const canRequest =
		robotStatus === RobotStatus.IDLE &&
		request.status === RequestStatus.QUEUED &&
		!robotOffline;

	const disabledReason = robotOffline
		? 'Robot is currently offline'
		: robotStatus === RobotStatus.NAVIGATING || robotStatus === RobotStatus.DELIVERING
		? 'Robot is on an active delivery'
		: robotStatus === RobotStatus.ERROR
		? 'Robot error — contact staff'
		: request.status === RequestStatus.COMPLETED
		? 'Delivery already completed'
		: 'No pending request to dispatch';

	const handleRequestRobot = async () => {
		await sweetMixinSuccessAlert('Robot dispatch will be available once connected to the live system.');
	};

	return (
		<div className="rt-panel">
			{/* Book cover + info */}
			<div className="rt-panel-book-row">
				<div className="rt-panel-cover">
					<img src={cover} alt={bookData?.bookTitle ?? 'Book'} />
				</div>
				<div className="rt-panel-book-info">
					<Typography className="rt-panel-book-title">{bookData?.bookTitle ?? '—'}</Typography>
					<Typography className="rt-panel-book-author">{bookData?.bookAuthor ?? ''}</Typography>
					{callNumber && (
						<span className="rt-panel-callnumber">{callNumber}</span>
					)}
				</div>
			</div>

			<div className="rt-panel-divider" />

			{/* Shelf location */}
			<div className="rt-panel-section">
				<span className="rt-panel-label">Shelf Location</span>
				<Typography className="rt-panel-shelf-text">{callNumberToShelfLabel(callNumber)}</Typography>
			</div>

			{/* Robot status */}
			{statusMeta && (
				<div className="rt-panel-section">
					<span className="rt-panel-label">Robot Status</span>
					<div className="rt-panel-robot-row">
						<span className={`rt-status-badge ${statusMeta.cls}`}>
							<span className="rt-status-dot" />
							{statusMeta.label}
						</span>
						<span className={`rt-online-dot ${isOnline ? 'rt-online-dot--online' : 'rt-online-dot--offline'}`} title={isOnline ? 'Online' : 'Offline'} />
					</div>
				</div>
			)}

			{/* Battery */}
			{battery != null && (
				<div className="rt-panel-section">
					<span className="rt-panel-label">Battery</span>
					<div className="rt-battery-row">
						<div className="rt-battery-bar">
							<div
								className={`rt-battery-fill ${batteryClass(battery)}`}
								style={{ width: `${Math.max(battery, 2)}%` }}
							/>
						</div>
						<span className="rt-battery-text">{battery}%</span>
					</div>
				</div>
			)}

			{/* Connection status */}
			{!connected && (
				<div className="rt-connection-banner">
					{robotOffline ? 'Robot offline' : 'Connecting to live tracking…'}
				</div>
			)}

			<div className="rt-panel-divider" />

			{/* Request button */}
			<Tooltip title={canRequest ? '' : disabledReason} placement="top" arrow>
				<span style={{ width: '100%' }}>
					<button
						className="rt-request-btn"
						onClick={handleRequestRobot}
						disabled={!canRequest}
					>
						<MyLocationIcon sx={{ fontSize: 15 }} />
						Request Robot
					</button>
				</span>
			</Tooltip>

			<Typography className="rt-panel-footnote">
				Live position updates via WebSocket when a request is active.
			</Typography>
		</div>
	);
};

// ─── Main page component ───────────────────────────────────────────────────────

const RobotTracking: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const [requests, setRequests] = React.useState<T[]>([]);

	useQuery(GET_SESSION_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 20 } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRequests(data?.getSessionRequests?.list ?? []);
		},
	});

	// Find the most recent active request
	const activeRequest = useMemo(
		() => requests.find((r) => !NON_ACTIVE_STATUSES.has(r.status)) ?? null,
		[requests],
	);

	const {
		connected,
		pose,
		robotStatus: liveRobotStatus,
		battery: liveBattery,
		requestStatus: liveRequestStatus,
		timeline: liveTimeline,
		robotOffline,
	} = useRobotSocket(activeRequest?._id ?? null);

	// Robot pose: prefer live socket, fall back to DB snapshot, then charging dock
	const robotPose = useMemo(() => {
		if (pose) return pose;
		const cp = activeRequest?.robotData?.currentPose;
		if (cp) return { x: cp.x, y: cp.y, theta: cp.theta };
		return CHARGING_DOCK_POSE;
	}, [pose, activeRequest]);

	// Timeline: merge DB timeline with live socket updates (deduplicate by status)
	const mergedTimeline = useMemo(() => {
		const base: TimelineEntry[] = (activeRequest?.timeline ?? []).map((t: T) => ({
			status: t.status,
			message: t.message ?? '',
			timestamp: t.timestamp,
		}));
		const combined = [...base, ...liveTimeline];
		// Keep first occurrence of each status
		const seen = new Set<string>();
		return combined.filter((t) => {
			if (seen.has(t.status)) return false;
			seen.add(t.status);
			return true;
		});
	}, [activeRequest, liveTimeline]);

	const effectiveRequestStatus = liveRequestStatus ?? activeRequest?.status ?? null;

	const targetStop = findTargetStop(activeRequest?.bookData?.bookCallNumber);

	if (device === 'mobile') return <div>LIVE TRACKING MOBILE</div>;

	return (
		<div id="robot-tracking-page">
			<div className="panel-header">
				<Typography className="panel-title">Live Tracking</Typography>
				<Typography className="panel-subtitle">TurtleBot 3 — Library Floor Level 1</Typography>
			</div>

			<div className="robot-tracking-panel">
				{/* ── Main: map + timeline ── */}
				<div className="map-container">
					<div className="map-header">
						<span>Library Floor — Level 1</span>
					</div>

					<FloorMap
						poseX={robotPose.x}
						poseY={robotPose.y}
						poseTheta={robotPose.theta}
						targetStop={targetStop}
					/>

					<div className="map-legend">
						<span className="map-legend-item">
							<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,1 12,13 8,9 4,13" /></svg>
							Robot
						</span>
						<span className="map-legend-item">
							<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" /><circle cx="8" cy="8" r="7" className="map-legend-pulse" /></svg>
							Target shelf
						</span>
						<span className="map-legend-item">
							<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" /></svg>
							Stop point
						</span>
						<span className="map-legend-item">
							<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,1 15,8 8,15 1,8" /></svg>
							Service point
						</span>
					</div>

					<DeliveryTimeline
						timeline={mergedTimeline}
						requestStatus={effectiveRequestStatus}
						hasActiveRequest={!!activeRequest}
					/>
				</div>

				{/* ── Right panel ── */}
				<div className="tracking-panel">
					<TrackingPanel
						request={activeRequest}
						liveRobotStatus={liveRobotStatus}
						liveBattery={liveBattery}
						connected={connected}
						robotOffline={robotOffline}
					/>
				</div>
			</div>
		</div>
	);
};

export default RobotTracking;
