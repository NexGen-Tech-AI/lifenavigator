import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/auth/csrf';

/**
 * GET /api/auth/csrf
 * Generate a new CSRF token
 */
export async function GET() {
  // Generate a new CSRF token
  const csrfToken = await generateCsrfToken();
  
  return NextResponse.json({ csrfToken });
}