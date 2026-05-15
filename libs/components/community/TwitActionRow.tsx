import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface TwitActionRowProps {
	twitId: string;
	likeCount: number;
	liked: boolean;
	isOwner: boolean;
	onComment: () => void;
	onLike: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

const TwitActionRow = ({ twitId, likeCount, liked, isOwner, onComment, onLike, onDelete }: TwitActionRowProps) => {
	const commentHandler = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		onComment();
	};

	const likeHandler = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		onLike(twitId);
	};

	const deleteHandler = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		onDelete(twitId);
	};

	return (
		<Stack className="twit-action-row">
			<Stack className="twit-action">
				<IconButton onClick={commentHandler}>
					<ChatBubbleOutlineIcon />
				</IconButton>
				<Typography>Reply</Typography>
			</Stack>
			<Stack className={`twit-action like-action ${liked ? 'active' : ''}`}>
				<IconButton onClick={likeHandler}>{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}</IconButton>
				<Typography>{likeCount}</Typography>
			</Stack>
			{isOwner && (
				<Stack className="twit-action delete-action">
					<IconButton onClick={deleteHandler}>
						<DeleteOutlineIcon />
					</IconButton>
					<Typography>Delete</Typography>
				</Stack>
			)}
		</Stack>
	);
};

export default TwitActionRow;
