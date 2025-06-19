import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToasterProvider } from '@/components/ui/toaster';
import userEvent from '@testing-library/user-event';

// Create a custom render function that includes all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialTheme?: 'light' | 'dark';
}

// Mock providers wrapper
const createWrapper = (options?: CustomRenderOptions) => {
  const queryClient = options?.queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={options?.initialTheme || 'light'}>
        <ToasterProvider>
          {children}
        </ToasterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Custom render function
export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const user = userEvent.setup();
  const rendered = render(ui, {
    wrapper: createWrapper(options),
    ...options,
  });

  return {
    ...rendered,
    user,
  };
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides?: Partial<any>) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockFinancialAccount = (overrides?: Partial<any>) => ({
  id: 'test-account-id',
  user_id: 'test-user-id',
  name: 'Test Checking Account',
  type: 'checking',
  balance: 1000.00,
  currency: 'USD',
  institution_name: 'Test Bank',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockTransaction = (overrides?: Partial<any>) => ({
  id: 'test-transaction-id',
  account_id: 'test-account-id',
  user_id: 'test-user-id',
  amount: -50.00,
  description: 'Test Transaction',
  category: 'shopping',
  date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
});

// Async utilities
export const waitForLoadingToFinish = () => 
  waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

// Form helpers
export const fillForm = async (user: any, formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(name, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
};

// API mock helpers
export const mockApiResponse = (data: any, options?: { delay?: number; status?: number }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: options?.status ? options.status >= 200 && options.status < 300 : true,
        status: options?.status || 200,
        json: async () => data,
      });
    }, options?.delay || 0);
  });
};

// Accessibility testing helpers
export const expectNoA11yViolations = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Performance testing helpers
export const measureRenderTime = (component: ReactElement) => {
  const start = performance.now();
  const result = render(component);
  const end = performance.now();
  return {
    ...result,
    renderTime: end - start,
  };
};

import { screen, waitFor } from '@testing-library/react';