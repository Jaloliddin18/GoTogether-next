import React from 'react';
import { useRouter } from 'next/router';
import { IconButton } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MessageBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const CommunityLeftNav = () => {
	const router = useRouter();

	const navItems = [
		{ icon: <HomeOutlinedIcon />, label: 'Home', path: '/' },
		{ icon: <SearchOutlinedIcon />, label: 'Search', path: '/community' },
		{ icon: <NotificationsNoneOutlinedIcon />, label: 'Notifications', path: null },
		{ icon: <MessageBubbleOutlineOutlinedIcon />, label: 'Messages', path: null },
		{ icon: <BookmarkBorderOutlinedIcon />, label: 'Bookmarks', path: null },
		{ icon: <PersonOutlineOutlinedIcon />, label: 'Profile', path: '/member' },
	];

	return (
		<div className="community-left-nav">
			{navItems.map((item) => (
				<IconButton
					key={item.label}
					className={`community-nav-btn${router.pathname === item.path ? ' active' : ''}`}
					aria-label={item.label}
					onClick={() => {
						if (item.path) router.push(item.path);
					}}
				>
					{item.icon}
				</IconButton>
			))}
		</div>
	);
};

export default CommunityLeftNav;
