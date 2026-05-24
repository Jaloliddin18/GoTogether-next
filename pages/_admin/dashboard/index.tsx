import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import Moment from 'react-moment';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	GET_ALL_BOOKS_BY_ADMIN,
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_REQUESTS,
	GET_ROBOTS,
} from '../../../apollo/admin/query';
import { RequestStatus } from '../../../libs/enums/request.enum';
import { T } from '../../../libs/types/common';

const ACTIVE_REQUEST_STATUSES = new Set<string>([
	RequestStatus.QUEUED,
	RequestStatus.ASSIGNED,
	RequestStatus.DISPATCHED,
	RequestStatus.NAVIGATING_TO_SHELF,
	RequestStatus.ARRIVED_AT_SHELF,
	RequestStatus.VERIFYING_BOOK,
	RequestStatus.BOOK_FOUND,
	RequestStatus.PICKING_UP,
	RequestStatus.DELIVERING,
	RequestStatus.ARRIVED_AT_STUDENT,
	RequestStatus.READY,
]);

const requestStatusVariant = (status: string): string => {
	if (status === RequestStatus.COMPLETED) return 'success';
	if (status === RequestStatus.FAILED || status === RequestStatus.BOOK_NOT_FOUND) return 'danger';
	if (status === RequestStatus.CANCELLED) return 'muted';
	if (status === RequestStatus.QUEUED) return 'muted';
	if (ACTIVE_REQUEST_STATUSES.has(status)) return 'primary';
	return 'muted';
};

const formatStatus = (status?: string): string => {
	if (!status) return '—';
	return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const batteryVariant = (b?: number): 'high' | 'mid' | 'low' => {
	if (typeof b !== 'number') return 'low';
	if (b >= 60) return 'high';
	if (b >= 25) return 'mid';
	return 'low';
};

const STAT_QUERY_INPUT = { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} };

