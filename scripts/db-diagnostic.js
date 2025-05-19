#!/usr/bin/env node

/**
 * Database Diagnostic Tool
 * Run this script to check database connection and setup
 */

const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

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

// Log with colors and formatting
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Log success message
function success(message) {
  log(`✅ ${message}`, colors.green);
}

// Log error message
function error(message) {
  log(`❌ ${message}`, colors.red);
}

// Log warning message
function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Log info message
function info(message) {
  log(`ℹ️ ${message}`, colors.cyan);
}

// Check if env file exists
function checkEnvFiles() {
  log('\n📄 Environment Files', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production'
  ];
  
  let foundFiles = 0;
  
  envFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      foundFiles++;
      success(`Found ${file}`);
      
      // Check if DB vars are set in the file
      const content = fs.readFileSync(filePath, 'utf8');
      const hasDbVars = content.includes('DATABASE_URL') || 
                        content.includes('POSTGRES_PRISMA_URL');
      
      if (hasDbVars) {
        info(`  Contains database configuration variables`);
      }
    } else {
      info(`${file} not found`);
    }
  });
  
  if (foundFiles === 0) {
    error('No environment files found! You need at least one to configure the database.');
  }
}

// Check database connection
async function checkDatabaseConnection() {
  log('\n🔌 Database Connection Test', colors.bold + colors.blue);
  
  // Check env vars first
  const dbUrl = process.env.DATABASE_URL;
  const pgPrismaUrl = process.env.POSTGRES_PRISMA_URL;
  const pgDirectUrl = process.env.POSTGRES_URL_NON_POOLING;
  const useMockDb = process.env.USE_MOCK_DB === 'true';
  
  info(`DATABASE_URL: ${dbUrl ? 'Set' : 'Not set'}`);
  info(`POSTGRES_PRISMA_URL: ${pgPrismaUrl ? 'Set' : 'Not set'}`);
  info(`POSTGRES_URL_NON_POOLING: ${pgDirectUrl ? 'Set' : 'Not set'}`);
  info(`USE_MOCK_DB: ${useMockDb ? 'true' : 'false'}`);
  
  if (useMockDb) {
    success('Mock database is enabled, will use in-memory database');
    return;
  }
  
  if (!dbUrl && !pgPrismaUrl) {
    error('No database URL configured! Set DATABASE_URL or POSTGRES_PRISMA_URL.');
    warning('Setting USE_MOCK_DB=true in .env will enable the mock database for development');
    return;
  }
  
  try {
    // Try to connect to the database
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Run a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    success(`Connected to the database successfully! Query result: ${JSON.stringify(result)}`);
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      success(`User table exists with ${userCount} users`);
      
      // Check for demo user
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      });
      
      if (demoUser) {
        success('Demo user exists in the database');
      } else {
        warning('Demo user does not exist in the database');
        info('You may want to create a demo user with email "demo@example.com" and password "password"');
      }
    } catch (tableError) {
      error(`Error checking tables: ${tableError.message}`);
      warning('Tables may not exist yet. Have you run migrations?');
    }
    
    await prisma.$disconnect();
  } catch (dbError) {
    error(`Failed to connect to the database: ${dbError.message}`);
    
    if (dbError.message.includes('connect ECONNREFUSED')) {
      warning('Database server appears to be offline or unreachable');
      info('Make sure your PostgreSQL server is running and accessible');
    } else if (dbError.message.includes('database') && dbError.message.includes('does not exist')) {
      warning('The database specified in the connection URL does not exist');
      info('You may need to create it manually or check the URL');
    } else if (dbError.message.includes('authentication')) {
      warning('Authentication failed. Check username and password in connection URL');
    }
    
    info('Consider using mock database for development with USE_MOCK_DB=true');
  }
}

// Check Prisma setup
async function checkPrismaSetup() {
  log('\n🔧 Prisma Setup', colors.bold + colors.blue);
  
  // Check if schema.prisma exists
  const rootDir = path.resolve(__dirname, '..');
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    error('prisma/schema.prisma not found!');
    return;
  }
  
  success('Found prisma/schema.prisma');
  
  // Check schema.prisma content
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const provider = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
  
  if (provider && provider[1]) {
    info(`Database provider: ${provider[1]}`);
    
    if (provider[1] === 'postgresql' && !process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      warning('Using PostgreSQL provider but no PostgreSQL connection URL is set');
    }
  }
  
  // Check Prisma client generation
  try {
    const { stdout, stderr } = await execPromise('npx prisma -v');
    success(`Prisma CLI is installed: ${stdout.trim()}`);
    
    // Check if Prisma client is generated
    const nodeModulesPath = path.join(rootDir, 'node_modules', '.prisma', 'client');
    if (fs.existsSync(nodeModulesPath)) {
      success('Prisma Client is generated');
    } else {
      warning('Prisma Client does not appear to be generated');
      info('Run "npx prisma generate" to generate the client');
    }
  } catch (cmdError) {
    error(`Error checking Prisma: ${cmdError.message}`);
  }
}

// Main function
async function main() {
  log('\n🔍 Running Database Diagnostic Tool', colors.bold + colors.magenta);
  log('===============================\n');
  
  try {
    // Check environment files
    checkEnvFiles();
    
    // Check Prisma setup
    await checkPrismaSetup();
    
    // Check database connection
    await checkDatabaseConnection();
    
    log('\n🏁 Diagnostic complete!', colors.bold + colors.green);
  } catch (error) {
    console.error('Error running diagnostics:', error);
  }
}

// Run the diagnostic
main();