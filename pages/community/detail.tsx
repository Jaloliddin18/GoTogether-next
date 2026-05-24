import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_TWIT, GET_TWIT_COMMENTS } from '../../apollo/user/query';
import { CREATE_TWIT_COMMENT, DELETE_TWIT } from '../../apollo/user/mutation';
import { REMOVE_TWIT_BY_ADMIN } from '../../apollo/admin/mutation';
import { TwitComment } from '../../libs/types/twit-comment/twit-comment';
import TwitAuthorRow from '../../libs/components/community/TwitAuthorRow';
import TwitBody from '../../libs/components/community/TwitBody';
import TwitActionRow from '../../libs/components/community/TwitActionRow';
import CommentCard from '../../libs/components/community/CommentCard';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';

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
	const [replyTo, setReplyTo] = useState<{ parentId: string; nick: string } | null>(null);
	const replyInputRef = useRef<HTMLInputElement>(null);

	const [deleteTwit] = useMutation(DELETE_TWIT);
	const [removeTwitByAdmin] = useMutation(REMOVE_TWIT_BY_ADMIN);
	const [createTwitComment] = useMutation(CREATE_TWIT_COMMENT);

	const {
		loading: getTwitLoading,
		error: getTwitError,
		data,
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
				limit: 50,
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
	const depth0 = comments.filter((c) => c.depth === 0);
	const depth1 = comments.filter((c) => c.depth === 1);
	const depth2 = comments.filter((c) => c.depth === 2);
	const isAdmin = user?.memberType === MemberType.ADMIN;
	const canDelete = Boolean(user?._id && (user._id === twit?.memberId || isAdmin));

	const goCommunityPage = async () => {
		await router.push('/community');
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
			if (isAdmin) {
				try {
					await deleteTwit({ variables: { input: id } });
				} catch {
					await removeTwitByAdmin({ variables: { input: id } });
				}
			} else {
				await deleteTwit({ variables: { input: id } });
			}
			await sweetTopSmallSuccessAlert('Deleted', 800);
			await goCommunityPage();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleReply = (parentId: string, nick: string) => {
		setReplyTo({ parentId, nick });
		setTimeout(() => replyInputRef.current?.focus(), 50);
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
				variables: {
					input: {
						twitId,
						text: replyText.trim(),
						...(replyTo ? { parentCommentId: replyTo.parentId } : {}),
					},
				},
			});
			setReplyText('');
			setReplyTo(null);
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
								<TwitBody text={twit.text} images={twit.images} />

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
										<Typography className="stat-count">{depth0.length}</Typography>
										<Typography className="stat-label">Replies</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{twit?.viewCount ?? 0}</Typography>
										<Typography className="stat-label">Views</Typography>
									</Stack>
								</Stack>

								<TwitActionRow
									twit={twit}
									viewCount={twit?.viewCount ?? 0}
									canDelete={canDelete}
									onComment={() => replyInputRef.current?.focus()}
									onDelete={deleteTwitHandler}
								/>
							</Stack>

							{/* Reply composer */}
							{!user?._id ? (
								<div className="detail-login-prompt">
									<Typography>
										<span onClick={() => router.push('/account/join')} className="login-link">Log in</span> to reply
									</Typography>
								</div>
							) : (
								<Stack className="detail-reply-composer">
									<img
										src={getMemberImage(user?.memberImage)}
										alt=""
										className="reply-avatar"
									/>
									<Stack className="reply-input-wrap">
										{replyTo && (
											<div className="reply-to-indicator">
												<span>Replying to @{replyTo.nick}</span>
												<button onClick={() => setReplyTo(null)} aria-label="Cancel reply">×</button>
											</div>
										)}
										<TextField
											id="reply-input"
											inputRef={replyInputRef}
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											multiline
											minRows={1}
											placeholder={replyTo ? `Reply to @${replyTo.nick}...` : 'Post your reply'}
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
							) : depth0.length > 0 ? (
								<>
									<Stack className="replies-section-header">
										<Typography>Replies</Typography>
									</Stack>
									{depth0.map((comment) => (
										<CommentCard
											key={comment._id}
											comment={comment}
											replies={depth1.filter((r) => r.parentCommentId === comment._id)}
											depth2={depth2}
											onReply={handleReply}
											onDelete={() => commentsRefetch()}
										/>
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
