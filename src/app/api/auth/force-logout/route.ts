import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Get all cookies
  const cookieStore = cookies();
  
  // Clear all cookies by setting them to expire
  const allCookies = cookieStore.getAll();
  
  const response = NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  
  // Clear each cookie
  allCookies.forEach(cookie => {
    response.cookies.set(cookie.name, '', {
      expires: new Date(0),
      path: '/',
    });
  });
  
  // Specifically clear Supabase cookies
  const supabaseCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase-auth-token',
  ];
  
  supabaseCookies.forEach(name => {
    response.cookies.set(name, '', {
      expires: new Date(0),
      path: '/',
    });
  });
  
  // Clear cookies with project ID
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1];
  if (projectId) {
    response.cookies.set(`sb-${projectId}-auth-token`, '', {
      expires: new Date(0),
      path: '/',
    });
    response.cookies.set(`sb-${projectId}-auth-token.0`, '', {
      expires: new Date(0),
      path: '/',
    });
    response.cookies.set(`sb-${projectId}-auth-token.1`, '', {
      expires: new Date(0),
      path: '/',
    });
  }
  
  return response;
}