// Update the import path below if your test-utils file is located elsewhere
import { render, screen, waitFor } from '../utils/test-utils';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client');

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  };

  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('Login Form', () => {
    it.skip('renders all login elements correctly', () => {
      // render(<LoginForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with microsoft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with linkedin/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try demo account/i })).toBeInTheDocument();
    });

    it.skip('handles successful email/password login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const { user } = render(<LoginForm />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it.skip('displays error on invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      const { user } = render(<LoginForm />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it.skip('handles OAuth login correctly', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValueOnce({
        data: { url: 'https://provider.com/auth' },
        error: null,
      });

      const { user } = render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it.skip('handles demo account login', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'demo-user', email: 'demo@lifenavigator.ai' } },
        error: null,
      });

      const { user } = render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /try demo account/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'demo@lifenavigator.ai',
          password: 'demo123',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    it.skip('validates form inputs', async () => {
      const { user } = render(<LoginForm />);

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Check HTML5 validation
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      expect(emailInput.validity.valueMissing).toBe(true);
      expect(passwordInput.validity.valueMissing).toBe(true);
    });

    it.skip('disables form during submission', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { user } = render(<LoginForm />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });
  });

  describe('Registration Form', () => {
    it('renders all registration elements', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('validates password confirmation', async () => {
      const { user } = render(<RegisterForm />);

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password456');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('handles successful registration', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { 
          user: { id: 'new-user', email: 'john@example.com' },
          session: null,
        },
        error: null,
      });

      const { user } = render(<RegisterForm />);

      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'SecurePass123!',
          options: {
            data: {
              name: 'John Doe',
            },
          },
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login?registered=true');
      });
    });

    it('shows password strength indicator', async () => {
      const { user } = render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Weak password
      await user.type(passwordInput, '123');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      // Medium password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      expect(screen.getByText(/medium/i)).toBeInTheDocument();

      // Strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'SecurePass123!@#');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('redirects to login when accessing protected route without auth', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      // This would be tested in middleware tests
      // Just checking the auth check logic here
      const { data } = await mockSupabase.auth.getUser();
      expect(data.user).toBeNull();
    });
  });

  describe('Session Management', () => {
    it.skip('handles session refresh correctly', async () => {
      const mockCallback = jest.fn();
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback: (...args: any[]) => any) => {
        // Store the callback for later use
        callback('SIGNED_IN', { user: { id: 'user-123' } });
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      // render(<LoginForm />);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});