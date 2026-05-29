import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import Skeleton from '@mui/material/Skeleton';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { getJwtToken } from '../../../auth';
import { API_BASE_URL } from '../../../config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../../sweetAlert';
import { BookAudience, BookCategory, BookFormat, BookLanguage, BookStatus, BookType } from '../../../enums/book.enum';
import { CREATE_BOOK, UPDATE_BOOK } from '../../../../apollo/admin/mutation';
import { GET_BOOK, GET_BOOKS } from '../../../../apollo/user/query';
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
	bookWidthCm: number | '';
	bookHeightCm: number | '';
	bookWeightGrams: number | '';
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
	bookWidthCm: '',
	bookHeightCm: '',
	bookWeightGrams: '',
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

const MAX_BOOK_IMAGES = 5;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

const titleize = (raw?: string): string => {
	if (!raw) return '';
	return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const resolveImage = (path: string): string => {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return `${API_BASE_URL}/${path}`;
};

const sanitizeImagePaths = (raw: unknown): string[] => {
	if (!Array.isArray(raw)) return [];
	return raw
		.filter((path): path is string => typeof path === 'string')
		.map((path) => path.trim())
		.filter((path) => path.length > 0);
};

interface Props {
	mode: 'create' | 'edit';
}

const AddBook: React.FC<Props> = ({ mode }) => {
	const router = useRouter();
	const apolloClient = useApolloClient();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const token = getJwtToken();
	const [form, setForm] = useState<BookFormState>(EMPTY_STATE);
	const [submitting, setSubmitting] = useState(false);

	const editingId = mode === 'edit' ? (router.query.id as string | undefined) : undefined;

	const [createBook] = useMutation(CREATE_BOOK);
	const [updateBook] = useMutation(UPDATE_BOOK);

	const { loading: getBookLoading, data: getBookData } = useQuery(GET_BOOK, {
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
			bookWidthCm: book.bookDimensions?.widthCm ?? '',
			bookHeightCm: book.bookDimensions?.heightCm ?? '',
			bookWeightGrams: book.bookDimensions?.weightGrams ?? '',
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

	const validateForm = (): string | null => {
		const title = form.bookTitle.trim();
		if (!title) return 'Title is required.';
		if (title.length > 200) return 'Title must be 1 to 200 characters.';

		const author = form.bookAuthor.trim();
		if (!author) return 'Author is required.';
		if (author.length > 120) return 'Author must be 1 to 120 characters.';

		const isbn = form.bookIsbn.trim();
		if (!isbn) return 'ISBN is required.';
		if (isbn.length < 3 || isbn.length > 40) return 'ISBN must be 3 to 40 characters.';

		const callNumber = form.bookCallNumber.trim();
		if (callNumber.length > 80) return 'Call Number must be 80 characters or fewer.';

		if (!form.bookType) return 'Book type is required.';
		if (!form.bookCategory) return 'Book category is required.';
		if (!form.bookAudience) return 'Book audience is required.';
		if (!form.bookFormat) return 'Book format is required.';
		if (!form.bookLanguage) return 'Book language is required.';

		const description = form.bookDescription.trim();
		if (description.length > 1000) return 'Description must be 1000 characters or fewer.';

		if (form.bookPublishedYear !== '' && (!Number.isFinite(form.bookPublishedYear) || form.bookPublishedYear < 0)) {
			return 'Published Year must be 0 or greater.';
		}

		if (form.bookPages !== '' && (!Number.isFinite(form.bookPages) || form.bookPages < 0)) {
			return 'Pages must be 0 or greater.';
		}

		if (form.bookWidthCm !== '' && (!Number.isFinite(form.bookWidthCm) || form.bookWidthCm < 0)) {
			return 'Width (cm) must be 0 or greater.';
		}

		if (form.bookHeightCm !== '' && (!Number.isFinite(form.bookHeightCm) || form.bookHeightCm < 0)) {
			return 'Height (cm) must be 0 or greater.';
		}

		if (form.bookWeightGrams !== '' && (!Number.isFinite(form.bookWeightGrams) || form.bookWeightGrams < 0)) {
			return 'Weight (g) must be 0 or greater.';
		}

		if (form.priceAmount === '' || !Number.isFinite(form.priceAmount)) {
			return 'Price amount is required.';
		}
		if (form.priceAmount < 0) return 'Price amount must be 0 or greater.';

		if (
			form.priceIsDiscounted &&
			form.priceDiscountPercent !== '' &&
			(!Number.isFinite(form.priceDiscountPercent) || form.priceDiscountPercent < 0)
		) {
			return 'Discount % must be 0 or greater.';
		}

		const imagePaths = sanitizeImagePaths(form.bookImages);
		if (imagePaths.length < 1) return 'At least one image is required.';
		if (imagePaths.length > MAX_BOOK_IMAGES) return `Maximum ${MAX_BOOK_IMAGES} images are allowed.`;

		return null;
	};

	const checkDuplicateIsbn = async (bookIsbn: string): Promise<boolean> => {
		const { data } = await apolloClient.query({
			query: GET_BOOKS,
			fetchPolicy: 'network-only',
			variables: {
				input: {
					page: 1,
					limit: 1,
					sort: 'createdAt',
					direction: 'DESC',
					search: { bookIsbn },
				},
			},
		});
		const total = data?.getBooks?.metaCounter?.[0]?.total ?? 0;
		return total > 0;
	};

	async function uploadImages() {
		try {
			const files = inputRef.current?.files;
			if (!files || files.length === 0) return;
			const selectedFiles = Array.from(files);
			const invalidFile = selectedFiles.find((file) => !ALLOWED_IMAGE_MIME_TYPES.has(file.type.toLowerCase()));
			if (invalidFile) {
				if (inputRef.current) inputRef.current.value = '';
				await sweetMixinErrorAlert('Only JPG and PNG images are allowed.');
				return;
			}

			const remainingSlots = MAX_BOOK_IMAGES - form.bookImages.length;
			if (remainingSlots <= 0) {
				if (inputRef.current) inputRef.current.value = '';
				await sweetMixinErrorAlert(`Maximum ${MAX_BOOK_IMAGES} images are allowed.`);
				return;
			}
			const toUpload = selectedFiles.slice(0, remainingSlots);
			if (selectedFiles.length > remainingSlots) {
				await sweetMixinErrorAlert(
					`Only ${remainingSlots} image(s) can be uploaded now. Maximum ${MAX_BOOK_IMAGES} images are allowed.`,
				);
			}

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

			const uploaded = sanitizeImagePaths(response.data?.data?.imagesUploader);
			if (uploaded.length === 0) {
				await sweetMixinErrorAlert('Image upload failed. No images were uploaded.');
				if (inputRef.current) inputRef.current.value = '';
				return;
			}

			setForm((prev) => ({ ...prev, bookImages: [...prev.bookImages, ...uploaded].slice(0, MAX_BOOK_IMAGES) }));
			if (uploaded.length < toUpload.length) {
				await sweetMixinErrorAlert(
					`Some images failed to upload (${uploaded.length}/${toUpload.length}). Please retry the failed files.`,
				);
			}
			if (inputRef.current) inputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Upload failed');
		}
	}

	const removeImage = (idx: number) => {
		setForm((prev) => ({ ...prev, bookImages: prev.bookImages.filter((_, i) => i !== idx) }));
	};

	const buildPayload = () => {
		const hasDimensions = form.bookWidthCm !== '' || form.bookHeightCm !== '' || form.bookWeightGrams !== '';

		return {
			bookTitle: form.bookTitle.trim(),
			bookAuthor: form.bookAuthor.trim(),
			bookIsbn: form.bookIsbn.trim(),
			bookCallNumber: form.bookCallNumber.trim() || undefined,
			bookImages: sanitizeImagePaths(form.bookImages).slice(0, MAX_BOOK_IMAGES),
			bookType: form.bookType as BookType,
			bookCategory: form.bookCategory as BookCategory,
			bookAudience: form.bookAudience as BookAudience,
			bookFormat: form.bookFormat as BookFormat,
			bookLanguage: form.bookLanguage as BookLanguage,
			bookPublishedYear: form.bookPublishedYear === '' ? undefined : Number(form.bookPublishedYear),
			bookPages: form.bookPages === '' ? undefined : Number(form.bookPages),
			bookDimensions: hasDimensions
				? {
						widthCm: form.bookWidthCm === '' ? undefined : Number(form.bookWidthCm),
						heightCm: form.bookHeightCm === '' ? undefined : Number(form.bookHeightCm),
						weightGrams: form.bookWeightGrams === '' ? undefined : Number(form.bookWeightGrams),
					}
				: undefined,
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
		};
	};

	const submitHandler = async () => {
		if (submitting) return;
		const validationError = validateForm();
		if (validationError) {
			await sweetMixinErrorAlert(validationError);
			return;
		}
		setSubmitting(true);
		try {
			const payload = buildPayload();
			if (mode === 'edit' && editingId) {
				await updateBook({ variables: { input: { _id: editingId, ...payload } } });
				await sweetMixinSuccessAlert('Book updated');
			} else {
				const duplicateIsbn = await checkDuplicateIsbn(payload.bookIsbn);
				if (duplicateIsbn) {
					await sweetMixinErrorAlert('ISBN already exists in catalog.');
					return;
				}
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

	if (mode === 'edit' && editingId && getBookLoading && !getBookData?.getBook) {
		return (
			<div className="admin-form-shell">
				<div className="admin-page-header" style={{ padding: 0, marginTop: 12, marginBottom: 0 }}>
					<div>
						<Skeleton variant="text" animation="wave" width={220} height={44} />
						<Skeleton variant="text" animation="wave" width={280} height={24} />
					</div>
				</div>
				{Array.from({ length: 5 }).map((_, index) => (
					<section className="admin-form-section" key={`add-book-edit-skeleton-${index}`}>
						<Skeleton variant="text" animation="wave" width={170} height={32} />
						<Skeleton variant="rounded" animation="wave" width="100%" height={90} />
					</section>
				))}
			</div>
		);
	}

	return (
		<div className="admin-form-shell">
			<div className="admin-page-header" style={{ padding: 0, marginTop: 12, marginBottom: 0 }}>
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
				<div className="admin-field-grid" style={{ marginTop: 16 }}>
					<div className="admin-field">
						<label className="admin-field-label">Width (cm)</label>
						<input
							type="number"
							className="admin-input"
							value={form.bookWidthCm}
							onChange={(e) => setField('bookWidthCm', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Height (cm)</label>
						<input
							type="number"
							className="admin-input"
							value={form.bookHeightCm}
							onChange={(e) => setField('bookHeightCm', e.target.value === '' ? '' : Number(e.target.value))}
						/>
					</div>
					<div className="admin-field">
						<label className="admin-field-label">Weight (g)</label>
						<input
							type="number"
							className="admin-input"
							value={form.bookWeightGrams}
							onChange={(e) => setField('bookWeightGrams', e.target.value === '' ? '' : Number(e.target.value))}
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
				<h2 className="admin-form-section-title">
					Images ({form.bookImages.length}/{MAX_BOOK_IMAGES})
				</h2>
				<div
					className="admin-upload-box"
					onClick={() => inputRef.current?.click()}
					role="button"
					tabIndex={0}
				>
					<CloudUploadOutlinedIcon />
					<div className="admin-upload-title">Click to upload</div>
					<div className="admin-upload-hint">JPG or PNG, up to {MAX_BOOK_IMAGES} images</div>
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
					disabled={submitting}
					onClick={submitHandler}
				>
					{submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save Book'}
				</button>
			</div>
		</div>
	);
};

export default AddBook;
