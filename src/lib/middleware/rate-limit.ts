/**
 * Rate Limiting Service
 * Implements token bucket algorithm with Redis/memory storage
 */

import { LRUCache } from 'lru-cache';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { addRateLimitHeaders } from './security-headers';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (req: NextRequest) => NextResponse;
}

/**
 * Token bucket for rate limiting
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  resetAt: number;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // API endpoints
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
  
  // Document uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
  },
  
  // Plaid connections
  plaid: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 connections per hour
  },
  
  // Webhooks
  webhook: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 webhooks per minute
  },
} as const;

/**
 * In-memory store for rate limiting (use Redis in production)
 */
const rateLimitStore = new LRUCache<string, TokenBucket>({
  max: 10000, // Store up to 10k unique keys
  ttl: 24 * 60 * 60 * 1000, // 24 hour TTL
});

/**
 * Creates a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    handler = defaultHandler,
  } = config;

  return async function rateLimiter(
    request: NextRequest,
    response?: NextResponse
  ): Promise<{ allowed: boolean; response?: NextResponse }> {
    const key = keyGenerator(request);
    const now = Date.now();
    
    // Get or create bucket
    let bucket = rateLimitStore.get(key);
    
    if (!bucket || now >= bucket.resetAt) {
      // Create new bucket
      bucket = {
        tokens: max - 1,
        lastRefill: now,
        resetAt: now + windowMs,
      };
      rateLimitStore.set(key, bucket);
      
      if (response) {
        addRateLimitHeaders(response, max, bucket.tokens, new Date(bucket.resetAt));
      }
      
      return { allowed: true, response };
    }
    
    // Check if we have tokens
    if (bucket.tokens > 0) {
      bucket.tokens--;
      rateLimitStore.set(key, bucket);
      
      if (response) {
        addRateLimitHeaders(response, max, bucket.tokens, new Date(bucket.resetAt));
      }
      
      return { allowed: true, response };
    }
    
    // Rate limit exceeded
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    const limitResponse = handler(request);
    
    addRateLimitHeaders(limitResponse, max, 0, new Date(bucket.resetAt));
    
    return { allowed: false, response: limitResponse };
  };
}

/**
 * Default key generator (IP + user ID based)
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  // Try to get user ID from various sources
  const authHeader = request.headers.get('authorization');
  const userId = authHeader ? hashString(authHeader) : 'anonymous';
  
  return `rate_limit:${ip}:${userId}:${request.nextUrl.pathname}`;
}

/**
 * Default rate limit exceeded handler
 */
function defaultHandler(request: NextRequest): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    },
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Hash string for consistent key generation
 */
function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Apply rate limiting to a route handler
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  const limiter = createRateLimiter(config);
  
  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed, response: limitResponse } = await limiter(request);
    
    if (!allowed && limitResponse) {
      return limitResponse;
    }
    
    const response = await handler(request);
    
    // Add rate limit headers to successful responses
    const { response: finalResponse } = await limiter(request, response);
    
    return finalResponse || response;
  };
}

/**
 * Rate limit by user ID only
 */
export function userRateLimiter(userId: string, endpoint: string, config: RateLimitConfig) {
  const key = `rate_limit:user:${userId}:${endpoint}`;
  const now = Date.now();
  
  let bucket = rateLimitStore.get(key);
  
  if (!bucket || now >= bucket.resetAt) {
    bucket = {
      tokens: config.max - 1,
      lastRefill: now,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, bucket);
    return { allowed: true, remaining: bucket.tokens, resetAt: bucket.resetAt };
  }
  
  if (bucket.tokens > 0) {
    bucket.tokens--;
    rateLimitStore.set(key, bucket);
    return { allowed: true, remaining: bucket.tokens, resetAt: bucket.resetAt };
  }
  
  return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): TokenBucket | null {
  return rateLimitStore.get(key) || null;
}