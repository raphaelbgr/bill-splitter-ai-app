# Testing & QA Workflow

*Generated for Agent Contextualization*
*Created: December 2024*

---

## Overview

This document defines the mandatory Testing & QA Workflow that ensures 100% test coverage and pass rate for all stories, tasks, and sprints in the AI Bill Splitter project.

## Core Requirements

### ✅ Always create and run tests for every story, task, and sprint. 100% pass rate required.

**What this means:**
- Every piece of new code must have corresponding tests
- All tests must pass before any task can be marked complete
- No exceptions - 100% pass rate is mandatory
- Both unit tests and integration tests are required

### ✅ Mock databases and external dependencies as needed to ensure full test coverage.

**What this means:**
- All database operations must be mocked in tests
- All external API calls must be mocked
- All third-party service integrations must be mocked
- Tests must be reliable and not depend on external services

### ✅ After a sprint/story/task is completed by a Dev:
- The assigned QA must run and verify all tests
- Only when all tests pass (system-wide + story-specific), QA should mark it as passed
- Then, reactivate the previous Dev to proceed with the next task/story/sprint if applicable

### ✅ In QA.md and QA.mdc, mark each completed story with an "X" only if it passed all tests.

### ✅ Reflect completion status across sprints/epics/stories using consistent checkmarks in their .md files.

---

## Workflow Process

### 1. Development Phase (Dev Agent)

**Before marking any task complete:**

1. **Write Tests First**
   ```bash
   # Create test files for all new functionality
   # Ensure 100% coverage for new code
   ```

2. **Mock External Dependencies**
   ```javascript
   // Example: Mock database operations
   jest.mock('../lib/supabase', () => ({
     createClient: jest.fn(() => ({
       from: jest.fn(() => ({
         select: jest.fn(() => Promise.resolve({ data: [], error: null })),
         insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
         update: jest.fn(() => Promise.resolve({ data: [], error: null })),
         delete: jest.fn(() => Promise.resolve({ data: [], error: null }))
       }))
     }))
   }));
   ```

3. **Run Tests Locally**
   ```bash
   # Run all tests
   npm test
   
   # Run with coverage
   npm run test:coverage
   
   # Run integration tests
   npm run test:complete
   ```

4. **Verify 100% Pass Rate**
   - All tests must pass
   - Coverage must be 100% for new code
   - No regressions in existing tests

5. **Mark Task Complete**
   - Only after all tests pass
   - Update story file with completion status
   - Set story status to "Ready for Review"

### 2. QA Validation Phase (QA Agent)

**When story is marked "Ready for Review":**

1. **Run Comprehensive Test Suite**
   ```bash
   # Use the QA validation script
   npm run test:qa-validation [story-name]
   
   # Or run manually
   npm run lint
   npm run type-check
   npm test
   npm run test:coverage
   npm run test:complete
   ```

2. **Validate Test Coverage**
   - Ensure 100% coverage for new code
   - Verify all external dependencies are mocked
   - Check that edge cases are covered

3. **System-Wide Validation**
   - Run all existing tests to ensure no regressions
   - Verify database operations are properly mocked
   - Check API endpoint tests
   - Validate component tests

4. **Story-Specific Validation**
   - Review tests related to the specific story functionality
   - Ensure acceptance criteria are covered by tests
   - Verify integration points are tested
   - Check error handling scenarios

5. **Mark Completion Status**
   - If all tests pass: Mark story as "Done"
   - Update tracking files with "X" for completion
   - Reactivate Dev agent for next task

### 3. Completion Tracking

**Update all tracking files with consistent checkmarks:**

```markdown
# Story File
Status: Done

# Sprint/Epic Files
- [x] Story 01: Basic Claude Integration
- [x] Story 02: Supabase Foundation Setup
- [ ] Story 03: Basic Conversation Flow (in progress)

# QA Tracking Files
- [x] Story 01: All tests passed (100% coverage)
- [x] Story 02: All tests passed (100% coverage)
- [ ] Story 03: Pending QA validation
```

---

## Test Configuration

### Jest Configuration (jest.config.js)

```javascript
coverageThreshold: {
  global: {
    branches: 100,    // 100% branch coverage required
    functions: 100,   // 100% function coverage required
    lines: 100,       // 100% line coverage required
    statements: 100   // 100% statement coverage required
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:complete": "node scripts/test-complete-setup.js",
    "test:qa-validation": "node scripts/qa-test-validation.js"
  }
}
```

