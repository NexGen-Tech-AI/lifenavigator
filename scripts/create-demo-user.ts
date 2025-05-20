import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Simple hash function to replace bcrypt for this demo
function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + 'demo-salt-for-testing-only')
    .digest('hex');
}

async function main() {
  try {
    // Create the demo user
    const hashedPassword = hashPassword('password');
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {
        name: 'Demo User',
        password: hashedPassword,
        setupCompleted: true,
      },
      create: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        setupCompleted: true,
      }
    });

    console.log(`Created demo user with ID: ${user.id}`);
    console.log('Login with:');
    console.log('Email: demo@example.com');
    console.log('Password: password');

    // Create a session for the user
    const expires = new Date();
    expires.setHours(expires.getHours() + 8); // 8 hour expiry
    
    const session = await prisma.session.create({
      data: {
        sessionToken: `demo-session-${Date.now()}`,
        userId: user.id,
        expires,
      }
    });

    console.log(`Created session with ID: ${session.id}`);
    console.log('Database setup complete!');

  } catch (error) {
    console.error('Error creating demo account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });