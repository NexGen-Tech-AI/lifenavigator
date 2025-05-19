#!/usr/bin/env node

/**
 * Auth System Repair Tool
 * This script fixes common auth issues in the LifeNavigator app
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
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

// Print styled log messages
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

// Run a command and return its output
function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}

// Check and update environment configuration
async function fixEnvironmentConfig() {
  log('\n🔧 Checking Environment Configuration', colors.bold + colors.blue);
  
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const envLocalPath = path.join(rootDir, '.env.local');
  
  // Create .env.local if it doesn't exist
  if (!fs.existsSync(envLocalPath)) {
    info('Creating .env.local file...');
    
    const envContent = `# Database Configuration
# Force using mock database for development
USE_MOCK_DB="true"

# NextAuth configuration
NEXTAUTH_SECRET="use-this-secret-for-local-development-only"
NEXTAUTH_URL="http://localhost:3000"

# Development settings
NODE_ENV="development"
LOG_LEVEL="debug"
`;
    
    fs.writeFileSync(envLocalPath, envContent);
    success('Created .env.local with mock database configuration');
  } else {
    info('.env.local already exists');
    
    // Check if USE_MOCK_DB is set
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    if (!envContent.includes('USE_MOCK_DB')) {
      const answer = await confirm('Add USE_MOCK_DB=true to .env.local?');
      if (answer) {
        fs.appendFileSync(envLocalPath, '\n# Force using mock database\nUSE_MOCK_DB="true"\n');
        success('Added USE_MOCK_DB=true to .env.local');
      }
    } else {
      success('USE_MOCK_DB is already configured in .env.local');
    }
  }
}

// Fix Prisma database setup
async function fixPrismaSetup() {
  log('\n🔧 Checking Prisma Setup', colors.bold + colors.blue);
  
  try {
    // Check if Prisma client is generated
    info('Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);
    success('Prisma client generated successfully');
  } catch (err) {
    error(`Failed to generate Prisma client: ${err.message}`);
    warning('You may need to manually fix the Prisma configuration');
  }
}

// Try to create demo account via API
async function ensureDemoAccount() {
  log('\n🔧 Ensuring Demo Account Exists', colors.bold + colors.blue);
  
  try {
    info('Starting development server to create demo account...');
    
    // Start dev server in the background
    const server = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore',
      detached: true
    });
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    info('Calling API to ensure demo account exists...');
    
    // Make a request to the demo account creation endpoint
    const response = await fetch('http://localhost:3000/api/auth/ensure-demo');
    const data = await response.json();
    
    if (data.success) {
      success(`Demo account setup: ${data.message}`);
    } else {
      warning(`Demo account setup failed: ${data.error}`);
    }
    
    // Kill the server process and all children
    process.kill(-server.pid, 'SIGINT');
  } catch (err) {
    error(`Failed to ensure demo account: ${err.message}`);
    info('You can manually create the demo account by starting the server and visiting /api/auth/ensure-demo');
  }
}

// Main function
async function main() {
  log('\n🔧 Auth System Repair Tool', colors.bold + colors.magenta);
  log('========================\n');
  
  try {
    // Step 1: Fix environment configuration
    await fixEnvironmentConfig();
    
    // Step 2: Fix Prisma setup
    await fixPrismaSetup();
    
    // Step 3: Create demo account
    const runDemoSetup = await confirm('Would you like to ensure the demo account exists?');
    if (runDemoSetup) {
      await ensureDemoAccount();
    }
    
    log('\n🏁 Auth system repair complete!', colors.bold + colors.green);
    log('You should now be able to use the demo account (email: demo@example.com, password: password)', colors.cyan);
    log('For regular user accounts, register a new account and then log in with those credentials', colors.cyan);
  } catch (err) {
    error(`Error running repair tool: ${err.message}`);
  } finally {
    rl.close();
  }
}

// Run the tool
main();