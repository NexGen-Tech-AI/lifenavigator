import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('[Auth Callback] Started processing callback')
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('[Auth Callback] Params:', {
    hasCode: !!code,
    next,
    error,
    error_description
  })

  // Handle errors from OAuth provider
  if (error) {
    console.error('[Auth Callback] OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      
      console.log('[Auth Callback] Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[Auth Callback] Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      console.log('[Auth Callback] Session created:', {
        user: data.session?.user?.email,
        expires: data.session?.expires_at
      })

      // Verify the session was created
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[Auth Callback] User verified:', user?.email)

      // Create response with redirect
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Log cookie state
      const cookieStore = await cookies()
      console.log('[Auth Callback] Cookies after auth:', {
        count: cookieStore.getAll().length,
        names: cookieStore.getAll().map((c: any) => c.name)
      })

      return response
    } catch (error: any) {
      console.error('[Auth Callback] Unexpected error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`)
    }
  }

  console.log('[Auth Callback] No code provided, redirecting to login')
  return NextResponse.redirect(`${origin}/auth/login`)
}