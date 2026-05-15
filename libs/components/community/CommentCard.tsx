import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import Moment from 'react-moment';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { TwitComment } from '../../types/twit-comment/twit-comment';
import { REACT_APP_API_URL } from '../../config';
import { LIKE_TWIT_COMMENT, UPDATE_TWIT_COMMENT, DELETE_TWIT_COMMENT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetConfirmAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface CommentCardProps {
	comment: TwitComment;
	// direct children of this comment (depth+1 items)
	replies: TwitComment[];
	// depth-2 pool — passed down so depth-1 cards can render their own children
	depth2?: TwitComment[];
	onReply: (parentCommentId: string, authorNick: string) => void;
	onDelete?: (commentId: string) => void;
}

const resolveAvatar = (imageUrl: string | undefined): string => {
	if (!imageUrl) return '/img/profile/defaultUser.svg';
	if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
	return `${REACT_APP_API_URL}/${imageUrl}`;
};

const CommentCard = ({ comment, replies, depth2 = [], onReply, onDelete }: CommentCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const nick = comment.memberData?.memberNick ?? '';
	const avatarSize = comment.depth === 0 ? 38 : 32;
	const isLiked = comment.meLiked ?? false;
	const currentCount = comment.likeCount ?? 0;
	const isOwner = !!user?._id && user._id === comment.memberId;

	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(comment.text);
	const [displayText, setDisplayText] = useState(comment.text);

	const [likeTwitComment] = useMutation(LIKE_TWIT_COMMENT, {
		onError: (err) => console.error(err),
	});

	const [updateTwitComment] = useMutation(UPDATE_TWIT_COMMENT, {
		onCompleted: (data) => {
			setDisplayText(data.updateTwitComment.text);
			setIsEditing(false);
			sweetTopSmallSuccessAlert('Comment updated', 750).then();
		},
		onError: (err) => console.error(err),
	});

	const [deleteTwitComment] = useMutation(DELETE_TWIT_COMMENT, {
		onCompleted: () => {
			sweetTopSmallSuccessAlert('Comment deleted', 750).then();
			onDelete?.(comment._id);
		},
		onError: (err) => console.error(err),
	});

	const likeHandler = async () => {
		if (!user?._id) {
			await router.push('/account/join');
			return;
		}
		await likeTwitComment({
			variables: { input: comment._id },
			optimisticResponse: {
				likeTwitComment: {
					__typename: 'TwitComment',
					_id: comment._id,
					twitId: comment.twitId,
					memberId: comment.memberId,
					text: comment.text,
					parentCommentId: comment.parentCommentId ?? null,
					depth: comment.depth,
					likeCount: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
					deletedAt: comment.deletedAt ?? null,
					createdAt: comment.createdAt,
					updatedAt: comment.updatedAt,
					meLiked: !isLiked,
				},
			},
		});
	};

	const editHandler = () => {
		setEditText(displayText);
		setIsEditing(true);
	};

	const saveEditHandler = async () => {
		const trimmed = editText.trim();
		if (!trimmed || trimmed === displayText) {
			setIsEditing(false);
			return;
		}
		await updateTwitComment({
			variables: { input: { commentId: comment._id, text: trimmed } },
		});
	};

	const deleteHandler = async () => {
		const confirmed = await sweetConfirmAlert('Delete this comment?');
		if (!confirmed) return;
		await deleteTwitComment({ variables: { input: comment._id } });
	};

	return (
		<Stack className="reply-card">
			<Stack flexDirection="row" alignItems="flex-start" gap="12px">
				<img
					src={resolveAvatar(comment.memberData?.memberImage)}
					alt=""
					style={{
						width: avatarSize,
						height: avatarSize,
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
							{comment.memberData?.memberFullName || nick || 'Community member'}
						</Typography>
						{nick && (
							<Typography
								sx={{
									color: '#8a8077',
									fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif',
									fontSize: 13,
									lineHeight: '18px',
								}}
							>
								@{nick}
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

					{isEditing ? (
						<>
							<textarea
								className="comment-edit-input"
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
								rows={3}
								autoFocus
							/>
							<div className="comment-edit-actions">
								<button className="comment-edit-save" onClick={saveEditHandler}>
									Save
								</button>
								<button className="comment-edit-cancel" onClick={() => setIsEditing(false)}>
									Cancel
								</button>
							</div>
						</>
					) : (
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
							{displayText}
						</Typography>
					)}

					<div className="comment-action-row">
						{comment.depth < 2 && (
							<button className="comment-reply-btn" onClick={() => onReply(comment._id, nick)}>
								Reply
							</button>
						)}
						<button
							className={`comment-like-btn${isLiked ? ' liked' : ''}`}
							onClick={likeHandler}
							aria-label="Like comment"
						>
							{isLiked ? (
								<FavoriteIcon sx={{ fontSize: 14 }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: 14 }} />
							)}
							{currentCount > 0 && <span>{currentCount}</span>}
						</button>
						{isOwner && (
							<div className="comment-owner-actions">
								<button className="comment-owner-btn" onClick={editHandler} aria-label="Edit comment">
									<EditOutlinedIcon sx={{ fontSize: 16 }} />
								</button>
								<button className="comment-owner-btn delete" onClick={deleteHandler} aria-label="Delete comment">
									<DeleteOutlinedIcon sx={{ fontSize: 16 }} />
								</button>
							</div>
						)}
					</div>
				</Stack>
			</Stack>

			{replies.length > 0 && (
				<div className="comment-replies">
					{replies.map((reply) => (
						<CommentCard
							key={reply._id}
							comment={reply}
							replies={depth2.filter((r) => r.parentCommentId === reply._id)}
							onReply={onReply}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</Stack>
	);
};

export default CommentCard;
