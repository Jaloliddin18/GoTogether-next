import React, { useState } from 'react';
import { Button, IconButton, OutlinedInput, Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CommunityLeftNav from './CommunityLeftNav';

interface CommunityShellProps {
	children: React.ReactNode;
	totalCount: number;
	onTabChange?: (tabIndex: number) => void;
}

const TABS = ['For you', 'Following'];

const TRENDING = [
	{ label: '#BookDrop', count: '142 posts' },
	{ label: '#StudyRoom', count: '87 posts' },
	{ label: '#RobotDelivery', count: '63 posts' },
	{ label: '#ReadingWeek', count: '41 posts' },
];

const WHO_TO_FOLLOW = [
	{ name: 'Library Bot', nick: '@librarybot', image: '/img/profile/defaultUser.svg' },
	{ name: 'Reading Club', nick: '@readingclub', image: '/img/profile/defaultUser.svg' },
	{ name: 'Study Hub', nick: '@studyhub_inha', image: '/img/profile/defaultUser.svg' },
];

const CommunityShell = ({ children, totalCount: _totalCount, onTabChange }: CommunityShellProps) => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabClick = (i: number) => {
		setActiveTab(i);
		onTabChange?.(i);
	};

	return (
		<Stack className="community-shell">
			<CommunityLeftNav />

			<Stack className="community-feed-column">
				<Stack className="community-feed-header">
					<Typography className="community-title">Community</Typography>
					<Stack className="community-tabs">
						{TABS.map((tab, i) => (
							<Stack
								key={tab}
								className={`community-tab${activeTab === i ? ' active' : ''}`}
								onClick={() => handleTabClick(i)}
							>
								<Typography>{tab}</Typography>
							</Stack>
						))}
					</Stack>
				</Stack>

				{children}
			</Stack>

			<Stack className="community-right-rail">
				<Stack className="rail-section">
					<OutlinedInput
						className="rail-search-bar"
						placeholder="Search community"
						startAdornment={<SearchIcon sx={{ color: '#8a8077', fontSize: 18, mr: 0.5 }} />}
						size="small"
					/>
				</Stack>

				<Stack className="rail-section">
					<Typography className="rail-section-title">Trending at library</Typography>
					{TRENDING.map((item) => (
						<Stack key={item.label} className="rail-trend-item">
							<Typography className="trend-label">{item.label}</Typography>
							<Typography className="trend-count">{item.count}</Typography>
						</Stack>
					))}
				</Stack>

				<Stack className="rail-section">
					<Typography className="rail-section-title">Who to follow</Typography>
					{WHO_TO_FOLLOW.map((member) => (
						<Stack key={member.nick} className="rail-follow-item">
							<img src={member.image} alt="" className="rail-follow-avatar" />
							<Stack className="rail-follow-info">
								<Typography className="rail-follow-name">{member.name}</Typography>
								<Typography className="rail-follow-nick">{member.nick}</Typography>
							</Stack>
							<Button className="rail-follow-btn" variant="outlined" size="small">
								Follow
							</Button>
						</Stack>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityShell;
