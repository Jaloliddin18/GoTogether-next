import React from 'react';

interface TwitMediaProps {
	image: string;
}

const TwitMedia = ({ image }: TwitMediaProps) => {
	const getTwitImage = (imageUrl: string) => {
		if (imageUrl.startsWith('http')) return imageUrl;
		if (imageUrl.startsWith('/')) return imageUrl;
		return `/${imageUrl}`;
	};

	return <img src={getTwitImage(image)} alt="" className="twit-media" />;
};

export default TwitMedia;
