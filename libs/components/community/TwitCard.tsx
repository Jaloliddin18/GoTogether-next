import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import TwitAuthorRow from './TwitAuthorRow';
import TwitBody from './TwitBody';
import TwitActionRow from './TwitActionRow';
import { Twit } from '../../types/twit/twit';

interface TwitCardProps {
	twit: Twit;
	currentUserId?: string;
	onLike: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

const TwitCard = ({ twit, currentUserId, onLike, onDelete }: TwitCardProps) => {
	const router = useRouter();
	const liked = !!currentUserId && !!twit?.likes?.includes(currentUserId);
	const isOwner = !!currentUserId && currentUserId === twit?.memberId;

	const goDetailPage = () => {
		router.push({
			pathname: '/community/detail',
			query: { id: twit?._id },
		});
	};

	return (
		<Stack className="twit-card" onClick={goDetailPage}>
			<TwitAuthorRow twit={twit} currentUserId={currentUserId} />
			<TwitBody text={twit?.text} image={twit?.image} />
			<TwitActionRow
				twitId={twit?._id}
				likeCount={twit?.likeCount ?? 0}
				liked={liked}
				isOwner={isOwner}
				onComment={goDetailPage}
				onLike={onLike}
				onDelete={onDelete}
			/>
		</Stack>
	);
};

export default TwitCard;
