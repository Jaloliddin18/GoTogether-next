import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopAgentCard, { TopAgentItem } from './TopAgentCard';

const BOOK_DONORS: TopAgentItem[] = [
	{
		_id: '1',
		memberNick: 'Jaloliddin K.',
		memberType: 'SPONSOR',
		memberImage: '/img/profile/girl.svg',
	},
	{
		_id: '2',
		memberNick: 'Akhror T.',
		memberType: 'SPONSOR',
		memberImage: '/img/profile/girl.svg',
	},
	{
		_id: '3',
		memberNick: 'Aziz M.',
		memberType: 'SPONSOR',
		memberImage: '/img/profile/girl.svg',
	},
	{
		_id: '4',
		memberNick: 'Jahongir U.',
		memberType: 'SPONSOR',
		memberImage: '/img/profile/girl.svg',
	},
	{
		_id: '5',
		memberNick: 'Ibohim S.',
		memberType: 'SPONSOR',
		memberImage: '/img/profile/girl.svg',
	},
];

const TopAgents = () => {
	const device = useDeviceDetect();
	const router = useRouter();

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Book Donors</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={29}
							modules={[Autoplay]}
						>
							{BOOK_DONORS.map((donor: TopAgentItem) => {
								return (
									<SwiperSlide className={'top-agents-slide'} key={donor._id}>
										<TopAgentCard agent={donor} key={donor.memberNick} />
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
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Our Sponsors</span>
							<p>Community members who donated books to our library</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<span>See All Sponsors</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
							>
								{BOOK_DONORS.map((donor: TopAgentItem) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={donor._id}>
											<TopAgentCard agent={donor} key={donor.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default TopAgents;
