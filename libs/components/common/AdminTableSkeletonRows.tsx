import React from 'react';
import { Skeleton } from '@mui/material';

interface AdminTableSkeletonRowsProps {
	columnCount: number;
	rowCount?: number;
	cellWidths?: Array<number | string>;
}

const AdminTableSkeletonRows = ({ columnCount, rowCount = 5, cellWidths = [] }: AdminTableSkeletonRowsProps) => {
	return (
		<>
			{Array.from({ length: rowCount }).map((_, rowIndex) => (
				<tr key={`admin-skeleton-row-${rowIndex}`}>
					{Array.from({ length: columnCount }).map((__, columnIndex) => (
						<td key={`admin-skeleton-cell-${rowIndex}-${columnIndex}`}>
							<Skeleton
								variant="text"
								animation="wave"
								height={28}
								width={cellWidths[columnIndex] ?? '100%'}
							/>
						</td>
					))}
				</tr>
			))}
		</>
	);
};

export default AdminTableSkeletonRows;
