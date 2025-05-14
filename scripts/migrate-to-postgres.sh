#!/bin/bash
# Script to migrate from SQLite to PostgreSQL

# Exit on error
set -e

# Variables (change these as needed)
ENV_FILE=".env"
PG_CONNECTION_STRING="postgresql://postgres:postgres@localhost:5432/lifenavigator?schema=public"
NEW_ENV_FILE=".env.postgres"
DOCKER_COMPOSE_FILE="docker-compose.postgres.yml"

# Check if PostgreSQL is available
echo "Checking PostgreSQL connection..."
if ! command -v pg_isready &> /dev/null; then
    echo "pg_isready command not found. Using Docker for PostgreSQL..."
    # Skip installing PostgreSQL client - we'll just use Docker
fi

# Use Docker for PostgreSQL
echo "Starting PostgreSQL with Docker..."

# Create Docker Compose file for PostgreSQL
cat > ${DOCKER_COMPOSE_FILE} << EOF
version: '3.8'
services:
  postgres:
    image: postgres:14
    container_name: lifenavigator-postgres
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: lifenavigator
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose -f ${DOCKER_COMPOSE_FILE} up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 10

# Create new .env file for PostgreSQL
echo "Creating new .env file with PostgreSQL connection string..."
if [ -f "${ENV_FILE}" ]; then
    cp "${ENV_FILE}" "${NEW_ENV_FILE}"
    # Replace or add DATABASE_URL
    if grep -q "^DATABASE_URL=" "${NEW_ENV_FILE}"; then
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${PG_CONNECTION_STRING}|" "${NEW_ENV_FILE}"
    else
        echo "DATABASE_URL=${PG_CONNECTION_STRING}" >> "${NEW_ENV_FILE}"
    fi
else
    echo "DATABASE_URL=${PG_CONNECTION_STRING}" > "${NEW_ENV_FILE}"
    echo "Warning: Original .env file not found. Created a new one with only DATABASE_URL."
fi

# Replace schema.prisma with PostgreSQL version
echo "Updating Prisma schema for PostgreSQL..."
if [ -f "prisma/schema.prisma.postgres" ]; then
    cp prisma/schema.prisma prisma/schema.prisma.sqlite.backup
    cp prisma/schema.prisma.postgres prisma/schema.prisma
else
    echo "Error: prisma/schema.prisma.postgres file not found."
    exit 1
fi

# Run Prisma migration
echo "Running Prisma migration to PostgreSQL..."
export DATABASE_URL=${PG_CONNECTION_STRING}

# Generate migration
npx prisma migrate dev --name migrate_to_postgres --create-only

# Apply migration
echo "Applying database migration..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration completed successfully!"
echo "Use the following commands to apply the changes:"
echo "1. mv ${NEW_ENV_FILE} ${ENV_FILE} # Replace .env file"
echo "2. npm run dev # Start the application with PostgreSQL"