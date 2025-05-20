#!/usr/bin/env node

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