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

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<NewArrivals />
				<DicedHeroSection />
				<MostBorrowed />
				<Advertisement />
				<div style={{ overflow: 'hidden' }}>
					<FeaturedBooks />
				</div>
				<div style={{ width: '100%' }}>
					<OrbitingAvatarsCTA />
				</div>
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<NewArrivals />
				<DicedHeroSection />
				<MostBorrowed />
				<Advertisement />
				<div style={{ overflow: 'hidden' }}>
					<FeaturedBooks />
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
