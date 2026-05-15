import React from 'react';
import { Stack, Typography } from '@mui/material';
import TwitMedia from './TwitMedia';

interface TwitBodyProps {
	text: string;
	images?: string[];
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

const TwitBody = ({ text, images }: TwitBodyProps) => {
	return (
		<Stack className="twit-body">
			<Typography className="twit-text" component="p">
				{parseHashtags(text)}
			</Typography>
			{images && images.length > 0 && <TwitMedia images={images} />}
		</Stack>
	);
};

export default TwitBody;
