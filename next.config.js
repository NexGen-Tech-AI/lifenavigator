/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true
  },
  webpack: (config) => {
    return config;
  },
  poweredByHeader: false,
  serverExternalPackages: [
    'bcrypt',
    'crypto',
    '@prisma/client'
  ],
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;