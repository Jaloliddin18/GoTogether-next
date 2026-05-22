import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Book } from '../../types/book/book';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/router';
import { resolveMediaUrl } from '../../utils';

const MuiBox: any = Box;
const MuiTypography: any = Typography;
const MuiDivider: any = Divider;

interface FeaturedBookCardProps {
	book: Book;
	likeHandler: (e: React.MouseEvent, bookId: string) => void | Promise<void>;
}

const cardSx: any = {
	width: '300px',
	backgroundColor: '#ffffff',
	borderRadius: '16px',
	border: '1px solid #e8f0fb',
	overflow: 'hidden',
	cursor: 'pointer',
	fontFamily: "'Sofia Pro', sans-serif",
	transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease',
	'&:hover': {
		transform: 'translateY(-6px)',
		boxShadow: '0 20px 40px -8px rgba(26,111,212,.18)',
		borderColor: '#1a6fd4',
	},
};

const imageWrapSx: any = {
	width: '100%',
	height: '240px',
	position: 'relative',
	overflow: 'hidden',
	background: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a6e 100%)',
};

const imageSx: any = {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	display: 'block',
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

const FeaturedBookCard = (props: FeaturedBookCardProps) => {
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

	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '/img/default-book.jpg');
	const availabilityLabel = book.isPurchasable ? 'Purchasable' : book.isBorrowable ? 'Borrowable' : '';
	const availabilityColor = book.isPurchasable ? '#059669' : '#1a6fd4';

	const card = (
		<MuiBox className="top-card-box" onClick={() => pushDetailHandler(book._id)} sx={cardSx}>
			<MuiBox sx={imageWrapSx}>
				{imageUrl && !imageFailed ? (
					<Box component="img" src={imageUrl} alt={book.bookTitle || 'Book cover'} onError={() => setImageFailed(true)} sx={imageSx} />
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
				<MuiBox sx={{ ...badgeBaseSx, left: '12px', color: '#0d1b2e' }}>{book.bookCategory?.replace(/_/g, ' ')}</MuiBox>
				{availabilityLabel && <MuiBox sx={{ ...badgeBaseSx, right: '12px', color: availabilityColor }}>{availabilityLabel}</MuiBox>}
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
					<MuiTypography sx={{ fontFamily: "'Sofia Pro', sans-serif", fontSize: '.95rem', fontWeight: 700, color: '#1a6fd4' }}>
						{book.isPurchasable && book?.bookPrice?.amount ? `₩ ${book.bookPrice.amount.toLocaleString()}` : 'Borrow Only'}
					</MuiTypography>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
							<RemoveRedEyeIcon sx={{ fontSize: 19, color: '#5a7a9c' }} />
							<MuiTypography sx={{ ...metaTextSx, fontSize: '.8rem' }}>{book?.bookViews ?? 0}</MuiTypography>
						</MuiBox>
						<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
							<IconButton onClick={(e) => likeHandler(e, book._id)} sx={{ padding: '2px' }}>
								<FavoriteIcon sx={{ fontSize: 20, color: liked ? '#ef4444' : '#5a7a9c', transition: 'color 0.2s ease' }} />
							</IconButton>
							<MuiTypography sx={{ ...metaTextSx, fontSize: '.8rem' }}>{likeCount}</MuiTypography>
						</MuiBox>
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

export default FeaturedBookCard;
