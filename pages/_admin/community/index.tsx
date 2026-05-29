import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Moment from 'react-moment';
import Pagination from '@mui/material/Pagination';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_TWITS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_TWIT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { Twit } from '../../../libs/types/twit/twit';
import { T } from '../../../libs/types/common';

const PAGE_LIMIT = 10;

const truncate = (s: string | undefined, max = 80) => {
	if (!s) return '';
	if (s.length <= max) return s;
	return s.slice(0, max).trimEnd() + '…';
};

const AdminCommunity: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');

	const inquiryInput = useMemo(() => {
		const search: T = {};
		if (statusFilter === 'ACTIVE') search.isDeleted = false;
		if (statusFilter === 'DELETED') search.isDeleted = true;
		if (searchText.trim()) search.text = searchText.trim();
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: 'DESC',
			search,
		};
	}, [page, statusFilter, searchText]);

	const { data, refetch } = useQuery(GET_ALL_TWITS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [removeTwitByAdmin] = useMutation(REMOVE_TWIT_BY_ADMIN);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, searchText]);

	const list: Twit[] = data?.getAllTwitsByAdmin?.list ?? [];
	const total: number = data?.getAllTwitsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const removeHandler = async (twit: Twit) => {
		try {
			const ok = await sweetConfirmAlert('Remove this twit? This cannot be undone.');
			if (!ok) return;
			await removeTwitByAdmin({ variables: { input: twit._id } });
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Twit removed');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Twit List</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search twit text"
					value={searchDraft}
					onChange={(e) => setSearchDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') setSearchText(searchDraft);
					}}
				/>
				<select
					className="admin-select"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as any)}
				>
					<option value="ALL">All</option>
					<option value="ACTIVE">Active</option>
					<option value="DELETED">Deleted</option>
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 180 }}>Author</th>
							<th>Text</th>
							<th style={{ width: 80 }}>Likes</th>
							<th style={{ width: 80 }}>Views</th>
							<th style={{ width: 120 }}>Status</th>
							<th style={{ width: 110 }}>Date</th>
							<th style={{ width: 120, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{list.length === 0 && (
							<tr>
								<td colSpan={7}>
									<div style={{ padding: '32px 0', textAlign: 'center' }}>
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--muted" />
											No twits found
										</span>
									</div>
								</td>
							</tr>
						)}
						{list.map((twit: Twit) => {
							const isDeleted = !!twit.deletedAt;
							const author = twit.memberData?.memberNick ?? '—';
							return (
								<tr key={twit._id}>
									<td>
										<div className="admin-cell-title">{author}</div>
										<div className="admin-cell-meta">{twit.memberData?.memberFullName ?? ''}</div>
									</td>
									<td>
										<Link href={`/community/detail?id=${twit._id}`} legacyBehavior>
											<a style={{ color: 'inherit', textDecoration: 'none' }}>{truncate(twit.text, 80)}</a>
										</Link>
									</td>
									<td>{twit.likeCount ?? 0}</td>
									<td>{twit.viewCount ?? 0}</td>
									<td>
										<span className="admin-status">
											<span className={`admin-status-dot admin-status-dot--${isDeleted ? 'danger' : 'success'}`} />
											{isDeleted ? 'Deleted' : 'Active'}
										</span>
									</td>
									<td>
										<span className="admin-cell-meta" style={{ marginTop: 0 }}>
											<Moment format="MMM D, YYYY">{twit.createdAt}</Moment>
										</span>
									</td>
									<td>
										<div className="admin-cell-actions">
											{!isDeleted && (
												<button type="button" className="admin-link-btn is-danger" onClick={() => removeHandler(twit)}>
													Remove
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
						onChange={(_e, p) => setPage(p)}
						shape="rounded"
						color="standard"
					/>
				</div>
			)}
		</div>
	);
};

export default withAdminLayout(AdminCommunity);
