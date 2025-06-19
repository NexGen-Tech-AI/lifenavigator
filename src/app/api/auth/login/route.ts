import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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