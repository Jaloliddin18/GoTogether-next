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
import { GET_BOOK, GET_BOOKS } from '../../apollo/library/query';
import { GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_BOOK, CREATE_COMMENT, CREATE_DELIVERY_REQUEST } from '../../apollo/user/mutation';
import { announceTrackingRequest } from '../../libs/library/ws/trackingClient';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import YouMayAlsoLike from '../../src/components/books/YouMayAlsoLike';

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

	const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
	const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);
	const [selectedDeskId, setSelectedDeskId] = useState<'A' | 'B' | null>(null);
	const [isDeskSubmitting, setIsDeskSubmitting] = useState(false);

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
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<h1
							style={{
								color: '#FFFFFF',
								fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
								fontSize: isMobile ? 32 : 48,
								fontWeight: 700,
								textShadow: '0 2px 12px rgba(0,0,0,0.4)',
								margin: 0,
							}}
						>
							Book Detail
						</h1>
						<div
							style={{
								marginTop: 12,
								fontSize: isMobile ? 16 : 18,
								fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
								color: 'rgba(255,255,255,0.85)',
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							<Link href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}
								onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
								onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
							>
								Home
							</Link>
							<span style={{ color: 'rgba(255,255,255,0.6)' }}>›</span>
							<Link href="/books" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}
								onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'; (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF'; }}
								onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
							>
								Books
							</Link>
							<span style={{ color: 'rgba(255,255,255,0.6)' }}>›</span>
							<span>Book Detail</span>
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
										background: '#ffffff',
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
										sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '14px' }}
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
													background: '#fff',
													cursor: 'pointer',
													flex: '0 0 auto',
													'&:hover': { borderColor: libraryColors.navy },
												}}
											>
												<SafeBox
													component="img"
													src={resolveMediaUrl(img, '/img/banner/books_hero.png')}
													alt="Book thumbnail"
													sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
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
									{book?.bookStatus && <Chip label={formatLabel(book.bookStatus)} sx={{ background: '#f8fafb', color: '#64748B', fontWeight: 500, border: '1px solid #64748B', borderRadius: '999px', fontSize: 13, px: 1.5, py: 0.5 }} />}
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


					<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>
						<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
							<Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>Physical Details</Typography>
							<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
								{physicalItems.map(({ label, value, icon: Icon }) => (
									<Stack key={label} spacing={1} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#F8FAFC' }}>
										<SafeBox sx={{ color: libraryColors.muted }}><Icon /></SafeBox>
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
									<Stack key={label} spacing={1} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#F8FAFC' }}>
										<SafeBox sx={{ color: color ?? libraryColors.muted }}><Icon /></SafeBox>
										<Typography sx={{ color: libraryColors.muted, fontSize: 13, fontWeight: 800 }}>{label}</Typography>
										<Typography sx={{ color: color ?? libraryColors.ink, fontSize: 18, fontWeight: 900 }}>{value}</Typography>
									</Stack>
								))}
							</SafeBox>
							<Stack direction="row" gap={1} flexWrap="wrap">
								{['Best read: Morning', 'Study aid: Yes', 'Note-taking: Recommended'].map((tag) => (
									<Chip key={tag} label={tag} sx={{ borderRadius: '999px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: libraryColors.muted, fontWeight: 700 }} />
								))}
							</Stack>
						</SafeBox>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 }, mt: 2 }}>
						<YouMayAlsoLike
							currentBookId={book?._id ?? ''}
							category={book?.bookCategory ?? ''}
						/>
					</SafeBox>

					<SafeBox sx={{ ...cardSx, p: { xs: 2.4, md: 3.5 } }}>
						<Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>Borrowing Policy</Typography>
						<SafeBox sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
							{policyItems.map(({ label, value, icon: Icon }) => (
								<Stack key={label} direction="row" spacing={1.5} sx={{ p: 2, borderRadius: '20px', border: `1px solid ${libraryColors.border}`, background: '#F8FAFC' }}>
									<SafeBox sx={{ width: 42, height: 42, borderRadius: '15px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: libraryColors.muted, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><Icon /></SafeBox>
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
							<SafeBox>
								<Typography sx={sectionTitleSx}>Reviews</Typography>
								<Typography sx={{ color: libraryColors.muted, fontWeight: 600 }}>{reviewLabel}</Typography>
							</SafeBox>
						</Stack>

						<Stack spacing={1.5} mb={3}>
							{bookComments.length === 0 ? (
								<SafeBox sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '22px', background: '#F8FAFC', border: `1px dashed ${libraryColors.border}`, textAlign: 'center' }}>
									<Typography sx={{ color: libraryColors.ink, fontWeight: 900, mb: 0.5 }}>No reviews yet</Typography>
									<Typography sx={{ color: libraryColors.muted }}>Be the first reader to leave a note about this book.</Typography>
								</SafeBox>
							) : (
								bookComments.map((comment: Comment) => {
									const avatarSrc = resolveMediaUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');
									return (
										<Stack key={comment._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.7} sx={{ p: 2, background: '#F8FAFC', border: `1px solid ${libraryColors.border}`, borderRadius: '22px' }}>
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

						<SafeBox sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '24px', background: '#F8FAFC', border: `1px solid ${libraryColors.border}` }}>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.7} alignItems="flex-start">
								<Avatar src={resolveMediaUrl(user?.memberImage, '/img/profile/defaultUser.svg')} alt={user?.memberNick ?? 'Reader'} sx={{ width: 48, height: 48 }} />
								<Stack spacing={1.4} sx={{ flex: 1, width: '100%' }}>
									<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
										<SafeBox>
											<Typography sx={{ color: libraryColors.ink, fontSize: 18, fontWeight: 900 }}>Leave Review</Typography>
											<Typography sx={{ color: libraryColors.muted, fontSize: 13 }}>Share a useful note for the next reader.</Typography>
										</SafeBox>
										<Rating value={reviewRating} onChange={(_event, value) => setReviewRating(value)} sx={{ '& .MuiRating-iconEmpty': { color: '#E2E8F0' }, '& .MuiRating-iconFilled': { color: '#F59E0B' } }} />
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
												'& fieldset': { borderColor: '#E2E8F0' },
												'&:hover fieldset': { borderColor: '#1B3A6B' },
												'&.Mui-focused fieldset': { borderColor: '#1B3A6B', borderWidth: '2px' },
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
												background: libraryColors.navy,
												borderRadius: '16px',
												textTransform: 'none',
												fontWeight: 900,
												'&:hover': { background: '#142d52' },
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
											<SafeBox onClick={() => router.push(`/books/detail?id=${b._id}`)} sx={{ cursor: 'pointer', background: '#F8FAFC', borderRadius: '22px', overflow: 'hidden', border: `1px solid ${libraryColors.border}`, transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 32px rgba(15, 31, 51, 0.1)' } }}>
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
