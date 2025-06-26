import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  console.log('[Debug Session] Checking session state...')
  
  try {
    // Get cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Get supabase client
    const supabase = await createClient()
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        supabaseCookies: allCookies.filter(c => c.name.includes('sb-')).map(c => ({
          name: c.name,
          value: c.value ? `${c.value.substring(0, 20)}...` : 'empty'
        }))
      },
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      userError: userError?.message || null,
      session: session ? {
        access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : null,
        refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : null,
        expires_at: session.expires_at,
        user_email: session.user?.email
      } : null,
      sessionError: sessionError?.message || null,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      }
    }
    
    console.log('[Debug Session] Result:', debugInfo)
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error('[Debug Session] Error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}