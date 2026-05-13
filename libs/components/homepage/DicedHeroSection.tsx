import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { ChronicleButton } from '../common/ChronicleButton';

interface SlideItem {
	title: string;
	image: string;
}

interface MainTextStyle {
	fontSize?: string;
	gradient?: string;
	color?: string;
}

interface ButtonStyle {
	backgroundColor?: string;
	color?: string;
	borderRadius?: string;
	hoverColor?: string;
	hoverForeground?: string;
}

interface DicedHeroSectionProps {
	topText: string;
	mainText: string;
	subMainText: string;
	buttonText: string;
	slides: SlideItem[];
	onMainButtonClick?: () => void;
	topTextStyle?: React.CSSProperties;
	mainTextStyle?: MainTextStyle;
	subMainTextStyle?: React.CSSProperties;
	buttonStyle?: ButtonStyle;
	separatorColor?: string;
	mobileBreakpoint?: number;
	fontFamily?: string;
}

const DicedHeroSection = ({
	topText,
	mainText,
	subMainText,
	buttonText,
	slides,
	onMainButtonClick,
	topTextStyle,
	mainTextStyle,
	subMainTextStyle,
	buttonStyle,
	separatorColor = '#2E86DE',
	mobileBreakpoint = 1000,
	fontFamily = 'Inter, -apple-system, sans-serif',
}: DicedHeroSectionProps) => {
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const styleId = 'diced-hero-styles';
		if (document.getElementById(styleId)) return;
		const style = document.createElement('style');
		style.id = styleId;
		style.innerHTML = `
			.warped-image {
				--r: 32px;
				--s: 50px;
				--x: 25px;
				--y: 5px;
			}
			.top-right {
				--_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%,#0000 72%);
				--_g: conic-gradient(at calc(100% - var(--r)) var(--r),#0000 25%,#000 0);
				--_d: (var(--s) + var(--r));
				mask:
					calc(100% - var(--_d) - var(--x)) 0 var(--_m),
					100% calc(var(--_d) + var(--y)) var(--_m),
					radial-gradient(var(--s) at 100% 0,#0000 99%,#000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(var(--r) + var(--y)),
					var(--_g) calc(-1*var(--_d) - var(--x)) 0,
					var(--_g) 0 calc(var(--_d) + var(--y));
				mask-repeat: no-repeat;
			}
			.top-left {
				--_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%,#0000 72%);
				--_g: conic-gradient(at var(--r) var(--r),#000 75%,#0000 0);
				--_d: (var(--s) + var(--r));
				mask:
					calc(var(--_d) + var(--x)) 0 var(--_m),
					0 calc(var(--_d) + var(--y)) var(--_m),
					radial-gradient(var(--s) at 0 0,#0000 99%,#000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(var(--r) + var(--y)),
					var(--_g) calc(var(--_d) + var(--x)) 0,
					var(--_g) 0 calc(var(--_d) + var(--y));
				mask-repeat: no-repeat;
			}
			.bottom-left {
				--_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%,#0000 72%);
				--_g: conic-gradient(from 180deg at var(--r) calc(100% - var(--r)),#0000 25%,#000 0);
				--_d: (var(--s) + var(--r));
				mask:
					calc(var(--_d) + var(--x)) 100% var(--_m),
					0 calc(100% - var(--_d) - var(--y)) var(--_m),
					radial-gradient(var(--s) at 0 100%,#0000 99%,#000 calc(100% + 1px)) calc(var(--r) + var(--x)) calc(-1*var(--r) - var(--y)),
					var(--_g) calc(var(--_d) + var(--x)) 0,
					var(--_g) 0 calc(-1*var(--_d) - var(--y));
				mask-repeat: no-repeat;
			}
			.bottom-right {
				--_m: /calc(2*var(--r)) calc(2*var(--r)) radial-gradient(#000 70%,#0000 72%);
				--_g: conic-gradient(from 90deg at calc(100% - var(--r)) calc(100% - var(--r)),#0000 25%,#000 0);
				--_d: (var(--s) + var(--r));
				mask:
					calc(100% - var(--_d) - var(--x)) 100% var(--_m),
					100% calc(100% - var(--_d) - var(--y)) var(--_m),
					radial-gradient(var(--s) at 100% 100%,#0000 99%,#000 calc(100% + 1px)) calc(-1*var(--r) - var(--x)) calc(-1*var(--r) - var(--y)),
					var(--_g) calc(-1*var(--_d) - var(--x)) 0,
					var(--_g) 0 calc(-1*var(--_d) - var(--y));
				mask-repeat: no-repeat;
			}
		`;
		document.head.appendChild(style);
	}, []);

	const normalizedSlides = Array.from({ length: 4 }).map((_, index) => {
		const source = slides[index] || slides[index % slides.length];
		return source;
	});
	const warpedSlides = [
		{ slide: normalizedSlides[3], className: 'warped-image bottom-right' },
		{ slide: normalizedSlides[2], className: 'warped-image bottom-left' },
		{ slide: normalizedSlides[1], className: 'warped-image top-right' },
		{ slide: normalizedSlides[0], className: 'warped-image top-left' },
	];

	const titleStyle: React.CSSProperties = {
		fontSize: mainTextStyle?.fontSize || '4rem',
		fontWeight: 800,
		lineHeight: 1,
		margin: 0,
		fontFamily,
		color: mainTextStyle?.color || '#1A1A2E',
		background: mainTextStyle?.gradient,
		WebkitBackgroundClip: mainTextStyle?.gradient ? 'text' : undefined,
		WebkitTextFillColor: mainTextStyle?.gradient ? 'transparent' : undefined,
	};

	return (
		<div
			style={{
				width: '100%',
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '0 40px',
				paddingTop: '60px',
				paddingBottom: '60px',
				fontFamily,
				boxSizing: 'border-box',
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				alignItems={'stretch'}
				spacing={0}
				sx={{
					gap: '40px',
					padding: 0,
					'@media (max-width: 1000px)': {
						flexDirection: 'column',
					},
				}}
			>
				<motion.div
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					style={{ flex: 1, minWidth: 0 }}
				>
					<div style={{ color: '#64748B', fontSize: '16px', fontWeight: 600, ...topTextStyle }}>{topText}</div>
					<div style={{ marginTop: '8px' }}>
						<h2 style={titleStyle}>{mainText}</h2>
					</div>
					<div
						style={{
							width: '72px',
							height: '4px',
							borderRadius: '9999px',
							backgroundColor: separatorColor,
							margin: '24px 0 20px',
						}}
					/>
					<p
						style={{
							margin: 0,
							fontSize: '16px',
							lineHeight: 1.8,
							maxWidth: '620px',
							color: '#1A1A2E',
							...subMainTextStyle,
						}}
					>
						{subMainText}
					</p>
					<div style={{ marginTop: '28px' }}>
						<ChronicleButton
							text={buttonText}
							onClick={onMainButtonClick}
							style={{
								backgroundColor: buttonStyle?.backgroundColor || '#1B3A6B',
								color: buttonStyle?.color || '#ffffff',
								borderRadius: buttonStyle?.borderRadius || '8px',
								hoverColor: buttonStyle?.hoverColor,
								hoverForeground: buttonStyle?.hoverForeground,
							}}
						/>
					</div>
				</motion.div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '12px',
						}}
					>
						{warpedSlides.map(({ slide, className }, index) => {
							return (
								<motion.div
									key={`${slide.title}-${index}`}
									initial={{ opacity: 0, y: 30, x: -20 }}
									animate={{ opacity: 1, y: 0, x: 0 }}
									transition={{ delay: index * 0.15, duration: 0.65, ease: 'easeOut' }}
									className={className}
									style={{
										position: 'relative',
										height: '220px',
										borderRadius: '32px',
										backgroundImage: `url(${slide.image})`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										overflow: 'hidden',
									}}
								>
									<div
										style={{
											position: 'absolute',
											left: 0,
											right: 0,
											bottom: 0,
											height: '45%',
											background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(7,12,22,0.82) 100%)',
										}}
									/>
									<div
										style={{
											position: 'absolute',
											left: '14px',
											right: '14px',
											bottom: '12px',
											color: '#ffffff',
											fontSize: '15px',
											fontWeight: 700,
											textShadow: '0 2px 8px rgba(0,0,0,0.35)',
											zIndex: 2,
										}}
									>
										{slide.title}
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>
			</Stack>
		</div>
	);
};

export default DicedHeroSection;
