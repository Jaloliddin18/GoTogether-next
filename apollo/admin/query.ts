import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        BOOK        *
 *************************/

export const GET_ALL_BOOKS_BY_ADMIN = gql`
	query GetAllBooksByAdmin($input: AllBooksInquiry!) {
		getAllBooksByAdmin(input: $input) {
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
				bookPrice {
					amount
					currency
					discountPercent
					isDiscounted
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      TWIT     *
 *************************/

export const GET_ALL_TWITS_BY_ADMIN = gql`
	query GetAllTwitsByAdmin($input: AllTwitsInquiry!) {
		getAllTwitsByAdmin(input: $input) {
			list {
				_id
				memberId
				text
				image
				meLiked
				likeCount
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
 *         BOOK-INVENTORY       *
 *************************/

export const GET_BOOK_INVENTORIES = gql`
	query GetBookInventories($input: BookInventoriesInquiry!) {
		getBookInventories(input: $input) {
			list {
				_id
				bookId
				bookInventoryType
				bookStorageZone
				bookInventoryStatus
				bookTotalQuantity
				bookSoldQuantity
				bookReservedQuantity
				bookBorrowedQuantity
				deletedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOOK_INVENTORy = gql`
	query GetBookInventory($input: String!) {
		getBookInventory(bookInventoryId: $input) {
			_id
			bookId
			bookInventoryType
			bookStorageZone
			bookInventoryStatus
			bookTotalQuantity
			bookSoldQuantity
			bookReservedQuantity
			bookBorrowedQuantity
			deletedAt
			createdAt
			updatedAt
			bookShelf {
				section
				row
				level
				slot
			}
			bookLocation {
				floorId
				x
				y
				theta
			}
			bookPickup {
				gripperOpenWidthCm
				gripperCloseWidthCm
				gripHoldSeconds
				pickupDirection
			}
		}
	}
`;

/**************************
 *         REQUEST       *
 *************************/

export const GET_REQUEST = gql`
	query GetRequest($input: String!) {
		getRequest(requestId: $input) {
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
		}
	}
`;

export const GET_REQUESTS = gql`
	query GetRequests($input: RequestsInquiry!) {
		getRequests(input: $input) {
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
				memberData {
					_id
					memberNick
					memberImage
					memberType
					memberStatus
				}
				inventoryData {
					_id
					bookInventoryType
					bookInventoryStatus
					bookTotalQuantity
					bookReservedQuantity
					bookBorrowedQuantity
					bookSoldQuantity
				}
				robotData {
					_id
					robotId
					status
					isOnline
					battery
					lastSeenAt
				}
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
				error {
					code
					message
					timestamp
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
 *         ROBOT       *
 *************************/

export const GET_ROBOTS = gql`
	query GetRobots($input: RobotsInquiry!) {
		getRobots(input: $input) {
			list {
				_id
				robotId
				name
				status
				battery
				isOnline
				lastSeenAt
				currentRequestId
				createdAt
				updatedAt
				currentPose {
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

export const GET_ROBOT = gql`
	query GetRobot($input: String!) {
		getRobot(robotId: $input) {
			_id
			robotId
			name
			status
			battery
			isOnline
			lastSeenAt
			currentRequestId
			createdAt
			updatedAt
			currentPose {
				floorId
				x
				y
				theta
			}
		}
	}
`;

// STUB operations — removed from backend
// TODO: replace with Twit admin operations
export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`query GetAllBoardArticlesByAdmin { __typename }`;
export const GET_ALL_PROPERTIES_BY_ADMIN = gql`query GetAllPropertiesByAdmin { __typename }`;
