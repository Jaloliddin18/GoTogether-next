import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Pagination from '@mui/material/Pagination';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { API_BASE_URL } from '../../../libs/config';
import { Direction } from '../../../libs/enums/common.enum';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Member } from '../../../libs/types/member/member';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import AdminTableSkeletonRows from '../../../libs/components/common/AdminTableSkeletonRows';

const PAGE_LIMIT = 10;

type StatusFilter = 'ALL' | MemberStatus;
type TypeFilter = 'ALL' | MemberType;

const titleize = (raw?: string): string => {
	if (!raw) return '—';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | Date): string => {
	if (!value) return '—';
	return new Date(value).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const resolveAvatar = (memberImage?: string): string => {
	if (!memberImage) return '/img/profile/defaultUser.svg';
	if (memberImage.startsWith('http')) return memberImage;
	return `${API_BASE_URL}/${memberImage}`;
};

const typeBadgeClass = (type?: MemberType): string => {
	if (type === MemberType.USER) return 'badge badge-user';
	if (type === MemberType.ADMIN) return 'badge badge-admin';
	return 'badge';
};

const statusBadgeClass = (status?: MemberStatus): string => {
	if (status === MemberStatus.ACTIVE) return 'badge badge-active';
	if (status === MemberStatus.BLOCK) return 'badge badge-block';
	if (status === MemberStatus.DELETE) return 'badge badge-delete';
	return 'badge';
};

const AdminUsers: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');
	const [updatingMemberId, setUpdatingMemberId] = useState('');

	const inquiryInput = useMemo<MembersInquiry>(() => {
		const search: MembersInquiry['search'] = {};
		if (statusFilter !== 'ALL') search.memberStatus = statusFilter;
		if (typeFilter !== 'ALL') search.memberType = typeFilter;
		if (searchText.trim()) search.text = searchText.trim();
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: Direction.DESC,
			search,
		};
	}, [page, statusFilter, typeFilter, searchText]);

	const { loading, data, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [updateMemberByAdmin, { loading: updateMemberByAdminLoading }] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, typeFilter, searchText]);

	const list: Member[] = data?.getAllMembersByAdmin?.list ?? [];
	const total: number = data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const updateMemberHandler = async (memberId: string, patch: MemberUpdate) => {
		try {
			setUpdatingMemberId(memberId);
			await updateMemberByAdmin({
				variables: {
					input: {
						_id: memberId,
						...patch,
					},
				},
			});
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Member updated');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setUpdatingMemberId('');
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Members</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by nickname, full name, phone"
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
					{Object.values(MemberStatus).map((status) => (
						<option key={status} value={status}>
							{titleize(status)}
						</option>
					))}
				</select>
				<select
					className="admin-select"
					value={typeFilter}
					onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
				>
					<option value="ALL">All types</option>
					{Object.values(MemberType).map((type) => (
						<option key={type} value={type}>
							{titleize(type)}
						</option>
					))}
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table admin-members-table">
					<thead>
						<tr>
							<th style={{ width: 300 }}>Member</th>
							<th style={{ width: 150 }}>Phone</th>
							<th style={{ width: 120 }}>Type</th>
							<th style={{ width: 120 }}>Status</th>
							<th style={{ width: 90 }}>Warnings</th>
							<th style={{ width: 90 }}>Blocks</th>
							<th style={{ width: 120 }}>Joined</th>
							<th style={{ width: 270, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading && <AdminTableSkeletonRows columnCount={8} />}
						{!loading && list.length === 0 && (
							<tr>
								<td colSpan={8} className="admin-empty-row">
									No members found
								</td>
							</tr>
						)}
						{!loading && list.map((member) => {
							const isUpdating = updatingMemberId === member._id || updateMemberByAdminLoading;
							return (
								<tr key={member._id}>
									<td>
										<div className="admin-member-cell">
											<img
												className="admin-member-avatar"
												src={resolveAvatar(member.memberImage)}
												alt={member.memberNick}
											/>
											<div>
												<Link href={`/member/${member._id}`} legacyBehavior>
													<a className="admin-member-name">{member.memberNick}</a>
												</Link>
												<div className="admin-cell-meta">{member.memberFullName || '—'}</div>
												<div className="admin-cell-meta admin-mono">{member._id}</div>
											</div>
										</div>
									</td>
									<td>{member.memberPhone || '—'}</td>
									<td>
										<span className={typeBadgeClass(member.memberType)}>{member.memberType}</span>
									</td>
									<td>
										<span className={statusBadgeClass(member.memberStatus)}>{member.memberStatus}</span>
									</td>
									<td>{member.memberWarnings ?? 0}</td>
									<td>{member.memberBlocks ?? 0}</td>
									<td>{formatDate(member.createdAt)}</td>
									<td>
										<div className="admin-cell-actions">
											<select
												className="admin-select"
												style={{ minWidth: 100 }}
												value={member.memberType}
												disabled={isUpdating}
												onChange={(e) => {
													const nextType = e.target.value as MemberType;
													if (nextType === member.memberType) return;
													updateMemberHandler(member._id, { _id: member._id, memberType: nextType }).then();
												}}
											>
												{Object.values(MemberType).map((type) => (
													<option key={type} value={type}>
														{titleize(type)}
													</option>
												))}
											</select>
											<select
												className="admin-select"
												style={{ minWidth: 110 }}
												value={member.memberStatus}
												disabled={isUpdating}
												onChange={(e) => {
													const nextStatus = e.target.value as MemberStatus;
													if (nextStatus === member.memberStatus) return;
													updateMemberHandler(member._id, { _id: member._id, memberStatus: nextStatus }).then();
												}}
											>
												{Object.values(MemberStatus).map((status) => (
													<option key={status} value={status}>
														{titleize(status)}
													</option>
												))}
											</select>
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
						onChange={(_event, value) => setPage(value)}
						shape="rounded"
						color="standard"
					/>
				</div>
			)}
		</div>
	);
};

export default withAdminLayout(AdminUsers);
