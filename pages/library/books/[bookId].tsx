import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BookDetailRedirect() {
	const router = useRouter();
	const { bookId } = router.query;

	useEffect(() => {
		if (bookId) {
			router.replace(`/books/detail?id=${bookId}`);
		}
	}, [bookId, router]);

	return null;
}
