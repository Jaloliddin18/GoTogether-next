import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_TWIT, GET_TWIT_COMMENTS } from '../../apollo/user/query';
import { CREATE_TWIT_COMMENT, DELETE_TWIT, LIKE_TWIT } from '../../apollo/user/mutation';
import { TwitComment } from '../../libs/types/twit-comment/twit-comment';
import TwitAuthorRow from '../../libs/components/community/TwitAuthorRow';
import TwitBody from '../../libs/components/community/TwitBody';
import TwitActionRow from '../../libs/components/community/TwitActionRow';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';

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
	const [replyText, setReplyText] = useState('');
	const [replySubmitting, setReplySubmitting] = useState(false);

	const [likeTwit] = useMutation(LIKE_TWIT);
	const [deleteTwit] = useMutation(DELETE_TWIT);
	const [createTwitComment] = useMutation(CREATE_TWIT_COMMENT);

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

	const {
		loading: commentsLoading,
		data: commentsData,
		refetch: commentsRefetch,
	} = useQuery(GET_TWIT_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 20,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { twitId },
			},
		},
		skip: !twitId,
		notifyOnNetworkStatusChange: true,
	});

	const twit = data?.getTwit;
	const comments: TwitComment[] = commentsData?.getTwitComments?.list ?? [];
	const liked = !!user?._id && !!twit?.likes?.includes(user._id);
	const isOwner = !!user?._id && user._id === twit?.memberId;

	const goCommunityPage = async () => {
		await router.push('/community');
	};

	const likeTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}
			await likeTwit({ variables: { input: id } });
			await twitRefetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const deleteTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}
			const confirmation = await sweetConfirmAlert('Delete this post?');
			if (!confirmation) return;
			await deleteTwit({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Deleted', 800);
			await goCommunityPage();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const submitReplyHandler = async () => {
		try {
			if (!replyText.trim()) return;
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}
			if (!twitId) throw new Error(Message.SOMETHING_WENT_WRONG);
			setReplySubmitting(true);
			await createTwitComment({
				variables: { input: { twitId, text: replyText.trim() } },
			});
			setReplyText('');
			await commentsRefetch();
			await sweetTopSmallSuccessAlert('Reply posted', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setReplySubmitting(false);
		}
	};

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${REACT_APP_API_URL}/${imageUrl}`;
	};

	return (
		<div id="community-detail-page" className={`community-detail-device-${device}`}>
			<div className="container">
				<Stack className="community-detail-shell">
					{/* Sticky header */}
					<Stack className="detail-sticky-header">
						<IconButton className="detail-back-btn" onClick={goCommunityPage} aria-label="Back to feed">
							<ArrowBackOutlinedIcon />
						</IconButton>
						<Typography className="detail-header-title">Post</Typography>
					</Stack>

					{getTwitLoading && (
						<Stack className="detail-state-box">
							<CircularProgress size={28} />
							<Typography>Loading post...</Typography>
						</Stack>
					)}

					{!getTwitLoading && getTwitError && (
						<Stack className="detail-state-box">
							<Typography className="state-title">Unable to load this post</Typography>
							<Typography>Please go back to the feed and try again.</Typography>
						</Stack>
					)}

					{!getTwitLoading && !getTwitError && !twit && (
						<Stack className="detail-state-box">
							<Typography className="state-title">Post not found</Typography>
							<Typography>This post may have been deleted.</Typography>
						</Stack>
					)}

					{!getTwitLoading && !getTwitError && twit && (
						<>
							<Stack className="twit-detail-card">
								<TwitAuthorRow twit={twit} />
								<TwitBody text={twit.text} image={twit.image} />

								<Typography className="detail-timestamp">
									<Moment format="h:mm A · MMM D, YYYY">{twit.createdAt}</Moment>
								</Typography>

								<Stack className="detail-stats-row">
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{twit.likeCount ?? 0}</Typography>
										<Typography className="stat-label">Likes</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">0</Typography>
										<Typography className="stat-label">Reposts</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{comments.length}</Typography>
										<Typography className="stat-label">Replies</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{twit?.viewCount ?? 0}</Typography>
										<Typography className="stat-label">Views</Typography>
									</Stack>
								</Stack>

								<TwitActionRow
									twitId={twit._id}
									likeCount={twit.likeCount ?? 0}
									viewCount={twit?.viewCount ?? 0}
									liked={liked}
									isOwner={isOwner}
									onComment={() => document.getElementById('reply-input')?.focus()}
									onLike={likeTwitHandler}
									onDelete={deleteTwitHandler}
								/>
							</Stack>

							{/* Reply composer */}
							{user?._id && (
								<Stack className="detail-reply-composer">
									<img
										src={getMemberImage(user?.memberImage)}
										alt=""
										className="reply-avatar"
									/>
									<Stack className="reply-input-wrap">
										<TextField
											id="reply-input"
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											multiline
											minRows={1}
											placeholder="Post your reply"
											variant="standard"
											InputProps={{ disableUnderline: true }}
											className="reply-input"
										/>
										{replyText.trim() && (
											<Stack className="reply-submit-row">
												<Button
													className="reply-submit-btn"
													disabled={replySubmitting || !replyText.trim()}
													onClick={submitReplyHandler}
												>
													{replySubmitting ? 'Posting...' : 'Reply'}
												</Button>
											</Stack>
										)}
									</Stack>
								</Stack>
							)}

							{/* Replies thread */}
							{commentsLoading ? (
								<Stack className="detail-state-box" sx={{ minHeight: 100 }}>
									<CircularProgress size={22} />
								</Stack>
							) : comments.length > 0 ? (
								<>
									<Stack className="replies-section-header">
										<Typography>Replies</Typography>
									</Stack>
									{comments.map((comment) => (
										<Stack key={comment._id} className="reply-card">
											<Stack
												flexDirection="row"
												alignItems="flex-start"
												gap="12px"
											>
												<img
													src={getMemberImage(comment.memberData?.memberImage)}
													alt=""
													style={{
														width: 38,
														height: 38,
														borderRadius: '50%',
														objectFit: 'cover',
														border: '1px solid #ddd8cf',
														flexShrink: 0,
													}}
												/>
												<Stack gap="4px" minWidth={0} flex={1}>
													<Stack flexDirection="row" alignItems="center" gap="6px" flexWrap="wrap">
														<Typography
															sx={{
																color: '#1a1814',
																fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
																fontSize: 14,
																fontWeight: 700,
																lineHeight: '18px',
															}}
														>
															{comment.memberData?.memberFullName ||
																comment.memberData?.memberNick ||
																'Community member'}
														</Typography>
														{comment.memberData?.memberNick && (
															<Typography
																sx={{
																	color: '#8a8077',
																	fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
																	fontSize: 13,
																	lineHeight: '18px',
																}}
															>
																@{comment.memberData.memberNick}
															</Typography>
														)}
														<Typography
															sx={{
																color: '#8a8077',
																fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
																fontSize: 13,
																lineHeight: '18px',
															}}
														>
															·
														</Typography>
														<Moment
															fromNow
															style={{
																color: '#8a8077',
																fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
																fontSize: 13,
																lineHeight: '18px',
															}}
														>
															{comment.createdAt}
														</Moment>
													</Stack>
													<Typography
														sx={{
															color: '#1a1814',
															fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
															fontSize: 14,
															fontWeight: 400,
															lineHeight: 1.65,
															whiteSpace: 'pre-wrap',
															overflowWrap: 'anywhere',
														}}
													>
														{comment.text}
													</Typography>
												</Stack>
											</Stack>
										</Stack>
									))}
								</>
							) : (
								<Stack id="community-comments-placeholder" className="community-comments-placeholder">
									<Typography className="placeholder-title">Replies</Typography>
									<Typography className="placeholder-copy">Be the first to reply.</Typography>
								</Stack>
							)}
						</>
					)}
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityDetail);
