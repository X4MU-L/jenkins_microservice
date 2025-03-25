/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'short.url', 'placeholder.com'],
  },
  experimental: {
    serverActions: true,
  },
}

export default nextConfig