import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_REQUESTS } from '../../../apollo/admin/query';
import { UPDATE_REQUEST_STATUS } from '../../../apollo/admin/mutation';
import {
	DeliveryDestinationType,
	PaymentStatus,
	RequestErrorCode,
	RequestStatus,
	RequestType,
} from '../../../libs/enums/request.enum';
import { RequestTask } from '../../../libs/types/request/request';
import { RequestsInquiry } from '../../../libs/types/request/request.input';
import { UpdateRequestStatusInput } from '../../../libs/types/request/request.update';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';

const PAGE_LIMIT = 10;

const TERMINAL_STATUSES: ReadonlySet<RequestStatus> = new Set([
	RequestStatus.COMPLETED,
	RequestStatus.CANCELLED,
	RequestStatus.FAILED,
]);

type StatusFilter = 'ALL' | RequestStatus;
type TypeFilter = 'ALL' | RequestType;
type PaymentFilter = 'ALL' | PaymentStatus;
type DestinationFilter = 'ALL' | DeliveryDestinationType;

const REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
	[RequestStatus.QUEUED]: [RequestStatus.ASSIGNED, RequestStatus.CANCELLED, RequestStatus.FAILED],
	[RequestStatus.ASSIGNED]: [RequestStatus.DISPATCHED, RequestStatus.CANCELLED, RequestStatus.FAILED],
	[RequestStatus.DISPATCHED]: [RequestStatus.NAVIGATING_TO_SHELF, RequestStatus.CANCELLED, RequestStatus.FAILED],
	[RequestStatus.NAVIGATING_TO_SHELF]: [RequestStatus.ARRIVED_AT_SHELF, RequestStatus.FAILED],
	[RequestStatus.ARRIVED_AT_SHELF]: [RequestStatus.VERIFYING_BOOK, RequestStatus.FAILED],
	[RequestStatus.VERIFYING_BOOK]: [RequestStatus.BOOK_FOUND, RequestStatus.BOOK_NOT_FOUND, RequestStatus.FAILED],
	[RequestStatus.BOOK_FOUND]: [RequestStatus.PICKING_UP, RequestStatus.FAILED],
	[RequestStatus.BOOK_NOT_FOUND]: [RequestStatus.FAILED],
	[RequestStatus.PICKING_UP]: [RequestStatus.DELIVERING, RequestStatus.FAILED],
	[RequestStatus.DELIVERING]: [RequestStatus.ARRIVED_AT_STUDENT, RequestStatus.FAILED],
	[RequestStatus.ARRIVED_AT_STUDENT]: [RequestStatus.READY, RequestStatus.FAILED],
	[RequestStatus.READY]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED, RequestStatus.FAILED],
	[RequestStatus.COMPLETED]: [],
	[RequestStatus.FAILED]: [],
	[RequestStatus.CANCELLED]: [],
};

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

const statusVariant = (status: RequestStatus): 'success' | 'warning' | 'danger' | 'primary' | 'muted' => {
	if (status === RequestStatus.COMPLETED || status === RequestStatus.READY) return 'success';
	if (status === RequestStatus.FAILED || status === RequestStatus.CANCELLED || status === RequestStatus.BOOK_NOT_FOUND)
		return 'danger';
	if (status === RequestStatus.QUEUED || status === RequestStatus.ASSIGNED) return 'warning';
	if (status === RequestStatus.DELIVERING || status === RequestStatus.DISPATCHED) return 'primary';
	return 'muted';
};

const latestTimelineMessage = (request: RequestTask): string => {
	if (!request.timeline?.length) return '-';
	const latest = request.timeline[request.timeline.length - 1];
	return latest.message ?? titleize(latest.status);
};

const buildUpdateMessage = (status: RequestStatus, paymentStatus?: PaymentStatus): string => {
	if (paymentStatus) return `Admin updated payment to ${titleize(paymentStatus)}`;
	return `Admin updated request to ${titleize(status)}`;
};

