import React, { useState } from 'react';
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
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

interface MostBorrowedProps {
	initialInput: BooksInquiry;
}

const MostBorrowed = (props: MostBorrowedProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularBooks, setPopularBooks] = useState<Book[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPopularBooks(data?.getBooks?.list ?? []);
		},
	});
	/** HANDLERS **/

	if (!popularBooks) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Most Borrowed</span>
					</Stack>
					<Stack className={'card-box'}>
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
										<MostBorrowedCard book={book} />
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
								<Link href={'/library/books'}>
									<span>Browse All Books</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
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
										<MostBorrowedCard book={book} />
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
