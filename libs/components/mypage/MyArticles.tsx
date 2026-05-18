import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Twit } from '../../types/twit/twit';
import { DELETE_TWIT } from '../../../apollo/user/mutation';
import { GET_MEMBER_TWITS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import TwitCard from '../community/TwitCard';
import { Direction } from '../../enums/common.enum';
import { TwitsInquiry } from '../../types/twit/twit.input';

const PAGE_LIMIT = 10;

const MyArticles: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);

	const twitInquiry: TwitsInquiry = {
		page,
		limit: PAGE_LIMIT,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { memberId: user?._id },
	};

	/** APOLLO REQUESTS **/
	const { loading, error, data, refetch } = useQuery(GET_MEMBER_TWITS, {
		fetchPolicy: 'network-only',
		variables: { input: twitInquiry },
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
	});
	const twits: Twit[] = data?.getMemberTwits?.list ?? [];
	const total: number = data?.getMemberTwits?.metaCounter?.[0]?.total ?? 0;

	const [deleteTwit] = useMutation(DELETE_TWIT);

	/** HANDLERS **/
	const deleteTwitHandler = async (twitId: string) => {
		try {
			if (!twitId) return;
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}
			if (!(await sweetConfirmAlert('Delete this twit? This cannot be undone.'))) return;

			await deleteTwit({ variables: { input: twitId } });

			const nextPage = twits.length === 1 && page > 1 ? page - 1 : page;
			if (nextPage !== page) setPage(nextPage);

			await refetch({
				input: {
					...twitInquiry,
					page: nextPage,
					search: { memberId: user?._id },
				},
			});
			await sweetTopSmallSuccessAlert('Twit deleted', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const paginationHandler = async (_: T, value: number) => {
		setPage(value);
		await refetch({
			input: {
				...twitInquiry,
				page: value,
				search: { memberId: user?._id },
			},
		});
	};

	if (device === 'mobile') return <>MY TWITS MOBILE</>;

	return (
		<div id="my-articles-page">
			<Stack className="panel-header">
				<Typography className="panel-title">My Twits</Typography>
				<Typography className="panel-subtitle">{total} post{total !== 1 ? 's' : ''}</Typography>
			</Stack>

			{loading && (
				<Stack className="twit-state">
					<Typography className="twit-state-title">Loading twits...</Typography>
				</Stack>
			)}

			{!loading && error && (
				<Stack className="twit-state">
					<Typography className="twit-state-title">Unable to load twits.</Typography>
				</Stack>
			)}

			{!loading && !error && twits.length > 0 ? (
				<Stack className="twit-list">
					{twits.map((twit) => <TwitCard key={twit._id} twit={twit} currentUserId={user?._id} onDelete={deleteTwitHandler} />)}
				</Stack>
			) : null}

			{!loading && !error && twits.length === 0 && (
				<Stack className="empty-state">
					<EditNoteIcon className="empty-icon" />
					<Typography className="empty-heading">No twits yet.</Typography>
					<Typography className="empty-body">Share your thoughts with the library community.</Typography>
				</Stack>
			)}

			{!loading && !error && total > PAGE_LIMIT && (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
							count={Math.ceil(total / PAGE_LIMIT)}
							page={page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
					</Stack>
					<Stack className="total-result">
						<Typography>Total {total} twit{total > 1 ? 's' : ''} available</Typography>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

export default MyArticles;
