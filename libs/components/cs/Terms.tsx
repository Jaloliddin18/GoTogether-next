import React from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import { Box, Stack, Typography } from '@mui/material';

const terms = [
	{
		title: 'Account Responsibility',
		description: 'You are responsible for maintaining confidentiality of account information.',
	},
	{
		title: 'Reservation Policy',
		description: 'Reserved books must be picked up within allowed time.',
	},
	{
		title: 'Borrowing Rules',
		description: 'Borrowed books should be returned before due dates.',
	},
	{
		title: 'Book Availability',
		description: 'Inventory status changes dynamically.',
	},
	{
		title: 'Delivery Terms',
		description: 'Delivery times depend on inventory and processing.',
	},
	{
		title: 'Platform Usage',
		description: 'Users should avoid misuse of library resources.',
	},
];

const Terms = () => {
	return (
		<Stack className={'terms-content'}>
			<Typography className={'section-title'}>Terms & Conditions</Typography>
			<Typography className={'section-subtitle'}>Please read our terms and conditions carefully.</Typography>
			<Stack className={'terms-cards'}>
				{terms.map((term) => (
					<Box className={'terms-card'} component={'div'} key={term.title}>
						<Stack className={'terms-top'}>
							<ArticleIcon className={'terms-icon'} />
							<Typography className={'terms-title'}>{term.title}</Typography>
						</Stack>
						<Typography className={'terms-description'}>{term.description}</Typography>
					</Box>
				))}
			</Stack>
		</Stack>
	);
};

export default Terms;