const AdminRequests: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');
	const [destinationFilter, setDestinationFilter] = useState<DestinationFilter>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');
	const [mutatingId, setMutatingId] = useState('');

	// Status modal state
	const [modalRequest, setModalRequest] = useState<RequestTask | null>(null);
	const [modalNextStatus, setModalNextStatus] = useState<string>('');
	const [modalMessage, setModalMessage] = useState<string>('');
	const [modalSubmitting, setModalSubmitting] = useState(false);

	const inquiryInput = useMemo<RequestsInquiry>(() => {
		const search: RequestsInquiry['search'] = {};
		if (statusFilter !== 'ALL') search.status = statusFilter;
		if (typeFilter !== 'ALL') search.requestType = typeFilter;
		if (paymentFilter !== 'ALL') search.paymentStatus = paymentFilter;
		if (destinationFilter !== 'ALL') search.destinationType = destinationFilter;
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: 'DESC',
			search,
		};
	}, [page, statusFilter, typeFilter, paymentFilter, destinationFilter]);

	const { data, refetch } = useQuery(GET_REQUESTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [updateRequestStatus] = useMutation(UPDATE_REQUEST_STATUS);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, typeFilter, paymentFilter, destinationFilter]);

	const rawList: RequestTask[] = data?.getRequests?.list ?? [];
	const total: number = data?.getRequests?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const list = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) return rawList;
		return rawList.filter((request) =>
			[request._id, request.bookId, request.memberId, request.robotId, request.memberData?.memberNick, request.bookData?.bookTitle]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query)),
		);
	}, [rawList, searchText]);

	const openStatusModal = (request: RequestTask) => {
		setModalRequest(request);
		setModalNextStatus('');
		setModalMessage('');
	};

	const closeModal = () => {
		setModalRequest(null);
		setModalNextStatus('');
		setModalMessage('');
	};

	const executeStatusUpdate = async (request: RequestTask, nextStatus: RequestStatus, paymentStatus?: PaymentStatus, customMessage?: string): Promise<boolean> => {
		try {
			setMutatingId(request._id);
			const input: UpdateRequestStatusInput = {
				requestId: request._id,
				status: nextStatus,
				message: customMessage ?? buildUpdateMessage(nextStatus, paymentStatus),
				...(paymentStatus ? { paymentStatus } : {}),
			};
			if (nextStatus === RequestStatus.FAILED && request.error?.code) {
				input.errorCode = request.error.code as RequestErrorCode;
			}
			await updateRequestStatus({ variables: { input } });
			await refetch({ input: inquiryInput });
			return true;
		} catch (err: any) {
			sweetErrorHandling(err).then();
			return false;
		} finally {
			setMutatingId('');
		}
	};

	const handleModalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!modalRequest || !modalNextStatus) return;
		setModalSubmitting(true);
		const ok = await executeStatusUpdate(
			modalRequest,
			modalNextStatus as RequestStatus,
			undefined,
			modalMessage.trim() || undefined,
		);
		setModalSubmitting(false);
		if (ok) {
			closeModal();
			await sweetMixinSuccessAlert('Request updated');
		}
	};

	const handleMarkPaid = async (request: RequestTask) => {
		const ok = await executeStatusUpdate(request, request.status, PaymentStatus.PAID);
		if (ok) await sweetMixinSuccessAlert('Marked as paid');
	};

	const modalAllowedTransitions = modalRequest ? (REQUEST_TRANSITIONS[modalRequest.status] ?? []) : [];

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Requests</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by request, member, robot, or book"
					value={searchDraft}
					onChange={(e) => setSearchDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setSearchText(searchDraft);
							setPage(1);
						}
					}}
				/>
				<select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
					<option value="ALL">All statuses</option>
					{Object.values(RequestStatus).map((status) => (
						<option key={status} value={status}>{titleize(status)}</option>
					))}
				</select>
				<select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
					<option value="ALL">All types</option>
					{Object.values(RequestType).map((type) => (
						<option key={type} value={type}>{titleize(type)}</option>
					))}
				</select>
				<select className="admin-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}>
					<option value="ALL">All payments</option>
					{Object.values(PaymentStatus).map((status) => (
						<option key={status} value={status}>{titleize(status)}</option>
					))}
				</select>
				<select className="admin-select" value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value as DestinationFilter)}>
					<option value="ALL">All destinations</option>
					{Object.values(DeliveryDestinationType).map((destination) => (
						<option key={destination} value={destination}>{titleize(destination)}</option>
					))}
				</select>
			</div>

			<div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
				<table className="admin-table" style={{ minWidth: 1200 }}>
					<thead>
						<tr>
							<th style={{ width: 180 }}>Request</th>
							<th style={{ width: 130 }}>Member</th>
							<th style={{ width: 180 }}>Book</th>
							<th style={{ width: 100 }}>Robot</th>
							<th style={{ width: 90 }}>Type</th>
							<th style={{ width: 150 }}>Status</th>
							<th style={{ width: 100 }}>Payment</th>
							<th style={{ width: 150 }}>Updated</th>
							<th style={{ width: 160, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{list.length === 0 && (
							<tr>
								<td colSpan={9}>
									<div style={{ padding: '32px 0', textAlign: 'center' }}>
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--muted" />
											No requests found
										</span>
									</div>
								</td>
							</tr>
						)}
						{list.map((request) => {
							const isTerminal = TERMINAL_STATUSES.has(request.status);
							const isBusy = mutatingId === request._id;
							const canMarkPaid =
								request.requestType === RequestType.PURCHASE &&
								![PaymentStatus.PAID, PaymentStatus.CANCELLED, PaymentStatus.REFUNDED].includes(request.paymentStatus);

							return (
								<tr key={request._id}>
									<td style={{ maxWidth: 180 }}>
										<div
											className="admin-cell-title admin-mono"
											style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
										>
											{request._id}
										</div>
										<div className="admin-cell-meta">{latestTimelineMessage(request)}</div>
										{request.error?.message && (
											<div className="admin-cell-meta" style={{ color: '#D14343' }}>
												{request.error.message}
											</div>
										)}
									</td>
									<td>
										<div className="admin-cell-title">{request.memberData?.memberNick ?? '—'}</div>
									</td>
									<td>
										<div className="admin-cell-title">{request.bookData?.bookTitle ?? '—'}</div>
									</td>
									<td>
										<div className="admin-cell-title admin-mono" style={{ fontSize: 11 }}>
											{request.robotData?.robotId ?? '-'}
										</div>
									</td>
									<td>{titleize(request.requestType)}</td>
									<td>
										<span className="admin-status">
											<span className={`admin-status-dot admin-status-dot--${statusVariant(request.status)}`} />
											{titleize(request.status)}
										</span>
									</td>
									<td>{titleize(request.paymentStatus)}</td>
									<td className="admin-cell-meta">{formatDate(request.updatedAt)}</td>
									<td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
										<div className="admin-cell-actions" style={{ justifyContent: 'flex-end' }}>
											{isTerminal ? (
												<span className="admin-request-final-badge">Final</span>
											) : (
												<button
													type="button"
													className="admin-btn admin-btn--ghost admin-btn--sm"
													disabled={isBusy}
													onClick={() => openStatusModal(request)}
												>
													Set status
												</button>
											)}
											{canMarkPaid && (
												<button
													type="button"
													className="admin-link-btn"
													disabled={isBusy}
													onClick={() => handleMarkPaid(request)}
												>
													Mark Paid
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

			{/* Set status modal */}
			{modalRequest && (
				<div className="admin-modal-overlay" onClick={closeModal}>
					<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2 className="admin-modal-title">Update Request Status</h2>
							<button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">✕</button>
						</div>
						<form onSubmit={handleModalSubmit}>
							<div className="admin-modal-body">
								<div className="admin-field">
									<label className="admin-field-label">Request ID</label>
									<input className="admin-input admin-mono" value={modalRequest._id} readOnly style={{ fontSize: 12 }} />
								</div>
								<div className="admin-field">
									<label className="admin-field-label">Current Status</label>
									<span className="admin-status" style={{ display: 'inline-flex', padding: '6px 0' }}>
										<span className={`admin-status-dot admin-status-dot--${statusVariant(modalRequest.status)}`} />
										{titleize(modalRequest.status)}
									</span>
								</div>
								<div className="admin-field">
									<label className="admin-field-label">New Status</label>
									<select
										className="admin-select"
										value={modalNextStatus}
										onChange={(e) => setModalNextStatus(e.target.value)}
										required
									>
										<option value="">— select —</option>
										{modalAllowedTransitions.map((status) => (
											<option key={status} value={status}>{titleize(status)}</option>
										))}
									</select>
								</div>
								<div className="admin-field">
									<label className="admin-field-label">Message (optional)</label>
									<input
										className="admin-input"
										placeholder="Leave blank for default message"
										value={modalMessage}
										onChange={(e) => setModalMessage(e.target.value)}
									/>
								</div>
							</div>
							<div className="admin-modal-footer">
								<button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal} disabled={modalSubmitting}>
									Cancel
								</button>
								<button
									type="submit"
									className="admin-btn admin-btn--primary"
									disabled={modalSubmitting || !modalNextStatus}
								>
									{modalSubmitting ? 'Updating…' : 'Update'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default withAdminLayout(AdminRequests);
