import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { getJwtToken } from '../../../auth';
import { REACT_APP_API_URL } from '../../../config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../../sweetAlert';
import { BookAudience, BookCategory, BookFormat, BookLanguage, BookStatus, BookType } from '../../../enums/book.enum';
import { CREATE_BOOK, UPDATE_BOOK } from '../../../../apollo/admin/mutation';
import { GET_BOOK } from '../../../../apollo/user/query';
import { T } from '../../../types/common';

type Currency = 'KRW' | 'USD';

interface BookFormState {
	bookTitle: string;
	bookAuthor: string;
	bookIsbn: string;
	bookCallNumber: string;
	bookType: BookType | '';
	bookCategory: BookCategory | '';
	bookAudience: BookAudience | '';
	bookFormat: BookFormat | '';
	bookLanguage: BookLanguage | '';
	bookPublishedYear: number | '';
	bookPages: number | '';
	bookDescription: string;
	priceAmount: number | '';
	priceCurrency: Currency;
	priceIsDiscounted: boolean;
	priceDiscountPercent: number | '';
	isBorrowable: boolean;
	isPurchasable: boolean;
	bookStatus: BookStatus;
	bookImages: string[];
}

const EMPTY_STATE: BookFormState = {
	bookTitle: '',
	bookAuthor: '',
	bookIsbn: '',
	bookCallNumber: '',
	bookType: '',
	bookCategory: '',
	bookAudience: '',
	bookFormat: '',
	bookLanguage: '',
	bookPublishedYear: '',
	bookPages: '',
	bookDescription: '',
	priceAmount: '',
	priceCurrency: 'KRW',
	priceIsDiscounted: false,
	priceDiscountPercent: '',
	isBorrowable: true,
	isPurchasable: true,
	bookStatus: BookStatus.ACTIVE,
	bookImages: [],
};

