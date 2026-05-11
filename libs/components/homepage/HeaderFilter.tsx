import React, { useEffect, useRef, useState } from 'react';
import {
	Stack,
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
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const modalStyle: React.CSSProperties = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	backgroundColor: '#ffffff',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
};

const BOOK_FORMAT_OPTIONS = [
	{ value: 'PAPERBACK', label: 'Paperback' },
	{ value: 'EBOOK', label: 'E-Book' },
	{ value: 'AUDIOBOOK', label: 'Audiobook' },
];

const BOOK_TYPE_OPTIONS = [
	{ value: 'TEXTBOOK', label: 'Textbook' },
	{ value: 'REFERENCE', label: 'Reference' },
	{ value: 'RESEARCH', label: 'Research' },
	{ value: 'NOVEL', label: 'Novel' },
	{ value: 'COMIC', label: 'Comic' },
	{ value: 'MAGAZINE', label: 'Magazine' },
	{ value: 'JOURNAL', label: 'Journal' },
	{ value: 'WORKBOOK', label: 'Workbook' },
	{ value: 'MANUAL', label: 'Manual' },
	{ value: 'DICTIONARY', label: 'Dictionary' },
	{ value: 'ENCYCLOPEDIA', label: 'Encyclopedia' },
	{ value: 'OTHER', label: 'Other' },
];

