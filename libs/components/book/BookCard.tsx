import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/router';
import { getBookDetailRoute, resolveMediaUrl } from '../../utils';

export interface BookCardModel {
	_id: string;
	bookTitle: string;
	bookAuthor?: string;
	bookImages?: string[];
	bookCategory?: string;
	bookStatus?: string;
	bookLanguage?: string;
	isBorrowable?: boolean;
	isPurchasable?: boolean;
	bookPrice?: {
		amount?: number;
		currency?: string;
	};
	bookRating?: {
		average?: number;
	};
	bookViews?: number;
	bookLikes?: number;
	meLiked?: Array<{ myFavorite?: boolean }>;
}

interface BookCardProps {
	book: BookCardModel;
	likeHandler?: (e: React.MouseEvent, bookId: string) => void | Promise<void>;
	className?: string;
	sx?: SxProps<Theme>;
}

const formatTag = (value?: string, fallback: string = 'GENERAL'): string => {
	if (!value) return fallback;
	return value.replace(/_/g, ' ').toUpperCase();
};

const getStatusTag = (book: BookCardModel): string => {
	if (book.isBorrowable) return 'BORROWABLE';
	if (book.isPurchasable) return 'PURCHASABLE';
	return formatTag(book.bookStatus, 'REFERENCE');
};

const getPriceLabel = (book: BookCardModel): string => {
	if (book.isPurchasable && (book.bookPrice?.amount ?? 0) > 0) {
		const amount = Number(book.bookPrice?.amount ?? 0).toLocaleString();
		return `₩ ${amount}`;
	}
	return 'Borrow Only';
};

const badgeBaseSx: SxProps<Theme> = {
	position: 'absolute',
	top: 14,
	zIndex: 2,
	display: 'inline-flex',
	alignItems: 'center',
	height: 38,
	px: '18px',
	borderRadius: '999px',
	color: '#fff',
	fontSize: '11px',
	fontWeight: 700,
	letterSpacing: '0.5px',
	boxShadow: '0 8px 18px rgba(8, 12, 22, 0.34)',
	backdropFilter: 'blur(10px)',
	WebkitBackdropFilter: 'blur(10px)',
};

const BookCard = ({ book, likeHandler, className, sx }: BookCardProps) => {
	const router = useRouter();
	const liked = book?.meLiked?.[0]?.myFavorite ?? false;
	const views = book?.bookViews ?? 0;
	const likes = book?.bookLikes ?? 0;
	const rating = Number(book?.bookRating?.average ?? 0).toFixed(1);
	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '/img/banner/header1.svg');
	const detailRoute = getBookDetailRoute(book?._id);

	const navigateToDetail = async () => {
		if (!book?._id) return;
		await router.push(detailRoute);
	};

	const likeClickHandler = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!book?._id || !likeHandler) return;
		await likeHandler(e, book._id);
	};

	return (
		<Box
			className={className}
			onClick={navigateToDetail}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					navigateToDetail().then();
				}
			}}
			sx={{
				width: '100%',
				backgroundColor: '#ffffff',
				borderRadius: '28px',
				border: '1px solid rgba(226, 232, 240, 0.95)',
				overflow: 'hidden',
				cursor: 'pointer',
				boxShadow: '0 12px 32px rgba(15, 31, 51, 0.09)',
				transition: 'transform .35s ease, box-shadow .35s ease',
				'&:hover': {
					transform: 'translateY(-8px) scale(1.01)',
					boxShadow: '0 26px 48px rgba(15, 31, 51, 0.18)',
				},
				'&:hover .book-card-image': {
					transform: 'scale(1.03)',
				},
				...sx,
			}}
		>
			<Box sx={{ width: '100%', minHeight: { xs: 220, sm: 240 }, position: 'relative', overflow: 'hidden' }}>
				<Box
					component="img"
					src={imageUrl}
					alt={book.bookTitle || 'Book cover'}
					className="book-card-image"
					sx={{
						width: '100%',
						height: { xs: 220, sm: 240, md: 252 },
						objectFit: 'cover',
						display: 'block',
						transition: 'transform .35s ease',
					}}
				/>
				<Box sx={{ ...badgeBaseSx, left: 14, background: 'rgba(18, 25, 40, 0.92)' }}>{formatTag(book.bookCategory)}</Box>
				<Box sx={{ ...badgeBaseSx, right: 14, background: 'rgba(24, 150, 90, 0.95)' }}>{getStatusTag(book)}</Box>
			</Box>

			<Box sx={{ p: { xs: 2.2, md: 2.4 }, display: 'flex', flexDirection: 'column', gap: 1.15 }}>
				<Typography
					onClick={(e) => {
						e.stopPropagation();
						navigateToDetail().then();
					}}
					sx={{
						fontSize: { xs: '1.06rem', md: '1.14rem' },
						fontWeight: 800,
						color: '#0f172a',
						lineHeight: 1.33,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{book.bookTitle}
				</Typography>

				<Typography
					sx={{
						fontSize: '0.92rem',
						color: '#51627a',
						lineHeight: 1.35,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{book.bookAuthor || 'Unknown author'}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
					<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.55 }}>
						<LanguageIcon sx={{ fontSize: 17, color: '#5f738c' }} />
						<Typography sx={{ fontSize: '0.9rem', color: '#5f738c', fontWeight: 600 }}>{book.bookLanguage || '-'}</Typography>
					</Box>
					<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.55 }}>
						<StarIcon sx={{ fontSize: 17, color: '#f59e0b' }} />
						<Typography sx={{ fontSize: '0.9rem', color: '#5f738c', fontWeight: 700 }}>{rating}</Typography>
					</Box>
				</Box>

				<Divider sx={{ borderColor: '#e2e8f0' }} />

				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Typography sx={{ fontSize: { xs: '0.98rem', md: '1.06rem' }, fontWeight: 800, color: '#1a6fd4' }}>
						{getPriceLabel(book)}
					</Typography>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.55 }}>
							<VisibilityOutlinedIcon sx={{ fontSize: 23, color: '#64748b' }} />
							<Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>{views}</Typography>
						</Box>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45 }}>
							{likeHandler ? (
								<IconButton onClick={likeClickHandler} sx={{ p: 0.45 }}>
									{liked ? (
										<FavoriteRoundedIcon sx={{ fontSize: 23, color: '#ef4444' }} />
									) : (
										<FavoriteBorderRoundedIcon sx={{ fontSize: 23, color: '#64748b' }} />
									)}
								</IconButton>
							) : liked ? (
								<FavoriteRoundedIcon sx={{ fontSize: 23, color: '#ef4444' }} />
							) : (
								<FavoriteBorderRoundedIcon sx={{ fontSize: 23, color: '#64748b' }} />
							)}
							<Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>{likes}</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default BookCard;
