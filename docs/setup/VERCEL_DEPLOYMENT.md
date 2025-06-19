# Vercel Deployment Guide for LifeNavigator

This guide outlines the steps necessary to deploy the LifeNavigator application to Vercel.

## Prerequisites

1. A Vercel account
2. A PostgreSQL database (can use Vercel Postgres)
3. Git repository connected to Vercel

## Updated Database Configuration

We've updated our Prisma configuration to work optimally with Vercel's serverless environment:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // Uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // Uses a direct connection
}
```

And our database client in `src/lib/db.ts` now supports both:
- Mock database for development
- Real Prisma client for production

## Environment Variables to Set in Vercel Dashboard

Configure the following environment variables in your Vercel project settings:

```bash
# Core Configuration
NODE_ENV=production
USE_MOCK_DB=false

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-chars

# Database (Vercel Postgres format)
POSTGRES_PRISMA_URL=postgres://user:password@host:port/database?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgres://user:password@host:port/database

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Deployment Steps

1. **Connect Your Git Repository**:
   - Connect your GitHub/GitLab/Bitbucket repository to Vercel.
   - Import the LifeNavigator project.

2. **Configure Project Settings**:
   - Framework Preset: Next.js
   - Build Command: `prisma generate && next build` (already in vercel.json)
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Set Up Environment Variables**:
   - Add all required environment variables mentioned above.
   - For secure values, use Vercel's environment variables encryption.
   - Enable "Automatically expose System Environment Variables"

4. **Database Setup**:
   - Create a PostgreSQL database (preferably with Vercel Postgres).
   - Add the connection strings to your environment variables.
   - Run the database migrations after deployment:
     ```
     npx prisma migrate deploy
     ```
   
5. **Deploy**:
   - Click "Deploy" and wait for the build to complete.
   - Vercel will automatically run the build steps defined in your vercel.json.

## Fixed Dashboard Page

The dashboard page has been modified to work correctly with client-side components in the Next.js App Router. It uses:

- `'use client'` directive at the top of the file
- React hooks for state management
- NextAuth.js session for authentication

## Client Component Handling

Our application correctly handles client components:

1. Files using React hooks are marked with `'use client'`
2. Client components are properly separated from server components
3. Authentication with NextAuth.js is configured for client-side usage

## Troubleshooting Common Vercel Build Issues

If you encounter build errors:

1. **Memory Issues**: We've already set `NODE_OPTIONS="--max-old-space-size=4096"` in vercel.json
2. **TypeScript Errors**: TypeScript checking is disabled during build but should be run before deployment
3. **Database Connection Issues**: Verify your PostgreSQL connection strings and ensure the database is accessible
4. **NextAuth.js Issues**: Make sure `NEXTAUTH_SECRET` is set and is at least 32 characters

## Post-Deployment Verification

After deployment, check:

1. Authentication works correctly
2. Database connections are established
3. Dashboard and other client components render correctly

## Notes on Database Implementation

This project uses a hybrid approach:
- In development, it can use a mock database for testing without a real database connection
- In production, it uses a real Prisma client connected to PostgreSQL
- Set `USE_MOCK_DB=false` in production to ensure real database connection