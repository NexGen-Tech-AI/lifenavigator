/**
 * API route helpers for consistent response handling and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSecurityAuditLog } from '@/lib/services/security-service';

// Response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Response helpers
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
}

export function errorResponse(
  error: string,
  code?: string,
  status = 400,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error, code, details },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse<ApiPaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}

// Authentication helpers
export async function authenticateRequest(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get additional user data from database
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const userData = {
    id: user.id,
    email: user.email!,
    isDemoAccount: user.email === 'demo@lifenavigator.ai',
    subscriptionTier: profile?.subscription_tier || 'FREE',
    ...profile
  };
  
  // Check if it's a demo account trying to modify data
  const method = request.method;
  if (userData.isDemoAccount && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    throw new Error('Demo account cannot modify data');
  }
  
  return userData;
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  
  return user;
}

export async function requireSubscription(
  request: NextRequest,
  minTier: 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY'
) {
  const user = await requireAuth(request);
  
  const tierOrder = {
    FREE: 0,
    PRO: 1,
    FAMILY: 2,
    AI_AGENT: 3
  };
  
  if (tierOrder[user.subscriptionTier] < tierOrder[minTier]) {
    throw new AuthorizationError(
      `This feature requires ${minTier} subscription or higher`
    );
  }
  
  return user;
}

// Request validation
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request data', error.errors);
    }
    throw error;
  }
}

// Query parameter helpers
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return Object.fromEntries(searchParams.entries());
}

export function getPaginationParams(request: NextRequest) {
  const params = getQueryParams(request);
  const page = Math.max(1, parseInt(params.page || '1'));
  const pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize || '20')));
  const skip = (page - 1) * pageSize;
  
  return { page, pageSize, skip };
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Error handler wrapper
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      // Log security-relevant errors
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        await createSecurityAuditLog({
          event: `API Error: ${error.message}`,
          eventType: 'LOGIN_FAILED',
          metadata: {
            path: request.nextUrl.pathname,
            method: request.method
          }
        });
      }
      
      if (error instanceof ApiError) {
        return errorResponse(error.message, error.code, error.statusCode, error.details);
      }
      
      // Generic error
      return errorResponse(
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        500
      );
    }
  };
}

// Rate limiting helper
export async function checkRateLimit(
  identifier: string,
  limit = 100,
  window = 60000 // 1 minute
) {
  // This would integrate with Redis or similar
  // For now, using a simple in-memory implementation
  // In production, use Redis or Vercel KV
  
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  
  // TODO: Implement actual rate limiting with Redis
  // For now, always allow
  return true;
}

// CORS headers for API routes
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper to add CORS headers to response
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}