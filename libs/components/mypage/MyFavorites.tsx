import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Book } from '../../types/book/book';
import { GET_FAVORITE_BOOKS } from '../../../apollo/user/query';
import { LIKE_TARGET_BOOK } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const PAGE_LIMIT = 10;

const formatCategory = (raw: string): string => {
	if (!raw) return '';
	return raw
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
};

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	const [likeTargetBook] = useMutation(LIKE_TARGET_BOOK);

	const { refetch: refetchFavorites } = useQuery(GET_FAVORITE_BOOKS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: PAGE_LIMIT } },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBooks(data?.getFavoriteBooks?.list ?? []);
			setTotal(data?.getFavoriteBooks?.metaCounter[0]?.total ?? 0);
		},
	});

	const paginationHandler = (_: T, value: number) => {
		setPage(value);
	};

	const likeBookHandler = async (e: React.MouseEvent, bookId: string) => {
		e.stopPropagation();
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetBook({ variables: { input: bookId } });
			await refetchFavorites({ input: { page, limit: PAGE_LIMIT } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') return <div>MY SAVED BOOKS MOBILE</div>;

	return (
		<div id="my-favorites-page">
			<Stack className="panel-header">
				<Typography className="panel-title">Saved Books</Typography>
				<Typography className="panel-subtitle">
					{total} book{total !== 1 ? 's' : ''} saved
				</Typography>
			</Stack>

			{books.length > 0 ? (
				<>
					<div className="bk-grid">
						{books.map((book) => {
							const cover = book.bookImages?.[0]
								? `${REACT_APP_API_URL}/${book.bookImages[0]}`
								: '/img/profile/defaultUser.svg';
							const isLiked = book.meLiked?.[0]?.myFavorite ?? false;
							return (
								<div
									key={book._id}
									className="bk-card"
									onClick={() => router.push(`/books/detail?id=${book._id}`)}
								>
									<div className="bk-card-top">
										<span className="bk-card-category">{formatCategory(book.bookCategory)}</span>
										<span
											className={`bk-card-badge${isLiked ? ' bk-card-badge--liked' : ''}`}
											onClick={(e) => likeBookHandler(e, book._id)}
										>
											{isLiked
												? <FavoriteIcon sx={{ fontSize: 14 }} />
												: <FavoriteBorderIcon sx={{ fontSize: 14 }} />
											}
											<span className="bk-card-likes">{book.bookLikes ?? 0}</span>
										</span>
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
								<Typography>Total {total} book{total !== 1 ? 's' : ''} saved</Typography>
							</Stack>
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
