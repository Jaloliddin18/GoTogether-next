import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Pagination from '@mui/material/Pagination';
import { useMutation, useQuery } from '@apollo/client';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_BOOK_INVENTORIES } from '../../../apollo/admin/query';
import {
	RREMOVE_BOOK_INVENTORY_BY_ADMIN,
	UPDATE_BOOK_INVENTORY,
	UPDATE_BOOK_INVENTORY_STATUS,
} from '../../../apollo/admin/mutation';
import {
	BookInventoryStatus,
	BookInventoryType,
	BookStorageZone,
} from '../../../libs/enums/book-inventory.enum';
import { BookInventory } from '../../../libs/types/book-inventory/book-inventory';
import { BookInventoriesInquiry } from '../../../libs/types/book-inventory/book-inventory.input';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { UpdateBookInventoryInput } from '../../../libs/types/book-inventory/book-inventory.update';

const PAGE_LIMIT = 10;

type StatusFilter = 'ALL' | BookInventoryStatus;
type TypeFilter = 'ALL' | BookInventoryType;
type ZoneFilter = 'ALL' | BookStorageZone;

interface QuantityDraft {
	bookTotalQuantity: string;
	bookReservedQuantity: string;
	bookBorrowedQuantity: string;
	bookSoldQuantity: string;
}

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

const stockSummary = (inventory: BookInventory): string => {
	const total = inventory.bookTotalQuantity ?? 0;
	const reserved = inventory.bookReservedQuantity ?? 0;
	const borrowed = inventory.bookBorrowedQuantity ?? 0;
	const sold = inventory.bookSoldQuantity ?? 0;
	return `T:${total} / R:${reserved} / B:${borrowed} / S:${sold}`;
};

const toNonNegativeInt = (raw: string): number => {
	const parsed = Number(raw);
	if (!Number.isFinite(parsed) || parsed < 0) return 0;
	return Math.floor(parsed);
};

