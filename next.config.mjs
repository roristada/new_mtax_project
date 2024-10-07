/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com'],
  },
  reactStrictMode: true,
  // Add this section
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  },
};

export default nextConfig;

