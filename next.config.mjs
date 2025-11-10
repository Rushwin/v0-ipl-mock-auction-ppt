/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  basePath: '/v0-ipl-mock-auction-ppt',
  assetPrefix: '/v0-ipl-mock-auction-ppt/',
}

export default nextConfig
