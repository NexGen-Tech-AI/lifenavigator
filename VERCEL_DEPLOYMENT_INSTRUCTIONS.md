# Vercel Deployment Instructions for LifeNavigator

This document provides step-by-step instructions for deploying the LifeNavigator application to Vercel with Prisma and PostgreSQL database.

## Prerequisites

1. A Vercel account
2. A Prisma Data Platform account for Prisma Accelerate (optional but recommended)
3. The LifeNavigator repository code
4. A PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)

## Deployment Steps

### 1. Push code to the main branch

Make sure all your changes are committed and pushed to the `main` branch of your repository. Vercel will use this branch for deployment.

```bash
git checkout main
git push origin main
```

### 2. Set up environment variables in Vercel

In the Vercel dashboard, go to your project settings and add the following environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DATABASE_URL` | Prisma connection string (with Accelerate if using) | `prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key` |
| `POSTGRES_PRISMA_URL` | PostgreSQL connection URL with connection pooling | `postgresql://username:password@host:port/database` |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL direct connection URL | `postgresql://username:password@host:port/database` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | `generate-a-secure-random-string` |
| `SKIP_ENV_VALIDATION` | Skip validation in production | `true` |
| `ENABLE_FIELD_ENCRYPTION` | Field encryption flag | `false` |
| `USE_MOCK_DB` | Use mock database | `true` (set to true if you don't have a real database) |
| `NEXTAUTH_URL` | URL for NextAuth.js | `https://${VERCEL_URL}` |
| `PRISMA_API_KEY` | Prisma Accelerate API key | `your-prisma-api-key` |

### 3. Connect to Git Repository in Vercel

1. In the Vercel dashboard, click "Add New Project"
2. Import your Git repository containing the LifeNavigator code
3. Configure the project with the following settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: prisma generate && next build
   - Install Command: pnpm install
   - Output Directory: .next

### 4. Deploy the Application

Click "Deploy" to start the deployment process. Vercel will clone your repository, install the dependencies, build the application, and deploy it.

### 5. Run Database Migrations

After deployment, run the database migrations using the Vercel CLI:

```bash
vercel --prod run npx prisma migrate deploy
```

Or you can run migrations manually in your local environment pointing to the production database:

```bash
DATABASE_URL=your-production-db-url npx prisma migrate deploy
```

### 6. Verify Deployment

1. Check the deployment logs for any errors
2. Visit your deployed application URL to ensure it's running correctly
3. Test the authentication flow and database connections

## Common Issues and Solutions

### Issue: Vercel deployment fails due to incorrect Next.js configuration

**Solution:** Make sure your `next.config.js` is compatible with the version of Next.js you're using. For Next.js 15.3.1, use the updated configuration provided in this repository.

### Issue: Database connection issues

**Solution:** If you're encountering database connection errors, try the following:

1. Set `USE_MOCK_DB=true` in your Vercel environment variables to use the mock database
2. Check that your `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` start with either `postgresql://` or `postgres://`
3. If using Prisma Accelerate, ensure your API key is correct and the service is properly set up

### Issue: Authentication not working

**Solution:** 
1. Make sure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are properly configured
2. Set `USE_MOCK_DB=true` to use the mock database with the demo account
3. Check the logs for any errors related to database connection or authentication
4. The demo account (demo@example.com / password) should always work when `USE_MOCK_DB=true`

### Issue: Vercel builds from old commit

**Solution:** Update the `ignoreCommand` in your `vercel.json` to force Vercel to ignore its build cache and deploy from the latest commit.

### Issue: PrismaClientInitializationError

**Solution:** This error often indicates issues with your database connection URLs. Make sure:
1. `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are correctly formatted
2. The URLs start with `postgresql://` or `postgres://`
3. Set `USE_MOCK_DB=true` to bypass the need for a real database connection

## Monitoring and Maintenance

- Set up monitoring for your application using Vercel Analytics
- Regularly check Vercel logs for any errors or issues
- Update environment variables as needed through the Vercel dashboard

---

For further assistance, refer to the [Vercel documentation](https://vercel.com/docs) or [contact support](https://vercel.com/support).