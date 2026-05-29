import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { T } from '../../types/common';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { DELETE_TWIT } from '../../../apollo/user/mutation';
import { GET_MEMBER_TWITS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Twit } from '../../types/twit/twit';
import { Direction } from '../../enums/common.enum';
import { TwitsInquiry } from '../../types/twit/twit.input';
import { userVar } from '../../../apollo/store';
import TwitCard from '../community/TwitCard';
import TwitCardSkeleton from '../common/TwitCardSkeleton';

const MemberArticles: NextPage = ({ initialInput }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<TwitsInquiry>(initialInput);

	const [deleteTwit] = useMutation(DELETE_TWIT);
	const { loading: twitsLoading, error: getMemberTwitsError, data, refetch: memberTwitsRefetch } = useQuery(GET_MEMBER_TWITS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});
	const memberTwits: Twit[] = data?.getMemberTwits?.list ?? [];
	const total: number = data?.getMemberTwits?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (!memberId) return;
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: { ...(prev.search ?? {}), memberId: String(memberId) },
		}));
	}, [memberId]);

	const paginationHandler = async (e: T, value: number) => {
		const nextInquiry = { ...searchFilter, page: value };
		setSearchFilter(nextInquiry);
		await memberTwitsRefetch({ input: nextInquiry });
	};

	const deleteTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}

			const confirmation = await sweetConfirmAlert('Delete this post?');
			if (!confirmation) return;

			await deleteTwit({ variables: { input: id } });
			await memberTwitsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Deleted', 800);
		} catch (err: any) {
			console.log('ERROR, deleteTwitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	}

	return (
		<div id="member-articles-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Community Twits</Typography>
				</Stack>
			</Stack>

			<Stack className="articles-list-box">
				{twitsLoading && (
					<Stack sx={{ gap: 1.2 }}>
						{Array.from({ length: 3 }).map((_, index) => (
							<TwitCardSkeleton key={`member-articles-skeleton-${index}`} />
						))}
					</Stack>
				)}

				{!twitsLoading && getMemberTwitsError && (
					<Stack className={'no-data'}>
						<p>Unable to load member twits.</p>
					</Stack>
				)}

				{!twitsLoading && !getMemberTwitsError && memberTwits.length === 0 && (
					<Stack className={'no-data'}>
						<p>No twits found.</p>
					</Stack>
				)}

				{!twitsLoading && !getMemberTwitsError &&
					memberTwits.map((twit: Twit) => (
						<TwitCard
							key={twit._id}
							twit={twit}
							canDelete={twit.memberId === user?._id}
							onDelete={deleteTwitHandler}
						/>
					))}
			</Stack>

			{!twitsLoading && !getMemberTwitsError && total > searchFilter.limit && (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
							count={Math.ceil(total / searchFilter.limit) || 1}
							page={searchFilter.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
					</Stack>
					<Stack className="total-result">
						<Typography>{total} twit{total > 1 ? 's' : ''} available</Typography>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default MemberArticles;
