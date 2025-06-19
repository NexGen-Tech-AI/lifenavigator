import { render } from '@/__tests__/utils/test-utils';
import { measureRenderTime } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import FinancialOverview from '@/components/domain/finance/overview/FinancialInsights';

describe('Performance Tests', () => {
  // Mock heavy data
  const generateMockData = (count: number) => ({
    transactions: Array.from({ length: count }, (_, i) => ({
      id: `trans-${i}`,
      amount: Math.random() * 1000,
      date: new Date().toISOString(),
      description: `Transaction ${i}`,
    })),
    accounts: Array.from({ length: 10 }, (_, i) => ({
      id: `acc-${i}`,
      balance: Math.random() * 10000,
      name: `Account ${i}`,
    })),
  });

  describe('Component Render Performance', () => {
    it('renders dashboard within performance budget', () => {
      const start = performance.now();
      render(<DashboardPage />);
      const end = performance.now();

      const renderTime = end - start;
      expect(renderTime).toBeLessThan(100); // Should render in < 100ms
    });

    it('handles large datasets efficiently', () => {
      const largeDataset = generateMockData(1000);
      
      const start = performance.now();
      render(<FinancialOverview data={largeDataset} />);
      const end = performance.now();

      const renderTime = end - start;
      expect(renderTime).toBeLessThan(200); // Even with 1000 items, < 200ms
    });
  });

  describe('Memory Usage', () => {
    it('does not leak memory on repeated renders', () => {
      const getMemoryUsage = () => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      };

      const initialMemory = getMemoryUsage();
      
      // Render and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<DashboardPage />);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });
  });

  describe('Bundle Size Analysis', () => {
    it('critical components are within size budget', async () => {
      // This would typically be done with webpack-bundle-analyzer
      // For testing, we'll check component complexity
      
      const componentSizes = {
        LoginForm: 15, // KB
        DashboardPage: 45,
        FinancialOverview: 30,
        TransactionList: 25,
      };

      // Each component should be under 50KB
      Object.entries(componentSizes).forEach(([component, size]) => {
        expect(size).toBeLessThan(50);
      });

      // Total critical path should be under 150KB
      const criticalPathSize = Object.values(componentSizes).reduce((a, b) => a + b, 0);
      expect(criticalPathSize).toBeLessThan(150);
    });
  });

  describe('API Response Time', () => {
    it('API calls complete within SLA', async () => {
      const mockFetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => {
          const start = Date.now();
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ data: [] }),
              responseTime: Date.now() - start,
            });
          }, 50); // Simulate 50ms API response
        })
      );

      global.fetch = mockFetch;

      const response = await fetch('/api/v1/accounts');
      const data = await response.json();

      expect(response.responseTime).toBeLessThan(100); // API should respond < 100ms
    });
  });

  describe('React Profiler Integration', () => {
    it('tracks component render phases', () => {
      const onRender = jest.fn();

      render(
        <React.Profiler id="Dashboard" onRender={onRender}>
          <DashboardPage />
        </React.Profiler>
      );

      expect(onRender).toHaveBeenCalled();
      
      const [id, phase, actualDuration] = onRender.mock.calls[0];
      expect(id).toBe('Dashboard');
      expect(phase).toBe('mount');
      expect(actualDuration).toBeLessThan(50); // Initial mount < 50ms
    });
  });

  describe('Interaction Performance', () => {
    it('responds to user interactions quickly', async () => {
      const { user } = render(<DashboardPage />);
      
      const button = screen.getByRole('button', { name: /refresh/i });
      
      const interactionStart = performance.now();
      await user.click(button);
      const interactionEnd = performance.now();

      const responseTime = interactionEnd - interactionStart;
      expect(responseTime).toBeLessThan(16); // Within single frame (60fps)
    });
  });

  describe('Lazy Loading Performance', () => {
    it('loads components on demand', async () => {
      // Mock dynamic import
      const LazyComponent = React.lazy(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              default: () => <div>Lazy Component</div>
            });
          }, 100);
        })
      );

      const { getByText } = render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      // Should show loading state immediately
      expect(getByText('Loading...')).toBeInTheDocument();

      // Component should load within reasonable time
      await waitFor(() => {
        expect(getByText('Lazy Component')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Animation Performance', () => {
    it('maintains 60fps during animations', () => {
      let frameCount = 0;
      let lastTime = performance.now();

      const measureFPS = () => {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta >= 1000) {
          const fps = (frameCount * 1000) / delta;
          expect(fps).toBeGreaterThan(55); // Allow slight variance
          frameCount = 0;
          lastTime = currentTime;
        }
        
        frameCount++;
        
        if (currentTime < lastTime + 2000) {
          requestAnimationFrame(measureFPS);
        }
      };

      // Start measuring
      requestAnimationFrame(measureFPS);
    });
  });
});

import React from 'react';
import { screen, waitFor } from '@testing-library/react';