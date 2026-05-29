import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { Box, Button, Menu, MenuItem, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import BookCard from '../../libs/components/book/BookCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import BookFilter from '../../libs/components/property/BookFilter';
import { useRouter } from 'next/router';
import { BooksInquiry } from '../../libs/types/book/book.input';
import { Book } from '../../libs/types/book/book';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOOKS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_BOOK } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'books'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('books');
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<BooksInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [books, setBooks] = useState<Book[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('sort_new');

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
		setBooks(getBooksData?.getBooks?.list ?? []);
		setTotal(getBooksData?.getBooks?.metaCounter?.[0]?.total ?? 0);
	}, [getBooksData]);

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

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
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
						<Stack className={'filter-config'}>
							<BookFilter searchFilter={searchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack
								className={'list-config'}
								sx={{ display: 'grid !important', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px', flexDirection: 'unset !important', flexWrap: 'unset !important' }}
							>
								{getBooksLoading ? (
									Array.from({ length: 6 }).map((_, index) => (
										<Stack
											key={`books-grid-skeleton-${index}`}
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
										<BookCard key={book._id} book={book} likeHandler={likeBookHandler} />
									))
								)}
							</Stack>
							<Stack className="pagination-config">
								{books.length !== 0 && (
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

								{books.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											{total === 1 ? t('total_books_one', { count: total }) : t('total_books_other', { count: total })}
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
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
