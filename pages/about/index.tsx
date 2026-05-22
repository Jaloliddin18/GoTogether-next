import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import AboutHeroSection from '../../libs/components/about/AboutHeroSection';
import AboutArchitectureSection from '../../libs/components/about/AboutArchitectureSection';
import AboutLogoCloudSection from '../../libs/components/about/AboutLogoCloudSection';

// ── Static data ───────────────────────────────────────────────────────────────
const TEAM = [
	{ name: 'Jaloliddin', role: 'Frontend / Full-stack', photo: '/img/members/jaloliddin2.png' },
	{ name: 'Akhror', role: 'Backend / NestJS', photo: '/img/members/ahror.png' },
	{ name: 'Aziz', role: 'ROS 2 / Navigation', photo: '/img/members/aziz.PNG' },
	{ name: 'Jahongir', role: 'Hardware / TurtleBot', photo: '/img/members/jahongir.png' },
	{ name: 'Ibrohim', role: 'Mobile App / React Native', photo: '/img/members/ibrohim.png' },
	{ name: 'Zhazaiym', role: 'ML / Path Planning', photo: '/img/profile/defaultUser.svg' },
	{ name: 'Sevinch', role: 'DevOps / Infrastructure', photo: '/img/members/sevinch.JPG' },
	{ name: 'Zubayda', role: 'Project Contributor', photo: '/img/members/zubayda.png' },
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

const RobotPrototypeSection = () => (
	<section className={'robot-showcase'} aria-labelledby={'robot-prototype-title'}>
		<div className={'container'}>
			<div className={'section-heading'}>
				<h2 id={'robot-prototype-title'}>Built to prove library delivery from request to pickup</h2>
				<p>
					같이Go uses a TurtleBot-based prototype to test how a student book request can become a real robot task. The
					goal is not to claim production deployment, but to validate the core delivery loop for a capstone demo.
				</p>
			</div>
			<div className={'robot-cols'}>
				<div className={'robot-visual-col'} aria-label={'Robot prototype visual summary'}>
					<div className={'robot-visual-card'}>
						<img className={'robot-frame-image'} src={'/img/logo/robot3.png'} alt={'TurtleBot delivery assistant'} />
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

const PrototypeScopeSection = () => (
	<div className={'prototype-scope'}>
		<div className={'ps-container'}>
			<div className={'section-heading'}>
				<h2>What the School Project Demonstrates</h2>
				<p>These figures describe the current prototype scope, not commercial deployment metrics.</p>
			</div>

			<div className={'ps-strip'}>
				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>50+</span>
					<span className={'ps-label'}>Catalog records</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>15-20</span>
					<span className={'ps-label'}>Physical demo books</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>1</span>
					<span className={'ps-label'}>TurtleBot prototype</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>2</span>
					<span className={'ps-label'}>Request flows — borrow and purchase</span>
				</div>

				<div className={'ps-divider'} />

				<div className={'ps-stat-item'}>
					<span className={'ps-number'}>Live</span>
					<span className={'ps-label'}>Real-time robot telemetry</span>
				</div>
			</div>
		</div>
	</div>
);

const SimplePricingSection = () => (
	<div className={'business-model'}>
		<div className={'bm-container'}>
			<div className={'bm-heading'}>
				<h2>Pricing Framework</h2>
				<p>A complete deployment package for any institution.</p>
			</div>

			<div className={'bm-table'}>
				<div className={'bm-header'}>
					<div className={'bm-col-name'}>Tier</div>
					<div className={'bm-col-included'}>What is included</div>
					<div className={'bm-col-details'}>Details</div>
					<div className={'bm-col-price'}>Price</div>
				</div>

				<div className={'bm-row'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>Hardware Unit</span>
						<span className={'bm-tier-sub'}>Per deployment unit</span>
					</div>
					<div className={'bm-col-included'}>
						<span>Autonomous Mobile Robot</span>
						<span>Navigation system</span>
						<span>UI/UX interface</span>
						<span>Book interface</span>
					</div>
					<div className={'bm-col-details'}>One-time hardware purchase per deployment unit</div>
					<div className={'bm-col-price'}>$8,000</div>
				</div>

				<div className={'bm-row bm-row--featured'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>System Infrastructure</span>
						<span className={'bm-tier-sub'}>Core platform</span>
					</div>
					<div className={'bm-col-included'}>
						<span>Sorting and Charging Hub</span>
						<span>Database and API integration</span>
						<span>Analytics dashboard</span>
						<span>Multi-robot support</span>
					</div>
					<div className={'bm-col-details'}>
						Core platform powering the full delivery lifecycle and management layer
					</div>
					<div className={'bm-col-price'}>$45,000</div>
				</div>

				<div className={'bm-row'}>
					<div className={'bm-col-name'}>
						<span className={'bm-tier-title'}>Operations</span>
						<span className={'bm-tier-sub'}>Annual subscription</span>
					</div>
					<div className={'bm-col-included'}>
						<span>SaaS license</span>
						<span>Maintenance and AI updates</span>
						<span>24/7 support</span>
						<span>Incident response</span>
					</div>
					<div className={'bm-col-details'}>Annual subscription — keeps the system current and supported</div>
					<div className={'bm-col-price'}>$5,000 / yr</div>
				</div>
			</div>

			<p className={'bm-footer'}>
				All tiers can be combined into a full deployment package. Contact us for institutional pricing.
			</p>
		</div>
	</div>
);

// ── Page component ────────────────────────────────────────────────────────────
const About: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('about');

	if (device === 'mobile') {
		return (
			<Stack className={'about-page'}>
				<AboutHeroSection headline={t('hero_headline')} subtitle={t('hero_sub')} ctaLabel={t('hero_cta')} />
				<AboutArchitectureSection />
				<RobotPrototypeSection />
				<PrototypeScopeSection />
				<SimplePricingSection />
				<AboutLogoCloudSection />
			</Stack>
		);
	}

	return (
		<Stack className={'about-page'}>
			{/* ── 1. HERO ──────────────────────────────────────────────────────── */}
			<AboutHeroSection headline={t('hero_headline')} subtitle={t('hero_sub')} ctaLabel={t('hero_cta')} />

			{/* ── 2. SYSTEM ARCHITECTURE ───────────────────────────────────────── */}
			<AboutArchitectureSection />

			{/* ── 4. ROBOT PROTOTYPE ──────────────────────────────────────────── */}
			<RobotPrototypeSection />

			{/* ── 5. PROTOTYPE SCOPE ───────────────────────────────────────────── */}
			<PrototypeScopeSection />

			{/* ── 6. SIMPLE LIBRARY PRICING ───────────────────────────────────── */}
			<SimplePricingSection />

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
						<h2>The Team</h2>
						<p>Eight students, one robot, one mission.</p>
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
						<Link href={'/library/books'} className={'btn-outline'}>
							{t('cta_btn1')}
						</Link>
						<Link href={'/account/join'} className={'btn-filled'}>
							{t('cta_btn2')}
						</Link>
					</div>
				</div>
			</section>

			{/* ── 14. LOGO CLOUD ──────────────────────────────────────────────── */}
			<AboutLogoCloudSection />
		</Stack>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'about'])),
	},
});

export default withLayoutBasic(About);
