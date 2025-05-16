# Setting Up LifeNavigator Database on Vercel

This guide walks through setting up the comprehensive PostgreSQL database for LifeNavigator on Vercel, with instructions for deployment and migration.

## Database Architecture

Our database is designed as a **single comprehensive PostgreSQL database** with multiple related tables organized by domain:

1. **Authentication & Users** - Core user data and authentication information
2. **Financial** - Accounts, transactions, assets, and financial goals
3. **Health** - Health records and metrics
4. **Education** - Educational background and ongoing courses
5. **Career** - Professional profiles and job applications
6. **Documents** - Secure document storage across all domains
7. **Integration** - Third-party service connections

This design provides complete relational capabilities while keeping everything in a single database for simplicity and cost efficiency.

## Setting Up Vercel Postgres

1. **Create a Vercel Postgres Database**:
   
   From your Vercel dashboard:
   - Go to **Storage**
   - Click **Create** → **Postgres Database**
   - Choose a region closest to most users
   - Select plan (recommend starting with **Starter: $20/mo**)
   - Name your database (e.g., `lifenavigator-db`)
   - Click **Create**

2. **Connect to Your Project**:
   
   After creation:
   - Connect to your LifeNavigator project
   - Vercel will automatically add environment variables:
     - `POSTGRES_PRISMA_URL` (for connection pooling)
     - `POSTGRES_URL_NON_POOLING` (for migrations and direct operations)

3. **Database Credentials**:

   Vercel provides:
   - Database host
   - Database name
   - Username (usually `default`)
   - Password (auto-generated)
   - Connection string

   These are stored securely as environment variables in your project settings.

## Database Migration

1. **Prepare Schema**:
   
   We've created a comprehensive schema in `prisma/schema.prisma.comprehensive`.
   To use it:

   ```bash
   # Copy the comprehensive schema
   cp prisma/schema.prisma.comprehensive prisma/schema.prisma
   ```

2. **Generate Prisma Client**:

   ```bash
   # Generate the client based on the schema
   npx prisma generate
   ```

3. **Deploy Migrations**:

   After your project is deployed to Vercel:

   ```bash
   # Use Vercel CLI to run migrations
   npx vercel run --prod "npx prisma migrate deploy"
   ```

   Or use their web interface to run a deployment function.

4. **Seeding Initial Data** (Optional):

   To add initial data:

   ```bash
   # Run seed script
   npx vercel run --prod "npx prisma db seed"
   ```

## Database Structure Details

### Core Authentication Tables

- `users` - Primary user accounts
- `accounts` - OAuth accounts connected to users
- `sessions` - Active user sessions
- `verification_tokens` - Email verification
- `revoked_tokens` - JWT token revocation list
- `security_audit_logs` - Security audit trail

### User Preferences

- `user_preferences` - User settings and preferences
- `notifications` - User notification system

### Financial Domain

- `financial_accounts` - Bank, investment accounts
- `transactions` - Financial transactions
- `assets` - User assets tracking
- `financial_goals` - Savings and financial goals

### Health Domain

- `health_records` - Medical visits, diagnoses
- `health_metrics` - Health tracking data points

### Education Domain

- `education_records` - Formal education history
- `education_courses` - Ongoing courses and training

### Career Domain

- `career_profiles` - Professional profiles
- `job_applications` - Job application tracking

### Document Storage

- `documents` - Secure document storage for all domains

### Integration & Search

- `user_integrations` - Third-party service connections
- `saved_searches` - User search history and saved searches

## Future Database Extensions

This database is designed to easily migrate to specialized databases in the future:

1. **DynamoDB/MongoDB** - For high-write document storage (could migrate `documents`, `health_metrics`)
2. **Neo4j/Neptune** - For graph relationships (career connections, education pathways)
3. **Qdrant/Pinecone/Weaviate** - For vector embeddings (search, recommendations)

Each of these can be added as complementary databases while keeping the core relational data in PostgreSQL.

## Monitoring and Management

Vercel provides:

- Database metrics dashboard
- Connection pooling management
- Automatic backups (daily)
- Point-in-time recovery

For additional management:
- Connect using any PostgreSQL client with the connection string
- Use Prisma Studio for data browsing (`npx prisma studio`)

## Security Considerations

1. **Data Encryption**:
   - Sensitive fields can be encrypted at the application level
   - Vercel Postgres provides encryption at rest

2. **Access Control**:
   - Database credentials are stored securely as environment variables
   - Database is only accessible within Vercel's network by default

3. **Data Validation**:
   - Use Prisma's validation capabilities for data integrity
   - Implement additional validation at the API level

## Performance Optimization

For optimal performance with Vercel's serverless functions:

1. **Indexes**:
   - Key indexes are already defined in the schema
   - Add additional indexes based on query patterns

2. **Connection Pooling**:
   - Always use `POSTGRES_PRISMA_URL` for normal operations
   - This ensures efficient connection reuse across function invocations

3. **Query Optimization**:
   - Use Prisma's query capabilities efficiently
   - Consider pagination for large result sets