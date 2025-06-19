# LifeNavigator Deployment Instructions

This document provides step-by-step instructions for deploying the LifeNavigator application to Vercel with a PostgreSQL database.

## Before You Begin

1. Ensure you have:
   - A Vercel account
   - Access to your GitHub repository
   - Node.js and npm/pnpm installed locally
   - Vercel CLI installed: `npm i -g vercel`

## Step 1: Deploy the Database

### Create a Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select "Storage" from the top navigation
3. Click "Create" then select "Postgres Database"
4. Choose a region closest to your users
5. Select "Starter" plan ($20/month)
6. Give your database a name (e.g., "lifenavigator-db")
7. Click "Create"

### Note Your Database Credentials

Vercel will automatically create and securely store:
- Database hostname
- Username & Password
- Database name
- Connection strings

You won't need to manually enter these - they'll be automatically added to your project as environment variables.

## Step 2: Deploy the Frontend Application

### Connect Repository to Vercel

1. Go to your Vercel dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Choose "Import" to start the import process

### Configure Project Settings

1. Select "Next.js" as the framework preset
2. Leave "Root Directory" as default (/)
3. Build settings will be auto-populated from your vercel.json file
4. Click "Environment Variables" to expand that section
5. Add the following environment variables:

    ```
    NODE_ENV=production
    USE_MOCK_DB=false
    NEXTAUTH_SECRET=your-secure-random-string-at-least-32-chars
    ```

6. Click "Connect" to connect to your database:
   - Under "Connect Database," select your previously created database
   - Click "Connect"
   - This will automatically add:
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`

7. Click "Deploy"

## Step 3: Update Database Schema

After your initial deployment completes:

1. Wait for the build to finish and check for any errors
2. Use the comprehensive schema you've created:

   ```bash
   # First, login with Vercel CLI
   vercel login

   # Replace the schema with the comprehensive one
   cp prisma/schema.prisma.comprehensive prisma/schema.prisma

   # Generate the client
   npx prisma generate

   # Deploy the updated schema to production
   vercel --prod run npx prisma migrate deploy
   ```

## Step 4: Seed Initial Data (Optional)

To populate your database with initial demo data:

```bash
vercel --prod run npx prisma db seed
```

This will create:
- A demo user (demo@example.com / password)
- Sample financial data
- Sample health records
- Education and career information

## Step 5: Verify Your Deployment

1. Visit your deployed application at the Vercel URL
2. Test the login with the demo credentials (if you seeded data)
3. Verify the dashboard loads correctly
4. Test navigation to various sections
5. Check that data is being properly fetched from the database

## Step 6: Set Up Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Domains"
3. Enter your custom domain (e.g., lifenavigator.com)
4. Follow Vercel's instructions to set up DNS records

## Troubleshooting

### Build Errors

1. Check your Vercel build logs for specific errors
2. Common issues:
   - Missing environment variables
   - TypeScript errors (fixed by our configuration)
   - Database connection issues

### Database Connection Issues

If your app can't connect to the database:

1. Verify environment variables are correctly set in Vercel
2. Check that `USE_MOCK_DB` is set to `false`
3. Ensure your Prisma schema is using the correct connection variables
4. Check Vercel logs for any connection timeout errors

### Authentication Issues

If login isn't working:

1. Verify `NEXTAUTH_SECRET` is set in environment variables
2. Check that the database tables for users, sessions, and accounts exist
3. Look for authentication-related errors in the Vercel function logs

## Maintenance and Updates

For future updates:

1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and deploy
3. For database schema changes, run migrations:
   ```bash
   vercel --prod run npx prisma migrate deploy
   ```

## Monitoring

Monitor your application using:

1. Vercel Analytics (automatically enabled)
2. Database metrics in the Vercel dashboard
3. Logs from serverless functions

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel Postgres](https://vercel.com/guides/using-prisma-with-vercel-postgres)