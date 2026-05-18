import React from 'react';
import { REACT_APP_API_URL } from '../../config';

interface TwitMediaProps {
	images: string[];
}

const resolveUrl = (imageUrl: string): string => {
	const apiBaseUrl = REACT_APP_API_URL?.replace(/\/+$/, '');
	if (imageUrl.startsWith('http')) return imageUrl;
	if (imageUrl.startsWith('uploads/')) return apiBaseUrl ? `${apiBaseUrl}/${imageUrl}` : `/${imageUrl}`;
	if (imageUrl.startsWith('/uploads/')) return apiBaseUrl ? `${apiBaseUrl}${imageUrl}` : imageUrl;
	if (imageUrl.startsWith('/')) return imageUrl;
	return apiBaseUrl ? `${apiBaseUrl}/${imageUrl}` : `/${imageUrl}`;
};

const TwitMedia = ({ images }: TwitMediaProps) => {
	if (!images?.length) return null;
	const count = Math.min(images.length, 3);
	const visible = images.slice(0, count);

	return (
		<div className={`twit-media-grid count-${count}`}>
			{visible.map((src, i) => (
				<div key={i} className="media-item">
					<img src={resolveUrl(src)} alt="" />
				</div>
			))}
		</div>
	);
};

export default TwitMedia;
