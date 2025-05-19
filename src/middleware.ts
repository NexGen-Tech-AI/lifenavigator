import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiGateways } from '@/lib/middleware/api-gateway';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Apply rate limiting based on path pattern
  let rateLimitHandler;
  
  if (path.startsWith('/api/')) {
    // Determine which rate limiter to use based on the API path
    
    // Authentication and user operations
    if (path.startsWith('/api/auth/register')) {
      rateLimitHandler = apiGateways.register;
    } else if (path.startsWith('/api/auth/mfa') || path.includes('/password')) {
      rateLimitHandler = apiGateways.passwordOps;
    } else if (path.startsWith('/api/auth')) {
      rateLimitHandler = apiGateways.auth;
    } else if (path.includes('/user/delete') || path.includes('/user/export')) {
      rateLimitHandler = apiGateways.userAccountOps;
    }
    
    // Document operations
    else if (path.includes('/documents/upload') || path.includes('/documents/download') || path.includes('/documents/share')) {
      rateLimitHandler = apiGateways.documentOps;
    }
    
    // OAuth and token operations
    else if (path.includes('/oauth') || path.includes('/token')) {
      rateLimitHandler = apiGateways.oauth;
    }
    
    // Admin and internal operations
    else if (path.startsWith('/api/admin')) {
      rateLimitHandler = apiGateways.admin;
    } else if (path.startsWith('/api/internal')) {
      rateLimitHandler = apiGateways.internal;
    }
    
    // Default API rate limiter for other endpoints
    else {
      rateLimitHandler = apiGateways.standard;
    }
    
    // Apply rate limiting for API routes
    return rateLimitHandler(async () => handleNormalRequest(request))(request);
  }
  
  // For non-API routes, just use the normal request handler
  return handleNormalRequest(request);
}

/**
 * Handle normal request processing after rate limiting
 */
async function handleNormalRequest(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Root path handling - always redirect to login page
  if (path === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Define protected routes (routes that require authentication)
  const isProtectedRoute = path.startsWith('/dashboard') ||
                         path.startsWith('/onboarding') ||
                         (path.startsWith('/api/') &&
                         !path.startsWith('/api/auth'));
  
  // Define public routes (routes that should be accessible without auth)
  const isPublicRoute = path.startsWith('/auth/') || 
                       path.startsWith('/api/auth') || 
                       path.includes('/_next') || 
                       path.includes('/static') ||
                       path.includes('/images') ||
                       path.includes('/favicon');
  
  // Get the user token if the path is a protected route
  // Skip token verification for all auth-related paths to prevent middleware interference
  let token = null;
  if (!path.startsWith('/auth/') && !path.startsWith('/api/auth/')) {
    try {
      token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      // Debug token on protected routes
      if (isProtectedRoute) {
        console.log(`Token for ${path}:`, token ? 'present' : 'missing');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
  }
  
  // Attach token to request for API gateway use in rate limiting
  (request as any).token = token;
  
  // If the path is a protected route and no token exists, redirect to login
  if (isProtectedRoute && !token && !isPublicRoute) {
    console.log(`Redirecting from ${path} to login due to missing token`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Continue normal request processing
  return NextResponse.next();
}

// Configure which paths this middleware is run for
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/api/:path*',
    '/onboarding/:path*'
  ],
};