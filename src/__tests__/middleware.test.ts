import { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
// Removed import of jest from '@jest/globals' as jest is available globally in Jest test environment

// Mock next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn(),
}));

// Mock NextResponse
const mockRedirect = jest.fn();
const mockNext = jest.fn();

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: mockNext,
      redirect: mockRedirect,
    },
  };
});

describe('Middleware', () => {
  let mockMiddlewareFunction: jest.Mock;
  let mockAuthorizedCallback: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockNext.mockReturnValue({ type: 'next' });
    mockRedirect.mockImplementation((url) => ({ 
      type: 'redirect', 
      url: url.toString() 
    }));
    
    // Mock the withAuth implementation
    mockMiddlewareFunction = jest.fn();
    mockAuthorizedCallback = jest.fn();
    
    (withAuth as jest.Mock).mockImplementation((middlewareFn, config) => {
      // Store the middleware function and config for testing
      mockMiddlewareFunction.mockImplementation(middlewareFn);
      mockAuthorizedCallback.mockImplementation(config.callbacks.authorized);
      
      // Return a function that simulates the withAuth behavior
      return jest.fn().mockImplementation((req) => {
        const isAuthorized = mockAuthorizedCallback({ 
          token: req.token, 
          req 
        });
        
        if (isAuthorized) {
          // Simulate setting the token on the request
          req.nextauth = { token: req.token };
          return mockMiddlewareFunction(req);
        } else {
          // Redirect to sign-in page
          return mockRedirect(new URL('/auth/login', req.url));
        }
      });
    });
    
    // Import the middleware after mocking
    require('../../middleware');
  });

  const createMockRequest = (pathname: string, token: any = null): any => {
    const url = `http://localhost:3000${pathname}`;
    return {
      nextUrl: {
        pathname,
        href: url,
        clone: jest.fn().mockReturnThis(),
      },
      url,
      token, // Add token for testing
      cookies: {
        get: jest.fn(),
        getAll: jest.fn().mockReturnValue([]),
      },
      headers: new Map(),
    };
  };

  describe('Authorization Logic', () => {
    it('should allow access to public auth routes without token', () => {
      const mockRequest = createMockRequest('/auth/login');
      
      const isAuthorized = mockAuthorizedCallback({
        token: null,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(true);
    });

    it('should allow access to auth register route without token', () => {
      const mockRequest = createMockRequest('/auth/register');
      
      const isAuthorized = mockAuthorizedCallback({
        token: null,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(true);
    });

    it('should require authentication for dashboard routes', () => {
      const mockRequest = createMockRequest('/dashboard');
      
      const isAuthorized = mockAuthorizedCallback({
        token: null,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(false);
    });

    it('should allow authenticated users to access dashboard', () => {
      const mockRequest = createMockRequest('/dashboard');
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'premium'
      };
      
      const isAuthorized = mockAuthorizedCallback({
        token: mockToken,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(true);
    });

    it('should require authentication for API routes', () => {
      const mockRequest = createMockRequest('/api/user/profile');
      
      const isAuthorized = mockAuthorizedCallback({
        token: null,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(false);
    });

    it('should allow authenticated users to access API routes', () => {
      const mockRequest = createMockRequest('/api/user/profile');
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com'
      };
      
      const isAuthorized = mockAuthorizedCallback({
        token: mockToken,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(true);
    });

    it('should allow access to root path for authenticated users', () => {
      const mockRequest = createMockRequest('/');
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com'
      };
      
      const isAuthorized = mockAuthorizedCallback({
        token: mockToken,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(true);
    });
  });

  describe('Middleware Function Logic', () => {
    it('should redirect root path to dashboard for authenticated users', () => {
      const mockRequest = createMockRequest('/', {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'premium'
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          tier: 'premium'
        }
      };

      mockMiddlewareFunction(mockRequest);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/dashboard', mockRequest.url)
      );
    });

    it('should redirect to onboarding if user needs onboarding', () => {
      const mockRequest = createMockRequest('/dashboard', {
        sub: 'user-123',
        email: 'test@example.com',
        needsOnboarding: true
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          needsOnboarding: true
        }
      };

      mockMiddlewareFunction(mockRequest);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/onboarding/welcome', mockRequest.url)
      );
    });

    it('should redirect premium features for non-premium users', () => {
      const mockRequest = createMockRequest('/dashboard/premium', {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'free'
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          tier: 'free'
        }
      };

      mockMiddlewareFunction(mockRequest);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/dashboard?upgrade=premium', mockRequest.url)
      );
    });

    it('should allow premium users to access premium features', () => {
      const mockRequest = createMockRequest('/dashboard/premium', {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'premium'
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          tier: 'premium'
        }
      };

      const result = mockMiddlewareFunction(mockRequest);
      
      // Should call NextResponse.next() and not redirect
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect business features for non-business users', () => {
      const mockRequest = createMockRequest('/dashboard/business', {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'premium'
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          tier: 'premium'
        }
      };

      mockMiddlewareFunction(mockRequest);
      
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL('/dashboard?upgrade=business', mockRequest.url)
      );
    });

    it('should add tier headers for API requests', () => {
      const mockRequest = createMockRequest('/api/calculations', {
        sub: 'user-123',
        email: 'test@example.com',
        tier: 'premium'
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com',
          tier: 'premium'
        }
      };

      // Mock NextResponse.next to return an object with headers
      const mockResponse = {
        headers: {
          set: jest.fn()
        }
      };
      mockNext.mockReturnValue(mockResponse);

      mockMiddlewareFunction(mockRequest);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-User-Tier', 'premium');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-User-ID', 'user-123');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Rate-Limit', '2000');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing token gracefully', () => {
      const mockRequest = createMockRequest('/dashboard');
      
      const isAuthorized = mockAuthorizedCallback({
        token: null,
        req: mockRequest
      });
      
      expect(isAuthorized).toBe(false);
    });

    it('should handle malformed request gracefully', () => {
      const mockRequest = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost:3000/dashboard'
      };
      
      expect(() => {
        mockAuthorizedCallback({
          token: null,
          req: mockRequest
        });
      }).not.toThrow();
    });

    it('should default to free tier when tier is missing', () => {
      const mockRequest = createMockRequest('/api/calculations', {
        sub: 'user-123',
        email: 'test@example.com'
        // tier is missing
      });
      
      mockRequest.nextauth = {
        token: {
          sub: 'user-123',
          email: 'test@example.com'
        }
      };

      const mockResponse = {
        headers: {
          set: jest.fn()
        }
      };
      mockNext.mockReturnValue(mockResponse);

      mockMiddlewareFunction(mockRequest);
      
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-User-Tier', 'free');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Rate-Limit', '100');
    });
  });
});