const BOOK_CATEGORY_OPTIONS = [
	{ value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
	{ value: 'ENGINEERING', label: 'Engineering' },
	{ value: 'SCIENCE_AND_MATH', label: 'Science & Math' },
	{ value: 'BUSINESS', label: 'Business' },
	{ value: 'LITERATURE', label: 'Literature' },
	{ value: 'NOVEL', label: 'Novel' },
	{ value: 'SELF_IMPROVEMENT', label: 'Self Improvement' },
	{ value: 'TEXTBOOKS', label: 'Textbooks' },
	{ value: 'KOREAN_LANGUAGE', label: 'Korean Language' },
	{ value: 'TOPIK_PREPARATION', label: 'TOPIK' },
	{ value: 'ROMANCE', label: 'Romance' },
	{ value: 'SCIENCE_FICTION', label: 'Science Fiction' },
	{ value: 'MYSTERY_THRILLER', label: 'Mystery & Thriller' },
	{ value: 'HEALTH_FITNESS', label: 'Health & Fitness' },
	{ value: 'LAW', label: 'Law' },
	{ value: 'DESIGN', label: 'Design' },
	{ value: 'OTHER', label: 'Other' },
];

const BOOK_AUDIENCE_OPTIONS = [
	{ value: 'CHILDREN', label: 'Children' },
	{ value: 'TEEN', label: 'Teen' },
	{ value: 'GENERAL', label: 'General' },
	{ value: 'UNDERGRADUATE', label: 'Undergraduate' },
	{ value: 'GRADUATE', label: 'Graduate' },
	{ value: 'PROFESSIONAL', label: 'Professional' },
];

const BOOK_LANGUAGE_OPTIONS = [
	{ value: 'ENGLISH', label: 'English' },
	{ value: 'KOREAN', label: 'Korean' },
	{ value: 'CHINESE', label: 'Chinese' },
	{ value: 'SPANISH', label: 'Spanish' },
	{ value: 'FRENCH', label: 'French' },
	{ value: 'GERMAN', label: 'German' },
	{ value: 'RUSSIAN', label: 'Russian' },
	{ value: 'ARABIC', label: 'Arabic' },
	{ value: 'UZBEK', label: 'Uzbek' },
	{ value: 'OTHER', label: 'Other' },
];

const HeaderFilter = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const formatRef: any = useRef();
	const typeRef: any = useRef();
	const categoryRef: any = useRef();
	const [openFormat, setOpenFormat] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openCategory, setOpenCategory] = useState(false);

	const [bookFormat, setBookFormat] = useState('');
	const [bookType, setBookType] = useState('');
	const [bookCategory, setBookCategory] = useState('');
	const [hoveredCategory, setHoveredCategory] = useState('');

	const [bookAudience, setBookAudience] = useState('');
	const [bookLanguage, setBookLanguage] = useState('');
	const [isBorrowable, setIsBorrowable] = useState(false);
	const [isPurchasable, setIsPurchasable] = useState(false);
	const [minRating, setMinRating] = useState(0);
	const [minPrice, setMinPrice] = useState(0);
	const [maxPrice, setMaxPrice] = useState(0);

	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!formatRef?.current?.contains(event.target)) {
				setOpenFormat(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!categoryRef?.current?.contains(event.target)) {
				setOpenCategory(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);
		return () => document.removeEventListener('mousedown', clickHandler);
	}, []);

	const advancedFilterHandler = (status: boolean) => {
		setOpenFormat(false);
		setOpenType(false);
		setOpenCategory(false);
		setOpenAdvancedFilter(status);
	};

	const formatStateChangeHandler = () => {
		setOpenFormat((prev) => !prev);
		setOpenType(false);
		setOpenCategory(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenFormat(false);
		setOpenCategory(false);
	};

	const categoryStateChangeHandler = () => {
		setOpenCategory((prev) => !prev);
		setOpenType(false);
		setOpenFormat(false);
	};

	const disableAllStateHandler = () => {
		setOpenCategory(false);
		setOpenType(false);
		setOpenFormat(false);
	};

	const bookFormatSelectHandler = (value: string) => {
		setBookFormat(value);
		typeStateChangeHandler();
	};

	const bookTypeSelectHandler = (value: string) => {
		setBookType(value);
		categoryStateChangeHandler();
	};

	const bookCategorySelectHandler = (value: string) => {
		setBookCategory(value);
		disableAllStateHandler();
	};

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
	}

	return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<div className={`box ${openFormat ? 'on' : ''}`} onClick={formatStateChangeHandler}>
							<span>{bookFormat ? BOOK_FORMAT_OPTIONS.find((option) => option.value === bookFormat)?.label : 'Book Format'}</span>
							<ExpandMoreIcon />
						</div>
						<div className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
							<span>{bookType ? BOOK_TYPE_OPTIONS.find((option) => option.value === bookType)?.label : 'Book Type'}</span>
							<ExpandMoreIcon />
						</div>
						<div className={`box ${openCategory ? 'on' : ''}`} onClick={categoryStateChangeHandler}>
							<span>{bookCategory ? BOOK_CATEGORY_OPTIONS.find((option) => option.value === bookCategory)?.label : 'Category'}</span>
							<ExpandMoreIcon />
						</div>
					</Stack>
					<Stack className={'search-box-other'}>
					<div className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>{t('Advanced')}</span>
					</div>
						<div className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</div>
					</Stack>

					<div className={`filter-location ${openFormat ? 'on' : ''}`} ref={formatRef}>
						{BOOK_FORMAT_OPTIONS.map((option, index) => {
							const cityImage = ['SEOUL', 'BUSAN', 'INCHEON'][index % 3];
							return (
								<div onClick={() => bookFormatSelectHandler(option.value)} key={option.value}>
									<img src={`/img/banner/cities/${cityImage}.webp`} alt={option.label} />
									<span>{option.label}</span>
								</div>
							);
						})}
					</div>

					<div
						className={`filter-type ${openType ? 'on' : ''}`}
						ref={typeRef}
						style={{ flexWrap: 'wrap', justifyContent: 'flex-start', gap: '16px' }}
					>
						{BOOK_TYPE_OPTIONS.map((option, index) => {
							const typeImage = ['apartment', 'house', 'villa'][index % 3];
							return (
								<div
									style={{ backgroundImage: `url(/img/banner/types/${typeImage}.webp)` }}
									onClick={() => bookTypeSelectHandler(option.value)}
									key={option.value}
								>
									<span>{option.label}</span>
								</div>
							);
						})}
					</div>

					<div
						className={`filter-rooms ${openCategory ? 'on' : ''}`}
						ref={categoryRef}
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(5, 1fr)',
							gap: '12px',
							padding: '18px 22px',
							maxHeight: '280px',
							overflowY: 'auto',
						}}
					>
						{BOOK_CATEGORY_OPTIONS.map((option) => {
							const isSelected = bookCategory === option.value;
							const isHovered = hoveredCategory === option.value;
							const background = isSelected
								? 'rgba(46, 134, 222, 0.12)'
								: isHovered
									? 'rgba(46, 134, 222, 0.08)'
									: 'transparent';
							return (
								<span
									onClick={() => bookCategorySelectHandler(option.value)}
									onMouseEnter={() => setHoveredCategory(option.value)}
									onMouseLeave={() => setHoveredCategory('')}
									key={option.value}
									style={{
										textAlign: 'center',
										cursor: 'pointer',
										padding: '8px 4px',
										borderRadius: '4px',
										fontSize: '15px',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										background,
										color: isSelected ? '#2E86DE' : undefined,
										fontWeight: isSelected ? 600 : undefined,
									}}
								>
									{option.label}
								</span>
							);
						})}
					</div>
				</Stack>

			<Modal
				open={openAdvancedFilter}
				onClose={() => advancedFilterHandler(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<div style={modalStyle}>
					<div className={'advanced-filter-modal'}>
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
									<span>Reader Level</span>
									<div className={'inside'}>
										<FormControl fullWidth>
											<Select
												value={bookAudience}
												onChange={(event) => setBookAudience(event.target.value as string)}
												displayEmpty
											>
												<MenuItem value={''}>All Levels</MenuItem>
												{BOOK_AUDIENCE_OPTIONS.map((option) => (
													<MenuItem key={option.value} value={option.value}>
														{option.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</div>
								</div>
								<div className={'box'} style={{ width: '48%' }}>
									<span>Language</span>
									<div className={'inside'}>
										<FormControl fullWidth>
											<Select
												value={bookLanguage}
												onChange={(event) => setBookLanguage(event.target.value as string)}
												displayEmpty
											>
												<MenuItem value={''}>All Languages</MenuItem>
												{BOOK_LANGUAGE_OPTIONS.map((option) => (
													<MenuItem key={option.value} value={option.value}>
														{option.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</div>
								</div>
							</div>

							<div className={'row-box'} style={{ marginTop: '26px' }}>
								<div className={'box'} style={{ width: '48%' }}>
									<span>Borrowable Only</span>
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
									<span>Purchasable Only</span>
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
									<span>Minimum Rating: {minRating > 0 ? `${minRating.toFixed(1)} ★` : 'Any'}</span>
									<div className={'inside'}>
										<Slider
											value={minRating}
											onChange={(_event: Event | React.SyntheticEvent, value: number | number[]) =>
												setMinRating(value as number)
											}
											min={0}
											max={5}
											step={0.5}
											sx={{ color: '#2E86DE' }}
										/>
									</div>
								</div>
							</div>

							<div
								className={'row-box'}
								style={{ marginTop: '26px', opacity: isPurchasable ? 1 : 0.4, pointerEvents: isPurchasable ? 'auto' : 'none' }}
							>
								<div className={'box'} style={{ width: '100%' }}>
									<span>Price Range (Purchase)</span>
									<div className={'inside space-between align-center'} style={{ gap: '16px' }}>
										<TextField
											fullWidth
											type={'number'}
											label={'Min Price'}
											value={minPrice}
											onChange={(event) => setMinPrice(toNonNegativeNumber(event.target.value))}
											inputProps={{ min: 0, step: 5000 }}
											InputProps={{
												startAdornment: <InputAdornment position="start">₩</InputAdornment>,
											}}
										/>
										<TextField
											fullWidth
											type={'number'}
											label={'Max Price'}
											value={maxPrice}
											onChange={(event) => setMaxPrice(toNonNegativeNumber(event.target.value))}
											inputProps={{ min: 0, step: 5000 }}
											InputProps={{
												startAdornment: <InputAdornment position="start">₩</InputAdornment>,
											}}
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
					</div>
				</div>
			</Modal>
		</>
	);
};

export default HeaderFilter;
