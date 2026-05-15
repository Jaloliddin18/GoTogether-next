import React from 'react';
import { Stack, Typography } from '@mui/material';

interface CommunityShellProps {
	children: React.ReactNode;
	totalCount: number;
}

const CommunityShell = ({ children, totalCount }: CommunityShellProps) => {
	return (
		<Stack className="community-shell">
			<Stack className="community-feed-column">
				<Stack className="community-feed-header">
					<Typography className="community-kicker">Smart Library Community</Typography>
					<Typography className="community-title">Campus Feed</Typography>
					<Typography className="community-subtitle">Share library finds, delivery updates, and study notes.</Typography>
				</Stack>
				{children}
			</Stack>
			<Stack className="community-right-rail">
				<Stack className="community-rail-box">
					<Typography className="rail-title">Community Snapshot</Typography>
					<Typography className="rail-count">{totalCount}</Typography>
					<Typography className="rail-label">active posts in your feed</Typography>
				</Stack>
				<Stack className="community-rail-box">
					<Typography className="rail-title">Good To Share</Typography>
					<Typography className="rail-text">Book recommendations, pickup desk notes, study room tips, and campus reading moments.</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityShell;
