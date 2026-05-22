import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Box as MuiBox, Divider as MuiDivider, IconButton, Typography as MuiTypography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { GET_BOOKS } from '../../../apollo/library/query';
import { LIKE_BOOK } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Book } from '../../../libs/types/book/book';
import { T } from '../../../libs/types/common';
import { Direction, Message } from '../../../libs/enums/common.enum';
import { resolveMediaUrl } from '../../../libs/utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

interface YouMayAlsoLikeProps {
	currentBookId: string;
	category: string;
}

const getInitials = (title?: string) => {
	const words = title?.trim().split(/\s+/).filter(Boolean) ?? [];
	return (words[0]?.[0] ?? 'B') + (words[1]?.[0] ?? 'K');
};

interface CardProps {
	book: Book;
	likeHandler: (e: React.MouseEvent, bookId: string) => void | Promise<void>;
}

const badgeBase: React.CSSProperties = {
	position: 'absolute',
	top: '12px',
	background: 'rgba(255,255,255,.85)',
	backdropFilter: 'blur(8px)',
	WebkitBackdropFilter: 'blur(8px)',
	border: '1px solid rgba(255,255,255,.6)',
	borderRadius: '100px',
	padding: '4px 12px',
	fontSize: '.7rem',
	fontWeight: 700,
	letterSpacing: '.06em',
	textTransform: 'uppercase',
	lineHeight: 1.2,
};

const YouMayAlsoLikeCard = ({ book, likeHandler }: CardProps) => {
	const router = useRouter();
	const liked = book?.meLiked?.[0]?.myFavorite ?? false;
	const likeCount = book?.bookLikes ?? 0;
	const [imageFailed, setImageFailed] = useState(false);
	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '');
	const availabilityLabel = book.isPurchasable ? 'Purchasable' : book.isBorrowable ? 'Borrowable' : '';
	const availabilityColor = book.isPurchasable ? '#059669' : '#1a6fd4';

	return (
		<MuiBox
			onClick={() => router.push(`/books/detail?id=${book._id}`)}
			sx={{
				width: '100%',
				backgroundColor: '#ffffff',
				borderRadius: '16px',
				border: '1px solid #E2E8F0',
				overflow: 'hidden',
				cursor: 'pointer',
				fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease',
				'&:hover': {
					transform: 'translateY(-6px)',
					boxShadow: '0 20px 40px -8px rgba(26,111,212,.18)',
					borderColor: '#1a6fd4',
				},
			}}
		>
			<MuiBox
				sx={{
					width: '100%',
					height: '240px',
					position: 'relative',
					overflow: 'hidden',
					background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a6e 100%)',
				}}
			>
				{imageUrl && !imageFailed ? (
					<MuiBox
						component="img"
						src={imageUrl}
						alt={book.bookTitle || 'Book cover'}
						onError={() => setImageFailed(true)}
						sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
					/>
				) : (
					<MuiBox
						sx={{
							width: '100%',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a6e 100%)',
							color: 'rgba(255,255,255,.92)',
							fontFamily: "'Sofia Pro', sans-serif",
							fontSize: '2.2rem',
							fontWeight: 800,
							letterSpacing: '.08em',
						}}
					>
						{getInitials(book.bookTitle)}
					</MuiBox>
				)}
				<div style={{ ...badgeBase, left: '12px', color: '#0d1b2e' }}>
					{book.bookCategory?.replace(/_/g, ' ')}
				</div>
				{book.bookRank > 0 ? (
					<div style={{ ...badgeBase, right: '12px', color: '#b45309' }}>Top</div>
				) : (
					!!availabilityLabel && (
						<div style={{ ...badgeBase, right: '12px', color: availabilityColor }}>
							{availabilityLabel}
						</div>
					)
				)}
			</MuiBox>

			<MuiBox sx={{ padding: '16px', display: 'flex', flexDirection: 'column', fontFamily: "'Sofia Pro', sans-serif" }}>
				<MuiTypography
					sx={{
						fontFamily: "'Sofia Pro', sans-serif",
						fontSize: '1.05rem',
						fontWeight: 700,
						color: '#0d1b2e',
						lineHeight: 1.3,
						mb: '5px',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{book.bookTitle}
				</MuiTypography>
				<MuiTypography
					sx={{
						fontFamily: "'Sofia Pro', sans-serif",
						fontSize: '.82rem',
						color: '#5a7a9c',
						mb: '12px',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{book.bookAuthor}
				</MuiTypography>
				<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '10px' }}>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<LanguageIcon sx={{ fontSize: 14, color: '#5a7a9c' }} />
						<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.78rem', color: '#5a7a9c' }}>
							{book.bookLanguage || '-'}
						</MuiTypography>
					</MuiBox>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
						<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.78rem', color: '#5a7a9c' }}>
							{(book?.bookRating?.average ?? 0).toFixed(1)}
						</MuiTypography>
					</MuiBox>
				</MuiBox>
				<MuiDivider sx={{ borderColor: '#e8f0fb', margin: '10px 0' }} />
				<MuiBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<MuiTypography
						sx={{
							fontFamily: "'Sofia Pro', sans-serif",
							fontSize: '.95rem',
							fontWeight: 700,
							color: '#1a6fd4',
						}}
					>
						{book.isPurchasable && book?.bookPrice?.amount
							? `₩ ${book.bookPrice.amount.toLocaleString()}`
							: 'Borrow Only'}
					</MuiTypography>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
							<RemoveRedEyeIcon sx={{ fontSize: 19, color: '#5a7a9c' }} />
							<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.8rem', color: '#5a7a9c' }}>
								{book?.bookViews ?? 0}
							</MuiTypography>
						</MuiBox>
						{book.bookRank > 0 ? (
							<MuiBox
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: '3px',
									backgroundColor: 'rgba(245, 158, 11, 0.16)',
									color: '#b45309',
									borderRadius: '999px',
									padding: '2px 8px',
								}}
							>
								<StarIcon sx={{ fontSize: 11 }} />
								<MuiTypography sx={{ fontSize: '11px', fontWeight: 600 }}>#{book.bookRank}</MuiTypography>
							</MuiBox>
						) : (
							<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
								<IconButton onClick={(e) => likeHandler(e, book._id)} sx={{ padding: '2px' }}>
									<FavoriteIcon sx={{ fontSize: 20, color: liked ? '#ef4444' : '#5a7a9c', transition: 'color 0.2s ease' }} />
								</IconButton>
								<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.8rem', color: '#5a7a9c' }}>
									{likeCount}
								</MuiTypography>
							</MuiBox>
						)}
					</MuiBox>
				</MuiBox>
			</MuiBox>
		</MuiBox>
	);
};

