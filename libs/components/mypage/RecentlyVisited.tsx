import React, { useState } from 'react';
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
import { REACT_APP_API_URL } from '../../config';

const PAGE_LIMIT = 6;

const formatDate = (iso: string | Date) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	/** APOLLO **/
	useQuery(GET_VISITED_BOOKS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBooks(data?.getVisitedBooks?.list ?? []);
			setTotal(data?.getVisitedBooks?.metaCounter[0]?.total ?? 0);
		},
	});

	if (device === 'mobile') return <div>RECENTLY VIEWED MOBILE</div>;

	return (
		<div id="recently-visited-page">
			<Stack className="panel-header">
				<Typography className="panel-title">Recently Viewed</Typography>
				<Typography className="panel-subtitle">{total} book{total !== 1 ? 's' : ''} browsed</Typography>
			</Stack>

			{books.length > 0 ? (
				<>
					<div className="viewed-list">
						{books.map((book) => {
							const cover = book.bookImages?.[0]
								? `${REACT_APP_API_URL}/${book.bookImages[0]}`
								: '/img/profile/defaultUser.svg';
							return (
								<div key={book._id} className="viewed-row">
									<div className="viewed-cover">
										<img src={cover} alt={book.bookTitle} />
									</div>
									<div className="viewed-content">
										<Typography className="viewed-title">{book.bookTitle}</Typography>
										<Typography className="viewed-author">{book.bookAuthor}</Typography>
										<span className="viewed-category">{book.bookCategory}</span>
									</div>
									<div className="viewed-meta">
										<Typography className="viewed-date-label">Viewed</Typography>
										<Typography className="viewed-date">{formatDate(book.updatedAt)}</Typography>
									</div>
									<div className="viewed-action">
										<button className="view-again-btn" onClick={() => router.push(`/books/${book._id}`)}>
											View Again
										</button>
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
					<HistoryIcon className="empty-icon" />
					<Typography className="empty-heading">No recently viewed books</Typography>
					<Typography className="empty-body">Books you browse will appear here.</Typography>
				</Stack>
			)}
		</div>
	);
};

export default RecentlyVisited;
