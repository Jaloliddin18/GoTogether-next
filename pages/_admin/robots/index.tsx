import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ROBOTS } from '../../../apollo/admin/query';
import { CREATE_ROBOT, UPDATE_ROBOT } from '../../../apollo/admin/mutation';
import { RobotStatus } from '../../../libs/enums/robot.enum';
import { Robot } from '../../../libs/types/robot/robot';
import { CreateRobotInput, RobotsInquiry } from '../../../libs/types/robot/robot.input';
import { UpdateRobotInput } from '../../../libs/types/robot/robot.update';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import AdminTableSkeletonRows from '../../../libs/components/common/AdminTableSkeletonRows';

const PAGE_LIMIT = 10;
const ROBOT_ID_MIN_LENGTH = 2;
const ROBOT_ID_MAX_LENGTH = 40;
const ROBOT_NAME_MIN_LENGTH = 2;
const ROBOT_NAME_MAX_LENGTH = 120;
const MONGO_OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

type StatusFilter = 'ALL' | RobotStatus;
type OnlineFilter = 'ALL' | 'ONLINE' | 'OFFLINE';

interface RobotEditDraft {
	name: string;
	status: RobotStatus;
	battery: string;
	isOnline: boolean;
	currentRequestId: string;
}

const titleize = (raw?: string): string => {
	if (!raw) return '—';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const batteryClass = (battery: number): string => {
	if (battery >= 70) return 'admin-battery-fill--high';
	if (battery >= 35) return 'admin-battery-fill--mid';
	return 'admin-battery-fill--low';
};

const formatDate = (value?: string | Date): string => {
	if (!value) return '-';
	return new Date(value).toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const toBatteryValue = (raw: string): number => {
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return 0;
	return Math.max(0, Math.min(100, Math.floor(parsed)));
};

const AdminRobots: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [onlineFilter, setOnlineFilter] = useState<OnlineFilter>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');
	const [editingId, setEditingId] = useState('');
	const [editDraft, setEditDraft] = useState<RobotEditDraft>({
		name: '',
		status: RobotStatus.IDLE,
		battery: '100',
		isOnline: true,
		currentRequestId: '',
	});

	const [createRobotId, setCreateRobotId] = useState('');
	const [createRobotName, setCreateRobotName] = useState('');
	const [createRobotStatus, setCreateRobotStatus] = useState<RobotStatus>(RobotStatus.IDLE);
	const [createRobotBattery, setCreateRobotBattery] = useState('100');
	const [createRobotOnline, setCreateRobotOnline] = useState(true);

	const inquiryInput = useMemo<RobotsInquiry>(() => {
		const search: RobotsInquiry['search'] = {};
		if (statusFilter !== 'ALL') search.status = statusFilter;
		if (onlineFilter === 'ONLINE') search.isOnline = true;
		if (onlineFilter === 'OFFLINE') search.isOnline = false;
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: 'DESC',
			search,
		};
	}, [page, statusFilter, onlineFilter]);

	const { loading, data, refetch } = useQuery(GET_ROBOTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [createRobot, { loading: createRobotLoading }] = useMutation(CREATE_ROBOT);
	const [updateRobot, { loading: updateRobotLoading }] = useMutation(UPDATE_ROBOT);
	const robotActionLoading = createRobotLoading || updateRobotLoading;

	useEffect(() => {
		setPage(1);
	}, [statusFilter, onlineFilter]);

	const rawList: Robot[] = data?.getRobots?.list ?? [];
	const total: number = data?.getRobots?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const list = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) return rawList;
		return rawList.filter((robot) => {
			return [robot.robotId, robot.name, robot.currentRequestId]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		});
	}, [rawList, searchText]);

	const createRobotHandler = async () => {
		try {
			const robotId = createRobotId.trim();
			const name = createRobotName.trim();
			if (!robotId) {
				await sweetMixinErrorAlert('Robot ID is required.');
				return;
			}
			if (robotId.length < ROBOT_ID_MIN_LENGTH || robotId.length > ROBOT_ID_MAX_LENGTH) {
				await sweetMixinErrorAlert(
					`Robot ID must be ${ROBOT_ID_MIN_LENGTH}-${ROBOT_ID_MAX_LENGTH} characters.`,
				);
				return;
			}
			if (!name) {
				await sweetMixinErrorAlert('Robot name is required.');
				return;
			}
			if (name.length < ROBOT_NAME_MIN_LENGTH || name.length > ROBOT_NAME_MAX_LENGTH) {
				await sweetMixinErrorAlert(
					`Robot name must be ${ROBOT_NAME_MIN_LENGTH}-${ROBOT_NAME_MAX_LENGTH} characters.`,
				);
				return;
			}

			const input: CreateRobotInput = {
				robotId,
				name,
				status: createRobotStatus,
				battery: toBatteryValue(createRobotBattery),
				isOnline: createRobotOnline,
			};
			await createRobot({ variables: { input } });
			setCreateRobotId('');
			setCreateRobotName('');
			setCreateRobotStatus(RobotStatus.IDLE);
			setCreateRobotBattery('100');
			setCreateRobotOnline(true);
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Robot created');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const startEditHandler = (robot: Robot) => {
		setEditingId(robot._id);
		setEditDraft({
			name: robot.name ?? '',
			status: robot.status ?? RobotStatus.IDLE,
			battery: String(robot.battery ?? 0),
			isOnline: Boolean(robot.isOnline),
			currentRequestId: robot.currentRequestId ?? '',
		});
	};

	const saveEditHandler = async () => {
		try {
			if (!editingId) return;
			const trimmedName = editDraft.name.trim();
			if (trimmedName && (trimmedName.length < ROBOT_NAME_MIN_LENGTH || trimmedName.length > ROBOT_NAME_MAX_LENGTH)) {
				await sweetMixinErrorAlert(
					`Robot name must be ${ROBOT_NAME_MIN_LENGTH}-${ROBOT_NAME_MAX_LENGTH} characters.`,
				);
				return;
			}

			const trimmedCurrentRequestId = editDraft.currentRequestId.trim();
			if (trimmedCurrentRequestId && !MONGO_OBJECT_ID_REGEX.test(trimmedCurrentRequestId)) {
				await sweetMixinErrorAlert('Current Request ID must be a valid 24-character hex ObjectId.');
				return;
			}

			const input: UpdateRobotInput = {
				_id: editingId,
				name: trimmedName || undefined,
				status: editDraft.status,
				battery: toBatteryValue(editDraft.battery),
				isOnline: editDraft.isOnline,
				currentRequestId: trimmedCurrentRequestId || '',
			};
			await updateRobot({ variables: { input } });
			setEditingId('');
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Robot updated');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Robots</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-form-section" style={{ marginBottom: 20 }}>
				<div className="admin-form-section-title">Create Robot</div>
				<div className="admin-field-grid" style={{ marginBottom: 12 }}>
					<input
						className="admin-input"
						placeholder="Robot ID (e.g. RBT-01)"
						value={createRobotId}
						onChange={(e) => setCreateRobotId(e.target.value)}
					/>
					<input
						className="admin-input"
						placeholder="Robot name"
						value={createRobotName}
						onChange={(e) => setCreateRobotName(e.target.value)}
					/>
				</div>
				<div className="admin-field-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
					<select
						className="admin-select"
						value={createRobotStatus}
						onChange={(e) => setCreateRobotStatus(e.target.value as RobotStatus)}
					>
						{Object.values(RobotStatus).map((status) => (
							<option key={status} value={status}>
								{titleize(status)}
							</option>
						))}
					</select>
					<input
						className="admin-input"
						type="number"
						min={0}
						max={100}
						placeholder="Battery (0-100)"
						value={createRobotBattery}
						onChange={(e) => setCreateRobotBattery(e.target.value)}
					/>
					<select
						className="admin-select"
						value={createRobotOnline ? 'ONLINE' : 'OFFLINE'}
						onChange={(e) => setCreateRobotOnline(e.target.value === 'ONLINE')}
					>
						<option value="ONLINE">Online</option>
						<option value="OFFLINE">Offline</option>
					</select>
					<button type="button" className="admin-btn admin-btn--primary" disabled={robotActionLoading} onClick={createRobotHandler}>
						{createRobotLoading ? 'Creating…' : 'Create'}
					</button>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by robot ID, name, or request ID"
					value={searchDraft}
					onChange={(e) => setSearchDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setSearchText(searchDraft);
							setPage(1);
						}
					}}
				/>
				<select
					className="admin-select"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
				>
					<option value="ALL">All statuses</option>
					{Object.values(RobotStatus).map((status) => (
						<option key={status} value={status}>
							{titleize(status)}
						</option>
					))}
				</select>
				<select className="admin-select" value={onlineFilter} onChange={(e) => setOnlineFilter(e.target.value as OnlineFilter)}>
					<option value="ALL">All online states</option>
					<option value="ONLINE">Online</option>
					<option value="OFFLINE">Offline</option>
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 140 }}>Robot ID</th>
							<th style={{ width: 200 }}>Name</th>
							<th style={{ width: 180 }}>Status</th>
							<th style={{ width: 110 }}>Online</th>
							<th style={{ width: 140 }}>Battery</th>
							<th>Current Request</th>
							<th style={{ width: 180 }}>Last Seen</th>
							<th style={{ width: 180, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading && <AdminTableSkeletonRows columnCount={8} />}
						{!loading && list.length === 0 && (
							<tr>
								<td colSpan={8}>
									<div style={{ padding: '32px 0', textAlign: 'center' }}>
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--muted" />
											No robots found
										</span>
									</div>
								</td>
							</tr>
						)}
						{!loading && list.map((robot) => {
							const isEditing = editingId === robot._id;
							const battery = isEditing ? toBatteryValue(editDraft.battery) : robot.battery ?? 0;
							return (
								<tr key={robot._id}>
									<td className="admin-cell-title admin-mono">{robot.robotId}</td>
									<td>
										{isEditing ? (
											<input
												className="admin-input"
												value={editDraft.name}
												onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
											/>
										) : (
											<div className="admin-cell-title">{robot.name}</div>
										)}
									</td>
									<td>
										{isEditing ? (
											<select
												className="admin-select"
												value={editDraft.status}
												onChange={(e) =>
													setEditDraft((prev) => ({ ...prev, status: e.target.value as RobotStatus }))
												}
											>
												{Object.values(RobotStatus).map((status) => (
													<option key={status} value={status}>
														{titleize(status)}
													</option>
												))}
											</select>
										) : (
											<span className="admin-status">
												<span className="admin-status-dot admin-status-dot--primary" />
												{titleize(robot.status)}
											</span>
										)}
									</td>
									<td>
										{isEditing ? (
											<select
												className="admin-select"
												value={editDraft.isOnline ? 'ONLINE' : 'OFFLINE'}
												onChange={(e) =>
													setEditDraft((prev) => ({ ...prev, isOnline: e.target.value === 'ONLINE' }))
												}
											>
												<option value="ONLINE">Online</option>
												<option value="OFFLINE">Offline</option>
											</select>
										) : (
											<span className={`badge ${robot.isOnline ? 'badge-active' : 'badge-block'}`}>
												{robot.isOnline ? 'ONLINE' : 'OFFLINE'}
											</span>
										)}
									</td>
									<td>
										{isEditing ? (
											<input
												className="admin-input"
												type="number"
												min={0}
												max={100}
												value={editDraft.battery}
												onChange={(e) => setEditDraft((prev) => ({ ...prev, battery: e.target.value }))}
											/>
										) : (
											<span className="admin-battery">
												<span className="admin-battery-track">
													<span className={`admin-battery-fill ${batteryClass(battery)}`} style={{ width: `${battery}%` }} />
												</span>
												<span className="admin-battery-text">{battery}%</span>
											</span>
										)}
									</td>
									<td>
										{isEditing ? (
											<input
												className="admin-input"
												value={editDraft.currentRequestId}
												placeholder="Request ID (optional)"
												onChange={(e) =>
													setEditDraft((prev) => ({ ...prev, currentRequestId: e.target.value }))
												}
											/>
										) : (
											<div className="admin-cell-title admin-mono">{robot.currentRequestId ?? '-'}</div>
										)}
									</td>
									<td className="admin-cell-meta">{formatDate(robot.lastSeenAt)}</td>
									<td>
										<div className="admin-cell-actions">
											{isEditing ? (
												<>
													<button type="button" className="admin-link-btn" disabled={robotActionLoading} onClick={saveEditHandler}>
														Save
													</button>
													<button
														type="button"
														className="admin-link-btn is-muted"
														disabled={robotActionLoading}
														onClick={() => setEditingId('')}
													>
														Cancel
													</button>
												</>
											) : (
												<button
													type="button"
													className="admin-link-btn"
													disabled={robotActionLoading}
													onClick={() => startEditHandler(robot)}
												>
													Edit
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{pageCount > 1 && (
				<div className="admin-pagination">
					<Pagination
						count={pageCount}
						page={page}
						onChange={(_event, nextPage) => setPage(nextPage)}
						shape="rounded"
						color="standard"
					/>
				</div>
			)}
		</div>
	);
};

export default withAdminLayout(AdminRobots);
