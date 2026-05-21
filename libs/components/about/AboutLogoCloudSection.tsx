import React, { useMemo, useState } from 'react';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

const LOGOS = [
	{
		name: 'Nvidia',
		src: 'https://svgl.app/library/nvidia-wordmark-light.svg',
		alt: 'Nvidia wordmark',
		needsInvert: true,
	},
	{
		name: 'Supabase',
		src: 'https://svgl.app/library/supabase_wordmark_light.svg',
		alt: 'Supabase wordmark',
		needsInvert: true,
	},
	{
		name: 'OpenAI',
		src: 'https://svgl.app/library/openai_wordmark_light.svg',
		alt: 'OpenAI wordmark',
		needsInvert: true,
	},
	{
		name: 'Turso',
		src: 'https://svgl.app/library/turso-wordmark-light.svg',
		alt: 'Turso wordmark',
		needsInvert: true,
	},
	{
		name: 'Vercel',
		src: 'https://svgl.app/library/vercel_wordmark.svg',
		alt: 'Vercel wordmark',
		needsInvert: false,
	},
	{
		name: 'GitHub',
		src: 'https://svgl.app/library/github_wordmark_light.svg',
		alt: 'GitHub wordmark',
		needsInvert: true,
	},
	{
		name: 'Claude AI',
		src: 'https://svgl.app/library/claude-ai-wordmark-icon_light.svg',
		alt: 'Claude AI wordmark',
		needsInvert: true,
	},
	{
		name: 'Clerk',
		src: 'https://svgl.app/library/clerk-wordmark-light.svg',
		alt: 'Clerk wordmark',
		needsInvert: true,
	},
] as const;

const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;

const AboutLogoCloudSection = () => {
	const [activeIndex, setActiveIndex] = useState(2);

	const visibleLogos = useMemo(
		() =>
			VISIBLE_OFFSETS.map((offset, position) => {
				const index = (activeIndex + offset + LOGOS.length) % LOGOS.length;
				return {
					logo: LOGOS[index],
					offset,
					position,
				};
			}),
		[activeIndex],
	);

	const handlePrevious = () => {
		setActiveIndex((current) => (current - 1 + LOGOS.length) % LOGOS.length);
	};

	const handleNext = () => {
		setActiveIndex((current) => (current + 1) % LOGOS.length);
	};

	return (
		<section className={'about-logo-cloud'} aria-labelledby={'about-logo-cloud-title'}>
			<div className={'container'}>
				<header className={'logo-cloud-heading'}>
					<span>Already used by</span>
					<h2 id={'about-logo-cloud-title'}>Best in the Game</h2>
				</header>

				<div className={'logo-cloud-stage'}>
					<button
						className={'logo-cloud-arrow logo-cloud-arrow-left'}
						type={'button'}
						aria-label={'Show previous logo'}
						onClick={handlePrevious}
					>
						<KeyboardArrowLeftRoundedIcon />
					</button>

					<div className={'logo-cloud-strip'} aria-label={'Modern technology ecosystem logos'}>
						<div className={'logo-cloud-row'}>
							{visibleLogos.map(({ logo, offset, position }) => (
								<article
									className={`logo-cloud-card logo-pos-${position}${offset === 0 ? ' is-center' : ''}`}
									key={`${logo.name}-${position}`}
								>
									<img
										className={logo.needsInvert ? 'needs-invert' : ''}
										src={logo.src}
										alt={logo.alt}
										loading={'lazy'}
									/>
								</article>
							))}
						</div>
					</div>

					<button
						className={'logo-cloud-arrow logo-cloud-arrow-right'}
						type={'button'}
						aria-label={'Show next logo'}
						onClick={handleNext}
					>
						<KeyboardArrowRightRoundedIcon />
					</button>
				</div>
			</div>
		</section>
	);
};

export default AboutLogoCloudSection;