const AdminDashboard: NextPage = () => {
	const { data: booksData } = useQuery(GET_ALL_BOOKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: STAT_QUERY_INPUT },
	});

	const { data: membersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: STAT_QUERY_INPUT },
	});

	const { data: recentRequestsData } = useQuery(GET_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: {} } },
	});

	const { data: allRequestsData } = useQuery(GET_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} } },
	});

	const { data: robotsData } = useQuery(GET_ROBOTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', direction: 'DESC', search: {} } },
	});

	const totalBooks: number = booksData?.getAllBooksByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalMembers: number = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const allRequests: T[] = allRequestsData?.getRequests?.list ?? [];
	const activeRequestCount = allRequests.filter((r: T) => ACTIVE_REQUEST_STATUSES.has(r.status)).length;
	const robots: T[] = robotsData?.getRobots?.list ?? [];
	const robotsOnline = robots.filter((r: T) => r.isOnline).length;
	const recentRequests: T[] = recentRequestsData?.getRequests?.list ?? [];

	const statCards = [
		{ key: 'books', label: 'Total Books', value: totalBooks, Icon: MenuBookOutlinedIcon },
		{ key: 'members', label: 'Total Members', value: totalMembers, Icon: PeopleAltOutlinedIcon },
		{ key: 'active', label: 'Active Requests', value: activeRequestCount, Icon: AssignmentOutlinedIcon },
		{ key: 'robots', label: 'Robots Online', value: robotsOnline, Icon: SmartToyOutlinedIcon },
	];

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Dashboard</h1>
					<div className="admin-page-sub">Operations overview</div>
				</div>
			</div>

			{/* Row 1 — Stat cards */}
			<div className="admin-stats-row">
				{statCards.map(({ key, label, value, Icon }) => (
					<div className="admin-stat-card" key={key}>
						<div className="admin-stat-icon-wrap">
							<Icon />
						</div>
						<div className="admin-stat-value">{value.toLocaleString()}</div>
						<div className="admin-stat-label">{label}</div>
					</div>
				))}
			</div>

			{/* Row 2 — Recent Requests + Robot Status */}
			<div className="admin-dashboard-grid">
				<div className="admin-table-card">
					<div className="admin-table-card-header">
						<div>
							<div className="admin-table-card-title">Recent Requests</div>
							<div className="admin-table-card-subtitle">Last 5 incoming deliveries</div>
						</div>
						<Link href="/_admin/requests" legacyBehavior>
							<a className="admin-table-card-link">View all</a>
						</Link>
					</div>
					<table className="admin-table">
						<thead>
							<tr>
								<th style={{ width: 100 }}>Request</th>
								<th>Book</th>
								<th style={{ width: 120 }}>Member</th>
								<th style={{ width: 150 }}>Status</th>
								<th style={{ width: 70 }}>Date</th>
							</tr>
						</thead>
						<tbody>
							{recentRequests.length === 0 && (
								<tr>
									<td colSpan={5}>
										<div style={{ padding: '32px 0', textAlign: 'center' }}>
											<span className="admin-status">
												<span className="admin-status-dot admin-status-dot--muted" />
												No requests yet
											</span>
										</div>
									</td>
								</tr>
							)}
							{recentRequests.map((req: T) => (
								<tr key={req._id}>
									<td>
										<span className="admin-mono">{req._id?.slice(-8)}</span>
									</td>
									<td>
										<div className="admin-cell-title">{req.bookData?.bookTitle ?? '—'}</div>
										<div className="admin-cell-meta">{req.bookData?.bookAuthor ?? ''}</div>
									</td>
									<td>{req.memberData?.memberNick ?? '—'}</td>
									<td>
										<span className="admin-status">
											<span className={`admin-status-dot admin-status-dot--${requestStatusVariant(req.status)}`} />
											{formatStatus(req.status)}
										</span>
									</td>
									<td>
										<span className="admin-cell-meta" style={{ marginTop: 0 }}>
											<Moment format="MMM D">{req.createdAt}</Moment>
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="admin-table-card">
					<div className="admin-table-card-header">
						<div>
							<div className="admin-table-card-title">Robot Status</div>
							<div className="admin-table-card-subtitle">
								{robotsOnline} of {robots.length} online
							</div>
						</div>
						<Link href="/_admin/robots" legacyBehavior>
							<a className="admin-table-card-link">View all</a>
						</Link>
					</div>
					<table className="admin-table">
						<thead>
							<tr>
								<th>Robot</th>
								<th style={{ width: 110 }}>Status</th>
								<th style={{ width: 120 }}>Battery</th>
								<th style={{ width: 90 }}>Online</th>
							</tr>
						</thead>
						<tbody>
							{robots.length === 0 && (
								<tr>
									<td colSpan={4}>
										<div style={{ padding: '32px 0', textAlign: 'center' }}>
											<span className="admin-status">
												<span className="admin-status-dot admin-status-dot--muted" />
												No robots registered
											</span>
										</div>
									</td>
								</tr>
							)}
							{robots.map((robot: T) => (
								<tr key={robot._id}>
									<td>
										<div className="admin-cell-title">{robot.name ?? robot.robotId}</div>
										<div className="admin-mono" style={{ marginTop: 2 }}>{robot.robotId}</div>
									</td>
									<td>
										<span className="admin-cell-meta" style={{ marginTop: 0 }}>
											{formatStatus(robot.status)}
										</span>
									</td>
									<td>
										{typeof robot.battery === 'number' ? (
											<span className="admin-battery">
												<span className="admin-battery-track">
													<span
														className={`admin-battery-fill admin-battery-fill--${batteryVariant(robot.battery)}`}
														style={{ width: `${Math.max(2, Math.min(100, robot.battery))}%` }}
													/>
												</span>
												<span className="admin-battery-text">{robot.battery}%</span>
											</span>
										) : (
											<span className="admin-cell-meta" style={{ marginTop: 0 }}>—</span>
										)}
									</td>
									<td>
										<span className="admin-status">
											<span
												className={`admin-status-dot admin-status-dot--${robot.isOnline ? 'success' : 'danger'}`}
											/>
											{robot.isOnline ? 'Online' : 'Offline'}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default withAdminLayout(AdminDashboard);
