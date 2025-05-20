#!/usr/bin/env node

/**
 * Vercel PostgreSQL Setup Script
 * Run this script to configure your application for Vercel PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for formatting output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Log with colors and formatting
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.cyan);
}

// Main function
async function main() {
  log('\n🔧 Vercel PostgreSQL Setup', colors.bold + colors.magenta);
  log('===========================\n');

  try {
    // Update vercel.json
    updateVercelJson();
    
    // Check prisma schema
    checkPrismaSchema();
    
    // Generate Prisma client
    generatePrismaClient();
    
    // Create helper script for demo account
    createDemoAccountScript();
    
    // Print next steps
    printNextSteps();
  } catch (err) {
    error(`Error running setup: ${err.message}`);
    process.exit(1);
  }
}

// Update vercel.json to use PostgreSQL
function updateVercelJson() {
  log('\n🔍 Updating Vercel configuration...', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  
  if (!fs.existsSync(vercelJsonPath)) {
    error('vercel.json not found!');
    throw new Error('vercel.json not found');
  }
  
  try {
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    
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
    error(`Error updating vercel.json: ${err.message}`);
    throw err;
  }
}

// Check Prisma schema configuration
function checkPrismaSchema() {
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
    error(`Error checking Prisma schema: ${err.message}`);
    throw err;
  }
}

// Generate Prisma client
function generatePrismaClient() {
  log('\n🔍 Generating Prisma client...', colors.bold + colors.blue);
  
  try {
    info('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    success('Generated Prisma client successfully');
  } catch (err) {
    error(`Failed to generate Prisma client: ${err.message}`);
    warning('You may need to generate the Prisma client manually using: npx prisma generate');
  }
}

// Create a helper script for ensuring the demo account exists
function createDemoAccountScript() {
  log('\n🔍 Creating demo account helper script...', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const scriptPath = path.join(rootDir, 'scripts', 'create-demo-account.js');
  
  const scriptContent = `#!/usr/bin/env node

/**
 * Demo Account Creation Script
 * Creates the demo account in the PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

// Create Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking for existing demo account...');
    
    // Check if demo user exists
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    });
    
    if (!demoUser) {
      console.log('Creating demo account in database...');
      
      // Create the demo user with hashed password ('password')
      const hashedPassword = await hash('password', 12);
      
      await prisma.user.create({
        data: {
          id: 'demo-user-id',
          email: 'demo@example.com',
          name: 'Demo User',
          password: hashedPassword,
          setupCompleted: true,
        },
      });
      
      console.log('✅ Demo account created successfully');
    } else {
      console.log('✅ Demo account already exists in database');
    }
  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755'); // Make it executable
  success('Created demo account creation script at scripts/create-demo-account.js');
}

// Print next steps for the user
function printNextSteps() {
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
  log('   vercel --prod run npx prisma migrate deploy', colors.cyan);
  
  log('\n4. Create the demo account:', colors.cyan);
  log('   vercel --prod run node scripts/create-demo-account.js', colors.cyan);
  log('   or visit: https://your-app-url.vercel.app/api/auth/ensure-demo', colors.cyan);
  
  log('\n5. Verify everything works:', colors.cyan);
  log('   - Log in with the demo account (demo@example.com / password)', colors.cyan);
  log('   - Try registering a new account', colors.cyan);
  log('   - Verify data persistence between sessions', colors.cyan);
}

// Run the script
main();