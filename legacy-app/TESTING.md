# Testing Setup

This project includes comprehensive testing setup with both unit tests and end-to-end tests.

## Testing Framework

### Unit Tests
- **Jest**: JavaScript testing framework with TypeScript support
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

### End-to-End Tests
- **Playwright**: Cross-browser testing framework
- Supports Chrome, Firefox, Safari, and mobile browsers

## Test Structure

```
├── __tests__/                 # Unit tests
│   ├── components/           # Component tests
│   ├── utils/                # Utility function tests
│   └── api/                  # API route tests
├── e2e/                      # End-to-end tests
│   ├── fixtures.ts           # Test fixtures and helpers
│   ├── test-helpers.ts       # Reusable test utilities
│   ├── app.spec.ts           # Main app functionality tests
│   ├── auth.spec.ts          # Authentication flow tests
│   └── campaign-flow.spec.ts  # Complete campaign flow tests
├── jest.config.ts            # Jest configuration
├── jest.setup.ts             # Jest setup file
└── playwright.config.ts     # Playwright configuration
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode (visible browser)
npm run test:e2e:headed
```

## Test Coverage

The project aims for 70% test coverage across:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Categories

### Unit Tests
- **Components**: UI component behavior and rendering
- **Utilities**: Data processing and business logic
- **API Routes**: Request/response handling and validation

### End-to-End Tests
- **Authentication**: Login, registration, and protected routes
- **Data Source Management**: Connecting and configuring data sources
- **Channel Selection**: Selecting and configuring communication channels
- **Campaign Generation**: Complete campaign creation workflow
- **Chat Interface**: Message sending and AI responses
- **Error Handling**: API failures and network errors
- **Responsive Design**: Mobile and tablet compatibility

## Test Utilities

### TestHelpers Class
Provides reusable methods for common test operations:
- `login()`: Authenticate user
- `connectDataSource()`: Connect data sources
- `selectChannel()`: Select communication channels
- `generateCampaign()`: Generate campaign
- `sendChatMessage()`: Send chat messages
- `mockOpenAIResponse()`: Mock AI responses
- `mockAPIError()`: Mock API errors

### Mock Data
- Comprehensive mock data for all data sources
- Realistic campaign generation responses
- Error scenarios for robust testing

## Configuration Files

### Jest Configuration (`jest.config.ts`)
- TypeScript support with proper typing
- Next.js integration
- Module path mapping for `@/` imports
- Coverage thresholds and reporting
- Test environment setup

### Jest Setup (`jest.setup.ts`)
- Global mocks for Next.js components
- Request/Response polyfills for API tests
- Component mocks for missing dependencies
- Browser API mocks (IntersectionObserver, ResizeObserver, etc.)

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing setup
- Mobile and tablet viewport testing
- Automatic dev server startup
- Trace collection for debugging

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't affect others
2. **Mock External Dependencies**: APIs and external services are mocked
3. **Realistic Test Data**: Tests use data that reflects real-world scenarios
4. **Error Scenarios**: Tests cover both success and failure cases
5. **Accessibility**: Tests verify proper ARIA labels and keyboard navigation
6. **Performance**: Tests ensure components render efficiently

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- Unit tests run on every commit
- E2E tests run on pull requests
- Coverage reports are generated and tracked
- Tests run across multiple browsers and devices

## Debugging Tests

### Unit Tests
- Use `npm run test:watch` for interactive debugging
- Add `console.log()` statements for debugging
- Use Jest's `--verbose` flag for detailed output

### E2E Tests
- Use `npm run test:e2e:headed` to see browser actions
- Use `npm run test:e2e:ui` for interactive test runner
- Screenshots and videos are captured on failures
- Use Playwright's trace viewer for detailed debugging

## Test Data Management

### Mock Data Sources
- Google Tag Manager data with website metrics
- Facebook Pixel data with audience insights
- Google Ads data with campaign performance

### Mock Campaigns
- Realistic campaign structures
- Proper budget allocation
- Valid timing and metrics
- Channel-specific content

### Error Scenarios
- API failures and network errors
- Invalid input validation
- Authentication failures
- Database connection issues

## Maintenance

### Adding New Tests
1. Create test files in appropriate directories
2. Follow naming convention: `*.test.ts` for unit tests, `*.spec.ts` for e2e tests
3. Use existing test utilities and helpers
4. Mock external dependencies appropriately

### Updating Tests
1. Keep tests in sync with component changes
2. Update mock data when APIs change
3. Maintain test coverage thresholds
4. Review and update test scenarios regularly

This comprehensive testing setup ensures reliable, maintainable, and well-tested code across the entire application.
