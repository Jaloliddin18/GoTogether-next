import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography } from '@mui/material';
import Moment from 'react-moment';
import { Twit } from '../../types/twit/twit';
import { REACT_APP_API_URL } from '../../config';

interface TwitAuthorRowProps {
	twit: Twit;
	currentUserId?: string;
}

const TwitAuthorRow = ({ twit, currentUserId }: TwitAuthorRowProps) => {
	const router = useRouter();
	const member = twit?.memberData;

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${REACT_APP_API_URL}/${imageUrl}`;
	};

	const goMemberPage = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		if (!member?._id) return;
		if (member?._id === currentUserId) router.push('/mypage');
		else router.push(`/member?memberId=${member?._id}`);
	};

	return (
		<Stack className="twit-author-row">
			<img src={getMemberImage(member?.memberImage)} alt="" className="twit-avatar" onClick={goMemberPage} />
			<Stack className="twit-author-main">
				<Stack className="twit-author-line">
					<Typography className="twit-author-name" onClick={goMemberPage}>
						{member?.memberFullName || member?.memberNick || 'Community member'}
					</Typography>
					{member?.memberNick && <Typography className="twit-author-nick">@{member.memberNick}</Typography>}
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
