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
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import {
	buildCanonicalUrl,
	buildOpenGraph,
	DEFAULT_OG_IMAGE_URL,
	SITE_NAME,
	SITE_URL,
	SUPPORT_EMAIL,
} from '../libs/config/seo';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'books'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();
	const [bookLikeSyncTick, setBookLikeSyncTick] = useState<number>(0);
	const pageTitle = '같이Go Smart Library | Less time looking, More time booking';
	const pageDescription =
		'Discover books faster and request autonomous robot book delivery through 같이Go Smart Library, a smart library platform built for INHA University.';
	const organizationJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: DEFAULT_OG_IMAGE_URL,
		email: SUPPORT_EMAIL,
		description: 'University smart library with autonomous robot book delivery at INHA University, Korea.',
		slogan: 'Less time looking, More time booking',
	});

	const handleBookLikeToggled = () => {
		setBookLikeSyncTick((prev) => prev + 1);
	};

	if (device === 'mobile') {
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/')}
				/>
				<Head>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
					/>
				</Head>
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
			</>
		);
	} else {
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/')}
				/>
				<Head>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
					/>
				</Head>
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
			</>
		);
	}
};

export default withLayoutMain(Home);
