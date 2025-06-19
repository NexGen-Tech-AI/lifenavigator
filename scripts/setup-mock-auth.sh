#!/bin/bash

echo "🔧 Setting up Mock Authentication for Development"
echo "================================================"
echo ""
echo "The app is currently using mock authentication because Supabase is not configured."
echo ""
echo "Available accounts:"
echo "1. timothy@riffeandassociates.com / Sushi!\$#1"
echo "2. demo@lifenavigator.ai / demo123"
echo "3. plaid-demo@lifenavigator.ai / plaid-demo-2024"
echo ""
echo "To use real authentication with Supabase:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Update .env.local with your Supabase credentials"
echo "3. Run: pnpm run setup:supabase"
echo ""
echo "For now, you can use the mock authentication."
echo ""

# Clear any existing auth cookies
echo "Clearing any existing auth data..."
if command -v curl &> /dev/null; then
    curl -X POST http://localhost:3001/api/auth/clear-session 2>/dev/null || true
fi

echo ""
echo "✅ Mock authentication is ready!"
echo ""
echo "Navigate to: http://localhost:3001/auth/login"
echo "Use any of the credentials above to login."