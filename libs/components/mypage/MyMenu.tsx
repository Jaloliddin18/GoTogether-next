import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import HistoryIcon from '@mui/icons-material/History';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

const NAV_ITEMS = [
	{ category: 'myProfile', label: 'My Profile', Icon: PersonOutlineIcon },
	{ category: 'myArticles', label: 'My Twits', Icon: EditNoteIcon },
	{ category: 'myFavorites', label: 'Saved Books', Icon: BookmarkBorderIcon },
	{ category: 'recentlyVisited', label: 'Recently Viewed', Icon: HistoryIcon },
	{ category: 'myRequests', label: 'My Requests', Icon: LibraryBooksIcon },
	{ category: 'robotTracking', label: 'Live Tracking', Icon: MyLocationIcon },
	{ category: 'followers', label: 'Followers', Icon: PeopleIcon },
	{ category: 'followings', label: 'Followings', Icon: PersonAddIcon },
];

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const active: string = (router.query.category as string) ?? 'myProfile';
	const user = useReactiveVar(userVar);

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to log out?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') return <div>MY MENU</div>;

	return (
		<Stack className="my-menu-root">
			<Stack className="my-menu-profile">
				<div className="my-menu-avatar-wrap">
					<img
						className="my-menu-avatar"
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
						alt="profile"
					/>
				</div>
				<Typography className="my-menu-nick">{user?.memberNick}</Typography>
				<span className="my-menu-type-badge">{user?.memberType}</span>
			</Stack>

			<div className="my-menu-divider" />

			<nav className="my-menu-nav">
				{NAV_ITEMS.map(({ category, label, Icon }) => (
					<Link
						key={category}
						href={{ pathname: '/mypage', query: { category } }}
						scroll={false}
					>
						<div className={`my-menu-item${active === category ? ' my-menu-item--active' : ''}`}>
							<Icon className="my-menu-icon" sx={{ fontSize: 20 }} />
							<span className="my-menu-label">{label}</span>
						</div>
					</Link>
				))}

				<div className="my-menu-item my-menu-item--logout" onClick={logoutHandler}>
					<LogoutIcon className="my-menu-icon" sx={{ fontSize: 20 }} />
					<span className="my-menu-label">Logout</span>
				</div>
			</nav>
		</Stack>
	);
};

export default MyMenu;
