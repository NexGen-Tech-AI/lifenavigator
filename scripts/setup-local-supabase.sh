#!/bin/bash

echo "🚀 Setting up local Supabase..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "📂 Initializing Supabase project..."
supabase init

# Start local Supabase
echo "🚀 Starting local Supabase..."
supabase start

# Get local credentials
echo ""
echo "✅ Local Supabase is running!"
echo ""
echo "Copy these values to your .env.local file:"
echo "========================================="
supabase status | grep -E "API URL|anon key|service_role key"
echo "========================================="
echo ""
echo "Example .env.local values:"
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=[copy anon key from above]"
echo "SUPABASE_SERVICE_ROLE_KEY=[copy service_role key from above]"