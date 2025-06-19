import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    const cookieStore = await cookies();
    
    // Look for Supabase auth cookies
    const supabaseCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.startsWith('sb-') || cookie.name.includes('supabase')
    );
    
    return NextResponse.json({
      user: user || null,
      authError: error?.message || null,
      hasCookies: supabaseCookies.length > 0,
      cookieNames: supabaseCookies.map(c => c.name),
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}