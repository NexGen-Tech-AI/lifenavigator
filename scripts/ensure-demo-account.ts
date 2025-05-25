/**
 * Script to ensure the demo account exists in the database
 * Can be run locally or as part of the build process
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

async function ensureDemoAccount() {
  console.log('🔄 Checking for demo account...');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('✅ Database connection successful');

    // Check if demo user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    });

    if (existingUser) {
      console.log('✅ Demo account already exists');
      return;
    }

    // Create demo account
    console.log('📝 Creating demo account...');
    const hashedPassword = await hash('password', 12);
    
    const demoUser = await prisma.user.create({
      data: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        setupCompleted: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Demo account created successfully:', demoUser.email);
  } catch (error) {
    console.error('❌ Error ensuring demo account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureDemoAccount()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });