import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import AboutHeroSection from '../../libs/components/about/AboutHeroSection';
import AboutWorkflowSection from '../../libs/components/about/AboutWorkflowSection';
import AboutArchitectureSection from '../../libs/components/about/AboutArchitectureSection';
import AboutLogoCloudSection from '../../libs/components/about/AboutLogoCloudSection';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import SettingsRemoteRoundedIcon from '@mui/icons-material/SettingsRemoteRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';

// ── Static data ───────────────────────────────────────────────────────────────
const TEAM = [
	{ name: 'Jaloliddin', role: 'Frontend / Full-stack', photo: '/img/profile/writer2.jpg' },
	{ name: 'Akhror', role: 'Backend / NestJS', photo: '/img/profile/writer3.jpg' },
	{ name: 'Aziz', role: 'ROS 2 / Navigation', photo: '/img/profile/writer4.jpg' },
	{ name: 'Jahongir', role: 'Hardware / TurtleBot', photo: '/img/profile/writer5.jpg' },
	{ name: 'Ibohim', role: 'Mobile App / React Native', photo: '/img/profile/writer6.jpg' },
	{ name: 'Zhajaym', role: 'ML / Path Planning', photo: '/img/profile/defaultUser.svg' },
	{ name: 'Seva', role: 'DevOps / Infrastructure', photo: '/img/profile/defaultUser.svg' },
	{ name: 'Team Member', role: 'Project Contributor', photo: '/img/profile/defaultUser.svg' },
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

const ROBOT_VISUAL_POINTS = [
	{ label: 'Route plan', Icon: RouteRoundedIcon },
	{ label: 'QR / vision', Icon: SensorsRoundedIcon },
	{ label: 'Gripper pickup', Icon: PrecisionManufacturingRoundedIcon },
	{ label: 'Telemetry', Icon: SettingsRemoteRoundedIcon },
] as const;

const PROTOTYPE_SCOPE = [
	{ value: '50+', label: 'catalog records', Icon: MenuBookRoundedIcon },
	{ value: '15-20', label: 'physical demo books', Icon: Inventory2RoundedIcon },
	{ value: '1', label: 'TurtleBot prototype', Icon: SmartToyRoundedIcon },
	{ value: 'Borrow + purchase', label: 'request flows', Icon: ShoppingCartCheckoutRoundedIcon },
	{ value: 'Real-time', label: 'robot telemetry', Icon: TrackChangesRoundedIcon },
] as const;

const PRICING_CARDS = [
	{
		title: 'Borrow',
		value: 'Free',
		label: 'For library borrowing',
		features: [
			'Borrow available library books',
			'Delivered to your saved desk location',
			'Real-time request status updates',
			'Return handled through the library flow',
		],
		cta: 'Browse Books',
		href: '/books',
		featured: false,
	},
	{
		title: 'Purchase',
		value: 'Book price',
		label: 'For bookstore items',
		features: [
			'Buy purchasable books from available inventory',
			'Pickup destination: reception',
			'Payment status tracked in request flow',
			'Useful for textbooks and course materials',
		],
		cta: 'View Store Books',
		href: '/books',
		featured: false,
	},
	{
		title: 'Robot Delivery',
		value: 'Included',
		label: 'Prototype delivery service',
		features: [
			'TurtleBot delivery prototype',
			'MQTT command and telemetry flow',
			'Shelf pickup with gripper mechanism',
			'Live delivery status updates',
		],
		cta: 'Learn How It Works',
		href: '#about-workflow',
		featured: true,
	},
] as const;

const RobotPrototypeSection = () => (
	<section className={'robot-showcase'} aria-labelledby={'robot-prototype-title'}>
		<div className={'container'}>
			<div className={'robot-visual-col'} aria-label={'Robot prototype visual summary'}>
				<div className={'robot-visual-card'}>
					<span className={'robot-visual-status'}>School prototype</span>
					<div className={'robot-icon-stage'}>
						<SmartToyRoundedIcon />
					</div>
					<strong>TurtleBot delivery assistant</strong>
					<p>Request handoff, route logic, fixed-gripper pickup, and telemetry feedback in one demo flow.</p>
					<div className={'robot-visual-points'}>
						{ROBOT_VISUAL_POINTS.map(({ label, Icon }) => (
							<div className={'robot-visual-point'} key={label}>
								<Icon />
								<span>{label}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className={'robot-specs-col'}>
				<span className={'robot-eyebrow'}>Meet the Robot Prototype</span>
				<h2 id={'robot-prototype-title'}>Built to prove library delivery from request to pickup</h2>
				<p className={'robot-desc'}>
					같이Go uses a TurtleBot-based prototype to test how a student book request can become a real robot task.
					The goal is not to claim production deployment, but to validate the core delivery loop for a capstone demo.
				</p>
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
	</section>
);

const PrototypeScopeSection = () => (
	<section className={'prototype-scope'} aria-labelledby={'prototype-scope-title'}>
		<div className={'container'}>
			<div className={'section-header'}>
				<span className={'scope-eyebrow'}>Prototype Scope</span>
				<h2 id={'prototype-scope-title'}>What the school project demonstrates</h2>
				<p>These figures describe the current prototype scope, not commercial deployment metrics.</p>
			</div>
			<div className={'scope-grid'}>
				{PROTOTYPE_SCOPE.map(({ value, label, Icon }) => (
					<article className={'scope-card'} key={label}>
						<span className={'scope-icon'} aria-hidden={'true'}>
							<Icon />
						</span>
						<strong>{value}</strong>
						<span>{label}</span>
					</article>
				))}
			</div>
		</div>
	</section>
);

const SimplePricingSection = () => (
	<section className={'business-model'} aria-labelledby={'simple-pricing-title'}>
		<div className={'container'}>
			<div className={'section-header pricing-heading'}>
				<h2 id={'simple-pricing-title'}>Simple Library Pricing</h2>
				<p>
					Borrow books for free, purchase bookstore items when available, and use robot delivery as part of
					the smart library experience.
				</p>
			</div>
			<div className={'pricing-cards'}>
				{PRICING_CARDS.map((card) => (
					<article className={`pricing-card${card.featured ? ' featured' : ''}`} key={card.title}>
						<div className={`card-accent${card.featured ? '' : ' primary-accent'}`} />
						<strong className={'card-title'}>{card.title}</strong>
						<span className={'card-price'}>{card.value}</span>
						<span className={'card-label'}>{card.label}</span>
						<ul className={'card-features'}>
							{card.features.map((feature) => (
								<li key={feature}>{feature}</li>
							))}
						</ul>
						<Link href={card.href} className={'card-cta'}>
							{card.cta}
						</Link>
					</article>
				))}
			</div>
		</div>
	</section>
);

// ── Page component ────────────────────────────────────────────────────────────
const About: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('about');

	if (device === 'mobile') {
		return (
			<Stack className={'about-page'}>
				<AboutHeroSection headline={t('hero_headline')} subtitle={t('hero_sub')} ctaLabel={t('hero_cta')} />
				<AboutWorkflowSection />
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

			{/* ── 2. WORKFLOW ─────────────────────────────────────────────────── */}
			<AboutWorkflowSection />

			{/* ── 3. SYSTEM ARCHITECTURE ───────────────────────────────────────── */}
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
			<section className={'team-section'}>
				<div className={'container'}>
					<div className={'section-header'}>
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
			</section>

			{/* ── 12. UNIVERSITY BADGE ─────────────────────────────────────────── */}
			<section className={'university-badge'}>
				<div className={'container'}>
					<img src={'/img/logo/logo_capstone.png'} alt={'Inha University Capstone'} className={'capstone-logo'} />
					<div className={'uni-text'}>
						<p className={'uni-label'}>{t('uni_label')}</p>
						<p className={'uni-name'}>{t('uni_name')}</p>
					</div>
				</div>
			</section>

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
