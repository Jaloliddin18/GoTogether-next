import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Book } from '../../types/book/book';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';

interface NewArrivalCardProps {
	book: Book;
}

const NewArrivalCard = (props: NewArrivalCardProps) => {
	const { book } = props;
	const device = useDeviceDetect();
	const router = useRouter();

	/** HANDLERS **/
	const pushDetailHandler = async (bookId: string) => {
		await router.push(`/library/books/${bookId}`);
	};

	const imageUrl = book?.bookImages?.[0]
		? `${REACT_APP_API_URL}/${book.bookImages[0]}`
		: '/img/banner/header1.svg';

	const priceLabel = `${book?.bookPrice?.amount ?? 0} ${book?.bookPrice?.currency ?? 'KRW'}`;

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={book._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${imageUrl})` }}
					onClick={() => {
						pushDetailHandler(book._id);
					}}
				>
					<div>{priceLabel}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(book._id);
						}}
					>
						{book.bookTitle}
					</strong>
					<p className={'desc'}>{book.bookAuthor}</p>
					<div className={'options'}>
						<div>
							<span>{book.bookCategory}</span>
						</div>
						{book.isBorrowable && (
							<div>
								<span style={{ color: '#2E7D32', fontWeight: 600 }}>Borrowable</span>
							</div>
						)}
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{book.bookLanguage}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{book?.bookViews}</Typography>
							<IconButton color={'default'}>
								<FavoriteIcon />
							</IconButton>
							<Typography className="view-cnt">{book?.bookLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="trend-card-box" key={book._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${imageUrl})` }}
					onClick={() => {
						pushDetailHandler(book._id);
					}}
				>
					<div>{priceLabel}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(book._id);
						}}
					>
						{book.bookTitle}
					</strong>
					<p className={'desc'}>{book.bookAuthor}</p>
					<div className={'options'}>
						<div>
							<span>{book.bookCategory}</span>
						</div>
						{book.isBorrowable && (
							<div>
								<span style={{ color: '#2E7D32', fontWeight: 600 }}>Borrowable</span>
							</div>
						)}
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{book.bookLanguage}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{book?.bookViews}</Typography>
							<IconButton color={'default'}>
								<FavoriteIcon />
							</IconButton>
							<Typography className="view-cnt">{book?.bookLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default NewArrivalCard;
