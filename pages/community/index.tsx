import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CommunityShell from '../../libs/components/community/CommunityShell';
import CommunityComposer from '../../libs/components/community/CommunityComposer';
import CommunityFeed from '../../libs/components/community/CommunityFeed';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Twit } from '../../libs/types/twit/twit';
import { CreateTwitInput, TwitFeedType, TwitsInquiry } from '../../libs/types/twit/twit.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_TWIT, DELETE_TWIT } from '../../apollo/user/mutation';
import { GET_TWITS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState<TwitsInquiry>(initialInput);

	/** APOLLO REQUESTS **/
	const [createTwit, { loading: createTwitLoading }] = useMutation(CREATE_TWIT);
	const [deleteTwit] = useMutation(DELETE_TWIT);
	const {
		loading: twitsLoading,
		error: getTwitsError,
		data: twitsData,
		refetch: twitsRefetch,
	} = useQuery(GET_TWITS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
	});
	const twits: Twit[] = twitsData?.getTwits?.list ?? [];
	const totalCount: number = twitsData?.getTwits?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const createTwitHandler = async (input: CreateTwitInput): Promise<boolean> => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!input?.text?.trim()) throw new Error(Message.INSERT_ALL_INPUTS);

			await createTwit({
				variables: {
					input: {
						text: input.text.trim(),
						images: input.images,
					},
				},
			});

			const nextInquiry = { ...searchCommunity, page: 1 };
			setSearchCommunity(nextInquiry);
			await twitsRefetch({ input: nextInquiry });
			await sweetTopSmallSuccessAlert('Posted', 800);
			return true;
		} catch (err: any) {
			console.log('ERROR, createTwitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
			return false;
		}
	};

	const deleteTwitHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) {
				goLoginPage();
				return;
			}

			const confirmation = await sweetConfirmAlert('Delete this post?');
			if (!confirmation) return;

			await deleteTwit({
				variables: { input: id },
			});

			await twitsRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('Deleted', 800);
		} catch (err: any) {
			console.log('ERROR, deleteTwitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const tabChangeHandler = async (tabIndex: number) => {
		// tab 1 = Following requires auth
		if (tabIndex === 1 && !user?._id) {
			goLoginPage();
			return;
		}
		const feedType = tabIndex === 1 ? TwitFeedType.FOLLOWING : TwitFeedType.FOR_YOU;
		const nextInquiry = { ...searchCommunity, page: 1, feedType };
		setSearchCommunity(nextInquiry);
		await twitsRefetch({ input: nextInquiry });
	};

	const paginationHandler = async (e: T, value: number) => {
		const nextInquiry = { ...searchCommunity, page: value };
		setSearchCommunity(nextInquiry);
		await twitsRefetch({ input: nextInquiry });
	};

	const goLoginPage = () => {
		router.push('/account/join').then();
	};

	return (
		<div id="community-list-page" className={`community-device-${device}`}>
			<div className="container">
				<CommunityShell totalCount={totalCount} onTabChange={tabChangeHandler}>
					<CommunityComposer user={user} loading={createTwitLoading} onSubmit={createTwitHandler} onLogin={goLoginPage} />
					<CommunityFeed
						twits={twits}
						loading={twitsLoading}
						error={getTwitsError}
						currentUserId={user?._id}
						onDelete={deleteTwitHandler}
					/>
					{totalCount > searchCommunity.limit && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									Total {totalCount} post{totalCount > 1 ? 's' : ''} available
								</Typography>
							</Stack>
						</Stack>
					)}
				</CommunityShell>
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
		feedType: TwitFeedType.FOR_YOU,
	},
};

export default withLayoutBasic(Community);
