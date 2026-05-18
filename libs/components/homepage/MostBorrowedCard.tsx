import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Book } from '../../types/book/book';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useRouter } from 'next/router';

interface MostBorrowedCardProps {
	book: Book;
	likeHandler: (e: React.MouseEvent, bookId: string) => void | Promise<void>;
}

const MostBorrowedCard = (props: MostBorrowedCardProps) => {
	const { book, likeHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const liked = book?.meLiked?.[0]?.myFavorite ?? false;
	const likeCount = book?.bookLikes ?? 0;

	/** HANDLERS **/
	const pushDetailHandler = async (bookId: string) => {
		await router.push(`/books/detail?id=${bookId}`);
	};

	const imageUrl = resolveMediaUrl(book?.bookImages?.[0], '/img/banner/header1.svg');

	const card = (
		<MuiBox
			className="popular-card-box"
			onClick={() => pushDetailHandler(book._id)}
			sx={{
				width: '400px',
				backgroundColor: '#ffffff',
				borderRadius: '12px',
				border: '0.5px solid #e5e7eb',
				overflow: 'hidden',
				cursor: 'pointer',
				transition: 'transform 0.15s ease',
				'&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
			}}
		>
			<MuiBox
				sx={{
					width: '100%',
					height: '190px',
					backgroundImage: `url(${imageUrl})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					position: 'relative',
				}}
			>
					<MuiBox
						sx={{
							position: 'absolute',
							top: 10,
							left: 10,
							background: 'rgba(255,255,255,0.15)',
							backdropFilter: 'blur(8px)',
							WebkitBackdropFilter: 'blur(8px)',
							border: '1px solid rgba(255,255,255,0.3)',
							color: '#fff',
							fontSize: '10px',
							fontWeight: 700,
							letterSpacing: '0.05em',
							padding: '3px 8px',
							borderRadius: '99px',
							textTransform: 'uppercase',
							textShadow: '0 1px 2px rgba(0,0,0,0.3)',
						}}
					>
						{book.bookCategory?.replace(/_/g, ' ')}
					</MuiBox>
				{book.bookRank > 0 ? (
					<MuiBox
						sx={{
							position: 'absolute',
							top: 10,
							right: 10,
							backgroundColor: '#f59e0b',
							color: '#fff',
							fontSize: '10px',
							fontWeight: 700,
							padding: '3px 8px',
							borderRadius: '99px',
						}}
					>
						TOP
					</MuiBox>
				) : (
					book.isBorrowable && (
							<MuiBox
								sx={{
									position: 'absolute',
									top: 10,
									right: 10,
									background: 'rgba(255,255,255,0.15)',
									backdropFilter: 'blur(8px)',
									WebkitBackdropFilter: 'blur(8px)',
									border: '1px solid rgba(255,255,255,0.3)',
									color: '#fff',
									fontSize: '10px',
									fontWeight: 700,
									padding: '3px 8px',
									borderRadius: '99px',
									textShadow: '0 1px 2px rgba(0,0,0,0.3)',
								}}
							>
								Borrowable
						</MuiBox>
					)
				)}
			</MuiBox>
					<MuiBox sx={{ padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
				<MuiTypography
					sx={{
						fontSize: '14px',
						fontWeight: 600,
						color: '#111827',
						mb: '4px',
						lineHeight: 1.3,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{book.bookTitle}
				</MuiTypography>
				<MuiTypography
					sx={{
						fontSize: '12px',
						color: '#6b7280',
						mb: '10px',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{book.bookAuthor}
				</MuiTypography>
				<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '10px' }}>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<LanguageIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
						<MuiTypography sx={{ fontSize: '12px', color: '#6b7280' }}>{book.bookLanguage || '-'}</MuiTypography>
					</MuiBox>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
						<MuiTypography sx={{ fontSize: '12px', color: '#6b7280' }}>
							{(book?.bookRating?.average ?? 0).toFixed(1)}
						</MuiTypography>
					</MuiBox>
				</MuiBox>
				<MuiDivider sx={{ mb: '10px' }} />
				<MuiBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<MuiTypography sx={{ fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>
						{book.isPurchasable && book?.bookPrice?.amount
							? `₩ ${book.bookPrice.amount.toLocaleString()}`
							: 'Borrow Only'}
					</MuiTypography>
					<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
						<MuiBox sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
								<RemoveRedEyeIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
							<MuiTypography sx={{ fontSize: '12px', color: '#9ca3af' }}>{book?.bookViews ?? 0}</MuiTypography>
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
										<FavoriteIcon
											sx={{
												fontSize: 20,
											color: liked ? '#ef4444' : '#9ca3af',
											transition: 'color 0.2s ease',
										}}
									/>
								</IconButton>
								<MuiTypography sx={{ fontSize: '12px', color: '#9ca3af' }}>{likeCount}</MuiTypography>
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
