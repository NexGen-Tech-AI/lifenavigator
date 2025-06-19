import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: null },
        error: null
      })),
    },
  })),
}));

// Mock security headers middleware
jest.mock('@/lib/middleware/security-headers', () => ({
  addSecurityHeaders: jest.fn((req, res) => res),
  addCorsHeaders: jest.fn((req, res) => res),
}));

// Mock rate limit middleware
jest.mock('@/lib/middleware/rate-limit', () => ({
  createRateLimiter: jest.fn(() => async () => ({ allowed: true, response: null })),
  RATE_LIMITS: {
    auth: {},
    api: {},
    upload: {},
  },
}));

describe('Middleware', () => {
  let request: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (url: string) => {
    return new NextRequest(new URL(url, 'http://localhost:3000'), {
      headers: new Headers({
        'host': 'localhost:3000',
      }),
    });
  };

  describe('Public routes', () => {
    it('should allow access to public routes without authentication', async () => {
      request = createRequest('/');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });

    it('should allow access to auth pages without authentication', async () => {
      request = createRequest('/auth/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Protected routes', () => {
    it('should redirect to login when accessing dashboard without auth', async () => {
      request = createRequest('/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/login');
    });

    it('should redirect to login when accessing API routes without auth', async () => {
      request = createRequest('/api/v1/accounts');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/auth/login');
    });

    it('should allow access to dashboard with authentication', async () => {
      // Mock authenticated user
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockResolvedValueOnce({
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { 
              user: { 
                id: 'test-user-id',
                email: 'test@example.com' 
              } 
            },
            error: null
          })),
        },
      });

      request = createRequest('/dashboard');
      const response = await middleware(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('Auth redirect behavior', () => {
    it('should redirect authenticated users away from login page', async () => {
      // Mock authenticated user
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockResolvedValueOnce({
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { 
              user: { 
                id: 'test-user-id',
                email: 'test@example.com' 
              } 
            },
            error: null
          })),
        },
      });

      request = createRequest('/auth/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('Rate limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      const { createRateLimiter } = require('@/lib/middleware/rate-limit');
      const mockRateLimiter = jest.fn().mockResolvedValue({ 
        allowed: false, 
        response: NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      });
      createRateLimiter.mockReturnValue(mockRateLimiter);

      request = createRequest('/auth/login');
      const response = await middleware(request);
      
      expect(mockRateLimiter).toHaveBeenCalled();
    });
  });
});