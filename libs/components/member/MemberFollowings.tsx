import React, { ChangeEvent, useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { API_BASE_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
	likeMemberHandler: any;
	onProfileRefetch?: () => Promise<void>;
}

const resolveAvatar = (img?: string): string => {
	if (!img) return '/img/profile/defaultUser.svg';
	if (img.startsWith('/img') || img.startsWith('http')) return img;
	return `${API_BASE_URL}/${img}`;
};

const toId = (raw: any): string => {
	if (!raw) return '';
	if (typeof raw === 'string') return raw;
	return raw?._id?.toString?.() ?? raw?.toString?.() ?? '';
};

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, likeMemberHandler, unsubscribeHandler, redirectToMemberPageHandler, onProfileRefetch } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const user = useReactiveVar(userVar);

	const { data: followingsData, refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
	});

	const memberFollowings: Following[] = followingsData?.getMemberFollowings?.list ?? [];
	const total: number = followingsData?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;

	const [subscribeLocal] = useMutation(SUBSCRIBE);
	const [unsubscribeLocal] = useMutation(UNSUBSCRIBE);

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
						<img
						src={avatarSrc}
						alt={nick}
						className="follow-list-avatar"
						onClick={() => redirectToMemberPageHandler(toId(follower.followingData?._id))}
						style={{ cursor: 'pointer' }}
					/>

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
							<span className="follow-list-like-count">{follower.followingData?.memberLikes ?? 0}</span>

							{!isMe && (
								<button
									className={`follow-list-follow-btn ${isFollowing ? 'following' : 'not-following'}`}
									onMouseEnter={() => setHoveredId(btnId)}
									onMouseLeave={() => setHoveredId(null)}
									onClick={async () => {
										const targetId = toId(follower.followingData?._id);
										if (!user?._id) { router.push('/account/join'); return; }
										if (isFollowing) {
											await unsubscribeLocal({ variables: { memberId: targetId } });
										} else {
											await subscribeLocal({ variables: { memberId: targetId } });
										}
										await new Promise(resolve => setTimeout(resolve, 300));
										await getMemberFollowingsRefetch({ input: followInquiry });
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
		limit: 10,
		search: { followerId: '' },
	},
};

export default MemberFollowings;
