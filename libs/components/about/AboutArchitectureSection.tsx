import React from 'react';
import { useTranslation } from 'next-i18next';

const AboutArchitectureSection = () => {
	const { t } = useTranslation('about');

	return (
		<section className={'about-architecture-section'} aria-labelledby={'about-architecture-title'}>
			<div className={'container'}>
				<header className={'architecture-heading'}>
					<span className={'architecture-eyebrow'}>{t('architecture_eyebrow')}</span>
					<h2 id={'about-architecture-title'}>{t('architecture_title')}</h2>
					<p>{t('architecture_desc')}</p>
				</header>

				<div className={'arch-diagram-block'}>
					<img
						src={'/img/robot/architecture.png'}
						alt={t('architecture_diagram_alt')}
						className={'arch-diagram-img'}
					/>
				</div>
			</div>
		</section>
	);
};

export default AboutArchitectureSection;
