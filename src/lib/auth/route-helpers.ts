/**
 * Route helpers for API routes
 * Includes middleware for CSRF validation and authentication
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCsrfToken } from '@/lib/auth/csrf';

/**
 * Middleware to validate CSRF tokens for API routes
 * This should be used on all API routes that accept POST, PUT, DELETE methods
 */
export function withCsrfProtection(handler: Function) {
  return async (request: NextRequest) => {
    // Only check non-GET requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      // Validate CSRF token
      if (!validateCsrfToken(request)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
    
    // Call the handler function
    return handler(request);
  };
}

/**
 * Middleware to require authentication for API routes
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    // Get supabase client and user
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create session-like object for compatibility
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
      }
    };
    
    // Call the handler function with session
    return handler(request, session);
  };
}

/**
 * Combined middleware for both authentication and CSRF protection
 */
export function withAuthAndCsrf(handler: Function) {
  return withAuth(withCsrfProtection(handler));
}

/**
 * Helper to create secure API route handlers with appropriate middleware
 */
export function createSecureHandlers(handlers: Record<string, Function>) {
  const secureHandlers: Record<string, Function> = {};
  
  // Apply middleware based on HTTP method
  for (const [method, handler] of Object.entries(handlers)) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
      // For safe methods, just require authentication
      secureHandlers[method.toLowerCase()] = withAuth(handler);
    } else {
      // For methods that modify state, require both auth and CSRF
      secureHandlers[method.toLowerCase()] = withAuthAndCsrf(handler);
    }
  }
  
  return secureHandlers;
}