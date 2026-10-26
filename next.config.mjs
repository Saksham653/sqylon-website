/** Static export: `next build` writes the whole site to out/, which Netlify publishes. */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
