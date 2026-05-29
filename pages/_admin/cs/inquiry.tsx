import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

type InquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

type InquiryChannel = 'APP' | 'WEB' | 'PHONE';

interface InquiryRow {
	id: string;
	memberNick: string;
	topic: string;
	channel: InquiryChannel;
	status: InquiryStatus;
	createdAt: string;
}

const PAGE_LIMIT = 10;

const INQUIRY_ROWS: InquiryRow[] = [
	{ id: 'INQ-2301', memberNick: 'jiyoon', topic: 'Borrow request stuck at QUEUED', channel: 'APP', status: 'OPEN', createdAt: '2026-05-24T03:12:00.000Z' },
	{ id: 'INQ-2302', memberNick: 'minho', topic: 'Payment marked pending after card charge', channel: 'WEB', status: 'IN_PROGRESS', createdAt: '2026-05-23T09:40:00.000Z' },
	{ id: 'INQ-2303', memberNick: 'nara', topic: 'Robot arrived at wrong pickup point', channel: 'APP', status: 'ANSWERED', createdAt: '2026-05-22T13:05:00.000Z' },
	{ id: 'INQ-2304', memberNick: 'hyunwoo', topic: 'Account blocked after repeated login errors', channel: 'WEB', status: 'CLOSED', createdAt: '2026-05-20T07:30:00.000Z' },
	{ id: 'INQ-2305', memberNick: 'soyeon', topic: 'Unable to upload profile image', channel: 'APP', status: 'OPEN', createdAt: '2026-05-19T17:55:00.000Z' },
	{ id: 'INQ-2306', memberNick: 'dohyun', topic: 'Requested book not found by robot', channel: 'PHONE', status: 'ANSWERED', createdAt: '2026-05-18T10:20:00.000Z' },
	{ id: 'INQ-2307', memberNick: 'mira', topic: 'Wrong due date shown in mypage', channel: 'WEB', status: 'IN_PROGRESS', createdAt: '2026-05-16T15:03:00.000Z' },
	{ id: 'INQ-2308', memberNick: 'yeji', topic: 'How to cancel an order after dispatch', channel: 'APP', status: 'CLOSED', createdAt: '2026-05-14T11:16:00.000Z' },
	{ id: 'INQ-2309', memberNick: 'taehyun', topic: 'Membership type changed unexpectedly', channel: 'PHONE', status: 'OPEN', createdAt: '2026-05-13T05:44:00.000Z' },
	{ id: 'INQ-2310', memberNick: 'yubin', topic: 'Delivery ETA was not updated', channel: 'WEB', status: 'ANSWERED', createdAt: '2026-05-12T08:50:00.000Z' },
	{ id: 'INQ-2311', memberNick: 'seojun', topic: 'Cannot complete purchase request', channel: 'APP', status: 'IN_PROGRESS', createdAt: '2026-05-10T14:22:00.000Z' },
];

const formatDate = (value?: string): string => {
	if (!value) return '—';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const statusBadgeClass = (status: InquiryStatus): string => {
	if (status === 'ANSWERED' || status === 'CLOSED') return 'badge badge-active';
	if (status === 'IN_PROGRESS') return 'badge badge-user';
	return 'badge badge-block';
};

const AdminInquiry: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<'ALL' | InquiryStatus>('ALL');
	const [channelFilter, setChannelFilter] = useState<'ALL' | InquiryChannel>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');

	const filteredRows = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		return INQUIRY_ROWS.filter((row) => {
			if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
			if (channelFilter !== 'ALL' && row.channel !== channelFilter) return false;
			if (!query) return true;
			return [row.id, row.memberNick, row.topic].some((value) => value.toLowerCase().includes(query));
		});
	}, [statusFilter, channelFilter, searchText]);

	const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));
	const pagedRows = filteredRows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">CS Inquiries</h1>
					<div className="admin-page-sub">{filteredRows.length.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by inquiry ID, member, topic"
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
					onChange={(e) => {
						setStatusFilter(e.target.value as 'ALL' | InquiryStatus);
						setPage(1);
					}}
				>
					<option value="ALL">All statuses</option>
					<option value="OPEN">Open</option>
					<option value="IN_PROGRESS">In Progress</option>
					<option value="ANSWERED">Answered</option>
					<option value="CLOSED">Closed</option>
				</select>
				<select
					className="admin-select"
					value={channelFilter}
					onChange={(e) => {
						setChannelFilter(e.target.value as 'ALL' | InquiryChannel);
						setPage(1);
					}}
				>
					<option value="ALL">All channels</option>
					<option value="APP">App</option>
					<option value="WEB">Web</option>
					<option value="PHONE">Phone</option>
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 140 }}>Inquiry ID</th>
							<th style={{ width: 120 }}>Member</th>
							<th>Topic</th>
							<th style={{ width: 110 }}>Channel</th>
							<th style={{ width: 130 }}>Status</th>
							<th style={{ width: 120 }}>Date</th>
							<th style={{ width: 160, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{pagedRows.length === 0 && (
							<tr>
								<td colSpan={7} className="admin-empty-row">
									No inquiries found
								</td>
							</tr>
						)}
						{pagedRows.map((row) => (
							<tr key={row.id}>
								<td className="admin-cell-title admin-mono">{row.id}</td>
								<td>{row.memberNick}</td>
								<td>{row.topic}</td>
								<td>{row.channel}</td>
								<td>
									<span className={statusBadgeClass(row.status)}>{row.status}</span>
								</td>
								<td className="admin-cell-meta">{formatDate(row.createdAt)}</td>
								<td>
									<div className="admin-cell-actions">
										<button type="button" className="admin-link-btn">
											Open
										</button>
										<button type="button" className="admin-link-btn is-muted">
											Assign
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{pageCount > 1 && (
				<div className="admin-pagination">
					<Pagination
						count={pageCount}
						page={page}
						onChange={(_event, value) => setPage(value)}
						shape="rounded"
						color="standard"
					/>
				</div>
			)}
		</div>
	);
};

export default withAdminLayout(AdminInquiry);
