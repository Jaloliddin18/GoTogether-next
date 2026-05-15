import React from 'react';
import { Stack, Typography } from '@mui/material';
import TwitMedia from './TwitMedia';

interface TwitBodyProps {
	text: string;
	image?: string;
}

const parseHashtags = (text: string): React.ReactNode[] => {
	const parts = text.split(/(#\w+)/g);
	return parts.map((part, i) =>
		part.startsWith('#') ? (
			<span key={i} className="twit-hashtag">
				{part}
			</span>
		) : (
			part
		),
	);
};

const TwitBody = ({ text, image }: TwitBodyProps) => {
	return (
		<Stack className="twit-body">
			<Typography className="twit-text" component="p">
				{parseHashtags(text)}
			</Typography>
			{image && <TwitMedia image={image} />}
		</Stack>
	);
};

export default TwitBody;
