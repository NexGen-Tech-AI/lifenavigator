/**
 * Account Lockout Status API Route
 * Used to check if a user account is currently locked due to too many failed login attempts
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        lockedUntil: true 
      }
    });

    // If no user found, return mock response for security
    // This prevents email enumeration
    if (!user) {
      return NextResponse.json({
        locked: false,
        remainingTime: 0
      });
    }

    // Check if the account is locked
    let locked = false;
    let remainingTime = 0;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      locked = true;
      // Calculate remaining time in seconds
      remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    }

    return NextResponse.json({
      locked,
      remainingTime
    });
  } catch (error) {
    console.error('Lockout status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}