# Vercel Deployment Instructions

1. Go to Vercel dashboard: https://vercel.com
2. Connect your GitHub repository
3. Configure environment variables (see below)
4. Deploy

## Required Environment Variables

- `DATABASE_URL`: Should be set to your PostgreSQL database connection string
- `NEXTAUTH_SECRET`: Your authentication secret
- `NEXTAUTH_URL`: Should be set to `https://${VERCEL_URL}`

## About the Ignored Build Step

The `ignoreCommand` in your vercel.json has been removed to ensure builds always proceed. This will fix the "Build Canceled" issue you were experiencing.

## Troubleshooting

If you encounter issues with bcrypt, check that your deployment is using the bcryptjs package instead of the native bcrypt module which can cause problems in a serverless environment.