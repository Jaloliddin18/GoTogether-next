import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../../libs/hooks/useDeviceDetect';
import { Book } from '../../../libs/types/book/book';
import { T } from '../../../libs/types/common';
import { Message } from '../../../libs/enums/common.enum';
import { userVar } from '../../../apollo/store';
import { resolveMediaUrl } from '../../../libs/utils';
import { GET_BOOK } from '../../../apollo/library/query';
import { LIKE_TARGET_BOOK } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const BookDetailPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [bookId, setBookId] = useState<string | null>(null);
	const [book, setBook] = useState<Book | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetBook] = useMutation(LIKE_TARGET_BOOK);

	const {
		loading: getBookLoading,
		refetch: getBookRefetch,
	} = useQuery(GET_BOOK, {
		fetchPolicy: 'network-only',
		variables: { input: bookId },
		skip: !bookId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getBook) setBook(data.getBook);
			if (data?.getBook?.bookImages?.[0]) setSlideImage(data.getBook.bookImages[0]);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.bookId) {
			setBookId(router.query.bookId as string);
		}
	}, [router]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeBookHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetBook({ variables: { input: id } });
			await getBookRefetch({ input: id });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeBookHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (getBookLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '600px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <div>BOOK DETAIL PAGE</div>;
	}

	return (
		<div id={'book-detail-page'} style={{ background: '#f6f6f6', minHeight: '100vh', paddingBottom: 60 }}>
			<div className={'container'}>
				<Stack sx={{ pt: 6, gap: 4 }}>
					{/* Back button */}
					<Box
						component={'span'}
						onClick={() => router.back()}
						sx={{ cursor: 'pointer', color: '#1a6fd4', fontSize: 14, fontWeight: 600, width: 'fit-content', '&:hover': { textDecoration: 'underline' } }}
					>
						← Back to Books
					</Box>

					{/* Main content */}
					<Stack direction={'row'} gap={4} flexWrap={'wrap'}>
						{/* Left: Images */}
						<Stack gap={2} sx={{ flex: '0 0 320px', maxWidth: 320 }}>
							<Box
								sx={{
									width: '100%',
									height: 400,
									borderRadius: '12px',
									overflow: 'hidden',
									background: '#fff',
									boxShadow: '0 1px 4px rgba(24,26,32,0.07)',
								}}
							>
								<img
									src={slideImage ? resolveMediaUrl(slideImage) : '/img/banner/header1.svg'}
									alt={book?.bookTitle ?? 'Book cover'}
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							</Box>
							{(book?.bookImages?.length ?? 0) > 1 && (
								<Stack direction={'row'} gap={1} flexWrap={'wrap'}>
									{book?.bookImages?.map((img: string) => (
										<Box
											key={img}
											onClick={() => changeImageHandler(img)}
											sx={{
												width: 72,
												height: 72,
												borderRadius: '8px',
												overflow: 'hidden',
												cursor: 'pointer',
												border: slideImage === img ? '2px solid #1a6fd4' : '2px solid transparent',
												transition: 'border-color 0.2s',
											}}
										>
											<img
												src={resolveMediaUrl(img)}
												alt={'thumbnail'}
												style={{ width: '100%', height: '100%', objectFit: 'cover' }}
											/>
										</Box>
									))}
								</Stack>
							)}
						</Stack>

						{/* Right: Book info */}
						<Stack gap={2.5} sx={{ flex: 1, minWidth: 280 }}>
							{/* Title & Author */}
							<Stack gap={0.5}>
								<Typography sx={{ fontSize: 26, fontWeight: 700, color: '#0d1b2e', lineHeight: 1.25 }}>
									{book?.bookTitle ?? '—'}
								</Typography>
								<Typography sx={{ fontSize: 16, color: '#5a7a9c', fontWeight: 500 }}>
									{book?.bookAuthor ?? ''}
								</Typography>
							</Stack>

							{/* Price */}
							<Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1a6fd4' }}>
								{book?.bookPrice?.isDiscounted && book?.bookPrice?.discountPercent ? (
									<>
										<span style={{ textDecoration: 'line-through', color: '#9aabb8', marginRight: 8, fontSize: 16 }}>
											{book.bookPrice.amount.toLocaleString()} {book.bookPrice.currency}
										</span>
										{Math.round(book.bookPrice.amount * (1 - (book.bookPrice.discountPercent ?? 0) / 100)).toLocaleString()}{' '}
										{book.bookPrice.currency}
									</>
								) : (
									<>{(book?.bookPrice?.amount ?? 0).toLocaleString()} {book?.bookPrice?.currency ?? 'KRW'}</>
								)}
							</Typography>

							{/* Availability badges */}
							<Stack direction={'row'} gap={1} flexWrap={'wrap'}>
								{book?.isBorrowable && (
									<Chip label="Borrowable" size="small" sx={{ background: '#ddeeff', color: '#1a6fd4', fontWeight: 600 }} />
								)}
								{book?.isPurchasable && (
									<Chip label="Purchasable" size="small" sx={{ background: '#e8f8e8', color: '#2e8b57', fontWeight: 600 }} />
								)}
								{book?.bookStatus && (
									<Chip label={book.bookStatus} size="small" variant="outlined" sx={{ color: '#5a7a9c' }} />
								)}
							</Stack>

							{/* Interaction: views + likes */}
							<Stack direction={'row'} gap={2} alignItems={'center'}>
								<Stack direction={'row'} gap={0.5} alignItems={'center'}>
									<RemoveRedEyeIcon sx={{ fontSize: 18, color: '#5a7a9c' }} />
									<Typography sx={{ fontSize: 14, color: '#5a7a9c' }}>{book?.bookViews ?? 0}</Typography>
								</Stack>
								<Stack
									direction={'row'}
									gap={0.5}
									alignItems={'center'}
									sx={{ cursor: 'pointer' }}
									onClick={() => likeBookHandler(user, book?._id ?? '')}
								>
									{book?.meLiked?.[0]?.myFavorite ? (
										<FavoriteIcon sx={{ fontSize: 18, color: '#1a6fd4' }} />
									) : (
										<FavoriteBorderIcon sx={{ fontSize: 18, color: '#5a7a9c' }} />
									)}
									<Typography sx={{ fontSize: 14, color: '#5a7a9c' }}>{book?.bookLikes ?? 0}</Typography>
								</Stack>
							</Stack>

							{/* Divider */}
							<Box sx={{ height: 1, background: '#E2E8F0' }} />

							{/* Key specs grid */}
							<Stack
								sx={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: 1.5,
								}}
							>
								{[
									{ label: 'Category', value: book?.bookCategory?.replace(/_/g, ' ') },
									{ label: 'Type', value: book?.bookType?.replace(/_/g, ' ') },
									{ label: 'Format', value: book?.bookFormat?.replace(/_/g, ' ') },
									{ label: 'Language', value: book?.bookLanguage?.replace(/_/g, ' ') },
									{ label: 'Audience', value: book?.bookAudience?.replace(/_/g, ' ') },
									{ label: 'Pages', value: book?.bookPages ?? '—' },
									{ label: 'Published Year', value: book?.bookPublishedYear ?? '—' },
									{ label: 'ISBN', value: book?.bookIsbn ?? '—' },
									...(book?.bookCallNumber ? [{ label: 'Call Number', value: book.bookCallNumber }] : []),
									...(book?.bookRating?.count ? [{ label: 'Rating', value: `${book.bookRating.average?.toFixed(1)} (${book.bookRating.count} reviews)` }] : []),
								].map(({ label, value }) => (
									<Box key={label}>
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9aabb8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
											{label}
										</Typography>
										<Typography sx={{ fontSize: 14, color: '#0d1b2e', fontWeight: 500 }}>
											{String(value ?? '—')}
										</Typography>
									</Box>
								))}
							</Stack>
						</Stack>
					</Stack>

					{/* Description */}
					{book?.bookDescription && (
						<Box
							sx={{
								background: '#fff',
								borderRadius: '12px',
								padding: '28px 32px',
								boxShadow: '0 1px 4px rgba(24,26,32,0.07)',
							}}
						>
							<Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0d1b2e', mb: 1.5 }}>
								Description
							</Typography>
							<Typography sx={{ fontSize: 15, color: '#5a7a9c', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
								{book.bookDescription}
							</Typography>
						</Box>
					)}

					{/* Physical details */}
					{book?.bookDimensions && (
						<Box
							sx={{
								background: '#fff',
								borderRadius: '12px',
								padding: '28px 32px',
								boxShadow: '0 1px 4px rgba(24,26,32,0.07)',
							}}
						>
							<Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0d1b2e', mb: 1.5 }}>
								Physical Details
							</Typography>
							<Stack direction={'row'} gap={4} flexWrap={'wrap'}>
								{book.bookDimensions.widthCm && (
									<Box>
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9aabb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Width</Typography>
										<Typography sx={{ fontSize: 14, color: '#0d1b2e' }}>{book.bookDimensions.widthCm} cm</Typography>
									</Box>
								)}
								{book.bookDimensions.heightCm && (
									<Box>
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9aabb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Height</Typography>
										<Typography sx={{ fontSize: 14, color: '#0d1b2e' }}>{book.bookDimensions.heightCm} cm</Typography>
									</Box>
								)}
								{book.bookDimensions.weightGrams && (
									<Box>
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9aabb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight</Typography>
										<Typography sx={{ fontSize: 14, color: '#0d1b2e' }}>{book.bookDimensions.weightGrams} g</Typography>
									</Box>
								)}
							</Stack>
						</Box>
					)}
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(BookDetailPage);
