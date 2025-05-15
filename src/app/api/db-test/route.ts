import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const result = await db.$queryRaw`SELECT 1+1 AS result`;
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      result,
      mockUsers: await db.user.findMany()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to the database",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}