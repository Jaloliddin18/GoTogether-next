import React from 'react';
import { ApolloError } from '@apollo/client';
import { CircularProgress, Stack, Typography } from '@mui/material';
import TwitCard from './TwitCard';
import { Twit } from '../../types/twit/twit';

interface CommunityFeedProps {
	twits: Twit[];
	loading: boolean;
	error?: ApolloError;
	currentUserId?: string;
	onDelete: (id: string) => Promise<void>;
}

const CommunityFeed = ({
	twits,
	loading,
	error,
	currentUserId,
	onDelete,
}: CommunityFeedProps) => {
	if (loading) {
		return (
			<Stack className="community-feed state-box">
				<CircularProgress />
				<Typography className="empty-copy">Loading your community feed...</Typography>
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
					currentUserId={currentUserId}
					onDelete={onDelete}
				/>
			))}
		</Stack>
	);
};

export default CommunityFeed;
