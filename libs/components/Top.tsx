import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { CANCEL_REQUEST, CONFIRM_REQUEST_PICKUP } from '../../apollo/user/mutation';
import { GET_SESSION_REQUESTS } from '../../apollo/user/query';
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
import { RequestStatus, RequestType } from '../enums/request.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { resolveMediaUrl } from '../utils';

const MAX_ROBOT_NOTIFICATIONS = 30;
const DELIVERY_SESSION_STORAGE_KEY = 'gotogether.delivery.sessionId';

const getTimestampValue = (timestamp?: string): number => {
	if (!timestamp) return 0;
	const parsed = new Date(timestamp).getTime();
	return Number.isNaN(parsed) ? 0 : parsed;
};

const resolveNotificationRequestKey = (notification: Partial<RobotNotification>): string =>
	(notification.requestId ?? notification.id ?? '').trim();

const mergeRobotNotification = (
	existing: RobotNotification | undefined,
	incoming: RobotNotification,
): RobotNotification => {
	const status = incoming.status || existing?.status || 'ASSIGNED';
	const event = incoming.event || existing?.event || 'robotStatus';
	return {
		...(existing ?? incoming),
		...incoming,
		id: incoming.requestId,
		requestId: incoming.requestId,
		status,
		event,
		title: incoming.title || getRobotNotificationTitle(status, event),
		timestamp: incoming.timestamp || existing?.timestamp || new Date().toISOString(),
		message: incoming.message ?? existing?.message,
		robotId: incoming.robotId ?? existing?.robotId,
		requestType: incoming.requestType ?? existing?.requestType,
		destinationDeskId: incoming.destinationDeskId ?? existing?.destinationDeskId,
		bookTitle: incoming.bookTitle ?? existing?.bookTitle,
		bookImage: incoming.bookImage ?? existing?.bookImage,
	};
};

const upsertRobotNotifications = (
	previous: RobotNotification[],
	incomingRaw: RobotNotification,
): RobotNotification[] => {
	const requestKey = resolveNotificationRequestKey(incomingRaw);
	if (!requestKey) return previous;

	const incoming: RobotNotification = {
		...incomingRaw,
		id: requestKey,
		requestId: requestKey,
	};

	const existingIndex = previous.findIndex((item) => item.requestId === requestKey);
	if (existingIndex === -1) {
		return [...previous, mergeRobotNotification(undefined, incoming)].slice(-MAX_ROBOT_NOTIFICATIONS);
	}

	const existing = previous[existingIndex];
	const isDuplicateEvent = existing.status === incoming.status && existing.timestamp === incoming.timestamp;
	if (isDuplicateEvent) return previous;

	const existingTime = getTimestampValue(existing.timestamp);
	const incomingTime = getTimestampValue(incoming.timestamp);
	if (existingTime && incomingTime && incomingTime < existingTime) return previous;

	const merged = mergeRobotNotification(existing, incoming);
	const next = [...previous];
	next[existingIndex] = merged;
	return next.slice(-MAX_ROBOT_NOTIFICATIONS);
};

const readDeliverySessionId = (): string | undefined => {
	if (typeof window === 'undefined') return undefined;
	const sessionId = window.localStorage.getItem(DELIVERY_SESSION_STORAGE_KEY)?.trim();
	return sessionId ? sessionId : undefined;
};

