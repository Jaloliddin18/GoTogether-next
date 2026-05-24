import React, { useEffect, useState } from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import MessageBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
	canDelete: boolean;
	repostCount?: number;
	viewCount?: number;
	onComment: () => void;
	onDelete: (id: string) => Promise<void>;
}

const TwitActionRow = ({
	twit,
	canDelete,
	repostCount = 0,
	viewCount = 0,
	onComment,
	onDelete,
}: TwitActionRowProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const twitId = twit?._id;
	const [isLiked, setIsLiked] = useState<boolean>(Boolean(twit?.meLiked));
	const [likeCount, setLikeCount] = useState<number>(twit?.likeCount ?? 0);

	const [likeTwit] = useMutation(LIKE_TWIT, {
		onError: () => undefined,
	});

	useEffect(() => {
		setIsLiked(Boolean(twit?.meLiked));
		setLikeCount(twit?.likeCount ?? 0);
	}, [twit?._id, twit?.meLiked, twit?.likeCount]);

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

		setIsLiked(nextLiked);
		setLikeCount(nextCount);

		try {
			const { data } = await likeTwit({
				variables: { twitId },
				optimisticResponse: {
					likeTwit: {
						__typename: 'Twit',
						_id: twitId,
						memberId: twit.memberId,
						text: twit.text,
						images: twit.images ?? [],
						meLiked: nextLiked,
						likeCount: nextCount,
						viewCount: twit.viewCount ?? 0,
						deletedAt: twit.deletedAt ?? null,
						createdAt: twit.createdAt,
						updatedAt: twit.updatedAt,
					},
				},
			});
			const serverLiked: boolean | undefined = data?.likeTwit?.meLiked;
			const serverCount: number | undefined = data?.likeTwit?.likeCount;
			if (typeof serverLiked === 'boolean') setIsLiked(serverLiked);
			if (typeof serverCount === 'number') setLikeCount(serverCount);
			sweetTopSmallSuccessAlert('Success!', 750).then();
		} catch {
			setIsLiked(prevLiked);
			setLikeCount(prevCount);
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
					<MessageBubbleOutlineIcon />
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

			{canDelete && (
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
