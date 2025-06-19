# PostgreSQL Connection Guide for LifeNavigator

This guide provides instructions for connecting your Vercel-deployed LifeNavigator application to a PostgreSQL database, with specific focus on using both AWS RDS and Vercel Postgres options.

## Option 1: Using Vercel Postgres (Recommended)

Vercel Postgres is a fully managed PostgreSQL database service that integrates seamlessly with Vercel deployments.

### Step 1: Create a Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your LifeNavigator project
3. Navigate to the "Storage" tab
4. Click "Connect Store" > "Create New" > "Postgres"
5. Choose a region closest to your users
6. Click "Create & Connect"

### Step 2: Environment Variables

Vercel automatically adds these environment variables to your project:

- `POSTGRES_URL`: Main connection string
- `POSTGRES_PRISMA_URL`: Connection string formatted for Prisma
- `POSTGRES_URL_NON_POOLING`: Direct connection string for migrations
- `POSTGRES_USER`: Database username
- `POSTGRES_HOST`: Database host
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DATABASE`: Database name

### Step 3: Update Prisma Configuration

1. Modify your `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // Pooled connection for better performance
  directUrl = env("POSTGRES_URL_NON_POOLING") // Direct connection for migrations
}
```

### Step 4: Deploy Migrations

```bash
# Pull environment variables
vercel env pull .env.production.local

# Run migrations against the production database
npx prisma migrate deploy
```

## Option 2: Using AWS RDS PostgreSQL

If you need more control or are using other AWS services, AWS RDS is a good option.

### Step 1: Create an RDS PostgreSQL Instance

1. Go to AWS RDS Console
2. Click "Create database"
3. Select "PostgreSQL"
4. Choose your preferred settings:
   - Dev/Test or Production template
   - DB instance identifier: `lifenavigator-db`
   - Master username: `lifenavigator`
   - Master password: [Create a strong password]
   - DB instance class: Choose based on your needs
   - Storage: Start with 20GB, enable autoscaling
   - VPC security group: Create new or use existing
   - Public accessibility: Yes (for development), No (for production)
5. Click "Create database"

### Step 2: Configure Security Group

1. Go to the "Security Groups" section in AWS
2. Find the security group associated with your RDS instance
3. Add inbound rule:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port Range: 5432
   - Source: Vercel IP ranges (if known) or temporarily use your IP for testing

### Step 3: Add Environment Variables to Vercel

In your Vercel project settings, add:

```
DATABASE_URL=postgresql://lifenavigator:password@your-db-instance.region.rds.amazonaws.com:5432/lifenavigator?schema=public&sslmode=require
DIRECT_URL=postgresql://lifenavigator:password@your-db-instance.region.rds.amazonaws.com:5432/lifenavigator?schema=public&sslmode=require
```

Replace `password` with your actual database password and the hostname with your RDS endpoint.

### Step 4: Update Prisma Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 5: Run Migrations

```bash
npx prisma migrate deploy
```

## Connection Pooling with PgBouncer (Advanced)

For improved performance with many concurrent connections:

### Step 1: Set Up PgBouncer

If using AWS, you can set up PgBouncer on an EC2 instance:

1. Launch an EC2 instance in the same VPC as your RDS
2. Install PgBouncer:
   ```bash
   sudo apt-get update
   sudo apt-get install -y pgbouncer
   ```

3. Configure PgBouncer:
   ```
   [databases]
   lifenavigator = host=your-db-instance.region.rds.amazonaws.com port=5432 dbname=lifenavigator
   
   [pgbouncer]
   listen_addr = *
   listen_port = 6432
   auth_type = md5
   auth_file = /etc/pgbouncer/userlist.txt
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 20
   ```

### Step 2: Update Connection String

Update your Vercel environment variables to use PgBouncer:

```
DATABASE_URL=postgresql://lifenavigator:password@your-pgbouncer-instance:6432/lifenavigator?schema=public&pgbouncer=true
DIRECT_URL=postgresql://lifenavigator:password@your-db-instance.region.rds.amazonaws.com:5432/lifenavigator?schema=public
```

## Database Migrations with Prisma

When making schema changes:

1. Make changes to your `schema.prisma` file
2. Generate a new migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Deploy the migration:
   ```bash
   npx prisma migrate deploy
   ```

## Monitoring and Maintenance

### Performance Monitoring

1. For Vercel Postgres:
   - Use the Vercel dashboard metrics
   
2. For AWS RDS:
   - Use RDS Performance Insights
   - Set up CloudWatch alarms for:
     - CPU Utilization
     - Free Memory
     - Disk Queue Depth
     - Free Storage Space

### Backups

1. For Vercel Postgres:
   - Automated backups are included
   
2. For AWS RDS:
   - Enable automated backups
   - Set appropriate backup window and retention period
   - For critical data, consider point-in-time recovery

### Scaling

1. For Vercel Postgres:
   - Upgrade your plan as needed
   
2. For AWS RDS:
   - Scale vertically (increase instance class)
   - Scale storage independently
   - Consider read replicas for read-heavy workloads

## Troubleshooting

### Connection Issues

If you see errors like "connection refused" or timeouts:

1. Check security group rules
2. Verify the database is running
3. Confirm correct connection string parameters
4. Check for IP restrictions or VPC configurations

### Migration Failures

If migrations fail:

1. Run with `--verbose` flag to see detailed errors
2. Check if you need to provide `directUrl` for migrations
3. Verify database permissions
4. Consider manually connecting to the database to check state

### Connection Pool Exhaustion

If you see "too many clients already" errors:

1. Increase pool size in connection configuration
2. Implement proper connection closing in your code
3. Monitor connection usage
4. Consider implementing connection pooling if not already using it