import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_LOST_ITEMS } from '../../../apollo/admin/query';
import { UPDATE_LOST_ITEM_STATUS } from '../../../apollo/admin/mutation';
import { Direction } from '../../../libs/enums/common.enum';
import {
	LostItemObjectType,
	LostItemPriority,
	LostItemStatus,
} from '../../../libs/enums/lost-item.enum';
import { resolveMediaUrl } from '../../../libs/utils';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { LostItemsInquiry } from '../../../libs/types/lost-item/lost-item.input';
import { LostItemRecord } from '../../../libs/types/lost-item/lost-item';
import { UpdateLostItemStatusInput } from '../../../libs/types/lost-item/lost-item.update';

const PAGE_LIMIT = 20;

type StatusFilter = 'ALL' | LostItemStatus;
type ObjectTypeFilter = 'ALL' | LostItemObjectType;
type PriorityFilter = 'ALL' | LostItemPriority;

const titleize = (raw?: string): string => {
	if (!raw) return '—';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | Date): string => {
	if (!value) return '—';
	return new Date(value).toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const formatConfidence = (value?: number): string => {
	if (value == null || !Number.isFinite(value)) return '—';
	const normalized = value <= 1 ? value * 100 : value;
	const safe = Math.max(0, Math.min(100, normalized));
	const decimals = safe % 1 === 0 ? 0 : 1;
	return `${safe.toFixed(decimals)}%`;
};

const statusVariant = (status: LostItemStatus): 'warning' | 'success' | 'muted' => {
	if (status === LostItemStatus.PENDING_REVIEW) return 'warning';
	if (status === LostItemStatus.COLLECTED) return 'success';
	return 'muted';
};

const priorityClass = (priority: LostItemPriority): string => {
	if (priority === LostItemPriority.HIGH) return 'is-high';
	if (priority === LostItemPriority.MEDIUM) return 'is-medium';
	return 'is-low';
};

const getTotal = (queryData: any): number => queryData?.getLostItems?.metaCounter?.[0]?.total ?? 0;

const baseSummaryInput: LostItemsInquiry = {
	page: 1,
	limit: 1,
	sort: 'detectedAt',
	direction: Direction.DESC,
};

const AdminLostItems: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [objectTypeFilter, setObjectTypeFilter] = useState<ObjectTypeFilter>('ALL');
	const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
	const [robotIdDraft, setRobotIdDraft] = useState('');
	const [robotIdSearch, setRobotIdSearch] = useState('');
	const [detectedAtFrom, setDetectedAtFrom] = useState('');
	const [detectedAtTo, setDetectedAtTo] = useState('');
	const [mutatingId, setMutatingId] = useState('');
	const [snapshotErrors, setSnapshotErrors] = useState<Record<string, boolean>>({});

	const inquiryInput = useMemo<LostItemsInquiry>(() => {
		const search: LostItemsInquiry['search'] = {};
		if (statusFilter !== 'ALL') search.status = statusFilter;
		if (objectTypeFilter !== 'ALL') search.objectType = objectTypeFilter;
		if (priorityFilter !== 'ALL') search.priority = priorityFilter;
		if (robotIdSearch.trim()) search.robotId = robotIdSearch.trim();

		const fromDate = detectedAtFrom ? new Date(`${detectedAtFrom}T00:00:00`) : undefined;
		const toDate = detectedAtTo ? new Date(`${detectedAtTo}T23:59:59.999`) : undefined;

		if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
			search.detectedAtFrom = toDate;
			search.detectedAtTo = fromDate;
		} else {
			if (fromDate) search.detectedAtFrom = fromDate;
			if (toDate) search.detectedAtTo = toDate;
		}

		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'detectedAt',
			direction: Direction.DESC,
			search,
		};
	}, [page, statusFilter, objectTypeFilter, priorityFilter, robotIdSearch, detectedAtFrom, detectedAtTo]);

	const {
		data,
		loading,
		error,
		refetch,
	} = useQuery(GET_LOST_ITEMS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const pendingSummary = useQuery(GET_LOST_ITEMS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...baseSummaryInput,
				search: { status: LostItemStatus.PENDING_REVIEW },
			},
		},
	});

	const highPrioritySummary = useQuery(GET_LOST_ITEMS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...baseSummaryInput,
				search: { priority: LostItemPriority.HIGH },
			},
		},
	});

	const collectedSummary = useQuery(GET_LOST_ITEMS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...baseSummaryInput,
				search: { status: LostItemStatus.COLLECTED },
			},
		},
	});

	const dismissedSummary = useQuery(GET_LOST_ITEMS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...baseSummaryInput,
				search: { status: LostItemStatus.DISMISSED },
			},
		},
	});

	const [updateLostItemStatus] = useMutation(UPDATE_LOST_ITEM_STATUS);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, objectTypeFilter, priorityFilter, robotIdSearch, detectedAtFrom, detectedAtTo]);

	const list: LostItemRecord[] = data?.getLostItems?.list ?? [];
	const total: number = getTotal(data);
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const applyRobotFilter = () => {
		setRobotIdSearch(robotIdDraft.trim());
		setPage(1);
	};

	const clearFilters = () => {
		setStatusFilter('ALL');
		setObjectTypeFilter('ALL');
		setPriorityFilter('ALL');
		setRobotIdDraft('');
		setRobotIdSearch('');
		setDetectedAtFrom('');
		setDetectedAtTo('');
		setPage(1);
	};

	const refreshSummaryCards = async () => {
		await Promise.all([
			pendingSummary.refetch(),
			highPrioritySummary.refetch(),
			collectedSummary.refetch(),
			dismissedSummary.refetch(),
		]);
	};

	const updateStatusHandler = async (lostItem: LostItemRecord, nextStatus: LostItemStatus) => {
		try {
			setMutatingId(lostItem._id);
			const input: UpdateLostItemStatusInput = {
				lostItemId: lostItem._id,
				status: nextStatus,
			};
			await updateLostItemStatus({ variables: { input } });
			await Promise.all([refetch({ input: inquiryInput }), refreshSummaryCards()]);
			await sweetMixinSuccessAlert(`Status changed to ${titleize(nextStatus)}`);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setMutatingId('');
		}
	};

	const pendingCount = getTotal(pendingSummary.data);
	const highPriorityCount = getTotal(highPrioritySummary.data);
	const collectedCount = getTotal(collectedSummary.data);
	const dismissedCount = getTotal(dismissedSummary.data);

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Night Patrol Lost Items</h1>
					<div className="admin-page-sub">
						Review items detected by the robot during overnight patrol.
					</div>
				</div>
			</div>

			<div className="admin-stats-row">
				<div className="admin-stat-card">
					<div className="stat-icon-wrap"><PendingActionsOutlinedIcon /></div>
					<div className="stat-number">{pendingCount.toLocaleString()}</div>
					<p className="stat-label">Pending Review</p>
				</div>
				<div className="admin-stat-card">
					<div className="stat-icon-wrap"><PriorityHighOutlinedIcon /></div>
					<div className="stat-number">{highPriorityCount.toLocaleString()}</div>
					<p className="stat-label">High Priority</p>
				</div>
				<div className="admin-stat-card">
					<div className="stat-icon-wrap"><CheckCircleOutlineOutlinedIcon /></div>
					<div className="stat-number">{collectedCount.toLocaleString()}</div>
					<p className="stat-label">Collected</p>
				</div>
				<div className="admin-stat-card">
					<div className="stat-icon-wrap"><DisabledByDefaultOutlinedIcon /></div>
					<div className="stat-number">{dismissedCount.toLocaleString()}</div>
					<p className="stat-label">Dismissed</p>
				</div>
			</div>

			<div className="admin-filters">
				<select
					className="admin-select"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
				>
					<option value="ALL">All statuses</option>
					{Object.values(LostItemStatus).map((status) => (
						<option key={status} value={status}>
							{titleize(status)}
						</option>
					))}
				</select>

				<select
					className="admin-select"
					value={objectTypeFilter}
					onChange={(e) => setObjectTypeFilter(e.target.value as ObjectTypeFilter)}
				>
					<option value="ALL">All object types</option>
					{Object.values(LostItemObjectType).map((type) => (
						<option key={type} value={type}>
							{titleize(type)}
						</option>
					))}
				</select>

				<select
					className="admin-select"
					value={priorityFilter}
					onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
				>
					<option value="ALL">All priorities</option>
					{Object.values(LostItemPriority).map((priority) => (
						<option key={priority} value={priority}>
							{titleize(priority)}
						</option>
					))}
				</select>

				<input
					className="admin-input"
					placeholder="Robot ID"
					value={robotIdDraft}
					onChange={(e) => setRobotIdDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') applyRobotFilter();
					}}
				/>

				<input
					className="admin-input"
					type="date"
					value={detectedAtFrom}
					max={detectedAtTo || undefined}
					onChange={(e) => setDetectedAtFrom(e.target.value)}
					title="Detected from"
				/>

				<input
					className="admin-input"
					type="date"
					value={detectedAtTo}
					min={detectedAtFrom || undefined}
					onChange={(e) => setDetectedAtTo(e.target.value)}
					title="Detected to"
				/>

				<button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={applyRobotFilter}>
					Apply
				</button>
				<button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={clearFilters}>
					Clear Filters
				</button>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table admin-lost-table">
					<thead>
						<tr>
							<th style={{ width: 100 }}>Snapshot</th>
							<th style={{ width: 160 }}>Object Type</th>
							<th style={{ width: 105 }}>Priority</th>
							<th style={{ width: 90 }}>Confidence</th>
							<th style={{ width: 160 }}>Detected At</th>
							<th style={{ width: 110 }}>Robot ID</th>
							<th style={{ width: 190 }}>Location</th>
							<th style={{ width: 140 }}>Status</th>
							<th>Notes</th>
							<th style={{ width: 180, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td colSpan={10}>
									<div className="admin-lost-empty">
										<div className="admin-cell-title">Loading lost items...</div>
									</div>
								</td>
							</tr>
						)}

						{!loading && error && (
							<tr>
								<td colSpan={10}>
									<div className="admin-lost-empty">
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--danger" />
											Failed to load lost items: {error.message}
										</span>
									</div>
								</td>
							</tr>
						)}

						{!loading && !error && list.length === 0 && (
							<tr>
								<td colSpan={10}>
									<div className="admin-lost-empty">
										<div className="admin-cell-title">No lost items found</div>
										<div className="admin-cell-meta">Night patrol detections will appear here.</div>
									</div>
								</td>
							</tr>
						)}

						{!loading &&
							!error &&
							list.map((lostItem) => {
								const isBusy = mutatingId === lostItem._id;
								const snapshotRaw = lostItem.snapshotUrl || lostItem.snapshotPath;
								const snapshotAvailable = Boolean(snapshotRaw) && !snapshotErrors[lostItem._id];

								const floor = lostItem.location?.floorId;
								const checkpoint = lostItem.location?.patrolCheckpoint;
								const source = lostItem.location?.source;
								const x = lostItem.location?.x;
								const y = lostItem.location?.y;

								const locationTop = [floor, checkpoint].filter(Boolean).join(' / ') || source || '—';
								const locationBottom =
									typeof x === 'number' && typeof y === 'number'
										? `x:${x.toFixed(2)}, y:${y.toFixed(2)}`
										: '';

								return (
									<tr key={lostItem._id}>
										<td>
											{snapshotAvailable ? (
												<img
													className="admin-lost-thumb"
													src={resolveMediaUrl(snapshotRaw as string, '')}
													alt={lostItem.objectType}
													onError={() =>
														setSnapshotErrors((prev) => ({ ...prev, [lostItem._id]: true }))
													}
												/>
											) : (
												<div className="admin-lost-thumb-placeholder">No snapshot</div>
											)}
										</td>
										<td>
											<div className="admin-cell-title">{titleize(lostItem.objectType)}</div>
											<div className="admin-cell-meta admin-mono admin-lost-id">{lostItem._id}</div>
										</td>
										<td>
											<span className={`admin-lost-priority ${priorityClass(lostItem.priority)}`}>
												{titleize(lostItem.priority)}
											</span>
										</td>
										<td>{formatConfidence(lostItem.confidence)}</td>
										<td className="admin-cell-meta">{formatDate(lostItem.detectedAt)}</td>
										<td>
											<div className="admin-cell-title admin-mono">{lostItem.robotId || '—'}</div>
										</td>
										<td>
											<div className="admin-cell-title admin-lost-location">{locationTop}</div>
											{locationBottom && <div className="admin-cell-meta">{locationBottom}</div>}
										</td>
										<td>
											<span className="admin-status">
												<span className={`admin-status-dot admin-status-dot--${statusVariant(lostItem.status)}`} />
												{titleize(lostItem.status)}
											</span>
										</td>
										<td className="admin-cell-meta admin-lost-note">{lostItem.notes?.trim() || '—'}</td>
										<td>
											<div className="admin-cell-actions">
												{lostItem.status === LostItemStatus.PENDING_REVIEW ? (
													<>
														<button
															type="button"
															className="admin-btn admin-btn--primary admin-btn--sm"
															disabled={isBusy}
															onClick={() =>
																updateStatusHandler(lostItem, LostItemStatus.COLLECTED)
															}
														>
															Mark Collected
														</button>
														<button
															type="button"
															className="admin-btn admin-btn--ghost admin-btn--sm admin-lost-dismiss-btn"
															disabled={isBusy}
															onClick={() =>
																updateStatusHandler(lostItem, LostItemStatus.DISMISSED)
															}
														>
															Dismiss
														</button>
													</>
												) : (
													<button
														type="button"
														className="admin-link-btn is-muted"
														disabled={isBusy}
														onClick={() =>
															updateStatusHandler(lostItem, LostItemStatus.PENDING_REVIEW)
														}
													>
														Set Pending
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

export default withAdminLayout(AdminLostItems);
