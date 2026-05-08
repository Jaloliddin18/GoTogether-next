import {
	BookAudience,
	BookCategory,
	BookFormat,
	BookLanguage,
	BookStatus,
	BookType,
} from '../../enums/book.enum';

interface BookPriceUpdateInput {
	amount?: number;
	currency?: string;
	discountPercent?: number;
	isDiscounted?: boolean;
}

interface BookDimensionsUpdateInput {
	widthCm?: number;
	heightCm?: number;
	weightGrams?: number;
}

interface BookRatingUpdateInput {
	average?: number;
	count?: number;
}

export interface UpdateBookInput {
	_id: string;
	bookTitle?: string;
	bookAuthor?: string;
	bookIsbn?: string;
	bookCallNumber?: string;
	bookImages?: string[];
	bookType?: BookType;
	bookCategory?: BookCategory;
	bookAudience?: BookAudience;
	bookFormat?: BookFormat;
	bookLanguage?: BookLanguage;
	bookPublishedYear?: number;
	bookPages?: number;
	bookDescription?: string;
	bookPrice?: BookPriceUpdateInput;
	bookDimensions?: BookDimensionsUpdateInput;
	isBorrowable?: boolean;
	isPurchasable?: boolean;
	bookLikes?: number;
	bookViews?: number;
	bookComments?: number;
	bookRank?: number;
	bookRating?: BookRatingUpdateInput;
	bookStatus?: BookStatus;
	deletedAt?: Date;
}

export interface UpdateBookAvailabilityInput {
	bookId: string;
	available: boolean;
	bookStatus?: BookStatus;
}
