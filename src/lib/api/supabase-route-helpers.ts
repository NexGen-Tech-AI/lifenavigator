import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

// Auth helpers
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new UnauthorizedError()
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    id: user.id,
    email: user.email!,
    ...profile
  }
}

export async function requireSubscription(
  request: NextRequest,
  requiredTier: 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY' = 'PRO'
) {
  const user = await requireAuth(request)
  
  const tierHierarchy = {
    FREE: 0,
    PRO: 1,
    AI_AGENT: 2,
    FAMILY: 3
  }
  
  if (tierHierarchy[user.subscription_tier] < tierHierarchy[requiredTier]) {
    throw new ForbiddenError(`This feature requires ${requiredTier} subscription or higher`)
  }
  
  return user
}

// Response helpers
export function successResponse(
  data: any,
  message?: string,
  statusCode: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status: statusCode }
  )
}

export function errorResponse(
  message: string,
  code?: string,
  statusCode: number = 500
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code
      }
    },
    { status: statusCode }
  )
}

// Error handler wrapper
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof ApiError) {
        return errorResponse(error.message, error.code, error.statusCode)
      }
      
      return errorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        500
      )
    }
  }
}

// Validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body) as T
  } catch (error: any) {
    if (error.issues) {
      const message = error.issues
        .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      throw new ValidationError(message)
    }
    throw new ValidationError('Invalid request body')
  }
}

// Pagination helpers
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
  const skip = (page - 1) * pageSize
  
  return { page, pageSize, skip }
}

export function paginatedResponse(
  data: any[],
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize)
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  })
}

// Query parameter helpers
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}