import type { DefaultSeoProps, OpenGraph } from 'next-seo';

export const SITE_URL = 'https://gotogether.tech';
export const SITE_NAME = '같이Go Smart Library';
export const SITE_TAGLINE = 'Less time looking, More time booking';
export const SUPPORT_EMAIL = 'support@gotogether.tech';
export const DEFAULT_OG_IMAGE = '/img/og-image.png';
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

export const SITE_TITLE = `${SITE_NAME} | Robot Book Delivery at INHA University`;
export const SITE_DESCRIPTION =
	'같이Go Smart Library is a university smart library platform at INHA University, Korea, helping students discover books faster and request autonomous robot book delivery.';

export const DEFAULT_KEYWORDS = [
	'smart library',
	'robot delivery',
	'INHA university',
	'book delivery',
	'autonomous robot',
	'library assistant',
];

const normalizePath = (path: string): string => {
	if (!path || path === '/') return '/';
	return path.startsWith('/') ? path : `/${path}`;
};

export const buildCanonicalUrl = (path: string = '/'): string => {
	const normalized = normalizePath(path);
	if (normalized === '/') return `${SITE_URL}/`;
	return `${SITE_URL}${normalized}`;
};

export const buildOpenGraph = (title: string, description: string, path: string): OpenGraph => ({
	type: 'website',
	locale: 'en_US',
	url: buildCanonicalUrl(path),
	siteName: SITE_NAME,
	title,
	description,
	images: [
		{
			url: DEFAULT_OG_IMAGE_URL,
			width: 1200,
			height: 630,
			alt: SITE_NAME,
		},
	],
});

export const DEFAULT_SEO: DefaultSeoProps = {
	title: SITE_TITLE,
	description: SITE_DESCRIPTION,
	canonical: SITE_URL,
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: SITE_URL,
		siteName: SITE_NAME,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		images: [
			{
				url: DEFAULT_OG_IMAGE_URL,
				width: 1200,
				height: 630,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		cardType: 'summary_large_image',
	},
	additionalMetaTags: [
		{
			name: 'keywords',
			content: DEFAULT_KEYWORDS.join(', '),
		},
		{
			name: 'theme-color',
			content: '#2E86DE',
		},
	],
};
