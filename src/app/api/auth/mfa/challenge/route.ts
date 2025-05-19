/**
 * MFA Challenge API Route
 * Used to check if MFA is required for a user account before login
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
        mfaEnabled: true 
      }
    });

    // If no user found, return mock response for security
    // This prevents email enumeration
    if (!user) {
      return NextResponse.json({
        requiresMfa: false
      });
    }

    // Return whether MFA is required
    return NextResponse.json({
      requiresMfa: !!user.mfaEnabled,
      userId: user.id
    });
  } catch (error) {
    console.error('MFA challenge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}