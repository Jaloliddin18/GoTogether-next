import { Direction } from '../../enums/common.enum';
import {
	LibraryBookAudience,
	LibraryBookCategory,
	LibraryBookFormat,
	LibraryBookLanguage,
	LibraryBookStatus,
	LibraryBookType,
} from '../../enums/library.enum';
import { LibraryMeLiked, LibraryTotalCounter } from './common';

export interface LibraryBookPrice {
	amount: number;
	currency: string;
	discountPercent?: number;
	isDiscounted: boolean;
}

export interface LibraryBookDimensions {
	widthCm: number;
	heightCm: number;
	weightGrams: number;
}

export interface LibraryBookRating {
	average: number;
	count: number;
}

export interface LibraryBook {
	_id: string;
	bookTitle: string;
	bookAuthor: string;
	bookIsbn: string;
	bookCallNumber?: string;
	bookImages: string[];
	bookType: LibraryBookType;
	bookCategory: LibraryBookCategory;
	bookAudience: LibraryBookAudience;
	bookFormat: LibraryBookFormat;
	bookLanguage: LibraryBookLanguage;
	bookPublishedYear?: number;
	bookPages?: number;
	bookDescription?: string;
	bookPrice: LibraryBookPrice;
	bookDimensions?: LibraryBookDimensions;
	isBorrowable: boolean;
	isPurchasable: boolean;
	bookLikes: number;
	bookViews: number;
	bookComments: number;
	bookRank: number;
	bookRating: LibraryBookRating;
	bookStatus: LibraryBookStatus;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: LibraryMeLiked[];
}

export interface LibraryBooks {
	list: LibraryBook[];
	metaCounter: LibraryTotalCounter[];
}

export interface LibraryBookSearchInput {
	keyword?: string;
	bookTitle?: string;
	bookAuthor?: string;
	bookIsbn?: string;
	bookCallNumber?: string;
	bookCategory?: LibraryBookCategory;
	bookType?: LibraryBookType;
	bookAudience?: LibraryBookAudience;
	bookFormat?: LibraryBookFormat;
	bookLanguage?: LibraryBookLanguage;
	bookStatus?: LibraryBookStatus;
	isBorrowable?: boolean;
	isPurchasable?: boolean;
	minPrice?: number;
	maxPrice?: number;
	minRating?: number;
}

export interface LibraryBooksInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: LibraryBookSearchInput;
}
