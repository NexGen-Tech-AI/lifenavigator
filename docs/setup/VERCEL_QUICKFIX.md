# Quick Fix for Vercel Deployment: Setting Up PostgreSQL

This document provides instructions for setting up the LifeNavigator application with a real PostgreSQL database on Vercel.

## 🚨 The Current Status

The application has been configured to use a PostgreSQL database for authentication and data storage.

## 🛠️ Setting Up PostgreSQL on Vercel

### 1. Create a PostgreSQL Database

1. Go to your Vercel project dashboard
2. Navigate to "Storage" tab
3. Click "Connect Database" > "Create New" > "PostgreSQL Database"
4. Follow the setup wizard to create your database
5. After creation, Vercel will automatically add these environment variables to your project:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### 2. Verify Environment Variables

Ensure the following environment variables are set correctly in your Vercel project settings:

- `USE_MOCK_DB` = `false`
- `NEXTAUTH_URL` = `https://${VERCEL_URL}`
- `NEXTAUTH_SECRET` - A secure random string for JWT encryption

### 3. Deploy Your Application

1. Push your changes to your repository
2. Vercel will automatically deploy with the PostgreSQL configuration

### 4. Set Up Database Schema and Seed Data

After deployment, run the following commands to set up your database:

```bash
# Run database migrations
vercel --prod run pnpm prisma migrate deploy

# Seed the database with demo data (includes demo account)
vercel --prod run pnpm db:seed
```

This will:
1. Create all the required database tables
2. Set up the demo account
3. Add sample data for the demo user

## ✅ Verifying It Works

After setup, you should be able to:

1. Log in with the demo account (`demo@example.com` / `password`)
2. Register new accounts through the registration form
3. Log in with newly created accounts
4. See all user data persist between sessions

## 🔄 Database Maintenance

Whenever you make schema changes:

1. Run migrations locally first:
   ```bash
   pnpm prisma:migrate-dev --name your_change_name
   ```

2. After deploying to Vercel, apply the migrations:
   ```bash
   vercel --prod run pnpm prisma migrate deploy
   ```

## 🧰 Troubleshooting

If you encounter issues:

1. **Database Connection Issues**:
   - Verify your PostgreSQL database is running in Vercel
   - Check that connection URLs are correctly formatted with `postgresql://`
   - Try visiting `/api/db-test` to test the connection

2. **Missing Demo Account**:
   - Run the seed command: `vercel --prod run pnpm db:seed`
   - Or visit `/api/auth/ensure-demo` to create just the demo account

3. **Migration Failures**:
   - Check Vercel logs for specific error messages
   - Verify your schema.prisma file is valid

## 💡 Advanced Configuration

For better scalability and performance:

1. **Connection Pooling**:
   The Vercel PostgreSQL setup automatically includes connection pooling via the `POSTGRES_PRISMA_URL` environment variable.

2. **Database Security**:
   - All sensitive user data is stored securely
   - Passwords are hashed using bcrypt
   - JWT tokens include rotation and revocation mechanisms

3. **Database Backups**:
   Vercel automatically handles regular backups of your PostgreSQL database.

## 📝 Development Workflow

For the best development experience:

1. Use the PostgreSQL database during development:
   ```bash
   pnpm docker:pg:up
   pnpm prisma:generate
   pnpm db:push
   pnpm db:seed
   ```

2. When deploying to Vercel, the application will use the Vercel PostgreSQL instance automatically.