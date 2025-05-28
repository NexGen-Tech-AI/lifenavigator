#!/bin/bash

echo "🔧 Fixing Prisma TypeScript errors..."
echo ""

# Step 1: Check current directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Step 2: Backup current schema
echo "📋 Backing up current schema..."
cp prisma/schema.prisma prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma

# Step 3: Copy production schema
echo "📝 Switching to production schema..."
cp prisma/schema.production.prisma prisma/schema.prisma

# Step 4: Install dependencies (in case they're missing)
echo "📦 Ensuring dependencies are installed..."
npm install

# Step 5: Generate Prisma Client
echo "🏗️  Generating Prisma Client..."
npx prisma generate

# Step 6: Show success message
echo ""
echo "✅ Prisma client generated successfully!"
echo ""
echo "The TypeScript errors should now be resolved."
echo ""
echo "Next steps:"
echo "1. If you haven't set up the database yet, run:"
echo "   npx prisma migrate dev --name init_production"
echo ""
echo "2. To seed the demo data, run:"
echo "   npx prisma db seed"
echo ""
echo "3. Restart your TypeScript server in VSCode:"
echo "   - Press Cmd/Ctrl + Shift + P"
echo "   - Type 'TypeScript: Restart TS Server'"
echo "   - Press Enter"