# Vercel Deployment Guide for LifeNavigator

This guide outlines the steps necessary to deploy the LifeNavigator frontend application to Vercel.

## Prerequisites

1. A Vercel account
2. A PostgreSQL database (can use Vercel Postgres)
3. Environment variables as configured in `.env.production`

## Environment Variables to Set in Vercel Dashboard

Configure the following environment variables in your Vercel project settings:

```
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=${VERCEL_URL}
APP_ENV=prod

# Authentication
NEXTAUTH_URL=${VERCEL_URL}
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=your-postgres-connection-string
DIRECT_URL=your-postgres-direct-connection-string

# Token Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Agent Configuration (if using AI features)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Deployment Steps

1. **Connect Your Git Repository**:
   - Connect your GitHub/GitLab/Bitbucket repository to Vercel.
   - Import the LifeNavigator project.

2. **Configure Project Settings**:
   - Framework Preset: Next.js
   - Build Command: (Vercel will use the one in vercel.json)
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Set Up Environment Variables**:
   - Add all required environment variables mentioned above.
   - For secure values, use Vercel's environment variables encryption.

4. **Database Setup**:
   - Create a PostgreSQL database (preferably with Vercel Postgres).
   - Add the connection strings to your environment variables.
   - Run the database migrations using the Vercel CLI or directly on your local machine pointing to the production database:
     ```
     pnpm prisma migrate deploy
     ```

5. **Deploy**:
   - Click "Deploy" and wait for the build to complete.
   - Vercel will automatically run the build steps defined in your vercel.json and package.json.

## Monitoring Deployment

- Check the build logs in the Vercel dashboard for any errors.
- If the deployment fails, review the logs and make necessary adjustments.
- Test the deployed application by navigating to the provided Vercel URL.

## Post-Deployment

1. **Custom Domain**:
   - Configure a custom domain in the Vercel dashboard if needed.
   - Update DNS settings according to Vercel's instructions.

2. **Verify Features**:
   - Check authentication flows
   - Verify database connections
   - Test all key application features

3. **Set Up Teams and Access**:
   - Configure team access in Vercel if multiple developers need deployment access.

## Troubleshooting

- **Database Connection Issues**: Ensure your database connection strings are correct and the database is accessible from Vercel's network.
- **Build Failures**: Check the Vercel build logs for specific errors. Common issues include missing dependencies or environment variables.
- **API Errors**: Verify that API routes are functioning correctly and check the server logs for errors.

## Notes

- The deployment configuration is optimized for Vercel's serverless environment.
- Prisma Client is configured to work efficiently with serverless functions.
- NextAuth is set up to work with Vercel's environment.