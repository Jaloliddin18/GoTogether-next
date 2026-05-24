import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const PAGE_LIMIT = 8;

type NoticeStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

interface NoticeRow {
	id: string;
	title: string;
	category: string;
	status: NoticeStatus;
	author: string;
	views: number;
	createdAt: string;
}

const NOTICE_ROWS: NoticeRow[] = [
	{ id: 'NTC-001', title: 'Library Hours Update During Exam Week', category: 'General', status: 'PUBLISHED', author: 'Admin Team', views: 452, createdAt: '2026-05-20T09:00:00.000Z' },
	{ id: 'NTC-002', title: 'Robot Delivery Zone Expansion to Building D', category: 'Delivery', status: 'PUBLISHED', author: 'Operations', views: 315, createdAt: '2026-05-16T11:30:00.000Z' },
	{ id: 'NTC-003', title: 'Temporary Maintenance: Book Borrow API', category: 'System', status: 'ARCHIVED', author: 'Tech Team', views: 192, createdAt: '2026-05-08T14:45:00.000Z' },
	{ id: 'NTC-004', title: 'Lost and Found Policy for Borrowed Books', category: 'Policy', status: 'PUBLISHED', author: 'Admin Team', views: 267, createdAt: '2026-05-02T10:10:00.000Z' },
	{ id: 'NTC-005', title: 'Draft: New Semester Smart Library Rules', category: 'Policy', status: 'DRAFT', author: 'Admin Team', views: 0, createdAt: '2026-05-24T03:20:00.000Z' },
	{ id: 'NTC-006', title: 'Payment Gateway Incident Report', category: 'System', status: 'ARCHIVED', author: 'Tech Team', views: 144, createdAt: '2026-04-28T08:00:00.000Z' },
	{ id: 'NTC-007', title: 'Guide: How to Use Pick-up Lockers', category: 'Delivery', status: 'PUBLISHED', author: 'Operations', views: 201, createdAt: '2026-04-22T16:15:00.000Z' },
	{ id: 'NTC-008', title: 'Volunteer Program for Book Sorting', category: 'General', status: 'DRAFT', author: 'Admin Team', views: 0, createdAt: '2026-05-23T05:55:00.000Z' },
	{ id: 'NTC-009', title: 'Holiday Closure Notice', category: 'General', status: 'ARCHIVED', author: 'Admin Team', views: 589, createdAt: '2026-03-12T07:00:00.000Z' },
];

const titleize = (raw?: string): string => {
	if (!raw) return '—';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string): string => {
	if (!value) return '—';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const statusBadgeClass = (status: NoticeStatus): string => {
	if (status === 'PUBLISHED') return 'badge badge-active';
	if (status === 'ARCHIVED') return 'badge badge-delete';
	return 'badge badge-block';
};

const AdminNotice: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<'ALL' | NoticeStatus>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<'ALL' | string>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');

	const categories = useMemo(() => {
		return ['ALL', ...Array.from(new Set(NOTICE_ROWS.map((row) => row.category)))];
	}, []);

	const filteredRows = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		return NOTICE_ROWS.filter((row) => {
			if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
			if (categoryFilter !== 'ALL' && row.category !== categoryFilter) return false;
			if (!query) return true;
			return [row.id, row.title, row.author].some((value) => value.toLowerCase().includes(query));
		});
	}, [statusFilter, categoryFilter, searchText]);

	const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));
	const pagedRows = filteredRows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">CS Notices</h1>
					<div className="admin-page-sub">{filteredRows.length.toLocaleString()} total</div>
				</div>
				<button type="button" className="admin-btn admin-btn--primary">
					+ Add Notice
				</button>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search notice by title, id, author"
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
						setStatusFilter(e.target.value as 'ALL' | NoticeStatus);
						setPage(1);
					}}
				>
					<option value="ALL">All statuses</option>
					<option value="PUBLISHED">Published</option>
					<option value="DRAFT">Draft</option>
					<option value="ARCHIVED">Archived</option>
				</select>
				<select
					className="admin-select"
					value={categoryFilter}
					onChange={(e) => {
						setCategoryFilter(e.target.value);
						setPage(1);
					}}
				>
					{categories.map((category) => (
						<option key={category} value={category}>
							{category === 'ALL' ? 'All categories' : category}
						</option>
					))}
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 280 }}>Title</th>
							<th style={{ width: 120 }}>Category</th>
							<th style={{ width: 120 }}>Status</th>
							<th style={{ width: 140 }}>Author</th>
							<th style={{ width: 120 }}>Date</th>
							<th style={{ width: 90 }}>Views</th>
							<th style={{ width: 160, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{pagedRows.length === 0 && (
							<tr>
								<td colSpan={7} className="admin-empty-row">
									No notices found
								</td>
							</tr>
						)}
						{pagedRows.map((row) => (
							<tr key={row.id}>
								<td>
									<div className="admin-cell-title">{row.title}</div>
									<div className="admin-cell-meta admin-mono">{row.id}</div>
								</td>
								<td>{row.category}</td>
								<td>
									<span className={statusBadgeClass(row.status)}>{titleize(row.status)}</span>
								</td>
								<td>{row.author}</td>
								<td className="admin-cell-meta">{formatDate(row.createdAt)}</td>
								<td>{row.views.toLocaleString()}</td>
								<td>
									<div className="admin-cell-actions">
										<button type="button" className="admin-link-btn">
											Edit
										</button>
										<button type="button" className="admin-link-btn is-muted">
											Archive
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

export default withAdminLayout(AdminNotice);
