import React, { useEffect, useRef, useState } from 'react';
import {
	Stack,
	Modal,
	Button,
	FormControl,
	Select,
	MenuItem,
	Switch,
	Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const modalStyle: React.CSSProperties = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	backgroundColor: 'var(--color-background-primary, #ffffff)',
	borderRadius: '16px',
	border: '0.5px solid rgba(0, 0, 0, 0.1)',
	outline: 'none',
	boxShadow: '0px 20px 45px rgba(15, 23, 42, 0.16)',
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
	const [bookSearchQuery, setBookSearchQuery] = useState('');
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
		setBookSearchQuery('');
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

			if (bookSearchQuery.trim()) params.keyword = bookSearchQuery.trim();
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
				pathname: '/books',
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
						<div className={'afm-header'}>
							<div className={'afm-title'}>
								<TuneIcon />
								<span>Smart Library Advanced Filters</span>
							</div>
							<button className={'afm-close-btn'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</button>
						</div>

						<div className={'afm-body'}>
							<div className={'afm-search-row'}>
								<div className={'afm-search-input-box'}>
									<SearchIcon className={'icon'} />
									<input
										type="text"
										value={bookSearchQuery}
										onChange={(event) => setBookSearchQuery(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === 'Enter') pushSearchHandler().then();
										}}
										placeholder="Search by title, author, or ISBN…"
									/>
									<button onClick={() => pushSearchHandler().then()}>Search</button>
								</div>
							</div>

							<div className={'row-box select-grid'}>
								<div className={'box'}>
									<label>READER LEVEL</label>
									<div className={'inside'}>
										<FormControl fullWidth>
											<Select
												value={bookAudience}
												onChange={(event) => setBookAudience(event.target.value as string)}
												displayEmpty
												className={'afm-select'}
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
								<div className={'box'}>
									<label>LANGUAGE</label>
									<div className={'inside'}>
										<FormControl fullWidth>
											<Select
												value={bookLanguage}
												onChange={(event) => setBookLanguage(event.target.value as string)}
												displayEmpty
												className={'afm-select'}
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

							<div className={'row-box toggle-row'}>
								<div className={'box toggle-pill'}>
									<span>Borrowable Only</span>
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
								<div className={'box toggle-pill'}>
									<span>Purchasable Only</span>
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

							<div className={'row-box rating-row'}>
								<div className={'box'}>
									<div className={'rating-head'}>
										<label>MINIMUM RATING</label>
										<span>{minRating > 0 ? `★ ${minRating.toFixed(1)}+` : 'Any'}</span>
									</div>
									<div className={'inside'}>
											<Slider
											value={minRating}
											onChange={(_event: Event | React.SyntheticEvent, value: number | number[]) =>
												setMinRating(value as number)
											}
											min={0}
											max={5}
											step={0.5}
												sx={{ color: '#1D4ED8' }}
											/>
									</div>
								</div>
							</div>

							<div
								className={'row-box price-row'}
								style={{ opacity: isPurchasable ? 1 : 0.4, pointerEvents: isPurchasable ? 'auto' : 'none' }}
							>
								<div className={'box'}>
									<div className={'price-grid'}>
										<div className={'price-field'}>
											<label>MIN PRICE</label>
											<div className={'price-input-wrap'}>
												<span>₩</span>
												<input
													type={'number'}
													value={minPrice}
													onChange={(event) => setMinPrice(toNonNegativeNumber(event.target.value))}
													min={0}
													step={5000}
												/>
											</div>
										</div>
										<div className={'price-field'}>
											<label>MAX PRICE</label>
											<div className={'price-input-wrap'}>
												<span>₩</span>
												<input
													type={'number'}
													value={maxPrice}
													onChange={(event) => setMaxPrice(toNonNegativeNumber(event.target.value))}
													min={0}
													step={5000}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className={'afm-footer'}>
							<button className={'afm-reset-btn'} onClick={resetFilterHandler}>
								<RestartAltIcon />
								<span>Reset all filters</span>
							</button>
							<Button startIcon={<SearchIcon />} className={'search-btn'} onClick={pushSearchHandler}>
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