const AdminInventory: NextPage = () => {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
	const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('ALL');
	const [searchDraft, setSearchDraft] = useState('');
	const [searchText, setSearchText] = useState('');
	const [editingId, setEditingId] = useState<string>('');
	const [qtyDraft, setQtyDraft] = useState<QuantityDraft>({
		bookTotalQuantity: '0',
		bookReservedQuantity: '0',
		bookBorrowedQuantity: '0',
		bookSoldQuantity: '0',
	});

	const inquiryInput = useMemo<BookInventoriesInquiry>(() => {
		const search: BookInventoriesInquiry['search'] = {};
		if (statusFilter !== 'ALL') search.bookInventoryStatus = statusFilter;
		if (typeFilter !== 'ALL') search.bookInventoryType = typeFilter;
		if (zoneFilter !== 'ALL') search.bookStorageZone = zoneFilter;
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: 'DESC',
			search,
		};
	}, [page, statusFilter, typeFilter, zoneFilter]);

	const { data, refetch } = useQuery(GET_BOOK_INVENTORIES, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [updateBookInventoryStatus] = useMutation(UPDATE_BOOK_INVENTORY_STATUS);
	const [updateBookInventory] = useMutation(UPDATE_BOOK_INVENTORY);
	const [removeBookInventoryByAdmin] = useMutation(RREMOVE_BOOK_INVENTORY_BY_ADMIN);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, typeFilter, zoneFilter]);

	const rawList: BookInventory[] = data?.getBookInventories?.list ?? [];
	const total: number = data?.getBookInventories?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const list = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) return rawList;
		return rawList.filter((inventory) => {
			return [inventory._id, inventory.bookId]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		});
	}, [rawList, searchText]);

	const statusChangeHandler = async (inventory: BookInventory, nextStatus: BookInventoryStatus) => {
		try {
			if (inventory.bookInventoryStatus === nextStatus) return;
			await updateBookInventoryStatus({
				variables: {
					input: {
						bookInventoryId: inventory._id,
						bookInventoryStatus: nextStatus,
					},
				},
			});
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert(`Status changed to ${titleize(nextStatus)}`);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const startEditHandler = (inventory: BookInventory) => {
		setEditingId(inventory._id);
		setQtyDraft({
			bookTotalQuantity: String(inventory.bookTotalQuantity ?? 0),
			bookReservedQuantity: String(inventory.bookReservedQuantity ?? 0),
			bookBorrowedQuantity: String(inventory.bookBorrowedQuantity ?? 0),
			bookSoldQuantity: String(inventory.bookSoldQuantity ?? 0),
		});
	};

	const saveQuantityHandler = async () => {
		try {
			if (!editingId) return;
			const input: UpdateBookInventoryInput = {
				_id: editingId,
				bookTotalQuantity: toNonNegativeInt(qtyDraft.bookTotalQuantity),
				bookReservedQuantity: toNonNegativeInt(qtyDraft.bookReservedQuantity),
				bookBorrowedQuantity: toNonNegativeInt(qtyDraft.bookBorrowedQuantity),
				bookSoldQuantity: toNonNegativeInt(qtyDraft.bookSoldQuantity),
			};
			await updateBookInventory({ variables: { input } });
			setEditingId('');
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Inventory quantities updated');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeHandler = async (inventory: BookInventory) => {
		try {
			const ok = await sweetConfirmAlert(`Remove inventory "${inventory._id}"? This cannot be undone.`);
			if (!ok) return;
			await removeBookInventoryByAdmin({ variables: { input: inventory._id } });
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Inventory removed');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Inventory</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by inventory ID or book ID"
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
					{Object.values(BookInventoryStatus).map((status) => (
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
					{Object.values(BookInventoryType).map((type) => (
						<option key={type} value={type}>
							{titleize(type)}
						</option>
					))}
				</select>
				<select
					className="admin-select"
					value={zoneFilter}
					onChange={(e) => setZoneFilter(e.target.value as ZoneFilter)}
				>
					<option value="ALL">All zones</option>
					{Object.values(BookStorageZone).map((zone) => (
						<option key={zone} value={zone}>
							{titleize(zone)}
						</option>
					))}
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 210 }}>Inventory ID</th>
							<th style={{ width: 210 }}>Book ID</th>
							<th style={{ width: 130 }}>Type</th>
							<th style={{ width: 190 }}>Zone</th>
							<th style={{ width: 190 }}>Status</th>
							<th>Quantity</th>
							<th style={{ width: 200 }}>Updated</th>
							<th style={{ width: 180, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{list.length === 0 && (
							<tr>
								<td colSpan={8}>
									<div style={{ padding: '32px 0', textAlign: 'center' }}>
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--muted" />
											No inventory found
										</span>
									</div>
								</td>
							</tr>
						)}
						{list.map((inventory) => {
							const isEditing = editingId === inventory._id;
							return (
								<tr key={inventory._id}>
									<td>
										<div className="admin-cell-title admin-mono">{inventory._id}</div>
									</td>
									<td>
										<div className="admin-cell-title admin-mono">{inventory.bookId}</div>
									</td>
									<td>{titleize(inventory.bookInventoryType)}</td>
									<td>{titleize(inventory.bookStorageZone)}</td>
									<td>
										<select
											className="admin-select"
											style={{ minWidth: 160 }}
											value={inventory.bookInventoryStatus}
											onChange={(e) =>
												statusChangeHandler(inventory, e.target.value as BookInventoryStatus)
											}
										>
											{Object.values(BookInventoryStatus).map((status) => (
												<option key={status} value={status}>
													{titleize(status)}
												</option>
											))}
										</select>
									</td>
									<td>
										{isEditing ? (
											<div
												style={{
													display: 'grid',
													gridTemplateColumns: 'repeat(4, minmax(64px, 1fr))',
													gap: '8px',
												}}
											>
												<input
													className="admin-input"
													type="number"
													min={0}
													value={qtyDraft.bookTotalQuantity}
													onChange={(e) =>
														setQtyDraft((prev) => ({ ...prev, bookTotalQuantity: e.target.value }))
													}
													title="Total"
												/>
												<input
													className="admin-input"
													type="number"
													min={0}
													value={qtyDraft.bookReservedQuantity}
													onChange={(e) =>
														setQtyDraft((prev) => ({ ...prev, bookReservedQuantity: e.target.value }))
													}
													title="Reserved"
												/>
												<input
													className="admin-input"
													type="number"
													min={0}
													value={qtyDraft.bookBorrowedQuantity}
													onChange={(e) =>
														setQtyDraft((prev) => ({ ...prev, bookBorrowedQuantity: e.target.value }))
													}
													title="Borrowed"
												/>
												<input
													className="admin-input"
													type="number"
													min={0}
													value={qtyDraft.bookSoldQuantity}
													onChange={(e) =>
														setQtyDraft((prev) => ({ ...prev, bookSoldQuantity: e.target.value }))
													}
													title="Sold"
												/>
											</div>
										) : (
											<>
												<div className="admin-cell-title">{stockSummary(inventory)}</div>
												<div className="admin-cell-meta">
													Available:{' '}
													{Math.max(
														0,
														(inventory.bookTotalQuantity ?? 0) -
															(inventory.bookReservedQuantity ?? 0) -
															(inventory.bookBorrowedQuantity ?? 0) -
															(inventory.bookSoldQuantity ?? 0),
													)}
												</div>
											</>
										)}
									</td>
									<td className="admin-cell-meta">{formatDate(inventory.updatedAt)}</td>
									<td>
										<div className="admin-cell-actions">
											{isEditing ? (
												<>
													<button type="button" className="admin-link-btn" onClick={saveQuantityHandler}>
														Save
													</button>
													<button
														type="button"
														className="admin-link-btn is-muted"
														onClick={() => setEditingId('')}
													>
														Cancel
													</button>
												</>
											) : (
												<>
													<button
														type="button"
														className="admin-link-btn"
														onClick={() => startEditHandler(inventory)}
													>
														Edit Qty
													</button>
													<button
														type="button"
														className="admin-link-btn is-danger"
														onClick={() => removeHandler(inventory)}
													>
														Remove
													</button>
												</>
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
		</div>
	);
};

export default withAdminLayout(AdminInventory);
