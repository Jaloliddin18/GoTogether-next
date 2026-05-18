import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { sweetMixinSuccessAlert } from '../../sweetAlert';

type RobotStatus = 'IDLE' | 'NAVIGATING' | 'ARRIVED';

const ROWS = ['A', 'B', 'C', 'D'];
const COLS = [1, 2, 3, 4];
const SHELF_W = 56;
const SHELF_H = 32;
const GAP_X = 24;
const GAP_Y = 20;
const PAD = 24;
const SVG_W = PAD * 2 + COLS.length * SHELF_W + (COLS.length - 1) * GAP_X;
const SVG_H = PAD * 2 + ROWS.length * SHELF_H + (ROWS.length - 1) * GAP_Y + 32;

// Robot is mid-aisle between A2 and B3 — visually reads as navigating toward target
const MOCK_ROBOT = { colIndex: 1.5, rowIndex: 0.8 };
const MOCK_TARGET = { row: 'B', col: 3, rowIndex: 1, colIndex: 2 };

const ROBOT_STATUS: RobotStatus = 'NAVIGATING';

const STATUS_META: Record<RobotStatus, { label: string; className: string }> = {
	IDLE: { label: 'Idle', className: 'robot-status-idle' },
	NAVIGATING: { label: 'Navigating', className: 'robot-status-navigating' },
	ARRIVED: { label: 'Arrived', className: 'robot-status-arrived' },
};

const FloorMap = () => {
	return (
		<svg
			viewBox={`0 0 ${SVG_W} ${SVG_H}`}
			className="robot-floor-svg"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Library floor map"
		>
			{/* Row labels */}
			{ROWS.map((row, ri) => {
				const y = PAD + 28 + ri * (SHELF_H + GAP_Y);
				return (
					<text
						key={row}
						x={10}
						y={y}
						className="floor-label"
						dominantBaseline="middle"
					>
						{row}
					</text>
				);
			})}

			{/* Col labels */}
			{COLS.map((col, ci) => {
				const x = PAD + 28 + ci * (SHELF_W + GAP_X) + SHELF_W / 2;
				return (
					<text
						key={col}
						x={x}
						y={16}
						className="floor-label"
						textAnchor="middle"
					>
						{col}
					</text>
				);
			})}

			{/* Shelf rectangles */}
			{ROWS.map((row, ri) =>
				COLS.map((col, ci) => {
					const x = PAD + 28 + ci * (SHELF_W + GAP_X);
					const y = PAD + 28 + ri * (SHELF_H + GAP_Y) - SHELF_H / 2;
					const isTarget = row === MOCK_TARGET.row && col === MOCK_TARGET.col;
					return (
						<rect
							key={`${row}${col}`}
							x={x}
							y={y}
							width={SHELF_W}
							height={SHELF_H}
							rx={4}
							className={isTarget ? 'floor-shelf floor-shelf--target' : 'floor-shelf'}
						/>
					);
				}),
			)}

			{/* Shelf labels */}
			{ROWS.map((row, ri) =>
				COLS.map((col, ci) => {
					const x = PAD + 28 + ci * (SHELF_W + GAP_X) + SHELF_W / 2;
					const y = PAD + 28 + ri * (SHELF_H + GAP_Y);
					const isTarget = row === MOCK_TARGET.row && col === MOCK_TARGET.col;
					return (
						<text
							key={`label-${row}${col}`}
							x={x}
							y={y}
							className={isTarget ? 'shelf-label shelf-label--target' : 'shelf-label'}
							textAnchor="middle"
							dominantBaseline="middle"
						>
							{row}{col}
						</text>
					);
				}),
			)}

			{/* Robot dot */}
			{(() => {
				const cx = PAD + 28 + MOCK_ROBOT.colIndex * (SHELF_W + GAP_X) + SHELF_W / 2;
				const cy = PAD + 28 + MOCK_ROBOT.rowIndex * (SHELF_H + GAP_Y);
				return (
					<g>
						<circle cx={cx} cy={cy} r={10} className="robot-pulse-ring" />
						<circle cx={cx} cy={cy} r={6} className="robot-dot" />
					</g>
				);
			})()}
		</svg>
	);
};

const RobotTracking: NextPage = () => {
	const device = useDeviceDetect();
	const [requested, setRequested] = useState(false);
	const { label, className } = STATUS_META[ROBOT_STATUS];

	const requestRobotHandler = async () => {
		await sweetMixinSuccessAlert('Robot dispatch will be available once a borrow request is active.');
		setRequested(true);
	};

	if (device === 'mobile') return <div>LIVE TRACKING MOBILE</div>;

	return (
		<div id="robot-tracking-page">
			<Stack className="panel-header">
				<Typography className="panel-title">Live Tracking</Typography>
				<Typography className="panel-subtitle">TurtleBot 3 delivery system</Typography>
			</Stack>

			<div className="tracking-layout">
				<div className="tracking-map-wrap">
					<Typography className="tracking-map-title">Library Floor — Level 1</Typography>
					<FloorMap />
					<div className="tracking-map-legend">
						<span className="legend-dot legend-robot" />
						<span className="legend-label">Robot</span>
						<span className="legend-dot legend-target" />
						<span className="legend-label">Target shelf</span>
					</div>
				</div>

				<div className="tracking-panel">
					<div className="tracking-panel-section">
						<Typography className="tracking-panel-label">Current Target</Typography>
						<Typography className="tracking-panel-book">Designing Data-Intensive Applications</Typography>
						<Typography className="tracking-panel-author">Martin Kleppmann</Typography>
					</div>

					<div className="tracking-panel-divider" />

					<div className="tracking-panel-section">
						<Typography className="tracking-panel-label">Shelf Location</Typography>
						<Typography className="tracking-panel-value">
							Section {MOCK_TARGET.row}, Shelf {MOCK_TARGET.col}
						</Typography>
					</div>

					<div className="tracking-panel-section">
						<Typography className="tracking-panel-label">Estimated Arrival</Typography>
						<Typography className="tracking-panel-value">~45 seconds</Typography>
					</div>

					<div className="tracking-panel-section">
						<Typography className="tracking-panel-label">Robot Status</Typography>
						<span className={`robot-status-badge ${className}`}>
							<span className="robot-status-dot" />
							{label}
						</span>
					</div>

					<div className="tracking-panel-divider" />

					<button
						className="request-robot-btn"
						onClick={requestRobotHandler}
						disabled={requested}
					>
						<MyLocationIcon sx={{ fontSize: 16 }} />
						{requested ? 'Request Sent' : 'Request Robot'}
					</button>

					<Typography className="tracking-footnote">
						Robot tracking uses live WebSocket when an active request is in progress.
					</Typography>
				</div>
			</div>
		</div>
	);
};

export default RobotTracking;
