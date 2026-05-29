import React from 'react';
import { Skeleton, Stack } from '@mui/material';

interface TwitCardSkeletonProps {
	showMedia?: boolean;
}

const TwitCardSkeleton = ({ showMedia = true }: TwitCardSkeletonProps) => {
	return (
		<Stack
			sx={{
				padding: '16px 18px',
				borderBottom: '1px solid #e2e8f0',
				backgroundColor: '#ffffff',
				borderRadius: '14px',
				gap: 1.2,
			}}
		>
			<Stack direction="row" spacing={1.2} alignItems="center">
				<Skeleton variant="circular" animation="wave" width={40} height={40} />
				<Stack sx={{ flex: 1 }}>
					<Skeleton variant="text" animation="wave" width="38%" height={24} />
					<Skeleton variant="text" animation="wave" width="24%" height={20} />
				</Stack>
			</Stack>
			<Skeleton variant="text" animation="wave" width="96%" height={22} />
			<Skeleton variant="text" animation="wave" width="82%" height={22} />
			{showMedia && <Skeleton variant="rounded" animation="wave" width="100%" height={200} />}
			<Stack direction="row" justifyContent="space-between" sx={{ pt: 0.4 }}>
				<Skeleton variant="rounded" animation="wave" width={58} height={22} />
				<Skeleton variant="rounded" animation="wave" width={58} height={22} />
				<Skeleton variant="rounded" animation="wave" width={58} height={22} />
				<Skeleton variant="rounded" animation="wave" width={58} height={22} />
			</Stack>
		</Stack>
	);
};

export default TwitCardSkeleton;
