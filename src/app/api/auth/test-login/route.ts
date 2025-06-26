import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[Test Login] Starting test login for:', email);

    // Log initial cookies
    const cookieStore = await cookies();
    const initialCookies = cookieStore.getAll().filter(c => 
      c.name.includes('auth') || c.name.includes('supabase') || c.name.includes('sb-')
    );
    console.log('[Test Login] Initial auth cookies:', 
      initialCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    );

    // Create Supabase client
    const supabase = await createClient();

    // Check current session before login
    const { data: { session: sessionBefore }, error: sessionBeforeError } = await supabase.auth.getSession();
    console.log('[Test Login] Session before login:', {
      exists: !!sessionBefore,
      error: sessionBeforeError?.message,
      user: sessionBefore?.user?.email
    });

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Test Login] Login error:', error);
      return NextResponse.json(
        { 
          error: error.message,
          phase: 'login'
        },
        { status: 401 }
      );
    }

    console.log('[Test Login] Login successful:', {
      user: data.user?.email,
      sessionExists: !!data.session,
      accessToken: data.session?.access_token ? 'present' : 'missing',
      refreshToken: data.session?.refresh_token ? 'present' : 'missing'
    });

    // Check session after login
    const { data: { session: sessionAfter }, error: sessionAfterError } = await supabase.auth.getSession();
    console.log('[Test Login] Session after login:', {
      exists: !!sessionAfter,
      error: sessionAfterError?.message,
      user: sessionAfter?.user?.email
    });

    // Check user after login
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    console.log('[Test Login] User after login:', {
      exists: !!user,
      error: getUserError?.message,
      email: user?.email
    });

    // Check cookies after login
    const finalCookies = cookieStore.getAll().filter(c => 
      c.name.includes('auth') || c.name.includes('supabase') || c.name.includes('sb-')
    );
    console.log('[Test Login] Final auth cookies:', 
      finalCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    );

    // Create response with explicit cookie headers
    const response = NextResponse.json({
      success: true,
      user: data.user,
      session: {
        exists: !!data.session,
        accessToken: !!data.session?.access_token,
        refreshToken: !!data.session?.refresh_token
      },
      cookies: {
        initial: initialCookies.length,
        final: finalCookies.length
      }
    });

    // Ensure cookies are set in response
    if (data.session) {
      // Get the cookies that Supabase set during login
      const supabaseCookies = cookieStore.getAll().filter(c => 
        c.name.includes('sb-') || c.name.includes('supabase')
      );
      
      // Copy them to the response
      supabaseCookies.forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        });
      });
    }

    return response;
  } catch (error: any) {
    console.error('[Test Login] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        message: error.message,
        phase: 'unexpected'
      },
      { status: 500 }
    );
  }
}