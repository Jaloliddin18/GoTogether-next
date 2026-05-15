import React, { ChangeEvent, useEffect, useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
	likeMemberHandler: any;
}

const resolveAvatar = (img?: string): string => {
	if (!img) return '';
	if (img.startsWith('/img') || img.startsWith('http')) return img;
	return `${REACT_APP_API_URL}/${img}`;
};

const getInitials = (nick: string): string => (nick ?? '').slice(0, 2).toUpperCase() || '?';

const toId = (raw: any): string => {
	if (!raw) return '';
	if (typeof raw === 'string') return raw;
	return raw?._id?.toString?.() ?? raw?.toString?.() ?? '';
};

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, likeMemberHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const user = useReactiveVar(userVar);
	const { memberId } = router.query;

	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId || user?._id },
		skip: !memberId && !user?._id,
	});

	const { data: followingsData, refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
	});

	const memberFollowings: Following[] = followingsData?.getMemberFollowings?.list ?? [];
	const total: number = followingsData?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;

	const [subscribeLocal] = useMutation(SUBSCRIBE, {
		onCompleted: async () => {
			await getMemberFollowingsRefetch({ input: followInquiry });
			await sweetTopSmallSuccessAlert('Following!', 800);
		},
	});

	const [unsubscribeLocal] = useMutation(UNSUBSCRIBE, {
		onCompleted: async () => {
			await getMemberFollowingsRefetch({ input: followInquiry });
			await sweetTopSmallSuccessAlert('Unfollowed!', 800);
		},
	});

	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		} else if (user?._id) {
			setFollowInquiry({ ...followInquiry, search: { followerId: user._id } });
		}
	}, [router.query.memberId, user?._id]);

	const paginationHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry({ ...followInquiry, page: value });
	};

	if (device === 'mobile') return <div>NESTAR FOLLOWS MOBILE</div>;

	return (
		<div id="member-follows-page">
			{memberFollowings.length === 0 && (
				<div className="follow-list-empty">
					<Typography>No followings yet.</Typography>
				</div>
			)}
			{memberFollowings.map((follower: Following) => {
				const avatarSrc = resolveAvatar(follower.followingData?.memberImage);
				const nick = follower.followingData?.memberNick ?? '';
				const isLiked = follower.meLiked?.[0]?.myFavorite === true;
				const isFollowing = follower.meFollowed?.[0]?.myFollowing === true;
				const isMe = user?._id === follower.followingId;
				const btnId = follower._id;

				return (
					<div key={follower._id} className="follow-list-item">
						{avatarSrc ? (
							<img
								src={avatarSrc}
								alt={nick}
								className="follow-list-avatar"
								onClick={() => redirectToMemberPageHandler(toId(follower.followingData?._id))}
								style={{ cursor: 'pointer' }}
							/>
						) : (
							<div
								className="follow-list-avatar--initials"
								onClick={() => redirectToMemberPageHandler(toId(follower.followingData?._id))}
								style={{ cursor: 'pointer' }}
							>
								{getInitials(nick)}
							</div>
						)}

						<div
							className="follow-list-info"
							onClick={() => redirectToMemberPageHandler(toId(follower.followingData?._id))}
						>
							<Typography className="follow-list-nick">{nick || 'Member'}</Typography>
							{follower.followingData?.memberType && (
								<Typography className="follow-list-type">{follower.followingData.memberType}</Typography>
							)}
						</div>

						<div className="follow-list-actions">
							<button
								className={`follow-list-heart${isLiked ? ' liked' : ''}`}
								onClick={() => likeMemberHandler(toId(follower.followingData?._id), getMemberFollowingsRefetch, followInquiry)}
								aria-label="Like member"
							>
								{isLiked ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
							</button>

							{!isMe && (
								<button
									className={`follow-list-follow-btn ${isFollowing ? 'following' : 'not-following'}`}
									onMouseEnter={() => setHoveredId(btnId)}
									onMouseLeave={() => setHoveredId(null)}
									onClick={async () => {
										const targetId = toId(follower.followingData?._id);
										if (isFollowing) {
											await unsubscribeLocal({ variables: { memberId: targetId } });
										} else {
											await subscribeLocal({ variables: { memberId: targetId } });
										}
										if (memberId || user?._id) await getMemberRefetch({ input: memberId || user?._id });
									}}
								>
									{isFollowing ? (hoveredId === btnId ? 'Unfollow' : 'Following') : 'Follow'}
								</button>
							)}
						</div>
					</div>
				);
			})}

			{total > followInquiry.limit && (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
							page={followInquiry.page}
							count={Math.ceil(total / followInquiry.limit)}
							onChange={paginationHandler}
							shape="circular"
							color="primary"
						/>
					</Stack>
					<Stack className="total-result">
						<Typography>
							{total} following{total !== 1 ? 's' : ''}
						</Typography>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: { followerId: '' },
	},
};

export default MemberFollowings;
