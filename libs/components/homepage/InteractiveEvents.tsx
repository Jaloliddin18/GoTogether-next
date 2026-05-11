import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface EventOption {
	title: string;
	description: string;
	image: string;
	icon: React.ReactNode;
}

const EVENT_IMAGES: string[] = [
	'/img/events/BUSAN.webp',
	'/img/events/DAEGU.webp',
	'/img/events/INCHEON.webp',
	'/img/events/SEOUL.webp',
];

const InteractiveEvents = () => {
	const device = useDeviceDetect();
	const [activeIndex, setActiveIndex] = useState(0);
	const [revealedPanels, setRevealedPanels] = useState<boolean[]>([false, false, false, false]);

	const eventOptions: EventOption[] = useMemo(
		() => [
			{
				title: 'Book Fair 2026',
				description: 'Explore hundreds of new arrivals and exclusive titles at our annual book fair',
				image: EVENT_IMAGES[0] ?? '/img/events/BUSAN.webp',
				icon: <MenuBookIcon sx={{ color: '#fff', fontSize: 22 }} />,
			},
			{
				title: 'Reading Marathon',
				description: 'Join our 24-hour reading challenge and win exciting library rewards',
				image: EVENT_IMAGES[1] ?? EVENT_IMAGES[0] ?? '/img/events/BUSAN.webp',
				icon: <EmojiEventsIcon sx={{ color: '#fff', fontSize: 22 }} />,
			},
			{
				title: 'Author Meet & Greet',
				description: 'Meet your favorite authors in person and get your books signed',
				image: EVENT_IMAGES[2] ?? EVENT_IMAGES[0] ?? '/img/events/BUSAN.webp',
				icon: <RecordVoiceOverIcon sx={{ color: '#fff', fontSize: 22 }} />,
			},
			{
				title: 'Robot Demo Day',
				description: 'Watch our autonomous delivery robot in action and learn how it works',
				image: EVENT_IMAGES[3] ?? EVENT_IMAGES[0] ?? '/img/events/BUSAN.webp',
				icon: <SmartToyIcon sx={{ color: '#fff', fontSize: 22 }} />,
			},
		],
		[],
	);

	useEffect(() => {
		const timers: NodeJS.Timeout[] = [];
		eventOptions.forEach((_, index) => {
			const timer = setTimeout(() => {
				setRevealedPanels((prev) => {
					const next = [...prev];
					next[index] = true;
					return next;
				});
			}, index * 180);
			timers.push(timer);
		});

		return () => timers.forEach((timer) => clearTimeout(timer));
	}, [eventOptions]);

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	}

	return (
		<Stack className={'events'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'white'}>Events</span>
						<p className={'white'}>Library experiences waiting for you</p>
					</Box>
				</Stack>
				<div className={'interactive-events-wrap'}>
					{eventOptions.map((event, index) => {
						const isActive = activeIndex === index;
						const isRevealed = revealedPanels[index];
						return (
							<div
								key={event.title}
								className={`interactive-events-panel ${isActive ? 'active' : ''} ${isRevealed ? 'revealed' : ''}`}
								style={{ backgroundImage: `url(${event.image})` }}
								onClick={() => setActiveIndex(index)}
							>
								<div className={'interactive-events-shadow'} />
								<div className={'interactive-events-label'}>
									<div className={'interactive-events-icon'}>{event.icon}</div>
									<div className={`interactive-events-info ${isActive ? 'active' : ''}`}>
										<div className={'interactive-events-title'}>{event.title}</div>
										<div className={'interactive-events-desc'}>{event.description}</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</Stack>
		</Stack>
	);
};

export default InteractiveEvents;
