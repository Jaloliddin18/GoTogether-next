import { Direction } from '../../enums/common.enum';
import {
	BookAudience,
	BookCategory,
	BookFormat,
	BookLanguage,
	BookStatus,
	BookType,
} from '../../enums/book.enum';

export interface BookPriceInput {
	amount: number;
	currency?: string;
	discountPercent?: number;
	isDiscounted?: boolean;
}

export interface BookDimensionsInput {
	widthCm?: number;
	heightCm?: number;
	weightGrams?: number;
}

export interface CreateBookInput {
	bookTitle: string;
	bookAuthor: string;
	bookIsbn: string;
	bookCallNumber?: string;
	bookImages: string[];
	bookType: BookType;
	bookCategory: BookCategory;
	bookAudience: BookAudience;
	bookFormat: BookFormat;
	bookLanguage: BookLanguage;
	bookPublishedYear?: number;
	bookPages?: number;
	bookDescription?: string;
	bookPrice: BookPriceInput;
	bookDimensions?: BookDimensionsInput;
	isBorrowable?: boolean;
	isPurchasable?: boolean;
	bookStatus?: BookStatus;
}

interface BookSearchInput {
	keyword?: string;
	bookTitle?: string;
	bookAuthor?: string;
	bookIsbn?: string;
	bookCallNumber?: string;
	bookCategory?: BookCategory;
	bookType?: BookType;
	bookAudience?: BookAudience;
	bookFormat?: BookFormat;
	bookLanguage?: BookLanguage;
	bookStatus?: BookStatus;
	isBorrowable?: boolean;
	isPurchasable?: boolean;
	minPrice?: number;
	maxPrice?: number;
	minRating?: number;
}

export interface BooksInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: BookSearchInput;
}

interface ABISearch {
	bookStatus?: BookStatus;
	bookCategoryList?: BookCategory[];
}

export interface AllBooksInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: ABISearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}
