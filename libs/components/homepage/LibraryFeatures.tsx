import React from 'react';
import { motion } from 'framer-motion';

const LIBRARY_FEATURES = [
	{
		name: "Notion",
		description: "Send submissions to Notion.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/notion-2.svg",
	},
	{
		name: "Google Sheets",
		description: "Send submissions to a sheet.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/google-sheets-logo-icon.svg",
	},
	{
		name: "Airtable",
		description: "Send submissions to Airtable.",
		iconSrc:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAjVBMVEVHcEz+uwD9tQDtnB/9tQD9tAD8tAD/tAD+tQD+tQD+tgD9tQD9tAD9tgDfJ1a8IEi6EEv/uAD9tAD9tQAOwP8Xv/8YwP/5K2DnJ1m5H0e6IEe8HUnxJ2AXwP8Wv/8Yv/8Yv/8YwP/5K2DDIUv9tQANx/8OwP8YwP8Uwv8UwP/WJFK9IEnAIEj5LGD5K2Cg/8aNAAAAL3RSTlMAJmwOVdb/HoR9NKfqiK7GUke6t1XEueL//+yMLzOT9v/h//+5D1zdJpr/mkSwqkV2VRMAAADASURBVHgBvc5FFgJBEATRxN3G3d3ufzxacGqWENv/SvCHJtPphJbZfLFkLeazL1qtBQmerN5ou1u+tdveZTbdL7/aTyVul2QTqZPD/mtwvRJ0PJ2Bi/JK6gXQdIOhadmO62G2WdyfncEPwiiKOSZWattiPNvv2VBe6BGvFJgkTNn4DKyqZkNvmDQ2r0VeSnhDoacOfkRhYjEC/JDC3gNGcGBEoyACYwAeIxINiAgM6wojqBc5QGIY+CCrQkPDr7sCTOYgaxntCWQAAAAASUVORK5CYII=",
	},
	{
		name: "Webhooks",
		description: "Send events for new submissions to HTTP endpoints.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/webhooks.svg",
	},
	{
		name: "Slack",
		description: "Send Slack messages for new submissions.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
	},
	{
		name: "Coda",
		description: "Send submissions to Coda.",
		iconSrc:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAiklEQVR4AWNwL/ChKx5YC79khSQC8X8q40SsFgIlOEAKaIQ5sFkoQ0MLZYa9hfyjFpKKDwNxIBBrQ3EdbVIpZj5DNo8f6pDDID61LKwjoZSh3EKQPnpa+HA4W4hIffS2cA6dLCScUqH58SEIU9FCRHxCM3sgFM8ZLUtpbuFIqfHp34iifzNx+Le8AdWFLhdVBCcKAAAAAElFTkSuQmCC",
	},
	{
		name: "Google Analytics",
		description: "Analyze traffic sources, visitor behavior and time spent.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/google-analytics-3.svg",
	},
	{
		name: "Meta Pixel",
		description: "Measure and optimize your ad campaigns.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/meta-3.svg",
	},
	{
		name: "Zapier",
		description: "Send submissions to your favorite tools.",
		iconSrc: "https://cdn.worldvectorlogo.com/logos/zapier.svg",
	},
	{
		name: "Make",
		description: "Send submissions to your favorite tools.",
		iconSrc:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAwFBMVEX//////f/RY/LKYvDy4PvZwPF3ANGPTNeqhN/n3PVqAMuLS9X33/3GAO++GuyxAOnId/DFoOqEFtV+INLMteuDPdPhYPfNDvHEIu7UkvOsbOOJINeEJ9Tt4/jbAPXXF/SSGduTKdvxW/vnDvnbivT49PyQANuZW9v/2//yAPzpzPmHGNe6keb/Vf/mhvjNmu//AP+5ZumnJeWDANfzhPz/0//37f2jAOSnVeL/g//lxPfCjev/Sf+3TurZuPKIMda9K89qAAAAt0lEQVR4Ad3QAQfCYBDG8f9tu7e3WVRUBUCRCFDfH4gAAhkgCKWoNmZZTcy26QvswXF+nsPR3sifxRFJVfKAvAC8wgL5JfYj8Gvoi0R+jt2ouFUUrUXOxmBPaQPHSjaam++AXMtnl5KAaEpfoN5UyCahJnBs4NLtGI1xhtgp6yCtoAKDEIHrSWrNjQsdh62STYFZBT2gu8eDoQsP1mXcacAF7kafLvTsYVX97XYPgPfOWAy4hbQrHxHNJ3cZ8ThmAAAAAElFTkSuQmCC",
	},
	{
		name: "Pipedream",
		description: "Send submissions to your favorite tools.",
		iconSrc:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAAMFBMVEUz0ow004s00os00osz0Ywr0Ygc0INC1ZJV2Zxw3qrN8+GJ5buw7dD////i+e+i6ccrH71KAAAABXRSTlMIiuv/iksBsyIAAACfSURBVHgBY2BUNoYDIwcGZ2MkYMgAkkRIMwAJ07Tg0IowMB/EjVy1ddeqNa0wbvTdV3fv3l2B4ILALSTuvXV3706Fc++1pa+9ewzOvW9suvfuMmTuvLvPULnX8HKf4TLqTmn4WSSL7p6cf/duK5Ij3yI7EgReIrh3/t5904zg3jevKDZG4gJJXFzLV6+RueYd7XCuMigo4QGLFuxokQIA5VCQSPPORxwAAAAASUVORK5CYII=",
	},
	{
		name: "And many more",
		description: "Integrate with thousands of tools using Zapier, Make or Pipedream.",
		iconSrc: "https://img.icons8.com/ios-glyphs/60/plus-math.png",
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const headingText = 'Connect your ~favorite~ tools';
const renderHeading = () => {
	const [before = '', highlighted = '', after = ''] = headingText.split('~');

	return (
		<h2
			style={{
				fontSize: '36px',
				fontWeight: 700,
				color: '#0f172a',
				lineHeight: 1.2,
				margin: '0 0 16px 0',
			}}
		>
			{before}
			<span style={{ position: 'relative', display: 'inline' }}>
				{highlighted}
				<svg
					aria-hidden="true"
					viewBox="0 0 418 42"
					style={{
						position: 'absolute',
						bottom: -6,
						left: 0,
						width: '100%',
						height: 'auto',
						color: '#2563eb',
					}}
					preserveAspectRatio="none"
				>
					<path
						d="M203.371.916c-26.013-2.078-76.686 1.98-114.243 8.919-37.556 6.939-78.622 17.103-122.256 28.703-43.633 11.6-4.984 14.306 43.123 7.021 48.107-7.285 93.638-16.096 146.446-17.742 52.808-1.646 105.706 5.429 158.649 14.13 52.943 8.701 105.886 19.342 158.826 29.483 52.94 10.141 52.94 10.141-11.41-19.043C371.18 14.363 322.753 5.488 281.339 2.143 239.925-1.201 203.371.916 203.371.916z"
						fill="currentColor"
					/>
				</svg>
			</span>
			{after}
		</h2>
	);
};

const LibraryFeatures = () => {
	return (
		<section style={{ width: '100%', backgroundColor: '#ffffff', padding: '80px 0' }}>
			<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						gap: '48px',
						alignItems: 'flex-start',
						marginBottom: '56px',
					}}
				>
					<div style={{ flex: 1 }}>
						<p
							style={{
								fontSize: '11px',
								fontWeight: 600,
								letterSpacing: '0.1em',
								color: '#2563eb',
								textTransform: 'uppercase',
								margin: '0 0 12px 0',
							}}
						>
							SMART LIBRARY SERVICES
						</p>
						{renderHeading()}
						<p
							style={{
								fontSize: '16px',
								color: '#64748b',
								lineHeight: 1.6,
								margin: 0,
							}}
						>
							Save time using popular integrations to sync your form submissions.
						</p>
					</div>
						<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<img
								src="https://illustrations.popsy.co/blue/studying.svg"
								alt="Smart library illustration"
								style={{
									width: '280px',
									height: 'auto',
								objectFit: 'contain',
								borderRadius: '12px',
							}}
						/>
					</div>
				</div>

				<motion.div
					style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px 32px' }}
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
				>
					{LIBRARY_FEATURES.map((item) => (
						<motion.div
							key={item.name}
							variants={itemVariants}
							style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '16px' }}
						>
							<div
								style={{
									width: '40px',
									height: '40px',
									flexShrink: 0,
									backgroundColor: '#eff6ff',
									borderRadius: '10px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									padding: '8px',
								}}
							>
								<img src={item.iconSrc} alt={item.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
							</div>
							<div>
								<p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>{item.name}</p>
								<p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{item.description}</p>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default LibraryFeatures;
