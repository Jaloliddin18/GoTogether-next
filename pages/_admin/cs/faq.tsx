import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const PAGE_LIMIT = 8;

type FaqVisibility = 'VISIBLE' | 'HIDDEN';

interface FaqRow {
	id: string;
	question: string;
	category: string;
	visibility: FaqVisibility;
	updatedAt: string;
}

const FAQ_ROWS: FaqRow[] = [
	{ id: 'FAQ-001', question: 'How long can I borrow a book?', category: 'Borrow', visibility: 'VISIBLE', updatedAt: '2026-05-19T09:10:00.000Z' },
	{ id: 'FAQ-002', question: 'How do I cancel a delivery request?', category: 'Delivery', visibility: 'VISIBLE', updatedAt: '2026-05-17T15:20:00.000Z' },
	{ id: 'FAQ-003', question: 'Can I pay for purchased books by card?', category: 'Payment', visibility: 'VISIBLE', updatedAt: '2026-05-15T11:00:00.000Z' },
	{ id: 'FAQ-004', question: 'What happens if a robot cannot find my book?', category: 'Delivery', visibility: 'VISIBLE', updatedAt: '2026-05-11T08:30:00.000Z' },
	{ id: 'FAQ-005', question: 'How can I reset my member password?', category: 'Account', visibility: 'VISIBLE', updatedAt: '2026-05-09T17:05:00.000Z' },
	{ id: 'FAQ-006', question: 'Can I reserve a book that is currently borrowed?', category: 'Borrow', visibility: 'HIDDEN', updatedAt: '2026-05-08T13:12:00.000Z' },
	{ id: 'FAQ-007', question: 'Where can I see request status history?', category: 'Delivery', visibility: 'VISIBLE', updatedAt: '2026-05-02T10:40:00.000Z' },
	{ id: 'FAQ-008', question: 'Do members pay delivery fees?', category: 'Payment', visibility: 'HIDDEN', updatedAt: '2026-04-30T12:00:00.000Z' },
	{ id: 'FAQ-009', question: 'How do I contact support about blocked accounts?', category: 'Account', visibility: 'VISIBLE', updatedAt: '2026-04-26T16:18:00.000Z' },
];

const formatDate = (value?: string): string => {
	if (!value) return '—';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const AdminFaq: NextPage = () => {
	const [page, setPage] = useState(1);
	const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | FaqVisibility>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<'ALL' | string>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');

	const categories = useMemo(() => {
		return ['ALL', ...Array.from(new Set(FAQ_ROWS.map((row) => row.category)))];
	}, []);

	const filteredRows = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		return FAQ_ROWS.filter((row) => {
			if (visibilityFilter !== 'ALL' && row.visibility !== visibilityFilter) return false;
			if (categoryFilter !== 'ALL' && row.category !== categoryFilter) return false;
			if (!query) return true;
			return [row.id, row.question, row.category].some((value) => value.toLowerCase().includes(query));
		});
	}, [visibilityFilter, categoryFilter, searchText]);

	const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));
	const pagedRows = filteredRows.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">CS FAQ</h1>
					<div className="admin-page-sub">{filteredRows.length.toLocaleString()} total</div>
				</div>
				<button type="button" className="admin-btn admin-btn--primary">
					+ Add FAQ
				</button>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search FAQ by question or id"
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
					value={visibilityFilter}
					onChange={(e) => {
						setVisibilityFilter(e.target.value as 'ALL' | FaqVisibility);
						setPage(1);
					}}
				>
					<option value="ALL">All visibility</option>
					<option value="VISIBLE">Visible</option>
					<option value="HIDDEN">Hidden</option>
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
							<th>Question</th>
							<th style={{ width: 140 }}>Category</th>
							<th style={{ width: 120 }}>Visibility</th>
							<th style={{ width: 140 }}>Updated</th>
							<th style={{ width: 170, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{pagedRows.length === 0 && (
							<tr>
								<td colSpan={5} className="admin-empty-row">
									No FAQs found
								</td>
							</tr>
						)}
						{pagedRows.map((row) => (
							<tr key={row.id}>
								<td>
									<div className="admin-cell-title">{row.question}</div>
									<div className="admin-cell-meta admin-mono">{row.id}</div>
								</td>
								<td>{row.category}</td>
								<td>
									<span className={row.visibility === 'VISIBLE' ? 'badge badge-active' : 'badge badge-block'}>
										{row.visibility}
									</span>
								</td>
								<td className="admin-cell-meta">{formatDate(row.updatedAt)}</td>
								<td>
									<div className="admin-cell-actions">
										<button type="button" className="admin-link-btn">
											Edit
										</button>
										<button type="button" className="admin-link-btn is-muted">
											Toggle
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

export default withAdminLayout(AdminFaq);