const SkeletonCard = () => (
	<div
		style={{
			width: '100%',
			backgroundColor: '#ffffff',
			borderRadius: '16px',
			border: '1px solid #E2E8F0',
			overflow: 'hidden',
		}}
	>
		<div
			style={{
				width: '100%',
				height: '240px',
				backgroundColor: '#E5E7EB',
				animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}}
		/>
		<div style={{ padding: '16px' }}>
			<div
				style={{
					height: '20px',
					width: '80%',
					backgroundColor: '#E5E7EB',
					borderRadius: '4px',
					marginBottom: '8px',
					animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				}}
			/>
			<div
				style={{
					height: '14px',
					width: '60%',
					backgroundColor: '#E5E7EB',
					borderRadius: '4px',
					marginBottom: '12px',
					animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				}}
			/>
			<div
				style={{
					height: '12px',
					width: '40%',
					backgroundColor: '#E5E7EB',
					borderRadius: '4px',
					marginBottom: '20px',
					animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				}}
			/>
			<div style={{ height: '1px', width: '100%', backgroundColor: '#E5E7EB', marginBottom: '10px' }} />
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div
					style={{
						height: '18px',
						width: '30%',
						backgroundColor: '#E5E7EB',
						borderRadius: '4px',
						animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					}}
				/>
				<div
					style={{
						height: '18px',
						width: '20%',
						backgroundColor: '#E5E7EB',
						borderRadius: '4px',
						animation: 'ymyl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					}}
				/>
			</div>
		</div>
	</div>
);

const YMYL_STYLES = `
@keyframes ymyl-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.ymyl-swiper .swiper-button-prev,
.ymyl-swiper .swiper-button-next {
  color: #1B3A6B !important;
  width: 36px !important;
  height: 36px !important;
}
.ymyl-swiper .swiper-button-prev::after,
.ymyl-swiper .swiper-button-next::after {
  font-size: 18px !important;
}
.ymyl-swiper .swiper-pagination-bullet {
  background-color: #E2E8F0;
  opacity: 1;
}
.ymyl-swiper .swiper-pagination-bullet-active {
  background-color: #1B3A6B;
}
`;

const SectionHeader = () => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			marginBottom: '20px',
			fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		}}
	>
		<div>
			<h2
				style={{
					fontSize: '1.5rem',
					fontWeight: 700,
					color: '#1A1A2E',
					margin: 0,
					fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				}}
			>
				You May Also Like
			</h2>
			<p
				style={{
					fontSize: '0.875rem',
					color: '#64748B',
					margin: '4px 0 0',
					fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				}}
			>
				More books in this category
			</p>
		</div>
		<Link
			href="/books"
			style={{
				fontSize: '0.875rem',
				color: '#2E86DE',
				textDecoration: 'none',
				fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				whiteSpace: 'nowrap',
				marginTop: '4px',
			}}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline';
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none';
			}}
		>
			Browse All Books →
		</Link>
	</div>
);

const YouMayAlsoLike = ({ currentBookId, category }: YouMayAlsoLikeProps) => {
	const [books, setBooks] = useState<Book[]>([]);
	const [likeBook] = useMutation(LIKE_BOOK);
	const user = useReactiveVar(userVar);

	const { loading } = useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 8,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { bookCategory: category },
			},
		},
		skip: !category,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const list = (data?.getBooks?.list as Book[]) ?? [];
			setBooks(list.filter((b) => b._id !== currentBookId));
		},
	});

	const likeHandler = async (e: React.MouseEvent, bookId: string) => {
		e.stopPropagation();
		try {
			if (!bookId) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeBook({ variables: { input: bookId } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (loading) {
		return (
			<div style={{ fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
				<style>{YMYL_STYLES}</style>
				<SectionHeader />
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</div>
		);
	}

	if (books.length === 0) return null;

	return (
		<div style={{ fontFamily: "'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
			<style>{YMYL_STYLES}</style>
			<SectionHeader />
			<Swiper
				className="ymyl-swiper"
				modules={[Navigation, Pagination]}
				spaceBetween={24}
				navigation
				pagination={{ clickable: true }}
				breakpoints={{
					0: { slidesPerView: 1 },
					768: { slidesPerView: 2 },
					1024: { slidesPerView: 3 },
				}}
				style={{ paddingBottom: '40px' }}
			>
				{books.map((book) => (
					<SwiperSlide key={book._id}>
						<YouMayAlsoLikeCard book={book} likeHandler={likeHandler} />
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default YouMayAlsoLike;
