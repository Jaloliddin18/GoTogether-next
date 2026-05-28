import React, { useMemo, useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { Tooltip, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_SESSION_REQUESTS } from '../../../apollo/user/query';
import { useRobotSocket, TimelineEntry } from '../../hooks/useRobotSocket';
import { DeliveryDestinationType, RequestStatus, RequestType } from '../../enums/request.enum';
import { RobotStatus } from '../../enums/robot.enum';
import { API_BASE_URL } from '../../config';
import { sweetMixinSuccessAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE = 3.4;
const SVG_W = 680;
const SVG_H = 340;
const ROBOT_FLOOR_X_RANGE: [number, number] = [0, 200];
const ROBOT_FLOOR_Y_RANGE: [number, number] = [0, 100];
const MIN_HEADING_MOVEMENT_PX = 1.2;
const ROBOT_ICON_HEADING_OFFSET_DEG = 90;
const LIVE_POSE_STALE_MS = 3000;
const DEFAULT_ROUTE_SPEED_PX_PER_SEC = 28;
const MIN_ROUTE_SPEED_PX_PER_SEC = 8;
const MAX_ROUTE_SPEED_PX_PER_SEC = 72;
const ROUTE_SPEED_OVERRIDE_FLOOR_UNITS_PER_SEC = Number.parseFloat(
	process.env.NEXT_PUBLIC_TRACKING_SPEED_FLOOR_UNITS_PER_SEC ?? '',
);
type Point = { x: number; y: number };
type ShelfKey = keyof typeof SHELF_KEY_TO_NODE;
type InventoryShelfLike = {
	section?: string | null;
	row?: string | number | null;
	slot?: string | null;
};
type InventoryDataLike = {
	bookShelf?: InventoryShelfLike | null;
	bookLocation?: {
		floorId?: string | null;
		x?: number | null;
		y?: number | null;
		theta?: number | null;
	} | null;
} | null;

function rx(v: number) { return v * SCALE; }
function ry(v: number) { return (100 - v) * SCALE; }
function convertRobotPoseToSvgPoint(pose: { x: number; y: number }): Point {
	// Backend pose is expected in floor units where x:[0..200], y:[0..100].
	const x = Math.min(Math.max(pose.x, ROBOT_FLOOR_X_RANGE[0]), ROBOT_FLOOR_X_RANGE[1]);
	const y = Math.min(Math.max(pose.y, ROBOT_FLOOR_Y_RANGE[0]), ROBOT_FLOOR_Y_RANGE[1]);
	return { x: rx(x), y: ry(y) };
}
export function convertSvgPointToRobotPose(point: Point): Point {
	return { x: point.x / SCALE, y: 100 - point.y / SCALE };
}

const CHARGING_DOCK_POSE = {
	...convertSvgPointToRobotPose({ x: 182, y: 307 }),
	theta: 0,
};

type RouteSimulationMode = 'none' | 'delivery' | 'return';
type SimulationDirective = {
	targetDistance: number;
	speedPxPerSec: number;
};

const TERMINAL_STATUSES = new Set([
	RequestStatus.COMPLETED,
	RequestStatus.FAILED,
	RequestStatus.CANCELLED,
	RequestStatus.BOOK_NOT_FOUND,
]);

const NON_ACTIVE_STATUSES = new Set([
	...Array.from(TERMINAL_STATUSES),
	RequestStatus.QUEUED,
]);
const TERMINAL_REQUEST_STATUSES = new Set([
	RequestStatus.COMPLETED,
	RequestStatus.FAILED,
	RequestStatus.CANCELLED,
]);
const RETURN_ROUTE_REQUEST_STATUSES = new Set([
	RequestStatus.CANCELLED,
	RequestStatus.FAILED,
	RequestStatus.BOOK_NOT_FOUND,
]);

function resolveEffectiveRequestStatus(
	liveStatus: string | null,
	requestStatus: string | null | undefined,
): string | null {
	const baseStatus = requestStatus ?? null;
	if (liveStatus && TERMINAL_STATUSES.has(liveStatus as RequestStatus)) return liveStatus;
	if (baseStatus && TERMINAL_STATUSES.has(baseStatus as RequestStatus)) return baseStatus;
	return liveStatus ?? baseStatus ?? null;
}

// ─── Graph path planning (real map coordinates) ───────────────────────────────

const MAP_NODES: Record<string, Point> = {
	CHARGING_DOCK: convertSvgPointToRobotPose({ x: 182, y: 307 }),
	CHARGING_DOCK_EXIT: { x: 53.5, y: 40 },
	AISLE_LEFT: { x: 34, y: 55 },
	AISLE_MIDDLE: { x: 84, y: 55 },
	AISLE_RIGHT: { x: 140, y: 55 },

	LIB_1_APPROACH: { x: 16.5, y: 55 },
	LIB_2_APPROACH: { x: 34, y: 55 },
	LIB_3_APPROACH: { x: 52, y: 55 },
	COM_4_APPROACH: { x: 86, y: 55 },
	COM_5_APPROACH: { x: 103.5, y: 55 },
	COM_6_APPROACH: { x: 121, y: 55 },

	LIB_1_SHELF: convertSvgPointToRobotPose({ x: 56, y: 24 }),
	LIB_2_SHELF: convertSvgPointToRobotPose({ x: 116, y: 24 }),
	LIB_3_SHELF: convertSvgPointToRobotPose({ x: 176, y: 24 }),
	COM_4_SHELF: convertSvgPointToRobotPose({ x: 292, y: 24 }),
	COM_5_SHELF: convertSvgPointToRobotPose({ x: 352, y: 24 }),
	COM_6_SHELF: convertSvgPointToRobotPose({ x: 412, y: 24 }),

	DESK_A_CORRIDOR_TURN: { x: 150, y: 55 },
	DESK_B_CORRIDOR_TURN: { x: 150, y: 55 },
	DESK_A_ENDPOINT: convertSvgPointToRobotPose({ x: 496, y: 68 }),
	DESK_B_ENDPOINT: convertSvgPointToRobotPose({ x: 496, y: 262 }),
	RECEPTION_CORRIDOR_TURN: { x: 28, y: 40 },
	RECEPTION_ENDPOINT: convertSvgPointToRobotPose({ x: 96, y: 282 }),
};

// Demo pose anchors for simulator calibration (robot floor coordinates).
export const DEMO_POSE_ANCHORS: Record<string, Point> = {
	CHARGING_DOCK: MAP_NODES.CHARGING_DOCK,
	LIB_1_SHELF: MAP_NODES.LIB_1_SHELF,
	LIB_2_SHELF: MAP_NODES.LIB_2_SHELF,
	LIB_3_SHELF: MAP_NODES.LIB_3_SHELF,
	COM_4_SHELF: MAP_NODES.COM_4_SHELF,
	COM_5_SHELF: MAP_NODES.COM_5_SHELF,
	COM_6_SHELF: MAP_NODES.COM_6_SHELF,
	DESK_A_ENDPOINT: MAP_NODES.DESK_A_ENDPOINT,
	DESK_B_ENDPOINT: MAP_NODES.DESK_B_ENDPOINT,
	RECEPTION_ENDPOINT: MAP_NODES.RECEPTION_ENDPOINT,
};

const MAP_EDGES: Record<string, string[]> = {
	CHARGING_DOCK: ['CHARGING_DOCK_EXIT'],
	CHARGING_DOCK_EXIT: ['CHARGING_DOCK', 'AISLE_LEFT'],
	AISLE_LEFT: ['CHARGING_DOCK_EXIT', 'AISLE_MIDDLE', 'LIB_1_APPROACH', 'LIB_2_APPROACH', 'LIB_3_APPROACH', 'RECEPTION_CORRIDOR_TURN'],
	AISLE_MIDDLE: ['AISLE_LEFT', 'AISLE_RIGHT', 'COM_4_APPROACH', 'COM_5_APPROACH', 'COM_6_APPROACH'],
	AISLE_RIGHT: ['AISLE_MIDDLE', 'DESK_A_CORRIDOR_TURN', 'DESK_B_CORRIDOR_TURN'],

	LIB_1_APPROACH: ['AISLE_LEFT', 'LIB_1_SHELF'],
	LIB_2_APPROACH: ['AISLE_LEFT', 'LIB_2_SHELF'],
	LIB_3_APPROACH: ['AISLE_LEFT', 'LIB_3_SHELF'],
	COM_4_APPROACH: ['AISLE_MIDDLE', 'COM_4_SHELF'],
	COM_5_APPROACH: ['AISLE_MIDDLE', 'COM_5_SHELF'],
	COM_6_APPROACH: ['AISLE_MIDDLE', 'COM_6_SHELF'],

	LIB_1_SHELF: ['LIB_1_APPROACH'],
	LIB_2_SHELF: ['LIB_2_APPROACH'],
	LIB_3_SHELF: ['LIB_3_APPROACH'],
	COM_4_SHELF: ['COM_4_APPROACH'],
	COM_5_SHELF: ['COM_5_APPROACH'],
	COM_6_SHELF: ['COM_6_APPROACH'],

	DESK_A_CORRIDOR_TURN: ['AISLE_RIGHT', 'DESK_A_ENDPOINT'],
	DESK_B_CORRIDOR_TURN: ['AISLE_RIGHT', 'DESK_B_ENDPOINT'],
	DESK_A_ENDPOINT: ['DESK_A_CORRIDOR_TURN'],
	DESK_B_ENDPOINT: ['DESK_B_CORRIDOR_TURN'],
	RECEPTION_CORRIDOR_TURN: ['AISLE_LEFT', 'RECEPTION_ENDPOINT'],
	RECEPTION_ENDPOINT: ['RECEPTION_CORRIDOR_TURN'],
};

const SHELF_KEY_TO_NODE: Record<string, string> = {
	LIB_1: 'LIB_1_SHELF',
	LIB_2: 'LIB_2_SHELF',
	LIB_3: 'LIB_3_SHELF',
	COM_4: 'COM_4_SHELF',
	COM_5: 'COM_5_SHELF',
	COM_6: 'COM_6_SHELF',
};

const SHELF_STOPS = [
	{ key: 'LIB_1', nodeId: 'LIB_1_SHELF', label: 'LIB 1' },
	{ key: 'LIB_2', nodeId: 'LIB_2_SHELF', label: 'LIB 2' },
	{ key: 'LIB_3', nodeId: 'LIB_3_SHELF', label: 'LIB 3' },
	{ key: 'COM_4', nodeId: 'COM_4_SHELF', label: 'COM 4' },
	{ key: 'COM_5', nodeId: 'COM_5_SHELF', label: 'COM 5' },
	{ key: 'COM_6', nodeId: 'COM_6_SHELF', label: 'COM 6' },
] as const;

const STOP_POINTS = SHELF_STOPS.map((stop) => ({
	id: stop.key,
	label: stop.label,
	svg: convertRobotPoseToSvgPoint(MAP_NODES[stop.nodeId]),
	labelY: convertRobotPoseToSvgPoint(MAP_NODES[stop.nodeId]).y + 5,
}));

function euclidean(a: Point, b: Point): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function getShortestPath(startNodeId: string, targetNodeId: string): Point[] {
	if (!MAP_NODES[startNodeId] || !MAP_NODES[targetNodeId]) return [];
	if (startNodeId === targetNodeId) return [MAP_NODES[startNodeId]];

	const nodeIds = Object.keys(MAP_NODES);
	const dist: Record<string, number> = {};
	const prev: Record<string, string | null> = {};
	const unvisited = new Set<string>(nodeIds);

	nodeIds.forEach((id) => {
		dist[id] = Infinity;
		prev[id] = null;
	});
	dist[startNodeId] = 0;

	while (unvisited.size > 0) {
		let current: string | null = null;
		let best = Infinity;
		unvisited.forEach((id) => {
			if (dist[id] < best) {
				best = dist[id];
				current = id;
			}
		});

		if (!current || best === Infinity) break;
		unvisited.delete(current);
		if (current === targetNodeId) break;

		const neighbors = MAP_EDGES[current] ?? [];
		for (const next of neighbors) {
			if (!unvisited.has(next) || !MAP_NODES[next]) continue;
			const alt = dist[current] + euclidean(MAP_NODES[current], MAP_NODES[next]);
			if (alt < dist[next]) {
				dist[next] = alt;
				prev[next] = current;
			}
		}
	}

	if (dist[targetNodeId] === Infinity) return [];

	const routeNodeIds: string[] = [];
	let cursor: string | null = targetNodeId;
	while (cursor) {
		routeNodeIds.unshift(cursor);
		cursor = prev[cursor];
	}

	if (routeNodeIds[0] !== startNodeId) return [];
	return routeNodeIds.map((id) => MAP_NODES[id]);
}

function findNearestMapNodeId(point: Point): string {
	let nearestNodeId = 'CHARGING_DOCK';
	let minDistance = Infinity;
	for (const [nodeId, nodePoint] of Object.entries(MAP_NODES)) {
		const distance = euclidean(point, nodePoint);
		if (distance < minDistance) {
			minDistance = distance;
			nearestNodeId = nodeId;
		}
	}
	return nearestNodeId;
}

function normalizeToken(input: string | null | undefined): string {
	if (!input) return '';
	return input.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
}

function resolveShelfKeyFromCallNumber(
	callNumber: string | null | undefined,
	requestType: string | null | undefined,
): ShelfKey {
	const token = normalizeToken(callNumber);
	const exactShelfMap: Record<string, ShelfKey> = {
		LIB1: 'LIB_1',
		LIB2: 'LIB_2',
		LIB3: 'LIB_3',
		COM4: 'COM_4',
		COM5: 'COM_5',
		COM6: 'COM_6',
		CSA001: 'LIB_1',
		CSA002: 'LIB_2',
		CSA003: 'LIB_3',
		COM004: 'COM_4',
		COM005: 'COM_5',
		COM006: 'COM_6',
	};
	if (exactShelfMap[token]) return exactShelfMap[token];

	if (token.startsWith('LIB1')) return 'LIB_1';
	if (token.startsWith('LIB2')) return 'LIB_2';
	if (token.startsWith('LIB3')) return 'LIB_3';
	if (token.startsWith('COM4')) return 'COM_4';
	if (token.startsWith('COM5')) return 'COM_5';
	if (token.startsWith('COM6')) return 'COM_6';

	return requestType === RequestType.PURCHASE ? 'COM_4' : 'LIB_1';
}

function parseRowNumber(row: string | number | null | undefined): number | null {
	if (row == null) return null;
	if (typeof row === 'number' && Number.isFinite(row)) return Math.trunc(row);
	const token = normalizeToken(String(row));
	if (!token) return null;
	const parsed = Number.parseInt(token, 10);
	return Number.isNaN(parsed) ? null : parsed;
}

function resolveShelfKeyFromInventory(
	inventoryData: InventoryDataLike,
): ShelfKey | null {
	const shelf = inventoryData?.bookShelf;
	if (!shelf) return null;

	const sectionToken = normalizeToken(shelf.section ?? '');
	const rowNumber = parseRowNumber(shelf.row);
	const slotToken = normalizeToken(shelf.slot ?? '');
	const slotShelfMap: Record<string, ShelfKey> = {
		LIB1: 'LIB_1',
		LIB2: 'LIB_2',
		LIB3: 'LIB_3',
		COM4: 'COM_4',
		COM5: 'COM_5',
		COM6: 'COM_6',
	};

	if (slotShelfMap[slotToken]) return slotShelfMap[slotToken];
	if (slotToken.startsWith('LIB1')) return 'LIB_1';
	if (slotToken.startsWith('LIB2')) return 'LIB_2';
	if (slotToken.startsWith('LIB3')) return 'LIB_3';
	if (slotToken.startsWith('COM4')) return 'COM_4';
	if (slotToken.startsWith('COM5')) return 'COM_5';
	if (slotToken.startsWith('COM6')) return 'COM_6';

	if (sectionToken === 'LIB' && rowNumber != null) {
		if (rowNumber === 1) return 'LIB_1';
		if (rowNumber === 2) return 'LIB_2';
		if (rowNumber === 3) return 'LIB_3';
	}

	if (sectionToken === 'COM' && rowNumber != null) {
		if (rowNumber === 4) return 'COM_4';
		if (rowNumber === 5) return 'COM_5';
		if (rowNumber === 6) return 'COM_6';
	}

	return null;
}

function resolveTargetShelfKey(
	inventoryData: InventoryDataLike,
	callNumber: string | null | undefined,
	requestType: string | null | undefined,
): ShelfKey {
	const shelfFromInventory = resolveShelfKeyFromInventory(inventoryData);
	if (shelfFromInventory) return shelfFromInventory;
	return resolveShelfKeyFromCallNumber(callNumber, requestType);
}

function resolveDestinationNodeId(
	destinationType: string | null | undefined,
	requestType: string | null | undefined,
	destinationDeskId: string | null | undefined,
): string {
	if (destinationType === DeliveryDestinationType.RECEPTION || requestType === RequestType.PURCHASE) {
		return 'RECEPTION_ENDPOINT';
	}
	if (destinationType === DeliveryDestinationType.STUDENT_DESK) {
		const deskToken = normalizeToken(destinationDeskId);
		if (deskToken.includes('DESKB') || deskToken.startsWith('B')) return 'DESK_B_ENDPOINT';
		if (deskToken.includes('DESKA') || deskToken.startsWith('A')) return 'DESK_A_ENDPOINT';
		return 'DESK_A_ENDPOINT';
	}
	return requestType === RequestType.PURCHASE ? 'RECEPTION_ENDPOINT' : 'DESK_A_ENDPOINT';
}

function toSvgPoints(points: Point[]): Array<{ x: number; y: number }> {
	return points.map((point) => convertRobotPoseToSvgPoint(point));
}

function dedupeConsecutive(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
	return points.filter((point, index, list) =>
		index === 0 || point.x !== list[index - 1].x || point.y !== list[index - 1].y,
	);
}

function mergeTimelineEntries(
	baseTimeline: TimelineEntry[],
	socketTimeline: TimelineEntry[],
): TimelineEntry[] {
	const combined = [...baseTimeline, ...socketTimeline];
	const seen = new Set<string>();
	return combined.filter((entry) => {
		if (!entry?.status || seen.has(entry.status)) return false;
		seen.add(entry.status);
		return true;
	});
}

function timelinesEqual(a: TimelineEntry[], b: TimelineEntry[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (
			a[i].status !== b[i].status ||
			a[i].message !== b[i].message ||
			a[i].timestamp !== b[i].timestamp
		) {
			return false;
		}
	}
	return true;
}

function buildPlannedWaypoints(
	inventoryData: InventoryDataLike,
	callNumber: string | null | undefined,
	requestType: string | null | undefined,
	destinationType: string | null | undefined,
	destinationDeskId: string | null | undefined,
): Array<{ x: number; y: number }> {
	const shelfKey = resolveTargetShelfKey(inventoryData, callNumber, requestType);
	const shelfNodeId = SHELF_KEY_TO_NODE[shelfKey];
	const destinationNodeId = resolveDestinationNodeId(destinationType, requestType, destinationDeskId);

	const toShelf = getShortestPath('CHARGING_DOCK', shelfNodeId);
	const toDestination = getShortestPath(shelfNodeId, destinationNodeId);

	const merged = [
		...toShelf,
		...toDestination.slice(1),
	];

	if (merged.length < 2) {
		return dedupeConsecutive(
			toSvgPoints([MAP_NODES.CHARGING_DOCK, MAP_NODES[shelfNodeId], MAP_NODES[destinationNodeId]]),
		);
	}

	return dedupeConsecutive(toSvgPoints(merged));
}

function buildReturnWaypointsFromPose(startPose: Point): Array<{ x: number; y: number }> {
	const safeStartPose =
		Number.isFinite(startPose.x) && Number.isFinite(startPose.y)
			? startPose
			: MAP_NODES.CHARGING_DOCK;
	const startNodeId = findNearestMapNodeId(safeStartPose);
	const routeToDock = getShortestPath(startNodeId, 'CHARGING_DOCK');
	const routePoints = routeToDock.length > 0 ? routeToDock : [MAP_NODES.CHARGING_DOCK];
	return dedupeConsecutive([
		convertRobotPoseToSvgPoint(safeStartPose),
		...toSvgPoints(routePoints),
	]);
}

function findNearestWaypointIndex(
	waypoints: Array<{ x: number; y: number }>,
	svgX: number,
	svgY: number,
): number {
	let nearest = 0;
	let minDist = Infinity;
	for (let i = 0; i < waypoints.length; i++) {
		const d = Math.hypot(waypoints[i].x - svgX, waypoints[i].y - svgY);
		if (d < minDist) { minDist = d; nearest = i; }
	}
	return nearest;
}

function projectPointToSegment(
	point: Point,
	start: Point,
	end: Point,
): Point {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) return { x: start.x, y: start.y };
	const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lenSq;
	const clamped = Math.max(0, Math.min(1, t));
	return {
		x: start.x + clamped * dx,
		y: start.y + clamped * dy,
	};
}

function findClosestPointOnPolyline(
	polyline: Array<{ x: number; y: number }>,
	point: Point,
): { point: Point; segmentEndIndex: number } {
	if (polyline.length === 0) {
		return { point, segmentEndIndex: 0 };
	}
	if (polyline.length === 1) {
		return { point: { ...polyline[0] }, segmentEndIndex: 1 };
	}

	let bestPoint = { ...polyline[0] };
	let bestDist = Infinity;
	let bestSegmentEndIndex = 1;

	for (let i = 0; i < polyline.length - 1; i++) {
		const projected = projectPointToSegment(point, polyline[i], polyline[i + 1]);
		const dist = Math.hypot(projected.x - point.x, projected.y - point.y);
		if (dist < bestDist) {
			bestDist = dist;
			bestPoint = projected;
			bestSegmentEndIndex = i + 1;
		}
	}

	return { point: bestPoint, segmentEndIndex: bestSegmentEndIndex };
}

function radiansToDegrees(radians: number): number {
	return (radians * 180) / Math.PI;
}

function getRobotHeadingDeg(
	currentPoint: Point,
	previousPoint: Point | null,
	fallbackTheta: number,
): number {
	if (previousPoint) {
		const dx = currentPoint.x - previousPoint.x;
		const dy = currentPoint.y - previousPoint.y;
		const travelPx = Math.hypot(dx, dy);
		if (travelPx >= MIN_HEADING_MOVEMENT_PX) {
			return radiansToDegrees(Math.atan2(dy, dx));
		}
	}
	// Robot theta is in floor coordinates (y up); SVG has y down, so heading flips sign.
	return -radiansToDegrees(fallbackTheta ?? 0);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function buildPolylineMetrics(polyline: Array<{ x: number; y: number }>): { totalDistance: number; cumulative: number[] } {
	const cumulative = [0];
	for (let i = 0; i < polyline.length - 1; i++) {
		const segmentLength = Math.hypot(
			polyline[i + 1].x - polyline[i].x,
			polyline[i + 1].y - polyline[i].y,
		);
		cumulative.push(cumulative[i] + segmentLength);
	}
	return { totalDistance: cumulative[cumulative.length - 1] ?? 0, cumulative };
}

function getDistanceAtWaypointIndex(cumulative: number[], waypointIndex: number): number {
	if (cumulative.length === 0) return 0;
	return cumulative[clamp(waypointIndex, 0, cumulative.length - 1)] ?? 0;
}

function pointAtDistanceOnPolyline(
	polyline: Array<{ x: number; y: number }>,
	distance: number,
): Point {
	if (polyline.length === 0) return { x: 0, y: 0 };
	if (polyline.length === 1) return { ...polyline[0] };

	let remaining = Math.max(distance, 0);
	for (let i = 0; i < polyline.length - 1; i++) {
		const start = polyline[i];
		const end = polyline[i + 1];
		const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
		if (segmentLength === 0) continue;
		if (remaining <= segmentLength) {
			const t = remaining / segmentLength;
			return {
				x: start.x + (end.x - start.x) * t,
				y: start.y + (end.y - start.y) * t,
			};
		}
		remaining -= segmentLength;
	}

	return { ...polyline[polyline.length - 1] };
}

function findClosestDistanceAlongPolyline(
	polyline: Array<{ x: number; y: number }>,
	point: Point,
): number {
	if (polyline.length < 2) return 0;

	let bestDistToPoint = Infinity;
	let bestDistanceAlong = 0;
	let distanceBeforeSegment = 0;

	for (let i = 0; i < polyline.length - 1; i++) {
		const start = polyline[i];
		const end = polyline[i + 1];
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const segmentLengthSq = dx * dx + dy * dy;
		const segmentLength = Math.hypot(dx, dy);
		if (segmentLengthSq === 0) continue;

		const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / segmentLengthSq, 0, 1);
		const projected = {
			x: start.x + dx * t,
			y: start.y + dy * t,
		};
		const distToPoint = Math.hypot(projected.x - point.x, projected.y - point.y);
		if (distToPoint < bestDistToPoint) {
			bestDistToPoint = distToPoint;
			bestDistanceAlong = distanceBeforeSegment + segmentLength * t;
		}
		distanceBeforeSegment += segmentLength;
	}

	return bestDistanceAlong;
}

function getHeadingDegAlongPolyline(
	polyline: Array<{ x: number; y: number }>,
	distanceAlong: number,
	totalDistance: number,
	lookaheadPx = 8,
): number | null {
	if (polyline.length < 2 || totalDistance <= 0) return null;

	const currentDistance = clamp(distanceAlong, 0, totalDistance);
	const forwardDistance = clamp(currentDistance + lookaheadPx, 0, totalDistance);
	const backwardDistance = clamp(currentDistance - lookaheadPx, 0, totalDistance);

	const currentPoint = pointAtDistanceOnPolyline(polyline, currentDistance);
	const forwardPoint = pointAtDistanceOnPolyline(polyline, forwardDistance);
	let dx = forwardPoint.x - currentPoint.x;
	let dy = forwardPoint.y - currentPoint.y;

	if (Math.hypot(dx, dy) < 0.01) {
		const backPoint = pointAtDistanceOnPolyline(polyline, backwardDistance);
		dx = currentPoint.x - backPoint.x;
		dy = currentPoint.y - backPoint.y;
	}

	if (Math.hypot(dx, dy) < 0.01) return null;
	return radiansToDegrees(Math.atan2(dy, dx));
}

function resolveSimulationDirective(
	mode: RouteSimulationMode,
	status: string | null,
	shelfDistance: number,
	destinationDistance: number,
	totalDistance: number,
	liveRobotStatus: string | null,
	routeSpeedPxPerSec: number,
): SimulationDirective | null {
	if (mode === 'none' || totalDistance <= 0) return null;
	const speed = clamp(routeSpeedPxPerSec, MIN_ROUTE_SPEED_PX_PER_SEC, MAX_ROUTE_SPEED_PX_PER_SEC);

	if (mode === 'return') {
		const speedPxPerSec = clamp(
			liveRobotStatus === RobotStatus.DOCKING
				? speed * 0.64
				: liveRobotStatus === RobotStatus.IDLE
				? speed * 0.36
				: speed,
			MIN_ROUTE_SPEED_PX_PER_SEC,
			MAX_ROUTE_SPEED_PX_PER_SEC,
		);
		return {
			targetDistance: totalDistance,
			speedPxPerSec,
		};
	}

	switch (status as RequestStatus | null) {
		case RequestStatus.QUEUED:
			return { targetDistance: 0, speedPxPerSec: speed * 0.5 };
		case RequestStatus.ASSIGNED:
			return { targetDistance: 0, speedPxPerSec: speed * 0.45 };
		case RequestStatus.DISPATCHED:
			return { targetDistance: Math.min(shelfDistance * 0.16, totalDistance), speedPxPerSec: speed * 0.78 };
		case RequestStatus.NAVIGATING_TO_SHELF:
			return { targetDistance: shelfDistance, speedPxPerSec: speed };
		case RequestStatus.ARRIVED_AT_SHELF:
			return { targetDistance: shelfDistance, speedPxPerSec: speed * 0.48 };
		case RequestStatus.VERIFYING_BOOK:
			return { targetDistance: shelfDistance, speedPxPerSec: speed * 0.34 };
		case RequestStatus.BOOK_FOUND:
			return { targetDistance: shelfDistance, speedPxPerSec: speed * 0.42 };
		case RequestStatus.PICKING_UP:
			return { targetDistance: shelfDistance, speedPxPerSec: speed * 0.45 };
		case RequestStatus.DELIVERING:
			return { targetDistance: destinationDistance, speedPxPerSec: speed };
		case RequestStatus.ARRIVED_AT_STUDENT:
			return { targetDistance: destinationDistance, speedPxPerSec: speed * 0.5 };
		case RequestStatus.READY:
			return { targetDistance: destinationDistance, speedPxPerSec: speed * 0.38 };
		case RequestStatus.COMPLETED:
			return { targetDistance: destinationDistance, speedPxPerSec: speed * 0.38 };
		default:
			return { targetDistance: destinationDistance, speedPxPerSec: speed * 0.8 };
	}
}

function timelineTimestampMs(value: unknown): number | null {
	if (value == null) return null;
	const normalized =
		typeof value === 'string'
			? value
			: value instanceof Date
			? value.toISOString()
			: String(value);
	const ts = Date.parse(normalized);
	return Number.isFinite(ts) ? ts : null;
}

function getLatestTimelineStatusTimestampMs(
	timeline: TimelineEntry[],
	status: string | null,
): number | null {
	if (!status) return null;
	for (let i = timeline.length - 1; i >= 0; i--) {
		const entry = timeline[i];
		if (entry.status === status) {
			return timelineTimestampMs(entry.timestamp);
		}
	}
	return null;
}

function getDeliveryDistanceRangeForStatus(
	status: string | null,
	shelfDistance: number,
	destinationDistance: number,
): { start: number; end: number } {
	switch (status as RequestStatus | null) {
		case RequestStatus.QUEUED:
			return { start: 0, end: 0 };
		case RequestStatus.ASSIGNED:
			return { start: 0, end: 0 };
		case RequestStatus.DISPATCHED:
			return { start: 0, end: shelfDistance * 0.16 };
		case RequestStatus.NAVIGATING_TO_SHELF:
			return { start: 0, end: shelfDistance };
		case RequestStatus.ARRIVED_AT_SHELF:
		case RequestStatus.VERIFYING_BOOK:
		case RequestStatus.BOOK_FOUND:
		case RequestStatus.PICKING_UP:
			return { start: shelfDistance, end: shelfDistance };
		case RequestStatus.DELIVERING:
			return {
				start: shelfDistance,
				end: destinationDistance,
			};
		case RequestStatus.ARRIVED_AT_STUDENT:
		case RequestStatus.READY:
		case RequestStatus.COMPLETED:
			return { start: destinationDistance, end: destinationDistance };
		default:
			return { start: 0, end: destinationDistance };
	}
}

function resolveSeedDistanceFromStatusTimeline(
	mode: RouteSimulationMode,
	status: string | null,
	timeline: TimelineEntry[],
	shelfDistance: number,
	destinationDistance: number,
	totalDistance: number,
	routeSpeedPxPerSec: number,
): number | null {
	if (totalDistance <= 0) return 0;
	if (mode === 'return') return 0;
	if (mode !== 'delivery') return null;

	const range = getDeliveryDistanceRangeForStatus(
		status,
		shelfDistance,
		destinationDistance,
	);
	const start = clamp(range.start, 0, totalDistance);
	const end = clamp(Math.max(range.end, range.start), 0, totalDistance);
	if (Math.abs(end - start) < 0.25) return end;

	const enteredAtMs = getLatestTimelineStatusTimestampMs(timeline, status);
	if (!enteredAtMs) return start;

	const elapsedSec = Math.max((Date.now() - enteredAtMs) / 1000, 0);
	return clamp(
		start + elapsedSec * clamp(routeSpeedPxPerSec, MIN_ROUTE_SPEED_PX_PER_SEC, MAX_ROUTE_SPEED_PX_PER_SEC),
		start,
		end,
	);
}

function resolveRouteSpeedPxPerSec(linearSpeed: number | null): number {
	if (
		Number.isFinite(ROUTE_SPEED_OVERRIDE_FLOOR_UNITS_PER_SEC) &&
		ROUTE_SPEED_OVERRIDE_FLOOR_UNITS_PER_SEC > 0
	) {
		return clamp(
			ROUTE_SPEED_OVERRIDE_FLOOR_UNITS_PER_SEC * SCALE,
			MIN_ROUTE_SPEED_PX_PER_SEC,
			MAX_ROUTE_SPEED_PX_PER_SEC,
		);
	}
	if (linearSpeed == null || !Number.isFinite(linearSpeed) || linearSpeed < 0) {
		return DEFAULT_ROUTE_SPEED_PX_PER_SEC;
	}
	const raw = linearSpeed * SCALE;
	return clamp(raw, MIN_ROUTE_SPEED_PX_PER_SEC, MAX_ROUTE_SPEED_PX_PER_SEC);
}

// ─── Delivery tracker model ───────────────────────────────────────────────────

const TRACKER_STEPS = [
	{ label: 'Queued', statuses: [RequestStatus.QUEUED], detail: 'Request received' },
	{ label: 'Assigned', statuses: [RequestStatus.ASSIGNED], detail: 'Robot assigned' },
	{ label: 'Dispatched', statuses: [RequestStatus.DISPATCHED], detail: 'Robot dispatched' },
	{ label: 'Navigating', statuses: [RequestStatus.NAVIGATING_TO_SHELF], detail: 'Navigating to shelf' },
	{ label: 'At Shelf', statuses: [RequestStatus.ARRIVED_AT_SHELF, RequestStatus.VERIFYING_BOOK, RequestStatus.BOOK_FOUND], detail: 'Verifying book' },
	{ label: 'Picking Up', statuses: [RequestStatus.PICKING_UP, RequestStatus.DELIVERING], detail: 'Delivering to destination' },
	{ label: 'Ready', statuses: [RequestStatus.ARRIVED_AT_STUDENT, RequestStatus.READY], detail: 'Ready for pickup' },
	{ label: 'Completed', statuses: [RequestStatus.COMPLETED], detail: 'Delivery completed' },
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

function getRequestTimeValue(request: T): number {
	const updated = request?.updatedAt ? Date.parse(request.updatedAt) : NaN;
	if (Number.isFinite(updated)) return updated;
	const created = request?.createdAt ? Date.parse(request.createdAt) : NaN;
	return Number.isFinite(created) ? created : 0;
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
	if (requestStatus) {
		const statusStepIndex = TRACKER_STEPS.findIndex((step) =>
			step.statuses.some((status) => status === (requestStatus as RequestStatus)),
		);
		if (statusStepIndex >= 0) {
			currentIndex = Math.max(currentIndex, statusStepIndex);
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
		alertText = 'Delivery failed — robot rerouting to charging dock';
		alertClass = 'danger';
	} else if (mode === 'cancelled') {
		alertText = 'Delivery cancelled — robot rerouting to charging dock';
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

// ─── Target stop point resolution (for visual shelf highlighting) ─────────────

function findTargetStop(
	inventoryData: InventoryDataLike,
	callNumber: string | null | undefined,
	requestType: string | null | undefined,
) {
	const shelfKey = resolveTargetShelfKey(inventoryData, callNumber, requestType);
	return STOP_POINTS.find((sp) => sp.id === shelfKey) ?? null;
}

function resolveShelfLabel(
	inventoryData: InventoryDataLike,
	callNumber: string | null | undefined,
	requestType: string | null | undefined,
): string {
	if (!inventoryData?.bookShelf && !callNumber) return '—';
	const shelfKey = resolveTargetShelfKey(inventoryData, callNumber, requestType);
	const stop = STOP_POINTS.find((sp) => sp.id === shelfKey);
	return stop ? `${stop.label} Shelf` : '—';
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
	robotRotationDeg: number;
	targetStop: typeof STOP_POINTS[0] | null;
	plannedWaypoints: Array<{ x: number; y: number }>;
	liveTrailPoints: Array<{ x: number; y: number }>;
	completedWaypointIndex: number;
	showRoute: boolean;
}

const FloorMap = ({
	poseX,
	poseY,
	robotRotationDeg,
	targetStop,
	plannedWaypoints,
	liveTrailPoints,
	completedWaypointIndex,
	showRoute,
}: FloorMapProps) => {
	const { x: svgX, y: svgY } = convertRobotPoseToSvgPoint({ x: poseX, y: poseY });

	const toPoints = (pts: Array<{ x: number; y: number }>) =>
		pts.map((p) => `${p.x},${p.y}`).join(' ');

	const shouldRenderRoute = showRoute && plannedWaypoints.length > 1;
	const routeStartPt = plannedWaypoints[0] ?? null;
	const routeEndPt = plannedWaypoints[plannedWaypoints.length - 1] ?? null;
	const routeMidPts = plannedWaypoints.slice(1, -1);
	const completedPts = plannedWaypoints.slice(0, completedWaypointIndex + 1);

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

			{/* Layer 3: Route overlays — rendered before furniture and labels so text stays on top */}
			{shouldRenderRoute && (
				<g>
					<polyline points={toPoints(plannedWaypoints)} className="robot-planned-path" />
					{liveTrailPoints.length > 1 && (
						<polyline points={toPoints(liveTrailPoints)} className="robot-live-trail" />
					)}
					{completedPts.length > 1 && (
						<polyline points={toPoints(completedPts)} className="robot-completed-path" />
					)}
					{routeMidPts.map((p, i) => (
						<circle key={i} cx={p.x} cy={p.y} r={3} className="robot-waypoint-dot" />
					))}
					{routeStartPt && (
						<circle cx={routeStartPt.x} cy={routeStartPt.y} r={5} className="robot-start-dot" />
					)}
					{routeEndPt && (
						<>
							<circle cx={routeEndPt.x} cy={routeEndPt.y} r={5} className="robot-end-dot" />
							<circle cx={routeEndPt.x} cy={routeEndPt.y} r={5} className="robot-end-pulse" />
						</>
					)}
				</g>
			)}

			{/* Layer 4: Furniture silhouettes */}
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

			{/* Layer 5: Room labels */}
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

			{/* Layer 6: Stop points */}
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
				<tspan x={96} dy={0}>Reception</tspan>
				<tspan x={96} dy={8}>Point</tspan>
			</text>

			{/* Layer 7: Robot indicator — SVG attribute transform uses viewBox units (not px), so it scales correctly with viewBox */}
			<g
				className="robot-arrow"
				transform={`translate(${svgX}, ${svgY}) rotate(${robotRotationDeg}, 0, 0)`}
			>
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
	requestStatus: string | null;
	liveRobotStatus: string | null;
	liveBattery: number | null;
	connected: boolean;
	robotOffline: boolean;
}

const TrackingPanel = ({
	request,
	requestStatus,
	liveRobotStatus,
	liveBattery,
	connected,
	robotOffline,
}: TrackingPanelProps) => {
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
	const inventoryData: InventoryDataLike = request.sourceInventoryData ?? request.inventoryData ?? null;

	const cover =
		bookData?.bookImages?.[0]
			? `${API_BASE_URL}/${bookData.bookImages[0]}`
			: '/img/profile/defaultUser.svg';

	const robotStatus = liveRobotStatus ?? robotData?.status ?? null;
	const battery = liveBattery ?? robotData?.battery ?? null;
	const isOnline = robotOffline ? false : (robotData?.isOnline ?? false);
	const callNumber: string | null = bookData?.bookCallNumber ?? null;
	const effectiveRequestStatus = requestStatus ?? request.status ?? null;
	const inventoryLocationDebug = (inventoryData?.bookLocation?.x != null && inventoryData?.bookLocation?.y != null)
		? `Inventory location (floor): x=${inventoryData.bookLocation.x}, y=${inventoryData.bookLocation.y}`
		: undefined;

	const statusMeta = robotStatus
		? (ROBOT_STATUS_META[robotStatus] ?? { label: robotStatus, cls: 'rt-status-badge--idle' })
		: null;

	const canRequest =
		robotStatus === RobotStatus.IDLE &&
		effectiveRequestStatus === RequestStatus.QUEUED &&
		!robotOffline;

	const disabledReason = robotOffline
		? 'Robot is currently offline'
		: robotStatus === RobotStatus.NAVIGATING || robotStatus === RobotStatus.DELIVERING
		? 'Robot is on an active delivery'
		: robotStatus === RobotStatus.ERROR
		? 'Robot error — contact staff'
		: effectiveRequestStatus === RequestStatus.COMPLETED
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
				<Typography className="rt-panel-shelf-text" title={inventoryLocationDebug}>
					{resolveShelfLabel(inventoryData, callNumber, request.requestType ?? null)}
				</Typography>
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

	const [requests, setRequests] = useState<T[]>([]);
	const [robotRotationDeg, setRobotRotationDeg] = useState<number>(
		ROBOT_ICON_HEADING_OFFSET_DEG,
	);
	const previousRobotSvgPointRef = useRef<Point | null>(null);
	const stableRotationDegRef = useRef<number>(ROBOT_ICON_HEADING_OFFSET_DEG);
	const terminalRefetchKeyRef = useRef<string>('');
	const returnRouteSeedKeyRef = useRef<string>('');
	const returnRouteSeedPoseRef = useRef<Point | null>(null);
	const lastSimulatedPositionRef = useRef<Point | null>(null);
	const routeSimulationSeedKeyRef = useRef<string>('');
	const livePoseStaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const simFrameRef = useRef<number | null>(null);
	const simLastFrameAtRef = useRef<number | null>(null);
	const simTargetDistanceRef = useRef<number>(0);
	const simSpeedPxPerSecRef = useRef<number>(0);
	const [hasFreshLivePose, setHasFreshLivePose] = useState(false);
	const [simulatedDistance, setSimulatedDistance] = useState(0);

	const { data: sessionRequestsData, refetch: refetchSessionRequests } = useQuery(GET_SESSION_REQUESTS, {
		fetchPolicy: 'network-only',
		pollInterval: 2500,
		variables: { input: { page: 1, limit: 20 } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		setRequests(sessionRequestsData?.getSessionRequests?.list ?? []);
	}, [sessionRequestsData]);

	// Track the latest request first; do not fall back to older READY requests.
	const latestRequest = useMemo(() => {
		if (requests.length === 0) return null;
		return [...requests].sort((a, b) => getRequestTimeValue(b) - getRequestTimeValue(a))[0] ?? null;
	}, [requests]);

	const activeRequest = useMemo(() => {
		if (!latestRequest) return null;
		return NON_ACTIVE_STATUSES.has(latestRequest.status as RequestStatus) ? null : latestRequest;
	}, [latestRequest]);

	const trackingRequestId = latestRequest?._id ?? null;

	const {
		connected,
		pose: socketPose,
		robotStatus: liveRobotStatus,
		battery: liveBattery,
		linearSpeed: liveLinearSpeed,
		requestStatus: liveRequestStatus,
		timeline: liveTimeline,
		robotOffline,
	} = useRobotSocket(trackingRequestId);

	const effectiveRequestStatus = resolveEffectiveRequestStatus(
		liveRequestStatus,
		activeRequest?.status,
	);
	const hasActiveDisplayRequest =
		!!activeRequest && !(effectiveRequestStatus && NON_ACTIVE_STATUSES.has(effectiveRequestStatus as RequestStatus));
	const latestRequestStatus = resolveEffectiveRequestStatus(
		liveRequestStatus,
		latestRequest?.status,
	);
	const effectiveLatestRobotStatus =
		liveRobotStatus ?? latestRequest?.robotData?.status ?? null;
	const shouldShowReturnRoute =
		!!latestRequest &&
		!hasActiveDisplayRequest &&
		!!latestRequestStatus &&
		RETURN_ROUTE_REQUEST_STATUSES.has(latestRequestStatus as RequestStatus);

	useEffect(() => {
		setHasFreshLivePose(false);
		if (livePoseStaleTimerRef.current) clearTimeout(livePoseStaleTimerRef.current);
		returnRouteSeedKeyRef.current = '';
		returnRouteSeedPoseRef.current = null;
		lastSimulatedPositionRef.current = null;
		routeSimulationSeedKeyRef.current = '';
	}, [trackingRequestId]);

	useEffect(() => {
		if (!socketPose) return;
		setHasFreshLivePose(true);
		if (livePoseStaleTimerRef.current) clearTimeout(livePoseStaleTimerRef.current);
		livePoseStaleTimerRef.current = setTimeout(() => {
			setHasFreshLivePose(false);
		}, LIVE_POSE_STALE_MS);
	}, [socketPose?.x, socketPose?.y, socketPose?.theta]);

	useEffect(() => () => {
		if (livePoseStaleTimerRef.current) clearTimeout(livePoseStaleTimerRef.current);
	}, []);

	const snapshotPose = activeRequest?.robotData?.currentPose
		? {
			x: activeRequest.robotData.currentPose.x as number,
			y: activeRequest.robotData.currentPose.y as number,
			theta: (activeRequest.robotData.currentPose.theta ?? 0) as number,
		  }
		: latestRequest?.robotData?.currentPose
		? {
			x: latestRequest.robotData.currentPose.x as number,
			y: latestRequest.robotData.currentPose.y as number,
			theta: (latestRequest.robotData.currentPose.theta ?? 0) as number,
		  }
		: CHARGING_DOCK_POSE;

	const isLivePoseUsable = socketPose !== null && hasFreshLivePose;

	// Base pose before fallback simulation is applied.
	const baseRobotPose = socketPose ?? snapshotPose;

	const returnRouteSeedKey =
		shouldShowReturnRoute && latestRequest?._id
			? `${latestRequest._id}:${latestRequestStatus ?? ''}`
			: '';
	const fallbackReturnSeedPose =
		lastSimulatedPositionRef.current ??
		(Number.isFinite(baseRobotPose.x) && Number.isFinite(baseRobotPose.y)
			? { x: baseRobotPose.x, y: baseRobotPose.y }
			: MAP_NODES.CHARGING_DOCK);

	if (!returnRouteSeedKey && returnRouteSeedKeyRef.current) {
		returnRouteSeedKeyRef.current = '';
		returnRouteSeedPoseRef.current = null;
	}

	if (returnRouteSeedKey && returnRouteSeedKeyRef.current !== returnRouteSeedKey) {
		returnRouteSeedKeyRef.current = returnRouteSeedKey;
		returnRouteSeedPoseRef.current = fallbackReturnSeedPose;
	}

	const returnRouteSeedPose = returnRouteSeedPoseRef.current ?? fallbackReturnSeedPose;

	// Timeline: merge DB timeline with live socket updates (deduplicate by status)
	const mergedTimeline = useMemo(() => {
		const base: TimelineEntry[] = (activeRequest?.timeline ?? []).map((t: T) => ({
			status: t.status,
			message: t.message ?? '',
			timestamp: t.timestamp,
		}));
		return mergeTimelineEntries(base, liveTimeline);
	}, [activeRequest, liveTimeline]);

	useEffect(() => {
		if (!activeRequest?._id || !liveRequestStatus) return;
		setRequests((prev) => {
			const index = prev.findIndex((item) => item._id === activeRequest._id);
			if (index < 0) return prev;

			const current = prev[index];
			const currentTimeline: TimelineEntry[] = (current.timeline ?? []).map((t: T) => ({
				status: t.status,
				message: t.message ?? '',
				timestamp: t.timestamp,
			}));
			const currentStatus = current.status as RequestStatus;
			const incomingStatus = liveRequestStatus as RequestStatus;
			const keepTerminalStatus =
				TERMINAL_STATUSES.has(currentStatus) && !TERMINAL_STATUSES.has(incomingStatus);
			const nextStatus = keepTerminalStatus ? current.status : liveRequestStatus;
			const nextTimeline = mergeTimelineEntries(currentTimeline, liveTimeline);
			const statusChanged = current.status !== nextStatus;
			const timelineChanged = !timelinesEqual(currentTimeline, nextTimeline);
			if (!statusChanged && !timelineChanged) return prev;

			const next = [...prev];
			next[index] = {
				...current,
				status: nextStatus,
				timeline: nextTimeline,
			};
			return next;
		});
	}, [activeRequest?._id, liveRequestStatus, liveTimeline]);

	useEffect(() => {
		if (!activeRequest?._id || !liveRequestStatus) return;
		if (!TERMINAL_REQUEST_STATUSES.has(liveRequestStatus as RequestStatus)) return;
		const key = `${activeRequest._id}:${liveRequestStatus}`;
		if (terminalRefetchKeyRef.current === key) return;
		terminalRefetchKeyRef.current = key;
		refetchSessionRequests({ input: { page: 1, limit: 20 } }).catch(() => {});
	}, [activeRequest?._id, liveRequestStatus, refetchSessionRequests]);

	const targetStop = findTargetStop(
		(activeRequest?.sourceInventoryData ?? activeRequest?.inventoryData ?? null) as InventoryDataLike,
		activeRequest?.bookData?.bookCallNumber ?? null,
		activeRequest?.requestType ?? null,
	);

	// Planned aisle-following route waypoints (SVG coordinates) — recalculate when request changes
	const plannedWaypoints = useMemo(() => {
		if (activeRequest) {
			return buildPlannedWaypoints(
				(activeRequest?.sourceInventoryData ?? activeRequest?.inventoryData ?? null) as InventoryDataLike,
				activeRequest.bookData?.bookCallNumber ?? '',
				activeRequest.requestType ?? null,
				activeRequest.destinationType,
				activeRequest.destinationDeskId,
			);
		}
		if (shouldShowReturnRoute && latestRequest) {
			return buildReturnWaypointsFromPose(returnRouteSeedPose);
		}
		return [];
	}, [
		activeRequest?._id,
		activeRequest?.sourceInventoryData,
		activeRequest?.inventoryData,
		activeRequest?.bookData?.bookCallNumber,
		activeRequest?.requestType,
		activeRequest?.destinationType,
		activeRequest?.destinationDeskId,
		latestRequest?._id,
		returnRouteSeedPose.x,
		returnRouteSeedPose.y,
		shouldShowReturnRoute,
	]);

	const shouldRenderRoute = hasActiveDisplayRequest || shouldShowReturnRoute;

	const routeMode = useMemo<RouteSimulationMode>(() => {
		if (hasActiveDisplayRequest && plannedWaypoints.length > 1) return 'delivery';
		if (shouldShowReturnRoute && plannedWaypoints.length > 1) return 'return';
		return 'none';
	}, [hasActiveDisplayRequest, plannedWaypoints.length, shouldShowReturnRoute]);

	const routeMetrics = useMemo(
		() => buildPolylineMetrics(plannedWaypoints),
		[plannedWaypoints],
	);

	const routeAnchors = useMemo(() => {
		const fallbackIndex = Math.max(plannedWaypoints.length - 1, 0);
		if (routeMode !== 'delivery' || !activeRequest || plannedWaypoints.length === 0) {
			return {
				shelfWaypointIndex: 0,
				destinationWaypointIndex: fallbackIndex,
			};
		}

		const inventoryData = (activeRequest?.sourceInventoryData ?? activeRequest?.inventoryData ?? null) as InventoryDataLike;
		const shelfKey = resolveTargetShelfKey(
			inventoryData,
			activeRequest.bookData?.bookCallNumber ?? null,
			activeRequest.requestType ?? null,
		);
		const destinationNodeId = resolveDestinationNodeId(
			activeRequest.destinationType,
			activeRequest.requestType ?? null,
			activeRequest.destinationDeskId,
		);

		const shelfNodeId = SHELF_KEY_TO_NODE[shelfKey];
		const shelfSvg = convertRobotPoseToSvgPoint(MAP_NODES[shelfNodeId]);
		const destinationSvg = convertRobotPoseToSvgPoint(MAP_NODES[destinationNodeId]);

		const shelfWaypointIndex = findNearestWaypointIndex(
			plannedWaypoints,
			shelfSvg.x,
			shelfSvg.y,
		);
		const destinationWaypointIndex = Math.max(
			shelfWaypointIndex,
			findNearestWaypointIndex(plannedWaypoints, destinationSvg.x, destinationSvg.y),
		);

		return {
			shelfWaypointIndex,
			destinationWaypointIndex,
		};
	}, [
		activeRequest,
		plannedWaypoints,
		routeMode,
	]);

	const simulationStatus =
		routeMode === 'delivery' ? effectiveRequestStatus : latestRequestStatus;

	const simulationDirective = useMemo(() => {
		if (routeMode === 'none' || routeMetrics.totalDistance <= 0) return null;
		const routeSpeedPxPerSec = resolveRouteSpeedPxPerSec(liveLinearSpeed);
		const shelfDistance = getDistanceAtWaypointIndex(
			routeMetrics.cumulative,
			routeAnchors.shelfWaypointIndex,
		);
		const destinationDistance = getDistanceAtWaypointIndex(
			routeMetrics.cumulative,
			routeAnchors.destinationWaypointIndex,
		);
		return resolveSimulationDirective(
			routeMode,
			simulationStatus,
			shelfDistance,
			destinationDistance,
			routeMetrics.totalDistance,
			effectiveLatestRobotStatus,
			routeSpeedPxPerSec,
		);
	}, [
		routeMode,
		routeMetrics,
		routeAnchors,
		simulationStatus,
		effectiveLatestRobotStatus,
		liveLinearSpeed,
	]);

	const shouldUseSimulatedPose =
		shouldRenderRoute &&
		plannedWaypoints.length > 1 &&
		!!simulationDirective;

	const routeSimulationSeedKey = useMemo(() => {
		if (!shouldRenderRoute || plannedWaypoints.length < 2) return '';
		const start = plannedWaypoints[0];
		const end = plannedWaypoints[plannedWaypoints.length - 1];
		const routeOwnerId = routeMode === 'delivery'
			? activeRequest?._id ?? 'active'
			: latestRequest?._id ?? 'latest';
		return [
			routeMode,
			routeOwnerId,
			plannedWaypoints.length,
			start?.x.toFixed(2),
			start?.y.toFixed(2),
			end?.x.toFixed(2),
			end?.y.toFixed(2),
		].join(':');
	}, [
		shouldRenderRoute,
		plannedWaypoints,
		routeMode,
		activeRequest?._id,
		latestRequest?._id,
	]);

	useEffect(() => {
		if (plannedWaypoints.length < 2 || !shouldRenderRoute) {
			routeSimulationSeedKeyRef.current = '';
			setSimulatedDistance(0);
			simTargetDistanceRef.current = 0;
			simSpeedPxPerSecRef.current = 0;
			return;
		}
		if (routeSimulationSeedKeyRef.current === routeSimulationSeedKey) return;
		routeSimulationSeedKeyRef.current = routeSimulationSeedKey;

		const routeSpeedPxPerSec = resolveRouteSpeedPxPerSec(liveLinearSpeed);
		const shelfDistance = getDistanceAtWaypointIndex(
			routeMetrics.cumulative,
			routeAnchors.shelfWaypointIndex,
		);
		const destinationDistance = getDistanceAtWaypointIndex(
			routeMetrics.cumulative,
			routeAnchors.destinationWaypointIndex,
		);
		const timelineSeedDistance = resolveSeedDistanceFromStatusTimeline(
			routeMode,
			simulationStatus,
			mergedTimeline,
			shelfDistance,
			destinationDistance,
			routeMetrics.totalDistance,
			routeSpeedPxPerSec,
		);
		const seedDistance = timelineSeedDistance != null
			? timelineSeedDistance
			: clamp(
				findClosestDistanceAlongPolyline(
					plannedWaypoints,
					convertRobotPoseToSvgPoint({
						x: baseRobotPose.x,
						y: baseRobotPose.y,
					}),
				),
				0,
				routeMetrics.totalDistance,
			);
		setSimulatedDistance(seedDistance);
	}, [
		routeSimulationSeedKey,
		shouldRenderRoute,
		plannedWaypoints,
		routeMetrics.totalDistance,
		routeMetrics.cumulative,
		routeAnchors.shelfWaypointIndex,
		routeAnchors.destinationWaypointIndex,
		routeMode,
		simulationStatus,
		mergedTimeline,
		liveLinearSpeed,
		baseRobotPose.x,
		baseRobotPose.y,
	]);

	useEffect(() => {
		if (!simulationDirective || routeMetrics.totalDistance <= 0) {
			simTargetDistanceRef.current = clamp(
				simulatedDistance,
				0,
				routeMetrics.totalDistance,
			);
			simSpeedPxPerSecRef.current = 0;
			return;
		}

		simTargetDistanceRef.current = clamp(
			simulationDirective.targetDistance,
			0,
			routeMetrics.totalDistance,
		);
		simSpeedPxPerSecRef.current = Math.max(
			simulationDirective.speedPxPerSec,
			0,
		);
	}, [
		simulationDirective,
		routeMetrics.totalDistance,
		simulatedDistance,
	]);

	useEffect(() => {
		if (!shouldUseSimulatedPose || routeMetrics.totalDistance <= 0) {
			if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
			simFrameRef.current = null;
			simLastFrameAtRef.current = null;
			return;
		}

		const animate = (now: number) => {
			if (simLastFrameAtRef.current == null) {
				simLastFrameAtRef.current = now;
				simFrameRef.current = requestAnimationFrame(animate);
				return;
			}

			const deltaSec = clamp((now - simLastFrameAtRef.current) / 1000, 0, 0.2);
			simLastFrameAtRef.current = now;

			setSimulatedDistance((prev) => {
				const targetDistance = simTargetDistanceRef.current;
				const speedPxPerSec = simSpeedPxPerSecRef.current;
				const remaining = targetDistance - prev;
				if (Math.abs(remaining) < 0.25) return targetDistance;
				const step = speedPxPerSec * deltaSec;
				if (step <= 0) return prev;
				const direction = Math.sign(remaining);
				const next = prev + direction * step;
				if ((direction > 0 && next > targetDistance) || (direction < 0 && next < targetDistance)) {
					return targetDistance;
				}
				return clamp(next, 0, routeMetrics.totalDistance);
			});

			simFrameRef.current = requestAnimationFrame(animate);
		};

		simFrameRef.current = requestAnimationFrame(animate);
		return () => {
			if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
			simFrameRef.current = null;
			simLastFrameAtRef.current = null;
		};
	}, [
		shouldUseSimulatedPose,
		routeMetrics.totalDistance,
	]);

	useEffect(() => () => {
		if (simFrameRef.current) cancelAnimationFrame(simFrameRef.current);
	}, []);

	const simulatedPose = useMemo(() => {
		if (!shouldUseSimulatedPose || plannedWaypoints.length < 2 || routeMetrics.totalDistance <= 0) {
			return null;
		}
		const svgPoint = pointAtDistanceOnPolyline(plannedWaypoints, simulatedDistance);
		const floorPoint = convertSvgPointToRobotPose(svgPoint);
		return {
			x: floorPoint.x,
			y: floorPoint.y,
			theta: 0,
		};
	}, [
		shouldUseSimulatedPose,
		plannedWaypoints,
		routeMetrics.totalDistance,
		simulatedDistance,
	]);

	const completedDestinationPose = useMemo(() => {
		if (!latestRequest || latestRequestStatus !== RequestStatus.COMPLETED) return null;
		const destinationNodeId = resolveDestinationNodeId(
			latestRequest.destinationType,
			latestRequest.requestType ?? null,
			latestRequest.destinationDeskId,
		);
		const destinationNode = MAP_NODES[destinationNodeId];
		return destinationNode
			? {
				x: destinationNode.x,
				y: destinationNode.y,
				theta: 0,
			}
			: null;
	}, [
		latestRequest?._id,
		latestRequestStatus,
		latestRequest?.destinationType,
		latestRequest?.requestType,
		latestRequest?.destinationDeskId,
	]);

	const robotPose = latestRequestStatus === RequestStatus.QUEUED
		? CHARGING_DOCK_POSE
		: latestRequestStatus === RequestStatus.COMPLETED && completedDestinationPose
			? completedDestinationPose
			: isLivePoseUsable
				? shouldUseSimulatedPose
					? simulatedPose ?? socketPose
					: socketPose
				: shouldUseSimulatedPose
					? simulatedPose ?? baseRobotPose
					: baseRobotPose;

	useEffect(() => {
		if (!trackingRequestId || !hasActiveDisplayRequest) return;
		if (!Number.isFinite(robotPose.x) || !Number.isFinite(robotPose.y)) return;
		// Demo simulation only until real LiDAR/SLAM pose feeds are available.
		lastSimulatedPositionRef.current = { x: robotPose.x, y: robotPose.y };
	}, [
		trackingRequestId,
		hasActiveDisplayRequest,
		robotPose.x,
		robotPose.y,
	]);

	const routeHeadingDeg = useMemo(() => {
		if (!shouldRenderRoute || plannedWaypoints.length < 2 || routeMetrics.totalDistance <= 0) {
			return null;
		}
		const routeDistance = shouldUseSimulatedPose
			? clamp(simulatedDistance, 0, routeMetrics.totalDistance)
			: clamp(
				findClosestDistanceAlongPolyline(
					plannedWaypoints,
					convertRobotPoseToSvgPoint({ x: robotPose.x, y: robotPose.y }),
				),
				0,
				routeMetrics.totalDistance,
			);
		return getHeadingDegAlongPolyline(
			plannedWaypoints,
			routeDistance,
			routeMetrics.totalDistance,
		);
	}, [
		shouldRenderRoute,
		shouldUseSimulatedPose,
		simulatedDistance,
		plannedWaypoints,
		routeMetrics.totalDistance,
		robotPose.x,
		robotPose.y,
	]);

	useEffect(() => {
		previousRobotSvgPointRef.current = null;
		const initialHeading =
			getRobotHeadingDeg(
				convertRobotPoseToSvgPoint({ x: CHARGING_DOCK_POSE.x, y: CHARGING_DOCK_POSE.y }),
				null,
				CHARGING_DOCK_POSE.theta,
			) + ROBOT_ICON_HEADING_OFFSET_DEG;
		stableRotationDegRef.current = initialHeading;
		setRobotRotationDeg(initialHeading);
	}, [trackingRequestId]);

	useEffect(() => {
		const currentSvgPoint = convertRobotPoseToSvgPoint({
			x: robotPose.x,
			y: robotPose.y,
		});
		const previousPoint = previousRobotSvgPointRef.current;
		const nextHeadingDeg = getRobotHeadingDeg(
			currentSvgPoint,
			previousPoint,
			robotPose.theta ?? 0,
		);
		const preferredHeadingDeg = routeHeadingDeg ?? nextHeadingDeg;

		if (routeHeadingDeg != null) {
			stableRotationDegRef.current =
				preferredHeadingDeg + ROBOT_ICON_HEADING_OFFSET_DEG;
		} else if (previousPoint) {
			const travelPx = Math.hypot(
				currentSvgPoint.x - previousPoint.x,
				currentSvgPoint.y - previousPoint.y,
			);
			if (travelPx >= MIN_HEADING_MOVEMENT_PX) {
				stableRotationDegRef.current =
					preferredHeadingDeg + ROBOT_ICON_HEADING_OFFSET_DEG;
			}
		} else {
			stableRotationDegRef.current =
				preferredHeadingDeg + ROBOT_ICON_HEADING_OFFSET_DEG;
		}

		setRobotRotationDeg(stableRotationDegRef.current);
		previousRobotSvgPointRef.current = currentSvgPoint;
	}, [robotPose.x, robotPose.y, robotPose.theta, routeHeadingDeg]);

	const routePose = shouldRenderRoute ? robotPose : null;

	// Trail snaps to the planned polyline so visual path follows corridor graph exactly.
	const liveTrailPoints = useMemo(() => {
		if (!routePose || plannedWaypoints.length < 2) return [];
		const posePoint = convertRobotPoseToSvgPoint({ x: routePose.x, y: routePose.y });
		const snapped = findClosestPointOnPolyline(plannedWaypoints, posePoint);
		const prefix = plannedWaypoints.slice(0, snapped.segmentEndIndex);
		const lastPrefix = prefix[prefix.length - 1];
		if (!lastPrefix) return [snapped.point];
		const distToLast = Math.hypot(snapped.point.x - lastPrefix.x, snapped.point.y - lastPrefix.y);
		if (distToLast < 0.5) return prefix;
		return [...prefix, snapped.point];
	}, [routePose, plannedWaypoints]);

	// Index of the waypoint nearest to the current robot position — updates as robot moves
	const completedWaypointIndex = useMemo(() => {
		if (liveTrailPoints.length === 0 || plannedWaypoints.length === 0) return 0;
		const tip = liveTrailPoints[liveTrailPoints.length - 1];
		return findNearestWaypointIndex(plannedWaypoints, tip.x, tip.y);
	}, [liveTrailPoints, plannedWaypoints]);

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
							robotRotationDeg={robotRotationDeg}
							targetStop={targetStop}
							plannedWaypoints={plannedWaypoints}
							liveTrailPoints={liveTrailPoints}
							completedWaypointIndex={completedWaypointIndex}
							showRoute={shouldRenderRoute}
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
								Reception point
							</span>
						</div>

					<DeliveryTimeline
						timeline={mergedTimeline}
						requestStatus={effectiveRequestStatus}
						hasActiveRequest={hasActiveDisplayRequest}
					/>
				</div>

				{/* ── Right panel ── */}
				<div className="tracking-panel">
					<TrackingPanel
						request={hasActiveDisplayRequest ? activeRequest : null}
						requestStatus={effectiveRequestStatus}
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
