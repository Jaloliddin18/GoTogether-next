import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import Pagination from '@mui/material/Pagination';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_BOOKS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_BOOK_BY_ADMIN, UPDATE_BOOK } from '../../../apollo/admin/mutation';
import { BookCategory, BookStatus } from '../../../libs/enums/book.enum';
import { API_BASE_URL } from '../../../libs/config';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../../libs/sweetAlert';
import { Book } from '../../../libs/types/book/book';
import { T } from '../../../libs/types/common';
import AddInventoryModal from '../../../libs/components/admin/books/AddInventoryModal';

const PAGE_LIMIT = 10;

const titleize = (raw?: string): string => {
	if (!raw) return '—';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const bookStatusVariant = (s: BookStatus | string): string => {
	if (s === BookStatus.ACTIVE) return 'success';
	if (s === BookStatus.HIDDEN) return 'warning';
	if (s === BookStatus.SOLD) return 'info';
	if (s === BookStatus.DELETED) return 'danger';
	return 'muted';
};

const resolveCover = (book: Book): string | null => {
	const raw = book.bookImages?.[0];
	if (!raw) return null;
	if (raw.startsWith('http')) return raw;
	return `${API_BASE_URL}/${raw}`;
};

const formatPrice = (book: Book): string => {
	if (!book.bookPrice) return '—';
	const currency = book.bookPrice.currency ?? 'KRW';
	const amount = book.bookPrice.amount?.toLocaleString() ?? '0';
	if (currency === 'KRW') return `₩ ${amount}`;
	if (currency === 'USD') return `$ ${amount}`;
	return `${amount} ${currency}`;
};

const AdminBooks: NextPage = () => {
	const [page, setPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [searchTextDraft, setSearchTextDraft] = useState('');
	const [statusFilter, setStatusFilter] = useState<'ALL' | BookStatus>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<'ALL' | BookCategory>('ALL');
	const [inventoryBook, setInventoryBook] = useState<Book | null>(null);

	const inquiryInput = useMemo(() => {
		const search: T = {};
		if (statusFilter !== 'ALL') search.bookStatus = statusFilter;
		if (categoryFilter !== 'ALL') search.bookCategoryList = [categoryFilter];
		return {
			page,
			limit: PAGE_LIMIT,
			sort: 'createdAt',
			direction: 'DESC',
			search,
		};
	}, [page, statusFilter, categoryFilter]);

	const { data, refetch } = useQuery(GET_ALL_BOOKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiryInput },
		notifyOnNetworkStatusChange: true,
	});

	const [updateBook] = useMutation(UPDATE_BOOK);
	const [removeBookByAdmin] = useMutation(REMOVE_BOOK_BY_ADMIN);

	const rawList: Book[] = data?.getAllBooksByAdmin?.list ?? [];
	const total: number = data?.getAllBooksByAdmin?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

	const list = useMemo<Book[]>(() => {
		const q = searchText.trim().toLowerCase();
		if (!q) return rawList;
		return rawList.filter((b) =>
			[b.bookTitle, b.bookAuthor, b.bookIsbn, b.bookCallNumber]
				.filter(Boolean)
				.some((v: any) => String(v).toLowerCase().includes(q)),
		);
	}, [rawList, searchText]);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, categoryFilter]);

	const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') setSearchText(searchTextDraft);
	};

	const toggleStatusHandler = async (book: Book) => {
		try {
			const nextStatus = book.bookStatus === BookStatus.ACTIVE ? BookStatus.HIDDEN : BookStatus.ACTIVE;
			await updateBook({ variables: { input: { _id: book._id, bookStatus: nextStatus } } });
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert(`Status changed to ${titleize(nextStatus)}`);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const deleteHandler = async (book: Book) => {
		try {
			const ok = await sweetConfirmAlert(`Delete "${book.bookTitle}"? This cannot be undone.`);
			if (!ok) return;
			await updateBook({ variables: { input: { _id: book._id, bookStatus: BookStatus.DELETED } } });
			await removeBookByAdmin({ variables: { input: book._id } });
			await refetch({ input: inquiryInput });
			await sweetMixinSuccessAlert('Book deleted');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-page-header">
				<div>
					<h1 className="admin-page-title">Books</h1>
					<div className="admin-page-sub">{total.toLocaleString()} total</div>
				</div>
				<Link href="/_admin/books/create" legacyBehavior>
					<a className="admin-btn admin-btn--primary">+ Add Book</a>
				</Link>
			</div>

			<div className="admin-filters">
				<input
					className="admin-input is-search"
					placeholder="Search by title, author, ISBN, call number"
					value={searchTextDraft}
					onChange={(e) => setSearchTextDraft(e.target.value)}
					onKeyDown={onSearchKey}
				/>
				<select
					className="admin-select"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as any)}
				>
					<option value="ALL">All statuses</option>
					{Object.values(BookStatus).map((s) => (
						<option key={s} value={s}>
							{titleize(s)}
						</option>
					))}
				</select>
				<select
					className="admin-select"
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value as any)}
				>
					<option value="ALL">All categories</option>
					{Object.values(BookCategory).map((c) => (
						<option key={c} value={c}>
							{titleize(c)}
						</option>
					))}
				</select>
			</div>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 64 }}></th>
							<th>Title</th>
							<th style={{ width: 180 }}>Category</th>
							<th style={{ width: 140 }}>Status</th>
							<th style={{ width: 120 }}>Price</th>
							<th style={{ width: 220, textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{list.length === 0 && (
							<tr>
								<td colSpan={6}>
									<div style={{ padding: '32px 0', textAlign: 'center' }}>
										<span className="admin-status">
											<span className="admin-status-dot admin-status-dot--muted" />
											No books found
										</span>
									</div>
								</td>
							</tr>
						)}
						{list.map((book) => {
							const cover = resolveCover(book);
							return (
								<tr key={book._id}>
									<td>
										{cover ? (
											<img className="admin-cover-thumb" src={cover} alt={book.bookTitle} />
										) : (
											<div className="admin-cover-thumb" />
										)}
									</td>
									<td>
										<div className="admin-cell-title">{book.bookTitle}</div>
										<div className="admin-cell-meta">{book.bookAuthor}</div>
									</td>
									<td>{titleize(book.bookCategory)}</td>
									<td>
										<span className="admin-status">
											<span className={`admin-status-dot admin-status-dot--${bookStatusVariant(book.bookStatus)}`} />
											{titleize(book.bookStatus)}
										</span>
									</td>
									<td>{formatPrice(book)}</td>
									<td>
										<div className="admin-cell-actions">
											<Link href={`/_admin/books/edit?id=${book._id}`} legacyBehavior>
												<a className="admin-link-btn">Edit</a>
											</Link>
											<button
												type="button"
												className="admin-link-btn"
												onClick={() => setInventoryBook(book)}
											>
												Add Inventory
											</button>
											<button
												type="button"
												className="admin-link-btn is-muted"
												onClick={() => toggleStatusHandler(book)}
											>
												{book.bookStatus === BookStatus.ACTIVE ? 'Hide' : 'Activate'}
											</button>
											<button type="button" className="admin-link-btn is-danger" onClick={() => deleteHandler(book)}>
												Delete
											</button>
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

			{inventoryBook && (
				<AddInventoryModal
					book={inventoryBook}
					onClose={() => setInventoryBook(null)}
					onSuccess={() => refetch({ input: inquiryInput })}
				/>
			)}
		</div>
	);
};

export default withAdminLayout(AdminBooks);
