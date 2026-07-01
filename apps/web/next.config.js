/**
 * Next.js configuration for the EIS web frontend.
 * Adjust as needed when features are added.
 */
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/EIS-Employee-Information-System' : '',
  images: {
    unoptimized: true,
  },
};
