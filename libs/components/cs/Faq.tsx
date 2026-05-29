import React, { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

const Faq = () => {
	const { t } = useTranslation('cs');
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const faqItems = [
		{ key: 'faq_1', question: t('faq_q1'), answer: t('faq_a1') },
		{ key: 'faq_2', question: t('faq_q2'), answer: t('faq_a2') },
		{ key: 'faq_3', question: t('faq_q3'), answer: t('faq_a3') },
		{ key: 'faq_4', question: t('faq_q4'), answer: t('faq_a4') },
		{ key: 'faq_5', question: t('faq_q5'), answer: t('faq_a5') },
		{ key: 'faq_6', question: t('faq_q6'), answer: t('faq_a6') },
		{ key: 'faq_7', question: t('faq_q7'), answer: t('faq_a7') },
		{ key: 'faq_8', question: t('faq_q8'), answer: t('faq_a8') },
		{ key: 'faq_9', question: t('faq_q9'), answer: t('faq_a9') },
		{ key: 'faq_10', question: t('faq_q10'), answer: t('faq_a10') },
	];
	const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

	return (
		<Stack className={'faq-content'}>
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{t('faq_title')}</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					{t('faq_subtitle')}
				</p>
			</div>
			<Stack className={'faq-wrap'}>
				{faqItems.map((item, index) => (
					<div
						key={item.key}
						style={{
							border: '1px solid #E2E8F0',
							borderRadius: 12,
							background: 'white',
							overflow: 'hidden',
						}}
					>
						<button
							onClick={() => toggleFaq(index)}
							style={{
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								padding: '16px 20px',
								background: 'transparent',
								border: 'none',
								cursor: 'pointer',
								textAlign: 'left',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
								<HelpOutlineIcon style={{ color: '#1B3A6B', fontSize: 20, flexShrink: 0 }} />
								<span style={{ fontWeight: 600, color: '#1A1A2E', fontSize: 15 }}>{item.question}</span>
							</div>
							<ExpandMoreIcon
								style={{
									color: '#64748B',
									flexShrink: 0,
									transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
									transition: 'transform 200ms ease',
								}}
							/>
						</button>
						{openFaq === index && (
							<div
								style={{
									padding: '0 20px 16px 50px',
									fontSize: 14,
									color: '#64748B',
									borderTop: '1px solid #E2E8F0',
									paddingTop: 12,
								}}
							>
								{item.answer}
							</div>
						)}
					</div>
				))}
			</Stack>
		</Stack>
	);
};

export default Faq;
