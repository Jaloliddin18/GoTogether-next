import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import FeaturedBookCard from './FeaturedBookCard';
import { BooksInquiry } from '../../types/book/book.input';
import { Book } from '../../types/book/book';
import { useQuery } from '@apollo/client';
import { GET_BOOKS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface FeaturedBooksProps {
	initialInput: BooksInquiry;
}

const FeaturedBooks = (props: FeaturedBooksProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFeaturedBooks(data?.getBooks?.list ?? []);
		},
	});

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Featured Books</span>
					</Stack>
					<Stack className={'card-box'}>
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
										<FeaturedBookCard book={book} />
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
							<span>Featured Books</span>
							<p>Highest rated books in our collection</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
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
										<FeaturedBookCard book={book} />
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
