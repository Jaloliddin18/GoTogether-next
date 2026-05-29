import React, { ChangeEvent, useEffect, useState } from 'react';
import { Pagination, Skeleton, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { API_BASE_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
	likeMemberHandler: any;
	onProfileRefetch?: () => Promise<void>;
	refetchTrigger?: number;
}

const resolveAvatar = (img?: string): string => {
	if (!img) return '/img/profile/defaultUser.svg';
	if (img.startsWith('/img') || img.startsWith('http')) return img;
	return `${API_BASE_URL}/${img}`;
};

// Coerce MongoDB ObjectId objects to plain strings
const toId = (raw: any): string => {
	if (!raw) return '';
	if (typeof raw === 'string') return raw;
	return raw?._id?.toString?.() ?? raw?.toString?.() ?? '';
};

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, likeMemberHandler, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler, onProfileRefetch, refetchTrigger } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const user = useReactiveVar(userVar);

	const { loading, data: followersData, refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
	});

	const memberFollowers: Follower[] = followersData?.getMemberFollowers?.list ?? [];
	const total: number = followersData?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0;

	const [subscribeLocal] = useMutation(SUBSCRIBE);
	const [unsubscribeLocal] = useMutation(UNSUBSCRIBE);

	useEffect(() => {
		if (!refetchTrigger) return;
		getMemberFollowersRefetch({ input: followInquiry });
	}, [refetchTrigger]);

	const paginationHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry({ ...followInquiry, page: value });
	};

	if (device === 'mobile') return <div>GOTOGETHER FOLLOWS MOBILE</div>;

	return (
		<div id="member-follows-page">
			{loading && (
				<Stack sx={{ gap: 1.2 }}>
					{Array.from({ length: 4 }).map((_, index) => (
						<Stack
							key={`followers-skeleton-${index}`}
							direction="row"
							alignItems="center"
							spacing={1.5}
							sx={{ p: 1.4, border: '1px solid #e2e8f0', borderRadius: '10px' }}
						>
							<Skeleton variant="circular" animation="wave" width={46} height={46} />
							<Stack sx={{ flex: 1 }}>
								<Skeleton variant="text" animation="wave" width="32%" height={24} />
								<Skeleton variant="text" animation="wave" width="24%" height={20} />
							</Stack>
							<Skeleton variant="rounded" animation="wave" width={96} height={34} />
						</Stack>
					))}
				</Stack>
			)}
			{!loading && memberFollowers.filter(f => f.followerId !== followInquiry.search?.followingId).length === 0 && (
				<div className="follow-list-empty">
					<Typography>No followers yet.</Typography>
				</div>
			)}
			{!loading && memberFollowers
				.filter((follower) => follower.followerId !== followInquiry.search?.followingId)
				.map((follower: Follower) => {
				const avatarSrc = resolveAvatar(follower.followerData?.memberImage);
				const nick = follower.followerData?.memberNick ?? '';
				const isLiked = follower.meLiked?.[0]?.myFavorite === true;
				const isFollowing = follower.meFollowed?.[0]?.myFollowing === true;
				const isMe = user?._id === follower.followerId;
				const btnId = follower._id;

				return (
					<div key={follower._id} className="follow-list-item">
						<img
						src={avatarSrc}
						alt={nick}
						className="follow-list-avatar"
						onClick={() => redirectToMemberPageHandler(toId(follower.followerData?._id))}
						style={{ cursor: 'pointer' }}
					/>

						<div
							className="follow-list-info"
							onClick={() => redirectToMemberPageHandler(toId(follower.followerData?._id))}
						>
							<Typography className="follow-list-nick">{nick || 'Member'}</Typography>
							{follower.followerData?.memberType && (
								<Typography className="follow-list-type">{follower.followerData.memberType}</Typography>
							)}
						</div>

						<div className="follow-list-actions">
							<button
								className={`follow-list-heart${isLiked ? ' liked' : ''}`}
								onClick={() => likeMemberHandler(toId(follower.followerData?._id), getMemberFollowersRefetch, followInquiry)}
								aria-label="Like member"
							>
								{isLiked ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
							</button>
							<span className="follow-list-like-count">{follower.followerData?.memberLikes ?? 0}</span>

							{!isMe && (
								<button
									className={`follow-list-follow-btn ${isFollowing ? 'following' : 'not-following'}`}
									onMouseEnter={() => setHoveredId(btnId)}
									onMouseLeave={() => setHoveredId(null)}
									onClick={async () => {
										const targetId = toId(follower.followerData?._id);
										if (!user?._id) { router.push('/account/join'); return; }
										if (isFollowing) {
											await unsubscribeLocal({ variables: { memberId: targetId } });
										} else {
											await subscribeLocal({ variables: { memberId: targetId } });
										}
										await new Promise(resolve => setTimeout(resolve, 300));
										await getMemberFollowersRefetch({ input: followInquiry });
										if (onProfileRefetch) await onProfileRefetch();
										await sweetTopSmallSuccessAlert(isFollowing ? 'Unfollowed!' : 'Following!', 800);
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
							{total} follower{total !== 1 ? 's' : ''}
						</Typography>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		search: { followingId: '' },
	},
};

export default MemberFollowers;
