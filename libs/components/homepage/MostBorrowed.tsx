import React, { useEffect, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import MostBorrowedCard from './MostBorrowedCard';
import { Book } from '../../types/book/book';
import Link from 'next/link';
import { BooksInquiry } from '../../types/book/book.input';
import { GET_BOOKS } from '../../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { T } from '../../types/common';
import { LIKE_BOOK } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Message } from '../../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

interface MostBorrowedProps {
	initialInput: BooksInquiry;
	likeSyncTick?: number;
	onBookLikeToggled?: () => void;
}

const MostBorrowed = (props: MostBorrowedProps) => {
	const { initialInput, likeSyncTick = 0, onBookLikeToggled } = props;
	const device = useDeviceDetect();
	const [popularBooks, setPopularBooks] = useState<Book[]>([]);
	const [likeBook] = useMutation(LIKE_BOOK);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { refetch } = useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPopularBooks(data?.getBooks?.list ?? []);
		},
	});

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
	/** HANDLERS **/

	if (!popularBooks) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Most Borrowed</span>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						<Swiper
							className={'popular-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={25}
							modules={[Autoplay]}
						>
								{(popularBooks ?? []).map((book: Book) => {
									return (
										<SwiperSlide key={book._id} className={'popular-property-slide'}>
											<MostBorrowedCard book={book} likeHandler={likeHandler} />
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
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Most Borrowed</span>
							<p>Top books our students are reading right now</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/books'}>
									<span>Browse All Books</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'} sx={{ mt: '18px' }}>
						<Swiper
							className={'popular-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={25}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-popular-next',
								prevEl: '.swiper-popular-prev',
							}}
							pagination={{
								el: '.swiper-popular-pagination',
							}}
						>
								{(popularBooks ?? []).map((book: Book) => {
									return (
										<SwiperSlide key={book._id} className={'popular-property-slide'}>
											<MostBorrowedCard book={book} likeHandler={likeHandler} />
										</SwiperSlide>
									);
								})}
						</Swiper>
					</Stack>
					<Stack className={'pagination-box'}>
						<WestIcon className={'swiper-popular-prev'} />
						<div className={'swiper-popular-pagination'}></div>
						<EastIcon className={'swiper-popular-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

MostBorrowed.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'bookRank',
		direction: 'DESC',
		search: {},
	},
};

export default MostBorrowed;
