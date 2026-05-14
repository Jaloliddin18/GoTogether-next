import React from 'react';
import Link from 'next/link';

const BOOK_DONORS = [
	{ id: '1', name: ' Stephan King', image: '/img/profile/writer2.jpg' },
	{ id: '2', name: 'George Saunders', image: '/img/profile/writer3.jpg' },
	{ id: '3', name: 'J.K Rowling', image: '/img/profile/writer4.jpg' },
	{ id: '4', name: 'Mark Manson.', image: '/img/profile/writer5.jpg' },
	{ id: '5', name: 'Naomi Wolf.', image: '/img/profile/writer6.jpg' },
];

const ORBIT_RADIUS = 260;

const OrbitingAvatarsCTA = () => {
	return (
		<section
					style={{
						width: '100%',
						minHeight: '680px',
						paddingTop: '0px',
						paddingBottom: '0px',
						background: '#ffffff',
						position: 'relative',
						overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
				justifyContent: 'center',
			}}
		>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)',
					}}
				/>
					<svg
						aria-hidden="true"
						width="160"
						height="160"
						viewBox="0 0 160 160"
						style={{
							position: 'absolute',
							top: 24,
							left: 24,
							opacity: 0.5,
							pointerEvents: 'none',
							zIndex: 0,
						}}
					>
						<circle cx="20" cy="20" r="16" fill="#2563eb" opacity="0.15"/>
						<circle cx="60" cy="10" r="8" fill="#2563eb" opacity="0.2"/>
						<circle cx="100" cy="30" r="5" fill="#2563eb" opacity="0.25"/>
						<circle cx="10" cy="70" r="6" fill="#2563eb" opacity="0.2"/>
						<circle cx="40" cy="90" r="20" fill="#2563eb" opacity="0.08"/>
						<circle cx="130" cy="15" r="3" fill="#2563eb" opacity="0.3"/>
						<circle cx="80" cy="60" r="4" fill="#2563eb" opacity="0.2"/>
						<circle cx="150" cy="60" r="8" fill="#2563eb" opacity="0.12"/>
						<rect x="50" y="40" width="12" height="12" rx="3" fill="#2563eb" opacity="0.15" transform="rotate(20 56 46)"/>
						<rect x="110" y="70" width="8" height="8" rx="2" fill="#2563eb" opacity="0.2" transform="rotate(35 114 74)"/>
					</svg>
					<svg
						aria-hidden="true"
						width="160"
						height="160"
						viewBox="0 0 160 160"
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							overflow: 'hidden',
							opacity: 0.5,
							pointerEvents: 'none',
							zIndex: 0,
						}}
					>
						<circle cx="140" cy="140" r="20" fill="#2563eb" opacity="0.12"/>
						<circle cx="100" cy="150" r="8" fill="#2563eb" opacity="0.2"/>
						<circle cx="150" cy="100" r="6" fill="#2563eb" opacity="0.25"/>
						<circle cx="120" cy="110" r="14" fill="#2563eb" opacity="0.08"/>
						<circle cx="70" cy="140" r="4" fill="#2563eb" opacity="0.2"/>
						<circle cx="30" cy="150" r="10" fill="#2563eb" opacity="0.15"/>
						<circle cx="10" cy="120" r="5" fill="#2563eb" opacity="0.2"/>
						<rect x="80" y="100" width="14" height="14" rx="3" fill="#2563eb" opacity="0.15" transform="rotate(15 87 107)"/>
						<rect x="40" y="120" width="9" height="9" rx="2" fill="#2563eb" opacity="0.2" transform="rotate(30 44 124)"/>
						<line x1="60" y1="160" x2="160" y2="60" stroke="#2563eb" strokeWidth="1" opacity="0.1"/>
					</svg>

				<div
					style={{
						position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					overflow: 'visible',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'visible',
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
							animation: 'orbit linear infinite 40s',
						}}
					>
						{BOOK_DONORS.map((donor, i) => {
							const angle = (i / BOOK_DONORS.length) * 2 * Math.PI;
							const x = Math.round(Math.cos(angle) * ORBIT_RADIUS * 100) / 100;
							const y = Math.round(Math.sin(angle) * ORBIT_RADIUS * 100) / 100;

							return (
								<div
									key={donor.id}
									style={{
										position: 'absolute',
										left: '50%',
										top: '50%',
										transform: `translate(calc(${x}px - 28px), calc(${y}px - 28px))`,
									}}
								>
									<div
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '6px',
											animation: 'counter-orbit linear infinite 40s',
										}}
									>
										<img
											src={donor.image}
											alt={donor.name}
											style={{
												width: '56px',
												height: '56px',
												borderRadius: '50%',
												objectFit: 'cover',
											}}
										/>
										<p
											style={{
												fontSize: '11px',
												fontWeight: 500,
												color: 'rgba(255,255,255,0.9)',
												textAlign: 'center',
												whiteSpace: 'nowrap',
												margin: 0,
												backgroundColor: 'rgba(0,0,0,0.25)',
												borderRadius: '4px',
												padding: '2px 8px',
											}}
										>
											{donor.name}
										</p>
									</div>
								</div>
							);
						})}
					</div>
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
