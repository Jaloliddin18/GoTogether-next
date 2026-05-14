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
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import SelfImprovementOutlinedIcon from '@mui/icons-material/SelfImprovementOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
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

type IconFilterOption = {
	value: string;
	label: string;
	description?: string;
	Icon: React.ElementType;
};

const BOOK_FORMAT_OPTIONS: IconFilterOption[] = [
	{
		value: 'PAPERBACK',
		label: 'Printed Books',
		description: 'Physical books available for robot delivery.',
		Icon: MenuBookOutlinedIcon,
	},
	{
		value: 'EBOOK',
		label: 'E-Books',
		description: 'Digital reading resources for quick access.',
		Icon: TabletMacOutlinedIcon,
	},
	{
		value: 'AUDIOBOOK',
		label: 'Audio Books',
		description: 'Listen and learn anywhere.',
		Icon: HeadphonesOutlinedIcon,
	},
];

const BOOK_TYPE_OPTIONS: IconFilterOption[] = [
	{
		value: 'TEXTBOOK',
		label: 'Textbook',
		description: 'Course learning materials.',
		Icon: MenuBookOutlinedIcon,
	},
	{
		value: 'REFERENCE',
		label: 'Reference',
		description: 'Quick lookup resources.',
		Icon: LibraryBooksOutlinedIcon,
	},
	{
		value: 'RESEARCH',
		label: 'Research',
		description: 'Academic research titles.',
		Icon: ScienceOutlinedIcon,
	},
	{
		value: 'NOVEL',
		label: 'Novel',
		description: 'Fiction and literature.',
		Icon: AutoStoriesOutlinedIcon,
	},
	{
		value: 'COMIC',
		label: 'Comic',
		description: 'Graphic stories.',
		Icon: TheaterComedyOutlinedIcon,
	},
	{
		value: 'MAGAZINE',
		label: 'Magazine',
		description: 'Periodicals and issues.',
		Icon: ArticleOutlinedIcon,
	},
	{
		value: 'JOURNAL',
		label: 'Journal',
		description: 'Scholarly publications.',
		Icon: HistoryEduOutlinedIcon,
	},
	{
		value: 'WORKBOOK',
		label: 'Workbook',
		description: 'Practice and exercises.',
		Icon: AssignmentOutlinedIcon,
	},
	{
		value: 'MANUAL',
		label: 'Manual',
		description: 'Guides and instructions.',
		Icon: BuildOutlinedIcon,
	},
	{
		value: 'DICTIONARY',
		label: 'Dictionary',
		description: 'Word and language reference.',
		Icon: TranslateOutlinedIcon,
	},
	{
		value: 'ENCYCLOPEDIA',
		label: 'Encyclopedia',
		description: 'General knowledge collections.',
		Icon: PublicOutlinedIcon,
	},
	{
		value: 'OTHER',
		label: 'Other',
		description: 'More library materials.',
		Icon: CategoryOutlinedIcon,
	},
];

