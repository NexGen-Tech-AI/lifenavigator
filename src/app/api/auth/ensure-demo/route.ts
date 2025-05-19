/**
 * API Route to ensure demo account exists
 * This is useful for initial setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Check if demo user exists
    const demoUser = await db.user.findUnique({
      where: { email: 'demo@example.com' },
      select: { id: true, email: true, name: true }
    });

    if (demoUser) {
      return NextResponse.json({
        success: true,
        message: "Demo account already exists",
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name
        }
      });
    }

    // Create demo user if it doesn't exist
    const hashedPassword = await hash('password', 12);
    
    const newDemoUser = await db.user.create({
      data: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
        setupCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo account created successfully",
      user: {
        id: newDemoUser.id,
        email: newDemoUser.email,
        name: newDemoUser.name
      }
    });
  } catch (error: any) {
    console.error("Error ensuring demo account:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to ensure demo account exists",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}