import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Pagination,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { Direction } from '../../../libs/enums/common.enum';
import { REACT_APP_API_URL } from '../../../libs/config';
import { GET_BOOKS } from '../../../apollo/library/query';

const BOOKS_PER_PAGE = 12;

interface BookSearchInput {
	keyword?: string;
}

interface BooksInquiryInput {
	page: number;
	limit: number;
	sort: string;
	direction: Direction;
	search?: BookSearchInput;
}

interface BookListItem {
	_id: string;
	bookTitle: string;
	bookAuthor: string;
	bookIsbn: string;
	bookImages: string[];
	bookCategory: string;
	bookStatus: string;
	isBorrowable: boolean;
	isPurchasable: boolean;
	bookPrice: {
		amount: number;
		currency: string;
		discountPercent?: number;
		isDiscounted: boolean;
	};
	bookRating: {
		average: number;
		count: number;
	};
	bookLikes: number;
	bookViews: number;
	bookRank: number;
	createdAt: string;
}

interface GetBooksData {
	getBooks: {
		list: BookListItem[];
		metaCounter?: Array<{ total: number }>;
	};
}

interface GetBooksVariables {
	input: BooksInquiryInput;
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const LibraryBooksPage: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const [searchInput, setSearchInput] = useState('');
	const [inquiry, setInquiry] = useState<BooksInquiryInput>({
		page: 1,
		limit: BOOKS_PER_PAGE,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	useEffect(() => {
		if (!router.isReady) return;

		const queryPage = Array.isArray(router.query.page) ? router.query.page[0] : router.query.page;
		const parsedPage = queryPage ? Math.max(1, Number(queryPage) || 1) : 1;
		const queryKeyword = Array.isArray(router.query.keyword) ? router.query.keyword[0] : router.query.keyword;
		const keyword = queryKeyword?.trim() ?? '';

		setSearchInput(keyword);
		setInquiry({
			page: parsedPage,
			limit: BOOKS_PER_PAGE,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: keyword ? { keyword } : {},
		});
	}, [router.isReady, router.query.page, router.query.keyword]);

	const { loading, error, data } = useQuery<GetBooksData, GetBooksVariables>(GET_BOOKS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { input: inquiry },
	});

	const books = data?.getBooks?.list ?? [];
	const total = data?.getBooks?.metaCounter?.[0]?.total ?? 0;
	const pageCount = useMemo(() => Math.max(1, Math.ceil(total / inquiry.limit)), [total, inquiry.limit]);

	const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchInput(event.target.value);
	};

	const searchHandler = async () => {
		const keyword = searchInput.trim();
		const query = { ...(keyword ? { keyword } : {}), page: 1 };
		await router.push({ pathname: '/library/books', query }, undefined, { shallow: true });
	};

	const paginationHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		const currentKeyword = searchInput.trim();
		const query = { ...(currentKeyword ? { keyword: currentKeyword } : {}), page: value };
		await router.push({ pathname: '/library/books', query }, undefined, { shallow: true });
	};

	return (
		<div id="library-books-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack width={'100%'} spacing={3} py={isMobile ? 3 : 5}>
					<Stack spacing={1}>
						<Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
							Smart Library Books
						</Typography>
						<Typography color={'text.secondary'}>
							Browse available books and open a title to view full details.
						</Typography>
					</Stack>

					<Stack direction={isMobile ? 'column' : 'row'} spacing={1.5}>
						<TextField
							fullWidth
							placeholder="Search by title, author, or ISBN"
							value={searchInput}
							onChange={onSearchChange}
							onKeyDown={(event) => {
								if (event.key === 'Enter') searchHandler().then();
							}}
						/>
						<Button variant="contained" onClick={() => searchHandler().then()} sx={{ minWidth: isMobile ? '100%' : 120 }}>
							Search
						</Button>
					</Stack>

					{loading && (
						<Stack alignItems={'center'} py={8}>
							<CircularProgress />
						</Stack>
					)}

					{!loading && error && (
						<Alert severity="error">Failed to load books. Please refresh and try again.</Alert>
					)}

					{!loading && !error && books.length === 0 && (
						<Alert severity="info">No books found for your current search.</Alert>
					)}

					{!loading && !error && books.length > 0 && (
						<>
							<Stack
								sx={{
									display: 'grid',
									gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
									gap: 2,
								}}
							>
								{books.map((book) => {
									const imagePath = book.bookImages?.[0] ? `${REACT_APP_API_URL}/${book.bookImages[0]}` : '/img/logo/logoText.svg';

									return (
										<Link href={`/library/books/${book._id}`} key={book._id}>
											<Card sx={{ height: '100%', cursor: 'pointer' }}>
												<CardMedia component="img" height="220" image={imagePath} alt={book.bookTitle} />
												<CardContent>
													<Stack spacing={0.75}>
														<Typography variant="h6">{book.bookTitle}</Typography>
														<Typography color={'text.secondary'}>{book.bookAuthor}</Typography>
														<Typography variant="body2" color={'text.secondary'}>
															ISBN: {book.bookIsbn}
														</Typography>
														<Typography variant="body2" color={'text.secondary'}>
															Category: {book.bookCategory}
														</Typography>
														<Typography variant="body2" color={'text.secondary'}>
															Status: {book.bookStatus}
														</Typography>
														<Typography fontWeight={600}>
															{book.bookPrice?.amount?.toLocaleString?.() ?? book.bookPrice?.amount}{' '}
															{book.bookPrice?.currency ?? ''}
														</Typography>
													</Stack>
												</CardContent>
											</Card>
										</Link>
									);
								})}
							</Stack>

							<Stack alignItems={'center'} py={2}>
								<Pagination
									page={inquiry.page}
									count={pageCount}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
								<Typography mt={1.5} color={'text.secondary'}>
									Total {total} book{total > 1 ? 's' : ''}
								</Typography>
							</Stack>
						</>
					)}
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(LibraryBooksPage);
