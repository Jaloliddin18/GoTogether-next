import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_TWIT } from '../../apollo/user/query';
import { Twit } from '../../libs/types/twit/twit';
import { REACT_APP_API_URL } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const twitId = query?.id as string;
	const user = useReactiveVar(userVar);
	const [twit, setTwit] = useState<Twit>();

	/** APOLLO REQUESTS **/
	const { loading: getTwitLoading, error: getTwitError } = useQuery(GET_TWIT, {
		fetchPolicy: 'network-only',
		variables: { input: { _id: twitId } },
		skip: !twitId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTwit(data?.getTwit);
		},
	});

	/** HANDLERS **/
	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${REACT_APP_API_URL}/${imageUrl}`;
	};

	const getTwitImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '';
		if (imageUrl.startsWith('http')) return imageUrl;
		if (imageUrl.startsWith('/')) return imageUrl;
		return `/${imageUrl}`;
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const goCommunityPage = () => {
		router.push('/community?articleCategory=FREE');
	};

	if (device === 'mobile') {
		return <div>COMMUNITY DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<div id="community-detail-page">
				<div className="container">
					<Stack className="main-box">
						<Stack className="left-config">
							<Stack className={'image-info'}>
								<img src={'/img/logo/logoText.svg'} />
								<Stack className={'community-name'}>
									<Typography className={'name'}>Community Post</Typography>
								</Stack>
							</Stack>
							<Button className="tab-button active" onClick={goCommunityPage}>
								Community Feed
							</Button>
						</Stack>
						<div className="community-detail-config">
							<Stack className="title-box">
								<Stack className="left">
									<Typography className="title">COMMUNITY POST</Typography>
									<Typography className="sub-title">Read a Smart Library community update</Typography>
								</Stack>
								<Button
									onClick={() =>
										router.push({
											pathname: '/community',
											query: {
												articleCategory: 'FREE',
											},
										})
									}
									className="right"
								>
									Back
								</Button>
							</Stack>
							<div className="config">
								<Stack className="first-box-config">
									{getTwitLoading && (
										<Stack sx={{ width: '100%', minHeight: '320px', alignItems: 'center', justifyContent: 'center' }}>
											<CircularProgress />
										</Stack>
									)}

									{!getTwitLoading && getTwitError && (
										<Stack sx={{ width: '100%', minHeight: '320px', alignItems: 'center', justifyContent: 'center' }}>
											<Typography className="content-data">Unable to load community post.</Typography>
										</Stack>
									)}

									{!getTwitLoading && !getTwitError && twit && (
										<>
											<Stack className="content-and-info">
												<Stack className="content">
													<Stack className="member-info">
														<img
															src={getMemberImage(twit?.memberData?.memberImage)}
															alt=""
															className="member-img"
															onClick={() => goMemberPage(twit?.memberData?._id)}
														/>
														<Typography className="member-nick" onClick={() => goMemberPage(twit?.memberData?._id)}>
															{twit?.memberData?.memberFullName || twit?.memberData?.memberNick}
														</Typography>
														<Stack className="divider"></Stack>
														<Moment className={'time-added'} format={'DD.MM.YY HH:mm'}>
															{twit?.createdAt}
														</Moment>
													</Stack>
												</Stack>
												<Stack className="info">
													<Stack className="icon-info">
														<ThumbUpOffAltIcon />
														<Typography className="text">{twit?.likeCount ?? 0}</Typography>
													</Stack>
												</Stack>
											</Stack>
											<Stack sx={{ width: '100%', padding: '35px 25px', gap: '24px' }}>
												<Typography className="content-data">{twit?.text}</Typography>
												{twit?.image && (
													<img
														src={getTwitImage(twit?.image)}
														alt=""
														style={{
															width: '100%',
															maxHeight: '520px',
															objectFit: 'cover',
															borderRadius: '8px',
														}}
													/>
												)}
											</Stack>
											<Stack className="like-and-dislike">
												<Stack className="top">
													<Button>
														<ThumbUpOffAltIcon />
														<Typography className="text">{twit?.likeCount ?? 0}</Typography>
													</Button>
												</Stack>
											</Stack>
										</>
									)}

									{!getTwitLoading && !getTwitError && !twit && (
										<Stack sx={{ width: '100%', minHeight: '320px', alignItems: 'center', justifyContent: 'center' }}>
											<Typography className="content-data">Community post not found.</Typography>
										</Stack>
									)}
								</Stack>
							</div>
						</div>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(CommunityDetail);
