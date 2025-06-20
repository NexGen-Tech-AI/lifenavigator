import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { addSecurityHeaders, addCorsHeaders } from '@/lib/middleware/security-headers'
import { createRateLimiter, RATE_LIMITS } from '@/lib/middleware/rate-limit'
import { isDemoMode, createDemoSession, setDemoCookie } from '@/lib/demo/demo-auth'

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

  const path = request.nextUrl.pathname;
  
  // DEMO MODE HANDLING
  if (isDemoMode()) {
    console.log('🎭 Demo mode active');
    
    // Auto-redirect to dashboard for demo mode
    if (path === '/' || path === '/auth/login') {
      const dashboardUrl = new URL('/dashboard', request.url);
      response = NextResponse.redirect(dashboardUrl);
      response = setDemoCookie(response);
      return response;
    }
    
    // Skip auth checks for demo mode
    const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/api/v1');
    if (isProtectedPath) {
      // Set demo session cookie if not present
      if (!request.cookies.get('demo-session')) {
        response = setDemoCookie(response);
      }
      
      // Allow access without auth in demo mode
      console.log('[Demo Mode] Allowing access to:', path);
      
      // Block mutations in demo mode
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const allowedEndpoints = [
          '/api/financial/calculator',
          '/api/financial/retirement-calculator',
          '/api/v1/finance/simulator',
          '/api/calculator',
        ];
        
        const isAllowed = allowedEndpoints.some(endpoint => path.includes(endpoint));
        
        if (!isAllowed) {
          return NextResponse.json(
            { 
              error: 'Demo mode is read-only',
              message: 'This action is not available in demo mode. Sign up for a full account to save changes.',
              isDemoMode: true
            },
            { status: 403 }
          );
        }
      }
      
      // Add demo mode headers
      response.headers.set('x-demo-mode', 'true');
      response.headers.set('x-demo-user-id', 'demo-user-001');
      
      return response;
    }
  }

  // REGULAR AUTH FLOW (non-demo)
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Skip Supabase auth if not configured or using placeholder values
  const isSupabaseConfigured = supabaseUrl && 
    supabaseKey && 
    !supabaseUrl.toLowerCase().includes('your-project') && 
    !supabaseUrl.toLowerCase().includes('your_project') &&
    supabaseKey !== 'YOUR_ANON_KEY'

  if (!isSupabaseConfigured) {
    console.log('⚠️  Supabase not configured, skipping auth middleware')
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

  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[Middleware]', request.nextUrl.pathname, '- User:', user?.email || 'none');

  // Protected routes
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/api/v1')
  
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth')
  const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding')

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    console.log('[Middleware] Redirecting to login - no user for protected path');
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if user needs onboarding
  if (user && !isAuthPath && !isOnboardingPath) {
    // Fetch user profile to check onboarding status
    const { data: profile } = await supabase
      .from('users')
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