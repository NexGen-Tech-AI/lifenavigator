import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    console.log('[Session API] Checking session');
    
    // Log cookies for debugging
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter(c => 
      c.name.includes('auth') || c.name.includes('supabase')
    );
    console.log('[Session API] Auth cookies:', 
      authCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    );

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[Session API] Error getting user:', error);
      return NextResponse.json({ 
        session: null,
        user: null 
      });
    }
    
    if (!user) {
      console.log('[Session API] No user found in session');
      return NextResponse.json({ 
        session: null,
        user: null 
      });
    }

    console.log('[Session API] User found:', user.email);

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Session API] Error fetching profile:', profileError);
    }

    const response = {
      session: {
        user: {
          id: user.id,
          email: user.email,
          ...profile
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      user: {
        id: user.id,
        email: user.email,
        ...profile
      }
    };

    console.log('[Session API] Returning session for:', user.email);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Session API] Unexpected error:', error);
    return NextResponse.json({ 
      session: null,
      user: null 
    });
  }
}