import { NextRequest, NextResponse } from 'next/server';
import { isMfaEnabled } from '@/lib/auth/mfa';
import { prisma } from '@/lib/db';

/**
 * POST /api/auth/mfa/challenge
 * Check if MFA is needed for a user during login
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Return false for security - don't reveal if email exists
      return NextResponse.json({ requiresMfa: false });
    }
    
    // Check if MFA is enabled for the user
    const mfaEnabled = await isMfaEnabled(user.id);
    
    return NextResponse.json({
      requiresMfa: mfaEnabled,
      userId: mfaEnabled ? user.id : undefined
    });
  } catch (error) {
    console.error('Error checking MFA challenge:', error);
    return NextResponse.json({ error: 'Failed to check MFA status' }, { status: 500 });
  }
}