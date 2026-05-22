import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { AccordionDetails, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	() => ({
		border: 'none',
		borderRadius: '12px',
		overflow: 'hidden',
		boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
		background: '#ffffff',
		'&:not(:last-child)': {
			marginBottom: '14px',
		},
		'&::before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.35rem', color: '#64748B' }} />} {...props} />
))(() => ({
	padding: '8px 12px',
	border: '1px solid #E2E8F0',
	borderRadius: '12px',
	'& .MuiAccordionSummary-content': {
		margin: '8px 0',
	},
}));

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
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleChange = (panel: string) => (_event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<Stack className={'faq-content'}>
			<Typography className={'section-title'}>Frequently Asked Questions</Typography>
			<Typography className={'section-subtitle'}>Find answers to common questions about our services</Typography>
			<Stack className={'faq-wrap'}>
				{faqItems.map((item, idx) => (
					<Accordion expanded={expanded === `panel-${idx}`} onChange={handleChange(`panel-${idx}`)} key={item.question}>
						<AccordionSummary id={`faq-${idx}`} aria-controls={`faq-content-${idx}`}>
							<Stack className={'faq-question-row'}>
								<HelpOutlineIcon className={'faq-help-icon'} />
								<Typography className={'faq-question'}>{item.question}</Typography>
							</Stack>
						</AccordionSummary>
						<AccordionDetails id={`faq-content-${idx}`} aria-labelledby={`faq-${idx}`}>
							<Typography className={'faq-answer'}>{item.answer}</Typography>
						</AccordionDetails>
					</Accordion>
				))}
			</Stack>
		</Stack>
	);
};

export default Faq;
