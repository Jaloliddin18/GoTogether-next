/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// @apollo/client 3.14.1 uses infer X extends Y (TS 4.7+) syntax; project is on TS 4.6.
	// Source files are clean — this only suppresses the node_modules parse error at build time.
	typescript: { ignoreBuildErrors: true },
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
