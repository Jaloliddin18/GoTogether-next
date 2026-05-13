import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberBooks
			memberTwits
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberBooks
			memberTwits
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberBooks
			memberTwits
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberBooks
			memberTwits
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        BOOK        *
 *************************/

export const CREATE_PROPERTY = gql`mutation CreateProperty { __typename }`;

export const LIKE_TARGET_BOOK = gql`
	mutation LikeTargetBook($input: String!) {
		likeTargetBook(bookId: $input) {
			_id
			bookTitle
			bookAuthor
			bookIsbn
			bookCallNumber
			bookImages
			bookType
			bookCategory
			bookAudience
			bookFormat
			bookLanguage
			bookPublishedYear
			bookPages
			bookDescription
			isBorrowable
			isPurchasable
			bookLikes
			bookViews
			bookComments
			bookRank
			bookStatus
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_BOOK = LIKE_TARGET_BOOK;

/**************************
 *      REQUEST     *
 *************************/

export const CREATE_DELIVERY_REQUEST = gql`
	mutation CreateDeliveryRequest($input: CreateDeliveryRequestInput!) {
		createDeliveryRequest(input: $input) {
			_id
			bookId
			sourceInventoryId
			requestType
			robotId
			memberId
			sessionId
			destinationDeskId
			destinationType
			status
			paymentStatus
			createdAt
			updatedAt
			destination {
				floorId
				x
				y
				theta
			}
			timeline {
				status
				message
				timestamp
			}
			error {
				code
				message
				timestamp
			}
		}
	}
`;

export const CANCEL_REQUEST = gql`
	mutation CancelRequest($input: CancelRequestInput!) {
		cancelRequest(input: $input) {
			_id
			bookId
			sourceInventoryId
			requestType
			robotId
			memberId
			sessionId
			destinationDeskId
			destinationType
			status
			paymentStatus
			createdAt
			updatedAt
			destination {
				floorId
				x
				y
				theta
			}
			timeline {
				status
				message
				timestamp
			}
			error {
				code
				message
				timestamp
			}
		}
	}
`;

/**************************
 *      TWIT     *
 *************************/

export const CREATE_TWIT = gql`
	mutation CreateTwit($input: CreateTwitInput!) {
		createTwit(input: $input) {
			_id
			memberId
			text
			image
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TWIT = gql`
	mutation LikeTwit($input: String!) {
		likeTwit(twitId: $input) {
			_id
			memberId
			text
			image
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_TWIT = gql`
	mutation DeleteTwit($input: String!) {
		deleteTwit(twitId: $input) {
			_id
			memberId
			text
			image
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const CREATE_TWIT_COMMENT = gql`
	mutation CreateTwitComment($input: CreateTwitCommentInput!) {
		createTwitComment(input: $input) {
			_id
			twitId
			memberId
			text
			parentCommentId
			depth
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
			meLiked
		}
	}
`;

export const UPDATE_TWIT_COMMENT = gql`
	mutation UpdateTwitComment($input: UpdateTwitCommentInput!) {
		updateTwitComment(input: $input) {
			_id
			twitId
			memberId
			text
			parentCommentId
			depth
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
			meLiked
		}
	}
`;

export const DELETE_TWIT_COMMENT = gql`
	mutation DeleteTwitComment($input: String!) {
		deleteTwitComment(commentId: $input) {
			_id
			twitId
			memberId
			text
			parentCommentId
			depth
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
			meLiked
		}
	}
`;

export const LIKE_TWIT_COMMENT = gql`
	mutation LikeTwitComment($input: String!) {
		likeTwitComment(commentId: $input) {
			_id
			twitId
			memberId
			text
			parentCommentId
			depth
			likes
			likeCount
			deletedAt
			createdAt
			updatedAt
			meLiked
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

// STUB operations — removed from backend
// TODO: remove when legacy pages are transformed
export const LIKE_TARGET_PROPERTY = gql`mutation LikeTargetProperty { __typename }`;
export const LIKE_TARGET_BOARD_ARTICLE = gql`mutation LikeTargetBoardArticle { __typename }`;
export const CREATE_BOARD_ARTICLE = gql`mutation CreateBoardArticle { __typename }`;
export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`mutation UpdateBoardArticleByAdmin { __typename }`;
export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`mutation RemoveBoardArticleByAdmin { __typename }`;
export const UPDATE_PROPERTY = gql`mutation UpdateProperty { __typename }`;
