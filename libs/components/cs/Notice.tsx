import React from 'react';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

const Notice = () => {
	const { t } = useTranslation('cs');
	const notices = [
		{ key: 'notice1', title: t('notice1_title'), date: t('notice1_date'), description: t('notice1_desc') },
		{ key: 'notice2', title: t('notice2_title'), date: t('notice1_date'), description: t('notice2_desc') },
		{ key: 'notice3', title: t('notice3_title'), date: t('notice1_date'), description: t('notice3_desc') },
		{ key: 'notice4', title: t('notice4_title'), date: t('notice1_date'), description: t('notice4_desc') },
		{ key: 'notice5', title: t('notice5_title'), date: t('notice1_date'), description: t('notice5_desc') },
		{ key: 'notice6', title: t('notice6_title'), date: t('notice1_date'), description: t('notice6_desc') },
	];

	return (
		<Stack className={'notice-content'}>
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{t('notice_title')}</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					{t('notice_subtitle')}
				</p>
			</div>
			<Stack className={'notice-cards'}>
				{notices.map((notice) => (
					<div
						key={notice.key}
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
