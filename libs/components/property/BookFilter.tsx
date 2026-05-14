import React, { useCallback, useState } from 'react';
import { Stack, Typography, Checkbox, OutlinedInput, IconButton, Tooltip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { BookAudience, BookCategory, BookFormat, BookLanguage, BookType } from '../../enums/book.enum';
import { BooksInquiry } from '../../types/book/book.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

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

const BookFilter = (props: BookFilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>((searchFilter?.search as any)?.keyword ?? '');

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

	const refreshHandler = async () => {
		try {
			setSearchText('');
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
							placeholder={'Title, author, or keyword…'}
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
					{bookLanguages.map((lang) => (
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
				</Stack>

				{/* Book Audience */}
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Audience</Typography>
					{bookAudiences.map((aud) => (
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

				{/* Price Range */}
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price Range</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="Min price"
							min={0}
							value={(searchFilter?.search as any)?.minPrice ?? 0}
							onChange={(e: any) => {
								if (Number(e.target.value) >= 0) priceHandler(Number(e.target.value), 'min');
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="Max price"
							min={0}
							value={(searchFilter?.search as any)?.maxPrice ?? 0}
							onChange={(e: any) => {
								if (Number(e.target.value) >= 0) priceHandler(Number(e.target.value), 'max');
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default BookFilter;
