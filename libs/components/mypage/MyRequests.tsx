import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_SESSION_REQUESTS } from '../../../apollo/user/query';
import { RequestStatus, RequestType } from '../../enums/request.enum';
import { REACT_APP_API_URL } from '../../config';

const PAGE_LIMIT = 8;

type TabFilter = 'ALL' | 'ACTIVE' | 'HISTORY';

const ACTIVE_STATUSES: RequestStatus[] = [
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
];

const HISTORY_STATUSES: RequestStatus[] = [
	RequestStatus.COMPLETED,
	RequestStatus.FAILED,
	RequestStatus.CANCELLED,
	RequestStatus.BOOK_NOT_FOUND,
];

interface StatusMeta { label: string; className: string }

const STATUS_META: Partial<Record<RequestStatus, StatusMeta>> = {
	[RequestStatus.QUEUED]:              { label: 'Queued',       className: 'status-pending' },
	[RequestStatus.ASSIGNED]:            { label: 'Assigned',     className: 'status-active' },
	[RequestStatus.DISPATCHED]:          { label: 'Dispatched',   className: 'status-active' },
	[RequestStatus.NAVIGATING_TO_SHELF]: { label: 'Navigating',   className: 'status-active' },
	[RequestStatus.ARRIVED_AT_SHELF]:    { label: 'At Shelf',     className: 'status-active' },
	[RequestStatus.VERIFYING_BOOK]:      { label: 'Verifying',    className: 'status-active' },
	[RequestStatus.BOOK_FOUND]:          { label: 'Book Found',   className: 'status-active' },
	[RequestStatus.PICKING_UP]:          { label: 'Picking Up',   className: 'status-active' },
	[RequestStatus.DELIVERING]:          { label: 'Delivering',   className: 'status-active' },
	[RequestStatus.ARRIVED_AT_STUDENT]:  { label: 'Arrived',      className: 'status-ready' },
	[RequestStatus.READY]:               { label: 'Ready',        className: 'status-ready' },
	[RequestStatus.COMPLETED]:           { label: 'Completed',    className: 'status-done' },
	[RequestStatus.FAILED]:              { label: 'Failed',       className: 'status-issue' },
	[RequestStatus.CANCELLED]:           { label: 'Cancelled',    className: 'status-issue' },
	[RequestStatus.BOOK_NOT_FOUND]:      { label: 'Not Found',    className: 'status-issue' },
};

const TABS: { key: TabFilter; label: string }[] = [
	{ key: 'ALL',     label: 'All' },
	{ key: 'ACTIVE',  label: 'Active' },
	{ key: 'HISTORY', label: 'History' },
];

const formatDate = (iso: string | Date) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const MyRequests: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [requests, setRequests] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [activeTab, setActiveTab] = useState<TabFilter>('ALL');

	/** APOLLO **/
	useQuery(GET_SESSION_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRequests(data?.getSessionRequests?.list ?? []);
			setTotal(data?.getSessionRequests?.metaCounter[0]?.total ?? 0);
		},
	});

	const filtered = requests.filter((r) => {
		if (activeTab === 'ACTIVE')  return ACTIVE_STATUSES.includes(r.status);
		if (activeTab === 'HISTORY') return HISTORY_STATUSES.includes(r.status);
		return true;
	});

	if (device === 'mobile') return <div>MY REQUESTS MOBILE</div>;

	return (
		<div id="my-requests-page">
			<Stack className="panel-header">
				<Typography className="panel-title">My Requests</Typography>
				<Typography className="panel-subtitle">Borrow and purchase history</Typography>
			</Stack>

			<div className="requests-tab-bar">
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						className={`requests-tab${activeTab === key ? ' requests-tab--active' : ''}`}
						onClick={() => setActiveTab(key)}
					>
						{label}
					</button>
				))}
			</div>

			{filtered.length > 0 ? (
				<>
					<div className="requests-list">
						{filtered.map((req) => {
							const meta = STATUS_META[req.status as RequestStatus] ?? { label: req.status, className: 'status-done' };
							const cover = req.bookData?.bookImages?.[0]
								? `${REACT_APP_API_URL}/${req.bookData.bookImages[0]}`
								: '/img/profile/defaultUser.svg';

							return (
								<div key={req._id} className="request-row">
									<div className="request-cover">
										<img src={cover} alt={req.bookData?.bookTitle ?? 'Book'} />
									</div>
									<div className="request-content">
										<Typography className="request-title">{req.bookData?.bookTitle ?? '—'}</Typography>
										<Typography className="request-author">{req.bookData?.bookAuthor ?? ''}</Typography>
									</div>
									<div className="request-meta">
										<span className={`request-status ${meta.className}`}>{meta.label}</span>
										<span className={`request-type-pill request-type-${(req.requestType as string).toLowerCase()}`}>
											{req.requestType}
										</span>
									</div>
									<div className="request-dates">
										<Typography className="request-date-label">Requested</Typography>
										<Typography className="request-date">{formatDate(req.createdAt)}</Typography>
									</div>
								</div>
							);
						})}
					</div>
					{total > PAGE_LIMIT && (
						<Stack className="pagination-config">
							<Pagination
								count={Math.ceil(total / PAGE_LIMIT)}
								page={page}
								shape="circular"
								color="primary"
								onChange={(_: T, v: number) => setPage(v)}
							/>
						</Stack>
					)}
				</>
			) : (
				<Stack className="empty-state">
					<LibraryBooksIcon className="empty-icon" />
					<Typography className="empty-heading">No requests found</Typography>
					<Typography className="empty-body">
						{activeTab === 'ACTIVE' ? 'You have no active borrow or purchase requests.' : 'Your request history will appear here.'}
					</Typography>
				</Stack>
			)}
		</div>
	);
};

export default MyRequests;
