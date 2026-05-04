/** @type {import('next').NextConfig} */
const nextConfig = {
  // remotePatterns replaces the deprecated `domains` key in Next.js 14
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Prevent Vercel from failing the build on ESLint warnings in dependencies
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
