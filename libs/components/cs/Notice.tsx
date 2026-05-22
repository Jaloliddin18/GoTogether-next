import React from 'react';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Box, Stack, Typography } from '@mui/material';

const notices = [
	{
		title: 'Important Notice',
		date: 'May 23, 2026',
		description: 'Our library robot assistant now supports faster book pickup scheduling.',
	},
	{
		title: 'New Borrowing Feature',
		date: 'May 23, 2026',
		description: 'Users can now reserve books directly through virtual robot assistance.',
	},
	{
		title: 'Maintenance Update',
		date: 'May 23, 2026',
		description: 'Book inventory synchronization improvements have been deployed.',
	},
	{
		title: 'Library Hours Update',
		date: 'May 23, 2026',
		description: 'Weekend operating hours have been extended.',
	},
	{
		title: 'Mobile Access Improvements',
		date: 'May 23, 2026',
		description: 'Better mobile responsiveness is now available.',
	},
	{
		title: 'Book Request Expansion',
		date: 'May 23, 2026',
		description: 'Students can now request additional academic resources.',
	},
];

const Notice = () => {
	return (
		<Stack className={'notice-content'}>
			<Typography className={'section-title'}>Notice</Typography>
			<Typography className={'section-subtitle'}>Stay updated with our latest announcements and news</Typography>
			<Stack className={'notice-cards'}>
				{notices.map((notice) => (
					<Box className={'notice-modern-card'} component={'div'} key={notice.title}>
						<Box className={'card-top'} component={'div'}>
							<Box className={'left'} component={'div'}>
								<NotificationsActiveOutlinedIcon className={'notice-icon'} />
							</Box>
							<Box className={'center'} component={'div'}>
								<Typography className={'card-title'}>{notice.title}</Typography>
							</Box>
							<Typography className={'card-date'}>{notice.date}</Typography>
						</Box>
						<Typography className={'card-description'}>{notice.description}</Typography>
					</Box>
				))}
			</Stack>
		</Stack>
	);
};

export default Notice;
