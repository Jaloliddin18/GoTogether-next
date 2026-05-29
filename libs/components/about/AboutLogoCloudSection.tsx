import React from 'react';
import { useTranslation } from 'next-i18next';

const LOGOS = [
	{
		name: 'Nvidia',
		src: 'https://svgl.app/library/nvidia-wordmark-light.svg',
		alt: 'Nvidia wordmark',
	},
	{
		name: 'Supabase',
		src: 'https://svgl.app/library/supabase_wordmark_light.svg',
		alt: 'Supabase wordmark',
	},
	{
		name: 'OpenAI',
		src: 'https://svgl.app/library/openai_wordmark_light.svg',
		alt: 'OpenAI wordmark',
	},
	{
		name: 'Turso',
		src: 'https://svgl.app/library/turso-wordmark-light.svg',
		alt: 'Turso wordmark',
	},
	{
		name: 'Vercel',
		src: 'https://svgl.app/library/vercel_wordmark.svg',
		alt: 'Vercel wordmark',
	},
	{
		name: 'GitHub',
		src: 'https://svgl.app/library/github_wordmark_light.svg',
		alt: 'GitHub wordmark',
	},
	{
		name: 'Claude AI',
		src: 'https://svgl.app/library/claude-ai-wordmark-icon_light.svg',
		alt: 'Claude AI wordmark',
	},
	{
		name: 'Clerk',
		src: 'https://svgl.app/library/clerk-wordmark-light.svg',
		alt: 'Clerk wordmark',
	},
] as const;

const MARQUEE_LOGOS = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS] as const;

const AboutLogoCloudSection = () => {
	const { t } = useTranslation('about');

	return (
		<section className={'about-logo-cloud'} aria-labelledby={'about-logo-cloud-title'}>
			<div className={'container'}>
				<header className={'logo-cloud-heading'}>
					<h2 id={'about-logo-cloud-title'}>{t('logo_cloud_title')}</h2>
					<p>{t('logo_cloud_subtitle')}</p>
				</header>

				<div className={'logo-cloud-stage'}>
					<div className={'logo-cloud-strip'} aria-label={t('logo_cloud_aria')}>
						<div className={'logo-cloud-track'}>
							{MARQUEE_LOGOS.map((logo, index) => (
								<article className={'logo-cloud-card'} key={`${logo.name}-${index}`}>
									<img
										src={logo.src}
										alt={logo.alt}
										loading={'lazy'}
									/>
								</article>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AboutLogoCloudSection;
