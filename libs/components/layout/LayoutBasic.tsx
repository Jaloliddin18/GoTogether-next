import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import AiChatBubble from '../AiChatBubble';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);
		const needsHeroTextLargeFont = ['/about', '/community', '/mypage', '/books'].includes(router.pathname);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '',
				heroOverlay = '';

			switch (router.pathname) {
				case '/books':
					title = 'Books';
					desc = 'Browse and discover books';
					bgImage = '/img/banner/books_hero.png';
					heroOverlay =
						'linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.25) 45%, rgba(0, 0, 0, 0.1) 100%), ';
					break;
				case '/about':
					title = 'About';
					desc = 'Home / About';
					bgImage = '/img/banner/aboutBanner.svg';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / For Rent';
					bgImage = '/img/homepage/myPage2.jpg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / Community';
					bgImage = '/img/homepage/fiber8.jpg';
					break;
				// case '/community/detail':
				// 	title = 'Community Detail';
				// 	desc = 'Home / Community';
				// 	bgImage = '/img/community/digital_community.jpeg';
				// 	break;
				case '/cs':
					title = 'Customer Support';
					desc = 'We are glad to see you again!';
					bgImage = '/img/property/customer-support.jpg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/member/[memberId]':
					break;
				default:
					break;
			}

			return { title, desc, bgImage, heroOverlay };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Nestar</title>
						<meta name={'title'} content={`Nestar`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>같이Go</title>
						<meta name={'title'} content={`Nestar`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{memoizedValues.bgImage && (
							<Stack
								className={`header-basic ${authHeader && 'auth'}${router.pathname === '/cs' ? ' cs-banner' : ''}`}
								style={{
									backgroundImage: `url(${memoizedValues.bgImage})`,
									backgroundSize: 'cover',
									backgroundPosition: router.pathname === '/cs' ? 'center 25%' : 'center',
									backgroundRepeat: 'no-repeat',
									...(router.pathname !== '/cs' ? { boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)' } : {}),
								}}
							>
								{router.pathname === '/cs' && <div className="cs-banner-overlay" />}
								<Stack className={'container'}>
									<Stack className={`header-basic-copy ${needsHeroTextLargeFont ? 'with-large-font' : ''}`}>
										<strong>{t(memoizedValues.title)}</strong>
										<span>{t(memoizedValues.desc)}</span>
									</Stack>
								</Stack>
							</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<AiChatBubble />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
