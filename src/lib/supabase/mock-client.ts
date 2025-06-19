/**
 * Mock Supabase client for development without Supabase setup
 */

export const createMockClient = () => {
  // Mock users for development
  const mockUsers: Record<string, any> = {
    'demo@lifenavigator.ai': {
      id: 'demo-user-id',
      email: 'demo@lifenavigator.ai',
      app_metadata: {},
      user_metadata: { name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    'timothy@riffeandassociates.com': {
      id: 'timothy-user-id',
      email: 'timothy@riffeandassociates.com',
      app_metadata: {},
      user_metadata: { name: 'Timothy Riffe' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    'plaid-demo@lifenavigator.ai': {
      id: 'plaid-demo-user-id',
      email: 'plaid-demo@lifenavigator.ai',
      app_metadata: {},
      user_metadata: { name: 'Plaid Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
  };

  const defaultMockUser = mockUsers['demo@lifenavigator.ai'];

  // Store auth state in memory for server-side
  let currentUser: any = null;
  
  return {
    auth: {
      getUser: async () => {
        // Check if we should return a logged-in user
        let isLoggedIn = false;
        let userEmail = null;
        
        if (typeof window !== 'undefined') {
          // Client-side: check localStorage
          isLoggedIn = window.localStorage.getItem('mock-auth') === 'true';
          userEmail = window.localStorage.getItem('mock-user-email');
        } else {
          // Server-side: use in-memory user
          if (currentUser) {
            return { data: { user: currentUser }, error: null };
          }
          return { data: { user: null }, error: null };
        }
        
        if (!isLoggedIn) {
          return { data: { user: null }, error: null };
        }
        
        const user = userEmail && mockUsers[userEmail] ? 
          mockUsers[userEmail] : defaultMockUser;
        
        return {
          data: { user },
          error: null
        };
      },
      signInWithPassword: async ({ email, password }: any) => {
        // Accept demo credentials
        if (email === 'demo@lifenavigator.ai' && password === 'demo123') {
          const user = mockUsers[email];
          currentUser = user; // Store for server-side
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('mock-auth', 'true');
            window.localStorage.setItem('mock-user-email', email);
          }
          return { data: { user, session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } }, error: null };
        }
        
        // Accept Timothy's credentials for testing
        if (email === 'timothy@riffeandassociates.com' && password === 'Sushi!$#1') {
          const user = mockUsers[email];
          currentUser = user; // Store for server-side
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('mock-auth', 'true');
            window.localStorage.setItem('mock-user-email', email);
            // Force a page reload to update auth state
            setTimeout(() => window.location.href = '/dashboard', 100);
          }
          return { data: { user, session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } }, error: null };
        }
        
        // Accept Plaid demo credentials
        if (email === 'plaid-demo@lifenavigator.ai' && password === 'plaid-demo-2024') {
          const user = mockUsers[email];
          currentUser = user; // Store for server-side
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('mock-auth', 'true');
            window.localStorage.setItem('mock-user-email', email);
            // Force a page reload to update auth state
            setTimeout(() => window.location.href = '/dashboard', 100);
          }
          return { data: { user, session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } }, error: null };
        }
        
        return { data: null, error: { message: 'Invalid credentials' } };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('mock-auth');
          window.localStorage.removeItem('mock-user-email');
        }
        return { error: null };
      },
      signInWithOAuth: async ({ provider }: any) => {
        // Mock OAuth - show message in development
        console.log(`🔧 OAuth login with ${provider} - Configure Supabase to enable`);
        return { 
          data: { url: null, provider }, 
          error: { 
            message: 'OAuth is not available in mock mode. Please configure Supabase.' 
          } 
        };
      },
      exchangeCodeForSession: async (_code: string) => {
        // Mock for OAuth callback
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: (callback: any) => {
        // Mock auth state change listener
        // Check for auth state changes on the client side
        if (typeof window !== 'undefined') {
          // Trigger callback with current state immediately
          const isLoggedIn = window.localStorage.getItem('mock-auth') === 'true';
          const userEmail = window.localStorage.getItem('mock-user-email');
          
          if (isLoggedIn && userEmail && mockUsers[userEmail]) {
            const user = mockUsers[userEmail];
            setTimeout(() => {
              callback('SIGNED_IN', { 
                user, 
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                token_type: 'bearer'
              });
            }, 100);
          }
          
          // Listen for storage changes
          const handleStorageChange = () => {
            const newIsLoggedIn = window.localStorage.getItem('mock-auth') === 'true';
            const newUserEmail = window.localStorage.getItem('mock-user-email');
            
            if (newIsLoggedIn && newUserEmail && mockUsers[newUserEmail]) {
              const user = mockUsers[newUserEmail];
              callback('SIGNED_IN', { 
                user, 
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                token_type: 'bearer'
              });
            } else {
              callback('SIGNED_OUT', null);
            }
          };
          
          window.addEventListener('storage', handleStorageChange);
          
          return {
            data: { 
              subscription: { 
                unsubscribe: () => {
                  window.removeEventListener('storage', handleStorageChange);
                } 
              } 
            }
          };
        }
        
        return {
          data: { subscription: { unsubscribe: () => {} } }
        };
      }
    },
    from: (table: string) => {
      const queryBuilder: any = {
        select: (_columns?: string) => queryBuilder,
        eq: (_column: string, _value: any) => queryBuilder,
        single: async () => {
          // Return mock data based on table
          if (table === 'users') {
            const userEmail = typeof window !== 'undefined' ? 
              window.localStorage.getItem('mock-user-email') : null;
            const currentUser = userEmail && mockUsers[userEmail] ? 
              mockUsers[userEmail] : defaultMockUser;
            
            return {
              data: {
                id: currentUser.id,
                email: currentUser.email,
                setup_completed: true,
                onboarding_completed: true, // Skip onboarding for mock users
                created_at: currentUser.created_at,
                subscription_tier: 'PILOT', // Mock users get pilot tier
                is_demo_account: true,
              },
              error: null
            };
          }
          return { data: null, error: null };
        }
      };
      return queryBuilder;
    }
  };
};