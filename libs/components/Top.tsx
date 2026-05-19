import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import {
	getRobotTrackingWsUrl,
	joinRobotRequestRoom,
	loadTrackingRequests,
	parseTrackingEnvelope,
	ROBOT_TRACKING_REQUEST_EVENT,
	RobotTrackingRequest,
} from '../library/ws/trackingClient';
import {
	createRobotNotification,
	getRobotNotificationTitle,
	loadRobotNotifications,
	RobotNotification,
	saveRobotNotifications,
} from '../library/ws/trackingEvents';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
	const [robotNotifications, setRobotNotifications] = useState<RobotNotification[]>([]);
	const [trackingRequests, setTrackingRequests] = useState<RobotTrackingRequest[]>([]);
	const [trackingConnected, setTrackingConnected] = useState<boolean>(false);
	const robotSocketRef = useRef<WebSocket | null>(null);
	const joinedRequestIdsRef = useRef<Set<string>>(new Set<string>());

	const addRobotNotification = useCallback((notification: RobotNotification) => {
		setRobotNotifications((prev) => {
			if (prev.some((item) => item.id === notification.id)) return prev;
			const next = [...prev, notification].slice(-30);
			saveRobotNotifications(next);
			return next;
		});
	}, []);

	const changeNavbarColor = useCallback(() => {
		setColorChange(window.scrollY >= 50);
	}, []);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		setBgColor(router.pathname === '/books/detail');
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('scroll', changeNavbarColor);
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, [changeNavbarColor]);

	useEffect(() => {
		setTrackingRequests(loadTrackingRequests());
		setRobotNotifications(loadRobotNotifications());
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleTrackingRequest = (event: Event) => {
			const detail = (event as CustomEvent<RobotTrackingRequest>).detail;
			if (!detail?.requestId) return;

			setTrackingRequests(loadTrackingRequests());
			addRobotNotification({
				id: `${detail.requestId}-local-${detail.status ?? 'ASSIGNED'}-${detail.createdAt ?? new Date().toISOString()}`,
				requestId: detail.requestId,
				title: getRobotNotificationTitle(detail.status ?? 'ASSIGNED'),
				status: detail.status ?? 'ASSIGNED',
				message: detail.bookTitle ? `${detail.bookTitle} request is now active.` : 'Delivery request is now active.',
				timestamp: detail.createdAt ?? new Date().toISOString(),
				event: 'localRequest',
			});
		};

		window.addEventListener(ROBOT_TRACKING_REQUEST_EVENT, handleTrackingRequest);
		return () => window.removeEventListener(ROBOT_TRACKING_REQUEST_EVENT, handleTrackingRequest);
	}, [addRobotNotification]);

	useEffect(() => {
		if (typeof window === 'undefined' || trackingRequests.length === 0) return;

		const joinRequests = (socket: WebSocket) => {
			trackingRequests.forEach((request) => {
				if (!request.requestId || joinedRequestIdsRef.current.has(request.requestId)) return;
				joinRobotRequestRoom(socket, request.requestId);
				joinedRequestIdsRef.current.add(request.requestId);
			});
		};

		const existingSocket = robotSocketRef.current;
		if (existingSocket?.readyState === WebSocket.OPEN) {
			joinRequests(existingSocket);
			return;
		}

		if (existingSocket?.readyState === WebSocket.CONNECTING) return;

		let socket: WebSocket;
		try {
			socket = new WebSocket(getRobotTrackingWsUrl());
		} catch {
			setTrackingConnected(false);
			return;
		}
		robotSocketRef.current = socket;

		socket.onopen = () => {
			setTrackingConnected(true);
			joinedRequestIdsRef.current.clear();
			joinRequests(socket);
		};

		socket.onmessage = (message) => {
			const envelope = parseTrackingEnvelope(message);
			if (!envelope || envelope.event === 'joined') return;
			const notification = createRobotNotification(envelope);
			if (notification) addRobotNotification(notification);
		};

		socket.onclose = () => {
			setTrackingConnected(false);
			joinedRequestIdsRef.current.clear();
		};

		socket.onerror = () => {
			setTrackingConnected(false);
		};
	}, [trackingRequests, addRobotNotification]);

	useEffect(() => {
		return () => {
			robotSocketRef.current?.close();
			robotSocketRef.current = null;
			joinedRequestIdsRef.current.clear();
		};
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const openNotificationPanel = () => setNotificationOpen(true);
	const closeNotificationPanel = () => setNotificationOpen(false);

	const notificationTime = (timestamp: string) =>
		new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(timestamp));

	const notificationList = React.useMemo(
		() => [...robotNotifications].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
		[robotNotifications],
	);
	const canShowRobotBell = Boolean(user?._id || trackingRequests.length > 0 || robotNotifications.length > 0);

	const handleNotificationClick = async () => {
		closeNotificationPanel();
		await router.push('/mypage');
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/books'}>
					<div>Books</div>
				</Link>
				<Link href={'/about'}>
					<div> About Us </div>
				</Link>
				<Link href={'/community'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
				{canShowRobotBell && (
					<button className="mobile-notification-button" type="button" onClick={openNotificationPanel} aria-label="Open robot notifications">
						<NotificationsOutlinedIcon />
						{robotNotifications.length > 0 && <span>{Math.min(robotNotifications.length, 9)}</span>}
					</button>
				)}
				{notificationOpen && <div className="robot-notification-overlay" onClick={closeNotificationPanel} />}
				<aside className={`robot-notification-panel ${notificationOpen ? 'open' : ''}`} aria-hidden={!notificationOpen}>
					<div className="robot-panel-head">
						<div>
							<p>Robot Updates</p>
							<span>{trackingConnected ? 'Live connection active' : 'Waiting for robot signal'}</span>
						</div>
						<IconButton onClick={closeNotificationPanel} aria-label="Close robot notifications">
							<CloseOutlinedIcon />
						</IconButton>
					</div>
					<div className="robot-panel-list">
						{notificationList.length === 0 ? (
							<div className="robot-panel-empty">No robot updates yet.</div>
						) : (
							notificationList.map((notification) => (
								<button key={notification.id} className="robot-notification-card" type="button" onClick={handleNotificationClick}>
									<span className="robot-card-icon"><SmartToyOutlinedIcon /></span>
									<span className="robot-card-copy">
										<strong>{notification.title}</strong>
										<em>{notification.status}</em>
										<small>{notificationTime(notification.timestamp)}</small>
									</span>
									<ChevronRightOutlinedIcon className="robot-card-arrow" />
								</button>
							))
						)}
					</div>
				</aside>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<img
									src="/img/logo/logo_capstone.png"
									alt="같이Go Smart Library"
									style={{ height: '85px', width: 'auto', cursor: 'pointer' }}
								/>
							</Link>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/books'}>
								<div>Books</div>
							</Link>
							<Link href={'/about'}>
								<div> About Us </div>
							</Link>
							<Link href={'/community'}>
								<div> {t('Community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'}>
									<div> {t('My Page')} </div>
								</Link>
							)}
							<Link href={'/cs'}>
								<div> {t('CS')} </div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt=""
										/>
									</div>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
											Logout
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								{canShowRobotBell && (
									<IconButton className="notification-button" onClick={openNotificationPanel} aria-label="Open robot notifications">
										<Badge
											badgeContent={robotNotifications.length}
											color="error"
											max={9}
											overlap="circular"
										>
											<NotificationsOutlinedIcon className={'notification-icon'} />
										</Badge>
									</IconButton>
								)}
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
										)}
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'usaFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="uz"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russiaFlag'}
										/>
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
				{notificationOpen && <div className="robot-notification-overlay" onClick={closeNotificationPanel} />}
				<aside className={`robot-notification-panel ${notificationOpen ? 'open' : ''}`} aria-hidden={!notificationOpen}>
					<div className="robot-panel-head">
						<div>
							<p>Robot Updates</p>
							<span>{trackingConnected ? 'Live connection active' : 'Waiting for robot signal'}</span>
						</div>
						<IconButton onClick={closeNotificationPanel} aria-label="Close robot notifications">
							<CloseOutlinedIcon />
						</IconButton>
					</div>
					<div className="robot-panel-list">
						{notificationList.length === 0 ? (
							<div className="robot-panel-empty">No robot updates yet.</div>
						) : (
							notificationList.map((notification) => (
								<button key={notification.id} className="robot-notification-card" type="button" onClick={handleNotificationClick}>
									<span className="robot-card-icon"><SmartToyOutlinedIcon /></span>
									<span className="robot-card-copy">
										<strong>{notification.title}</strong>
										<em>{notification.status}</em>
										<small>{notificationTime(notification.timestamp)}</small>
									</span>
									<ChevronRightOutlinedIcon className="robot-card-arrow" />
								</button>
							))
						)}
					</div>
				</aside>
			</Stack>
		);
	}
};

export default withRouter(Top);