const BOOK_CATEGORY_OPTIONS: IconFilterOption[] = [
	{ value: 'COMPUTER_SCIENCE', label: 'Computer Science', Icon: ComputerOutlinedIcon },
	{ value: 'ENGINEERING', label: 'Engineering', Icon: EngineeringOutlinedIcon },
	{ value: 'SCIENCE_AND_MATH', label: 'Science & Math', Icon: FunctionsOutlinedIcon },
	{ value: 'BUSINESS', label: 'Business', Icon: BusinessCenterOutlinedIcon },
	{ value: 'LITERATURE', label: 'Literature', Icon: AutoStoriesOutlinedIcon },
	{ value: 'NOVEL', label: 'Novel', Icon: AutoStoriesOutlinedIcon },
	{ value: 'SELF_IMPROVEMENT', label: 'Self Improvement', Icon: SelfImprovementOutlinedIcon },
	{ value: 'TEXTBOOKS', label: 'Textbooks', Icon: MenuBookOutlinedIcon },
	{ value: 'KOREAN_LANGUAGE', label: 'Korean Language', Icon: TranslateOutlinedIcon },
	{ value: 'TOPIK_PREPARATION', label: 'TOPIK', Icon: SchoolOutlinedIcon },
	{ value: 'ROMANCE', label: 'Romance', Icon: FavoriteBorderOutlinedIcon },
	{ value: 'SCIENCE_FICTION', label: 'Science Fiction', Icon: RocketLaunchOutlinedIcon },
	{ value: 'MYSTERY_THRILLER', label: 'Mystery & Thriller', Icon: ManageSearchOutlinedIcon },
	{ value: 'HEALTH_FITNESS', label: 'Health & Fitness', Icon: FitnessCenterOutlinedIcon },
	{ value: 'LAW', label: 'Law', Icon: GavelOutlinedIcon },
	{ value: 'DESIGN', label: 'Design', Icon: DesignServicesOutlinedIcon },
	{ value: 'OTHER', label: 'Other', Icon: CategoryOutlinedIcon },
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
	const searchBoxRef: any = useRef();
	const [openFormat, setOpenFormat] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openCategory, setOpenCategory] = useState(false);

	const [bookFormat, setBookFormat] = useState('');
	const [bookType, setBookType] = useState('');
	const [bookCategory, setBookCategory] = useState('');

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
			if (!searchBoxRef?.current?.contains(event.target as Node)) {
				disableAllStateHandler();
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
			<Stack className={'search-box'} ref={searchBoxRef}>
				<Stack className={'select-box'}>
					<div className={`box ${openFormat ? 'on' : ''}`} onClick={formatStateChangeHandler}>
						<span>{bookFormat ? BOOK_FORMAT_OPTIONS.find((option) => option.value === bookFormat)?.label : 'Book Format'}</span>
						<ExpandMoreIcon sx={{ transform: openFormat ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease' }} />
					</div>
					<div className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
						<span>{bookType ? BOOK_TYPE_OPTIONS.find((option) => option.value === bookType)?.label : 'Book Type'}</span>
						<ExpandMoreIcon sx={{ transform: openType ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease' }} />
					</div>
					<div className={`box ${openCategory ? 'on' : ''}`} onClick={categoryStateChangeHandler}>
						<span>{bookCategory ? BOOK_CATEGORY_OPTIONS.find((option) => option.value === bookCategory)?.label : 'Category'}</span>
						<ExpandMoreIcon sx={{ transform: openCategory ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease' }} />
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

				<div className={`filter-location ${openFormat ? 'on' : ''}`}>
					<div className={'icon-card-grid format-grid'}>
						{BOOK_FORMAT_OPTIONS.map((option) => {
							const Icon = option.Icon;
							const isSelected = bookFormat === option.value;
							return (
								<button
									type="button"
									className={`filter-option-card ${isSelected ? 'selected' : ''}`}
									onClick={() => bookFormatSelectHandler(option.value)}
									key={option.value}
								>
									<span className={'filter-option-card-icon'}>
										<Icon />
									</span>
									<span className={'filter-option-card-title'}>{option.label}</span>
									<span className={'filter-option-card-description'}>{option.description}</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className={`filter-type ${openType ? 'on' : ''}`}>
					<div className={'icon-card-grid type-grid'}>
						{BOOK_TYPE_OPTIONS.map((option) => {
							const Icon = option.Icon;
							const isSelected = bookType === option.value;
							return (
								<button
									type="button"
									className={`filter-option-card ${isSelected ? 'selected' : ''}`}
									onClick={() => bookTypeSelectHandler(option.value)}
									key={option.value}
								>
									<span className={'filter-option-card-icon'}>
										<Icon />
									</span>
									<span className={'filter-option-card-title'}>{option.label}</span>
									<span className={'filter-option-card-description'}>{option.description}</span>
								</button>
							);
						})}
					</div>
				</div>

					<div
						className={`filter-rooms ${openCategory ? 'on' : ''}`}
						style={{
							padding: '18px 22px',
							maxHeight: 'min(520px, calc(100vh - 180px))',
							overflowY: 'auto',
						}}
					>
					<div className={'icon-card-grid category-grid'}>
						{BOOK_CATEGORY_OPTIONS.map((option) => {
							const Icon = option.Icon;
							const isSelected = bookCategory === option.value;
							return (
								<button
									type="button"
									className={`filter-option-card category-option ${isSelected ? 'selected' : ''}`}
									onClick={() => bookCategorySelectHandler(option.value)}
									key={option.value}
								>
									<span className={'filter-option-card-icon'}>
										<Icon />
									</span>
									<span className={'filter-option-card-title'}>{option.label}</span>
								</button>
							);
						})}
					</div>
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
