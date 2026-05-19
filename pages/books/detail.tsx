import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	Pagination as MuiPagination,
	Rating,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FlagIcon from '@mui/icons-material/Flag';
import HeightIcon from '@mui/icons-material/Height';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NumbersIcon from '@mui/icons-material/Numbers';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ReviewsIcon from '@mui/icons-material/Reviews';
import ScaleIcon from '@mui/icons-material/Scale';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import StyleIcon from '@mui/icons-material/Style';
import TranslateIcon from '@mui/icons-material/Translate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SwiperCore, { Navigation, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import Moment from 'react-moment';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { Book } from '../../libs/types/book/book';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BookAudience } from '../../libs/enums/book.enum';
import { RequestType } from '../../libs/enums/request.enum';
import { CreateDeliveryRequestInput } from '../../libs/types/request/request.input';
import { userVar } from '../../apollo/store';
import { resolveMediaUrl } from '../../libs/utils';
import { GET_BOOK, GET_BOOKS } from '../../apollo/library/query';
import { GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_BOOK, CREATE_COMMENT, CREATE_DELIVERY_REQUEST } from '../../apollo/user/mutation';
import { announceTrackingRequest } from '../../libs/library/ws/trackingClient';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';

SwiperCore.use([Navigation, Autoplay]);

const SafeBox = Box as any;

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const libraryColors = {
	ink: '#172033',
	muted: '#64748b',
	soft: '#eef5ff',
	blue: '#2e86de',
	deepBlue: '#173b68',
	green: '#1b8f61',
	amber: '#a26418',
	border: '#dce6f2',
	paper: '#fbfdff',
	page: '#f3f7fb',
};

const cardSx = {
	background: 'rgba(251, 253, 255, 0.94)',
	border: `1px solid ${libraryColors.border}`,
	borderRadius: { xs: '14px', md: '16px' },
	boxShadow: '0 18px 44px rgba(23, 32, 51, 0.08)',
};

const sectionTitleSx = {
	fontSize: { xs: 20, md: 24 },
	fontWeight: 800,
	color: libraryColors.ink,
	letterSpacing: 0,
};

const DESK_SESSION_STORAGE_KEY = 'gotogether.delivery.sessionId';

