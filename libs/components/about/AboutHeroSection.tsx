import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'next-i18next';

interface AboutHeroSectionProps {
	headline: string;
	subtitle: string;
	ctaLabel: string;
}

const AboutHeroSection = ({ headline, subtitle, ctaLabel }: AboutHeroSectionProps) => {
	const { t } = useTranslation('about');
	const shouldReduceMotion = useReducedMotion();
	const motionDistance = shouldReduceMotion ? 0 : 18;
	const normalizedCtaLabel = ctaLabel.replace(/\s*→$/, '');
	const features = [
		{
			key: 'hero_feat1',
			title: t('hero_feat1_title'),
			description: t('hero_feat1_desc'),
			Icon: SearchRoundedIcon,
		},
		{
			key: 'hero_feat2',
			title: t('hero_feat2_title'),
			description: t('hero_feat2_desc'),
			Icon: LocationOnRoundedIcon,
		},
		{
			key: 'hero_feat3',
			title: t('hero_feat3_title'),
			description: t('hero_feat3_desc'),
			Icon: SmartToyRoundedIcon,
		},
		{
			key: 'hero_feat4',
			title: t('hero_feat4_title'),
			description: t('hero_feat4_desc'),
			Icon: ShoppingBagRoundedIcon,
		},
		{
			key: 'hero_feat5',
			title: t('hero_feat5_title'),
			description: t('hero_feat5_desc'),
			Icon: Inventory2RoundedIcon,
		},
		{
			key: 'hero_feat6',
			title: t('hero_feat6_title'),
			description: t('hero_feat6_desc'),
			Icon: AutoAwesomeRoundedIcon,
		},
	] as const;

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
					<span className={'about-hero-eyebrow'}>{t('hero_eyebrow')}</span>
					<h1 id={'about-hero-title'}>{headline}</h1>
					<p>{subtitle}</p>

					<div className={'about-hero-actions'}>
						<Link href={'/books'} className={'about-hero-cta'}>
							<span>{normalizedCtaLabel}</span>
							<ArrowForwardRoundedIcon />
						</Link>
						<span className={'about-hero-note'}>{t('hero_borrow_tag')}</span>
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
								<span className={'visual-kicker'}>{t('flow_title')}</span>
								<strong>{t('flow_subtitle')}</strong>
							</div>
						</div>
						<img src={'/img/homepage/robot_delivery.webp'} alt={'같이Go robot delivery prototype'} />
						<div className={'delivery-route'} aria-label={'Delivery flow: Search, reserve, robot handoff'}>
							<span>{t('flow_step1')}</span>
							<span>{t('flow_step2')}</span>
							<span>{t('flow_step3')}</span>
						</div>
					</div>
				</motion.div>
			</div>

			<div className={'container about-hero-service-grid'}>
				{features.map(({ key, title, description, Icon }, index) => (
					<motion.article
						className={'about-service-item'}
						key={key}
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
		</section>
	);
};

export default AboutHeroSection;
