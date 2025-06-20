import { NextRequest, NextResponse } from 'next/server';
import { DEMO_USER } from './demo-data';

/**
 * Demo mode authentication bypass
 * Creates a fake session for demo users without requiring actual authentication
 */

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function createDemoSession() {
  return {
    user: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      user_metadata: {
        name: DEMO_USER.name,
        age: DEMO_USER.age,
        occupation: DEMO_USER.occupation,
        is_demo: true,
      }
    },
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
}

export function isDemoRequest(request: NextRequest): boolean {
  // Check if this is a demo deployment
  if (!isDemoMode()) return false;
  
  // Check for demo cookie
  const hasDemoCookie = request.cookies.get('demo-session')?.value === 'active';
  
  // Check for demo header (for API requests)
  const hasDemoHeader = request.headers.get('x-demo-mode') === 'true';
  
  return hasDemoCookie || hasDemoHeader;
}

export function setDemoCookie(response: NextResponse): NextResponse {
  response.cookies.set('demo-session', 'active', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return response;
}

export function injectDemoUser(request: NextRequest): NextRequest {
  // Clone the request with demo user context
  const headers = new Headers(request.headers);
  headers.set('x-demo-user-id', DEMO_USER.id);
  headers.set('x-demo-mode', 'true');
  
  return new NextRequest(request.url, {
    headers,
    method: request.method,
    body: request.body,
  });
}

/**
 * Demo mode API response wrapper
 * Ensures all mutations are blocked in demo mode
 */
export function wrapDemoResponse(response: NextResponse, method: string): NextResponse {
  if (!isDemoMode()) return response;
  
  // Block all mutations in demo mode
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Allow certain read-only POST endpoints (calculations, simulations)
    const allowedPosts = [
      '/api/financial/calculator',
      '/api/financial/retirement-calculator',
      '/api/financial/simulator',
      '/api/v1/finance/simulator',
    ];
    
    const isAllowedPost = allowedPosts.some(path => 
      response.url?.includes(path)
    );
    
    if (!isAllowedPost) {
      return NextResponse.json(
        { 
          error: 'Demo mode is read-only',
          message: 'This action is not available in demo mode. Sign up for a full account to save changes.'
        },
        { status: 403 }
      );
    }
  }
  
  // Add demo mode header to response
  const newResponse = NextResponse.next(response);
  newResponse.headers.set('x-demo-mode', 'true');
  
  return newResponse;
}