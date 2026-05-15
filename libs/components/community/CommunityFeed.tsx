import React from 'react';
import { ApolloError } from '@apollo/client';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import TwitCard from './TwitCard';
import { Twit } from '../../types/twit/twit';

interface CommunityFeedProps {
	twits: Twit[];
	loading: boolean;
	error?: ApolloError;
	isAuthenticated: boolean;
	currentUserId?: string;
	onLogin: () => void;
	onLike: (id: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

const CommunityFeed = ({
	twits,
	loading,
	error,
	isAuthenticated,
	currentUserId,
	onLogin,
	onLike,
	onDelete,
}: CommunityFeedProps) => {
	if (!isAuthenticated) {
		return (
			<Stack className="community-feed empty-state">
				<Typography className="empty-title">Login required</Typography>
				<Typography className="empty-copy">Your feed is built from your posts and members you follow.</Typography>
				<Button className="empty-action" onClick={onLogin}>
					Login
				</Button>
			</Stack>
		);
	}

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
				<Typography className="empty-copy">Start the first Smart Library community update.</Typography>
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
					onLike={onLike}
					onDelete={onDelete}
				/>
			))}
		</Stack>
	);
};

export default CommunityFeed;
