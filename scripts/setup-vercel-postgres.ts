#!/usr/bin/env ts-node

/**
 * Vercel PostgreSQL Setup Script (TypeScript version)
 * Run this script to configure your application for Vercel PostgreSQL
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ANSI color codes for formatting output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Types for configuration files
interface VercelConfig {
  buildCommand?: string;
  framework?: string;
  installCommand?: string;
  outputDirectory?: string;
  ignoreCommand?: string;
  devCommand?: string;
  git?: {
    deploymentEnabled?: {
      [branch: string]: boolean;
    };
  };
  headers?: Array<{
    source: string;
    headers: Array<{
      key: string;
      value: string;
    }>;
  }>;
  env?: {
    [key: string]: string;
  };
  build?: {
    env?: {
      [key: string]: string;
    };
  };
}

// Log with colors and formatting
function log(message: string, color: string = colors.white): void {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string): void {
  log(`✅ ${message}`, colors.green);
}

function error(message: string): void {
  log(`❌ ${message}`, colors.red);
}

function warning(message: string): void {
  log(`⚠️ ${message}`, colors.yellow);
}

function info(message: string): void {
  log(`ℹ️ ${message}`, colors.cyan);
}

// Main function
async function main(): Promise<void> {
  log('\n🔧 Vercel PostgreSQL Setup', colors.bold + colors.magenta);
  log('===========================\n');

  try {
    // Update vercel.json
    updateVercelJson();
    
    // Check prisma schema
    checkPrismaSchema();
    
    // Generate Prisma client
    generatePrismaClient();
    
    // Print next steps
    printNextSteps();
  } catch (err) {
    error(`Error running setup: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// Update vercel.json to use PostgreSQL
function updateVercelJson(): void {
  log('\n🔍 Updating Vercel configuration...', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  
  if (!fs.existsSync(vercelJsonPath)) {
    error('vercel.json not found!');
    throw new Error('vercel.json not found');
  }
  
  try {
    const vercelJson: VercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    
    // Update env section
    if (!vercelJson.env) {
      vercelJson.env = {};
    }
    
    // Set USE_MOCK_DB to false
    vercelJson.env.USE_MOCK_DB = "false";
    
    // Make sure build.env has PostgreSQL variables
    if (!vercelJson.build) {
      vercelJson.build = {};
    }
    
    if (!vercelJson.build.env) {
      vercelJson.build.env = {};
    }
    
    vercelJson.build.env.POSTGRES_PRISMA_URL = "${POSTGRES_PRISMA_URL}";
    vercelJson.build.env.POSTGRES_URL_NON_POOLING = "${POSTGRES_URL_NON_POOLING}";
    
    // Write updated vercel.json
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 2));
    success('Updated vercel.json to use PostgreSQL');
  } catch (err) {
    error(`Error updating vercel.json: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

// Check Prisma schema configuration
function checkPrismaSchema(): void {
  log('\n🔍 Checking Prisma schema configuration...', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    error('prisma/schema.prisma not found!');
    throw new Error('prisma/schema.prisma not found');
  }
  
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Check if it's using the right environment variables
    if (schemaContent.includes('url = env("POSTGRES_PRISMA_URL")')) {
      success('Prisma schema is correctly using POSTGRES_PRISMA_URL');
    } else {
      warning('Prisma schema is not using POSTGRES_PRISMA_URL');
      
      // Update the schema to use Vercel PostgreSQL variables
      const updatedSchema = schemaContent.replace(
        /datasource\s+db\s+{[^}]*}/s,
        `datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}`
      );
      
      fs.writeFileSync(schemaPath, updatedSchema);
      success('Updated schema.prisma to use Vercel PostgreSQL environment variables');
    }
  } catch (err) {
    error(`Error checking Prisma schema: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

// Generate Prisma client
function generatePrismaClient(): void {
  log('\n🔍 Generating Prisma client...', colors.bold + colors.blue);
  
  try {
    info('Running prisma generate...');
    execSync('pnpm prisma generate', { stdio: 'inherit' });
    success('Generated Prisma client successfully');
  } catch (err) {
    error(`Failed to generate Prisma client: ${err instanceof Error ? err.message : String(err)}`);
    warning('You may need to generate the Prisma client manually using: pnpm prisma generate');
  }
}

// Print next steps for the user
function printNextSteps(): void {
  log('\n🏁 Setup complete!', colors.bold + colors.green);
  log('\nNext steps:', colors.bold);
  log('1. Add a PostgreSQL database to your Vercel project:', colors.cyan);
  log('   - Go to your Vercel dashboard > Project > Storage tab', colors.cyan);
  log('   - Click "Connect Database" > "Create New" > "PostgreSQL Database"', colors.cyan);
  log('   - Follow the setup wizard', colors.cyan);
  
  log('\n2. Deploy your application to Vercel:', colors.cyan);
  log('   - Push your changes to your repository', colors.cyan);
  log('   - Vercel will automatically deploy with the new configuration', colors.cyan);
  
  log('\n3. Run database migrations:', colors.cyan);
  log('   vercel --prod run pnpm prisma migrate deploy', colors.cyan);
  
  log('\n4. Seed the database (this will create the demo account and sample data):', colors.cyan);
  log('   vercel --prod run pnpm db:seed', colors.cyan);
  
  log('\n5. Verify everything works:', colors.cyan);
  log('   - Log in with the demo account (demo@example.com / password)', colors.cyan);
  log('   - Try registering a new account', colors.cyan);
  log('   - Verify data persistence between sessions', colors.cyan);
}

// Run the script if executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}