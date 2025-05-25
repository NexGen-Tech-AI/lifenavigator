/**
 * Simple JavaScript script to ensure demo account exists
 * Used during Vercel build process
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function initDemoAccount() {
  console.log('🔄 Initializing demo account...');
  
  // Check if we're in production and have database URL
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    console.log('⚠️  No database URL found, skipping demo account initialization');
    return;
  }

  const prisma = new PrismaClient();

  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    // Check if demo user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    });

    if (existingUser) {
      console.log('✅ Demo account already exists');
      return;
    }

    // Create demo account
    const hashedPassword = await bcrypt.hash('password', 12);
    
    await prisma.user.create({
      data: {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        setupCompleted: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Demo account created successfully');
  } catch (error) {
    console.error('❌ Error with demo account:', error.message);
    // Don't fail the build if this fails
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initDemoAccount()
  .then(() => console.log('✅ Demo account initialization complete'))
  .catch(console.error);