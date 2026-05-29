import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import LibraryFeatures from '../libs/components/homepage/LibraryFeatures';
import MostBorrowed from '../libs/components/homepage/MostBorrowed';
import OrbitingAvatarsCTA from '../libs/components/homepage/OrbitingAvatarsCTA';
import InteractiveEvents from '../libs/components/homepage/InteractiveEvents';
import DicedHeroSection from '../libs/components/homepage/DicedHeroSection';
import NewArrivals from '../libs/components/homepage/NewArrivals';
import FeaturedBooks from '../libs/components/homepage/FeaturedBooks';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'books'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();
	const [bookLikeSyncTick, setBookLikeSyncTick] = useState<number>(0);

	const handleBookLikeToggled = () => {
		setBookLikeSyncTick((prev) => prev + 1);
	};

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<NewArrivals likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				<DicedHeroSection />
				<MostBorrowed likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				<Advertisement />
				<div style={{ overflow: 'hidden' }}>
					<FeaturedBooks likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				</div>
				<div style={{ width: '100%' }}>
					<OrbitingAvatarsCTA />
				</div>
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<NewArrivals likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				<DicedHeroSection />
				<MostBorrowed likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				<Advertisement />
				<div style={{ overflow: 'hidden' }}>
					<FeaturedBooks likeSyncTick={bookLikeSyncTick} onBookLikeToggled={handleBookLikeToggled} />
				</div>
				<div style={{ width: '100%' }}>
					<OrbitingAvatarsCTA />
				</div>
				<InteractiveEvents />
				<LibraryFeatures />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
