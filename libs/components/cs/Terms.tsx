import React from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Stack } from '@mui/material';

const terms = [
	{
		title: 'Account Responsibility',
		description: 'You are responsible for maintaining the confidentiality of your account information.',
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
			<div style={{ marginBottom: 24 }}>
				<h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>Terms & Conditions</h2>
				<p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 0 }}>
					Please read our terms and conditions carefully.
				</p>
			</div>
			<Stack className={'terms-cards'}>
				{terms.map((term) => (
					<div
						key={term.title}
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
