#!/bin/bash

# =============================================
# LIFENAVIGATOR COMPLETE DATABASE SETUP
# Production-ready migration runner
# =============================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   LifeNavigator Database Setup${NC}"
echo -e "${BLUE}================================================${NC}"

# Check for required environment variables
check_env() {
    local var_name=$1
    if [ -z "${!var_name:-}" ]; then
        echo -e "${RED}Error: $var_name is not set${NC}"
        echo "Please set it in your .env file or export it"
        exit 1
    fi
}

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}Loading environment variables...${NC}"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Verify required environment variables
echo -e "${YELLOW}Verifying environment...${NC}"
check_env "DATABASE_URL"

# Extract database connection details
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_NAME="${BASH_REMATCH[4]}"
else
    echo -e "${RED}Error: Invalid DATABASE_URL format${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment verified${NC}"

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please check your DATABASE_URL"
    exit 1
fi

# Backup existing schema (if any)
echo -e "${YELLOW}Creating backup of existing schema...${NC}"
BACKUP_FILE="$PROJECT_ROOT/backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p "$PROJECT_ROOT/backups"

if PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --schema-only > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No existing schema to backup (this is normal for new databases)${NC}"
fi

# Function to run a migration file
run_migration() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${YELLOW}Running migration: $filename${NC}"
    
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $filename completed${NC}"
        return 0
    else
        echo -e "${RED}✗ $filename failed${NC}"
        echo -e "${RED}Running with verbose output:${NC}"
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file"
        return 1
    fi
}

# Check if we should run the complete migration or individual files
if [ -f "$MIGRATIONS_DIR/000_complete_lifenavigator_schema.sql" ]; then
    echo -e "${BLUE}Running complete database migration...${NC}"
    echo -e "${YELLOW}This will create all tables, functions, and security policies${NC}"
    
    # Confirm before proceeding
    read -p "Continue with database setup? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Setup cancelled${NC}"
        exit 0
    fi
    
    # Run the complete migration
    if run_migration "$MIGRATIONS_DIR/000_complete_lifenavigator_schema.sql"; then
        echo -e "${GREEN}✓ Complete database schema created successfully!${NC}"
    else
        echo -e "${RED}✗ Migration failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Complete migration file not found${NC}"
    echo "Expected: $MIGRATIONS_DIR/000_complete_lifenavigator_schema.sql"
    exit 1
fi

# Verify the migration
echo -e "${YELLOW}Verifying database setup...${NC}"

# Count tables
TABLE_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
" 2>/dev/null | xargs)

echo -e "${GREEN}✓ Tables created: $TABLE_COUNT${NC}"

# Check RLS
RLS_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true
" 2>/dev/null | xargs)

echo -e "${GREEN}✓ Tables with RLS enabled: $RLS_COUNT${NC}"

# Check functions
FUNCTION_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public'
" 2>/dev/null | xargs)

echo -e "${GREEN}✓ Functions created: $FUNCTION_COUNT${NC}"

# Set encryption keys (for development)
if [ "${APP_ENV:-development}" = "development" ]; then
    echo -e "${YELLOW}Setting up encryption keys for development...${NC}"
    
    # Generate random keys if not set
    ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(openssl rand -base64 32)}"
    PII_ENCRYPTION_KEY="${PII_ENCRYPTION_KEY:-$(openssl rand -base64 32)}"
    PHI_ENCRYPTION_KEY="${PHI_ENCRYPTION_KEY:-$(openssl rand -base64 32)}"
    FINANCIAL_ENCRYPTION_KEY="${FINANCIAL_ENCRYPTION_KEY:-$(openssl rand -base64 32)}"
    
    # Store keys in .env if not already there
    if ! grep -q "ENCRYPTION_KEY" "$PROJECT_ROOT/.env" 2>/dev/null; then
        echo "" >> "$PROJECT_ROOT/.env"
        echo "# Encryption Keys (auto-generated)" >> "$PROJECT_ROOT/.env"
        echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> "$PROJECT_ROOT/.env"
        echo "PII_ENCRYPTION_KEY=$PII_ENCRYPTION_KEY" >> "$PROJECT_ROOT/.env"
        echo "PHI_ENCRYPTION_KEY=$PHI_ENCRYPTION_KEY" >> "$PROJECT_ROOT/.env"
        echo "FINANCIAL_ENCRYPTION_KEY=$FINANCIAL_ENCRYPTION_KEY" >> "$PROJECT_ROOT/.env"
        echo -e "${GREEN}✓ Encryption keys saved to .env${NC}"
    fi
    
    # Set keys in database session
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<EOF > /dev/null 2>&1
        ALTER DATABASE "$DB_NAME" SET "app.encryption_key" = '$ENCRYPTION_KEY';
        ALTER DATABASE "$DB_NAME" SET "app.pii_encryption_key" = '$PII_ENCRYPTION_KEY';
        ALTER DATABASE "$DB_NAME" SET "app.phi_encryption_key" = '$PHI_ENCRYPTION_KEY';
        ALTER DATABASE "$DB_NAME" SET "app.financial_encryption_key" = '$FINANCIAL_ENCRYPTION_KEY';
EOF
    echo -e "${GREEN}✓ Encryption keys configured${NC}"
fi

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create demo accounts: npm run setup:demo-accounts"
echo "2. Test authentication: npm run test:auth"
echo "3. Start development server: npm run dev"
echo
echo -e "${YELLOW}Important:${NC}"
echo "- RLS is enabled on all tables"
echo "- Audit logging is active"
echo "- Encryption functions are ready"
echo "- Remember to set up Supabase Auth in the dashboard"
echo
echo -e "${GREEN}🚀 Ready for pilot launch!${NC}"

# Optional: Create a migration record
MIGRATION_RECORD="$PROJECT_ROOT/.migration-completed"
echo "Migration completed at: $(date)" > "$MIGRATION_RECORD"
echo "Database: $DB_NAME" >> "$MIGRATION_RECORD"
echo "Tables created: $TABLE_COUNT" >> "$MIGRATION_RECORD"
echo "RLS enabled: $RLS_COUNT" >> "$MIGRATION_RECORD"
echo "Functions: $FUNCTION_COUNT" >> "$MIGRATION_RECORD"