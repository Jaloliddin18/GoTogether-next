import { NextPage } from 'next';
import { useRouter } from 'next/router';
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
	const router = useRouter();

	if (device === 'mobile') {
			return (
				<Stack className={'home-page'}>
					<NewArrivals />
					<DicedHeroSection
						topText="Smart Library"
						mainText="같이Go"
						subMainText="Search any book in our catalog and have it delivered to your desk by our autonomous robot. Borrow for reading or purchase to keep - your choice, delivered instantly."
						buttonText="Browse Books"
						slides={[
							{ title: 'Library Books', image: '/img/events/BUSAN.webp' },
							{ title: 'Robot Delivery', image: '/img/events/DAEGU.webp' },
							{ title: 'Study Space', image: '/img/events/INCHEON.webp' },
							{ title: 'Community', image: '/img/events/SEOUL.webp' },
						]}
						onMainButtonClick={() => router.push('/books')}
						topTextStyle={{ color: 'var(--diced-hero-section-top-text)' }}
							mainTextStyle={{
								fontSize: '4.5rem',
								color: 'var(--diced-hero-section-sub-text)',
							}}
						subMainTextStyle={{ color: 'var(--diced-hero-section-sub-text)' }}
						buttonStyle={{
							backgroundColor: 'var(--diced-hero-section-button-bg)',
							color: 'var(--diced-hero-section-button-fg)',
							borderRadius: '8px',
							hoverColor: 'var(--diced-hero-section-button-hover-bg)',
							hoverForeground: 'var(--diced-hero-section-button-hover-fg)',
						}}
						separatorColor="var(--diced-hero-section-separator)"
						mobileBreakpoint={1000}
						fontFamily="Inter, -apple-system, sans-serif"
					/>
					<MostBorrowed />
				<Advertisement />
				<FeaturedBooks />
				<div style={{ overflow: 'visible' }}>
					<OrbitingAvatarsCTA />
				</div>
			</Stack>
		);
	} else {
			return (
				<Stack className={'home-page'}>
					<NewArrivals />
					<DicedHeroSection
						topText="Smart Library"
						mainText="같이Go"
						subMainText="Search any book in our catalog and have it delivered to your desk by our autonomous robot. Borrow for reading or purchase to keep - your choice, delivered instantly."
						buttonText="Browse Books"
						slides={[
							{ title: 'Library Books', image: '/img/events/BUSAN.webp' },
							{ title: 'Robot Delivery', image: '/img/events/DAEGU.webp' },
							{ title: 'Study Space', image: '/img/events/INCHEON.webp' },
							{ title: 'Community', image: '/img/events/SEOUL.webp' },
						]}
						onMainButtonClick={() => router.push('/books')}
						topTextStyle={{ color: 'var(--diced-hero-section-top-text)' }}
							mainTextStyle={{
								fontSize: '4.5rem',
								color: 'var(--diced-hero-section-sub-text)',
							}}
						subMainTextStyle={{ color: 'var(--diced-hero-section-sub-text)' }}
						buttonStyle={{
							backgroundColor: 'var(--diced-hero-section-button-bg)',
							color: 'var(--diced-hero-section-button-fg)',
							borderRadius: '8px',
							hoverColor: 'var(--diced-hero-section-button-hover-bg)',
							hoverForeground: 'var(--diced-hero-section-button-hover-fg)',
						}}
						separatorColor="var(--diced-hero-section-separator)"
						mobileBreakpoint={1000}
						fontFamily="Inter, -apple-system, sans-serif"
					/>
					<MostBorrowed />
					<Advertisement />
					<FeaturedBooks />
					<div style={{ overflow: 'visible' }}>
						<OrbitingAvatarsCTA />
					</div>
					<InteractiveEvents />
					<LibraryFeatures />
				</Stack>
		);
	}
};

export default withLayoutMain(Home);
