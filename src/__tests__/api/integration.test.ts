import { createMocks } from 'node-mocks-http';
import { GET as getAccounts, POST as createAccount } from '@/app/api/v1/accounts/route';
import { GET as getTransactions } from '@/app/api/v1/transactions/route';
import { POST as exchangePlaidToken } from '@/app/api/v1/plaid/exchange/route';
import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption/simple';

// Mock Supabase
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/encryption/simple');

describe('API Integration Tests', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (encrypt as jest.Mock).mockImplementation((data) => `encrypted_${data}`);
  });

  describe('/api/v1/accounts', () => {
    describe('GET /api/v1/accounts', () => {
      it('returns user accounts successfully', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: { id: 'user-123' } },
          error: null,
        });

        // Mock database response
        const mockAccounts = [
          {
            id: 'acc-1',
            name: 'Checking',
            balance: 1000,
            type: 'checking',
            plaid_access_token_encrypted: 'encrypted_token',
          },
        ];

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockAccounts,
              error: null,
            }),
          }),
        });

        const { req } = createMocks({
          method: 'GET',
        });

        const response = await getAccounts(req as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.accounts).toHaveLength(1);
        expect(data.accounts[0].name).toBe('Checking');
        expect(data.totalBalance).toBe(1000);
      });

      it('returns 401 for unauthenticated requests', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: null },
          error: null,
        });

        const { req } = createMocks({
          method: 'GET',
        });

        const response = await getAccounts(req as any);
        expect(response.status).toBe(401);
      });

      it('handles database errors gracefully', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: { id: 'user-123' } },
          error: null,
        });

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        });

        const { req } = createMocks({
          method: 'GET',
        });

        const response = await getAccounts(req as any);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch accounts');
      });
    });

    describe('POST /api/v1/accounts', () => {
      it('creates new account with validation', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: { id: 'user-123' } },
          error: null,
        });

        const newAccount = {
          name: 'New Savings',
          type: 'savings',
          balance: 5000,
          currency: 'USD',
        };

        mockSupabase.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ id: 'new-acc', ...newAccount }],
              error: null,
            }),
          }),
        });

        const { req } = createMocks({
          method: 'POST',
          body: newAccount,
        });

        const response = await createAccount(req as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.account.name).toBe('New Savings');
      });

      it('validates required fields', async () => {
        mockSupabase.auth.getUser.mockResolvedValueOnce({
          data: { user: { id: 'user-123' } },
          error: null,
        });

        const { req } = createMocks({
          method: 'POST',
          body: { name: 'Test' }, // Missing required fields
        });

        const response = await createAccount(req as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('validation');
      });
    });
  });

  describe('/api/v1/transactions', () => {
    it('returns paginated transactions', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockTransactions = Array.from({ length: 25 }, (_, i) => ({
        id: `trans-${i}`,
        amount: -50 * (i + 1),
        description: `Transaction ${i}`,
        date: new Date().toISOString(),
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockTransactions.slice(0, 20),
                error: null,
                count: 25,
              }),
            }),
          }),
        }),
      });

      const { req } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '20' },
      });

      const response = await getTransactions(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toHaveLength(20);
      expect(data.pagination.total).toBe(25);
      expect(data.pagination.hasMore).toBe(true);
    });

    it('filters transactions by date range', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  range: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                    count: 0,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const { req } = createMocks({
        method: 'GET',
        query: { startDate, endDate },
      });

      const response = await getTransactions(req as any);
      expect(response.status).toBe(200);
    });
  });

  describe('/api/v1/plaid/exchange', () => {
    it('exchanges Plaid token successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPlaidClient = {
        itemPublicTokenExchange: jest.fn().mockResolvedValue({
          data: {
            access_token: 'access-token-123',
            item_id: 'item-123',
          },
        }),
      };

      // Mock Plaid client
      jest.mock('@/lib/integrations/plaid/client', () => ({
        getPlaidClient: () => mockPlaidClient,
      }));

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'plaid-item-1' }],
          error: null,
        }),
      });

      const { req } = createMocks({
        method: 'POST',
        body: {
          publicToken: 'public-token-123',
          institutionId: 'ins_1',
          institutionName: 'Test Bank',
        },
      });

      const response = await exchangePlaidToken(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(encrypt).toHaveBeenCalledWith('access-token-123');
    });

    it('handles Plaid API errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPlaidClient = {
        itemPublicTokenExchange: jest.fn().mockRejectedValue(
          new Error('Invalid public token')
        ),
      };

      jest.mock('@/lib/integrations/plaid/client', () => ({
        getPlaidClient: () => mockPlaidClient,
      }));

      const { req } = createMocks({
        method: 'POST',
        body: {
          publicToken: 'invalid-token',
          institutionId: 'ins_1',
          institutionName: 'Test Bank',
        },
      });

      const response = await exchangePlaidToken(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid public token');
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits on API endpoints', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Make multiple requests rapidly
      const requests = Array.from({ length: 65 }, () => 
        createMocks({ method: 'GET' })
      );

      let rateLimitHit = false;
      
      for (const { req } of requests) {
        const response = await getAccounts(req as any);
        if (response.status === 429) {
          rateLimitHit = true;
          const data = await response.json();
          expect(data.error).toContain('Too many requests');
          break;
        }
      }

      expect(rateLimitHit).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('includes security headers in responses', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { req } = createMocks({ method: 'GET' });
      const response = await getAccounts(req as any);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });
});