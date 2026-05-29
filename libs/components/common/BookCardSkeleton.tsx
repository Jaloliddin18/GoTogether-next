import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface BookCardSkeletonProps {
	width?: number | string;
	imageHeight?: number;
}

const BookCardSkeleton = ({ width = '100%', imageHeight = 240 }: BookCardSkeletonProps) => {
	return (
		<Box
			sx={{
				width,
				backgroundColor: '#ffffff',
				borderRadius: '16px',
				border: '1px solid #e8f0fb',
				overflow: 'hidden',
			}}
		>
			<Skeleton variant="rectangular" animation="wave" width="100%" height={imageHeight} />
			<Stack spacing={1.1} sx={{ p: 2 }}>
				<Skeleton variant="text" animation="wave" width="76%" height={30} />
				<Skeleton variant="text" animation="wave" width="54%" height={22} />
				<Skeleton variant="text" animation="wave" width="38%" height={20} />
				<Skeleton variant="rectangular" animation="wave" width="100%" height={1} sx={{ my: 1 }} />
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Skeleton variant="text" animation="wave" width="34%" height={26} />
					<Stack direction="row" spacing={1.2}>
						<Skeleton variant="rounded" animation="wave" width={44} height={20} />
						<Skeleton variant="rounded" animation="wave" width={44} height={20} />
					</Stack>
				</Stack>
			</Stack>
		</Box>
	);
};

export default BookCardSkeleton;
