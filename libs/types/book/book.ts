import {
	BookAudience,
	BookCategory,
	BookFormat,
	BookLanguage,
	BookStatus,
	BookType,
} from '../../enums/book.enum';
import { MeLiked, TotalCounter } from '../property/property';

export interface BookPrice {
	amount: number;
	currency: string;
	discountPercent?: number;
	isDiscounted: boolean;
}

export interface BookDimensions {
	widthCm: number;
	heightCm: number;
	weightGrams: number;
}

export interface BookRating {
	average: number;
	count: number;
}

export interface Book {
	_id: string;
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
	bookPrice: BookPrice;
	bookDimensions?: BookDimensions;
	isBorrowable: boolean;
	isPurchasable: boolean;
	bookLikes: number;
	bookViews: number;
	bookComments: number;
	bookRank: number;
	bookRating: BookRating;
	bookStatus: BookStatus;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
}

export interface Books {
	list: Book[];
	metaCounter: TotalCounter[];
}
