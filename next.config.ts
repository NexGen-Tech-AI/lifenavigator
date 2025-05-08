import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
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
    // During deployment to Vercel, we'll handle type checking separately
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    // During deployment to Vercel, we'll handle linting separately
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
};

export default nextConfig;
