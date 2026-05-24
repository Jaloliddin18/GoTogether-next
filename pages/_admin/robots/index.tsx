import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const AdminRobots: NextPage = () => {
	return (
		<div className="admin-page">
			<div className="admin-empty">Coming Soon</div>
		</div>
	);
};

export default withAdminLayout(AdminRobots);
