import React from 'react';
import Link from 'next/link';

const BOOK_DONORS = [
	{ id: '1', name: 'Jaloliddin K.', image: '/img/donor/donor.jpg' },
	{ id: '2', name: 'Akhror T.', image: '/img/donor/donor.jpg' },
	{ id: '3', name: 'Aziz M.', image: '/img/donor/donor.jpg' },
	{ id: '4', name: 'Jahongir U.', image: '/img/donor/donor.jpg' },
	{ id: '5', name: 'Ibohim S.', image: '/img/donor/donor.jpg' },
];

const ORBIT_RADIUS = 240;

const OrbitingAvatarsCTA = () => {
	return (
		<section
			style={{
				width: '100%',
				minHeight: '600px',
				paddingTop: '80px',
				paddingBottom: '80px',
				background: '#ffffff',
				position: 'relative',
				overflow: 'visible',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)',
				}}
			/>

			<div
				style={{
					position: 'absolute',
					inset: 0,
					overflow: 'hidden',
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: '380px',
						height: '380px',
						border: '1px dashed rgba(0,0,0,0.15)',
						borderRadius: '50%',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: '560px',
						height: '560px',
						border: '1px dashed rgba(0,0,0,0.15)',
						borderRadius: '50%',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				/>

				<div
					style={{
						position: 'absolute',
						inset: 0,
						animation: 'orbit 40s linear infinite',
					}}
				>
					{BOOK_DONORS.map((donor, i) => {
						const angle = (i / BOOK_DONORS.length) * 2 * Math.PI;
						const x = Math.cos(angle) * ORBIT_RADIUS;
						const y = Math.sin(angle) * ORBIT_RADIUS;

						return (
							<div
								key={donor.id}
								style={{
									position: 'absolute',
									left: '50%',
									top: '50%',
									transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<img
									src={donor.image}
									alt={donor.name}
									style={{
										width: '64px',
										height: '64px',
										borderRadius: '50%',
										objectFit: 'cover',
										border: '2px solid rgba(0,0,0,0.25)',
										boxShadow: '0 0 0 4px rgba(37,99,235,0.2)',
										animation: 'counter-orbit 40s linear infinite',
									}}
								/>
								<span
									style={{
										fontSize: '12px',
										fontWeight: 500,
										color: 'rgba(0,0,0,0.8)',
										textAlign: 'center',
										marginTop: '6px',
										whiteSpace: 'nowrap',
										animation: 'counter-orbit 40s linear infinite',
									}}
								>
									{donor.name}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			<div
				style={{
					position: 'relative',
					zIndex: 10,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '16px',
					textAlign: 'center',
					padding: '0 24px',
				}}
			>
				<span
					style={{
						fontSize: '11px',
						letterSpacing: '0.12em',
						color: 'rgba(0,0,0,0.55)',
						textTransform: 'uppercase',
						marginBottom: '4px',
					}}
				>
					LIBRARY PATRONS
				</span>
				<h2
					style={{
						margin: 0,
						fontSize: '40px',
						fontWeight: 700,
						color: '#000000',
						lineHeight: 1.2,
						marginBottom: '12px',
						fontFamily: 'inherit',
					}}
				>
					Support Our Library
				</h2>
				<p
					style={{
						margin: 0,
						fontSize: '15px',
						color: 'rgba(0,0,0,0.65)',
						maxWidth: '360px',
						lineHeight: 1.6,
					}}
				>
					Our community members who donated books to INHA University Library
				</p>
				<Link
					href={'/library/donate'}
					style={{
						background: '#2563eb',
						color: '#ffffff',
						border: 'none',
						borderRadius: '10px',
						padding: '13px 32px',
						fontSize: '15px',
						fontWeight: 600,
						letterSpacing: '0.02em',
						marginTop: '8px',
						cursor: 'pointer',
						textDecoration: 'none',
						display: 'inline-block',
					}}
					onMouseEnter={(event) => {
						event.currentTarget.style.background = '#1d4ed8';
					}}
					onMouseLeave={(event) => {
						event.currentTarget.style.background = '#2563eb';
					}}
				>
					Donate a Book
				</Link>
			</div>

			<style>{`
				@keyframes orbit {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}

				@keyframes counter-orbit {
					from { transform: rotate(0deg); }
					to { transform: rotate(-360deg); }
				}
			`}</style>
		</section>
	);
};

export default OrbitingAvatarsCTA;
