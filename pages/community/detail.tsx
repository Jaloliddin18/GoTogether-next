import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_TWIT } from '../../apollo/user/query';
import { DELETE_TWIT, LIKE_TWIT } from '../../apollo/user/mutation';
import { Twit } from '../../libs/types/twit/twit';
import TwitAuthorRow from '../../libs/components/community/TwitAuthorRow';
import TwitBody from '../../libs/components/community/TwitBody';
import TwitActionRow from '../../libs/components/community/TwitActionRow';
import { Message } from '../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const twitId = typeof router.query?.id === 'string' ? router.query.id : '';

	const [likeTwit] = useMutation(LIKE_TWIT);
	const [deleteTwit] = useMutation(DELETE_TWIT);
	const {
		loading: getTwitLoading,
		error: getTwitError,
		data,
		refetch: twitRefetch,
	} = useQuery(GET_TWIT, {
		fetchPolicy: 'network-only',
		variables: { input: { _id: twitId } },
		skip: !twitId,
		notifyOnNetworkStatusChange: true,
	});

	const twit: Twit | undefined = data?.getTwit;
	const liked = !!user?._id && !!twit?.likes?.includes(user._id);
	const isOwner = !!user?._id && user._id === twit?.memberId;

	const goCommunityPage = async () => {
		await router.push('/community');
	};

	const goCommentsPlaceholder = () => {
		document.getElementById('community-comments-placeholder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const likeTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTwit({
				variables: { input: id },
			});
			await twitRefetch();
		} catch (err: any) {
			console.log('ERROR, likeTwitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const deleteTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			const confirmation = await sweetConfirmAlert('Delete this post?');
			if (!confirmation) return;

			await deleteTwit({
				variables: { input: id },
			});
			await sweetTopSmallSuccessAlert('Deleted', 800);
			await goCommunityPage();
		} catch (err: any) {
			console.log('ERROR, deleteTwitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="community-detail-page" className={`community-detail-device-${device}`}>
			<div className="container">
				<Stack className="community-detail-shell">
					<Stack className="community-detail-header">
						<Button className="back-button" onClick={goCommunityPage}>
							Back to Feed
						</Button>
						<Stack className="header-copy">
							<Typography className="header-kicker">Smart Library Community</Typography>
							<Typography className="header-title">Community Post</Typography>
							<Typography className="header-subtitle">Read and react to a campus community update.</Typography>
						</Stack>
					</Stack>

					<Stack className="community-detail-content">
						{getTwitLoading && (
							<Stack className="detail-state-box">
								<CircularProgress />
								<Typography>Loading community post...</Typography>
							</Stack>
						)}

						{!getTwitLoading && getTwitError && (
							<Stack className="detail-state-box">
								<Typography className="state-title">Unable to load this post</Typography>
								<Typography className="state-copy">Please go back to the feed and try again.</Typography>
							</Stack>
						)}

						{!getTwitLoading && !getTwitError && twit && (
							<>
								<Stack className="twit-detail-card">
									<TwitAuthorRow twit={twit} />
									<TwitBody text={twit.text} image={twit.image} />
									<TwitActionRow
										twitId={twit._id}
										likeCount={twit.likeCount ?? 0}
										liked={liked}
										isOwner={isOwner}
										onComment={goCommentsPlaceholder}
										onLike={likeTwitHandler}
										onDelete={deleteTwitHandler}
									/>
								</Stack>

								<Stack id="community-comments-placeholder" className="community-comments-placeholder">
									<Typography className="placeholder-title">Replies</Typography>
									<Typography className="placeholder-copy">
										Comment threads will be enabled in the next community iteration.
									</Typography>
								</Stack>
							</>
						)}

						{!getTwitLoading && !getTwitError && !twit && (
							<Stack className="detail-state-box">
								<Typography className="state-title">Post not found</Typography>
								<Typography className="state-copy">This community post may have been deleted.</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityDetail);
