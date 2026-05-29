import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Book } from '../../types/book/book';
import { GET_VISITED_BOOKS } from '../../../apollo/user/query';
import { API_BASE_URL } from '../../config';

const PAGE_LIMIT = 10;

const formatCategory = (raw: string): string => {
	if (!raw) return '';
	return raw
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (iso: string | Date) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	const { data: visitedBooksData } = useQuery(GET_VISITED_BOOKS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		setBooks(visitedBooksData?.getVisitedBooks?.list ?? []);
		setTotal(visitedBooksData?.getVisitedBooks?.metaCounter[0]?.total ?? 0);
	}, [visitedBooksData]);

	const paginationHandler = (_: T, value: number) => {
		setPage(value);
	};

	if (device === 'mobile') return <div>RECENTLY VIEWED MOBILE</div>;

	return (
		<div id="recently-visited-page">
			<Stack className="panel-header">
				<Typography className="panel-title">Recently Viewed</Typography>
				<Typography className="panel-subtitle">
					{total} book{total !== 1 ? 's' : ''} browsed
				</Typography>
			</Stack>

			{books.length > 0 ? (
				<>
					<div className="bk-grid">
						{books.map((book) => {
							const cover = book.bookImages?.[0]
								? `${API_BASE_URL}/${book.bookImages[0]}`
								: '/img/profile/defaultUser.svg';
							return (
								<div
									key={book._id}
									className="bk-card"
									onClick={() => router.push(`/books/detail?id=${book._id}`)}
								>
									<div className="bk-card-top">
										<span className="bk-card-category">{formatCategory(book.bookCategory)}</span>
										<span className="bk-card-date">{formatDate(book.updatedAt)}</span>
									</div>
									<div className="bk-card-image">
										<img src={cover} alt={book.bookTitle} />
									</div>
									<div className="bk-card-body">
										<Typography className="bk-card-title" title={book.bookTitle}>
											{book.bookTitle}
										</Typography>
										<Typography className="bk-card-author">{book.bookAuthor}</Typography>
									</div>
								</div>
							);
						})}
					</div>

					{total > PAGE_LIMIT && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(total / PAGE_LIMIT)}
									page={page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>Total {total} book{total !== 1 ? 's' : ''} browsed</Typography>
							</Stack>
						</Stack>
					)}
				</>
			) : (
				<Stack className="empty-state">
					<HistoryIcon className="empty-icon" />
					<Typography className="empty-heading">No recently viewed books</Typography>
					<Typography className="empty-body">Books you browse will appear here.</Typography>
				</Stack>
			)}
		</div>
	);
};

export default RecentlyVisited;