const getOrCreateDeliverySessionId = (): string => {
	if (typeof window === 'undefined') return '';
	const existing = window.localStorage.getItem(DESK_SESSION_STORAGE_KEY);
	if (existing) return existing;
	const generated =
		typeof window.crypto?.randomUUID === 'function'
			? window.crypto.randomUUID()
			: `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	window.localStorage.setItem(DESK_SESSION_STORAGE_KEY, generated);
	return generated;
};

function formatLabel(value?: string | number | null): string {
	if (value === undefined || value === null || value === '') return '—';
	return String(value)
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCategoryName(cat: string): string {
	return formatLabel(cat);
}

function getDifficulty(audience: string): { label: string; color: string } {
	if (audience === BookAudience.CHILDREN || audience === BookAudience.TEEN)
		return { label: 'Beginner', color: '#1b8f61' };
	if (audience === BookAudience.GRADUATE || audience === BookAudience.PROFESSIONAL)
		return { label: 'Advanced', color: '#b7791f' };
	return { label: 'Intermediate', color: '#2468d6' };
}

function formatPrice(book?: Book | null): string {
	const price = book?.bookPrice;
	if (!price) return 'Price unavailable';
	const amount = price.isDiscounted && price.discountPercent
		? Math.round(price.amount * (1 - price.discountPercent / 100))
		: price.amount;
	return `${amount.toLocaleString()} ${price.currency ?? 'KRW'}`;
}

const INITIAL_COMMENT_INQUIRY: CommentsInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { commentRefId: '' },
};

const INITIAL_DESK_DESTINATION = {
	destinationDeskId: 'A12',
	floorId: 'floor_1',
	x: '8.4',
	y: '3.2',
	theta: '0',
};

const BookDetailPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isMobile = device === 'mobile';

	const [bookId, setBookId] = useState<string | null>(null);
	const [book, setBook] = useState<Book | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [reviewRating, setReviewRating] = useState<number | null>(0);
	const [deskDestination, setDeskDestination] = useState(INITIAL_DESK_DESTINATION);

	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(INITIAL_COMMENT_INQUIRY);
	const [bookComments, setBookComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.BOOK,
		commentContent: '',
		commentRefId: '',
	});

	const [similarBooks, setSimilarBooks] = useState<Book[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetBook] = useMutation(LIKE_TARGET_BOOK);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [createDeliveryRequest, { loading: createRequestLoading }] = useMutation(CREATE_DELIVERY_REQUEST);

	const { loading: getBookLoading, refetch: getBookRefetch } = useQuery(GET_BOOK, {
		fetchPolicy: 'network-only',
		variables: { input: bookId },
		skip: !bookId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getBook) setBook(data.getBook);
			setSlideImage(data?.getBook?.bookImages?.[0] ?? '');
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setBookComments(data.getComments.list);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 8,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { bookCategory: book?.bookCategory },
			},
		},
		skip: !book?.bookCategory,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getBooks?.list) {
				setSimilarBooks((data.getBooks.list as Book[]).filter((b) => b._id !== bookId));
			}
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			const id = router.query.id as string;
			setBookId(id);
			setCommentInquiry((prev) => ({ ...prev, search: { commentRefId: id } }));
			setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
		}
	}, [router]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry, getCommentsRefetch]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => setSlideImage(image);

	const likeBookHandler = async (u: T, id: string) => {
		try {
			if (!id) return;
			if (!u._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetBook({ variables: { input: id } });
			await getBookRefetch({ input: id });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBookHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			setReviewRating(0);
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateDeskDestination = (field: keyof typeof INITIAL_DESK_DESTINATION, value: string) => {
		setDeskDestination((prev) => ({ ...prev, [field]: value }));
	};

	const createDeliveryRequestHandler = async (requestType: RequestType) => {
		try {
			if (!book?._id) return;

			const x = Number(deskDestination.x);
			const y = Number(deskDestination.y);
			const theta = Number(deskDestination.theta);
			if (!deskDestination.destinationDeskId.trim() || !deskDestination.floorId.trim()) {
				throw new Error('Please enter your desk position.');
			}
			if (![x, y, theta].every(Number.isFinite)) {
				throw new Error('Desk coordinates must be valid numbers.');
			}

			const input: CreateDeliveryRequestInput = {
				bookId: book._id,
				requestType,
				destinationDeskId: deskDestination.destinationDeskId.trim(),
				destination: {
					floorId: deskDestination.floorId.trim(),
					x,
					y,
					theta,
				},
			};

			if (!user?._id) {
				input.sessionId = getOrCreateDeliverySessionId();
			}

			const { data } = await createDeliveryRequest({ variables: { input } });
			const request = data?.createDeliveryRequest;
			if (request?._id) {
				announceTrackingRequest({
					requestId: request._id,
					requestType,
					status: request.status,
					bookTitle: book.bookTitle,
					createdAt: request.createdAt,
				});
			}

			await sweetTopSuccessAlert(
				request?.status === 'QUEUED' ? 'Request sent successfully' : 'Robot started delivery',
				1800,
			);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message ?? 'Request failed');
		}
	};

	const imageList = useMemo(() => {
		if (book?.bookImages?.length) return book.bookImages;
		return ['/img/banner/books_hero.png'];
	}, [book?.bookImages]);

	const currentImage = slideImage || imageList[0];
	const pages = book?.bookPages ?? 0;
	const readTimeHours = pages > 0 ? Math.max(1, Math.round(pages / 40)) : 0;
	const pagesPerDay = pages > 0 ? Math.ceil(pages / 14) : 0;
	const difficulty = getDifficulty(book?.bookAudience ?? '');
	const reviewLabel = `${commentTotal} Review${commentTotal === 1 ? '' : 's'}`;

	const metaItems = [
		{ label: 'Category', value: formatLabel(book?.bookCategory), icon: CategoryIcon },
		{ label: 'Type', value: formatLabel(book?.bookType), icon: AutoStoriesIcon },
		{ label: 'Format', value: formatLabel(book?.bookFormat), icon: StyleIcon },
		{ label: 'Language', value: formatLabel(book?.bookLanguage), icon: TranslateIcon },
		{ label: 'Audience', value: formatLabel(book?.bookAudience), icon: SchoolIcon },
		{ label: 'Pages', value: book?.bookPages ? `${book.bookPages.toLocaleString()} pages` : '—', icon: MenuBookIcon },
		{ label: 'Published year', value: book?.bookPublishedYear ?? '—', icon: CalendarMonthIcon },
		{ label: 'ISBN', value: book?.bookIsbn ?? '—', icon: NumbersIcon },
		{ label: 'Call Number', value: book?.bookCallNumber ?? '—', icon: BookmarkAddedIcon },
	];

	const physicalItems = [
		{ label: 'Width', value: book?.bookDimensions?.widthCm ? `${book.bookDimensions.widthCm}cm` : '—', icon: StraightenIcon },
		{ label: 'Height', value: book?.bookDimensions?.heightCm ? `${book.bookDimensions.heightCm}cm` : '—', icon: HeightIcon },
		{ label: 'Weight', value: book?.bookDimensions?.weightGrams ? `${book.bookDimensions.weightGrams}g` : '—', icon: ScaleIcon },
	];

	const readingItems = [
		{ label: 'Estimated read time', value: readTimeHours > 0 ? `~${readTimeHours} hours` : '—', icon: AccessTimeIcon },
		{ label: 'Finish target', value: pagesPerDay > 0 ? `${pagesPerDay} pages/day` : '—', icon: FlagIcon },
		{ label: 'Difficulty', value: difficulty.label, icon: SchoolIcon, color: difficulty.color },
	];

	const policyItems = [
		{ label: 'Borrow period', value: '14 days maximum', icon: CalendarMonthIcon },
		{ label: 'Renewals', value: '1 renewal allowed before due date', icon: RefreshIcon },
		{ label: 'Late fee', value: '₩100 per day after due date', icon: WarningAmberIcon },
		{ label: 'Return method', value: 'Reception desk or library return station', icon: Inventory2Icon },
	];

	if (getBookLoading) {
		return (
			<Stack sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: 600 }}>
				<CircularProgress size="4rem" />
			</Stack>
		);
	}

	return (
		<div
			id="book-detail-page"
			style={{
				background:
					'linear-gradient(180deg, #eef4fb 0%, #f7f9fc 360px, #f3f7fb 100%)',
				minHeight: '100vh',
				paddingBottom: isMobile ? 40 : 72,
			}}
		>
			<div
				className="container"
				style={{
					width: '100%',
					maxWidth: 1380,
					padding: isMobile ? '120px 16px 0' : '120px 40px 0',
					boxSizing: 'border-box',
					display: 'block',
				}}
			>
				<Stack spacing={{ xs: 3, md: 4 }}>
					<SafeBox
						sx={{
							...cardSx,
							p: { xs: 2, sm: 3, md: 4 },
							position: 'relative',
							overflow: 'hidden',
							'&:before': {
								content: '""',
								position: 'absolute',
								inset: 0,
								background:
									'linear-gradient(135deg, rgba(46, 134, 222, 0.08), transparent 34%), radial-gradient(circle at 8% 4%, rgba(27, 143, 97, 0.08), transparent 28%)',
								pointerEvents: 'none',
							},
						}}
					>
						<SafeBox
							sx={{
								position: 'relative',
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', xl: '360px minmax(0, 1fr) 148px' },
								gap: { xs: 3, md: 4.5 },
								alignItems: 'start',
							}}
						>
							<Stack spacing={1.5}>
								<SafeBox
									sx={{
										borderRadius: { xs: '14px', md: '16px' },
										overflow: 'hidden',
										background: 'linear-gradient(145deg, #e8eef6, #f8fbff)',
										border: `1px solid ${libraryColors.border}`,
										boxShadow: '0 24px 52px rgba(23, 32, 51, 0.12)',
										aspectRatio: '3 / 4',
										minHeight: { xs: 360, sm: 460 },
										display: 'grid',
										placeItems: 'center',
										p: { xs: 2, sm: 2.5 },
									}}
								>
									<SafeBox
										component="img"
										src={resolveMediaUrl(currentImage, '/img/banner/books_hero.png')}
										alt={book?.bookTitle ?? 'Book cover'}
										sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transition: 'opacity 180ms ease' }}
									/>
								</SafeBox>
								<Stack
									direction="row"
									spacing={1.25}
									sx={{ overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch' }}
								>
									{imageList.map((img: string, index: number) => {
										const isActive = currentImage === img;
										return (
											<SafeBox
												key={`${img}-${index}`}
												component="button"
												type="button"
												onClick={() => changeImageHandler(img)}
												aria-label={`Show book image ${index + 1}`}
												sx={{
													width: { xs: 78, sm: 92 },
													height: { xs: 78, sm: 92 },
													p: '3px',
													borderRadius: '12px',
													border: isActive ? `2px solid ${libraryColors.blue}` : `2px solid ${libraryColors.border}`,
													background: '#fff',
													cursor: 'pointer',
													flex: '0 0 auto',
													scrollSnapAlign: 'start',
													transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
													boxShadow: isActive ? '0 10px 24px rgba(36, 104, 214, 0.2)' : 'none',
													'&:hover': { transform: 'translateY(-3px)', borderColor: libraryColors.blue },
													'&:focus-visible': { outline: `3px solid ${libraryColors.soft}` },
												}}
											>
												<SafeBox
													component="img"
													src={resolveMediaUrl(img, '/img/banner/books_hero.png')}
													alt="Book thumbnail"
													sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '9px', display: 'block', background: '#eef4fb' }}
												/>
											</SafeBox>
										);
									})}
								</Stack>
							</Stack>

							<Stack spacing={2.5} sx={{ pt: { lg: 1 } }}>
								<Stack spacing={1.2}>
									<Typography variant={isMobile ? 'h4' : 'h1'} sx={{ color: libraryColors.ink, fontWeight: 900, letterSpacing: 0, lineHeight: 1.08, fontSize: { xs: 31, md: 48 } }}>
										{book?.bookTitle ?? 'Book title unavailable'}
									</Typography>
									<Typography sx={{ color: libraryColors.muted, fontSize: { xs: 17, md: 19 }, fontWeight: 600 }}>
										{book?.bookAuthor ? `by ${book.bookAuthor}` : 'Author unavailable'}
									</Typography>
									<Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
										<Typography sx={{ color: libraryColors.deepBlue, fontSize: { xs: 25, md: 32 }, fontWeight: 900, letterSpacing: 0 }}>
											{formatPrice(book)}
										</Typography>
										{book?.bookPrice?.isDiscounted && book?.bookPrice?.discountPercent ? (
											<Typography sx={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 700 }}>
												{book.bookPrice.amount.toLocaleString()} {book.bookPrice.currency}
											</Typography>
										) : null}
									</Stack>
								</Stack>

								<Stack direction="row" gap={1} flexWrap="wrap">
									{book?.isBorrowable && <Chip label="Borrowable" sx={{ background: '#e6f6ee', color: libraryColors.green, fontWeight: 800, borderRadius: '999px' }} />}
									{book?.isPurchasable && <Chip label="Purchasable" sx={{ background: '#edf4ff', color: libraryColors.blue, fontWeight: 800, borderRadius: '999px' }} />}
									{book?.bookStatus && <Chip label={formatLabel(book.bookStatus)} sx={{ background: '#fff7df', color: libraryColors.amber, fontWeight: 800, borderRadius: '999px' }} />}
								</Stack>

								<SafeBox sx={{ p: { xs: 1.6, sm: 2 }, border: `1px solid ${libraryColors.border}`, borderRadius: '16px', background: '#ffffff', boxShadow: '0 14px 32px rgba(23, 32, 51, 0.06)' }}>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} mb={1.6}>
										<Button
											variant="contained"
											startIcon={<LocalShippingOutlinedIcon />}
											disabled={createRequestLoading || !book?.isBorrowable}
											onClick={() => createDeliveryRequestHandler(RequestType.BORROW)}
											sx={{
												flex: 1,
												minHeight: 48,
												background: libraryColors.deepBlue,
												borderRadius: '12px',
												textTransform: 'none',
												fontWeight: 900,
												boxShadow: '0 12px 24px rgba(23, 59, 104, 0.22)',
												transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
												'&:hover': { background: '#102d50', transform: 'translateY(-2px)', boxShadow: '0 16px 28px rgba(23, 59, 104, 0.28)' },
											}}
										>
											Borrow
										</Button>
										<Button
											variant="outlined"
											startIcon={<ShoppingBagOutlinedIcon />}
											disabled={createRequestLoading || !book?.isPurchasable}
											onClick={() => createDeliveryRequestHandler(RequestType.PURCHASE)}
											sx={{
												flex: 1,
												minHeight: 48,
												borderColor: '#b7c7d9',
												color: libraryColors.deepBlue,
												borderRadius: '12px',
												textTransform: 'none',
												fontWeight: 900,
												background: '#f8fbff',
												transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
												'&:hover': { borderColor: libraryColors.blue, background: '#eef5ff', transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(23, 32, 51, 0.1)' },
											}}
										>
											Commercial
										</Button>
									</Stack>
									<Divider sx={{ borderColor: libraryColors.border, mb: 1.6 }} />
									<Stack direction="row" spacing={1} alignItems="center" mb={1.2}>
										<PinDropOutlinedIcon sx={{ color: libraryColors.blue, fontSize: 19 }} />
										<Typography sx={{ color: libraryColors.ink, fontWeight: 900 }}>Desk Position</Typography>
									</Stack>
									<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1.1fr 1fr 1fr 1fr 1fr' }, gap: 1 }}>
										<TextField size="small" label="Desk" value={deskDestination.destinationDeskId} onChange={(event) => updateDeskDestination('destinationDeskId', event.target.value)} />
										<TextField size="small" label="Floor" value={deskDestination.floorId} onChange={(event) => updateDeskDestination('floorId', event.target.value)} />
										<TextField size="small" label="X" type="number" value={deskDestination.x} onChange={(event) => updateDeskDestination('x', event.target.value)} />
										<TextField size="small" label="Y" type="number" value={deskDestination.y} onChange={(event) => updateDeskDestination('y', event.target.value)} />
										<TextField size="small" label="Theta" type="number" value={deskDestination.theta} onChange={(event) => updateDeskDestination('theta', event.target.value)} />
									</SafeBox>
								</SafeBox>

								<SafeBox sx={{ border: `1px solid ${libraryColors.border}`, borderRadius: '16px', overflow: 'hidden', background: '#ffffff' }}>
									<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 1.6, sm: 2 }, py: 1.4, background: '#f6f9fd', borderBottom: `1px solid ${libraryColors.border}` }}>
										<Typography sx={{ color: libraryColors.ink, fontSize: 14, fontWeight: 900 }}>Catalog Record</Typography>
										<Typography sx={{ color: libraryColors.muted, fontSize: 12, fontWeight: 800 }}>{book?.bookCallNumber ?? 'Uncataloged'}</Typography>
									</Stack>
									<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
										{metaItems.map(({ label, value, icon: Icon }, index) => (
											<SafeBox
												key={label}
												sx={{
													p: { xs: 1.5, md: 1.7 },
													minHeight: 82,
													borderRight: { md: (index + 1) % 3 === 0 ? 'none' : `1px solid ${libraryColors.border}` },
													borderBottom: {
														xs: index === metaItems.length - 1 ? 'none' : `1px solid ${libraryColors.border}`,
														md: index >= metaItems.length - 3 ? 'none' : `1px solid ${libraryColors.border}`,
													},
													transition: 'background-color 180ms ease',
													'&:hover': { background: '#f8fbff' },
												}}
											>
												<Stack direction="row" spacing={0.8} alignItems="center" mb={0.8}>
													<Icon sx={{ fontSize: 17, color: libraryColors.blue }} />
													<Typography sx={{ color: libraryColors.muted, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>{label}</Typography>
												</Stack>
												<Typography sx={{ color: libraryColors.ink, fontSize: 15, fontWeight: 800, overflowWrap: 'anywhere' }}>{value}</Typography>
											</SafeBox>
										))}
									</SafeBox>
								</SafeBox>
							</Stack>

							<Stack direction={{ xs: 'row', lg: 'column' }} spacing={1.2} sx={{ justifyContent: { xs: 'flex-start', lg: 'flex-start' }, alignItems: { xs: 'stretch', lg: 'flex-end' } }}>
								<Stack direction="row" spacing={0.8} alignItems="center" sx={{ px: 1.6, py: 1.2, borderRadius: '18px', background: '#fff', border: `1px solid ${libraryColors.border}`, boxShadow: '0 12px 28px rgba(15, 31, 51, 0.08)' }}>
									<RemoveRedEyeIcon sx={{ fontSize: 19, color: libraryColors.blue }} />
									<Typography sx={{ color: libraryColors.ink, fontWeight: 900 }}>{book?.bookViews ?? 0}</Typography>
								</Stack>
								<Stack
									component="button"
									type="button"
									direction="row"
									spacing={0.8}
									alignItems="center"
									onClick={() => likeBookHandler(user, book?._id ?? '')}
									sx={{
										px: 1.6,
										py: 1.2,
										borderRadius: '18px',
										background: '#fff',
										border: `1px solid ${libraryColors.border}`,
										boxShadow: '0 12px 28px rgba(15, 31, 51, 0.08)',
										cursor: 'pointer',
										transition: 'transform 180ms ease',
										'&:hover': { transform: 'translateY(-2px)' },
									}}
								>
									{book?.meLiked?.[0]?.myFavorite ? <FavoriteIcon sx={{ fontSize: 19, color: '#e5484d' }} /> : <FavoriteBorderIcon sx={{ fontSize: 19, color: libraryColors.blue }} />}
									<Typography sx={{ color: libraryColors.ink, fontWeight: 900 }}>{book?.bookLikes ?? 0}</Typography>
								</Stack>
							</Stack>
						</SafeBox>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
						<Stack direction="row" spacing={1.3} alignItems="center" mb={1.8}>
							<SafeBox sx={{ width: 44, height: 44, borderRadius: '16px', background: libraryColors.soft, color: libraryColors.blue, display: 'grid', placeItems: 'center' }}>
								<MenuBookIcon />
							</SafeBox>
							<Typography sx={sectionTitleSx}>Description</Typography>
						</Stack>
						<Typography sx={{ color: libraryColors.muted, lineHeight: 1.85, fontSize: 16, whiteSpace: 'pre-line' }}>
							{book?.bookDescription || 'No description has been added for this book yet.'}
						</Typography>
					</SafeBox>

					<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>
						<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
							<Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>Physical Details</Typography>
							<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
								{physicalItems.map(({ label, value, icon: Icon }) => (
									<Stack key={label} spacing={1} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#f8fbff' }}>
										<SafeBox sx={{ color: libraryColors.blue }}><Icon /></SafeBox>
										<Typography sx={{ color: libraryColors.muted, fontSize: 13, fontWeight: 800 }}>{label}</Typography>
										<Typography sx={{ color: libraryColors.ink, fontSize: 21, fontWeight: 900 }}>{value}</Typography>
									</Stack>
								))}
							</SafeBox>
						</SafeBox>

						<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
							<Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>Reading Guide</Typography>
							<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2 }}>
								{readingItems.map(({ label, value, icon: Icon, color }) => (
									<Stack key={label} spacing={1} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#f8fbff' }}>
										<SafeBox sx={{ color: color ?? libraryColors.blue }}><Icon /></SafeBox>
										<Typography sx={{ color: libraryColors.muted, fontSize: 13, fontWeight: 800 }}>{label}</Typography>
										<Typography sx={{ color: color ?? libraryColors.ink, fontSize: 18, fontWeight: 900 }}>{value}</Typography>
									</Stack>
								))}
							</SafeBox>
							<Stack direction="row" gap={1} flexWrap="wrap">
								{['Best read: Morning', 'Study aid: Yes', 'Note-taking: Recommended'].map((tag) => (
									<Chip key={tag} label={tag} sx={{ borderRadius: '999px', background: libraryColors.soft, color: libraryColors.blue, fontWeight: 800 }} />
								))}
							</Stack>
						</SafeBox>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
							<Stack spacing={2} sx={{ flex: { md: '0 0 280px' } }}>
								<Typography sx={sectionTitleSx}>Shelf Location</Typography>
								<Typography sx={{ color: libraryColors.muted, lineHeight: 1.7 }}>
									Find this title in the main library section. The highlighted block marks the active shelf for this book.
								</Typography>
								<Stack direction="row" gap={1} flexWrap="wrap">
									<Chip label={book?.bookCallNumber ?? 'Call number N/A'} sx={{ background: libraryColors.soft, color: libraryColors.blue, fontWeight: 900, borderRadius: '999px' }} />
									<Chip label="Good" sx={{ background: '#e6f6ee', color: libraryColors.green, fontWeight: 900, borderRadius: '999px' }} />
								</Stack>
							</Stack>

							<SafeBox sx={{ flex: 1, minWidth: 0 }}>
								<SafeBox sx={{ borderRadius: '24px', border: `1px solid ${libraryColors.border}`, background: 'linear-gradient(135deg, #f8fbff 0%, #edf4ff 100%)', p: { xs: 1.5, sm: 2.4 }, overflow: 'hidden' }}>
									<SafeBox component="svg" viewBox="0 0 720 320" role="img" aria-label="Library shelf map" sx={{ width: '100%', display: 'block' }}>
										<rect x="24" y="28" width="230" height="82" rx="18" fill="#dceaff" stroke="#2468d6" strokeWidth="3" />
										<text x="139" y="63" textAnchor="middle" fontSize="18" fontWeight="800" fill="#2468d6">Library books</text>
										<rect x="76" y="80" width="126" height="24" rx="12" fill="#2468d6" />
										<text x="139" y="98" textAnchor="middle" fontSize="13" fontWeight="800" fill="#ffffff">This Book</text>

										<rect x="466" y="28" width="230" height="82" rx="18" fill="#ffffff" stroke="#cbd8e8" strokeWidth="2" />
										<text x="581" y="76" textAnchor="middle" fontSize="18" fontWeight="800" fill="#607086">Commercial books</text>

										<rect x="24" y="142" width="672" height="48" rx="18" fill="#ffffff" stroke="#d8e4f2" strokeWidth="2" />
										<text x="360" y="173" textAnchor="middle" fontSize="16" fontWeight="800" fill="#8a9aae">Aisle</text>

										<rect x="24" y="222" width="150" height="66" rx="18" fill="#ffffff" stroke="#cbd8e8" strokeWidth="2" />
										<text x="99" y="261" textAnchor="middle" fontSize="16" fontWeight="800" fill="#607086">Reception</text>

										<rect x="218" y="222" width="150" height="66" rx="18" fill="#ffffff" stroke="#cbd8e8" strokeWidth="2" />
										<text x="293" y="261" textAnchor="middle" fontSize="16" fontWeight="800" fill="#607086">Desk A</text>

										<rect x="412" y="222" width="150" height="66" rx="18" fill="#ffffff" stroke="#cbd8e8" strokeWidth="2" />
										<text x="487" y="261" textAnchor="middle" fontSize="16" fontWeight="800" fill="#607086">Desk B</text>

										<rect x="604" y="222" width="92" height="66" rx="18" fill="#f7fbff" stroke="#cbd8e8" strokeWidth="2" />
										<text x="650" y="261" textAnchor="middle" fontSize="16" fontWeight="800" fill="#607086">Aisle</text>
									</SafeBox>
								</SafeBox>
							</SafeBox>
						</Stack>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
						<Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>Borrowing Policy</Typography>
						<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
							{policyItems.map(({ label, value, icon: Icon }) => (
								<Stack key={label} direction="row" spacing={1.5} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#f8fbff' }}>
									<SafeBox sx={{ width: 42, height: 42, borderRadius: '15px', background: '#fff', color: libraryColors.blue, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><Icon /></SafeBox>
									<SafeBox>
										<Typography sx={{ color: libraryColors.ink, fontWeight: 900 }}>{label}</Typography>
										<Typography sx={{ color: libraryColors.muted, mt: 0.3 }}>{value}</Typography>
									</SafeBox>
								</Stack>
							))}
						</SafeBox>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
						<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} mb={2.5}>
							<Stack direction="row" spacing={1.2} alignItems="center">
								<SafeBox sx={{ width: 44, height: 44, borderRadius: '16px', background: libraryColors.soft, color: libraryColors.blue, display: 'grid', placeItems: 'center' }}>
									<ReviewsIcon />
								</SafeBox>
								<SafeBox>
									<Typography sx={sectionTitleSx}>Reviews</Typography>
									<Typography sx={{ color: libraryColors.muted, fontWeight: 800 }}>{reviewLabel}</Typography>
								</SafeBox>
							</Stack>
						</Stack>

						<Stack spacing={1.5} mb={3}>
							{bookComments.length === 0 ? (
								<SafeBox sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '22px', background: '#f8fbff', border: `1px dashed ${libraryColors.border}`, textAlign: 'center' }}>
									<Typography sx={{ color: libraryColors.ink, fontWeight: 900, mb: 0.5 }}>No reviews yet</Typography>
									<Typography sx={{ color: libraryColors.muted }}>Be the first reader to leave a note about this book.</Typography>
								</SafeBox>
							) : (
								bookComments.map((comment: Comment) => {
									const avatarSrc = resolveMediaUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');
									return (
										<Stack key={comment._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.7} sx={{ p: 2, background: '#f8fbff', border: `1px solid ${libraryColors.border}`, borderRadius: '22px' }}>
											<Avatar src={avatarSrc} alt={comment.memberData?.memberNick ?? 'User'} sx={{ width: 48, height: 48 }} />
											<SafeBox sx={{ flex: 1, minWidth: 0 }}>
												<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={0.5} mb={0.6}>
													<Typography sx={{ color: libraryColors.ink, fontWeight: 900 }}>{comment.memberData?.memberNick ?? 'Anonymous'}</Typography>
													<Typography sx={{ color: '#93a3b8', fontSize: 13, fontWeight: 700 }}><Moment format="DD MMM, YYYY">{comment.createdAt}</Moment></Typography>
												</Stack>
												<Typography sx={{ color: libraryColors.muted, lineHeight: 1.7 }}>{comment.commentContent}</Typography>
											</SafeBox>
										</Stack>
									);
								})
							)}
						</Stack>

						{commentTotal > commentInquiry.limit && (
							<Stack alignItems="center" mb={3}>
								<MuiPagination page={commentInquiry.page} count={Math.ceil(commentTotal / commentInquiry.limit)} onChange={commentPaginationChangeHandler} shape="circular" color="primary" />
							</Stack>
						)}

						<SafeBox sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '24px', background: '#f8fbff', border: `1px solid ${libraryColors.border}` }}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.7} alignItems="flex-start">
								<Avatar src={resolveMediaUrl(user?.memberImage, '/img/profile/defaultUser.svg')} alt={user?.memberNick ?? 'Reader'} sx={{ width: 48, height: 48 }} />
								<Stack spacing={1.4} sx={{ flex: 1, width: '100%' }}>
									<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
										<SafeBox>
											<Typography sx={{ color: libraryColors.ink, fontSize: 18, fontWeight: 900 }}>Leave Review</Typography>
											<Typography sx={{ color: libraryColors.muted, fontSize: 13 }}>Share a useful note for the next reader.</Typography>
										</SafeBox>
										<Rating value={reviewRating} onChange={(_event, value) => setReviewRating(value)} />
									</Stack>
									<TextField
										multiline
										minRows={4}
										placeholder="Share your thoughts about this book..."
										value={insertCommentData.commentContent}
										onChange={({ target: { value } }) => setInsertCommentData((prev) => ({ ...prev, commentContent: value }))}
										sx={{
											'& .MuiOutlinedInput-root': {
												height: 'auto',
												alignItems: 'flex-start',
												borderRadius: '18px',
												background: '#fff',
											},
										}}
									/>
									<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1.2}>
										{!user?._id && <Typography sx={{ fontSize: 13, color: libraryColors.muted }}>Please log in to leave a review.</Typography>}
										<Button
											variant="contained"
											disabled={!insertCommentData.commentContent.trim() || !user?._id}
											onClick={createCommentHandler}
											sx={{
												ml: { sm: 'auto' },
												px: 3,
												py: 1.35,
												background: libraryColors.blue,
												borderRadius: '16px',
												textTransform: 'none',
												fontWeight: 900,
												'&:hover': { background: '#1d57b6' },
												'&.Mui-disabled': { background: '#cbd8e8', color: '#fff' },
											}}
										>
											Submit Review
										</Button>
									</Stack>
								</Stack>
							</Stack>
						</SafeBox>
					</SafeBox>

					{similarBooks.length > 0 && (
						<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
							<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-end' }} gap={1.5} mb={2}>
								<SafeBox>
									<Typography sx={sectionTitleSx}>Similar Books</Typography>
									<Typography sx={{ color: libraryColors.muted, mt: 0.4 }}>More in {book?.bookCategory ? formatCategoryName(book.bookCategory) : 'this category'}</Typography>
								</SafeBox>
								<Stack direction="row" spacing={1}>
									<Button className="swiper-book-prev" aria-label="Previous similar books" sx={{ minWidth: 38, width: 38, height: 38, borderRadius: '50%', border: `1px solid ${libraryColors.border}`, color: libraryColors.ink }}>‹</Button>
									<Button className="swiper-book-next" aria-label="Next similar books" sx={{ minWidth: 38, width: 38, height: 38, borderRadius: '50%', border: `1px solid ${libraryColors.border}`, color: libraryColors.ink }}>›</Button>
								</Stack>
							</Stack>

							<Swiper
								spaceBetween={16}
								navigation={{ nextEl: '.swiper-book-next', prevEl: '.swiper-book-prev' }}
								breakpoints={{ 0: { slidesPerView: 1.15 }, 600: { slidesPerView: 2 }, 900: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }}
							>
								{similarBooks.map((b: Book) => {
									const imgSrc = resolveMediaUrl(b.bookImages?.[0], '/img/banner/books_hero.png');
									return (
										<SwiperSlide key={b._id}>
											<SafeBox onClick={() => router.push(`/books/detail?id=${b._id}`)} sx={{ cursor: 'pointer', background: '#f8fbff', borderRadius: '22px', overflow: 'hidden', border: `1px solid ${libraryColors.border}`, transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 32px rgba(15, 31, 51, 0.1)' } }}>
												<SafeBox component="img" src={imgSrc} alt={b.bookTitle} sx={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
												<SafeBox sx={{ p: 1.8 }}>
													<Typography sx={{ fontSize: 15, fontWeight: 900, color: libraryColors.ink, mb: 0.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.bookTitle}</Typography>
													<Typography sx={{ fontSize: 13, color: libraryColors.muted, mb: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.bookAuthor}</Typography>
													<Typography sx={{ fontSize: 14, fontWeight: 900, color: libraryColors.blue }}>{b.bookPrice?.amount?.toLocaleString()} {b.bookPrice?.currency}</Typography>
												</SafeBox>
											</SafeBox>
										</SwiperSlide>
									);
								})}
							</Swiper>
						</SafeBox>
					)}
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(BookDetailPage);
