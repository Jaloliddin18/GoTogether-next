import React from 'react';

const AboutArchitectureSection = () => {
	return (
		<section className={'about-architecture-section'} aria-labelledby={'about-architecture-title'}>
			<div className={'container'}>
				<header className={'architecture-heading'}>
					<span className={'architecture-eyebrow'}>System Architecture</span>
					<h2 id={'about-architecture-title'}>From book request to robot delivery</h2>
					<p>같이Go architecture diagram for the end-to-end prototype flow.</p>
				</header>

				<div className={'arch-diagram-block'}>
					<img
						src={'/img/robot/architecture.png'}
						alt={'같이Go System Architecture Diagram'}
						className={'arch-diagram-img'}
					/>
				</div>
			</div>
		</section>
	);
};

export default AboutArchitectureSection;
