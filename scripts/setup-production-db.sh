#!/bin/bash

# Setup production database schema
echo "Setting up production database schema..."

# Backup current schema
echo "Backing up current schema..."
cp prisma/schema.prisma prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma

# Use production schema as main schema
echo "Switching to production schema..."
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create migration (if needed)
echo "Creating migration..."
npx prisma migrate dev --name production_schema --create-only

echo "Production database setup complete!"
echo ""
echo "To apply migrations, run:"
echo "  npx prisma migrate deploy"
echo ""
echo "To seed demo data, run:"
echo "  npx prisma db seed"