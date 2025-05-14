/**
 * Route helpers for applying authentication and authorization to API routes
 */
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './session';

// Define types for route handlers
type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

// Auth options type
interface AuthOptions {
  requireSetupComplete?: boolean;
  requiredRole?: string;
  requiredPermissions?: string[];
}

/**
 * Create secure route handlers for an API endpoint
 * @param handlers - Object containing HTTP method handlers
 * @param options - Auth options to apply to all handlers
 * @returns Object with protected route handlers
 */
export function createSecureHandlers(
  handlers: {
    GET?: RouteHandler;
    POST?: RouteHandler;
    PUT?: RouteHandler;
    DELETE?: RouteHandler;
    PATCH?: RouteHandler;
  },
  options: AuthOptions = {}
) {
  const secureHandlers: Record<string, RouteHandler> = {};
  
  // Apply withAuth middleware to each handler with method restriction
  if (handlers.GET) {
    secureHandlers.GET = withAuth(handlers.GET, {
      ...options,
      allowedMethods: ['GET'],
    });
  }
  
  if (handlers.POST) {
    secureHandlers.POST = withAuth(handlers.POST, {
      ...options,
      allowedMethods: ['POST'],
    });
  }
  
  if (handlers.PUT) {
    secureHandlers.PUT = withAuth(handlers.PUT, {
      ...options,
      allowedMethods: ['PUT'],
    });
  }
  
  if (handlers.DELETE) {
    secureHandlers.DELETE = withAuth(handlers.DELETE, {
      ...options,
      allowedMethods: ['DELETE'],
    });
  }
  
  if (handlers.PATCH) {
    secureHandlers.PATCH = withAuth(handlers.PATCH, {
      ...options,
      allowedMethods: ['PATCH'],
    });
  }
  
  return secureHandlers;
}

/**
 * Create a secure API endpoint that allows certain HTTP methods
 * @param handler - The route handler function
 * @param methods - Array of allowed HTTP methods
 * @param options - Auth options
 * @returns Object with protected route handlers for specified methods
 */
export function createMethodLimitedEndpoint(
  handler: RouteHandler,
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[],
  options: AuthOptions = {}
) {
  const secureHandlers: Record<string, RouteHandler> = {};
  
  methods.forEach(method => {
    secureHandlers[method] = withAuth(handler, {
      ...options,
      allowedMethods: [method],
    });
  });
  
  return secureHandlers;
}