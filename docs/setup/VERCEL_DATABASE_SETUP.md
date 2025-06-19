# Vercel PostgreSQL Database Setup Guide

This guide provides step-by-step instructions for setting up the LifeNavigator application with Vercel PostgreSQL.

## Overview

LifeNavigator requires a PostgreSQL database for storing user data, authentication information, and application state. This guide will help you set up the database with Vercel PostgreSQL, which offers:

- Seamless integration with Vercel deployments
- Connection pooling for efficient database connections
- Automatic scaling based on your application's needs
- Built-in backup and recovery

## Prerequisites

- A Vercel account
- A project created on Vercel
- The LifeNavigator codebase

## Step 1: Create a Vercel PostgreSQL Database

1. Log in to your Vercel dashboard
2. Navigate to your project
3. Click on "Storage" in the sidebar
4. Select "Connect Database" and choose "PostgreSQL"
5. Follow the prompts to create a new PostgreSQL database
6. Once created, Vercel will automatically add the following environment variables to your project:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

## Step 2: Prepare Your Local Environment

1. Copy the environment variables from your Vercel project settings
2. Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key-here"
POSTGRES_PRISMA_URL="postgresql://username:password@hostname:port/database"
POSTGRES_URL_NON_POOLING="postgresql://username:password@hostname:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags
USE_MOCK_DB="false"
ENABLE_FIELD_ENCRYPTION="false"

# Environment
NODE_ENV="development"
APP_ENV="development"
```

## Step 3: Run the Database Setup Script

We've created a script that automates the database setup process for Vercel. This script will:

1. Backup your schema.prisma file
2. Temporarily modify it to use the direct PostgreSQL connection
3. Run the migrations to create the database schema
4. Create a demo user account
5. Restore your original schema.prisma file

To run this script:

```bash
# Make the script executable
chmod +x scripts/vercel-db-setup.js

# Run the script
node scripts/vercel-db-setup.js
```

## Step 4: Deploy Your Application

Once your database is set up, you can deploy your application to Vercel:

```bash
# Deploy to production
vercel --prod
```

## Troubleshooting

### Connection Issues

If you're experiencing connection issues, check the following:

1. Verify your environment variables are set correctly in Vercel
2. Ensure your IP address is allowed by any database firewall rules
3. Check that the `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` variables have the correct format

### Migration Errors

If you encounter errors running migrations:

1. Check that your schema.prisma file uses the correct database provider (`postgresql`)
2. Verify that all environment variables are set correctly
3. Try running the migrations manually:

```bash
DATABASE_URL=your-direct-connection-url npx prisma migrate deploy
```

### Demo User Creation

If the demo user creation fails:

1. You can manually create a user by running:

```bash
# Connect to the database
psql your-database-connection-string

# Create a user (password is hashed, so use this pre-hashed value)
INSERT INTO users (id, email, name, password, "setupCompleted", "createdAt", "updatedAt")
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'demo@example.com',
  'Demo User',
  '$2b$12$nJ6Px9NBrXzfyTLNWQ5qfesLO0qlJJGw.DZkU2JqxJTI2dZ.FxMea',
  true,
  NOW(),
  NOW()
);
```

## Additional Resources

- [Vercel PostgreSQL Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/example)