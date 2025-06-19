# LifeNavigator Database Migration Guide

This document outlines the process of migrating the LifeNavigator database from SQLite to PostgreSQL for improved security, performance, and scalability.

## Why PostgreSQL?

PostgreSQL offers several advantages over SQLite for a production application:

1. **Enhanced Security**
   - Row-level security policies
   - Role-based access control
   - Encrypted connections (SSL/TLS)
   - Column-level encryption support
   - Comprehensive auditing capabilities

2. **Improved Performance**
   - Better concurrent access handling
   - Advanced indexing capabilities
   - Query optimization and planning
   - Connection pooling

3. **Scalability**
   - Supports larger datasets
   - Better handling of concurrent connections
   - Replication and high availability
   - Partitioning for large tables

4. **Compliance Features**
   - Supports HIPAA and financial regulatory requirements
   - Data integrity constraints
   - Transaction management
   - Backup and recovery mechanisms

## Prerequisites

- Docker and Docker Compose (for local PostgreSQL)
- Node.js and npm
- Prisma CLI

## Migration Process

### 1. Set Up PostgreSQL

For local development, we use Docker Compose to run PostgreSQL:

```bash
# Start PostgreSQL container
npm run docker:pg:up

# Check container status
docker ps
```

This will set up:
- PostgreSQL server on port 5432
- pgAdmin web interface on port 5050 (admin@example.com / admin)

### 2. Update Prisma Schema

Update the Prisma schema datasource from SQLite to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Create Migration

```bash
# Set the PostgreSQL connection string
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifenavigator?schema=public"

# Create migration
npx prisma migrate dev --name migrate_to_postgres
```

### 4. Run the Migration Script

We've created a helper script to automate the migration process:

```bash
# Run the migration script
npm run db:migrate-to-pg
```

This script will:
- Start PostgreSQL if not running
- Create a new `.env.postgres` file with the PostgreSQL connection string
- Replace the Prisma schema with the PostgreSQL version
- Run the Prisma migrations
- Generate the Prisma client

### 5. Post-Migration Steps

After migrating to PostgreSQL, you should:

1. **Verify Data Integrity**
   - Check that all data was migrated correctly
   - Verify relationships between tables

2. **Update Environment Configuration**
   - Replace your `.env` file with the PostgreSQL connection string
   - Update deployment configuration to use PostgreSQL

3. **Performance Tuning**
   - Add appropriate indexes based on query patterns
   - Configure connection pooling for production

4. **Security Configuration**
   - Set up user roles and permissions
   - Configure SSL/TLS for encrypted connections
   - Implement row-level security policies for sensitive data

## Connection Configuration

### Development Environment

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifenavigator?schema=public"
```

### Production Environment

For production, we recommend using managed PostgreSQL services like:
- AWS RDS for PostgreSQL
- Azure Database for PostgreSQL
- Google Cloud SQL for PostgreSQL
- Neon (serverless PostgreSQL)

Example connection string for production:

```
DATABASE_URL="postgresql://username:password@production-host:5432/lifenavigator?schema=public&sslmode=require"
```

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Verify PostgreSQL is running: `docker ps`
   - Check network configuration: `telnet localhost 5432`
   - Ensure credentials are correct

2. **Migration Errors**
   - Data type compatibility issues
   - Missing dependencies
   - Permission problems

3. **Performance Issues**
   - Check query execution plans: `EXPLAIN ANALYZE`
   - Review and update indexes
   - Monitor connection pooling configuration

For support, contact the development team or open an issue in the repository.