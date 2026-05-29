import React, { useEffect, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import FeaturedBookCard from './FeaturedBookCard';
import { BooksInquiry } from '../../types/book/book.input';
import { Book } from '../../types/book/book';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOOKS } from '../../../apollo/user/query';
import { LIKE_BOOK } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Message } from '../../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

interface FeaturedBooksProps {
	initialInput: BooksInquiry;
	likeSyncTick?: number;
	onBookLikeToggled?: () => void;
}

const FeaturedBooks = (props: FeaturedBooksProps) => {
	const { initialInput, likeSyncTick = 0, onBookLikeToggled } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('books');
	const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
	const [likeBook] = useMutation(LIKE_BOOK);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { data: getBooksData, refetch } = useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		setFeaturedBooks(getBooksData?.getBooks?.list ?? []);
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

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('featured_title')}</span>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
								{(featuredBooks ?? []).map((book: Book) => {
									return (
										<SwiperSlide className={'top-property-slide'} key={book?._id}>
											<FeaturedBookCard book={book} likeHandler={likeHandler} />
										</SwiperSlide>
									);
								})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>{t('featured_title')}</span>
							<p>{t('featured_subtitle')}</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
								{(featuredBooks ?? []).map((book: Book) => {
									return (
										<SwiperSlide className={'top-property-slide'} key={book?._id}>
											<FeaturedBookCard book={book} likeHandler={likeHandler} />
										</SwiperSlide>
									);
								})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

FeaturedBooks.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'bookRating.average',
		direction: 'DESC',
		search: {},
	},
};

export default FeaturedBooks;
