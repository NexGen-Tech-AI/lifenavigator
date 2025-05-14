import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { disableMfa, verifyToken } from '@/lib/auth/mfa';

/**
 * POST /api/auth/mfa/disable
 * Disable MFA for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    // Verify the token
    const isValid = await verifyToken(userId, token);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
    
    // Disable MFA for the user
    await disableMfa(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return NextResponse.json({ error: 'Failed to disable MFA' }, { status: 500 });
  }
}