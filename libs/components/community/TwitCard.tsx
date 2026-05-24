import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import TwitAuthorRow from './TwitAuthorRow';
import TwitBody from './TwitBody';
import TwitActionRow from './TwitActionRow';
import { Twit } from '../../types/twit/twit';

interface TwitCardProps {
	twit: Twit;
	canDelete: boolean;
	onDelete: (id: string) => Promise<void>;
}

const TwitCard = ({ twit, canDelete, onDelete }: TwitCardProps) => {
	const router = useRouter();

	const goDetailPage = () => {
		router.push({
			pathname: '/community/detail',
			query: { id: twit?._id },
		});
	};

	return (
		<Stack className="twit-card" onClick={goDetailPage}>
			<TwitAuthorRow twit={twit} />
			<TwitBody text={twit?.text} images={twit?.images} />
			<TwitActionRow
				twit={twit}
				viewCount={twit?.viewCount ?? 0}
				canDelete={canDelete}
				onComment={goDetailPage}
				onDelete={onDelete}
			/>
		</Stack>
	);
};

export default TwitCard;
