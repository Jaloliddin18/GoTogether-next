import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyRequests from '../../libs/components/mypage/MyRequests';
import RobotTracking from '../../libs/components/mypage/RobotTracking';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { getJwtToken, updateUserInfo } from '../../libs/auth';
import { useTranslation } from 'next-i18next';
import { NextSeo } from 'next-seo';
import { buildCanonicalUrl, buildOpenGraph } from '../../libs/config/seo';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'mypage'])),
	},
});

const MyPage: NextPage = () => {
	const { t } = useTranslation('mypage');
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const pageTitle = 'My Page | 같이Go Smart Library';
	const pageDescription = 'Personal dashboard for requests, tracking, and account settings.';
	const category: any = router.query?.category ?? 'myProfile';
	const [authHydrated, setAuthHydrated] = useState(false);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
		setAuthHydrated(true);
	}, []);

	useEffect(() => {
		if (!router.isReady || !authHydrated) return;
		if (!user._id) {
			router
				.replace(`/account/join?redirect=${encodeURIComponent(router.asPath)}`)
				.then();
		}
	}, [router, authHydrated, user._id]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { memberId: id } });
			await refetch({ input: query });
			await sweetTopSmallSuccessAlert(t('subscribed'), 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { memberId: id } });
			await refetch({ input: query });
			await sweetTopSmallSuccessAlert(t('unsubscribed'), 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: query });
			await sweetTopSmallSuccessAlert(t('common:success'), 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member/${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (!authHydrated) return null;
	if (!user._id) return null;
	if (device === 'mobile')
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/mypage')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/mypage')}
					noindex
					nofollow
				/>
				<div>{t('placeholder')}</div>
			</>
		);

	return (
		<>
			<NextSeo
				title={pageTitle}
				description={pageDescription}
				canonical={buildCanonicalUrl('/mypage')}
				openGraph={buildOpenGraph(pageTitle, pageDescription, '/mypage')}
				noindex
				nofollow
			/>
			<div id="my-page" style={{ position: 'relative' }}>
				<div className="container">
				<Stack className={'my-page'}>
					<Stack className={'back-frame'}>
						<Stack className={'left-config'}>
							<MyMenu />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{category === 'myProfile' && <MyProfile />}
								{category === 'myArticles' && <MyArticles />}
								{category === 'myFavorites' && <MyFavorites />}
								{category === 'recentlyVisited' && <RecentlyVisited />}
								{category === 'myRequests' && <MyRequests />}
								{category === 'robotTracking' && <RobotTracking />}
								{category === 'followers' && (
									<MemberFollowers
										initialInput={{ page: 1, limit: 5, search: { followingId: user._id } }}
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										initialInput={{ page: 1, limit: 5, search: { followerId: user._id } }}
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(MyPage);
