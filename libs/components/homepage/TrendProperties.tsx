import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Book } from '../../types/book/book';
import { BooksInquiry } from '../../types/book/book.input';
import TrendPropertyCard from './TrendPropertyCard';
import { useQuery } from '@apollo/client';
import { GET_BOOKS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface TrendPropertiesProps {
	initialInput: BooksInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [newArrivals, setNewArrivals] = useState<Book[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_BOOKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewArrivals(data?.getBooks?.list ?? []);
		},
	});

	if (!newArrivals) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>New Arrivals</span>
					</Stack>
					<Stack className={'card-box'}>
						{newArrivals.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								No books found
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
											<TrendPropertyCard book={book} />
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
							<span>New Arrivals</span>
							<p>Recently added books to our library collection</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						{newArrivals.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								No books found
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
											<TrendPropertyCard book={book} />
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

TrendProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default TrendProperties;
