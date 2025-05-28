# Fix TypeScript Errors - Quick Guide

## The Problem
The TypeScript errors are happening because:
1. Prisma Client hasn't been generated from the new production schema
2. The current Prisma Client is based on the old minimal schema
3. TypeScript can't find the new models and enums

## Quick Fix (Run These Commands)

```bash
# 1. Navigate to project root
cd /home/vboxuser/lifenavigator

# 2. Switch to production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# 3. Generate Prisma Client (this creates all TypeScript types)
npx prisma generate

# 4. Restart TypeScript Server in VSCode
# Press: Cmd/Ctrl + Shift + P
# Type: "TypeScript: Restart TS Server"
# Press Enter
```

## Complete Setup (If Starting Fresh)

```bash
# 1. Switch schema
cp prisma/schema.production.prisma prisma/schema.prisma

# 2. Generate Prisma Client
npx prisma generate

# 3. Create database tables
npx prisma migrate dev --name production_schema

# 4. Seed demo data
npx prisma db seed
```

## Verify Fix

After running the commands:
1. Check that `node_modules/.prisma/client/index.d.ts` exists
2. This file should contain all the enums like `AccountType`, `DataSource`, etc.
3. All red squiggly lines in VSCode should disappear
4. You may need to restart VSCode or the TS server

## If Errors Persist

1. Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
npx prisma generate
```

2. Clear TypeScript cache:
```bash
rm -rf .next
npm run dev
```

3. Check that your `.env` file has database connection:
```env
POSTGRES_PRISMA_URL="your-connection-string"
POSTGRES_URL_NON_POOLING="your-direct-connection-string"
```

## Why This Works

- `prisma generate` reads the schema.prisma file
- It generates TypeScript types in `node_modules/.prisma/client`
- These types include all models, enums, and Prisma Client methods
- TypeScript can then find all the imports and types

The errors will be completely resolved once Prisma generates the client from the production schema!