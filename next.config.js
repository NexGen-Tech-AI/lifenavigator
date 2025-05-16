/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
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
    // Needed for better compatibility with Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };
    return config;
  },
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: [
      'bcrypt',
      'crypto',
      '@prisma/client',
      'pg'
    ],
    esmExternals: 'loose', // Help with ESM/CJS compatibility issues
  }
};

module.exports = nextConfig;