#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script
 * Run this script before deploying to Vercel to ensure your environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

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

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Check if vercel.json has USE_MOCK_DB set to true
function checkVercelConfig() {
  log('\n🔍 Checking Vercel configuration', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const vercelConfigPath = path.join(rootDir, 'vercel.json');
  
  if (!fs.existsSync(vercelConfigPath)) {
    error('vercel.json not found! Creating a new one...');
    
    const defaultConfig = {
      "version": 2,
      "buildCommand": "npm run build",
      "installCommand": "npm install",
      "framework": "nextjs",
      "env": {
        "USE_MOCK_DB": "true",
        "NEXTAUTH_URL": "https://${VERCEL_URL}",
        "NEXTAUTH_SECRET": "your-secret-key-for-vercel-deployment"
      }
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(defaultConfig, null, 2));
    success('Created vercel.json with USE_MOCK_DB=true');
    return;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    if (!config.env) {
      error('No env section in vercel.json!');
      config.env = {};
    }
    
    if (config.env.USE_MOCK_DB !== 'true') {
      warning('USE_MOCK_DB is not set to true in vercel.json');
      const setMockDb = true; // Auto-fix for script
      
      if (setMockDb) {
        config.env.USE_MOCK_DB = 'true';
        fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
        success('Updated vercel.json to use mock database');
      }
    } else {
      success('vercel.json is already configured to use mock database');
    }
  } catch (err) {
    error(`Error parsing vercel.json: ${err.message}`);
  }
}

// Check Prisma schema configuration
async function checkPrismaSchema() {
  log('\n🔍 Checking Prisma schema configuration', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    error('prisma/schema.prisma not found!');
    return;
  }
  
  // Read schema content
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Check if it's using the right environment variables
  if (schemaContent.includes('url = env("POSTGRES_PRISMA_URL")')) {
    success('Prisma schema is using POSTGRES_PRISMA_URL');
  } else {
    warning('Prisma schema is not using POSTGRES_PRISMA_URL');
    
    // Offer to update to the Vercel Postgres configuration
    const shouldUpdate = true; // Auto-fix for script
    
    if (shouldUpdate) {
      const updatedSchema = schemaContent.replace(
        /url\s*=\s*env\([^)]+\)/,
        'url = env("POSTGRES_PRISMA_URL") // uses connection pooling'
      );
      
      fs.writeFileSync(schemaPath, updatedSchema);
      success('Updated schema.prisma to use POSTGRES_PRISMA_URL');
    }
  }
}

// Generate Prisma client
async function generatePrismaClient() {
  log('\n🔍 Generating Prisma client', colors.bold + colors.blue);
  
  try {
    info('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    success('Generated Prisma client successfully');
  } catch (err) {
    error(`Failed to generate Prisma client: ${err.message}`);
  }
}

// Check and update environment variables
async function checkEnvVariables() {
  log('\n🔍 Checking environment variables', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const envLocalPath = path.join(rootDir, '.env.local');
  
  // Check if .env exists
  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    warning('No .env or .env.local file found');
    
    // Create a basic .env file
    const basicEnv = `
# Database Configuration
USE_MOCK_DB="true"

# NextAuth configuration
NEXTAUTH_SECRET="your-development-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Development settings
NODE_ENV="development"
`;
    
    fs.writeFileSync(envLocalPath, basicEnv);
    success('Created .env.local with basic configuration');
  } else {
    success('Environment files exist');
    
    // Check if USE_MOCK_DB is set in any of the env files
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent += fs.readFileSync(envPath, 'utf8');
    }
    if (fs.existsSync(envLocalPath)) {
      envContent += fs.readFileSync(envLocalPath, 'utf8');
    }
    
    if (!envContent.includes('USE_MOCK_DB')) {
      warning('USE_MOCK_DB is not set in environment files');
      
      // Add USE_MOCK_DB to .env.local
      fs.appendFileSync(envLocalPath, '\nUSE_MOCK_DB="true"\n');
      success('Added USE_MOCK_DB=true to .env.local');
    } else {
      success('USE_MOCK_DB is configured in environment files');
    }
  }
}

// Main function
async function main() {
  log('\n🔧 Vercel Deployment Setup', colors.bold + colors.magenta);
  log('===========================\n');
  
  try {
    // Check and update vercel.json
    await checkVercelConfig();
    
    // Check and update Prisma schema
    await checkPrismaSchema();
    
    // Check environment variables
    await checkEnvVariables();
    
    // Generate Prisma client
    await generatePrismaClient();
    
    log('\n🏁 Vercel setup complete!', colors.bold + colors.green);
    log('\nNext steps:', colors.bold);
    log('1. Deploy your application to Vercel', colors.cyan);
    log('2. Set up environment variables in Vercel dashboard', colors.cyan);
    log('3. Verify mock database is working correctly', colors.cyan);
    log('4. For production, set up a real PostgreSQL database and update the environment variables', colors.cyan);
  } catch (err) {
    error(`Error running Vercel setup: ${err.message}`);
  } finally {
    rl.close();
  }
}

// Run the setup
main();