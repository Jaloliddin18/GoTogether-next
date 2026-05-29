import React from 'react';
import { ApolloError } from '@apollo/client';
import { Stack, Typography } from '@mui/material';
import TwitCard from './TwitCard';
import { Twit } from '../../types/twit/twit';
import TwitCardSkeleton from '../common/TwitCardSkeleton';

interface CommunityFeedProps {
	twits: Twit[];
	loading: boolean;
	error?: ApolloError;
	currentUserId?: string;
	isAdmin?: boolean;
	onDelete: (id: string) => Promise<void>;
}

const CommunityFeed = ({
	twits,
	loading,
	error,
	currentUserId,
	isAdmin,
	onDelete,
}: CommunityFeedProps) => {
	if (loading) {
		return (
			<Stack className="community-feed">
				{Array.from({ length: 4 }).map((_, index) => (
					<TwitCardSkeleton key={`community-feed-skeleton-${index}`} />
				))}
			</Stack>
		);
	}

	if (error) {
		return (
			<Stack className="community-feed empty-state">
				<Typography className="empty-title">Unable to load feed</Typography>
				<Typography className="empty-copy">Please refresh the page or try again later.</Typography>
			</Stack>
		);
	}

	if (!twits.length) {
		return (
			<Stack className="community-feed empty-state">
				<Typography className="empty-title">No posts yet</Typography>
				<Typography className="empty-copy">No community twits available yet.</Typography>
			</Stack>
		);
	}

	return (
		<Stack className="community-feed">
			{twits.map((twit: Twit) => (
				<TwitCard
					key={twit._id}
					twit={twit}
					canDelete={Boolean(currentUserId && (currentUserId === twit.memberId || isAdmin))}
					onDelete={onDelete}
				/>
			))}
		</Stack>
	);
};

export default CommunityFeed;
