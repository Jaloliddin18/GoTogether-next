import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography } from '@mui/material';
import Moment from 'react-moment';
import { Twit } from '../../types/twit/twit';
import { API_BASE_URL } from '../../config';

interface TwitAuthorRowProps {
	twit: Twit;
}

const TwitAuthorRow = ({ twit }: TwitAuthorRowProps) => {
	const router = useRouter();
	const member = twit?.memberData;

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${API_BASE_URL}/${imageUrl}`;
	};

	const goMemberPage = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		if (!member?._id) return;
		router.push(`/member/${member?._id}`);
	};

	return (
		<Stack className="twit-author-row">
			<img src={getMemberImage(member?.memberImage)} alt="" className="twit-avatar" onClick={goMemberPage} />
			<Stack className="twit-author-main">
				<Stack className="twit-author-line">
					<Typography className="twit-author-name" onClick={goMemberPage}>
						{member?.memberFullName || member?.memberNick || 'Community member'}
					</Typography>
					{member?.memberNick && <Typography className="twit-author-nick" onClick={goMemberPage}>@{member.memberNick}</Typography>}
					<Typography className="twit-dot">·</Typography>
					<Moment className="twit-time" fromNow>
						{twit?.createdAt}
					</Moment>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TwitAuthorRow;
