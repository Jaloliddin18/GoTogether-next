import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/router';
import { resolveMediaUrl } from '../../utils';

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

const getPriceLabel = (book: BookCardModel): string => {
	if (book.isPurchasable && (book.bookPrice?.amount ?? 0) > 0) {
		const amount = Number(book.bookPrice?.amount ?? 0).toLocaleString();
		return `₩ ${amount}`;
	}
	return 'Borrow Only';
};

const BookCard = ({ book, likeHandler, className, sx }: BookCardProps) => {
	const router = useRouter();
	const liked = book?.meLiked?.[0]?.myFavorite ?? false;
	const views = book?.bookViews ?? 0;
	const likes = book?.bookLikes ?? 0;
	const rating = Number(book?.bookRating?.average ?? 0).toFixed(1);
	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '');
	const [imageFailed, setImageFailed] = React.useState(false);

	const getInitials = (title?: string) => {
		const words = title?.trim().split(/\s+/).filter(Boolean) ?? [];
		return (words[0]?.[0] ?? 'B') + (words[1]?.[0] ?? 'K');
	};

	const navigateToDetail = async () => {
		if (!book?._id) return;
		await router.push(`/books/detail?id=${book._id}`);
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
				borderRadius: '16px',
				border: '1px solid #e8f0fb',
				overflow: 'hidden',
				cursor: 'pointer',
				fontFamily: "'Sofia Pro', sans-serif",
				transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				'&:hover': {
					transform: 'translateY(-6px)',
					boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.16)',
				},
				...sx,
			}}
		>
			<Box
				sx={{
					width: '100%',
					height: 240,
					position: 'relative',
					overflow: 'hidden',
					background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a6e 100%)',
				}}
			>
				{imageUrl && !imageFailed ? (
					<Box
						component="img"
						src={imageUrl}
						alt={book.bookTitle || 'Book cover'}
						className="book-card-image"
						onError={() => setImageFailed(true)}
						sx={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							display: 'block',
						}}
					/>
				) : (
					<Box
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
					</Box>
				)}
			</Box>

			<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', fontFamily: "'Sofia Pro', sans-serif" }}>
				<Typography
					onClick={(e) => {
						e.stopPropagation();
						navigateToDetail().then();
					}}
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
				</Typography>

				<Typography
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
					{book.bookAuthor || 'Unknown author'}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
					<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.55 }}>
						<LanguageIcon sx={{ fontSize: 14, color: '#5a7a9c' }} />
						<Typography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.78rem', color: '#5a7a9c' }}>
							{book.bookLanguage || '-'}
						</Typography>
					</Box>
					<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.55 }}>
						<StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
						<Typography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.78rem', color: '#5a7a9c' }}>{rating}</Typography>
					</Box>
				</Box>

				<Divider sx={{ borderColor: '#e8f0fb', margin: '10px 0' }} />

				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Typography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.95rem', fontWeight: 700, color: '#000' }}>
						{getPriceLabel(book)}
					</Typography>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
							<VisibilityOutlinedIcon sx={{ fontSize: 19, color: '#5a7a9c' }} />
							<Typography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.8rem', color: '#5a7a9c' }}>{views}</Typography>
						</Box>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
							{likeHandler ? (
								<IconButton onClick={likeClickHandler} sx={{ p: '2px' }}>
									{liked ? (
										<FavoriteRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
									) : (
										<FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: '#5a7a9c' }} />
									)}
								</IconButton>
							) : liked ? (
								<FavoriteRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
							) : (
								<FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: '#5a7a9c' }} />
							)}
							<Typography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.8rem', color: '#5a7a9c' }}>{likes}</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default BookCard;
