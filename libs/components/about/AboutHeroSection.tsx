import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

interface AboutHeroSectionProps {
	headline: string;
	subtitle: string;
	ctaLabel: string;
}

const FEATURES = [
	{
		title: 'Smart Book Search',
		description: 'Browse the catalog by title, author, category, and availability.',
		Icon: SearchRoundedIcon,
	},
	{
		title: 'Desk-Based Borrowing',
		description: 'Borrowed books are routed toward student desk coordinates.',
		Icon: LocationOnRoundedIcon,
	},
	{
		title: 'Robot Delivery',
		description: 'A TurtleBot 3 delivery flow connects requests, inventory, and tracking.',
		Icon: SmartToyRoundedIcon,
	},
	{
		title: 'Purchase Pickup',
		description: 'Purchased books move through reception instead of desk delivery.',
		Icon: ShoppingBagRoundedIcon,
	},
	{
		title: 'Inventory Awareness',
		description: 'Book availability and request state stay connected to the backend flow.',
		Icon: Inventory2RoundedIcon,
	},
	{
		title: 'Student-Friendly Flow',
		description: 'Search, request, and track books without learning library operations.',
		Icon: AutoAwesomeRoundedIcon,
	},
] as const;

const HERO_STATS = [
	{ value: '10k+', label: 'Prototype book catalog' },
	{ value: '2', label: 'Borrow and purchase modes' },
	{ value: '3', label: 'Request-to-delivery steps' },
	{ value: '1', label: 'Robot assistant' },
] as const;

const AboutHeroSection = ({ headline, subtitle, ctaLabel }: AboutHeroSectionProps) => {
	const shouldReduceMotion = useReducedMotion();
	const motionDistance = shouldReduceMotion ? 0 : 18;
	const normalizedCtaLabel = ctaLabel.replace(/\s*→$/, '');

	return (
		<section className={'about-hero'} aria-labelledby={'about-hero-title'}>
			<div className={'container'}>
				<motion.div
					className={'about-hero-copy'}
					initial={{ opacity: 0, y: motionDistance }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.35 }}
					transition={{ duration: 0.45, ease: 'easeOut' }}
				>
					<span className={'about-hero-eyebrow'}>같이Go Smart Library</span>
					<h1 id={'about-hero-title'}>{headline}</h1>
					<p>{subtitle}</p>

					<div className={'about-hero-actions'}>
						<Link href={'/books'} className={'about-hero-cta'}>
							<span>{normalizedCtaLabel}</span>
							<ArrowForwardRoundedIcon />
						</Link>
						<span className={'about-hero-note'}>Borrow to desk · Purchase to reception</span>
					</div>
				</motion.div>

				<motion.div
					className={'about-hero-visual'}
					initial={{ opacity: 0, y: motionDistance }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.25 }}
					transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
				>
					<div className={'delivery-card'}>
						<div className={'delivery-card-head'}>
							<div>
								<span className={'visual-kicker'}>Robot Delivery Flow</span>
								<strong>Catalog to student desk</strong>
							</div>
							<MenuBookRoundedIcon />
						</div>
						<img src={'/img/homepage/robot_delivery.webp'} alt={'같이Go robot delivery prototype'} />
						<div className={'delivery-route'} aria-label={'Delivery flow: Search, reserve, robot handoff'}>
							<span>Search</span>
							<span>Reserve</span>
							<span>Robot handoff</span>
						</div>
					</div>
				</motion.div>
			</div>

			<div className={'container about-hero-service-grid'}>
				{FEATURES.map(({ title, description, Icon }, index) => (
					<motion.article
						className={'about-service-item'}
						key={title}
						initial={{ opacity: 0, y: motionDistance }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.25 }}
						transition={{ duration: 0.38, delay: shouldReduceMotion ? 0 : index * 0.04, ease: 'easeOut' }}
					>
						<span className={'service-icon'} aria-hidden={'true'}>
							<Icon />
						</span>
						<div>
							<h2>{title}</h2>
							<p>{description}</p>
						</div>
					</motion.article>
				))}
			</div>

			<div className={'container about-hero-stats'} aria-label={'Prototype summary'}>
				{HERO_STATS.map((stat) => (
					<div className={'about-stat'} key={stat.label}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</div>
				))}
			</div>
		</section>
	);
};

export default AboutHeroSection;
