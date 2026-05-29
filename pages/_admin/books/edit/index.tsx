import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../../libs/components/layout/LayoutAdmin';
import AddBook from '../../../../libs/components/admin/books/AddBook';

const AdminBookEdit: NextPage = () => {
	return <AddBook mode="edit" />;
};

export default withAdminLayout(AdminBookEdit);
