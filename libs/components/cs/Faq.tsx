import React, { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from '@mui/material';

const faqItems = [
	{
		question: 'How do I reserve a book?',
		answer: 'Use the virtual robot assistant or open the Books page and select Reserve.',
	},
	{
		question: 'Can I borrow books using the robot assistant?',
		answer: 'Yes, borrowing workflows are integrated into the system.',
	},
	{
		question: 'How long can I keep borrowed books?',
		answer: 'Books may be borrowed according to library policy.',
	},
	{
		question: 'Can I cancel reservations?',
		answer: 'Yes. Open your request history and cancel eligible reservations before processing starts.',
	},
	{
		question: 'How do notifications work?',
		answer: 'You will receive updates for reservation, pickup, and delivery status directly in the platform.',
	},
	{
		question: 'Can I purchase books?',
		answer: 'Purchasable titles are marked in book detail pages and can be processed through the same request flow.',
	},
	{
		question: 'Can I view my borrowing history?',
		answer: 'Yes. Your account pages include current and previous request records.',
	},
	{
		question: 'How do I track deliveries?',
		answer: 'When tracking is available, open the request details page to view live robot delivery status.',
	},
	{
		question: 'Can I use the service on mobile?',
		answer: 'Yes. Core library actions are available on mobile with responsive layouts.',
	},
	{
		question: 'How do I contact support?',
		answer: 'Use the Customer Support page and submit an inquiry through the support options.',
	},
];

const Faq = () => {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

	return (
		<Stack className={'faq-content'}>
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Frequently Asked Questions</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					Find answers to common questions about our services
				</p>
			</div>
			<Stack className={'faq-wrap'}>
				{faqItems.map((item, index) => (
					<div
						key={item.question}
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
