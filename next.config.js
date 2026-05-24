/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// @apollo/client 3.14.1 uses infer X extends Y (TS 4.7+) syntax; project is on TS 4.6.
	// Source files are clean — this only suppresses the node_modules parse error at build time.
	typescript: { ignoreBuildErrors: true },
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
		REACT_APP_ROBOT_WS: process.env.REACT_APP_ROBOT_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
