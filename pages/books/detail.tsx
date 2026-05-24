import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Pagination as MuiPagination,
	Rating,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FlagIcon from '@mui/icons-material/Flag';
import HeightIcon from '@mui/icons-material/Height';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NumbersIcon from '@mui/icons-material/Numbers';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
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
import { DeliveryDestinationType, RequestType } from '../../libs/enums/request.enum';
import { CreateDeliveryRequestInput } from '../../libs/types/request/request.input';
import { userVar } from '../../apollo/store';
import { resolveMediaUrl } from '../../libs/utils';
import { GET_BOOK } from '../../apollo/library/query';
import { GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_BOOK, CREATE_COMMENT, CREATE_DELIVERY_REQUEST } from '../../apollo/user/mutation';
import { announceTrackingRequest } from '../../libs/library/ws/trackingClient';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import YouMayAlsoLike from '../../src/components/books/YouMayAlsoLike';
import BookDetailTabs from '../../src/components/books/BookDetailTabs';

SwiperCore.use([Navigation, Autoplay]);

const SafeBox = Box as any;

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const libraryColors = {
	ink: '#1A1A2E',
	muted: '#64748B',
	soft: '#EBF4FF',
	blue: '#2E86DE',
	navy: '#1B3A6B',
	green: '#22C55E',
	amber: '#F59E0B',
	border: '#E2E8F0',
	paper: '#ffffff',
	page: '#F8FAFC',
};

const cardSx = {
	background: libraryColors.paper,
	border: `1px solid ${libraryColors.border}`,
	borderRadius: { xs: '20px', md: '26px' },
	boxShadow: '0 18px 50px rgba(15, 31, 51, 0.07)',
};

const sectionTitleSx = {
	fontSize: { xs: 20, md: 24 },
	fontWeight: 800,
	color: libraryColors.ink,
	letterSpacing: '-0.02em',
};

const DESK_SESSION_STORAGE_KEY = 'gotogether.delivery.sessionId';
const AUTO_DESTINATION_STORAGE_KEYS = [
	'gotogether.delivery.destination',
	'gotogether.studentDesk',
	'gotogether.memberDesk',
	'studentDeskMeta',
];

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
		return { label: 'Beginner', color: '#22C55E' };
	if (audience === BookAudience.GRADUATE || audience === BookAudience.PROFESSIONAL)
		return { label: 'Advanced', color: '#F59E0B' };
	return { label: 'Intermediate', color: '#64748B' };
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

type AutoDeskDestination = {
	destinationDeskId: string;
	floorId: string;
	x: number;
	y: number;
	theta: number;
};

const DESK_DESTINATION_MAP: Record<'A' | 'B', AutoDeskDestination> = {
	A: { destinationDeskId: 'A', floorId: 'floor_1', x: 293, y: 255, theta: 0 },
	B: { destinationDeskId: 'B', floorId: 'floor_1', x: 487, y: 255, theta: 0 },
};

const parseNumeric = (value: any): number | null => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDeskDestination = (raw: any): AutoDeskDestination | null => {
	if (!raw || typeof raw !== 'object') return null;
	const destination = raw.destination ?? raw.pose ?? raw.position ?? raw.location ?? raw.coordinates ?? raw;
	const destinationDeskId =
		raw.destinationDeskId ?? raw.deskId ?? raw.desk?.id ?? raw.studentDeskId ?? raw.id;
	const floorId = destination.floorId ?? raw.floorId ?? raw.floor ?? raw.floor?.id;
	const x = parseNumeric(destination.x ?? raw.x);
	const y = parseNumeric(destination.y ?? raw.y);
	const theta = parseNumeric(destination.theta ?? raw.theta);

	if (!destinationDeskId || !floorId || x === null || y === null || theta === null) return null;
	return {
		destinationDeskId: String(destinationDeskId).trim(),
		floorId: String(floorId).trim(),
		x,
		y,
		theta,
	};
};

