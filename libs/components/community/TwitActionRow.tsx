import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface TwitActionRowProps {
	twitId: string;
	likeCount: number;
	liked: boolean;
	isOwner: boolean;
	repostCount?: number;
	viewCount?: number;
	onComment: () => void;
	onLike: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

const TwitActionRow = ({
	twitId,
	likeCount,
	liked,
	isOwner,
	repostCount = 0,
	viewCount = 0,
	onComment,
	onLike,
	onDelete,
}: TwitActionRowProps) => {
	const commentHandler = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		onComment();
	};
	const likeHandler = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		onLike(twitId);
	};
	const deleteHandler = (e: React.SyntheticEvent) => {
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
					onClick={(e) => e.stopPropagation()}
					aria-label="Repost"
				>
					<RepeatOutlinedIcon />
				</IconButton>
				<Typography>{repostCount}</Typography>
			</Stack>

			<Stack className={`twit-action like-action${liked ? ' active' : ''}`}>
				<IconButton onClick={likeHandler} aria-label="Like">
					{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</IconButton>
				<Typography>{likeCount}</Typography>
			</Stack>

			<Stack className="twit-action">
				<IconButton
					onClick={(e) => e.stopPropagation()}
					aria-label="Views"
				>
					<VisibilityOutlinedIcon />
				</IconButton>
				<Typography>{viewCount}</Typography>
			</Stack>

			<Stack className="twit-action">
				<IconButton
					onClick={(e) => e.stopPropagation()}
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
