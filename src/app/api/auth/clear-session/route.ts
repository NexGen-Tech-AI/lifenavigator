import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Redirect to login page
  const response = NextResponse.redirect(
    new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  );
  
  return response;
}