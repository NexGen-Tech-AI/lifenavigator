# Fixing Prisma Build Issues on Vercel

Follow these steps to resolve the Prisma-related build failures on Vercel:

## Step 1: Update Prisma Schema for Vercel Postgres

1. Replace your current `prisma/schema.prisma` with the optimized version in `prisma/schema.prisma.vercel`

```bash
cp prisma/schema.prisma.vercel prisma/schema.prisma
```

This version is configured to work with Vercel Postgres and includes:
- Connection pooling configuration
- Simplified schema with only essential models for authentication

## Step 2: Set Up Vercel Postgres

1. In your Vercel dashboard, go to the LifeNavigator project
2. Click on "Storage" in the left sidebar
3. Click "Connect Store" > "Create New" > "Postgres"
4. Select a region close to your users
5. Click "Create & Connect"

This will automatically add the necessary environment variables:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 3: Ensure Required Environment Variables are Set

Make sure these environment variables are set in your Vercel project:

```
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=${VERCEL_URL}
SKIP_ENV_VALIDATION=true
NODE_ENV=production
```

## Step 4: Deploy with a Clean Build

1. Either push a small change to trigger a new build:
```bash
# Add a small change
echo "# Updated for Vercel deployment" >> README.md
git add README.md
git commit -m "Update for Vercel deployment"
git push origin main
```

2. Or manually trigger a new deployment from the Vercel dashboard:
   - Go to your project
   - Click "Deployments"
   - Click "Redeploy" next to your latest deployment

## Step 5: Handling Database Migrations

After a successful build, run migrations to set up your database schema:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link your local project
vercel link

# Run migrations
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Common Problems and Solutions

### 1. Missing Database URL

**Problem**: Prisma can't find a database connection string.

**Solution**: Ensure you've set up Vercel Postgres or added `DATABASE_URL` manually.

### 2. Schema References Models That Don't Exist

**Problem**: Your Prisma schema references models that are causing validation errors.

**Solution**: Use the simplified schema in `schema.prisma.vercel` which includes only essential models.

### 3. Build Timeouts

**Problem**: The build process times out during Prisma generation.

**Solution**: 
- Simplify your schema
- Increase build timeout in Project Settings > Advanced > Build & Development Settings

### 4. Vercel Adapter Issues

**Problem**: Errors related to Prisma adapters.

**Solution**: 
- Ensure you're using the latest Prisma version
- Add `"@prisma/next-adapter"` to your dependencies

## Switching Between Development and Production

For local development, you can keep using SQLite:

```bash
# Save the Vercel PostgreSQL schema
cp prisma/schema.prisma prisma/schema.prisma.postgres

# Use SQLite schema for development
cp prisma/schema.sqlite.backup prisma/schema.prisma
```

When deploying to Vercel, switch back:

```bash
# Use PostgreSQL schema for production
cp prisma/schema.prisma.postgres prisma/schema.prisma
```