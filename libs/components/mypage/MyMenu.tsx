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
import { API_BASE_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { MemberType } from '../../enums/member.enum';
import { useTranslation } from 'next-i18next';

const MyMenu = () => {
	const { t } = useTranslation('mypage');
	const device = useDeviceDetect();
	const router = useRouter();
	const active: string = (router.query.category as string) ?? 'myProfile';
	const user = useReactiveVar(userVar);
	const isAdmin = user?.memberType === MemberType.ADMIN;

	const NAV_ITEMS = [
		{ category: 'myProfile', label: t('my_profile'), Icon: PersonOutlineIcon },
		{ category: 'myArticles', label: t('my_twits'), Icon: EditNoteIcon },
		{ category: 'myFavorites', label: t('saved_books'), Icon: BookmarkBorderIcon },
		{ category: 'recentlyVisited', label: t('recently_viewed'), Icon: HistoryIcon },
		{ category: 'myRequests', label: t('my_requests'), Icon: LibraryBooksIcon },
		{ category: 'robotTracking', label: t('live_tracking'), Icon: MyLocationIcon },
		{ category: 'followers', label: t('followers'), Icon: PeopleIcon },
		{ category: 'followings', label: t('followings'), Icon: PersonAddIcon },
	];

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert(t('logout_confirm'))) logOut();
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
						src={user?.memberImage ? `${API_BASE_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
						alt="profile"
					/>
				</div>
				<Typography className="my-menu-nick">{user?.memberNick}</Typography>
				{isAdmin ? (
					<Link href="/_admin/dashboard" className="my-menu-type-badge my-menu-type-badge--admin">
						{user?.memberType}
					</Link>
				) : (
					<span className="my-menu-type-badge">{user?.memberType}</span>
				)}
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
					<span className="my-menu-label">{t('logout')}</span>
				</div>
			</nav>
		</Stack>
	);
};

export default MyMenu;
