import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_SESSION_REQUESTS } from '../../../apollo/user/query';
import { RequestStatus } from '../../enums/request.enum';
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

interface StatusMeta { label: string; dotClass: string }

const STATUS_META: Partial<Record<RequestStatus, StatusMeta>> = {
	[RequestStatus.QUEUED]:              { label: 'Queued',      dotClass: 'dot-muted'    },
	[RequestStatus.ASSIGNED]:            { label: 'Assigned',    dotClass: 'dot-muted'    },
	[RequestStatus.DISPATCHED]:          { label: 'Dispatched',  dotClass: 'dot-primary'  },
	[RequestStatus.NAVIGATING_TO_SHELF]: { label: 'Navigating',  dotClass: 'dot-primary'  },
	[RequestStatus.ARRIVED_AT_SHELF]:    { label: 'At Shelf',    dotClass: 'dot-primary'  },
	[RequestStatus.VERIFYING_BOOK]:      { label: 'Verifying',   dotClass: 'dot-primary'  },
	[RequestStatus.BOOK_FOUND]:          { label: 'Book Found',  dotClass: 'dot-primary'  },
	[RequestStatus.PICKING_UP]:          { label: 'Picking Up',  dotClass: 'dot-primary'  },
	[RequestStatus.DELIVERING]:          { label: 'Delivering',  dotClass: 'dot-primary'  },
	[RequestStatus.ARRIVED_AT_STUDENT]:  { label: 'Arrived',     dotClass: 'dot-success'  },
	[RequestStatus.READY]:               { label: 'Ready',       dotClass: 'dot-success'  },
	[RequestStatus.COMPLETED]:           { label: 'Completed',   dotClass: 'dot-success'  },
	[RequestStatus.FAILED]:              { label: 'Failed',      dotClass: 'dot-danger'   },
	[RequestStatus.CANCELLED]:           { label: 'Cancelled',   dotClass: 'dot-danger'   },
	[RequestStatus.BOOK_NOT_FOUND]:      { label: 'Not Found',   dotClass: 'dot-warning'  },
};

const TABS: { key: TabFilter; label: string }[] = [
	{ key: 'ALL',     label: 'All' },
	{ key: 'ACTIVE',  label: 'Active' },
	{ key: 'HISTORY', label: 'History' },
];

const formatDate = (iso: string | Date) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Neutral book cover placeholder — a simple SVG rectangle with a spine line
const BookPlaceholder = () => (
	<svg width="56" height="72" viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<rect width="56" height="72" rx="3" fill="#E2E8F0" />
		<rect x="8" y="0" width="4" height="72" fill="#CBD5E1" />
		<rect x="16" y="20" width="24" height="2" rx="1" fill="#94A3B8" />
		<rect x="16" y="26" width="18" height="2" rx="1" fill="#94A3B8" />
		<rect x="16" y="32" width="20" height="2" rx="1" fill="#94A3B8" />
	</svg>
);

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
							const meta = STATUS_META[req.status as RequestStatus] ?? {
								label: req.status,
								dotClass: 'dot-muted',
							};
							const hasCover = !!req.bookData?.bookImages?.[0];
							const coverSrc = hasCover
								? `${REACT_APP_API_URL}/${req.bookData.bookImages[0]}`
								: null;
							const rawType = (req.requestType as string) ?? '';
							const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

							return (
								<div key={req._id} className="request-row">
									<div className="request-cover">
										{coverSrc
											? <img src={coverSrc} alt={req.bookData?.bookTitle ?? 'Book'} />
											: <BookPlaceholder />
										}
									</div>

									<div className="request-content">
										<span className="request-title">{req.bookData?.bookTitle ?? '—'}</span>
										<span className="request-author">{req.bookData?.bookAuthor ?? ''}</span>
									</div>

									<div className="request-status-col">
										<span className="request-status-row">
											<span className={`request-dot ${meta.dotClass}`} aria-hidden="true" />
											<span className="request-status-label">{meta.label}</span>
										</span>
										{type && <span className="request-type">{type}</span>}
									</div>

									<div className="request-date-col">
										<span className="request-date">{formatDate(req.createdAt)}</span>
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
					<svg className="empty-icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
					</svg>
					<Typography className="empty-heading">No requests found</Typography>
					<Typography className="empty-body">
						{activeTab === 'ACTIVE'
							? 'You have no active borrow or purchase requests.'
							: 'Your request history will appear here.'}
					</Typography>
				</Stack>
			)}
		</div>
	);
};

export default MyRequests;
