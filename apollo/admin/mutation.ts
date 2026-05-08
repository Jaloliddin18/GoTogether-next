import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
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
 *        BOOK       *
 *************************/

export const CREATE_BOOK = gql`
	mutation CreateBook($input: CreateBookInput!) {
		createBook(input: $input) {
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
		}
	}
`;

export const REMOVE_BOOK_BY_ADMIN = gql`
	mutation RemoveBookByAdmin($input: String!) {
		removeBookByAdmin(bookId: $input) {
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
		}
	}
`;

export const UPDATE_BOOK = gql`
	mutation UpdateBook($input: UpdateBookInput!) {
		updateBook(input: $input) {
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
		}
	}
`;
/**************************
 *      BOOK_INVENTORY     *
 *************************/

export const CREATE_BOOK_INVENTORY = gql`
	mutation CreateBookInventory($input: CreateBookInventoryInput!) {
		createBookInventory(input: $input) {
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

export const UPDATE_BOOK_INVENTORY = gql`
	mutation UpdateBookInventory($input: UpdateBookInventoryInput!) {
		updateBookInventory(input: $input) {
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

export const UPDATE_BOOK_INVENTORY_STATUS = gql`
	mutation UpdateBookInventoryStatus($input: UpdateBookInventoryStatusInput!) {
		updateBookInventoryStatus(input: $input) {
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
	}
`;

export const RREMOVE_BOOK_INVENTORY_BY_ADMIN = gql`
	mutation RemoveBookInventoryByAdmin($input: String!) {
		removeBookInventoryByAdmin(bookInventoryId: $input) {
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
	}
`;

/**************************
 *         REQUEST        *
 *************************/

export const UPDATE_REQUEST_STATUS = gql`
	mutation UpdateRequestStatus($input:UpdateRequestStatusInput!) {
    updateRequestStatus(input: $input) {
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
`;

/**************************
 *         ROBOT        *
 *************************/

export const CREATE_ROBOT = gql`
	mutation CreateRobot($input: CreateRobotInput!) {
		createRobot(input: $input) {
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
		}
	}
`;

export const UPDATE_ROBOT = gql`
	mutation UpdateRobot($input: UpdateRobotInput!) {
		updateRobot(input: $input) {
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

/**************************
 *         TWIT        *
 *************************/

export const UPDATE_TWIT_BY_ADMIN = gql`
	mutation UpdateTwitByAdmin($input: TwitUpdate!) {
		updateTwitByAdmin(input: $input) {
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

export const REMOVE_TWIT_BY_ADMIN = gql`
	mutation RemoveTwitByAdmin($input: String!) {
		removeTwitByAdmin(twitId: $input) {
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

/**************************
 *         TWIT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
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

export const REMOVE_TWIT_COMMENT_BY_ADMIN = gql`
	mutation RemoveTwitCommentByAdmin($input: String!) {
		removeTwitCommentByAdmin(commentId: $input) {
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
		}
	}
`;
