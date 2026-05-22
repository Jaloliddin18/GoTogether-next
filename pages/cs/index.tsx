import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArticleIcon from '@mui/icons-material/Article';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Terms from '../../libs/components/cs/Terms';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const TAB_VALUES = ['notice', 'faq', 'terms'] as const;
type CsTab = (typeof TAB_VALUES)[number];

const TAB_ITEMS: { key: CsTab; label: string; icon: JSX.Element }[] = [
	{ key: 'notice', label: 'Notices & Updates', icon: <NotificationsActiveOutlinedIcon /> },
	{ key: 'faq', label: 'FAQ', icon: <QuestionAnswerIcon /> },
	{ key: 'terms', label: 'Terms & Conditions', icon: <ArticleIcon /> },
];

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = () => {
	const router = useRouter();

	const changeTabHandler = (tab: CsTab) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false, shallow: true },
		);
	};

	const currentTabQuery = typeof router.query.tab === 'string' ? router.query.tab : 'notice';
	const tab = TAB_VALUES.includes(currentTabQuery as CsTab) ? (currentTabQuery as CsTab) : 'notice';

	return (
		<Stack className={'cs-page'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'cs-main-info'}>
					<Box component={'div'} className={'info'}>
						<span>Customer Support</span>
						<p>
							<Link href={'/'}>Home</Link>
							<span className={'divider'}>/</span>
							<strong>CS</strong>
						</p>
					</Box>
					<Box component={'div'} className={'btns'}>
						{TAB_ITEMS.map((item, index) => (
							<React.Fragment key={item.key}>
								<button
									type={'button'}
									className={`cs-tab-btn ${tab === item.key ? 'active' : ''}`}
									onClick={() => changeTabHandler(item.key)}
									aria-pressed={tab === item.key}
									aria-label={`Open ${item.label}`}
								>
									{item.icon}
									<span>{item.label}</span>
								</button>
								{index !== TAB_ITEMS.length - 1 && <span className={'tab-separator'}>|</span>}
							</React.Fragment>
						))}
					</Box>
				</Box>
				<Box component={'div'} className={'cs-content'}>
					{tab === 'notice' && <Notice />}
					{tab === 'faq' && <Faq />}
					{tab === 'terms' && <Terms />}
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(CS);
