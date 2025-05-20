#!/usr/bin/env node

/**
 * This script helps deploy database migrations to Vercel PostgreSQL.
 * Run with:
 *  node scripts/vercel-db-setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.magenta}
========================================================
          Vercel PostgreSQL Database Setup
========================================================
${colors.reset}`);

// Step 1: Backing up the schema.prisma file
console.log(`${colors.blue}Step 1: Backing up schema.prisma file...${colors.reset}`);
try {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');
  
  if (fs.existsSync(schemaPath)) {
    fs.copyFileSync(schemaPath, backupPath);
    console.log(`${colors.green}✓ Schema file backed up successfully${colors.reset}`);
  } else {
    throw new Error('schema.prisma file not found');
  }
} catch (error) {
  console.error(`${colors.red}Error backing up schema: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 2: Checking environment variables
console.log(`${colors.blue}Step 2: Checking environment variables...${colors.reset}`);
try {
  // Load environment variables from .env files
  const dotenvPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(dotenvPath)) {
    console.log(`${colors.yellow}Using environment variables from .env.local${colors.reset}`);
    require('dotenv').config({ path: dotenvPath });
  } else {
    console.log(`${colors.yellow}No .env.local found, using system environment variables${colors.reset}`);
    require('dotenv').config();
  }

  const requiredVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log(`${colors.green}✓ Required environment variables found${colors.reset}`);
  
  // Extract the connection URL for direct use
  const connectionUrl = process.env.POSTGRES_URL_NON_POOLING;
  console.log(`${colors.yellow}Using database connection: ${connectionUrl.replace(/:[^:]*@/, ':****@')}${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}Error checking environment variables: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 3: Updating schema.prisma with direct connection
console.log(`${colors.blue}Step 3: Temporarily updating schema.prisma for migration...${colors.reset}`);
try {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Update the schema to use direct URL connection for migration
  schemaContent = schemaContent.replace(
    /datasource db {[^}]*}/s,
    `datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL_NON_POOLING")
}`
  );
  
  fs.writeFileSync(schemaPath, schemaContent);
  console.log(`${colors.green}✓ Schema updated successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error updating schema: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 4: Running Prisma migration
console.log(`${colors.blue}Step 4: Running database migrations...${colors.reset}`);
try {
  console.log(`${colors.yellow}Executing prisma migrate deploy...${colors.reset}`);
  
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.POSTGRES_URL_NON_POOLING
    }
  });
  
  console.log(`${colors.green}✓ Database migrations applied successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error running migrations: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 5: Creating demo user
console.log(`${colors.blue}Step 5: Creating demo user account...${colors.reset}`);
try {
  console.log(`${colors.yellow}Executing prisma db seed...${colors.reset}`);
  
  execSync('npx ts-node --compiler-options \'{"module":"CommonJS"}\' scripts/create-demo-user.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.POSTGRES_URL_NON_POOLING
    }
  });
  
  console.log(`${colors.green}✓ Demo user created successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Warning: Error creating demo user: ${error.message}${colors.reset}`);
  console.log(`${colors.yellow}Continuing with setup...${colors.reset}`);
}

// Step 6: Restoring original schema.prisma
console.log(`${colors.blue}Step 6: Restoring original schema.prisma...${colors.reset}`);
try {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');
  
  fs.copyFileSync(backupPath, schemaPath);
  console.log(`${colors.green}✓ Original schema restored successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error restoring schema: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Step 7: Clean up
console.log(`${colors.blue}Step 7: Cleaning up...${colors.reset}`);
try {
  const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');
  fs.unlinkSync(backupPath);
  console.log(`${colors.green}✓ Cleanup completed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Warning: Error during cleanup: ${error.message}${colors.reset}`);
  console.log(`${colors.yellow}This is non-critical and can be ignored${colors.reset}`);
}

// Final success message
console.log(`${colors.magenta}
========================================================
        ✓ Database Setup Completed Successfully
========================================================

Your Vercel PostgreSQL database has been set up with the required 
schema and a demo user account has been created.

You can now deploy your application to Vercel with:
${colors.cyan}
  vercel --prod
${colors.magenta}  
Or visit your Vercel dashboard to set up a deployment.

Login with:
  Email: demo@example.com
  Password: password
${colors.reset}`);