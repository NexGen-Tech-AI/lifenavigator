import { NextResponse } from 'next/server';

export async function GET() {
  // Clear all auth-related cookies
  const authCookies = [
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
  ];

  const response = NextResponse.redirect(new URL('/auth/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  
  // Delete cookies by setting them with expired dates
  authCookies.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    });
  });

  return response;
}