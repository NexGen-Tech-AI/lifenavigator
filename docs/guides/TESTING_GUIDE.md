# Comprehensive Testing Guide for LifeNavigator

## Overview

LifeNavigator implements a state-of-the-art testing strategy covering:
- Unit Tests
- Integration Tests
- End-to-End Tests
- Performance Tests
- Security Tests
- Accessibility Tests
- Visual Regression Tests

## Test Architecture

```
src/
├── __tests__/
│   ├── auth/           # Authentication tests
│   ├── dashboard/      # Dashboard component tests
│   ├── api/           # API integration tests
│   ├── performance/   # Performance benchmarks
│   ├── security/      # Security test suite
│   ├── accessibility/ # A11y tests
│   └── utils/        # Test utilities and helpers
├── e2e/              # Playwright E2E tests
└── visual/           # Visual regression tests
```

## Running Tests

### Quick Start
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:a11y

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### E2E Test Commands
```bash
# Run E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run specific E2E test
npx playwright test auth.e2e.spec.ts
```

## Test Coverage Goals

We maintain strict coverage requirements:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Writing Tests

### Unit Tests

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('API Integration', () => {
  it('creates account successfully', async () => {
    const response = await fetch('/api/v1/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Account' }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.account.name).toBe('Test Account');
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can complete onboarding', async ({ page }) => {
  await page.goto('/onboarding');
  
  // Fill questionnaire
  await page.getByLabel('Full Name').fill('John Doe');
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Complete flow
  await expect(page).toHaveURL('/dashboard');
});
```

## Test Data Management

### Mock Data Factories

Use our test data factories for consistent mock data:

```typescript
import { 
  createMockUser, 
  createMockFinancialAccount,
  createMockTransaction 
} from '@/__tests__/utils/test-utils';

const user = createMockUser({ name: 'Test User' });
const account = createMockFinancialAccount({ balance: 5000 });
```

### Database Seeding

For E2E tests, use test database:

```bash
# Seed test database
npm run db:seed:test

# Reset test database
npm run db:reset:test
```

## Performance Testing

### Benchmarks

We track key performance metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Component render time: < 100ms
- API response time: < 200ms

### Running Performance Tests

```bash
# Run performance suite
npm run test:performance

# Generate performance report
npm run perf:report
```

## Security Testing

### Security Checklist

Our tests verify:
- [x] XSS Prevention
- [x] CSRF Protection
- [x] SQL Injection Prevention
- [x] Password Security
- [x] Session Management
- [x] API Input Validation
- [x] File Upload Security
- [x] OAuth Security

### Running Security Audit

```bash
# Run security tests
npm run test:security

# Run dependency audit
npm audit

# Check for vulnerabilities
npm run security:check
```

## Accessibility Testing

### A11y Standards

We test for WCAG 2.1 Level AA compliance:
- Color contrast ratios
- Keyboard navigation
- Screen reader support
- ARIA labels and roles

### Testing Tools

```typescript
import { expectNoA11yViolations } from '@/__tests__/utils/test-utils';

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  await expectNoA11yViolations(container);
});
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main
- Scheduled daily runs

### Pre-commit Hooks

```bash
# Install hooks
npm run prepare

# Hooks run:
- Linting
- Type checking
- Unit tests for changed files
```

## Debugging Tests

### Debug Unit Tests

```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
npm test -- --testNamePattern="should login"
```

### Debug E2E Tests

```bash
# Launch with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Headed mode
npx playwright test --headed
```

### View Test Reports

```bash
# Open coverage report
open coverage/lcov-report/index.html

# Open E2E report
npx playwright show-report

# View test results
open test-results/index.html
```

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe`
- Follow AAA pattern: Arrange, Act, Assert

### 2. Async Testing
```typescript
// Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Bad
setTimeout(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, 1000);
```

### 3. Mock Management
```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. Test Isolation
- Each test should be independent
- Don't rely on test execution order
- Clean up after tests

### 5. Performance
- Use `test.concurrent` for parallel tests
- Mock heavy operations
- Use test utilities for common operations

## Troubleshooting

### Common Issues

**Tests timing out:**
- Increase timeout: `jest.setTimeout(30000)`
- Check for missing `await` keywords
- Verify mock responses

**Flaky tests:**
- Use `waitFor` instead of fixed delays
- Mock time-dependent operations
- Check for race conditions

**Coverage gaps:**
- Run coverage with `--collectCoverageFrom`
- Check untested branches
- Add edge case tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage thresholds
4. Update test documentation