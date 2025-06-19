import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete authentication flow', async ({ page }) => {
    // Navigate to login
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/auth/login');

    // Fill login form
    await page.getByLabel(/email address/i).fill('demo@lifenavigator.ai');
    await page.getByLabel(/password/i).fill('demo123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    
    // Test logout
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    
    // Verify redirected to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('registration flow with validation', async ({ page }) => {
    await page.goto('/auth/register');

    // Test validation - mismatched passwords
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('newuser@example.com');
    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check error message
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();

    // Fix password and submit
    await page.getByLabel(/confirm password/i).fill('SecurePass123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for success
    await page.waitForURL('/auth/login?registered=true');
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
  });

  test('OAuth login buttons work', async ({ page }) => {
    await page.goto('/auth/login');

    // Test Google OAuth
    const googleButton = page.getByRole('button', { name: /continue with google/i });
    await expect(googleButton).toBeVisible();
    
    // In real test, this would redirect to Google
    // For now, just verify button is clickable
    await googleButton.click();
    
    // Similar for other providers
    await expect(page.getByRole('button', { name: /continue with microsoft/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with linkedin/i })).toBeVisible();
  });

  test('protected route redirects to login', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login?redirectTo=%2Fdashboard');
  });

  test('remember me functionality', async ({ page, context }) => {
    await page.goto('/auth/login');
    
    // Login with remember me
    await page.getByLabel(/email address/i).fill('demo@lifenavigator.ai');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByLabel(/remember me/i).check();
    
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');

    // Get cookies
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth'));
    
    // Verify cookie has extended expiry
    expect(authCookie).toBeDefined();
    expect(authCookie!.expires).toBeGreaterThan(Date.now() / 1000 + 7 * 24 * 60 * 60); // 7 days
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click forgot password
    await page.getByRole('link', { name: /forgot your password/i }).click();
    await expect(page).toHaveURL('/auth/forgot-password');
    
    // Submit email
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Verify success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});

test.describe('Dashboard E2E Tests', () => {
  test.use({ storageState: 'e2e/.auth/user.json' }); // Pre-authenticated state

  test('dashboard loads with all sections', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for data to load
    await page.waitForSelector('[data-testid="financial-overview-card"]');

    // Verify all sections are present
    await expect(page.getByText(/financial overview/i)).toBeVisible();
    await expect(page.getByText(/health metrics/i)).toBeVisible();
    await expect(page.getByText(/career progress/i)).toBeVisible();
    await expect(page.getByText(/learning progress/i)).toBeVisible();
  });

  test('navigation between dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to finance
    await page.getByRole('link', { name: /finance/i }).click();
    await expect(page).toHaveURL('/dashboard/finance');
    await expect(page.getByRole('heading', { name: /financial dashboard/i })).toBeVisible();

    // Navigate to health
    await page.getByRole('link', { name: /health/i }).click();
    await expect(page).toHaveURL('/dashboard/healthcare');
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('real-time data updates', async ({ page }) => {
    await page.goto('/dashboard');

    // Get initial balance
    const balanceElement = page.getByTestId('total-balance');
    const initialBalance = await balanceElement.textContent();

    // Simulate account update (in real app, this would be websocket)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('balance-update', { 
        detail: { newBalance: 25000 } 
      }));
    });

    // Verify balance updated
    await expect(balanceElement).not.toHaveText(initialBalance!);
    await expect(balanceElement).toContainText('25,000');
  });
});

test.describe('Financial Features E2E', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('add new financial account', async ({ page }) => {
    await page.goto('/dashboard/finance/accounts');

    // Click add account
    await page.getByRole('button', { name: /add account/i }).click();
    
    // Fill form
    await page.getByLabel(/account name/i).fill('New Savings Account');
    await page.getByLabel(/account type/i).selectOption('savings');
    await page.getByLabel(/balance/i).fill('5000');
    
    // Submit
    await page.getByRole('button', { name: /save account/i }).click();

    // Verify account added
    await expect(page.getByText('New Savings Account')).toBeVisible();
    await expect(page.getByText('$5,000')).toBeVisible();
  });

  test('connect Plaid account', async ({ page }) => {
    await page.goto('/dashboard/finance/connections');

    // Click connect
    await page.getByRole('button', { name: /connect bank account/i }).click();

    // This would open Plaid Link in real scenario
    // For testing, we'll verify the button works
    await expect(page.getByText(/connecting to plaid/i)).toBeVisible();
  });
});

test.describe('Accessibility E2E', () => {
  test('keyboard navigation through entire app', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /home/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /features/i })).toBeFocused();

    // Continue tabbing through all interactive elements
    let previousElement;
    let currentElement = await page.evaluate(() => document.activeElement?.tagName);
    
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      previousElement = currentElement;
      currentElement = await page.evaluate(() => document.activeElement?.tagName);
      
      // Ensure we're moving forward
      expect(currentElement).not.toBe(previousElement);
    }
  });

  test('screen reader announcements', async ({ page }) => {
    await page.goto('/dashboard');

    // Check ARIA live regions
    const liveRegions = page.locator('[aria-live]');
    await expect(liveRegions).toHaveCount(3); // Status, alerts, notifications

    // Trigger an action that updates live region
    await page.getByRole('button', { name: /refresh data/i }).click();
    
    // Verify announcement
    await expect(page.getByRole('status')).toContainText(/data refreshed/i);
  });
});

test.describe('Performance E2E', () => {
  test('page load performance metrics', async ({ page }) => {
    const metrics: any = {};

    page.on('load', () => {
      metrics.load = Date.now();
    });

    const start = Date.now();
    await page.goto('/dashboard');

    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      };
    });

    // Assert performance thresholds
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500); // FCP < 1.5s
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // DOM < 2s
    expect(metrics.load - start).toBeLessThan(3000); // Total load < 3s
  });

  test('interaction responsiveness', async ({ page }) => {
    await page.goto('/dashboard');

    // Measure button click responsiveness
    const button = page.getByRole('button', { name: /add account/i });
    
    const start = Date.now();
    await button.click();
    const modalAppeared = Date.now();

    expect(modalAppeared - start).toBeLessThan(100); // Response < 100ms
  });
});