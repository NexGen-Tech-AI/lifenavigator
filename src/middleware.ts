import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { addSecurityHeaders, addCorsHeaders } from '@/lib/middleware/security-headers'
import { createRateLimiter, RATE_LIMITS } from '@/lib/middleware/rate-limit'
import { supabaseConfig, isSupabaseConfigured as checkSupabaseConfig } from '@/config/supabase'

// Create rate limiters for different endpoints
const authRateLimiter = createRateLimiter(RATE_LIMITS.auth);
const apiRateLimiter = createRateLimiter(RATE_LIMITS.api);
const uploadRateLimiter = createRateLimiter(RATE_LIMITS.upload);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Allow test pages without auth
  const testPaths = ['/auth-test', '/simple-dashboard', '/test-auth', '/api/auth/setup-demo'];
  if (testPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    console.log('[Middleware] Allowing test path:', request.nextUrl.pathname);
    return response;
  }
  
  // Check if we're in demo mode - look for demo subdomain or query param
  const url = new URL(request.url);
  const isDemoSubdomain = url.hostname.includes('demo') || url.hostname.includes('mrxm1q5s5');
  const hasDemoParam = url.searchParams.get('demo') === 'true';
  const isDemoMode = isDemoSubdomain || hasDemoParam || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  console.log('[Middleware] Demo mode check:', {
    isDemoMode,
    isDemoSubdomain,
    hasDemoParam,
    hostname: url.hostname,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE
  })

  // In demo mode, bypass all authentication
  if (isDemoMode) {
    console.log('[Middleware] Demo mode active - bypassing auth')
    
    // Redirect root to dashboard directly
    if (request.nextUrl.pathname === '/') {
      console.log('[Middleware] Redirecting root to dashboard in demo mode')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Skip auth pages in demo mode
    if (request.nextUrl.pathname.startsWith('/auth')) {
      console.log('[Middleware] Redirecting auth page to dashboard in demo mode')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Allow all other routes
    return response
  }

  // Check if Supabase is properly configured
  const supabaseUrl = supabaseConfig.url
  const supabaseKey = supabaseConfig.anonKey
  
  // Skip Supabase auth if not configured or using placeholder values
  const isSupabaseConfigured = checkSupabaseConfig() && 
    !supabaseUrl.toLowerCase().includes('your_project') &&
    supabaseKey !== 'YOUR_ANON_KEY'

  if (!isSupabaseConfigured) {
    console.log('⚠️  Supabase not configured, skipping auth middleware')
    console.log('URL:', supabaseUrl ? 'Set' : 'Not set')
    console.log('Key:', supabaseKey ? 'Set' : 'Not set')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Apply rate limiting based on path
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) {
    const { allowed, response: limitResponse } = await authRateLimiter(request, response);
    if (!allowed && limitResponse) {
      return limitResponse;
    }
  } else if (path.startsWith('/api/v1/documents/upload')) {
    const { allowed, response: limitResponse } = await uploadRateLimiter(request, response);
    if (!allowed && limitResponse) {
      return limitResponse;
    }
  } else if (path.startsWith('/api/')) {
    const { allowed, response: limitResponse } = await apiRateLimiter(request, response);
    if (!allowed && limitResponse) {
      return limitResponse;
    }
  }

  // Log auth-related cookies before checking user
  const authCookies = request.cookies.getAll().filter(c => 
    c.name.includes('auth') || c.name.includes('supabase') || c.name.includes('sb-')
  );
  console.log('[Middleware] Auth cookies before getUser:', 
    authCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.log('[Middleware] Error getting user:', userError.message);
  }
  
  console.log('[Middleware]', request.nextUrl.pathname, '- User:', user?.email || 'none');

  // Protected routes
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/api/v1')
  
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth')
  const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding')
  const isRootPath = request.nextUrl.pathname === '/'
  const isTestPath = request.nextUrl.pathname.startsWith('/test')
  const isDemoPath = request.nextUrl.pathname.startsWith('/demo')
  const isPublicPath = request.nextUrl.pathname === '/privacy' || 
                       request.nextUrl.pathname === '/terms' ||
                       request.nextUrl.pathname === '/landing' ||
                       request.nextUrl.pathname.includes('/minimal') ||
                       request.nextUrl.pathname.includes('/working-login') ||
                       request.nextUrl.pathname.includes('/bare') ||
                       request.nextUrl.pathname === '/dashboard-demo'

  // Redirect root path to login if not authenticated
  if (isRootPath && !user) {
    console.log('[Middleware] Redirecting root to login - no user');
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    console.log('[Middleware] Redirecting to login - no user for protected path');
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Skip auth checks for test, demo, and public pages
  if (isTestPath || isDemoPath || isPublicPath) {
    return response
  }

  // Check if user needs onboarding
  if (user && !isAuthPath && !isOnboardingPath && !isTestPath) {
    // Fetch user profile to check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()
    
    if (profile && !profile.onboarding_completed && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && user && !request.nextUrl.pathname.includes('logout')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Skip security headers in development for debugging
  if (process.env.NODE_ENV === 'production') {
    // Add security headers to all responses
    response = addSecurityHeaders(request, response);
    
    // Add CORS headers for API routes
    if (path.startsWith('/api/')) {
      const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL!];
      response = addCorsHeaders(request, response, allowedOrigins);
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}