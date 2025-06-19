import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    // Log all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, valueStart: c.value.substring(0, 20) })));
    
    // Get the session using the server client
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        },
        expires_at: session.expires_at
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}