---

## QA Validation Script

The `scripts/qa-test-validation.js` script provides automated validation:

```bash
# Validate all stories
npm run test:qa-validation

# Validate specific story
npm run test:qa-validation "story-name"
```

**What the script validates:**
1. Code linting (ESLint)
2. TypeScript type checking
3. Unit tests (Jest)
4. Test coverage (100% requirement)
5. Integration tests
6. Story-specific tests

**Exit Codes:**
- `0` - All tests passed, story ready for completion
- `1` - Tests failed, story not ready for completion

---

## Mocking Guidelines

### Database Operations

```javascript
// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
}));
```

### API Calls

```javascript
// Mock external API calls
jest.mock('../lib/claude-client', () => ({
  sendMessage: jest.fn(() => Promise.resolve({
    content: 'Mock response',
    usage: { input_tokens: 10, output_tokens: 20 }
  }))
}));
```

### Redis Operations

```javascript
// Mock Redis client
jest.mock('../lib/redis-client', () => ({
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve('OK')),
  del: jest.fn(() => Promise.resolve(1))
}));
```

---

## Common Issues and Solutions

### Issue: Tests failing due to external dependencies

**Solution:**
- Mock all external dependencies
- Use Jest's `jest.mock()` function
- Create mock implementations that return predictable results

### Issue: Coverage below 100%

**Solution:**
- Add tests for all code paths
- Include edge cases and error scenarios
- Test both success and failure conditions

### Issue: Tests are flaky

**Solution:**
- Ensure all external dependencies are mocked
- Use deterministic test data
- Avoid time-based tests unless necessary

### Issue: Integration tests failing

**Solution:**
- Mock all external services
- Use test databases or in-memory storage
- Ensure test environment is isolated

---

## Quality Gates

### Development Quality Gate

- [ ] All unit tests written for new code
- [ ] All external dependencies mocked
- [ ] 100% test coverage for new code
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] TypeScript compilation successful

### QA Quality Gate

- [ ] All tests pass in CI environment
- [ ] 100% test coverage maintained
- [ ] No regressions in existing tests
- [ ] Integration tests pass
- [ ] Performance tests pass (if applicable)
- [ ] Security tests pass (if applicable)

### Release Quality Gate

- [ ] All quality gates passed
- [ ] Story marked as "Done"
- [ ] Completion status updated in all tracking files
- [ ] Dev agent reactivated for next task

---

## Monitoring and Reporting

### Test Coverage Reports

Generated automatically by Jest:
- HTML coverage reports in `coverage/` directory
- Console output showing coverage percentages
- Coverage thresholds enforced in CI

### Test Results Dashboard

Track test results over time:
- Pass/fail rates
- Coverage trends
- Test execution time
- Flaky test identification

### QA Validation Reports

Generated by QA validation script:
- Comprehensive test validation results
- Coverage analysis
- Integration test results
- Recommendations for improvements

---

## Best Practices

### For Developers

1. **Write Tests First (TDD)**
   - Write tests before implementing features
   - Ensure tests cover all requirements
   - Mock external dependencies immediately

2. **Maintain High Coverage**
   - Aim for 100% coverage on new code
   - Don't let coverage slip over time
   - Refactor tests when code changes

3. **Use Descriptive Test Names**
   ```javascript
   describe('UserService', () => {
     it('should create user with valid data', () => {
       // test implementation
     });
     
     it('should throw error for invalid email', () => {
       // test implementation
     });
   });
   ```

### For QA Agents

1. **Be Thorough**
   - Run all test suites
   - Verify coverage requirements
   - Check for regressions

2. **Provide Clear Feedback**
   - Document any issues found
   - Suggest improvements
   - Help developers understand requirements

3. **Maintain Consistency**
   - Use consistent checkmark format
   - Update all tracking files
   - Follow the workflow exactly

---

## Tools and Scripts

### Available Scripts

```bash
# Development
npm test                    # Run unit tests
npm run test:coverage      # Run tests with coverage
npm run test:complete      # Run integration tests
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript check

# QA Validation
npm run test:qa-validation # Run comprehensive QA validation
```

### Configuration Files

- `jest.config.js` - Jest test configuration
- `jest.setup.js` - Jest setup and global mocks
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration

---

*This workflow ensures consistent quality and reliable delivery across all development activities. All agents must follow these requirements strictly.* 