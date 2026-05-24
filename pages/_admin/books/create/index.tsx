import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../../libs/components/layout/LayoutAdmin';
import AddBook from '../../../../libs/components/admin/books/AddBook';

const AdminBookCreate: NextPage = () => {
	return <AddBook mode="create" />;
};

export default withAdminLayout(AdminBookCreate);
