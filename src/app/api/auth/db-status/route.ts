/**
 * API Route to check database status
 * Useful for troubleshooting connection issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const result = await db.$queryRaw`SELECT 1+1 as result`;
    
    // Check if we're using the mock database or real Prisma
    const isMockDb = !('$connect' in db);
    
    // Try to find the demo user
    let demoUser;
    try {
      demoUser = await db.user.findUnique({
        where: { email: 'demo@example.com' },
      });
    } catch (error) {
      console.error('Error checking for demo user:', error);
    }
    
    return NextResponse.json({
      status: 'connected',
      type: isMockDb ? 'mock' : 'prisma',
      demoUserExists: !!demoUser,
      result
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown database error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}