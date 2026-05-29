import React, { useEffect, useMemo, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	GET_ALL_BOOKS_BY_ADMIN,
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_REQUESTS,
	GET_ROBOTS,
} from '../../../apollo/admin/query';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { RequestStatus } from '../../../libs/enums/request.enum';
import { Book } from '../../../libs/types/book/book';
import { Member } from '../../../libs/types/member/member';
import { RequestTask } from '../../../libs/types/request/request';
import { Robot } from '../../../libs/types/robot/robot';
import { resolveMediaUrl } from '../../../libs/utils';

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

const PIE_COLORS = ['#2E86DE', '#0EA570', '#D97706', '#DC2626', '#0891B2', '#64748B', '#1A1A2E'];
const BOOK_FALLBACK_IMAGE = '/img/banner/books_hero.png';
const MEMBER_FALLBACK_IMAGE = '/img/profile/defaultUser.svg';

const COUNT_QUERY_INPUT = { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} };
const MEMBER_REPORT_INPUT = { page: 1, limit: 1000, sort: 'createdAt', direction: 'DESC', search: {} };
const REQUEST_REPORT_INPUT = { page: 1, limit: 1000, sort: 'createdAt', direction: 'DESC', search: {} };
const ROBOT_REPORT_INPUT = { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} };
const TOP_VIEWED_BOOKS_INPUT = { page: 1, limit: 5, sort: 'bookViews', direction: 'DESC', search: {} };
const TOP_LIKED_BOOKS_INPUT = { page: 1, limit: 5, sort: 'bookLikes', direction: 'DESC', search: {} };

const formatEnum = (value?: string): string => {
	if (!value) return '-';
	return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const getMonthKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildLastSixMonths = () => {
	const today = new Date();
	return Array.from({ length: 6 }, (_, index) => {
		const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
		return {
			key: getMonthKey(date),
			month: date.toLocaleDateString('en-US', { month: 'short' }),
			count: 0,
		};
	});
};

const formatDate = (value?: string | Date): string => {
	if (!value) return '-';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const getMemberTypeBadge = (type?: MemberType): string => {
	const map: Record<string, string> = {
		[MemberType.USER]: 'badge badge-user',
		[MemberType.ADMIN]: 'badge badge-admin',
		DESIGNER: 'badge badge-designer',
	};
	return type ? map[type] || 'badge' : 'badge';
};

const getMemberStatusBadge = (status?: MemberStatus): string => {
	const map: Record<string, string> = {
		[MemberStatus.ACTIVE]: 'badge badge-active',
		[MemberStatus.BLOCK]: 'badge badge-block',
		[MemberStatus.DELETE]: 'badge badge-delete',
	};
	return status ? map[status] || 'badge' : 'badge';
};

const LineCanvasChart = ({ data }: { data: { month: string; count: number }[] }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		let chart: any;
		let cancelled = false;

		import('chart.js/auto').then(({ default: ChartJS }) => {
			if (cancelled || !canvasRef.current) return;
			chart = new ChartJS(canvasRef.current, {
				type: 'line',
				data: {
					labels: data.map((item) => item.month),
					datasets: [
						{
							data: data.map((item) => item.count),
							borderColor: '#2E86DE',
							backgroundColor: 'rgba(46, 134, 222, 0.08)',
							borderWidth: 2,
							pointRadius: 3,
							pointHoverRadius: 5,
							pointBackgroundColor: '#2E86DE',
							tension: 0.35,
							fill: true,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
					plugins: {
						legend: { display: false },
						tooltip: { displayColors: false },
					},
					scales: {
						x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 12 } } },
						y: {
							beginAtZero: true,
							grid: { color: '#E2E8F0' },
							ticks: { color: '#64748B', precision: 0, font: { size: 12 } },
						},
					},
				},
			});
		});

		return () => {
			cancelled = true;
			if (chart) chart.destroy();
		};
	}, [data]);

	return <canvas ref={canvasRef} />;
};

