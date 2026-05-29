import React, { useEffect, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Book } from '../../types/book/book';
import { BooksInquiry } from '../../types/book/book.input';
import NewArrivalCard from './NewArrivalCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOOKS } from '../../../apollo/user/query';
import { LIKE_BOOK } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Message } from '../../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import BookCardSkeleton from '../common/BookCardSkeleton';

interface NewArrivalsProps {
	initialInput: BooksInquiry;
	likeSyncTick?: number;
	onBookLikeToggled?: () => void;
}

const NewArrivals = (props: NewArrivalsProps) => {
	const { initialInput, likeSyncTick = 0, onBookLikeToggled } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('books');
	const [newArrivals, setNewArrivals] = useState<Book[]>([]);
	const [likeBook] = useMutation(LIKE_BOOK);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { loading, data: getBooksData, refetch } = useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		setNewArrivals(getBooksData?.getBooks?.list ?? []);
	}, [getBooksData]);

	useEffect(() => {
		if (likeSyncTick <= 0) return;
		refetch({ input: initialInput });
	}, [likeSyncTick, refetch, initialInput]);

	const likeHandler = async (e: React.MouseEvent, bookId: string) => {
		e.stopPropagation();
		try {
			if (!bookId) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeBook({
				variables: { input: bookId },
			});

			onBookLikeToggled?.();
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!newArrivals) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('arrivals_title')}</span>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						{loading ? (
							<Stack direction="row" spacing={2}>
								{Array.from({ length: 2 }).map((_, index) => (
									<BookCardSkeleton key={`new-arrivals-mobile-skeleton-${index}`} width={300} />
								))}
							</Stack>
						) : newArrivals.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('no_books')}
							</Box>
						) : (
							<Swiper
								className={'trend-property-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
									{(newArrivals ?? []).map((book: Book) => {
										return (
											<SwiperSlide key={book._id} className={'trend-property-slide'}>
												<NewArrivalCard book={book} likeHandler={likeHandler} />
											</SwiperSlide>
										);
									})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>{t('arrivals_title')}</span>
							<p>{t('arrivals_subtitle')}</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						{loading ? (
							<Stack direction="row" spacing={2}>
								{Array.from({ length: 3 }).map((_, index) => (
									<BookCardSkeleton key={`new-arrivals-desktop-skeleton-${index}`} width={300} />
								))}
							</Stack>
						) : newArrivals.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('no_books')}
							</Box>
						) : (
							<Swiper
								className={'trend-property-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
								pagination={{
									el: '.swiper-trend-pagination',
								}}
							>
									{(newArrivals ?? []).map((book: Book) => {
										return (
											<SwiperSlide key={book._id} className={'trend-property-slide'}>
												<NewArrivalCard book={book} likeHandler={likeHandler} />
											</SwiperSlide>
										);
									})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

NewArrivals.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default NewArrivals;
