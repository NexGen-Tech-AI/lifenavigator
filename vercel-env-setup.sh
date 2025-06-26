#!/bin/bash

echo "Setting up Vercel environment variables for demo mode..."
echo ""
echo "Please run these commands:"
echo ""

# Set demo mode variables
echo "vercel env add NEXT_PUBLIC_DEMO_MODE"
echo "When prompted, enter: true"
echo "Select: Production, Preview, Development"
echo ""

echo "vercel env add NEXT_PUBLIC_SKIP_AUTH"
echo "When prompted, enter: true"
echo "Select: Production, Preview, Development"
echo ""

# If Supabase is not configured, use dummy values
echo "# If you don't have Supabase configured, use these dummy values:"
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "When prompted, enter: https://dummy.supabase.co"
echo ""

echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "When prompted, enter: dummy-key-for-demo-mode"
echo ""

echo "# After setting all variables, redeploy:"
echo "vercel --prod"