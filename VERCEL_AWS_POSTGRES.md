# Connecting Vercel to AWS PostgreSQL

This guide outlines how to connect your Vercel-deployed LifeNavigator application to an AWS PostgreSQL database.

## Prerequisites

- A Vercel account with your application deployed
- An AWS account
- An existing PostgreSQL database running on AWS RDS or Aurora

## Setup Steps

### 1. Configure AWS Database for External Access

1. **Security Group Configuration**:
   - Navigate to the AWS RDS console
   - Find your database instance
   - Go to the associated security group
   - Add an inbound rule to allow Vercel's IP addresses
   - For development, you can allow your own IP temporarily

2. **Database User Creation**:
   - Create a dedicated user for your Vercel application:
   ```sql
   CREATE USER vercel_app WITH PASSWORD 'strong-password-here';
   GRANT CONNECT ON DATABASE your_database TO vercel_app;
   GRANT USAGE ON SCHEMA public TO vercel_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vercel_app;
   GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO vercel_app;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vercel_app;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO vercel_app;
   ```

### 2. Configure Vercel Environment Variables

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Environment Variables" section
3. Add the following variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATABASE_URL` | `postgresql://vercel_app:password@your-aws-db-host:5432/your-database?schema=public` | Production, Preview, Development |
   | `DIRECT_URL` | (Same as DATABASE_URL) | Production, Preview, Development |

4. Click "Save" to add these variables to your project

### 3. Update Prisma Configuration

Ensure your Prisma configuration is ready for the PostgreSQL connection:

1. Update your `prisma/schema.prisma` file:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Your models...
```

2. Generate a new Prisma client that supports PostgreSQL:

```bash
npx prisma generate
```

### 4. Deploy Database Migrations

Deploy your database schema to the PostgreSQL database:

```bash
npx prisma migrate deploy
```

### 5. Test the Connection

1. Create a simple API endpoint to test database connectivity:

```typescript
// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const result = await db.$queryRaw`SELECT 1+1 AS result`;
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      result 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to the database" 
    }, { status: 500 });
  }
}
```

2. Deploy your changes to Vercel and test the endpoint

### 6. Secure the Connection

For better security:

1. **Use AWS Secrets Manager**:
   - Store your database credentials in AWS Secrets Manager
   - Use AWS Lambda to retrieve credentials (with appropriate IAM roles)

2. **Set Up an API Gateway**:
   - Create a secure API Gateway in front of your database
   - Use API keys and other authentication mechanisms

3. **Implement Connection Pooling**:
   - Set up a connection pooling service like PgBouncer
   - Configure Prisma to use the connection pool

## Terraform Integration

To deploy both the Vercel frontend and AWS backend with Terraform:

1. Create a Terraform configuration for AWS resources:

```hcl
# aws_resources.tf
provider "aws" {
  region = "us-east-1"
}

# RDS PostgreSQL instance
resource "aws_db_instance" "lifenavigator_db" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "13.4"
  instance_class       = "db.t3.micro"
  name                 = "lifenavigator"
  username             = "admin"
  password             = var.db_password
  parameter_group_name = "default.postgres13"
  skip_final_snapshot  = true
  publicly_accessible  = true  # For development; set to false for production
  
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  
  tags = {
    Name = "LifeNavigator Database"
  }
}

# Security group for the database
resource "aws_security_group" "db_sg" {
  name        = "lifenavigator-db-sg"
  description = "Allow database connections from Vercel"
  
  # Vercel IPs would go here
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Replace with Vercel IP ranges in production
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Output the database connection string
output "database_url" {
  value       = "postgresql://${aws_db_instance.lifenavigator_db.username}:${var.db_password}@${aws_db_instance.lifenavigator_db.endpoint}/lifenavigator"
  sensitive   = true
  description = "PostgreSQL connection string"
}
```

2. Use the Vercel Provider for Terraform to manage your Vercel deployments:

```hcl
# vercel.tf
terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team
}

resource "vercel_project" "lifenavigator" {
  name      = "lifenavigator"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "yourusername/lifenavigator"
  }
  
  environment = [
    {
      key    = "DATABASE_URL"
      value  = aws_db_instance.lifenavigator_db.endpoint
      target = ["production", "preview"]
    },
    {
      key    = "NEXTAUTH_URL"
      value  = "https://${vercel_project.lifenavigator.alias}"
      target = ["production"]
    },
    {
      key    = "NEXTAUTH_SECRET"
      value  = var.nextauth_secret
      target = ["production", "preview"]
    }
  ]
}
```

3. Apply your Terraform configuration:

```bash
terraform init
terraform apply
```

## Troubleshooting

If you encounter issues connecting Vercel to AWS PostgreSQL:

1. **Network Connectivity Issues**:
   - Verify your security group rules
   - Check if your database is publicly accessible
   - Try connecting from your local machine to validate credentials

2. **Authentication Problems**:
   - Verify the correct username and password
   - Ensure the database user has appropriate permissions

3. **Prisma-Specific Issues**:
   - Check your schema.prisma file for correct database configuration
   - Ensure Prisma client is generated correctly

4. **SSL Problems**:
   - If your RDS instance requires SSL, update your connection string:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```

## Production Considerations

For production environments:

1. **Implement a VPC**:
   - Place your database in a private subnet
   - Use a VPC peering connection or a bastion host

2. **Set Up Database Replication**:
   - Configure read replicas for enhanced performance
   - Set up disaster recovery mechanisms

3. **Implement Monitoring**:
   - Use AWS CloudWatch to monitor database performance
   - Set up alerts for high CPU, memory usage, or storage issues

4. **Regular Backups**:
   - Enable automated backups in RDS
   - Create a backup strategy with point-in-time recovery