import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;
    
    // Skip logging for static files
    const isStaticFile = path.match(/\.(ico|svg|png|jpg|jpeg|gif|webp|js|css|woff|woff2|ttf|eot)$/);
    if (isStaticFile) {
      return NextResponse.next();
    }
    
    // Debug: Try to get token directly
    const directToken = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log("[MIDDLEWARE] Authenticated request:", {
      path,
      email: token?.email,
      userId: token?.sub,
      directTokenEmail: directToken?.email,
      timestamp: new Date().toISOString()
    });

    // Root redirect - send authenticated users to dashboard
    if (path === '/') {
      console.log("[MIDDLEWARE] Root redirect to dashboard");
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Onboarding flow logic
    if (path.startsWith('/dashboard') && !path.startsWith('/onboarding')) {
      // Check if user needs to complete onboarding
      // You can add custom logic here based on user properties in the token
      if (token?.needsOnboarding) {
        console.log("[MIDDLEWARE] User needs onboarding, redirecting");
        return NextResponse.redirect(new URL('/onboarding/welcome', req.url));
      }
    }

    // Tier-based access control for LifeNavigator features
    if (path.startsWith('/dashboard/premium') && token?.tier !== 'premium' && token?.tier !== 'family') {
      console.log("[MIDDLEWARE] Premium feature access denied");
      return NextResponse.redirect(new URL('/dashboard?upgrade=premium', req.url));
    }

    if (path.startsWith('/dashboard/business') && token?.tier !== 'business') {
      console.log("[MIDDLEWARE] Business feature access denied");
      return NextResponse.redirect(new URL('/dashboard?upgrade=business', req.url));
    }

    // API rate limiting headers for different tiers
    const response = NextResponse.next();
    
    // Add tier information to response headers for API usage
    if (path.startsWith('/api/')) {
      response.headers.set('X-User-Tier', typeof token?.tier === 'string' ? token.tier : 'free');
      response.headers.set('X-User-ID', token?.sub || '');
      
      // Add rate limiting hints based on tier
      const rateLimits = {
        free: '100',
        basic: '500', 
        premium: '2000',
        family: '3000',
        business: '5000'
      };
      
      response.headers.set('X-Rate-Limit', rateLimits[token?.tier as keyof typeof rateLimits] || '100');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Skip authorization check for static files
        const isStaticFile = path.match(/\.(ico|svg|png|jpg|jpeg|gif|webp|js|css|woff|woff2|ttf|eot)$/);
        if (isStaticFile) {
          return true;
        }
        
        console.log("[MIDDLEWARE] Authorization check:", {
          path,
          hasToken: !!token,
          email: token?.email
        });

        // Public auth pages - allow access regardless of auth status
        const publicAuthPaths = [
          '/auth/login',
          '/auth/register', 
          '/auth/forgot-password',
          '/auth/verify-email',
          '/auth/error'
        ];

        if (publicAuthPaths.some(p => path.startsWith(p))) {
          return true;
        }

        // Protected application routes - require authentication
        const protectedPaths = [
          '/dashboard',
          '/onboarding',
          '/profile',
          '/settings',
          '/documents',
          '/calculators'
        ];

        if (protectedPaths.some(p => path.startsWith(p))) {
          return !!token;
        }

        // Protected API routes - require authentication
        const protectedApiPaths = [
          '/api/user',
          '/api/dashboard',
          '/api/documents',
          '/api/calculations',
          '/api/integrations',
          '/api/health',
          '/api/financial'
        ];

        if (protectedApiPaths.some(p => path.startsWith(p))) {
          return !!token;
        }

        // Special handling for root path - redirect to appropriate page
        if (path === '/') {
          // This will be handled in the middleware function above
          return !!token;
        }

        // Allow access to all other paths (public pages, static assets, etc.)
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - public (public assets)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};