# Testing Setup for 10xDevs-10xCards

This directory contains the complete testing setup for the 10xDevs-10xCards application, including unit tests, integration tests, and end-to-end tests.

## 🧪 Testing Stack

- **Unit & Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Test Data**: Faker.js
- **Coverage**: c8 (built into Vitest)

## 📁 Directory Structure

```
tests/
├── unit/           # Unit tests for individual functions/components
├── integration/    # Integration tests for component interactions
├── e2e/           # End-to-end tests with Playwright
├── mocks/         # MSW handlers for API mocking
├── setup/         # Test setup and configuration files
├── fixtures/      # Test data and fixtures
└── README.md      # This file
```

## 🚀 Getting Started

### Prerequisites

Make sure all dependencies are installed:

```bash
npm install
```

### Running Tests

#### Unit & Integration Tests (Vitest)

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

#### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

#### Run All Tests

```bash
npm run test:all
```

## 📝 Writing Tests

### Unit Tests

Unit tests should be placed in `tests/unit/` and follow the naming convention `*.test.ts` or `*.spec.ts`.

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### Integration Tests

Integration tests should be placed in `tests/integration/` and test component interactions.

```typescript
// tests/integration/component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### E2E Tests

E2E tests should be placed in `tests/e2e/` and follow the naming convention `*.spec.ts`.

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-testid="start-button"]');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

## 🎭 Mocking with MSW

API calls are mocked using MSW (Mock Service Worker). Handlers are defined in `tests/mocks/handlers.ts`.

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' }
    ]);
  }),
];
```

## 📊 Test Coverage

Coverage reports are generated using c8 and can be found in the `coverage/` directory after running:

```bash
npm run test:coverage
```

### Coverage Thresholds

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🔧 Configuration Files

- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `tests/setup/vitest.setup.ts` - Vitest setup file
- `tests/setup/global-setup.ts` - Playwright global setup
- `tests/setup/global-teardown.ts` - Playwright global teardown

## 🧪 Test Categories

### Unit Tests
- Utility functions
- Individual component logic
- Service functions
- Validation functions

### Integration Tests
- Component interactions
- API endpoint testing
- Form submissions
- State management

### E2E Tests
- Complete user workflows
- Authentication flows
- Flashcard generation process
- Cross-browser compatibility
- Mobile responsiveness

## 🎯 Testing Best Practices

1. **Test Structure**: Use AAA pattern (Arrange, Act, Assert)
2. **Test Names**: Use descriptive names that explain what is being tested
3. **Test Data**: Use fixtures and factories for consistent test data
4. **Mocking**: Mock external dependencies and API calls
5. **Assertions**: Use specific assertions that clearly indicate what failed
6. **Cleanup**: Ensure tests clean up after themselves

### Example Test Structure

```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests failing due to async operations**: Use `waitFor` or `await` properly
2. **MSW not intercepting requests**: Check handler patterns and setup
3. **Playwright tests timing out**: Increase timeout or use proper waiting strategies
4. **Coverage not meeting thresholds**: Add more tests or adjust thresholds

### Debug Commands

```bash
# Debug specific test file
npx vitest run tests/unit/specific.test.ts

# Debug Playwright test
npx playwright test --debug tests/e2e/specific.spec.ts

# Run tests with verbose output
npm run test -- --reporter=verbose
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)

## 🤝 Contributing

When adding new features:

1. Write unit tests for new utility functions
2. Write integration tests for new components
3. Add E2E tests for new user workflows
4. Update MSW handlers for new API endpoints
5. Ensure all tests pass before submitting PR

## 📈 Test Metrics

The testing setup tracks the following metrics:

- **Test Coverage**: Percentage of code covered by tests
- **Test Performance**: Time taken to run test suites
- **Test Reliability**: Flaky test detection and reporting
 