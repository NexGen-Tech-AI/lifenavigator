#!/bin/bash

echo "🚀 Quick Start for Development"
echo "============================="
echo ""
echo "This will set up the app to run without Supabase"
echo ""

# Backup original middleware
if [ -f "src/middleware.ts" ] && [ ! -f "src/middleware.original.ts" ]; then
  echo "📦 Backing up original middleware..."
  mv src/middleware.ts src/middleware.original.ts
fi

# Use simple middleware
echo "📝 Setting up simple middleware..."
cp src/middleware.simple.ts src/middleware.ts

# Clear Next.js cache
echo "🧹 Clearing cache..."
rm -rf .next

# Start the app
echo "🚀 Starting the app..."
echo ""
echo "✅ Login with:"
echo "   Email: demo@lifenavigator.tech"
echo "   Password: DemoPassword123"
echo ""

npm run dev