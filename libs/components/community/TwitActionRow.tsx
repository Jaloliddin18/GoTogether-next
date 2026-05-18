import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LIKE_TWIT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Twit } from '../../types/twit/twit';

interface TwitActionRowProps {
	twit: Twit;
	isOwner: boolean;
	repostCount?: number;
	viewCount?: number;
	onComment: () => void;
	onDelete: (id: string) => Promise<void>;
}

const TwitActionRow = ({
	twit,
	isOwner,
	repostCount = 0,
	viewCount = 0,
	onComment,
	onDelete,
}: TwitActionRowProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const twitId = twit?._id;
	const isLiked = twit?.meLiked ?? false;
	const currentLikeCount = twit?.likeCount ?? 0;
	const [likeTwit] = useMutation(LIKE_TWIT, {
		onCompleted: () => {
			sweetTopSmallSuccessAlert('Success!', 750).then();
		},
		onError: (err) => {
			console.error(err);
		},
	});

	const commentHandler = (e: React.SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onComment();
	};
	const likeHandler = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!twitId) return;
		if (!user?._id) {
			await router.push('/account/join');
			return;
		}
		const nextLiked = !isLiked;
		const nextLikeCount = nextLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1);
		await likeTwit({
			variables: { twitId },
			optimisticResponse: {
				likeTwit: {
					__typename: 'Twit',
					_id: twitId,
					meLiked: nextLiked,
					likeCount: nextLikeCount,
				},
			},
		});
	};
	const deleteHandler = (e: React.SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onDelete(twitId);
	};

	return (
		<Stack className="twit-action-row">
			<Stack className="twit-action">
				<IconButton onClick={commentHandler} aria-label="Reply">
					<ChatBubbleOutlineIcon />
				</IconButton>
				<Typography>0</Typography>
			</Stack>

			<Stack className="twit-action">
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					aria-label="Repost"
				>
					<RepeatOutlinedIcon />
				</IconButton>
				<Typography>{repostCount}</Typography>
			</Stack>

			<Stack className={`twit-action like-action${isLiked ? ' active' : ''}`}>
				<IconButton onClick={likeHandler} aria-label="Like">
					{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</IconButton>
				<Typography>{currentLikeCount}</Typography>
			</Stack>

			<Stack className="twit-action">
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					aria-label="Views"
				>
					<VisibilityOutlinedIcon />
				</IconButton>
				<Typography>{viewCount}</Typography>
			</Stack>

			<Stack className="twit-action">
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					aria-label="Share"
				>
					<IosShareOutlinedIcon />
				</IconButton>
			</Stack>

			{isOwner && (
				<Stack className="twit-action delete-action">
					<IconButton onClick={deleteHandler} aria-label="Delete">
						<DeleteOutlineIcon />
					</IconButton>
				</Stack>
			)}
		</Stack>
	);
};

export default TwitActionRow;
