# LifeNavigator Deployment Guide

## Overview

This guide explains how to deploy LifeNavigator with proper database configuration:
- **Development**: Uses mock database (no setup required)
- **Production**: Uses Vercel PostgreSQL

## Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```

3. **Login with demo account**:
   - Email: `demo@example.com`
   - Password: `password`

The development environment automatically uses a mock database with the demo account pre-configured.

## Production Deployment on Vercel

### Step 1: Create Vercel Project

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

### Step 2: Create PostgreSQL Database

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name and region
6. Click **Create**

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 3: Add Required Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`) | Production |
| `NODE_ENV` | `production` | Production |

### Step 4: Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure production deployment"
   git push
   ```

2. **Deploy to Vercel**:
   - Vercel will automatically deploy when you push to your main branch
   - Or manually deploy: `vercel --prod`

### Step 5: Initialize Database

After deployment, the build process will:
1. Run database migrations
2. Create the demo account

You can verify by visiting:
- `https://your-app.vercel.app/auth/login`
- Login with `demo@example.com` / `password`

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **Check environment variables** in Vercel Dashboard
2. **Verify database is created** in Storage tab
3. **Check logs**: `vercel logs`

### Authentication Issues

If login fails:

1. **Verify NEXTAUTH_URL** matches your production URL
2. **Check NEXTAUTH_SECRET** is set
3. **Ensure database migrations ran**: Check build logs

### Reset Database

If needed, you can reset the database:

1. In Vercel Dashboard > Storage > Your Database
2. Click on **Data** tab
3. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
4. Redeploy to run migrations

## Environment Variables Reference

### Required for Production

- `NEXTAUTH_SECRET`: Random string for JWT signing
- `NEXTAUTH_URL`: Your production URL
- `POSTGRES_*`: Automatically set by Vercel

### Optional

- `RATE_LIMIT_AUTH`: Auth endpoint rate limit (default: "20:60000")
- `RATE_LIMIT_STANDARD`: Standard API rate limit (default: "100:60000")
- `LOG_LEVEL`: Logging level (default: "error")

## Demo Account

The demo account is automatically created during deployment:
- Email: `demo@example.com`
- Password: `password`

Users can also register their own accounts.