import React from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

type MenuItem = {
	key: string;
	label: string;
	href: string;
	icon: React.ReactNode;
	match: (path: string) => boolean;
};

const MENU_ITEMS: MenuItem[] = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		href: '/_admin/dashboard',
		icon: <DashboardOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/dashboard') || p === '/_admin',
	},
	{
		key: 'books',
		label: 'Books',
		href: '/_admin/books',
		icon: <MenuBookOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/books') || p.startsWith('/_admin/properties'),
	},
	{
		key: 'inventory',
		label: 'Inventory',
		href: '/_admin/inventory',
		icon: <Inventory2OutlinedIcon />,
		match: (p) => p.startsWith('/_admin/inventory'),
	},
	{
		key: 'requests',
		label: 'Requests',
		href: '/_admin/requests',
		icon: <AssignmentOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/requests'),
	},
	{
		key: 'robots',
		label: 'Robots',
		href: '/_admin/robots',
		icon: <SmartToyOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/robots'),
	},
	{
		key: 'users',
		label: 'Members',
		href: '/_admin/users',
		icon: <PeopleAltOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/users'),
	},
	{
		key: 'community',
		label: 'Community',
		href: '/_admin/community',
		icon: <ForumOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/community'),
	},
	{
		key: 'cs',
		label: 'CS',
		href: '/_admin/cs/notice',
		icon: <SupportAgentOutlinedIcon />,
		match: (p) => p.startsWith('/_admin/cs'),
	},
];

const AdminMenuList = (props: any) => {
	const pathname: string = props?.router?.pathname ?? '';

	return (
		<nav className="admin-menu">
			{MENU_ITEMS.map((item) => {
				const isActive = item.match(pathname);
				return (
					<Link href={item.href} key={item.key} legacyBehavior>
						<a className={`admin-menu-item${isActive ? ' is-active' : ''}`}>
							{item.icon}
							<span>{item.label}</span>
						</a>
					</Link>
				);
			})}
		</nav>
	);
};

export default withRouter(AdminMenuList);
