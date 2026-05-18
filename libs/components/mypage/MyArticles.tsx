import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Twit } from '../../types/twit/twit';
import { DELETE_TWIT } from '../../../apollo/user/mutation';
import { GET_MEMBER_TWITS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const PAGE_LIMIT = 5;

const formatDate = (iso: string | Date) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const MyArticles: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [twits, setTwits] = useState<Twit[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	const twitInquiry = { page, limit: PAGE_LIMIT, sort: 'createdAt', direction: 'DESC' };

	/** APOLLO REQUESTS **/
	const { refetch } = useQuery(GET_MEMBER_TWITS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...twitInquiry,
				search: { memberId: user._id },
			},
		},
		skip: !user._id,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTwits(data?.getMemberTwits?.list ?? []);
			setTotal(data?.getMemberTwits?.metaCounter[0]?.total ?? 0);
		},
	});

	const [deleteTwit] = useMutation(DELETE_TWIT);

	/** HANDLERS **/
	const deleteTwitHandler = async (twitId: string) => {
		try {
			if (!(await sweetConfirmAlert('Delete this twit? This cannot be undone.'))) return;
			await deleteTwit({ variables: { input: twitId } });
			await sweetTopSmallSuccessAlert('Twit deleted', 700);
			await refetch({ input: { ...twitInquiry, search: { memberId: user._id } } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const paginationHandler = (_: T, value: number) => setPage(value);

	if (device === 'mobile') return <>MY TWITS MOBILE</>;

	return (
		<div id="my-articles-page">
			<Stack className="panel-header">
				<Typography className="panel-title">My Twits</Typography>
				<Typography className="panel-subtitle">{total} post{total !== 1 ? 's' : ''}</Typography>
			</Stack>

			{twits.length > 0 ? (
				<Stack className="twit-list">
					{twits.map((twit) => (
						<div key={twit._id} className="twit-card" onClick={() => router.push(`/community/detail?id=${twit._id}`)}>
							<div className="twit-card-header">
								<div className="twit-author-row">
									<img
										className="twit-avatar"
										src={twit.memberData?.memberImage ? `${REACT_APP_API_URL}/${twit.memberData.memberImage}` : '/img/profile/defaultUser.svg'}
										alt="avatar"
									/>
									<div className="twit-author-info">
										<span className="twit-nick">{twit.memberData?.memberNick ?? user.memberNick}</span>
										<span className="twit-date">{formatDate(twit.createdAt)}</span>
									</div>
								</div>
								<button
									className="twit-delete-btn"
									onClick={(e) => { e.stopPropagation(); deleteTwitHandler(twit._id); }}
									title="Delete twit"
								>
									<DeleteOutlineIcon sx={{ fontSize: 18 }} />
								</button>
							</div>

							<Typography className="twit-text">{twit.text}</Typography>

							{twit.images && twit.images.length > 0 && (
								<div className={`twit-images twit-images--${Math.min(twit.images.length, 3)}`}>
									{twit.images.slice(0, 3).map((img, i) => (
										<div key={i} className="twit-image-item">
											<img
												src={img.startsWith('http') ? img : `${REACT_APP_API_URL}/${img}`}
												alt={`image-${i}`}
											/>
										</div>
									))}
								</div>
							)}

							<div className="twit-stats">
								<span className="twit-stat">
									<FavoriteBorderIcon sx={{ fontSize: 14 }} />
									{twit.likeCount ?? 0}
								</span>
								<span className="twit-stat">
									<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
									{twit.viewCount ?? 0}
								</span>
								<span className="twit-stat">
									<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
									0
								</span>
							</div>
						</div>
					))}
				</Stack>
			) : (
				<Stack className="empty-state">
					<EditNoteIcon className="empty-icon" />
					<Typography className="empty-heading">You haven't posted anything yet</Typography>
					<Typography className="empty-body">Share your thoughts with the library community.</Typography>
				</Stack>
			)}

			{total > PAGE_LIMIT && (
				<Stack className="pagination-config">
					<Pagination
						count={Math.ceil(total / PAGE_LIMIT)}
						page={page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
				</Stack>
			)}
		</div>
	);
};

export default MyArticles;
