import React from 'react';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Stack } from '@mui/material';

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
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Notice</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					Stay updated with our latest announcements and news
				</p>
			</div>
			<Stack className={'notice-cards'}>
				{notices.map((notice) => (
					<div
						key={notice.title}
						style={{
							display: 'flex',
							flexDirection: 'column',
							padding: '16px 20px',
							border: '1px solid #E2E8F0',
							borderRadius: 12,
							background: 'white',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
								<NotificationsActiveOutlinedIcon style={{ color: '#1B3A6B', fontSize: 20 }} />
								<span style={{ fontWeight: 600, color: '#1A1A2E', fontSize: 15 }}>{notice.title}</span>
							</div>
							<span style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>{notice.date}</span>
						</div>
						<p style={{ fontSize: 14, color: '#64748B', marginTop: 8, paddingLeft: 30, marginBottom: 0 }}>
							{notice.description}
						</p>
					</div>
				))}
			</Stack>
		</Stack>
	);
};

export default Notice;
