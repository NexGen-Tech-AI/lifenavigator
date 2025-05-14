import { NextRequest, NextResponse } from 'next/server';
import { isAccountLocked, getLockoutTimeRemaining } from '@/lib/auth/lockout';

/**
 * POST /api/auth/lockout-status
 * Check if an account is locked and return remaining lockout time
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if account is locked
    const locked = await isAccountLocked(email);
    
    // Get remaining lockout time
    const remainingTime = await getLockoutTimeRemaining(email);
    
    return NextResponse.json({
      locked,
      remainingTime,
    });
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return NextResponse.json({ error: 'Failed to check lockout status' }, { status: 500 });
  }
}