const titleize = (raw?: string): string => {
	if (!raw) return '';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const resolveImage = (path: string): string => {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return `${REACT_APP_API_URL}/${path}`;
};

interface Props {
	mode: 'create' | 'edit';
}

const AddBook: React.FC<Props> = ({ mode }) => {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const token = getJwtToken();
	const [form, setForm] = useState<BookFormState>(EMPTY_STATE);
	const [submitting, setSubmitting] = useState(false);

	const editingId = mode === 'edit' ? (router.query.id as string | undefined) : undefined;

	const [createBook] = useMutation(CREATE_BOOK);
	const [updateBook] = useMutation(UPDATE_BOOK);

	const { data: getBookData } = useQuery(GET_BOOK, {
		fetchPolicy: 'network-only',
		skip: !editingId,
		variables: { input: editingId },
	});

	useEffect(() => {
		if (mode !== 'edit') return;
		const book = getBookData?.getBook;
		if (!book) return;
		setForm({
			bookTitle: book.bookTitle ?? '',
			bookAuthor: book.bookAuthor ?? '',
			bookIsbn: book.bookIsbn ?? '',
			bookCallNumber: book.bookCallNumber ?? '',
			bookType: book.bookType ?? '',
			bookCategory: book.bookCategory ?? '',
			bookAudience: book.bookAudience ?? '',
			bookFormat: book.bookFormat ?? '',
			bookLanguage: book.bookLanguage ?? '',
			bookPublishedYear: book.bookPublishedYear ?? '',
			bookPages: book.bookPages ?? '',
			bookDescription: book.bookDescription ?? '',
			priceAmount: book.bookPrice?.amount ?? '',
			priceCurrency: (book.bookPrice?.currency as Currency) ?? 'KRW',
			priceIsDiscounted: !!book.bookPrice?.isDiscounted,
			priceDiscountPercent: book.bookPrice?.discountPercent ?? '',
			isBorrowable: book.isBorrowable ?? true,
			isPurchasable: book.isPurchasable ?? true,
			bookStatus: (book.bookStatus as BookStatus) ?? BookStatus.ACTIVE,
			bookImages: book.bookImages ?? [],
		});
	}, [mode, getBookData]);

	const setField = <K extends keyof BookFormState>(key: K, value: BookFormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const isValid = useMemo(() => {
		return (
			form.bookTitle.trim() &&
			form.bookAuthor.trim() &&
			form.bookIsbn.trim() &&
			form.bookType &&
			form.bookCategory &&
			form.bookAudience &&
			form.bookFormat &&
			form.bookLanguage &&
			form.priceAmount !== '' &&
			Number(form.priceAmount) >= 0 &&
			form.bookImages.length > 0
		);
	}, [form]);

	async function uploadImages() {
		try {
			const files = inputRef.current?.files;
			if (!files || files.length === 0) return;

			const remainingSlots = 5 - form.bookImages.length;
			if (remainingSlots <= 0) {
				await sweetMixinErrorAlert('Maximum 5 images.');
				return;
			}
			const toUpload = Array.from(files).slice(0, remainingSlots);

			const formData = new FormData();
			const nulls = toUpload.map(() => null);
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
					}`,
					variables: {
						files: nulls,
						target: 'books',
					},
				}),
			);
			const map: T = {};
			toUpload.forEach((_f, i) => {
				map[String(i)] = [`variables.files.${i}`];
			});
			formData.append('map', JSON.stringify(map));
			toUpload.forEach((file, i) => {
				formData.append(String(i), file);
			});

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const uploaded: string[] = response.data?.data?.imagesUploader ?? [];
			setForm((prev) => ({ ...prev, bookImages: [...prev.bookImages, ...uploaded].slice(0, 5) }));
			if (inputRef.current) inputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Upload failed');
		}
	}

	const removeImage = (idx: number) => {
		setForm((prev) => ({ ...prev, bookImages: prev.bookImages.filter((_, i) => i !== idx) }));
	};

	const buildPayload = () => ({
		bookTitle: form.bookTitle.trim(),
		bookAuthor: form.bookAuthor.trim(),
		bookIsbn: form.bookIsbn.trim(),
		bookCallNumber: form.bookCallNumber.trim() || undefined,
		bookImages: form.bookImages,
		bookType: form.bookType as BookType,
		bookCategory: form.bookCategory as BookCategory,
		bookAudience: form.bookAudience as BookAudience,
		bookFormat: form.bookFormat as BookFormat,
		bookLanguage: form.bookLanguage as BookLanguage,
		bookPublishedYear: form.bookPublishedYear === '' ? undefined : Number(form.bookPublishedYear),
		bookPages: form.bookPages === '' ? undefined : Number(form.bookPages),
		bookDescription: form.bookDescription.trim() || undefined,
		bookPrice: {
			amount: Number(form.priceAmount),
			currency: form.priceCurrency,
			isDiscounted: form.priceIsDiscounted,
			discountPercent:
				form.priceIsDiscounted && form.priceDiscountPercent !== '' ? Number(form.priceDiscountPercent) : undefined,
		},
		isBorrowable: form.isBorrowable,
		isPurchasable: form.isPurchasable,
		bookStatus: form.bookStatus,
	});

	const submitHandler = async () => {
		if (!isValid || submitting) return;
		setSubmitting(true);
		try {
			const payload = buildPayload();
			if (mode === 'edit' && editingId) {
				await updateBook({ variables: { input: { _id: editingId, ...payload } } });
				await sweetMixinSuccessAlert('Book updated');
			} else {
				await createBook({ variables: { input: payload } });
				await sweetMixinSuccessAlert('Book created');
			}
			router.push('/_admin/books');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setSubmitting(false);
		}
	};

	const cancelHandler = () => router.push('/_admin/books');

	return (
		<div className="admin-form-shell">
			<div className="admin-page-header" style={{ padding: 0, marginBottom: 0 }}>
				<div>
					<h1 className="admin-page-title">{mode === 'edit' ? 'Edit Book' : 'Add Book'}</h1>
					<div className="admin-page-sub">
						{mode === 'edit' ? 'Update catalog entry' : 'Create a new catalog entry'}
					</div>
				</div>
			</div>

			{/* Section 1 — Basic Info */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Basic Info</h2>
				<div className="admin-field-grid">
					<div className="admin-field">
						<label className="admin-field-label">Title *</label>
						<input
							className="admin-input"
							value={form.bookTitle}
							onChange={(e) => setField('bookTitle', e.target.value)}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Author *</label>
						<input
							className="admin-input"
							value={form.bookAuthor}
							onChange={(e) => setField('bookAuthor', e.target.value)}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">ISBN *</label>
						<input
							className="admin-input"
							value={form.bookIsbn}
							onChange={(e) => setField('bookIsbn', e.target.value)}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Call Number</label>
						<input
							className="admin-input"
							value={form.bookCallNumber}
							onChange={(e) => setField('bookCallNumber', e.target.value)}
						/>
					</div>
				</div>
			</section>

			{/* Section 2 — Classification */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Classification</h2>
				<div className="admin-field-grid">
					<div className="admin-field">
						<label className="admin-field-label">Type *</label>
						<select
							className="admin-select"
							value={form.bookType}
							onChange={(e) => setField('bookType', e.target.value as BookType)}
						>
							<option value="">Select type</option>
							{Object.values(BookType).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Category *</label>
						<select
							className="admin-select"
							value={form.bookCategory}
							onChange={(e) => setField('bookCategory', e.target.value as BookCategory)}
						>
							<option value="">Select category</option>
							{Object.values(BookCategory).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Audience *</label>
						<select
							className="admin-select"
							value={form.bookAudience}
							onChange={(e) => setField('bookAudience', e.target.value as BookAudience)}
						>
							<option value="">Select audience</option>
							{Object.values(BookAudience).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Format *</label>
						<select
							className="admin-select"
							value={form.bookFormat}
							onChange={(e) => setField('bookFormat', e.target.value as BookFormat)}
						>
							<option value="">Select format</option>
							{Object.values(BookFormat).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Language *</label>
						<select
							className="admin-select"
							value={form.bookLanguage}
							onChange={(e) => setField('bookLanguage', e.target.value as BookLanguage)}
						>
							<option value="">Select language</option>
							{Object.values(BookLanguage).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
				</div>
			</section>

			{/* Section 3 — Details */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Details</h2>
				<div className="admin-field-grid">
					<div className="admin-field">
						<label className="admin-field-label">Published Year</label>
						<input
							type="number"
							className="admin-input"
							value={form.bookPublishedYear}
							onChange={(e) => setField('bookPublishedYear', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Pages</label>
						<input
							type="number"
							className="admin-input"
							value={form.bookPages}
							onChange={(e) => setField('bookPages', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
				</div>
				<div className="admin-field" style={{ marginTop: 16 }}>
					<label className="admin-field-label">Description</label>
					<textarea
						className="admin-textarea"
						value={form.bookDescription}
						onChange={(e) => setField('bookDescription', e.target.value)}
					/>
				</div>
			</section>

			{/* Section 4 — Pricing */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Pricing</h2>
				<div className="admin-field-grid">
					<div className="admin-field">
						<label className="admin-field-label">Amount *</label>
						<input
							type="number"
							className="admin-input"
							value={form.priceAmount}
							onChange={(e) => setField('priceAmount', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Currency</label>
						<select
							className="admin-select"
							value={form.priceCurrency}
							onChange={(e) => setField('priceCurrency', e.target.value as Currency)}
						>
							<option value="KRW">KRW</option>
							<option value="USD">USD</option>
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Discounted</label>
						<select
							className="admin-select"
							value={form.priceIsDiscounted ? 'yes' : 'no'}
							onChange={(e) => setField('priceIsDiscounted', e.target.value === 'yes')}
						>
							<option value="no">No</option>
							<option value="yes">Yes</option>
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Discount %</label>
						<input
							type="number"
							className="admin-input"
							value={form.priceDiscountPercent}
							disabled={!form.priceIsDiscounted}
							onChange={(e) => setField('priceDiscountPercent', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
				</div>
			</section>

			{/* Section 5 — Availability */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Availability</h2>
				<div className="admin-field-grid--3">
					<div className="admin-field">
						<label className="admin-field-label">Borrowable</label>
						<select
							className="admin-select"
							value={form.isBorrowable ? 'yes' : 'no'}
							onChange={(e) => setField('isBorrowable', e.target.value === 'yes')}
						>
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Purchasable</label>
						<select
							className="admin-select"
							value={form.isPurchasable ? 'yes' : 'no'}
							onChange={(e) => setField('isPurchasable', e.target.value === 'yes')}
						>
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Status</label>
						<select
							className="admin-select"
							value={form.bookStatus}
							onChange={(e) => setField('bookStatus', e.target.value as BookStatus)}
						>
							{Object.values(BookStatus).map((v) => (
								<option key={v} value={v}>
									{titleize(v)}
								</option>
							))}
						</select>
					</div>
				</div>
			</section>

			{/* Section 6 — Images */}
			<section className="admin-form-section">
				<h2 className="admin-form-section-title">Images ({form.bookImages.length}/5)</h2>
				<div
					className="admin-upload-box"
					onClick={() => inputRef.current?.click()}
					role="button"
					tabIndex={0}
				>
					<CloudUploadOutlinedIcon />
					<div className="admin-upload-title">Click to upload</div>
					<div className="admin-upload-hint">JPG or PNG, up to 5 images</div>
					<input
						ref={inputRef}
						type="file"
						hidden
						multiple
						accept="image/jpeg,image/jpg,image/png"
						onChange={uploadImages}
					/>
				</div>
				{form.bookImages.length > 0 && (
					<div className="admin-gallery">
						{form.bookImages.map((path, idx) => (
							<div className="admin-gallery-item" key={`${path}-${idx}`}>
								<img src={resolveImage(path)} alt="" />
								<button
									type="button"
									className="admin-gallery-remove"
									onClick={() => removeImage(idx)}
									aria-label="Remove image"
								>
									<CloseRoundedIcon />
								</button>
							</div>
						))}
					</div>
				)}
			</section>

			<div className="admin-form-actions">
				<button type="button" className="admin-btn admin-btn--ghost" onClick={cancelHandler}>
					Cancel
				</button>
				<button
					type="button"
					className="admin-btn admin-btn--primary"
					disabled={!isValid || submitting}
					onClick={submitHandler}
				>
					{submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save Book'}
				</button>
			</div>
		</div>
	);
};

export default AddBook;
