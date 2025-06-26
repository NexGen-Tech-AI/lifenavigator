import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[Auth API] Login attempt for:', email);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth API] Login error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.log('[Auth API] Login successful for:', data.user?.email);
    console.log('[Auth API] Session details:', {
      sessionExists: !!data.session,
      accessToken: data.session?.access_token ? 'present' : 'missing',
      refreshToken: data.session?.refresh_token ? 'present' : 'missing',
      expiresAt: data.session?.expires_at,
    });

    // Verify the session was set by checking the user
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError) {
      console.error('[Auth API] Error verifying user after login:', getUserError);
    } else {
      console.log('[Auth API] User verified after login:', user?.email);
    }

    // Check if auth cookies were set
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter(c => 
      c.name.includes('auth') || c.name.includes('supabase')
    );
    console.log('[Auth API] Auth cookies after login:', 
      authCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    );

    // Return success - cookies are automatically handled by Supabase
    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error: any) {
    console.error('[Auth API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}