import React from 'react';
import { Box as MuiBox, Divider as MuiDivider, IconButton, Typography as MuiTypography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';
import { Book } from '../../types/book/book';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useRouter } from 'next/router';
import { resolveMediaUrl } from '../../utils';

interface MostBorrowedCardProps {
	book: Book;
	likeHandler: (e: React.MouseEvent, bookId: string) => void | Promise<void>;
}

const cardSx: any = {
	width: '400px',
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
};

const imageWrapSx: any = {
	width: '100%',
	height: '240px',
	position: 'relative',
	overflow: 'hidden',
	background: '#f5f7fa',
	display: 'grid',
	placeItems: 'center',
	padding: '14px',
};

const imageSx: any = {
	width: '100%',
	height: '100%',
	objectFit: 'contain',
	objectPosition: 'center',
	display: 'block',
	borderRadius: '10px',
};

const badgeBaseSx: any = {
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

const titleSx: any = {
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
};

const authorSx: any = {
	fontFamily: "'Sofia Pro', sans-serif",
	fontSize: '.82rem',
	color: '#5a7a9c',
	mb: '12px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const metaTextSx: any = {
	fontFamily: "'Sofia Pro', sans-serif",
	fontSize: '.78rem',
	color: '#5a7a9c',
};

const getInitials = (title?: string) => {
	const words = title?.trim().split(/\s+/).filter(Boolean) ?? [];
	return (words[0]?.[0] ?? 'B') + (words[1]?.[0] ?? 'K');
};

const MostBorrowedCard = (props: MostBorrowedCardProps) => {
	const { book, likeHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const liked = book?.meLiked?.[0]?.myFavorite ?? false;
	const likeCount = book?.bookLikes ?? 0;
	const [imageFailed, setImageFailed] = React.useState(false);

	/** HANDLERS **/
	const pushDetailHandler = async (bookId: string) => {
		await router.push(`/books/detail?id=${bookId}`);
	};

	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '');

	const card = (
		<MuiBox className="popular-card-box" onClick={() => pushDetailHandler(book._id)} sx={cardSx}>
			<MuiBox sx={imageWrapSx}>
				{imageUrl && !imageFailed ? (
					<MuiBox component="img" src={imageUrl} alt={book.bookTitle || 'Book cover'} onError={() => setImageFailed(true)} sx={imageSx} />
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
				{book.bookRank > 0 ? (
					<MuiBox sx={{ ...badgeBaseSx, right: '12px', color: '#b45309' }}>Top</MuiBox>
				) : null}
			</MuiBox>
			<MuiBox sx={{ padding: '16px', display: 'flex', flexDirection: 'column', fontFamily: "'Sofia Pro', sans-serif" }}>
				<MuiTypography sx={titleSx}>{book.bookTitle}</MuiTypography>
				<MuiTypography sx={authorSx}>{book.bookAuthor}</MuiTypography>
				<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '10px' }}>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<LanguageIcon sx={{ fontSize: 14, color: '#5a7a9c' }} />
						<MuiTypography sx={metaTextSx}>{book.bookLanguage || '-'}</MuiTypography>
					</MuiBox>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
						<MuiTypography sx={metaTextSx}>{(book?.bookRating?.average ?? 0).toFixed(1)}</MuiTypography>
					</MuiBox>
				</MuiBox>
				<MuiDivider sx={{ borderColor: '#e8f0fb', margin: '10px 0' }} />
				<MuiBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.95rem', fontWeight: 700, color: '#000' }}>
						{book.isPurchasable && book?.bookPrice?.amount ? `₩ ${book.bookPrice.amount.toLocaleString()}` : 'Borrow Only'}
					</MuiTypography>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
							<RemoveRedEyeIcon sx={{ fontSize: 19, color: '#5a7a9c' }} />
							<MuiTypography sx={{ ...metaTextSx, fontSize: '.8rem' }}>{book?.bookViews ?? 0}</MuiTypography>
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
								<MuiTypography sx={{ ...metaTextSx, fontSize: '.8rem' }}>{likeCount}</MuiTypography>
							</MuiBox>
						)}
					</MuiBox>
				</MuiBox>
			</MuiBox>
		</MuiBox>
	);

	if (device === 'mobile') {
		return card;
	}

	return card;
};

export default MostBorrowedCard;
