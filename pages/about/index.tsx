import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import type { TFunction } from 'i18next';
import { userVar } from '../../apollo/store';
import AboutHeroSection from '../../libs/components/about/AboutHeroSection';
import AboutArchitectureSection from '../../libs/components/about/AboutArchitectureSection';
import AboutLogoCloudSection from '../../libs/components/about/AboutLogoCloudSection';
import { NextSeo } from 'next-seo';
import { buildCanonicalUrl, buildOpenGraph } from '../../libs/config/seo';

// ── Static data ───────────────────────────────────────────────────────────────
const TEAM = [
	{ name: 'Jaloliddin', role: 'Co-Founder (CEO)', photo: '/img/members/jaloliddin2.png' },
	{ name: 'Akhror', role: 'Co-Founder (CTO)', photo: '/img/members/ahror.png' },
	{ name: 'Aziz', role: 'Project Manager (CPO)', photo: '/img/members/aziz.PNG' },
	{ name: 'Jahongir', role: 'IT Manager (CIO)', photo: '/img/members/jahongir.png' },
	{ name: 'Ibrohim', role: 'Supply Chain Manager (COO)', photo: '/img/members/ibrohim.png' },
	{ name: 'Zhazaiym', role: 'Sales Manager (CSO)', photo: '/img/members/zhazaiym.png' },
	{ name: 'Sevinch', role: 'Chief Marketing Officer (CMO)', photo: '/img/members/sevinch.JPG' },
	{ name: 'Zubayda', role: 'Financial Manager (CFO)', photo: '/img/members/zubayda.png' },
] as const;

const TECH_ROW1 = ['ROS 2', 'TurtleBot 3', 'LiDAR', 'Python', 'SLAM'];
const TECH_ROW2 = ['NestJS', 'GraphQL', 'MongoDB', 'Next.js', 'TypeScript', 'Apollo Client', 'WebSocket'];

const SPEC_ROWS = [
	{ key: 'Robot Base', val: 'TurtleBot prototype for library-floor movement' },
	{ key: 'Pickup Tooling', val: 'Fixed gripper that opens and closes for demo-book pickup' },
	{ key: 'Route Logic', val: 'BFS route planning with state-machine control' },
	{ key: 'Vision Feedback', val: 'Line and QR detection for shelf approach and confirmation' },
	{ key: 'Communication', val: 'Backend-managed MQTT command and telemetry flow' },
	{ key: 'Prototype Goal', val: 'Validate request-to-delivery behavior in a school demo setting' },
] as const;

type AboutTranslate = TFunction;

