/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://3.101.121.64:8000',
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'appleid.cdn-apple.com'],
  },
}

module.exports = nextConfig
