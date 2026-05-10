// STUB — board-article module removed from backend
// Kept only to prevent TypeScript build errors
// TODO: remove when community pages are transformed to Twit

export interface BoardArticle {
	_id: string;
	articleTitle: string;
	articleStatus: string;
	articleCategory: string;
	articleViews: number;
	articleLikes: number;
	articleContent: string;
	articleImage?: string;
	createdAt: Date;
	memberData?: any;
	meLiked?: any[];
}

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter: any[];
}

export interface BoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	search?: any;
}
