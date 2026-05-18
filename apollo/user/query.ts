import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql(`
  query GetMember ($input: String!) {
    getMember(memberId: $input) {
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
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
        meFollowed {
            followingId
            followerId
            myFollowing
        }
    }
}
`);

/**************************
 *        BOOKS        *
 *************************/

export const GET_BOOKS = gql`
	query GetBooks($input: BooksInquiry!) {
		getBooks(input: $input) {
			list {
				_id
				bookTitle
				bookAuthor
				bookImages
				bookCategory
				bookLanguage
				bookViews
				bookLikes
				bookRank
				bookRating {
					average
					count
				}
				bookPrice {
					amount
					currency
					isDiscounted
					discountPercent
				}
				isBorrowable
				isPurchasable
				bookStatus
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOOK = gql`
	query GetBook($input: String!) {
		getBook(bookId: $input) {
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
			bookPrice {
				amount
				currency
				discountPercent
				isDiscounted
			}
			bookDimensions {
				widthCm
				heightCm
				weightGrams
			}
			bookRating {
				average
				count
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_FAVORITE_BOOKS = gql`
	query GetFavoriteBooks($input: OrdinaryInquiry!) {
		getFavoriteBooks(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED_BOOKS = gql`
	query GetVisitedBooks($input: OrdinaryInquiry!) {
		getVisitedBooks(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      REQUEST     *
 *************************/

export const GET_SESSION_REQUESTS = gql`
	query GetSessionRequests($input: SessionRequestsInquiry!) {
		getSessionRequests(input: $input) {
			list {
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
				bookData {
					_id
					bookTitle
					bookAuthor
					bookImages
					bookCallNumber
					bookStatus
					bookType
					bookCategory
				}
				robotData {
					_id
					robotId
					status
					isOnline
					battery
					lastSeenAt
					currentPose {
						floorId
						x
						y
						theta
					}
				}
				timeline {
					status
					message
					timestamp
				}
				destination {
					floorId
					x
					y
					theta
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				followerData {
					_id
					memberType
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberFollowers
					memberFollowings
					memberLikes
					createdAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				followingData {
					_id
					memberType
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberFollowers
					memberFollowings
					memberLikes
					createdAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         TWIT        *
 *************************/

export const GET_TWITS = gql`
	query GetTwits($input: TwitsInquiry!) {
		getTwits(input: $input) {
			list {
				_id
				memberId
				text
				images
				meLiked
				likeCount
				viewCount
				deletedAt
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TWIT = gql`
	query GetTwit($input: TwitInquiry!) {
		getTwit(input: $input) {
			_id
			memberId
			text
			images
			meLiked
			likeCount
			viewCount
			createdAt
			updatedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
			}
		}
	}
`;

export const GET_MEMBER_TWITS = gql`
	query GetMemberTwits($input: TwitsInquiry!) {
		getMemberTwits(input: $input) {
			list {
				_id
				memberId
				text
				images
				meLiked
				likeCount
				viewCount
				deletedAt
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TWIT_COMMENTS = gql`
	query GetTwitComments($input: TwitCommentsInquiry!) {
		getTwitComments(input: $input) {
			list {
				_id
				twitId
				memberId
				text
				parentCommentId
				depth
				likeCount
				deletedAt
				createdAt
				updatedAt
				meLiked
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

// STUB operations — removed from backend
// TODO: remove when legacy pages are transformed
export const GET_AGENTS = gql`
	query GetAgents {
		__typename
	}
`;
export const GET_PROPERTIES = gql`
	query GetProperties {
		__typename
	}
`;
export const GET_PROPERTY = gql`
	query GetProperty {
		__typename
	}
`;
export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles {
		__typename
	}
`;
export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle {
		__typename
	}
`;
export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin {
		__typename
	}
`;
export const GET_FAVORITES = gql`
	query GetFavorites {
		__typename
	}
`;
export const GET_VISITED = gql`
	query GetVisited {
		__typename
	}
`;
export const GET_AGENT_PROPERTIES = gql`
	query GetAgentProperties {
		__typename
	}
`;
