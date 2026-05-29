import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { IconButton } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MessageBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const CommunityLeftNav = () => {
	const router = useRouter();
	const { t } = useTranslation('community');

	const navItems = [
		{ icon: <HomeOutlinedIcon />, label: t('nav_home'), path: '/' },
		{ icon: <SearchOutlinedIcon />, label: t('nav_search'), path: '/community' },
		{ icon: <NotificationsNoneOutlinedIcon />, label: t('nav_notifications'), path: null },
		{ icon: <MessageBubbleOutlineOutlinedIcon />, label: t('nav_messages'), path: null },
		{ icon: <BookmarkBorderOutlinedIcon />, label: t('nav_bookmarks'), path: null },
		{ icon: <PersonOutlineOutlinedIcon />, label: t('nav_profile'), path: '/member' },
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