const DoughnutCanvasChart = ({ data }: { data: { status: string; count: number }[] }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		let chart: any;
		let cancelled = false;

		import('chart.js/auto').then(({ default: ChartJS }) => {
			if (cancelled || !canvasRef.current) return;
			chart = new ChartJS(canvasRef.current, {
				type: 'doughnut',
				data: {
					labels: data.map((item) => formatEnum(item.status)),
					datasets: [
						{
							data: data.map((item) => item.count),
							backgroundColor: data.map((_, index) => PIE_COLORS[index % PIE_COLORS.length]),
							borderWidth: 0,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
					cutout: '60%',
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								boxWidth: 8,
								boxHeight: 8,
								usePointStyle: true,
								color: '#64748B',
								font: { size: 12 },
							},
						},
					},
				},
			});
		});

		return () => {
			cancelled = true;
			if (chart) chart.destroy();
		};
	}, [data]);

	return <canvas ref={canvasRef} />;
};

const AdminDashboard: NextPage = () => {
	const { data: bookCountData } = useQuery(GET_ALL_BOOKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: COUNT_QUERY_INPUT },
	});

	const { data: membersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: MEMBER_REPORT_INPUT },
	});

	const { data: requestsData } = useQuery(GET_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: REQUEST_REPORT_INPUT },
	});

	const { data: robotsData } = useQuery(GET_ROBOTS, {
		fetchPolicy: 'network-only',
		variables: { input: ROBOT_REPORT_INPUT },
	});

	const { data: topViewedBooksData } = useQuery(GET_ALL_BOOKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: TOP_VIEWED_BOOKS_INPUT },
	});

	const { data: topLikedBooksData } = useQuery(GET_ALL_BOOKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: TOP_LIKED_BOOKS_INPUT },
	});

	const totalBooks: number = bookCountData?.getAllBooksByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalMembers: number = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const members: Member[] = membersData?.getAllMembersByAdmin?.list ?? [];
	const requests: RequestTask[] = requestsData?.getRequests?.list ?? [];
	const robots: Robot[] = robotsData?.getRobots?.list ?? [];
	const topViewedBooks: Book[] = topViewedBooksData?.getAllBooksByAdmin?.list ?? [];
	const topLikedBooks: Book[] = topLikedBooksData?.getAllBooksByAdmin?.list ?? [];

	const activeRequestCount = requests.filter((request) => ACTIVE_REQUEST_STATUSES.has(request.status)).length;
	const robotsOnline = robots.filter((robot) => robot.isOnline).length;

	const memberGrowthData = useMemo(() => {
		const months = buildLastSixMonths();
		const counts = new Map(months.map((month) => [month.key, 0]));

		members.forEach((member) => {
			if (!member.createdAt) return;
			const key = getMonthKey(new Date(member.createdAt));
			if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
		});

		return months.map((month) => ({ ...month, count: counts.get(month.key) ?? 0 }));
	}, [members]);

	const requestsByStatusData = useMemo(() => {
		const counts = requests.reduce((acc: Record<string, number>, request) => {
			const status = request.status || 'UNKNOWN';
			acc[status] = (acc[status] ?? 0) + 1;
			return acc;
		}, {});

		return Object.entries(counts)
			.map(([status, count]) => ({ status, count }))
			.sort((a, b) => b.count - a.count);
	}, [requests]);

	const recentMembers = useMemo(() => {
		return [...members]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5);
	}, [members]);

	const statCards = [
		{ key: 'books', label: 'Total Books', value: totalBooks, Icon: MenuBookOutlinedIcon },
		{ key: 'members', label: 'Total Members', value: totalMembers, Icon: PeopleAltOutlinedIcon },
		{ key: 'active', label: 'Active Requests', value: activeRequestCount, Icon: AssignmentOutlinedIcon },
		{ key: 'robots', label: 'Robots Online', value: robotsOnline, Icon: SmartToyOutlinedIcon },
	];

	return (
		<div className="admin-page admin-dashboard-page">
			{/* Row 1 - Stat Cards */}
			<div className="admin-stats-row">
				{statCards.map(({ key, label, value, Icon }) => (
					<div className="admin-stat-card" key={key}>
						<div className="stat-icon-wrap">
							<Icon />
						</div>
						<div className="stat-number">{value.toLocaleString()}</div>
						<div className="stat-label">{label}</div>
					</div>
				))}
			</div>

			{/* Row 2 - Charts */}
			<div className="admin-dashboard-grid">
				<div className="admin-chart-card">
					<div className="chart-card-header">
						<div className="chart-card-title">Member Growth</div>
						<div className="chart-card-subtitle">Last 6 months</div>
					</div>
					<div className="admin-chart-canvas admin-chart-canvas--line">
						<LineCanvasChart data={memberGrowthData} />
					</div>
				</div>

				<div className="admin-chart-card">
					<div className="chart-card-header">
						<div className="chart-card-title">Requests by Status</div>
						<div className="chart-card-subtitle">Current delivery pipeline</div>
					</div>
					<div className="admin-chart-canvas admin-chart-canvas--donut">
						{requestsByStatusData.length > 0 ? (
							<DoughnutCanvasChart data={requestsByStatusData} />
						) : (
							<div className="admin-chart-empty">No data yet</div>
						)}
					</div>
				</div>
			</div>

			{/* Row 3 - Ranked Lists */}
			<div className="admin-ranked-grid">
				<div className="admin-table-card">
					<div className="admin-table-card-header">
						<div className="admin-table-card-title">Top Viewed Books</div>
					</div>
					<table className="admin-compact-table">
						<tbody>
							{topViewedBooks.length > 0 ? (
								topViewedBooks.map((book, index) => (
									<tr key={book._id}>
										<td style={{ width: 28, paddingLeft: 20 }}>
											<span className="compact-table-rank">#{index + 1}</span>
										</td>
										<td style={{ width: 52, paddingLeft: 0, paddingRight: 12 }}>
											<img
												className="compact-table-img"
												src={resolveMediaUrl(book.bookImages?.[0], BOOK_FALLBACK_IMAGE)}
												alt={book.bookTitle}
											/>
										</td>
										<td>
											<Link href={`/books/detail?id=${book._id}`} legacyBehavior>
												<a className="compact-table-name">{book.bookTitle}</a>
											</Link>
										</td>
										<td style={{ textAlign: 'right' }}>
											<span className="compact-table-meta">
												<RemoveRedEyeOutlinedIcon />
												{(book.bookViews ?? 0).toLocaleString()}
											</span>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={4}>
										<div className="admin-empty-row">No data yet</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="admin-table-card">
					<div className="admin-table-card-header">
						<div className="admin-table-card-title">Top Liked Books</div>
					</div>
					<table className="admin-compact-table">
						<tbody>
							{topLikedBooks.length > 0 ? (
								topLikedBooks.map((book, index) => (
									<tr key={book._id}>
										<td style={{ width: 28, paddingLeft: 20 }}>
											<span className="compact-table-rank">#{index + 1}</span>
										</td>
										<td style={{ width: 52, paddingLeft: 0, paddingRight: 12 }}>
											<img
												className="compact-table-img"
												src={resolveMediaUrl(book.bookImages?.[0], BOOK_FALLBACK_IMAGE)}
												alt={book.bookTitle}
											/>
										</td>
										<td>
											<Link href={`/books/detail?id=${book._id}`} legacyBehavior>
												<a className="compact-table-name">{book.bookTitle}</a>
											</Link>
										</td>
										<td style={{ textAlign: 'right' }}>
											<span className="compact-table-meta">
												<FavoriteBorderOutlinedIcon />
												{(book.bookLikes ?? 0).toLocaleString()}
											</span>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={4}>
										<div className="admin-empty-row">No data yet</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Row 4 - Recent Members */}
			<div className="admin-table-card">
				<div className="admin-table-card-header">
					<div className="admin-table-card-title">Recent Members</div>
					<Link href="/_admin/users" legacyBehavior>
						<a className="admin-table-card-link">View all →</a>
					</Link>
				</div>
				<table className="admin-members-table">
					<thead>
						<tr>
							<th>Member</th>
							<th>Type</th>
							<th>Status</th>
							<th>Joined</th>
						</tr>
					</thead>
					<tbody>
						{recentMembers.length > 0 ? (
							recentMembers.map((member) => (
								<tr key={member._id}>
									<td>
										<div className="admin-member-cell">
											<img
												className="admin-member-avatar"
												src={resolveMediaUrl(member.memberImage, MEMBER_FALLBACK_IMAGE)}
												alt={member.memberNick}
											/>
											<Link href={`/member/${member._id}`} legacyBehavior>
												<a className="admin-member-name">{member.memberNick}</a>
											</Link>
										</div>
									</td>
									<td>
										<span className={getMemberTypeBadge(member.memberType)}>{formatEnum(member.memberType)}</span>
									</td>
									<td>
										<span className={getMemberStatusBadge(member.memberStatus)}>{formatEnum(member.memberStatus)}</span>
									</td>
									<td>{formatDate(member.createdAt)}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4}>
									<div className="admin-empty-row">No members yet</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default withAdminLayout(AdminDashboard);
