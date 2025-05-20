#!/usr/bin/env ts-node

/**
 * Demo Account Creation Script (TypeScript version)
 * Creates the demo account in the PostgreSQL database
 * 
 * This script uses TypeScript for better type safety and integrates with Prisma
 * to ensure the demo account exists in the database.
 */

import { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcryptjs';

// Create Prisma client with logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface DemoUserData {
  id: string;
  email: string;
  name: string;
  password: string;
  setupCompleted: boolean;
}

/**
 * Ensures the demo account exists in the database
 */
async function ensureDemoAccount(): Promise<User | null> {
  try {
    console.log('Checking for existing demo account...');
    
    // Demo account data
    const demoData: DemoUserData = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      password: await hash('password', 12),
      setupCompleted: true,
    };
    
    // Check if demo user exists
    const demoUser = await prisma.user.findUnique({
      where: { email: demoData.email },
    });
    
    if (!demoUser) {
      console.log('Creating demo account in database...');
      
      // Create the demo user with upsert to prevent race conditions
      const createdUser = await prisma.user.upsert({
        where: { email: demoData.email },
        update: {
          name: demoData.name,
          setupCompleted: demoData.setupCompleted,
        },
        create: {
          id: demoData.id,
          email: demoData.email,
          name: demoData.name,
          password: demoData.password,
          setupCompleted: demoData.setupCompleted,
        },
      });
      
      console.log('✅ Demo account created successfully');
      return createdUser;
    } else {
      console.log('✅ Demo account already exists in database');
      return demoUser;
    }
  } catch (error) {
    console.error('❌ Error ensuring demo account:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if executed directly
if (require.main === module) {
  ensureDemoAccount()
    .then((user) => {
      if (user) {
        console.log(`User created/found with ID: ${user.id}`);
        process.exit(0);
      } else {
        console.error('Failed to ensure demo user');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

// Export for use in other scripts
export { ensureDemoAccount };