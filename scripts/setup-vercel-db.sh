#!/bin/bash

echo "🚀 Setting up Vercel PostgreSQL Database"
echo "======================================="
echo ""
echo "Prerequisites:"
echo "1. You must have the Vercel CLI installed (npm i -g vercel)"
echo "2. You must be logged in to Vercel (vercel login)"
echo "3. Your project must be linked to Vercel (vercel link)"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Create PostgreSQL database
echo "📦 Creating PostgreSQL database on Vercel..."
vercel env pull .env.production

# Check if database already exists
if grep -q "POSTGRES_PRISMA_URL" .env.production 2>/dev/null; then
    echo "✅ Database already exists!"
else
    echo "Creating new PostgreSQL database..."
    # This will open browser to create database
    echo "Please create a PostgreSQL database in your Vercel dashboard:"
    echo "1. Go to your project in Vercel"
    echo "2. Navigate to 'Storage' tab"
    echo "3. Click 'Create Database'"
    echo "4. Select 'Postgres'"
    echo "5. Follow the setup wizard"
    echo ""
    echo "After creating the database, run this script again."
    exit 0
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Create demo account
echo "👤 Creating demo account..."
npm run db:ensure-demo

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit your changes"
echo "2. Push to your repository"
echo "3. Vercel will automatically deploy"