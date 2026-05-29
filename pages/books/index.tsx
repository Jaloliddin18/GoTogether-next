import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { Box, Button, Menu, MenuItem, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import BookCard from '../../libs/components/book/BookCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import BookFilter from '../../libs/components/property/BookFilter';
import { useRouter } from 'next/router';
import { BooksInquiry } from '../../libs/types/book/book.input';
import { Book } from '../../libs/types/book/book';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { resolveMediaUrl } from '../../libs/utils';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOOKS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_BOOK } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'books'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const { t } = useTranslation('books');
	const user = useReactiveVar(userVar);
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [searchFilter, setSearchFilter] = useState<BooksInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('sort_new');
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

	const hasActiveFilters =
		Object.keys(searchFilter.search ?? {}).some(
			(key) => {
				const val = (searchFilter.search as any)[key];
				return val !== undefined && val !== '' && val !== null;
			}
		) || (searchFilter.sort && searchFilter.sort !== 'createdAt');

	// Count active filters for FAB badge
	const activeFilterCount = Object.keys((searchFilter?.search as any) ?? {}).filter(
		(k) => !['keyword'].includes(k),
	).length;

	/** APOLLO REQUESTS **/
	const [likeTargetBook] = useMutation(LIKE_TARGET_BOOK);
	const {
		loading: getBooksLoading,
		data: getBooksData,
		refetch: getBooksRefetch,
	} = useQuery(GET_BOOKS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});

	const { data: newBooksData, loading: newBooksLoading } = useQuery(GET_BOOKS, {
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !isMobile || hasActiveFilters,
	});

	const { data: popularBooksData, loading: popularBooksLoading } = useQuery(GET_BOOKS, {
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'bookViews',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !isMobile || hasActiveFilters,
	});

	const { data: recommendedBooksData, loading: recommendedBooksLoading } = useQuery(GET_BOOKS, {
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'bookLikes',
				direction: Direction.DESC,
				search: {},
			},
		},
		skip: !isMobile || hasActiveFilters,
	});

	const getSingleQueryValue = (value: string | string[] | undefined): string => {
		if (Array.isArray(value)) return value[0] ?? '';
		return value ?? '';
	};

	const buildSearchFilterFromFlatQuery = (baseInput: BooksInquiry): BooksInquiry => {
		const queryPage = getSingleQueryValue(router.query.page).trim();
		const parsedPage = queryPage ? Math.max(1, Number(queryPage) || 1) : 1;

		const keyword = getSingleQueryValue(router.query.keyword).trim();
		const format = getSingleQueryValue(router.query.format).trim();
		const type = getSingleQueryValue(router.query.type).trim();
		const category = getSingleQueryValue(router.query.category).trim();
		const audience = getSingleQueryValue(router.query.audience).trim();
		const language = getSingleQueryValue(router.query.language).trim();
		const borrowable = getSingleQueryValue(router.query.borrowable).trim();
		const purchasable = getSingleQueryValue(router.query.purchasable).trim();
		const minRatingRaw = getSingleQueryValue(router.query.minRating).trim();
		const minPriceRaw = getSingleQueryValue(router.query.minPrice).trim();
		const maxPriceRaw = getSingleQueryValue(router.query.maxPrice).trim();

		const parsedMinRating = minRatingRaw ? Number(minRatingRaw) : 0;
		const parsedMinPrice = minPriceRaw ? Number(minPriceRaw) : 0;
		const parsedMaxPrice = maxPriceRaw ? Number(maxPriceRaw) : 0;

		const search: any = {};
		if (keyword) search.keyword = keyword;
		if (format) search.bookFormat = format;
		if (type) search.bookType = type;
		if (category) search.bookCategory = category;
		if (audience) search.bookAudience = audience;
		if (language) search.bookLanguage = language;
		if (borrowable === 'true') search.isBorrowable = true;
		if (purchasable === 'true') search.isPurchasable = true;
		if (!Number.isNaN(parsedMinRating) && parsedMinRating > 0) search.minRating = parsedMinRating;
		if (!Number.isNaN(parsedMinPrice) && parsedMinPrice > 0) search.minPrice = parsedMinPrice;
		if (!Number.isNaN(parsedMaxPrice) && parsedMaxPrice > 0) search.maxPrice = parsedMaxPrice;

		return {
			...baseInput,
			page: parsedPage,
			search,
		};
	};

	/** LIFECYCLES **/
	useEffect(() => {
		const list = getBooksData?.getBooks?.list ?? [];
		const nextTotal = getBooksData?.getBooks?.metaCounter?.[0]?.total ?? 0;
		setTotal(nextTotal);

		if (isMobile && currentPage > 1) {
			setBooks((prev) => {
				const prevIds = new Set(prev.map((b) => b._id));
				const filteredList = list.filter((b) => !prevIds.has(b._id));
				return [...prev, ...filteredList];
			});
		} else {
			setBooks(list);
		}
	}, [getBooksData, isMobile, currentPage]);

	useEffect(() => {
		if (!router.isReady) return;

		const inputQuery = router.query.input;
		const inputString = Array.isArray(inputQuery) ? inputQuery[0] : inputQuery;

		if (inputString) {
			try {
				const inputObj = JSON.parse(inputString as string);
				const nextFilter = {
					...initialInput,
					...inputObj,
					search: inputObj?.search ?? {},
				};
				setSearchFilter(nextFilter);
				setCurrentPage(nextFilter.page === undefined ? 1 : nextFilter.page);
				return;
			} catch (err) {
				console.log('ERROR, parse input query:', err);
			}
		}

		const nextFilter = buildSearchFilterFromFlatQuery(initialInput);
		setSearchFilter(nextFilter);
		setCurrentPage(nextFilter.page === undefined ? 1 : nextFilter.page);
	}, [router.isReady, router.query, initialInput]);

	useEffect(() => {
		if (filterDrawerOpen) {
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		};
	}, [filterDrawerOpen]);

	/** HANDLERS **/
	const handlePaginationChange = async (_event: ChangeEvent<unknown>, value: number) => {
		const nextFilter = { ...searchFilter, page: value };
		await router.push(
			`/books?input=${JSON.stringify(nextFilter)}`,
			`/books?input=${JSON.stringify(nextFilter)}`,
			{
				scroll: false,
			},
		);
		setSearchFilter(nextFilter);
		setCurrentPage(value);
	};

	const likeBookHandler = async (e: React.MouseEvent, bookId: string) => {
		e.stopPropagation();
		try {
			if (!bookId) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetBook({
				variables: { input: bookId },
			});

			await getBooksRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBookHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('sort_new');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'bookPrice.amount', direction: Direction.ASC });
				setFilterSortName('sort_lowest');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'bookPrice.amount', direction: Direction.DESC });
				setFilterSortName('sort_highest');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const renderMobileCarouselSection = (title: string, booksList: Book[], loading: boolean) => {
		return (
			<Stack className="mobile-carousel-section" sx={{ mb: 4, width: '100%', px: isMobile ? 1 : 0 }}>
				<Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1A1A2E', fontFamily: "'Sofia Pro', sans-serif" }}>
					{title}
				</Typography>
				{loading ? (
					<Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, width: '100%' }}>
						{Array.from({ length: 3 }).map((_, idx) => (
							<Skeleton key={`carousel-skel-${idx}`} variant="rectangular" width={135} height={190} sx={{ borderRadius: '12px', flexShrink: 0 }} />
						))}
					</Stack>
				) : booksList.length === 0 ? (
					<Typography sx={{ color: '#64748B', fontSize: 14 }}>{t('no_books_found') || 'No books found'}</Typography>
				) : (
					<Swiper
						slidesPerView={'auto'}
						spaceBetween={12}
						style={{ width: '100%', paddingBottom: '8px' }}
					>
						{booksList.map((book) => (
							<SwiperSlide key={book._id} style={{ width: '135px' }}>
								<Stack
									onClick={() => router.push(`/books/detail?id=${book._id}`)}
									sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
								>
									<Box
										sx={{
											width: '135px',
											height: '190px',
											borderRadius: '12px',
											overflow: 'hidden',
											background: '#f5f7fa',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											border: '1px solid #e2e8f0',
											mb: 1,
											position: 'relative'
										}}
									>
										{book.bookImages?.[0] ? (
											<img
												src={resolveMediaUrl(book.bookImages[0])}
												alt={book.bookTitle}
												loading="lazy"
												style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
											/>
										) : (
											<Box sx={{
												width: '100%',
												height: '100%',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a6e 100%)',
												color: '#fff',
												fontWeight: 700,
												fontSize: '1.5rem'
											}}>
												BK
											</Box>
										)}
									</Box>
									<Typography
										sx={{
											fontSize: '13px',
											fontWeight: 700,
											color: '#1A1A2E',
											display: '-webkit-box',
											WebkitLineClamp: 1,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
											lineHeight: '16px'
										}}
									>
										{book.bookTitle}
									</Typography>
									<Typography
										sx={{
											fontSize: '11px',
											color: '#64748B',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}
									>
										{book.bookAuthor || 'Unknown'}
									</Typography>
								</Stack>
							</SwiperSlide>
						))}
					</Swiper>
				)}
			</Stack>
		);
	};

	return (
		<div id="property-list-page" style={{ position: 'relative' }}>
			{/* ── Mobile overlay behind filter drawer ── */}
			<div
				className={`books-filter-overlay${filterDrawerOpen ? ' is-visible' : ''}`}
				aria-hidden="true"
				onClick={() => setFilterDrawerOpen(false)}
			/>

			<div className="container">
				<Box component={'div'} className={'right'}>
					<span>{t('sort_by')}</span>
					<div>
						<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
							{t(filterSortName)}
						</Button>
						<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
							<MenuItem
								onClick={sortingHandler}
								id={'new'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								{t('sort_new')}
							</MenuItem>
							<MenuItem
								onClick={sortingHandler}
								id={'lowest'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								{t('sort_lowest')}
							</MenuItem>
							<MenuItem
								onClick={sortingHandler}
								id={'highest'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								{t('sort_highest')}
							</MenuItem>
						</Menu>
					</div>
				</Box>
				<Stack className={'property-page'}>
					{/* ── Filter sidebar / mobile drawer ── */}
					<Stack className={`filter-config${filterDrawerOpen ? ' is-open' : ''}`}>
						<BookFilter searchFilter={searchFilter} initialInput={initialInput} />
					</Stack>
					<Stack className="main-config" mb={'76px'}>
						{/* If on mobile and no filters, render horizontal carousels */}
						{isMobile && !hasActiveFilters && (
							<Stack sx={{ width: '100%', mb: 2 }}>
								{renderMobileCarouselSection(t('arrivals_title') || 'New Arrivals', newBooksData?.getBooks?.list ?? [], newBooksLoading)}
								{renderMobileCarouselSection(t('popular_title') || 'Most Popular', popularBooksData?.getBooks?.list ?? [], popularBooksLoading)}
								{renderMobileCarouselSection(t('recommended_title') || 'Recommended', recommendedBooksData?.getBooks?.list ?? [], recommendedBooksLoading)}
								
								<Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1.5, px: isMobile ? 1 : 0, color: '#1A1A2E', fontFamily: "'Sofia Pro', sans-serif" }}>
									{t('all_books_title') || 'All Books'}
								</Typography>
							</Stack>
						)}

						{isMobile && hasActiveFilters && (
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, px: isMobile ? 1 : 0, color: '#1A1A2E', fontFamily: "'Sofia Pro', sans-serif" }}>
								{t('search_results_title') || 'Search Results'}
							</Typography>
						)}

						<Stack
							className={'list-config'}
							sx={{ display: 'grid !important', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px', flexDirection: 'unset !important', flexWrap: 'unset !important' }}
						>
							{getBooksLoading ? (
								Array.from({ length: 6 }).map((_, index) => (
									<Stack
										key={`books-grid-skeleton-${index}`}
										className="books-grid-skeleton"
										sx={{
											backgroundColor: '#ffffff',
											borderRadius: '16px',
											border: '1px solid #e8f0fb',
											overflow: 'hidden',
										}}
									>
										<Skeleton variant="rectangular" animation="wave" width="100%" height={240} />
										<Stack spacing={1.1} sx={{ p: 2 }}>
											<Skeleton variant="text" animation="wave" width="74%" height={30} />
											<Skeleton variant="text" animation="wave" width="52%" height={22} />
											<Skeleton variant="text" animation="wave" width="38%" height={20} />
											<Skeleton variant="rectangular" animation="wave" width="100%" height={1} sx={{ my: 1 }} />
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Skeleton variant="text" animation="wave" width="36%" height={24} />
												<Stack direction="row" spacing={1}>
													<Skeleton variant="rounded" animation="wave" width={40} height={18} />
													<Skeleton variant="rounded" animation="wave" width={40} height={18} />
												</Stack>
											</Stack>
										</Stack>
									</Stack>
								))
							) : books?.length === 0 ? (
								<div className={'no-data'} style={{ gridColumn: '1 / -1' }}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>{t('no_books_found')}</p>
								</div>
							) : (
								books.map((book: Book) => (
									<BookCard key={book._id} className="books-list-card" book={book} likeHandler={likeBookHandler} />
								))
							)}
						</Stack>
						<Stack className="pagination-config">
							{books.length !== 0 && !isMobile && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}

							{books.length !== 0 && isMobile && currentPage * searchFilter.limit < total && (
								<Button
									variant="outlined"
									fullWidth
									onClick={async () => {
										const nextPageIndex = currentPage + 1;
										const nextFilter = { ...searchFilter, page: nextPageIndex };
										await router.push(
											`/books?input=${JSON.stringify(nextFilter)}`,
											`/books?input=${JSON.stringify(nextFilter)}`,
											{ scroll: false }
										);
										setCurrentPage(nextPageIndex);
										setSearchFilter(nextFilter);
									}}
									sx={{
										mt: 2,
										py: 1.5,
										borderRadius: '10px',
										color: '#2E86DE',
										borderColor: '#2E86DE',
										fontWeight: 600,
										textTransform: 'none',
										'&:active': {
											background: 'rgba(46, 134, 222, 0.05)',
										}
									}}
								>
									{t('load_more') || 'Load More'}
								</Button>
							)}

							{books.length !== 0 && (
								<Stack className="total-result" sx={{ mt: isMobile ? 1.5 : 0 }}>
									<Typography>
										{total === 1 ? t('total_books_one', { count: total }) : t('total_books_other', { count: total })}
									</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</div>

			{/* ── Mobile filter FAB — visible only on mobile/tablet via CSS ── */}
			<button
				className="books-filter-fab"
				type="button"
				id="books-filter-fab-btn"
				aria-label={filterDrawerOpen ? 'Close filters' : 'Open filters'}
				onClick={() => setFilterDrawerOpen((prev) => !prev)}
			>
				{filterDrawerOpen ? (
					<>
						<CloseIcon sx={{ fontSize: 20 }} />
						<span>Close</span>
					</>
				) : (
					<>
						<FilterListIcon sx={{ fontSize: 20 }} />
						<span>{t('filter_label') || 'Filters'}</span>
						{activeFilterCount > 0 && (
							<span className="fab-badge">{activeFilterCount}</span>
						)}
					</>
				)}
			</button>
		</div>
	);
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(PropertyList);
