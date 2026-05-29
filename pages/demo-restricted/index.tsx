import { NextPage } from 'next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { NextSeo } from 'next-seo';
import { buildCanonicalUrl, buildOpenGraph } from '../../libs/config/seo';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout'])),
	},
});

const DemoRestrictedPage: NextPage = () => {
	const pageTitle = 'Demo Access Notice | 같이Go Smart Library';
	const pageDescription =
		'Request actions are currently restricted to designated demo participants in 같이Go Smart Library.';

	return (
		<>
			<NextSeo
				title={pageTitle}
				description={pageDescription}
				canonical={buildCanonicalUrl('/demo-restricted')}
				openGraph={buildOpenGraph(pageTitle, pageDescription, '/demo-restricted')}
			/>
			<div className="demo-restricted-page">
				<div className="demo-restricted-card">
					<div className="demo-restricted-label">DEMO MODE</div>
					<h1 className="demo-restricted-title">Requests are currently restricted</h1>
					<div className="demo-restricted-divider" />
					<p className="demo-restricted-text">
						같이Go is currently in its MVP demo phase. To ensure a smooth demonstration and prevent conflicts with our live robot system, delivery requests are limited to designated demo accounts during this period.
					</p>
					<p className="demo-restricted-text">
						We appreciate your interest and understanding. Once the demo phase concludes, the full delivery system will be open to all users.
					</p>

					<div className="demo-restricted-actions">
						<Link href="/books" className="demo-restricted-btn demo-restricted-btn--secondary">
							Browse Books
						</Link>
						<Link href="/" className="demo-restricted-btn demo-restricted-btn--primary">
							Back to Home
						</Link>
					</div>

					<p className="demo-restricted-footnote">
						If you are a demo participant and believe you should have access, please contact the team.
					</p>
				</div>
			</div>
		</>
	);
};

export default withLayoutBasic(DemoRestrictedPage);
