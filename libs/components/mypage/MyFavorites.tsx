import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Book } from '../../types/book/book';
import { GET_FAVORITE_BOOKS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';

const PAGE_LIMIT = 6;

const SavedBookCard = ({ book }: { book: Book }) => {
	const router = useRouter();
	const cover = book.bookImages?.[0]
		? `${REACT_APP_API_URL}/${book.bookImages[0]}`
		: '/img/profile/defaultUser.svg';

	return (
		<div className="saved-book-card">
			<div className="saved-book-cover">
				<img src={cover} alt={book.bookTitle} />
				<div className="saved-book-heart">
					<FavoriteIcon sx={{ fontSize: 16 }} />
				</div>
			</div>
			<div className="saved-book-body">
				<span className="saved-book-category">{book.bookCategory}</span>
				<Typography className="saved-book-title" title={book.bookTitle}>{book.bookTitle}</Typography>
				<Typography className="saved-book-author">{book.bookAuthor}</Typography>
			</div>
			<div className="saved-book-footer">
				<button className="saved-book-view-btn" onClick={() => router.push(`/books/${book._id}`)}>
					View Book
				</button>
			</div>
		</div>
	);
};

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	/** APOLLO **/
	useQuery(GET_FAVORITE_BOOKS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBooks(data?.getFavoriteBooks?.list ?? []);
			setTotal(data?.getFavoriteBooks?.metaCounter[0]?.total ?? 0);
		},
	});

	if (device === 'mobile') return <div>MY SAVED BOOKS MOBILE</div>;

	return (
		<div id="my-favorites-page">
			<Stack className="panel-header">
				<Typography className="panel-title">Saved Books</Typography>
				<Typography className="panel-subtitle">{total} book{total !== 1 ? 's' : ''} saved</Typography>
			</Stack>

			{books.length > 0 ? (
				<>
					<div className="saved-books-grid">
						{books.map((book) => (
							<SavedBookCard key={book._id} book={book} />
						))}
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
					<BookmarkIcon className="empty-icon" />
					<Typography className="empty-heading">No saved books yet</Typography>
					<Typography className="empty-body">Books you like will appear here for quick access.</Typography>
				</Stack>
			)}
		</div>
	);
};

export default MyFavorites;
