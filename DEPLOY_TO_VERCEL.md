# Deploying LifeNavigator to Vercel

This guide provides step-by-step instructions for deploying the LifeNavigator application to Vercel.

## Prerequisites

- A GitHub account with the LifeNavigator repository
- A Vercel account

## Step 1: Create Vercel PostgreSQL Database

1. Log in to your Vercel account
2. Click "Storage" in the sidebar
3. Click "Create Database" and select "PostgreSQL"
4. Follow the setup steps to create your database
5. Note down the connection details provided by Vercel

## Step 2: Connect Your Repository to Vercel

1. Go to the Vercel dashboard and click "Add New Project"
2. Connect your GitHub account if you haven't already
3. Select the LifeNavigator repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: prisma generate && next build
   - Install Command: pnpm install
   - Output Directory: .next

## Step 3: Configure Environment Variables

Add the following environment variables in the Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY` | Prisma connection string (if using Prisma Accelerate) |
| `POSTGRES_PRISMA_URL` | *Use value from Vercel PostgreSQL* | PostgreSQL connection URL with connection pooling |
| `POSTGRES_URL_NON_POOLING` | *Use value from Vercel PostgreSQL* | PostgreSQL direct connection URL |
| `NEXTAUTH_SECRET` | *Generate a secure random string* | Secret key for NextAuth.js |
| `NEXTAUTH_URL` | `https://${VERCEL_URL}` | URL for NextAuth.js |
| `USE_MOCK_DB` | `false` | Use real database |
| `ENABLE_FIELD_ENCRYPTION` | `false` | Disable field encryption for now |
| `SKIP_ENV_VALIDATION` | `true` | Skip validation in production |

## Step 4: Deploy Your Application

1. Click "Deploy" to start the deployment process
2. Vercel will clone your repository, install dependencies, and deploy the application
3. Once deployed, you'll get a URL for your application

## Step 5: Run Database Migrations

After deployment, you need to run database migrations to set up the schema:

```bash
# Install Vercel CLI
npm install -g vercel

# Log in to Vercel
vercel login

# Run migrations
vercel --prod run npx prisma migrate deploy
```

Alternatively, use our provided database setup script:

```bash
# Make sure you have the correct environment variables set
node scripts/vercel-db-setup.js
```

## Step 6: Create a Demo User

You can create a demo user manually or use our script:

```bash
# Run the demo user creation script
vercel --prod run npx ts-node scripts/create-demo-user.ts
```

## Step 7: Verify Your Deployment

1. Visit your deployed application URL
2. Try logging in with the demo credentials:
   - Email: demo@example.com
   - Password: password
3. Verify that you can access the dashboard and features

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Check that your environment variables are correct
2. Make sure your IP is allowed in any database firewall rules
3. Try setting `USE_MOCK_DB=true` temporarily to see if your application works with the mock database

### Deployment Failures

If your deployment fails:

1. Check the Vercel build logs for errors
2. Verify your `package.json` and dependencies
3. Make sure your Next.js configuration is correct

### Authentication Problems

If users can't log in:

1. Verify that `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly
2. Check that the database migrations have run successfully
3. Confirm that the demo user has been created

## Continuous Deployment

Vercel automatically deploys new changes when you push to your repository. To update your application:

1. Make your changes and commit them
2. Push to your main branch
3. Vercel will automatically build and deploy the new version

For database schema changes, you'll need to run migrations manually:

```bash
vercel --prod run npx prisma migrate deploy
```