# Vercel Environment Variables

This document lists the essential environment variables required for the LifeNavigator application's deployment to Vercel.

## Core Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment type | Yes | `production` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | Yes | `${VERCEL_URL}` or your custom domain |
| `APP_ENV` | Application environment | Yes | `production` |
| `USE_MOCK_DB` | Whether to use mock database | Yes | `false` (must be false for production) |

## Database Configuration

These variables will be automatically added when you create a Vercel Postgres database.

| Variable | Description | Required | 
|----------|-------------|----------|
| `POSTGRES_PRISMA_URL` | Prisma connection URL with connection pooling | Yes |
| `POSTGRES_URL_NON_POOLING` | Direct connection URL without pooling | Yes |
| `POSTGRES_USER` | Database username | Yes |
| `POSTGRES_HOST` | Database host | Yes | 
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_DATABASE` | Database name | Yes |

## Authentication

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXTAUTH_URL` | NextAuth.js URL | Yes | `${VERCEL_URL}` or your custom domain |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes | 32+ character random string |

## OAuth Providers (Optional)

| Variable | Description | Required | 
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |

## Encryption (Future Implementation)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ENCRYPTION_KEY` | Key for data encryption | No | 32-character random string |
| `ENABLE_FIELD_ENCRYPTION` | Enable field-level encryption | No | `false` (initially) |

## Feature Flags

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ENABLE_NOTIFICATIONS` | Enable notification features | No | `true` or `false` |
| `ENABLE_ANALYTICS` | Enable analytics tracking | No | `true` or `false` |

## How to Set Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with its corresponding value
4. Specify the environments where each variable should be available (Production, Preview, Development)
5. Click "Save" to apply the changes

For sensitive values like secrets and API keys, use Vercel's encrypted environment variables feature.

## Environment Variables Precedence

1. Environment variables defined in the Vercel UI
2. Environment variables defined in `vercel.json`
3. Environment variables defined in `.env` files (not recommended for production)

## Automatically Populated Variables

Vercel automatically populates several environment variables, including:

- `VERCEL_URL`: The URL of your deployment
- `VERCEL_ENV`: The environment (`production`, `preview`, or `development`)
- `VERCEL_REGION`: The region where your deployment is running

You can reference these in your custom environment variables, for example: `NEXTAUTH_URL=${VERCEL_URL}`