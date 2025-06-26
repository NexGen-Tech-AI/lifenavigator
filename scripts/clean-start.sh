#!/bin/bash

echo "🧹 Cleaning all caches and build files..."

# Kill any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next" || true
pkill -f "node.*dev" || true

# Clear Next.js build and cache
echo "Clearing Next.js build files..."
rm -rf .next
rm -rf .swc

# Clear node_modules caches
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Clear other caches
echo "Clearing other caches..."
rm -rf .turbo
rm -rf .parcel-cache
rm -rf dist
rm -rf build

# Clear pnpm cache (optional - uncomment if needed)
# pnpm store prune

echo "✅ All caches cleared!"
echo ""
echo "📝 Next steps:"
echo "1. Open a new incognito/private browser window"
echo "2. Run: pnpm run dev"
echo "3. Navigate to: http://localhost:3000/auth/login"
echo "4. Login with:"
echo "   Email: demo@lifenavigator.tech"
echo "   Password: DemoPassword123"