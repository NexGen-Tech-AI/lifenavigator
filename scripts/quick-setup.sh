#!/bin/bash

echo "🚀 LifeNavigator Quick Setup"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local already exists"
else
    echo "📝 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your Supabase credentials"
    echo ""
    echo "To get your Supabase credentials:"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Go to Settings > API"
    echo "3. Copy the following values:"
    echo "   - Project URL → NEXT_PUBLIC_SUPABASE_URL"
    echo "   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - service_role key → SUPABASE_SERVICE_ROLE_KEY"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm prisma generate

# Run validation
echo "🔐 Validating authentication setup..."
npm run auth:validate

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For testing without Supabase setup:"
echo "You can use the mock development mode by setting:"
echo "NEXT_PUBLIC_USE_MOCK_AUTH=true in .env.local"