const resolveAutoDeskDestination = (user: any): AutoDeskDestination | null => {
	const userCandidates = [
		user?.studentDesk,
		user?.desk,
		user?.destination,
		user?.deliveryDestination,
		user,
	];
	for (const candidate of userCandidates) {
		const normalized = normalizeDeskDestination(candidate);
		if (normalized) return normalized;
	}

	if (typeof window !== 'undefined') {
		for (const storageKey of AUTO_DESTINATION_STORAGE_KEYS) {
			const raw = window.localStorage.getItem(storageKey);
			if (!raw) continue;
			try {
				const parsed = JSON.parse(raw);
				const normalized = normalizeDeskDestination(parsed);
				if (normalized) return normalized;
			} catch (_err) {}
		}
	}

	return null;
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
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(INITIAL_COMMENT_INQUIRY);
	const [bookComments, setBookComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.BOOK,
		commentContent: '',
		commentRefId: '',
	});

	const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);
	const [selectedDeskId, setSelectedDeskId] = useState<'A' | 'B' | null>(null);
	const [isDeskSubmitting, setIsDeskSubmitting] = useState(false);

	/** APOLLO REQUESTS **/
	const [likeTargetBook] = useMutation(LIKE_TARGET_BOOK);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [createDeliveryRequest, { loading: createRequestLoading }] = useMutation(CREATE_DELIVERY_REQUEST);

	const { loading: getBookLoading, data: getBookData, refetch: getBookRefetch } = useQuery(GET_BOOK, {
		fetchPolicy: 'network-only',
		variables: { input: bookId },
		skip: !bookId,
		notifyOnNetworkStatusChange: true,
	});

	const { data: getCommentsData, refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!getBookData) return;
		if (getBookData?.getBook) setBook(getBookData.getBook);
		setSlideImage(getBookData?.getBook?.bookImages?.[0] ?? '');
	}, [getBookData]);

	useEffect(() => {
		if (!getCommentsData) return;
		if (getCommentsData?.getComments?.list) setBookComments(getCommentsData.getComments.list);
		setCommentTotal(getCommentsData?.getComments?.metaCounter?.[0]?.total ?? 0);
	}, [getCommentsData]);

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

	const createDeliveryRequestHandler = async (
		requestType: RequestType,
		options?: {
			deskId?: 'A' | 'B';
			destinationType?: DeliveryDestinationType;
			skipSuccessToast?: boolean;
		},
	): Promise<boolean> => {
		try {
			if (!book?._id) return false;
			const destinationType =
				options?.destinationType ??
				(requestType === RequestType.BORROW
					? DeliveryDestinationType.STUDENT_DESK
					: DeliveryDestinationType.RECEPTION);
			const selectedDeskDestination = options?.deskId ? DESK_DESTINATION_MAP[options.deskId] : null;
			const autoDestination = requestType === RequestType.BORROW ? resolveAutoDeskDestination(user) : null;
			const destination = selectedDeskDestination ?? autoDestination;

			const input: CreateDeliveryRequestInput = {
				bookId: book._id,
				requestType,
				destinationType,
			};
			if (destination) {
				input.destinationDeskId = destination.destinationDeskId;
				input.destination = {
					floorId: destination.floorId,
					x: destination.x,
					y: destination.y,
					theta: destination.theta,
				};
			}

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

			if (!options?.skipSuccessToast) {
				if (requestType === RequestType.PURCHASE) {
					await sweetTopSuccessAlert('Request sent successfully — Book will be delivered to Reception', 1800);
				} else {
					await sweetTopSuccessAlert('Request sent successfully', 1800);
				}
			}

			return true;
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message ?? 'Request failed');
			return false;
		}
	};

	const openDeskSelectionModal = () => {
		setSelectedDeskId(null);
		setIsDeskModalOpen(true);
	};

	const closeDeskSelectionModal = () => {
		if (isDeskSubmitting) return;
		setIsDeskModalOpen(false);
	};

	const confirmDeskSelection = async () => {
		if (!selectedDeskId) return;
		setIsDeskSubmitting(true);
		const success = await createDeliveryRequestHandler(RequestType.BORROW, {
			deskId: selectedDeskId,
			destinationType: DeliveryDestinationType.STUDENT_DESK,
			skipSuccessToast: true,
		});

		if (success) {
			setIsDeskModalOpen(false);
			setSelectedDeskId(null);
			setIsDeskSubmitting(false);
			await new Promise((resolve) => setTimeout(resolve, 150));
			await sweetTopSuccessAlert('Request sent successfully', 1800);
			return;
		}

		setIsDeskSubmitting(false);
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
	const bookDescription = book?.bookDescription?.trim() ?? '';

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
		{ label: 'Borrow period', value: '14 days maximum', icon: CalendarTodayIcon },
		{ label: 'Renewals', value: '1 renewal allowed before due date', icon: AutorenewIcon },
		{ label: 'Late fee', value: '₩100 per day after due date', icon: WarningAmberIcon },
		{ label: 'Return method', value: 'Reception desk or library return station', icon: AssignmentReturnIcon },
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
				background: '#ffffff',
				minHeight: '100vh',
				paddingBottom: isMobile ? 40 : 64,
			}}
		>
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: isMobile ? 280 : 420,
					overflow: 'hidden',
				}}
			>
					<img
						src="/img/property/book-detail-banner.png"
						alt="Book Detail Banner"
						style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
					/>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.42) 100%)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<div
							className="container"
							style={{
								width: '100%',
								maxWidth: 1300,
								padding: isMobile ? '0 16px' : '0',
								boxSizing: 'border-box',
							}}
						>
							<div
								style={{
									width: 'fit-content',
									marginTop: isMobile ? 92 : 175,
									display: 'flex',
									flexDirection: 'column',
									gap: isMobile ? 4 : 6,
								}}
							>
								<h1
									style={{
										color: '#FFFFFF',
										fontFamily: "'Inter', 'Noto Sans KR', -apple-system, sans-serif",
										fontSize: isMobile ? 40 : 56,
										fontStyle: 'normal',
										fontWeight: 600,
										lineHeight: 'normal',
										letterSpacing: isMobile ? '0.8px' : '0.96px',
										textTransform: 'capitalize',
										textShadow: '0 2px 12px rgba(0,0,0,0.35)',
										margin: 0,
									}}
								>
									Book Detail
								</h1>
								<div
									style={{
										fontSize: isMobile ? 18 : 28,
										fontFamily: "'Inter', 'Noto Sans KR', -apple-system, sans-serif",
										fontWeight: 400,
										lineHeight: isMobile ? '22px' : '30px',
										color: '#FFFFFF',
										display: 'flex',
										alignItems: 'center',
										gap: 8,
									}}
								>
									<Link href="/" style={{ color: '#FFFFFF', textDecoration: 'none' }}
										onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
										onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
									>
										Home
									</Link>
									<span>/</span>
									<Link href="/books" style={{ color: '#FFFFFF', textDecoration: 'none' }}
										onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; }}
										onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; }}
									>
										Books
									</Link>
									<span>/</span>
									<span>Book Detail</span>
								</div>
							</div>
						</div>
					</div>
			</div>

			<div
				className="container"
				style={{
					width: '100%',
					maxWidth: 1300,
					padding: isMobile ? '0 16px' : '0',
					boxSizing: 'border-box',
					display: 'block',
				}}
			>
				<Stack spacing={{ xs: 3, md: 4 }} sx={{ mt: '24px' }}>
					<SafeBox
						sx={{
							...cardSx,
							p: { xs: 2, sm: 3, md: 4 },
						}}
					>
						<SafeBox
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', lg: '520px minmax(0, 1fr)' },
								gap: { xs: 3, md: 4.5 },
								alignItems: 'start',
							}}
						>
							<Stack spacing={2}>
								<SafeBox
									sx={{
										borderRadius: '20px',
										overflow: 'hidden',
										background: '#f5f7fa',
										border: `1px solid ${libraryColors.border}`,
										height: { xs: 360, sm: 520, lg: 600 },
										display: 'grid',
										placeItems: 'center',
										p: { xs: 1.2, sm: 1.6 },
									}}
								>
									<SafeBox
										component="img"
										src={resolveMediaUrl(currentImage, '/img/banner/books_hero.png')}
										alt={book?.bookTitle ?? 'Book cover'}
										sx={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', borderRadius: '14px' }}
									/>
								</SafeBox>
								<Stack
									direction="row"
									spacing={1.5}
									sx={{ overflowX: 'auto', pb: 1, WebkitOverflowScrolling: 'touch' }}
								>
									{imageList.map((img: string, index: number) => {
										const isActive = currentImage === img;
										return (
											<SafeBox
												key={`${img}-${index}`}
												component="button"
												type="button"
												onClick={() => changeImageHandler(img)}
												sx={{
													width: { xs: 72, sm: 100, md: 120 },
													height: { xs: 72, sm: 100, md: 120 },
													p: '4px',
													borderRadius: '12px',
													border: isActive ? `2px solid ${libraryColors.navy}` : `1px solid ${libraryColors.border}`,
													background: '#f5f7fa',
													cursor: 'pointer',
													flex: '0 0 auto',
													'&:hover': { borderColor: libraryColors.navy },
												}}
											>
												<SafeBox
													component="img"
													src={resolveMediaUrl(img, '/img/banner/books_hero.png')}
													alt="Book thumbnail"
													sx={{
														width: '100%',
														height: '100%',
														objectFit: 'contain',
														objectPosition: 'center',
														borderRadius: '8px',
														display: 'block',
														background: '#f5f7fa',
													}}
												/>
											</SafeBox>
										);
									})}
								</Stack>
							</Stack>

							<Stack spacing={3}>
								<Stack spacing={1} sx={{ minWidth: 0 }}>
									<Typography variant={isMobile ? 'h4' : 'h2'} sx={{ color: libraryColors.ink, fontWeight: 800, lineHeight: 1.2, overflowWrap: 'break-word' }}>
										{book?.bookTitle ?? 'Book title unavailable'}
									</Typography>
									<Typography sx={{ color: libraryColors.muted, fontSize: 18, fontWeight: 500 }}>
										{book?.bookAuthor ? `by ${book.bookAuthor}` : 'Author unavailable'}
									</Typography>
								</Stack>

								<Stack direction="row" spacing={2} alignItems="center">
									<Typography sx={{ color: libraryColors.ink, fontSize: 32, fontWeight: 800 }}>
										{formatPrice(book)}
									</Typography>
									{book?.bookPrice?.isDiscounted && book?.bookPrice?.discountPercent ? (
										<Typography sx={{ color: libraryColors.muted, textDecoration: 'line-through', fontSize: 18 }}>
											{book.bookPrice.amount.toLocaleString()} {book.bookPrice.currency}
										</Typography>
									) : null}
								</Stack>

								<Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
									{book?.isBorrowable && <Chip label="Borrowable" sx={{ background: '#f8fafb', color: '#1A1A2E', fontWeight: 500, border: '1px solid #64748B', borderRadius: '999px', fontSize: 13, px: 1.5, py: 0.5 }} />}
									{book?.isPurchasable && <Chip label="Purchasable" sx={{ background: '#f8fafb', color: '#1A1A2E', fontWeight: 500, border: '1px solid #64748B', borderRadius: '999px', fontSize: 13, px: 1.5, py: 0.5 }} />}
									{book?.bookStatus && <Chip label={formatLabel(book.bookStatus)} sx={{ background: '#E6F5EF', color: '#4DA882', fontWeight: 500, border: 'none', borderRadius: '999px', fontSize: 13, px: 1.5, py: 0.5 }} />}
								</Stack>

								<Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
									<Stack direction="row" spacing={0.8} alignItems="center" sx={{ px: 1.5, py: 1, borderRadius: '12px', background: '#fff', border: `1px solid ${libraryColors.border}` }}>
										<RemoveRedEyeIcon sx={{ fontSize: 20, color: libraryColors.muted }} />
										<Typography sx={{ color: libraryColors.ink, fontWeight: 700 }}>{book?.bookViews ?? 0}</Typography>
									</Stack>
									<Stack
										component="button"
										type="button"
										direction="row"
										spacing={0.8}
										alignItems="center"
										onClick={() => likeBookHandler(user, book?._id ?? '')}
										sx={{
											px: 1.5,
											py: 1,
											borderRadius: '12px',
											background: '#fff',
											border: `1px solid ${libraryColors.border}`,
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
										}}
									>
										{book?.meLiked?.[0]?.myFavorite ? <FavoriteIcon sx={{ fontSize: 20, color: '#ef4444' }} /> : <FavoriteBorderIcon sx={{ fontSize: 20, color: libraryColors.muted }} />}
										<Typography sx={{ color: libraryColors.ink, fontWeight: 700 }}>{book?.bookLikes ?? 0}</Typography>
									</Stack>
								</Stack>

								{bookDescription.length > 0 && (
									<Stack spacing={1} sx={{ mt: { xs: 2.25, md: 2.5 } }}>
										<Typography
											sx={{
												color: libraryColors.ink,
												fontSize: 13,
												fontWeight: 700,
												letterSpacing: '0.04em',
												textTransform: 'uppercase',
											}}
										>
											Description
										</Typography>
										<Typography
											sx={{
												color: '#111827',
												fontSize: { xs: 14.5, sm: 15.5 },
												lineHeight: 1.6,
												fontWeight: 400,
												whiteSpace: 'pre-line',
												overflowWrap: 'anywhere',
											}}
										>
											{bookDescription}
										</Typography>
									</Stack>
								)}

								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<Button
										variant="outlined"
										startIcon={<LocalShippingOutlinedIcon />}
										disabled={createRequestLoading || !book?.isBorrowable}
										onClick={openDeskSelectionModal}
										sx={{
											flex: 1,
											height: 52,
											background: '#FFFFFF',
											borderColor: '#E2E8F0',
											color: '#1A1A2E',
											borderRadius: '12px',
											textTransform: 'none',
											fontSize: 16,
											fontWeight: 700,
											'&:hover': { background: '#F8FAFC', borderColor: '#1B3A6B' },
										}}
									>
										Borrow
									</Button>
									<Button
										variant="outlined"
										startIcon={<ShoppingBagOutlinedIcon />}
										disabled={createRequestLoading || !book?.isPurchasable}
										onClick={() =>
											createDeliveryRequestHandler(RequestType.PURCHASE, {
												destinationType: DeliveryDestinationType.RECEPTION,
											})
										}
										sx={{
											flex: 1,
											height: 52,
											background: '#FFFFFF',
											borderColor: '#E2E8F0',
											color: '#1A1A2E',
											borderRadius: '12px',
											textTransform: 'none',
											fontSize: 16,
											fontWeight: 700,
											'&:hover': { background: '#F8FAFC', borderColor: '#1B3A6B' },
										}}
									>
										Commercial
									</Button>
								</Stack>

								<SafeBox sx={{ border: `1px solid ${libraryColors.border}`, borderRadius: '16px', overflow: 'hidden' }}>
									<SafeBox sx={{ px: 2, py: 1.5, background: '#F8FAFC', borderBottom: `1px solid ${libraryColors.border}` }}>
										<Typography sx={{ color: libraryColors.ink, fontWeight: 700 }}>Catalog Record</Typography>
									</SafeBox>
									<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
										{metaItems.map(({ label, value, icon: Icon }, index) => (
											<SafeBox
												key={label}
												sx={{
													p: 2,
													borderRight: { sm: (index + 1) % (isMobile ? 2 : 3) === 0 ? 'none' : `1px solid ${libraryColors.border}` },
													borderBottom: index < metaItems.length - (isMobile ? 1 : 3) ? `1px solid ${libraryColors.border}` : 'none',
												}}
											>
												<Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
													<Icon sx={{ fontSize: 18, color: libraryColors.muted }} />
													<Typography sx={{ color: libraryColors.muted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{label}</Typography>
												</Stack>
												<Typography sx={{ color: libraryColors.ink, fontWeight: 700 }}>{value}</Typography>
											</SafeBox>
										))}
									</SafeBox>
								</SafeBox>
							</Stack>
						</SafeBox>
					</SafeBox>


					<SafeBox sx={{ mb: 4 }}>
						<BookDetailTabs
							book={book}
							bookComments={bookComments}
							commentTotal={commentTotal}
							commentInquiry={commentInquiry}
							reviewRating={reviewRating}
							setReviewRating={setReviewRating}
							insertCommentData={insertCommentData}
							setInsertCommentData={setInsertCommentData}
							createCommentHandler={createCommentHandler}
							commentPaginationChangeHandler={commentPaginationChangeHandler}
							user={user}
							isMobile={isMobile}
						/>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 }, mt: 2 }}>
						<YouMayAlsoLike
							currentBookId={book?._id ?? ''}
							category={book?.bookCategory ?? ''}
						/>
					</SafeBox>

				</Stack>
			</div>
			<Dialog
				open={isDeskModalOpen}
				onClose={closeDeskSelectionModal}
				fullWidth
				maxWidth="xs"
				slotProps={{
					backdrop: {
						sx: { backgroundColor: 'rgba(15, 23, 42, 0.55)' },
					},
				}}
				PaperProps={{
					sx: {
						borderRadius: '16px',
						border: `1px solid ${libraryColors.border}`,
						backgroundColor: '#ffffff',
					},
				}}
			>
				<DialogTitle sx={{ color: libraryColors.ink, fontWeight: 700, pb: 1 }}>
					Where would you like the book delivered?
				</DialogTitle>
				<DialogContent sx={{ pt: '8px !important' }}>
					<Stack spacing={1.2}>
						{(['A', 'B'] as const).map((deskId) => {
							const selected = selectedDeskId === deskId;
							return (
								<Button
									key={deskId}
									variant="outlined"
									onClick={() => setSelectedDeskId(deskId)}
									sx={{
										height: 50,
										justifyContent: 'flex-start',
										textTransform: 'none',
										fontWeight: 700,
										borderColor: selected ? libraryColors.navy : libraryColors.border,
										color: libraryColors.ink,
										backgroundColor: selected ? libraryColors.soft : '#ffffff',
										'&:hover': {
											borderColor: libraryColors.navy,
											backgroundColor: selected ? libraryColors.soft : '#ffffff',
										},
									}}
								>
									Desk {deskId}
								</Button>
							);
						})}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5 }}>
					<Button
						onClick={closeDeskSelectionModal}
						disabled={isDeskSubmitting}
						sx={{ textTransform: 'none', color: libraryColors.muted, fontWeight: 700 }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={confirmDeskSelection}
						disabled={!selectedDeskId || isDeskSubmitting}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							opacity: isDeskSubmitting ? 0.75 : 1,
							backgroundColor: libraryColors.navy,
							color: '#ffffff',
							'&:hover': { backgroundColor: libraryColors.navy },
							'&.Mui-disabled': {
								backgroundColor: '#cbd5e1',
								color: '#ffffff',
							},
						}}
					>
						{isDeskSubmitting ? 'Sending...' : 'Confirm'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default withLayoutBasic(BookDetailPage);
