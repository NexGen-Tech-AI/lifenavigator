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
    if (config.resolve.fallback) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  poweredByHeader: false,
  serverExternalPackages: [
    'bcrypt',
    'crypto',
    '@prisma/client',
    'pg'
  ],
  experimental: {
    esmExternals: 'loose' // Help with ESM/CJS compatibility issues
  }
};

module.exports = nextConfig;