const RobotPrototypeSection = ({ t }: { t: AboutTranslate }) => (
	<section className={'robot-showcase'} aria-labelledby={'robot-prototype-title'}>
		<div className={'container'}>
			<div className={'section-heading'}>
				<h2 id={'robot-prototype-title'}>{t('demo_title')}</h2>
				<p>{t('prototype_description')}</p>
			</div>
			<div className={'robot-cols'}>
				<div className={'robot-visual-col'} aria-label={t('prototype_visual_aria')}>
					<div className={'robot-visual-card'}>
						<img className={'robot-frame-image'} src={'/img/logo/robot3.png'} alt={t('prototype_robot_alt')} />
					</div>
				</div>
				<div className={'robot-specs-col'}>
					<div className={'spec-rows'}>
						{SPEC_ROWS.map((row) => (
							<div className={'spec-row'} key={row.key}>
								<span className={'spec-key'}>{row.key}</span>
								<span className={'spec-sep'}>—</span>
								<span className={'spec-val'}>{row.val}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	</section>
);

const PrototypeScopeSection = ({ t }: { t: AboutTranslate }) => (
	<div className={'prototype-scope'}>
		<div className={'ps-container'}>
			<div className={'section-heading'}>
				<h2>{t('demo_subtitle')}</h2>
				<p>{t('prototype_scope_note')}</p>
			</div>

			<div className={'ps-strip'}>
				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>50+</span>
					<span className={'ps-label'}>{t('demo_stat1')}</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>15-20</span>
					<span className={'ps-label'}>{t('demo_stat2')}</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>1</span>
					<span className={'ps-label'}>{t('demo_stat3')}</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>2</span>
					<span className={'ps-label'}>{t('demo_stat4')}</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>Live</span>
					<span className={'ps-label'}>{t('demo_stat5')}</span>
				</div>
			</div>
		</div>
	</div>
);

const SimplePricingSection = ({ t }: { t: AboutTranslate }) => (
	<div className={'business-model'}>
		<div className={'bm-container'}>
			<div className={'bm-heading'}>
				<h2>{t('pricing_title')}</h2>
				<p>{t('pricing_subtitle')}</p>
			</div>

			<div className={'bm-table'}>
				<div className={'bm-header'}>
					<div className={'bm-col-name'}>{t('pricing_col_tier')}</div>
					<div className={'bm-col-included'}>{t('pricing_col_includes')}</div>
					<div className={'bm-col-details'}>{t('pricing_col_details')}</div>
					<div className={'bm-col-price'}>{t('pricing_col_price')}</div>
				</div>

				<div className={'bm-row'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>{t('pricing_tier1_name')}</span>
						<span className={'bm-tier-sub'}>{t('pricing_tier1_billing')}</span>
					</div>
					<div className={'bm-col-included'}>
						<span>{t('pricing_tier1_feat1')}</span>
						<span>{t('pricing_tier1_feat2')}</span>
						<span>{t('pricing_tier1_feat3')}</span>
						<span>{t('pricing_tier1_feat4')}</span>
					</div>
					<div className={'bm-col-details'}>{t('pricing_tier1_desc')}</div>
					<div className={'bm-col-price'}>{t('pricing_tier1_price')}</div>
				</div>

				<div className={'bm-row bm-row--featured'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>{t('pricing_tier2_name')}</span>
						<span className={'bm-tier-sub'}>{t('pricing_tier2_billing')}</span>
					</div>
					<div className={'bm-col-included'}>
						<span>{t('pricing_tier2_feat1')}</span>
						<span>{t('pricing_tier2_feat2')}</span>
						<span>{t('pricing_tier2_feat3')}</span>
						<span>{t('pricing_tier2_feat4')}</span>
					</div>
					<div className={'bm-col-details'}>{t('pricing_tier2_desc')}</div>
					<div className={'bm-col-price'}>{t('pricing_tier2_price')}</div>
				</div>

				<div className={'bm-row'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>{t('pricing_tier3_name')}</span>
						<span className={'bm-tier-sub'}>{t('pricing_tier3_billing')}</span>
					</div>
					<div className={'bm-col-included'}>
						<span>{t('pricing_tier3_feat1')}</span>
						<span>{t('pricing_tier3_feat2')}</span>
						<span>{t('pricing_tier3_feat3')}</span>
						<span>{t('pricing_tier3_feat4')}</span>
					</div>
					<div className={'bm-col-details'}>{t('pricing_tier3_desc')}</div>
					<div className={'bm-col-price'}>{t('pricing_tier3_price')}</div>
				</div>
			</div>

			<p className={'bm-footer'}>{t('pricing_footer')}</p>
		</div>
	</div>
);

const MarketResearchSection = ({ t }: { t: AboutTranslate }) => (
	<section className={'market-research'}>
		<div className={'mr-container'}>
			{/* Heading */}
			<div className={'mr-heading'}>
				<h2>{t('market_research_title')}</h2>
			</div>

			{/* Block 1 — Metric cards */}
			<div className={'mr-metric-grid'}>
				<div className={'mr-metric-card'}>
					<span className={'mr-label'}>{t('market_growth_label')}</span>
					<span className={'mr-value'}>{t('market_value')}</span>
					<span className={'mr-sub'}>{t('market_projected')}</span>
					<span className={'mr-detail'}>{t('market_cagr_detail')}</span>
				</div>
				<div className={'mr-metric-card'}>
					<span className={'mr-label'}>{t('roi_title')}</span>
					<span className={'mr-value'}>{t('roi_value')}</span>
					<span className={'mr-sub'}>{t('roi_label')}</span>
					<span className={'mr-detail'}>{t('roi_detail')}</span>
				</div>
			</div>

			{/* Block 2 — Library Crisis */}
			<div className={'mr-block-label'}>{t('crisis_title')}</div>
				<div className={'mr-crisis-grid'}>
					<div className={'mr-crisis-cell'}>
						<span className={'mr-crisis-stat'}>12–18 MIN</span>
						<span className={'mr-crisis-label'}>{t('crisis_avg_search_label')}</span>
						<span className={'mr-crisis-sub'}>{t('crisis_abandonment')}</span>
					</div>
				<div className={'mr-crisis-cell'}>
					<span className={'mr-crisis-stat'}>{t('crisis_vacancy')}</span>
					<span className={'mr-crisis-label'}>{t('crisis_vacancy_label')}</span>
					<span className={'mr-crisis-sub'}>{t('crisis_hours')}</span>
				</div>
				<div className={'mr-crisis-cell'}>
					<span className={'mr-crisis-stat'}>{t('crisis_misplaced')}</span>
					<span className={'mr-crisis-label'}>{t('crisis_misplaced_label')}</span>
					<span className={'mr-crisis-sub'}>{t('crisis_audit')}</span>
				</div>
				<div className={'mr-crisis-cell'}>
					<span className={'mr-crisis-stat'}>{t('crisis_uncirculated')}</span>
					<span className={'mr-crisis-label'}>{t('crisis_uncirculated_label')}</span>
					<span className={'mr-crisis-sub'}>{t('crisis_visibility')}</span>
				</div>
			</div>

			{/* Block 3 — Competitive Advantage */}
			<div className={'mr-block-label'}>{t('competitive_title')}</div>
			<div className={'mr-compete-rows'}>
				<div className={'mr-compete-row mr-compete-row--danger'}>
					<div className={'mr-compete-left'}>
						<span className={'mr-compete-title'}>{t('competitive_others_label')}</span>
						<span className={'mr-compete-sub'}>{t('competitive_others_names')}</span>
					</div>
					<span className={'mr-compete-right'}>{t('competitive_others_cost')}</span>
				</div>
				<div className={'mr-compete-row mr-compete-row--success'}>
					<div className={'mr-compete-left'}>
						<span className={'mr-compete-title'}>{t('competitive_ours_label')}</span>
						<span className={'mr-compete-sub'}>{t('competitive_ours_advantage')}</span>
					</div>
					<span className={'mr-compete-price'}>{t('competitive_ours_cost')}</span>
				</div>
			</div>

			{/* Block 4 — Go-to-Market */}
			<div className={'mr-block-label'}>{t('gtm_title')}</div>
			<div className={'mr-gtm-phases'}>
				<div className={'mr-phase-box'}>{t('gtm_phase1')}</div>
				<span className={'mr-phase-arrow'}>&gt;</span>
				<div className={'mr-phase-box'}>{t('gtm_phase2')}</div>
				<span className={'mr-phase-arrow'}>&gt;</span>
				<div className={'mr-phase-box'}>{t('gtm_phase3')}</div>
			</div>
			<div className={'mr-gtm-pill-wrap'}>
				<span className={'mr-gtm-pill'}>{t('gtm_phase3_desc')}</span>
			</div>
		</div>
	</section>
);

// ── Page component ────────────────────────────────────────────────────────────
const About: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('about');
	const user = useReactiveVar(userVar);
	const pageTitle = 'About 같이Go | Smart Library Robot Delivery';
	const pageDescription =
		'Learn about 같이Go Smart Library, a university smart library system using autonomous robot delivery to help students access books faster at INHA University.';

	if (device === 'mobile') {
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/about')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/about')}
				/>
				<Stack className={'about-page'}>
					<AboutHeroSection headline={t('hero_headline')} subtitle={t('hero_sub')} ctaLabel={t('hero_cta')} />
					<MarketResearchSection t={t} />
					<AboutArchitectureSection />
					<RobotPrototypeSection t={t} />
					<PrototypeScopeSection t={t} />
					<SimplePricingSection t={t} />
					<AboutLogoCloudSection />
				</Stack>
			</>
		);
	}

	return (
		<>
			<NextSeo
				title={pageTitle}
				description={pageDescription}
				canonical={buildCanonicalUrl('/about')}
				openGraph={buildOpenGraph(pageTitle, pageDescription, '/about')}
			/>
			<Stack className={'about-page'}>
			{/* ── 1. HERO ──────────────────────────────────────────────────────── */}
			<AboutHeroSection headline={t('hero_headline')} subtitle={t('hero_sub')} ctaLabel={t('hero_cta')} />

			{/* ── 2. MARKET RESEARCH — establish the problem first ─────────────── */}
			<MarketResearchSection t={t} />

			{/* ── 3. SYSTEM ARCHITECTURE — show the solution ───────────────────── */}
			<AboutArchitectureSection />

			{/* ── 4. ROBOT PROTOTYPE — bring the architecture to life ─────────── */}
			<RobotPrototypeSection t={t} />

			{/* ── 5. PROTOTYPE SCOPE — honest capstone scoping ─────────────────── */}
			<PrototypeScopeSection t={t} />

			{/* ── 6. PRICING — value is clear now ──────────────────────────────── */}
			<SimplePricingSection t={t} />

			{/* ── 10. TECH STACK ───────────────────────────────────────────────── */}
			<section className={'tech-stack'}>
				<div className={'container'}>
					<div className={'section-header'}>
						<h2>{t('tech_title')}</h2>
						<p>{t('tech_subtitle')}</p>
					</div>
					<div className={'pill-rows'}>
						<div className={'pill-row'}>
							{TECH_ROW1.map((label) => (
								<span className={'tech-pill'} key={label}>
									{label}
								</span>
							))}
						</div>
						<div className={'pill-row'}>
							{TECH_ROW2.map((label) => (
								<span className={'tech-pill'} key={label}>
									{label}
								</span>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── 11. TEAM ─────────────────────────────────────────────────────── */}
			<div className={'team-section'}>
				<div className={'team-container'}>
					<div className={'section-heading'}>
						<h2>{t('team_title')}</h2>
						<p>{t('team_subtitle')}</p>
					</div>
					<div className={'team-grid'}>
						{TEAM.map((member, i) => (
							<div className={'member-card'} key={i}>
								<div className={'member-avatar'}>
									<img src={member.photo} alt={member.name} />
								</div>
								<strong className={'member-name'}>{member.name}</strong>
								<span className={'member-role'}>{member.role}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── 13. CTA STRIP ────────────────────────────────────────────────── */}
			<section className={'cta-strip'}>
				<div className={'container'}>
					<div className={'cta-left'}>
						<strong>{t('cta_headline')}</strong>
						<p>{t('cta_sub')}</p>
					</div>
					<div className={'cta-right'}>
						<Link href={'/books'} className={'btn-outline'}>
							{t('cta_btn1')}
						</Link>
						{!user._id && (
							<Link href={'/account/join'} className={'btn-filled'}>
								{t('cta_btn2')}
							</Link>
						)}
					</div>
				</div>
			</section>

			{/* ── 14. LOGO CLOUD ──────────────────────────────────────────────── */}
			<AboutLogoCloudSection />
			</Stack>
		</>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'about', 'layout'])),
	},
});

export default withLayoutBasic(About);
