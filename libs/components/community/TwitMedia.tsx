import React from 'react';
import { REACT_APP_API_URL } from '../../config';

interface TwitMediaProps {
	image: string;
}

const TwitMedia = ({ image }: TwitMediaProps) => {
	const getTwitImage = (imageUrl: string) => {
		const apiBaseUrl = REACT_APP_API_URL?.replace(/\/+$/, '');
		if (imageUrl.startsWith('http')) return imageUrl;
		if (imageUrl.startsWith('uploads/')) return apiBaseUrl ? `${apiBaseUrl}/${imageUrl}` : `/${imageUrl}`;
		if (imageUrl.startsWith('/uploads/')) return apiBaseUrl ? `${apiBaseUrl}${imageUrl}` : imageUrl;
		if (imageUrl.startsWith('/')) return imageUrl;
		return apiBaseUrl ? `${apiBaseUrl}/${imageUrl}` : `/${imageUrl}`;
	};

	return <img src={getTwitImage(image)} alt="" className="twit-media" />;
};

export default TwitMedia;
