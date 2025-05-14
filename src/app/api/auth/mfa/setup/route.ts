import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/NextAuth';
import { generateMfaSecret, generateQrCode } from '@/lib/auth/mfa';

/**
 * POST /api/auth/mfa/setup
 * Set up MFA for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const email = session.user.email;
    
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }
    
    // Generate a new MFA secret
    const secret = await generateMfaSecret(userId);
    
    // Generate a QR code for the secret
    const qrCode = await generateQrCode(secret, email);
    
    return NextResponse.json({
      secret,
      qrCode,
    });
  } catch (error) {
    console.error('Error setting up MFA:', error);
    return NextResponse.json({ error: 'Failed to set up MFA' }, { status: 500 });
  }
}