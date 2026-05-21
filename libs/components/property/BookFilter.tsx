import React, { useCallback, useState } from 'react';
import { Stack, Typography, Checkbox, OutlinedInput, IconButton, Tooltip, Slider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { BookAudience, BookCategory, BookFormat, BookLanguage, BookType } from '../../enums/book.enum';
import { BooksInquiry } from '../../types/book/book.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface BookFilterType {
	searchFilter: BooksInquiry;
	setSearchFilter: any;
	initialInput: BooksInquiry;
}

const formatLabel = (value: string) =>
	value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());

const SHOW_MORE_LIMIT = 3;

const BookFilter = (props: BookFilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>((searchFilter?.search as any)?.keyword ?? '');
	const [showAllLanguages, setShowAllLanguages] = useState(false);
	const [showAllAudiences, setShowAllAudiences] = useState(false);
	const [localRating, setLocalRating] = useState<number>((searchFilter?.search as any)?.minRating ?? 0);

	const bookCategories = Object.values(BookCategory);
	const bookTypes = Object.values(BookType);
	const bookFormats = Object.values(BookFormat);
	const bookLanguages = Object.values(BookLanguage);
	const bookAudiences = Object.values(BookAudience);

	/** HANDLERS **/
	const singleSelectHandler = useCallback(
		async (field: string, value: string) => {
			try {
				const currentSearch: any = searchFilter?.search ?? {};
				const newSearch = { ...currentSearch };
				if (newSearch[field] === value) {
					delete newSearch[field];
				} else {
					newSearch[field] = value;
				}
				await router.push(
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, singleSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const toggleHandler = useCallback(
		async (field: string) => {
			try {
				const currentSearch: any = searchFilter?.search ?? {};
				const newSearch = { ...currentSearch };
				if (newSearch[field] === true) {
					delete newSearch[field];
				} else {
					newSearch[field] = true;
				}
				await router.push(
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, toggleHandler:', err);
			}
		},
		[searchFilter],
	);

	const priceHandler = useCallback(
		async (value: number, type: 'min' | 'max') => {
			try {
				const field = type === 'min' ? 'minPrice' : 'maxPrice';
				const newSearch = { ...(searchFilter?.search ?? {}), [field]: value };
				await router.push(
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, priceHandler:', err);
			}
		},
		[searchFilter],
	);

	const ratingHandler = useCallback(
		async (value: number) => {
			try {
				const currentSearch: any = searchFilter?.search ?? {};
				const newSearch = { ...currentSearch };
				if (value > 0) {
					newSearch.minRating = value;
				} else {
					delete newSearch.minRating;
				}
				await router.push(
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					`/books?input=${JSON.stringify({ ...searchFilter, search: newSearch })}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, ratingHandler:', err);
			}
		},
		[searchFilter],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			setLocalRating(0);
			await router.push(
				`/books?input=${JSON.stringify(initialInput)}`,
				`/books?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>BOOKS FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				{/* Search */}
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Book</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'Search by title, author, or ISBN...'}
							inputProps={{ style: { paddingRight: '40px' } }}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(e: any) => {
								if (e.key === 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...(searchFilter?.search ?? {}), keyword: searchText },
									});
								}
							}}
							endAdornment={
								<CancelRoundedIcon
									onClick={() => {
										setSearchText('');
										setSearchFilter({
											...searchFilter,
											search: { ...(searchFilter?.search ?? {}), keyword: '' },
										});
									}}
								/>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset All Filters">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>

				{/* Book Category */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Book Category</Typography>
					<Stack className={'book-filter-scroll'}>
						{bookCategories.map((cat) => (
							<Stack className={'input-box'} key={cat}>
								<Checkbox
									id={`cat-${cat}`}
									className="property-checkbox"
									color="primary"
									size="small"
									value={cat}
									checked={(searchFilter?.search as any)?.bookCategory === cat}
									onChange={() => singleSelectHandler('bookCategory', cat)}
								/>
								<label htmlFor={`cat-${cat}`} style={{ cursor: 'pointer' }}>
									<Typography className="property-type">{formatLabel(cat)}</Typography>
								</label>
							</Stack>
						))}
					</Stack>
				</Stack>

				{/* Book Type */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Book Type</Typography>
					<Stack className={'book-filter-scroll'}>
						{bookTypes.map((type) => (
							<Stack className={'input-box'} key={type}>
								<Checkbox
									id={`type-${type}`}
									className="property-checkbox"
									color="primary"
									size="small"
									value={type}
									checked={(searchFilter?.search as any)?.bookType === type}
									onChange={() => singleSelectHandler('bookType', type)}
								/>
								<label htmlFor={`type-${type}`} style={{ cursor: 'pointer' }}>
									<Typography className="property-type">{formatLabel(type)}</Typography>
								</label>
							</Stack>
						))}
					</Stack>
				</Stack>

				{/* Book Format */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Format</Typography>
					{bookFormats.map((fmt) => (
						<Stack className={'input-box'} key={fmt}>
							<Checkbox
								id={`fmt-${fmt}`}
								className="property-checkbox"
								color="primary"
								size="small"
								value={fmt}
								checked={(searchFilter?.search as any)?.bookFormat === fmt}
								onChange={() => singleSelectHandler('bookFormat', fmt)}
							/>
							<label htmlFor={`fmt-${fmt}`} style={{ cursor: 'pointer' }}>
								<Typography className="property-type">{formatLabel(fmt)}</Typography>
							</label>
						</Stack>
					))}
				</Stack>

				{/* Book Language */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Language</Typography>
					{(showAllLanguages ? bookLanguages : bookLanguages.slice(0, SHOW_MORE_LIMIT)).map((lang) => (
						<Stack className={'input-box'} key={lang}>
							<Checkbox
								id={`lang-${lang}`}
								className="property-checkbox"
								color="primary"
								size="small"
								value={lang}
								checked={(searchFilter?.search as any)?.bookLanguage === lang}
								onChange={() => singleSelectHandler('bookLanguage', lang)}
							/>
							<label htmlFor={`lang-${lang}`} style={{ cursor: 'pointer' }}>
								<Typography className="property-type">{formatLabel(lang)}</Typography>
							</label>
						</Stack>
					))}
					{bookLanguages.length > SHOW_MORE_LIMIT && (
						<button
							onClick={() => setShowAllLanguages((prev) => !prev)}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '2px',
								marginTop: '8px',
								background: 'none',
								border: 'none',
								padding: 0,
								cursor: 'pointer',
								color: '#64748B',
								fontSize: '14px',
								fontFamily: 'inherit',
							}}
							onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#1A1A2E')}
							onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#64748B')}
						>
							{showAllLanguages ? (
								<>Show less <KeyboardArrowUpIcon style={{ fontSize: '16px' }} /></>
							) : (
								<>Show more <KeyboardArrowDownIcon style={{ fontSize: '16px' }} /></>
							)}
						</button>
					)}
				</Stack>

				{/* Book Audience */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Audience</Typography>
					{(showAllAudiences ? bookAudiences : bookAudiences.slice(0, SHOW_MORE_LIMIT)).map((aud) => (
						<Stack className={'input-box'} key={aud}>
							<Checkbox
								id={`aud-${aud}`}
								className="property-checkbox"
								color="primary"
								size="small"
								value={aud}
								checked={(searchFilter?.search as any)?.bookAudience === aud}
								onChange={() => singleSelectHandler('bookAudience', aud)}
							/>
							<label htmlFor={`aud-${aud}`} style={{ cursor: 'pointer' }}>
								<Typography className="property-type">{formatLabel(aud)}</Typography>
							</label>
						</Stack>
					))}
					{bookAudiences.length > SHOW_MORE_LIMIT && (
						<button
							onClick={() => setShowAllAudiences((prev) => !prev)}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '2px',
								marginTop: '8px',
								background: 'none',
								border: 'none',
								padding: 0,
								cursor: 'pointer',
								color: '#64748B',
								fontSize: '14px',
								fontFamily: 'inherit',
							}}
							onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#1A1A2E')}
							onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#64748B')}
						>
							{showAllAudiences ? (
								<>Show less <KeyboardArrowUpIcon style={{ fontSize: '16px' }} /></>
							) : (
								<>Show more <KeyboardArrowDownIcon style={{ fontSize: '16px' }} /></>
							)}
						</button>
					)}
				</Stack>

				{/* Availability */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Availability</Typography>
					<Stack className={'input-box'}>
						<Checkbox
							id={'borrowable'}
							className="property-checkbox"
							color="primary"
							size="small"
							checked={(searchFilter?.search as any)?.isBorrowable === true}
							onChange={() => toggleHandler('isBorrowable')}
						/>
						<label htmlFor={'borrowable'} style={{ cursor: 'pointer' }}>
							<Typography className="property-type">Borrowable Only</Typography>
						</label>
					</Stack>
					<Stack className={'input-box'}>
						<Checkbox
							id={'purchasable'}
							className="property-checkbox"
							color="primary"
							size="small"
							checked={(searchFilter?.search as any)?.isPurchasable === true}
							onChange={() => toggleHandler('isPurchasable')}
						/>
						<label htmlFor={'purchasable'} style={{ cursor: 'pointer' }}>
							<Typography className="property-type">Purchasable Only</Typography>
						</label>
					</Stack>
				</Stack>

				{/* Minimum Rating */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography
							style={{
								fontSize: '12px',
								fontWeight: 600,
								color: '#64748B',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
							}}
						>
							Minimum Rating
						</Typography>
						<Typography
							style={{
								fontSize: '14px',
								color: localRating === 0 ? '#2E86DE' : '#1A1A2E',
								fontWeight: 500,
							}}
						>
							{localRating === 0 ? 'Any' : localRating.toFixed(1)}
						</Typography>
					</Stack>
					<Slider
						value={localRating}
						min={0}
						max={5}
						step={0.5}
						onChange={(_e, val) => setLocalRating(val as number)}
						onChangeCommitted={(_e, val) => ratingHandler(val as number)}
						sx={{
							color: '#1B3A6B',
							'& .MuiSlider-track': { backgroundColor: '#1B3A6B' },
							'& .MuiSlider-thumb': { backgroundColor: '#1B3A6B' },
							'& .MuiSlider-rail': { backgroundColor: '#E2E8F0' },
						}}
					/>
				</Stack>

				{/* Price Range */}
				<Stack className={'find-your-home'}>
					<Stack direction="row" justifyContent="space-between" mb={'8px'}>
						<Typography
							style={{
								fontSize: '12px',
								fontWeight: 600,
								color: '#64748B',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
							}}
						>
							Min Price
						</Typography>
						<Typography
							style={{
								fontSize: '12px',
								fontWeight: 600,
								color: '#64748B',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
							}}
						>
							Max Price
						</Typography>
					</Stack>
					<Stack className="square-year-input">
						<Stack direction="row" alignItems="center" style={{ width: '100%', position: 'relative' }}>
							<Typography
								style={{
									position: 'absolute',
									left: '12px',
									color: '#64748B',
									fontSize: '14px',
									zIndex: 1,
									pointerEvents: 'none',
								}}
							>
								₩
							</Typography>
							<input
								type="number"
								min={0}
								step={5000}
								value={(searchFilter?.search as any)?.minPrice ?? 0}
								onChange={(e: any) => {
									if (Number(e.target.value) >= 0) priceHandler(Number(e.target.value), 'min');
								}}
								style={{
									width: '100%',
									height: '49px',
									borderRadius: '8px',
									border: '1px solid #E2E8F0',
									background: '#fff',
									outline: 'none',
									paddingLeft: '30px',
								}}
								onFocus={(e) => (e.target.style.borderColor = '#1B3A6B')}
								onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
							/>
						</Stack>
						<div className="central-divider"></div>
						<Stack direction="row" alignItems="center" style={{ width: '100%', position: 'relative' }}>
							<Typography
								style={{
									position: 'absolute',
									left: '12px',
									color: '#64748B',
									fontSize: '14px',
									zIndex: 1,
									pointerEvents: 'none',
								}}
							>
								₩
							</Typography>
							<input
								type="number"
								min={0}
								step={5000}
								value={(searchFilter?.search as any)?.maxPrice ?? 0}
								onChange={(e: any) => {
									if (Number(e.target.value) >= 0) priceHandler(Number(e.target.value), 'max');
								}}
								style={{
									width: '100%',
									height: '49px',
									borderRadius: '8px',
									border: '1px solid #E2E8F0',
									background: '#fff',
									outline: 'none',
									paddingLeft: '30px',
								}}
								onFocus={(e) => (e.target.style.borderColor = '#1B3A6B')}
								onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
							/>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default BookFilter;
