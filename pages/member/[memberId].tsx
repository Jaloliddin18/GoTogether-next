import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, IconButton, OutlinedInput, Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import Moment from 'react-moment';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CommunityLeftNav from '../../libs/components/community/CommunityLeftNav';
import TwitCard from '../../libs/components/community/TwitCard';
import { GET_MEMBER, GET_MEMBER_TWITS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { Twit } from '../../libs/types/twit/twit';
import { Direction } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages, API_BASE_URL } from '../../libs/config';
import { getJwtToken } from '../../libs/auth';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { useTranslation } from 'next-i18next';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'member'])),
	},
});

const TRENDING = [
	{ label: '#BookDrop', count: '142 posts' },
	{ label: '#StudyRoom', count: '87 posts' },
	{ label: '#RobotDelivery', count: '63 posts' },
	{ label: '#ReadingWeek', count: '41 posts' },
];

const WHO_TO_FOLLOW = [
	{ name: 'Library Bot', nick: '@librarybot', image: '/img/profile/defaultUser.svg' },
	{ name: 'Reading Club', nick: '@readingclub', image: '/img/profile/defaultUser.svg' },
	{ name: 'Study Hub', nick: '@studyhub_inha', image: '/img/profile/defaultUser.svg' },
];

const resolveAvatar = (img?: string): string => {
	if (!img) return '/img/profile/defaultUser.svg';
	if (img.startsWith('/img') || img.startsWith('http')) return img;
	return `${API_BASE_URL}/${img}`;
};


const LIMIT = 10;

