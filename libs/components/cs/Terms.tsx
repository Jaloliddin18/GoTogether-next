import React from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

const Terms = () => {
	const { t } = useTranslation('cs');
	const terms = [
		{
			key: 'terms_account',
			title: t('terms_account_title'),
			description: t('terms_account_desc'),
		},
		{
			key: 'terms_reservation',
			title: t('terms_reservation_title'),
			description: t('terms_reservation_desc'),
		},
		{
			key: 'terms_borrowing',
			title: t('terms_borrowing_title'),
			description: t('terms_borrowing_desc'),
		},
		{
			key: 'terms_availability',
			title: t('terms_availability_title'),
			description: t('terms_availability_desc'),
		},
		{
			key: 'terms_delivery',
			title: t('terms_delivery_title'),
			description: t('terms_delivery_desc'),
		},
		{
			key: 'terms_platform',
			title: t('terms_platform_title'),
			description: t('terms_platform_desc'),
		},
	];

	return (
		<Stack className={'terms-content'}>
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{t('terms_title')}</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					{t('terms_subtitle')}
				</p>
			</div>
			<Stack className={'terms-cards'}>
				{terms.map((term) => (
					<div
						key={term.key}
						style={{
							border: '1px solid #E2E8F0',
							borderRadius: 12,
							background: 'white',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								padding: '16px 20px',
								borderBottom: '1px solid #E2E8F0',
							}}
						>
							<ArticleOutlinedIcon style={{ color: '#1B3A6B', fontSize: 20, flexShrink: 0 }} />
							<span style={{ fontWeight: 600, color: '#1A1A2E', fontSize: 15 }}>{term.title}</span>
						</div>
						<div style={{ padding: '12px 20px 16px 50px', fontSize: 14, color: '#64748B' }}>
							{term.description}
						</div>
					</div>
				))}
			</Stack>
		</Stack>
	);
};

export default Terms;
