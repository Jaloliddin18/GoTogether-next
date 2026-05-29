import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const AdminPropertiesRedirect: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/_admin/books');
	}, []);

	return <></>;
};

export default withAdminLayout(AdminPropertiesRedirect);
