import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Stack,
	Box,
	Modal,
	Divider,
	Button,
	FormControl,
	Select,
	MenuItem,
	Switch,
	Slider,
	TextField,
	InputAdornment,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { PropertyLocation, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

interface HeaderFilterProps {
	initialInput: PropertiesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const roomsRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [propertyLocation] = useState<PropertyLocation[]>(Object.values(PropertyLocation));
	const [propertyType] = useState<PropertyType[]>(Object.values(PropertyType));

	const [bookAudience, setBookAudience] = useState('');
	const [bookLanguage, setBookLanguage] = useState('');
	const [isBorrowable, setIsBorrowable] = useState(false);
	const [isPurchasable, setIsPurchasable] = useState(false);
	const [minRating, setMinRating] = useState(0);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(0);

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!roomsRef?.current?.contains(event.target)) {
				setOpenRooms(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenRooms(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenRooms(false);
	};

	const roomStateChangeHandler = () => {
		setOpenRooms((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
	};

	const disableAllStateHandler = () => {
		setOpenRooms(false);
		setOpenType(false);
		setOpenLocation(false);
	};

	const propertyLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				roomStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyRoomSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						roomsList: [value],
					},
				});
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, propertyRoomSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setBookAudience('');
		setBookLanguage('');
		setIsBorrowable(false);
		setIsPurchasable(false);
		setMinRating(0);
		setMinPrice(0);
		setMaxPrice(0);
	};

	const toNonNegativeNumber = (value: string): number => {
		const parsed = Number(value);
		if (Number.isNaN(parsed) || parsed < 0) return 0;
		return parsed;
	};

	const pushSearchHandler = async () => {
		try {
			const params: any = {};
			const search: any = searchFilter?.search ?? {};

			const bookFormat = search?.bookFormat ?? search?.locationList?.[0] ?? '';
			const bookType = search?.bookType ?? search?.typeList?.[0] ?? '';
			const bookCategory = search?.bookCategory ?? search?.roomsList?.[0] ?? '';

			if (bookFormat) params.format = bookFormat;
			if (bookType) params.type = bookType;
			if (bookCategory) params.category = bookCategory;

			if (bookAudience) params.audience = bookAudience;
			if (bookLanguage) params.language = bookLanguage;
			if (isBorrowable) params.borrowable = 'true';
			if (isPurchasable) params.purchasable = 'true';
			if (minRating > 0) params.minRating = minRating;
			if (minPrice > 0) params.minPrice = minPrice;
			if (maxPrice > 0) params.maxPrice = maxPrice;

			await router.push({
				pathname: '/library/books',
				query: params,
			});
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<Box component={'div'} className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
							<span>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
							<span> {searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Property type')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openRooms ? 'on' : ''}`} onClick={roomStateChangeHandler}>
							<span>{searchFilter?.search?.roomsList ? `${searchFilter?.search?.roomsList[0]} rooms}` : t('Rooms')}</span>
							<ExpandMoreIcon />
						</Box>
					</Stack>
					<Stack className={'search-box-other'}>
						<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</Box>
						<Box className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</Box>
					</Stack>

					{/*MENU */}
					<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
						{propertyLocation.map((location: string) => {
							return (
								<div onClick={() => propertyLocationSelectHandler(location)} key={location}>
									<img src={`img/banner/cities/${location}.webp`} alt="" />
									<span>{location}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
						{propertyType.map((type: string) => {
							return (
								<div
									style={{ backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp)` }}
									onClick={() => propertyTypeSelectHandler(type)}
									key={type}
								>
									<span>{type}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-rooms ${openRooms ? 'on' : ''}`} ref={roomsRef}>
						{[1, 2, 3, 4, 5].map((room: number) => {
							return (
								<span onClick={() => propertyRoomSelectHandler(room)} key={room}>
									{room} room{room > 1 ? 's' : ''}
								</span>
							);
						})}
					</div>
				</Stack>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<Box className={'advanced-filter-modal'}>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Smart Library Advanced Filters</span>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'} style={{ width: '48%' }}>
										<span>Reader Level / 이용 대상</span>
										<div className={'inside'}>
											<FormControl fullWidth>
												<Select
													value={bookAudience}
													onChange={(event) => setBookAudience(event.target.value as string)}
													displayEmpty
													inputProps={{ 'aria-label': 'Reader Level / 이용 대상' }}
												>
													<MenuItem value={''}>All Levels / 전체</MenuItem>
													<MenuItem value={'CHILDREN'}>Children / 어린이</MenuItem>
													<MenuItem value={'TEEN'}>Teen / 청소년</MenuItem>
													<MenuItem value={'GENERAL'}>General / 일반</MenuItem>
													<MenuItem value={'UNDERGRADUATE'}>Undergraduate / 학부생</MenuItem>
													<MenuItem value={'GRADUATE'}>Graduate / 대학원생</MenuItem>
													<MenuItem value={'PROFESSIONAL'}>Professional / 전문가</MenuItem>
												</Select>
											</FormControl>
										</div>
									</div>
									<div className={'box'} style={{ width: '48%' }}>
										<span>Language / 언어</span>
										<div className={'inside'}>
											<FormControl fullWidth>
												<Select
													value={bookLanguage}
													onChange={(event) => setBookLanguage(event.target.value as string)}
													displayEmpty
													inputProps={{ 'aria-label': 'Language / 언어' }}
												>
													<MenuItem value={''}>All Languages / 전체</MenuItem>
													<MenuItem value={'ENGLISH'}>English / 영어</MenuItem>
													<MenuItem value={'KOREAN'}>Korean / 한국어</MenuItem>
													<MenuItem value={'CHINESE'}>Chinese / 중국어</MenuItem>
													<MenuItem value={'SPANISH'}>Spanish / 스페인어</MenuItem>
													<MenuItem value={'FRENCH'}>French / 프랑스어</MenuItem>
													<MenuItem value={'GERMAN'}>German / 독일어</MenuItem>
													<MenuItem value={'RUSSIAN'}>Russian / 러시아어</MenuItem>
													<MenuItem value={'ARABIC'}>Arabic / 아랍어</MenuItem>
													<MenuItem value={'UZBEK'}>Uzbek / 우즈벡어</MenuItem>
													<MenuItem value={'OTHER'}>Other / 기타</MenuItem>
												</Select>
											</FormControl>
										</div>
									</div>
								</div>

								<div className={'row-box'} style={{ marginTop: '26px' }}>
									<div className={'box'} style={{ width: '48%' }}>
										<span>Borrowable Only / 대출 가능만</span>
										<div className={'inside'}>
											<Switch
												checked={isBorrowable}
												onChange={(event) => setIsBorrowable(event.target.checked)}
												sx={{
													'& .MuiSwitch-switchBase.Mui-checked': { color: '#2E86DE' },
													'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
														backgroundColor: '#2E86DE',
													},
												}}
											/>
										</div>
									</div>
									<div className={'box'} style={{ width: '48%' }}>
										<span>Purchasable Only / 구매 가능만</span>
										<div className={'inside'}>
											<Switch
												checked={isPurchasable}
												onChange={(event) => setIsPurchasable(event.target.checked)}
												sx={{
													'& .MuiSwitch-switchBase.Mui-checked': { color: '#2E86DE' },
													'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
														backgroundColor: '#2E86DE',
													},
												}}
											/>
										</div>
									</div>
								</div>

								<div className={'row-box'} style={{ marginTop: '26px' }}>
									<div className={'box'} style={{ width: '100%' }}>
										<span>
											Minimum Rating / 최소 평점: {minRating > 0 ? `${minRating.toFixed(1)} ★` : 'Any / 전체'}
										</span>
										<div className={'inside'}>
											<Slider
												value={minRating}
												onChange={(_event, value) => setMinRating(value as number)}
												min={0}
												max={5}
												step={0.5}
												sx={{ color: '#2E86DE' }}
											/>
										</div>
									</div>
								</div>

								<div className={'row-box'} style={{ marginTop: '26px', opacity: isPurchasable ? 1 : 0.4, pointerEvents: isPurchasable ? 'auto' : 'none' }}>
									<div className={'box'} style={{ width: '100%' }}>
										<span>Price Range / 가격 범위 (구매)</span>
										<div className={'inside space-between align-center'} style={{ gap: '16px' }}>
											<TextField
												fullWidth
												type={'number'}
												label={'Min price / 최소'}
												value={minPrice}
												onChange={(event) => setMinPrice(toNonNegativeNumber(event.target.value))}
												inputProps={{ min: 0 }}
												InputProps={{ startAdornment: <InputAdornment position={'start'}>₩</InputAdornment> }}
											/>
											<TextField
												fullWidth
												type={'number'}
												label={'Max price / 최대'}
												value={maxPrice}
												onChange={(event) => setMaxPrice(toNonNegativeNumber(event.target.value))}
												inputProps={{ min: 0 }}
												InputProps={{ startAdornment: <InputAdornment position={'start'}>₩</InputAdornment> }}
											/>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button startIcon={<img src={'/img/icons/search.svg'} />} className={'search-btn'} onClick={pushSearchHandler}>
									Search
								</Button>
							</div>
						</Box>
					</Box>
				</Modal>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
