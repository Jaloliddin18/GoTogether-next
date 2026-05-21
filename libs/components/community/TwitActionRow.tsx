import React, { useState } from 'react';
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

// Persist liked-twit IDs in localStorage so state survives page refreshes.
// The server's getMemberTwits resolver doesn't reliably compute meLiked for
// the authenticated user on list queries, so we maintain our own truth here.
const LS_KEY = 'liked_twits';

const getLikedSet = (): Set<string> => {
	try {
		return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'));
	} catch {
		return new Set();
	}
};

const saveLikedSet = (s: Set<string>): void => {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify([...s]));
	} catch {}
};

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

	// If server returned meLiked=true, trust it; otherwise fall back to localStorage.
	const [isLiked, setIsLiked] = useState<boolean>(
		() => twit?.meLiked === true || getLikedSet().has(twitId),
	);
	const [likeCount, setLikeCount] = useState<number>(twit?.likeCount ?? 0);

	const [likeTwit] = useMutation(LIKE_TWIT, {
		onError: (err) => console.error(err),
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

		const prevLiked = isLiked;
		const prevCount = likeCount;
		const nextLiked = !isLiked;
		const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

		// Optimistic local update
		setIsLiked(nextLiked);
		setLikeCount(nextCount);
		const s = getLikedSet();
		nextLiked ? s.add(twitId) : s.delete(twitId);
		saveLikedSet(s);

		try {
			const { data } = await likeTwit({ variables: { twitId } });
			const serverLiked: boolean | undefined = data?.likeTwit?.meLiked;
			const serverCount: number | undefined = data?.likeTwit?.likeCount;

			// Reconcile with server response
			if (serverLiked !== undefined && serverLiked !== null) {
				setIsLiked(serverLiked);
				const s2 = getLikedSet();
				serverLiked ? s2.add(twitId) : s2.delete(twitId);
				saveLikedSet(s2);
			}
			if (serverCount != null) setLikeCount(serverCount);

			sweetTopSmallSuccessAlert('Success!', 750).then();
		} catch {
			// Revert to pre-click state
			setIsLiked(prevLiked);
			setLikeCount(prevCount);
			const s3 = getLikedSet();
			prevLiked ? s3.add(twitId) : s3.delete(twitId);
			saveLikedSet(s3);
		}
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
				<Typography>{likeCount}</Typography>
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
