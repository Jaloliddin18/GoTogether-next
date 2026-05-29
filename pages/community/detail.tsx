import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, IconButton, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { useTranslation } from 'next-i18next';
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
import { API_BASE_URL } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';
import TwitCardSkeleton from '../../libs/components/common/TwitCardSkeleton';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'community'])),
	},
});

const CommunityDetail: NextPage = () => {
	const { t } = useTranslation('community');
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
			const confirmation = await sweetConfirmAlert(t('delete_confirm'));
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
			await sweetTopSmallSuccessAlert(t('toast_deleted'), 800);
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
			await sweetTopSmallSuccessAlert(t('reply_posted'), 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setReplySubmitting(false);
		}
	};

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${API_BASE_URL}/${imageUrl}`;
	};

	return (
		<div id="community-detail-page" className={`community-detail-device-${device}`}>
			<div className="container">
				<Stack className="community-detail-shell">
					{/* Sticky header */}
					<Stack className="detail-sticky-header">
						<IconButton className="detail-back-btn" onClick={goCommunityPage} aria-label={t('detail_back')}>
							<ArrowBackOutlinedIcon />
						</IconButton>
						<Typography className="detail-header-title">{t('detail_title')}</Typography>
					</Stack>

					{getTwitLoading && (
						<Stack className="community-feed" sx={{ gap: 1.5 }}>
							<TwitCardSkeleton />
						</Stack>
					)}

					{!getTwitLoading && getTwitError && (
						<Stack className="detail-state-box">
							<Typography className="state-title">{t('detail_error_title')}</Typography>
							<Typography>{t('detail_error_msg')}</Typography>
						</Stack>
					)}

					{!getTwitLoading && !getTwitError && !twit && (
						<Stack className="detail-state-box">
							<Typography className="state-title">{t('detail_not_found_title')}</Typography>
							<Typography>{t('detail_not_found_msg')}</Typography>
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
										<Typography className="stat-label">{t('stat_likes')}</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">0</Typography>
										<Typography className="stat-label">{t('stat_reposts')}</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{depth0.length}</Typography>
										<Typography className="stat-label">{t('stat_replies')}</Typography>
									</Stack>
									<Stack className="detail-stat-item">
										<Typography className="stat-count">{twit?.viewCount ?? 0}</Typography>
										<Typography className="stat-label">{t('stat_views')}</Typography>
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
										<span onClick={() => router.push('/account/join')} className="login-link">{t('login_link')}</span>{' '}{t('login_to_reply')}
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
												<span>{t('replying_to', { nick: replyTo.nick })}</span>
												<button onClick={() => setReplyTo(null)} aria-label={t('cancel_reply')}>×</button>
											</div>
										)}
										<TextField
											id="reply-input"
											inputRef={replyInputRef}
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											multiline
											minRows={1}
											placeholder={replyTo ? t('placeholder_replying', { nick: replyTo.nick }) : t('placeholder_reply')}
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
													{replySubmitting ? t('btn_posting') : t('btn_reply')}
												</Button>
											</Stack>
										)}
									</Stack>
								</Stack>
							)}

							{/* Replies thread */}
							{commentsLoading ? (
								<Stack sx={{ gap: 1.2, mt: 1 }}>
									{Array.from({ length: 2 }).map((_, index) => (
										<Stack
											key={`detail-comment-skeleton-${index}`}
											sx={{
												border: '1px solid #e2e8f0',
												borderRadius: '12px',
												p: 1.5,
												gap: 1,
											}}
										>
											<Stack direction="row" spacing={1.2} alignItems="center">
												<Skeleton variant="circular" animation="wave" width={34} height={34} />
												<Skeleton variant="text" animation="wave" width="34%" height={22} />
											</Stack>
											<Skeleton variant="text" animation="wave" width="96%" height={22} />
											<Skeleton variant="text" animation="wave" width="68%" height={22} />
										</Stack>
									))}
								</Stack>
							) : depth0.length > 0 ? (
								<>
									<Stack className="replies-section-header">
										<Typography>{t('replies_section')}</Typography>
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
									<Typography className="placeholder-title">{t('replies_section')}</Typography>
									<Typography className="placeholder-copy">{t('no_replies')}</Typography>
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
