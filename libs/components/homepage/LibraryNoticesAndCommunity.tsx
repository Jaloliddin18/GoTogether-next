import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import CommunityHighlightCard from './CommunityHighlightCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_TWITS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

const LIBRARY_ANNOUNCEMENTS = [
	{
		_id: 'ann1',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/sub1.png',
		articleTitle: '같이Go Robot Now Serving All 4 Floors',
		createdAt: new Date('2026-05-01').toISOString(),
	},
	{
		_id: 'ann2',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/sub2.png',
		articleTitle: 'New Book Collection: 500+ Engineering Titles Added',
		createdAt: new Date('2026-04-28').toISOString(),
	},
	{
		_id: 'ann3',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/sub3.png',
		articleTitle: 'Library Hours Extended During Final Exam Period',
		createdAt: new Date('2026-04-20').toISOString(),
	},
	{
		_id: 'ann4',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/sub4.png',
		articleTitle: 'Robot Delivery Now Available at All Study Desks',
		createdAt: new Date('2026-04-15').toISOString(),
	},
	{
		_id: 'ann5',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/floorPlan.png',
		articleTitle: 'INHA Library Partners with Korean National Library',
		createdAt: new Date('2026-04-10').toISOString(),
	},
	{
		_id: 'ann6',
		articleCategory: 'ANNOUNCEMENT',
		articleImage: '/img/property/sub2.png',
		articleTitle: 'Book Donation Drive: Support Your Fellow Students',
		createdAt: new Date('2026-04-05').toISOString(),
	},
];

const LibraryNoticesAndCommunity = () => {
	const device = useDeviceDetect();

	const {
		data: getTwitsData,
	} = useQuery(GET_TWITS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 3, search: {} } },
		notifyOnNetworkStatusChange: true,
	});

	const announcements: BoardArticle[] = LIBRARY_ANNOUNCEMENTS.map((announcement) => ({
		...announcement,
		articleStatus: 'ACTIVE',
		articleViews: 0,
		articleLikes: 0,
		articleContent: announcement.articleTitle,
		createdAt: new Date(announcement.createdAt),
	}));
	const communityTwits: BoardArticle[] = (getTwitsData?.getTwits?.list ?? []).map((twit: any) => ({
		_id: twit?._id,
		articleCategory: 'TWIT',
		articleImage: twit?.image ?? '/img/property/sub3.png',
		articleTitle: twit?.text ?? '',
		createdAt: twit?.createdAt,
		articleStatus: 'ACTIVE',
		articleViews: 0,
		articleLikes: twit?.likeCount ?? 0,
		articleContent: twit?.text ?? '',
	}));

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Stack>
						<Typography variant={'h1'}>Library Notices &amp; Community</Typography>
					</Stack>
					<Stack className="community-main">
						<Stack className={'community-left'}>
							<Stack className={'content-top'}>
								<Link href={'#'}>
									<span>Library Announcements</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap'}>
								{(announcements ?? []).map((article, index) => {
									return <CommunityHighlightCard vertical={true} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
						<Stack className={'community-right'}>
							<Stack className={'content-top'}>
								<Link href={'/community'}>
									<span>Student Community</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap vertical'}>
								{(communityTwits ?? []).map((article, index) => {
									return <CommunityHighlightCard vertical={false} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default LibraryNoticesAndCommunity;