const Top = () => {
	const NOTIFICATION_BOOK_FALLBACK = '/img/banner/books_hero.png';
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
	const [cancellingNotificationId, setCancellingNotificationId] = useState<string | null>(null);
	const [completingNotificationId, setCompletingNotificationId] = useState<string | null>(null);
	const [cancelErrors, setCancelErrors] = useState<Record<string, string>>({});
	const [completeErrors, setCompleteErrors] = useState<Record<string, string>>({});
	const robotSocketRef = useRef<WebSocket | null>(null);
	const joinedRequestIdsRef = useRef<Set<string>>(new Set<string>());
	const [cancelRequest] = useMutation(CANCEL_REQUEST);
	const [confirmRequestPickup] = useMutation(CONFIRM_REQUEST_PICKUP);
	const shouldLoadRequestContext = Boolean(user?._id) && (trackingRequests.length > 0 || robotNotifications.length > 0);
	const { data: sessionRequestsData } = useQuery(GET_SESSION_REQUESTS, {
		variables: { input: { page: 1, limit: 100 } },
		skip: !shouldLoadRequestContext,
		fetchPolicy: 'network-only',
	});

	const cancellableStatuses = new Set<RequestStatus | string>([
		RequestStatus.QUEUED,
		RequestStatus.ASSIGNED,
		RequestStatus.NAVIGATING_TO_SHELF,
		RequestStatus.ARRIVED_AT_SHELF,
		RequestStatus.VERIFYING_BOOK,
		RequestStatus.BOOK_FOUND,
		RequestStatus.PICKING_UP,
		RequestStatus.DELIVERING,
		RequestStatus.ARRIVED_AT_STUDENT,
	]);

	const addRobotNotification = useCallback((notification: RobotNotification) => {
		setRobotNotifications((prev) => {
			const next = upsertRobotNotifications(prev, notification);
			if (next === prev) return prev;
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
		const normalizedNotifications = loadRobotNotifications().reduce(
			(acc, notification) => upsertRobotNotifications(acc, notification),
			[] as RobotNotification[],
		);
		saveRobotNotifications(normalizedNotifications);
		setRobotNotifications(normalizedNotifications);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleTrackingRequest = (event: Event) => {
			const detail = (event as CustomEvent<RobotTrackingRequest>).detail;
			if (!detail?.requestId) return;

			setTrackingRequests(loadTrackingRequests());
			addRobotNotification({
				id: detail.requestId,
				requestId: detail.requestId,
				title: getRobotNotificationTitle(detail.status ?? 'ASSIGNED'),
				status: detail.status ?? 'ASSIGNED',
				message: detail.bookTitle ? `${detail.bookTitle} request is now active.` : 'Delivery request is now active.',
				requestType: detail.requestType,
				destinationDeskId: detail.destinationDeskId,
				bookTitle: detail.bookTitle,
				bookImage: detail.bookImage,
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
	const requestContextById = React.useMemo(() => {
		const next = new Map<string, RobotTrackingRequest>();
		trackingRequests.forEach((request) => {
			if (!request.requestId) return;
			next.set(request.requestId, request);
		});
		return next;
	}, [trackingRequests]);
	const requestDataById = React.useMemo(() => {
		const next = new Map<string, any>();
		const list = sessionRequestsData?.getSessionRequests?.list ?? [];
		list.forEach((request: any) => {
			if (!request?._id) return;
			next.set(request._id, request);
		});
		return next;
	}, [sessionRequestsData]);
	const canShowRobotBell = Boolean(user?._id || trackingRequests.length > 0 || robotNotifications.length > 0);

	const getRequestDetailText = (requestType?: string, destinationDeskId?: string, fallbackMessage?: string): string => {
		const normalizedDeskId = destinationDeskId?.trim();
		if (requestType === RequestType.BORROW) {
			return normalizedDeskId ? `Borrow request · Desk ${normalizedDeskId}` : 'Borrow request · Student desk delivery';
		}
		if (requestType === RequestType.PURCHASE) {
			return 'Purchase request · Reception delivery';
		}
		if (fallbackMessage?.trim()) return fallbackMessage.trim();
		return 'Delivery request update';
	};

	const resolveNotificationBookImage = (path?: string): string => {
		if (!path) return '';
		if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/img/')) return path;
		if (API_BASE_URL) return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
		const resolved = resolveMediaUrl(path, '');
		if (!resolved) return '';
		if (!resolved.startsWith('http://') && !resolved.startsWith('https://') && !resolved.startsWith('/')) {
			return `/${resolved}`;
		}
		return resolved;
	};

	const handleNotificationClick = async () => {
		closeNotificationPanel();
		await router.push({ pathname: '/mypage', query: { category: 'myRequests' } });
	};

	const dismissNotification = (requestId: string) => {
		setRobotNotifications((prev) => {
			const next = prev.filter((n) => n.requestId !== requestId);
			saveRobotNotifications(next);
			return next;
		});
	};

	const cancelRequestHandler = async (notification: RobotNotification) => {
		try {
			setCancellingNotificationId(notification.requestId);
			setCancelErrors((prev) => ({ ...prev, [notification.requestId]: '' }));
			const { data } = await cancelRequest({
				variables: { input: { requestId: notification.requestId } },
			});
			const cancelledStatus = data?.cancelRequest?.status ?? RequestStatus.CANCELLED;
			const now = new Date().toISOString();
			setRobotNotifications((prev) => {
				const next = prev.map((item) =>
					item.requestId === notification.requestId
						? {
								...item,
								status: cancelledStatus,
								title: getRobotNotificationTitle(cancelledStatus),
								timestamp: now,
						  }
						: item,
				);
				saveRobotNotifications(next);
				return next;
			});
			await sweetTopSmallSuccessAlert('Request cancelled. Robot returning to idle.', 1200);
		} catch (err: any) {
			const message = err?.message ?? 'Failed to cancel request';
			setCancelErrors((prev) => ({ ...prev, [notification.requestId]: message }));
			await sweetMixinErrorAlert(message);
		} finally {
			setCancellingNotificationId(null);
		}
	};

	const completeRequestHandler = async (notification: RobotNotification) => {
		try {
			setCompletingNotificationId(notification.requestId);
			setCompleteErrors((prev) => ({ ...prev, [notification.requestId]: '' }));
			const { data } = await confirmRequestPickup({
				variables: {
					input: {
						requestId: notification.requestId,
						sessionId: readDeliverySessionId(),
					},
				},
			});
			const completedStatus = data?.confirmRequestPickup?.status ?? RequestStatus.COMPLETED;
			const completedAt = data?.confirmRequestPickup?.updatedAt ?? new Date().toISOString();
			setRobotNotifications((prev) => {
				const next = prev.map((item) =>
					item.requestId === notification.requestId
						? {
								...item,
								status: completedStatus,
								title: getRobotNotificationTitle(completedStatus),
								timestamp: completedAt,
						  }
						: item,
				);
				saveRobotNotifications(next);
				return next;
			});
			await sweetTopSmallSuccessAlert('Request marked as completed.', 1100);
		} catch (err: any) {
			const message = err?.message ?? 'Failed to mark request as completed';
			setCompleteErrors((prev) => ({ ...prev, [notification.requestId]: message }));
			await sweetMixinErrorAlert(message);
		} finally {
			setCompletingNotificationId(null);
		}
	};

	const renderNotificationCard = (notification: RobotNotification) => {
		const canCancel = cancellableStatuses.has(notification.status);
		const canConfirmReady =
			notification.status === RequestStatus.READY ||
			notification.status === RequestStatus.ARRIVED_AT_STUDENT;
		const canDismiss =
			notification.status === RequestStatus.COMPLETED ||
			notification.status === RequestStatus.CANCELLED ||
			notification.status === RequestStatus.FAILED;
		const isCancelling = cancellingNotificationId === notification.requestId;
		const isCompleting = completingNotificationId === notification.requestId;
		const cancelError = cancelErrors[notification.requestId];
		const completeError = completeErrors[notification.requestId];
		const actionError = cancelError || completeError;
		const requestContext = requestContextById.get(notification.requestId);
		const requestData = requestDataById.get(notification.requestId);
		const requestType = notification.requestType ?? requestContext?.requestType ?? requestData?.requestType;
		const destinationDeskId = notification.destinationDeskId ?? requestContext?.destinationDeskId ?? requestData?.destinationDeskId;
		const bookTitle =
			notification.bookTitle ?? requestContext?.bookTitle ?? requestData?.bookData?.bookTitle ?? 'Book delivery request';
		const bookImagePath =
			notification.bookImage ?? requestContext?.bookImage ?? requestData?.bookData?.bookImages?.[0];
		const bookImage = resolveNotificationBookImage(bookImagePath);
		const requestDetail = getRequestDetailText(requestType, destinationDeskId, notification.message ?? notification.title);

		return (
			<div key={notification.requestId} className="robot-notification-card">
				<div
					className="robot-card-main"
					role="button"
					tabIndex={0}
					onClick={handleNotificationClick}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleNotificationClick();
						}
					}}
				>
					<div className="robot-card-cover">
						{bookImage ? (
							<img
								src={bookImage}
								alt={bookTitle}
								onError={(event) => {
									event.currentTarget.onerror = null;
									event.currentTarget.src = NOTIFICATION_BOOK_FALLBACK;
								}}
							/>
						) : (
							<span>Book</span>
						)}
					</div>
					<div className="robot-card-copy">
						<strong>{bookTitle}</strong>
						<p className="robot-card-detail">{requestDetail}</p>
						<div className="robot-card-meta">
							<em>{notification.status}</em>
							<small>{notificationTime(notification.timestamp)}</small>
						</div>
						{canCancel && (
							<div className="robot-card-actions">
								<button
									className="robot-card-cancel-btn"
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										cancelRequestHandler(notification);
									}}
									disabled={isCancelling}
								>
									{isCancelling ? (
										<span className="robot-card-cancel-loading">
											<CircularProgress size={12} sx={{ color: '#ffffff' }} />
											Cancelling...
										</span>
									) : (
										'Cancel Request'
									)}
								</button>
							</div>
						)}
						{canConfirmReady && (
							<div className="robot-card-actions">
								<button
									className="robot-card-confirm-btn"
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										completeRequestHandler(notification);
									}}
									disabled={isCompleting}
								>
									{isCompleting ? (
										<span className="robot-card-cancel-loading">
											<CircularProgress size={12} sx={{ color: '#ffffff' }} />
											Confirming...
										</span>
									) : (
										'Confirm Pickup'
									)}
								</button>
							</div>
						)}
						{actionError && <small className="robot-card-error">{actionError}</small>}
					</div>
				</div>
				<div className="robot-card-side">
					{canDismiss && (
						<button
							type="button"
							className="robot-card-dismiss"
							onClick={(e) => {
								e.stopPropagation();
								dismissNotification(notification.requestId);
							}}
							aria-label="Dismiss notification"
						>
							×
						</button>
					)}
				</div>
			</div>
		);
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
						<div className="robot-panel-tools">
							{robotNotifications.length > 0 && (
								<button
									type="button"
									className="robot-clear-all"
									onClick={() => {
										setRobotNotifications([]);
										saveRobotNotifications([]);
									}}
								>
									Clear all
								</button>
							)}
							<IconButton className="robot-panel-close" onClick={closeNotificationPanel} aria-label="Close robot notifications">
								<CloseOutlinedIcon />
							</IconButton>
						</div>
					</div>
					<div className="robot-panel-list">
						{notificationList.length === 0 ? (
							<div className="robot-panel-empty">
								<p>No robot updates yet</p>
								<span>Delivery updates will appear here.</span>
							</div>
						) : (
							notificationList.map((notification) => renderNotificationCard(notification))
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
												user?.memberImage ? `${API_BASE_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
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
						<div className="robot-panel-tools">
							{robotNotifications.length > 0 && (
								<button
									type="button"
									className="robot-clear-all"
									onClick={() => {
										setRobotNotifications([]);
										saveRobotNotifications([]);
									}}
								>
									Clear all
								</button>
							)}
							<IconButton className="robot-panel-close" onClick={closeNotificationPanel} aria-label="Close robot notifications">
								<CloseOutlinedIcon />
							</IconButton>
						</div>
					</div>
					<div className="robot-panel-list">
						{notificationList.length === 0 ? (
							<div className="robot-panel-empty">
								<p>No robot updates yet</p>
								<span>Delivery updates will appear here.</span>
							</div>
						) : (
							notificationList.map((notification) => renderNotificationCard(notification))
						)}
					</div>
				</aside>
			</Stack>
		);
	}
};

export default withRouter(Top);
