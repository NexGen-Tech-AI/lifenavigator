# Production Backend Setup Guide

## Current Issue
The TypeScript errors are occurring because:
1. The new production schema (`schema.production.prisma`) hasn't been set as the active schema
2. Prisma Client hasn't been generated from the new schema
3. The current Prisma Client is based on the old minimal schema

## Solution Steps

### 1. Backup Current Database (if needed)
```bash
# If you have existing data you want to keep
npx prisma db pull
cp prisma/schema.prisma prisma/schema.old.prisma
```

### 2. Switch to Production Schema
```bash
# Replace current schema with production schema
cp prisma/schema.production.prisma prisma/schema.prisma
```

### 3. Generate Prisma Client
```bash
# This will generate TypeScript types from the new schema
npx prisma generate
```

### 4. Create Migration
```bash
# Create a new migration for the production schema
npx prisma migrate dev --name production_schema

# Or if you want to reset the database completely
npx prisma migrate reset
```

### 5. Seed Demo Data
```bash
# This will create the demo account and sample data
npx prisma db seed
```

## Environment Variables Required

Create a `.env` file with these variables:
```env
# Database
POSTGRES_PRISMA_URL="your-connection-string"
POSTGRES_URL_NON_POOLING="your-direct-connection-string"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Encryption
ENCRYPTION_KEY="generate-32-char-hex-string"
ENCRYPTION_MASTER_KEY="your-master-key"
ENCRYPTION_SALT="your-salt"

# Demo Account (DO NOT CHANGE)
DEMO_USER_EMAIL="demo@example.com"
DEMO_USER_PASSWORD="password"

# Feature Flags
ENABLE_PLAID_INTEGRATION="true"
ENABLE_DOCUMENT_UPLOAD="true"

# Optional: Plaid (for paid users)
PLAID_CLIENT_ID=""
PLAID_SECRET=""
PLAID_ENV="sandbox"
```

## Quick Setup Script
Run this to set everything up:
```bash
#!/bin/bash
# Save as setup-production.sh

# 1. Switch to production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate reset --force

# 4. Seed demo data
npx prisma db seed

echo "Production setup complete!"
```

## Verifying the Setup

After running the setup:
1. Check that `node_modules/.prisma/client` contains the new types
2. TypeScript errors should be resolved
3. Demo account should be accessible at demo@example.com / password
4. Run `npx prisma studio` to view the database

## Important Notes

1. **Demo Account Protection**: The demo account is protected at the database level and cannot be modified
2. **Data Source**: The schema is set up for PostgreSQL. Make sure your connection strings are correct
3. **Migrations**: The first migration will be large as it creates all tables
4. **Seed Data**: The seed script will create the demo user with sample financial data

## Next Steps

After setup:
1. Update frontend components to use the new API endpoints
2. Configure Plaid credentials for paid user features
3. Set up Stripe for subscription management
4. Configure document processing service (OCR)
5. Set up caching layer (Redis/Vercel KV)