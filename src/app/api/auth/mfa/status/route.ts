import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { isMfaEnabled, getRecoveryCodes } from '@/lib/auth/mfa';

/**
 * GET /api/auth/mfa/status
 * Get the MFA status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if MFA is enabled
    const enabled = await isMfaEnabled(userId);
    
    // Get recovery codes if MFA is enabled
    const recoveryCodes = enabled ? await getRecoveryCodes(userId) : [];
    
    return NextResponse.json({
      enabled,
      recoveryCodes,
    });
  } catch (error) {
    console.error('Error getting MFA status:', error);
    return NextResponse.json({ error: 'Failed to get MFA status' }, { status: 500 });
  }
}