const MemberProfile: NextPage = () => {
	const { t } = useTranslation('member');
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = router.query.memberId as string;

	const [activeTab, setActiveTab] = useState(0);
	const [twitsPage, setTwitsPage] = useState(1);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followersRefetchTrigger, setFollowersRefetchTrigger] = useState(0);

	// Reset to Posts tab when navigating between member profiles
	useEffect(() => {
		setActiveTab(0);
		setTwitsPage(1);
	}, [memberId]);

	// redirect guard — wait for router.isReady so memberId is defined,
	// then check token synchronously (avoids false redirect before userVar hydrates)
	useEffect(() => {
		if (!router.isReady || !memberId) return;
		if (!getJwtToken()) {
			router.push('/account/join');
			return;
		}
		if (user?._id && user._id === memberId) {
			router.push('/mypage');
		}
	}, [router.isReady, memberId, user?._id]);

	// Member data
	const { data: memberRaw, refetch: memberRefetch } = useQuery(GET_MEMBER, {
		variables: { input: memberId },
		skip: !memberId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const memberData: Member | undefined = memberRaw?.getMember;

	// Sync follow state from server
	useEffect(() => {
		if (!memberData) return;
		setIsFollowing(memberData?.meFollowed?.[0]?.myFollowing === true);
	}, [memberData]);

	// Member twits (tab 0 only)
	const twitsInquiry = {
		page: twitsPage,
		limit: LIMIT,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { memberId },
	};

	const { data: twitsRaw, loading: twitsLoading } = useQuery(GET_MEMBER_TWITS, {
		variables: { input: twitsInquiry },
		skip: !memberId || activeTab !== 0,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const twits: Twit[] = twitsRaw?.getMemberTwits?.list ?? [];
	const twitsTotal: number = twitsRaw?.getMemberTwits?.metaCounter?.[0]?.total ?? 0;

	// Follow / like mutations
	const [subscribe] = useMutation(SUBSCRIBE, {
		onCompleted: async () => {
			await memberRefetch({ input: memberId as string });
		},
	});
	const [unsubscribe] = useMutation(UNSUBSCRIBE, {
		onCompleted: async () => {
			await memberRefetch({ input: memberId as string });
		},
	});
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

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
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: query });
			await sweetTopSmallSuccessAlert(t('common:success'), 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (mId: string) => {
		try {
			if (mId === user?._id) await router.push('/mypage');
			else await router.push(`/member/${mId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const followHandler = async () => {
		if (!user?._id) {
			router.push('/account/join');
			return;
		}
		const prevFollowing = isFollowing;
		setIsFollowing(!prevFollowing); // optimistic toggle
		try {
			if (prevFollowing) {
				await unsubscribe({ variables: { memberId: memberId as string } });
			} else {
				await subscribe({ variables: { memberId: memberId as string } });
			}
			await new Promise(resolve => setTimeout(resolve, 300));
			setFollowersRefetchTrigger((k) => k + 1);
			// onCompleted handles memberRefetch; just show the alert here
			await sweetTopSmallSuccessAlert(prevFollowing ? t('unsubscribed') : t('subscribed'), 800);
		} catch (err: any) {
			setIsFollowing(prevFollowing); // rollback toggle
			sweetErrorHandling(err).then();
		}
	};

	const handleTabChange = (idx: number) => {
		setActiveTab(idx);
		setTwitsPage(1);
	};

	const TABS = [t('tab_posts'), t('tab_followers'), t('tab_followings')];

	// TwitCard requires onDelete — no-op since owner posts don't appear here
	const deleteTwitHandler = async (_id: string): Promise<void> => {};

	if (device === 'mobile') {
		return <div id="member-page">{t('placeholder')}</div>;
	}

	return (
		<div id="member-page">
			<div className="container">
				<div className="member-shell">
					{/* Left nav */}
					<CommunityLeftNav />

					{/* Center: profile column */}
					<Stack className="member-feed-column">
							{/* Sticky back header */}
							<div className="member-back-header">
								<IconButton className="member-back-btn" onClick={() => router.back()} aria-label={t('aria_go_back')}>
									<ArrowBackOutlinedIcon />
								</IconButton>
							<Typography className="member-back-title">{memberData?.memberNick ?? t('default_profile')}</Typography>
						</div>

						{/* Banner */}
						<div className="member-profile-banner" />

						{/* Avatar */}
						<div className="member-profile-actions">
							<div className="member-profile-avatar-wrap">
								<img
									src={resolveAvatar(memberData?.memberImage)}
									alt={memberData?.memberNick ?? ''}
									className="member-profile-avatar"
								/>
							</div>
						</div>

						{/* Profile info */}
						<Stack className="member-profile-info">
							<div className="member-profile-name-row">
								<Typography className="member-profile-name">
									{memberData?.memberNick ?? '—'}
								</Typography>
								<Button
									variant="contained"
									className="member-follow-btn"
									onClick={followHandler}
									disableRipple
									disableElevation
									sx={{
										backgroundColor: '#1a1a2e',
										'&:hover': { backgroundColor: '#1a1a2e' },
									}}
								>
									{isFollowing ? t('btn_following') : t('btn_follow')}
								</Button>
							</div>

							{memberData?.memberType && (
								<span className="member-type-badge">{memberData.memberType}</span>
							)}

							{memberData?.memberDesc && (
								<Typography className="member-profile-bio">{memberData.memberDesc}</Typography>
							)}

							<div className="member-profile-meta">
								{memberData?.memberAddress && (
									<span className="member-meta-item">
										<LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
										{memberData.memberAddress}
									</span>
								)}
									{memberData?.createdAt && (
										<span className="member-meta-item">
											<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
											{t('joined_label')} <Moment format="MMM YYYY">{memberData.createdAt}</Moment>
										</span>
									)}
							</div>

							<div className="member-stats-row">
								<span className="member-stat">
									<strong className="member-stat-count">{memberData?.memberTwits ?? 0}</strong>
									<span className="member-stat-label">{t('stat_posts')}</span>
								</span>
								<span className="member-stat clickable" onClick={() => handleTabChange(2)}>
									<strong className="member-stat-count">{memberData?.memberFollowings ?? 0}</strong>
									<span className="member-stat-label">{t('stat_following')}</span>
								</span>
								<span className="member-stat clickable" onClick={() => handleTabChange(1)}>
									<strong className="member-stat-count">{memberData?.memberFollowers ?? 0}</strong>
									<span className="member-stat-label">{t('stat_followers')}</span>
								</span>
							</div>
						</Stack>

						{/* Tabs */}
						<Stack className="member-tabs">
							{TABS.map((tab, i) => (
								<Stack
									key={tab}
									className={`member-tab${activeTab === i ? ' active' : ''}`}
									onClick={() => handleTabChange(i)}
								>
									<Typography>{tab}</Typography>
								</Stack>
							))}
						</Stack>

						{/* Posts feed */}
						{activeTab === 0 && (
							<>
								{twitsLoading && (
									<Stack className="member-feed-state">
										<Typography className="member-state-text">{t('loading')}</Typography>
									</Stack>
								)}
								{!twitsLoading && twits.length === 0 && (
									<Stack className="member-feed-state">
										<Typography className="member-state-title">{t('no_posts_title')}</Typography>
										<Typography className="member-state-copy">
											{t('no_posts_desc')}
										</Typography>
									</Stack>
								)}
								{twits.map((twit) => (
									<TwitCard
										key={twit._id}
										twit={twit}
										currentUserId={user?._id}
										onDelete={deleteTwitHandler}
									/>
								))}
								{twitsTotal > LIMIT && (
									<Stack className="pagination-config">
										<Stack className="pagination-box">
											<Pagination
												count={Math.ceil(twitsTotal / LIMIT)}
												page={twitsPage}
												shape="circular"
												color="primary"
												onChange={(_e, val) => setTwitsPage(val)}
											/>
											</Stack>
											<Stack className="total-result">
												<Typography>
													{t('posts_count', { count: twitsTotal })}
												</Typography>
											</Stack>
									</Stack>
								)}
							</>
						)}

						{/* Followers tab */}
						{activeTab === 1 && (
							<MemberFollowers
								initialInput={{ page: 1, limit: 10, search: { followingId: memberId } }}
								subscribeHandler={subscribeHandler}
								unsubscribeHandler={unsubscribeHandler}
								likeMemberHandler={likeMemberHandler}
								redirectToMemberPageHandler={redirectToMemberPageHandler}
								onProfileRefetch={async () => { await memberRefetch({ input: memberId }); }}
								refetchTrigger={followersRefetchTrigger}
							/>
						)}

						{/* Followings tab */}
						{activeTab === 2 && (
							<MemberFollowings
								initialInput={{ page: 1, limit: 10, search: { followerId: memberId } }}
								subscribeHandler={subscribeHandler}
								unsubscribeHandler={unsubscribeHandler}
								likeMemberHandler={likeMemberHandler}
								redirectToMemberPageHandler={redirectToMemberPageHandler}
								onProfileRefetch={async () => { await memberRefetch({ input: memberId }); }}
							/>
						)}
					</Stack>

					{/* Right rail (reuses community-right-rail styles) */}
					<Stack className="community-right-rail">
						<Stack className="rail-section">
							<OutlinedInput
								className="rail-search-bar"
								placeholder={t('search_community')}
								startAdornment={<SearchIcon sx={{ color: '#64748b', fontSize: 18, mr: 0.5 }} />}
								size="small"
							/>
						</Stack>

						<Stack className="rail-section">
							<Typography className="rail-section-title">{t('trending_title')}</Typography>
							{TRENDING.map((item) => (
								<Stack key={item.label} className="rail-trend-item">
									<Typography className="trend-label">{item.label}</Typography>
									<Typography className="trend-count">{item.count}</Typography>
								</Stack>
							))}
						</Stack>

						<Stack className="rail-section">
							<Typography className="rail-section-title">{t('who_to_follow')}</Typography>
							{WHO_TO_FOLLOW.map((m) => (
								<Stack key={m.nick} className="rail-follow-item">
									<img src={m.image} alt="" className="rail-follow-avatar" />
									<Stack className="rail-follow-info">
										<Typography className="rail-follow-name">{m.name}</Typography>
										<Typography className="rail-follow-nick">{m.nick}</Typography>
									</Stack>
									<Button className="rail-follow-btn" variant="outlined" size="small">
										{t('btn_follow')}
									</Button>
								</Stack>
							))}
						</Stack>
					</Stack>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberProfile);
