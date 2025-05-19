/**
 * API Route to test database connection
 * This is useful for debugging database issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Basic environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      useMockDb: process.env.USE_MOCK_DB,
      databaseUrl: process.env.DATABASE_URL ? "[defined]" : "[undefined]",
      postgresPrismaUrl: process.env.POSTGRES_PRISMA_URL ? "[defined]" : "[undefined]",
      postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING ? "[defined]" : "[undefined]",
    };

    // Test database connection
    let dbConnectivity = { success: false, message: "Not tested", result: null };
    
    try {
      const result = await db.$queryRaw`SELECT 1+1 as result`;
      dbConnectivity = { 
        success: true, 
        message: "Database connection successful", 
        result 
      };
    } catch (error: any) {
      dbConnectivity = { 
        success: false, 
        message: error.message || "Database connection failed", 
        result: null 
      };
    }

    // Try to check if we're using mock DB
    const isMockDb = !('$connect' in db);
    
    // Try to find demo user
    let demoUser = { exists: false, email: null };
    try {
      const result = await db.user.findUnique({
        where: { email: 'demo@example.com' },
        select: { 
          id: true, 
          email: true, 
          setupCompleted: true 
        }
      });
      
      demoUser = {
        exists: !!result,
        email: result?.email || null
      };
    } catch (error: any) {
      console.error("Error checking for demo user:", error);
    }

    // Try to get user count
    let userCount = 0;
    try {
      userCount = await db.user.count();
    } catch (error: any) {
      console.error("Error getting user count:", error);
    }

    // Try to get all users (limited to 10)
    let users = [];
    try {
      users = await db.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          setupCompleted: true
        }
      });
    } catch (error: any) {
      console.error("Error getting users:", error);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: {
        type: isMockDb ? "Mock Database" : "PostgreSQL/Prisma",
        connectivity: dbConnectivity,
        demoUser,
        userCount,
        users
      }
    });
  } catch (error: any) {
    console.error("API error:", error);
    
    return NextResponse.json({
      error: error.message || "An unexpected error occurred",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}