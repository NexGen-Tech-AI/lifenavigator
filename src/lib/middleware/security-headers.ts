/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Content Security Policy directives
 */
const getCSPDirectives = (nonce: string) => {
  // In development, allow unsafe-inline for easier debugging
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const directives = [
    "default-src 'self'",
    isDevelopment 
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.plaid.com https://js.stripe.com`
      : `script-src 'self' 'nonce-${nonce}' https://cdn.plaid.com https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.plaid.com https://api.stripe.com wss://*.supabase.co",
    "frame-src 'self' https://cdn.plaid.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
};

/**
 * Generates a secure nonce for CSP
 */
function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/**
 * Adds comprehensive security headers to the response
 */
export function addSecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const nonce = generateNonce();
  
  // Apply CSP with appropriate settings for development
  response.headers.set(
    'Content-Security-Policy',
    getCSPDirectives(nonce)
  );

  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options (clickjacking protection)
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options (MIME sniffing protection)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (feature restrictions)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // X-XSS-Protection (legacy XSS protection)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // X-Download-Options (IE8+ protection)
  response.headers.set('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Remove powered-by header
  response.headers.delete('X-Powered-By');

  // Add CSP nonce to response for inline scripts
  response.headers.set('X-Nonce', nonce);

  return response;
}

/**
 * CORS configuration for API routes
 */
export function addCorsHeaders(
  request: NextRequest,
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const origin = request.headers.get('origin');
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.length === 0 || 
    (origin && allowedOrigins.includes(origin));

  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

/**
 * Rate limiting headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: Date
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toISOString());
  
  if (remaining === 0) {
    response.headers.set('Retry-After', Math.ceil((reset.getTime() - Date.now()) / 1000).toString());
  }
  
  return response;
}