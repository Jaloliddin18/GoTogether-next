import { gql } from '@apollo/client';

export const GET_BOOKS = gql`
	query GetBooks($input: BooksInquiry!) {
		getBooks(input: $input) {
			list {
				_id
				bookTitle
				bookAuthor
				bookIsbn
				bookImages
				bookCategory
				bookStatus
				isBorrowable
				isPurchasable
				bookPrice {
					amount
					currency
					discountPercent
					isDiscounted
				}
				bookRating {
					average
					count
				}
				bookLikes
				bookViews
				bookRank
				createdAt
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
