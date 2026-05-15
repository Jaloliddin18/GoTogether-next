import React from 'react';
import { Stack, Typography } from '@mui/material';
import TwitMedia from './TwitMedia';

interface TwitBodyProps {
	text: string;
	image?: string;
}

const TwitBody = ({ text, image }: TwitBodyProps) => {
	return (
		<Stack className="twit-body">
			<Typography className="twit-text">{text}</Typography>
			{image && <TwitMedia image={image} />}
		</Stack>
	);
};

export default TwitBody;
