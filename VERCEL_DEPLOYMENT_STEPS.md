# Step-by-Step Vercel Deployment Guide for LifeNavigator

This guide provides detailed instructions for deploying LifeNavigator to Vercel and connecting it to a PostgreSQL database.

## Step 1: Prepare Your GitHub Repository

1. Commit all your local changes:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. Create a new GitHub repository if you don't have one:
   - Go to [GitHub](https://github.com/new)
   - Name the repository `lifenavigator`
   - Choose visibility (private recommended for real projects)
   - Click "Create repository"

3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/lifenavigator.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. Sign up or log in to [Vercel](https://vercel.com)

2. Create a new project:
   - Click "Add New..." > "Project"
   - Choose "Import Git Repository"
   - Select your `lifenavigator` repository
   - Click "Import"

3. Configure project settings:
   - Framework Preset: Select "Next.js"
   - Root Directory: Keep as `.` (default)
   - Build Command: Keep default (`next build`)
   - Output Directory: Keep default (`.next` or `out`)
   - Install Command: `pnpm install`

4. Set up environment variables:
   - Click "Environment Variables"
   - Add the following essential variables:
     ```
     NEXTAUTH_SECRET=<generate-a-random-string-min-32-chars>
     NEXTAUTH_URL=${VERCEL_URL}
     DATABASE_URL=${POSTGRES_URL}?sslmode=require
     DIRECT_URL=${POSTGRES_URL}?sslmode=require
     ENABLE_FIELD_ENCRYPTION=false
     NODE_ENV=production
     ```
   - Keep `NEXTAUTH_URL=${VERCEL_URL}` as-is (Vercel will substitute the actual URL)

5. Click "Deploy" and wait for the build to complete

## Step 3: Set Up Vercel PostgreSQL

1. After initial deployment, go to your Vercel dashboard

2. Add PostgreSQL database:
   - Click on your project
   - Go to the "Storage" tab
   - Click "Connect Store" > "Create New" > "Postgres"
   - Choose a region closest to your users
   - Click "Create & Connect"

3. Vercel will automatically:
   - Create a PostgreSQL database
   - Add all necessary environment variables to your project
   - These variables include: `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.

4. Redeploy your application:
   - Go to the "Deployments" tab
   - Find your latest deployment
   - Click the three dots menu (...)
   - Select "Redeploy" to apply the new environment variables

## Step 4: Run Database Migrations

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Link your local project to the Vercel project:
   ```bash
   vercel link
   ```

4. Run migrations using Vercel CLI:
   ```bash
   vercel env pull .env.production.local  # Pull production environment variables
   NEXTAUTH_SECRET=dummy npx prisma migrate deploy
   ```

   Alternatively, you can use the Vercel dashboard:
   - Go to your project
   - Navigate to "Settings" > "Functions" > "Console"
   - Run: `npx prisma migrate deploy`

## Step 5: Verify Deployment

1. Check your application:
   - Visit your deployed app at `https://lifenavigator-xxxx.vercel.app`
   - Test the authentication flow using demo credentials
   - Verify that database operations work correctly

2. Check logs for any errors:
   - Go to the "Logs" section in your Vercel dashboard
   - Look for error messages related to database connections or auth

## Step 6: Set Up Custom Domain (Optional)

1. Add custom domain:
   - Go to your project settings
   - Click on "Domains"
   - Enter your domain name (e.g., `lifenavigator.yourdomain.com`)
   - Follow the instructions to configure DNS records

2. Update environment variables:
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy the application

## Step 7: Connect AWS Services (If Needed)

If you need S3 for document storage:

1. Create AWS S3 bucket:
   - Go to AWS Console > S3
   - Create a new bucket with appropriate permissions
   - Get your access keys

2. Add AWS credentials to Vercel:
   - Go to your project's environment variables
   - Add:
     ```
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=your-access-key
     AWS_SECRET_ACCESS_KEY=your-secret-key
     S3_BUCKET_NAME=lifenavigator-documents
     DOCUMENT_ENCRYPTION_KEY=your-encryption-key
     ```

3. Redeploy your application

## Troubleshooting Common Issues

### Database Connection Problems

If you encounter database connection issues:

1. Check connection string format:
   - Ensure `DATABASE_URL` is properly formatted
   - For Vercel Postgres, use: `${POSTGRES_URL}?sslmode=require`

2. Check database access:
   - Verify IP restrictions aren't blocking Vercel's servers
   - Ensure your database user has proper permissions

### Authentication Issues

If auth doesn't work:

1. Verify `NEXTAUTH_URL` is set correctly
2. Check `NEXTAUTH_SECRET` is properly set (32+ characters)
3. Ensure your OAuth provider credentials are correct (if using OAuth)

### Build Failures

For build errors:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are properly installed
3. Verify your Next.js configuration is correct
4. Try running the build locally before deploying

## Maintaining Your Deployment

For ongoing maintenance:

1. Automatic deployments:
   - Vercel automatically deploys when you push to your main branch
   - You can configure this behavior in "Settings" > "Git"

2. Preview deployments:
   - Pull requests automatically create preview deployments
   - Test changes before merging to production

3. Rolling back:
   - Use the "Deployments" tab to view deployment history
   - You can instantly roll back to a previous working version