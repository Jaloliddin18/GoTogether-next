import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { API_BASE_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Book } from '../../types/book/book';
import { resolveMediaUrl } from '../../utils';

interface PropertyCardType {
	property: Property | Book;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const book = property as Book;
	const legacyProperty = property as Property;
	const isBookCard = Boolean((book as any)?.bookTitle);
	const imagePath: string = isBookCard
		? resolveMediaUrl(book?.bookImages?.[0], '/img/banner/header1.svg')
		: legacyProperty?.propertyImages?.[0]
			? `${API_BASE_URL}/${legacyProperty.propertyImages[0]}`
			: '/img/banner/header1.svg';

	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link href={{ pathname: '/books/detail', query: { id: property?._id } }}>
						<img src={imagePath} alt="" />
					</Link>
					{!isBookCard && property && legacyProperty?.propertyRank > topPropertyRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>
							{isBookCard
								? `${book?.bookPrice?.amount ?? 0} ${book?.bookPrice?.currency ?? 'KRW'}`
								: `$${formatterStr(legacyProperty?.propertyPrice)}`}
						</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link href={{ pathname: '/books/detail', query: { id: property?._id } }}>
								<Typography>{isBookCard ? book?.bookTitle : legacyProperty?.propertyTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{isBookCard
									? `${book?.bookAuthor ?? ''}${book?.bookLanguage ? `, ${book.bookLanguage}` : ''}`
									: `${legacyProperty?.propertyAddress}, ${legacyProperty?.propertyLocation}`}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						{isBookCard ? (
							<>
								<Stack className="option">
									<Typography>{book?.bookCategory}</Typography>
								</Stack>
								<Stack className="option">
									<Typography>{book?.isBorrowable ? 'Borrowable' : 'Reference only'}</Typography>
								</Stack>
							</>
						) : (
							<>
								<Stack className="option">
									<img src="/img/icons/bed.svg" alt="" /> <Typography>{legacyProperty?.propertyBeds} bed</Typography>
								</Stack>
								<Stack className="option">
									<img src="/img/icons/room.svg" alt="" /> <Typography>{legacyProperty?.propertyRooms} room</Typography>
								</Stack>
								<Stack className="option">
									<img src="/img/icons/expand.svg" alt="" /> <Typography>{legacyProperty?.propertySquare} m2</Typography>
								</Stack>
							</>
						)}
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							{isBookCard ? (
								<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{book?.bookStatus}</Typography>
							) : (
								<>
									<Typography
										sx={{ fontWeight: 500, fontSize: '13px' }}
										className={legacyProperty?.propertyRent ? '' : 'disabled-type'}
									>
										Rent
									</Typography>
									<Typography
										sx={{ fontWeight: 500, fontSize: '13px' }}
										className={legacyProperty?.propertyBarter ? '' : 'disabled-type'}
									>
										Barter
									</Typography>
								</>
							)}
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{isBookCard ? book?.bookViews : legacyProperty?.propertyViews}</Typography>
								<IconButton color={'default'} onClick={() => likePropertyHandler(user, property?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : (property as any)?.meLiked && (property as any)?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{isBookCard ? book?.bookLikes : legacyProperty?.propertyLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
