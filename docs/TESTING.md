# Testing Documentation

Comprehensive testing guide for the Express.js User Management API.

## Overview

This project uses **Jest** and **Supertest** for comprehensive testing coverage, including both unit tests and integration tests.

## Test Stack

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **Babel**: ES6 module support for Jest
- **cross-env**: Cross-platform environment variables

## Project Setup

### Prerequisites

```bash
npm install --save-dev jest supertest @babel/preset-env cross-env
```

### Configuration Files

#### `babel.config.cjs`

```javascript
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
};
```

#### `package.json` Scripts

```json
{
  "scripts": {
    "test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:coverage": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {},
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    "collectCoverageFrom": [
      "**/*.js",
      "!**/node_modules/**",
      "!**/coverage/**",
      "!server.js"
    ]
  }
}
```

#### `.env.test`

```env
NODE_ENV=test
PORT=3001
JWT_SECRET=test_jwt_secret_key_for_testing
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=test_jwt_refresh_secret_key_for_testing
JWT_REFRESH_EXPIRES_IN=7d
SALT_ROUNDS=10
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

---

## Test Structure

```
tests/
└── __tests__/
    ├── auth.test.js          # Integration tests for authentication
    ├── profile.test.js       # Integration tests for profile
    └── authHelper.test.js    # Unit tests for helper functions
```

---

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        ~2.2s
```

---

## Test Coverage

### Integration Tests (18 tests)

**Authentication API (`auth.test.js`)** - 11 tests

- ✅ Register new user successfully
- ✅ Register - fail with duplicate email (409)
- ✅ Register - fail with invalid email (400)
- ✅ Register - fail with weak password (400)
- ✅ Login user successfully
- ✅ Login - fail with wrong password (401)
- ✅ Login - fail with non-existent user (401)
- ✅ Refresh access token successfully
- ✅ Refresh - fail with invalid token (401)
- ✅ Logout user successfully
- ✅ Logout - fail without authentication (401)

**Profile API (`profile.test.js`)** - 7 tests

- ✅ Get current user profile successfully
- ✅ Get profile - fail without authentication (401)
- ✅ Get profile - fail with invalid token (403)
- ✅ Update user name successfully
- ✅ Update user email successfully
- ✅ Update - fail with invalid email format (400)
- ✅ Update - fail without authentication (401)

### Unit Tests (5 tests)

**Auth Helper Functions (`authHelper.test.js`)** - 5 tests

- ✅ Hash password successfully
- ✅ Hash password - fail for weak password
- ✅ Compare password - return true for matching passwords
- ✅ Compare password - return false for non-matching passwords
- ✅ Sanitize user - remove password and refreshTokens

---

## Writing Tests

### Integration Test Example

```javascript
import request from "supertest";
import app from "../../server.js";

describe("Authentication API", () => {
  let accessToken;
  let refreshToken;
  const testUser = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "Test@123",
    role: "User",
  };

  describe("POST /api/users/register", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send(testUser)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data.user).not.toHaveProperty("password");

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });
  });
});
```

### Unit Test Example

```javascript
import { hashPassword, comparePassword } from "../../utils/authHelper.js";

describe("Auth Helper Functions", () => {
  describe("hashPassword", () => {
    test("should hash password successfully", async () => {
      const password = "Test@123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe("comparePassword", () => {
    test("should return true for matching passwords", async () => {
      const password = "Test@123";
      const hashedPassword = await hashPassword(password);
      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(true);
    });
  });
});
```

---

## Test Patterns

### Setup and Teardown

```javascript
describe("Profile API", () => {
  let accessToken;

  beforeAll(async () => {
    // Setup: Register and login to get token
    const registerResponse = await request(app)
      .post("/api/users/register")
      .send(testUser);

    accessToken = registerResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup: Logout user
    await request(app)
      .post("/api/users/logout")
      .set("Authorization", `Bearer ${accessToken}`);
  });

  // Tests here...
});
```

### Testing Protected Endpoints

```javascript
test("should get current user profile", async () => {
  const response = await request(app)
    .get("/api/users/profile")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.success).toBe(true);
  expect(response.body.data.email).toBe(testUser.email);
});
```

### Testing Error Cases

```javascript
test("should fail without authentication", async () => {
  const response = await request(app).get("/api/users/profile").expect(401);

  expect(response.body.message).toBe("No token provided");
});
```

### Testing Validation Errors

```javascript
test("should fail with invalid email format", async () => {
  const response = await request(app)
    .post("/api/users/register")
    .send({
      ...testUser,
      email: "invalid-email",
    })
    .expect(400);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.length).toBeGreaterThan(0);
});
```

---

## Best Practices

### 1. Use Unique Test Data

```javascript
const testUser = {
  name: "Test User",
  email: `test${Date.now()}@example.com`, // Unique email
  password: "Test@123",
  role: "User",
};
```

### 2. Test Both Success and Failure Cases

```javascript
describe("POST /api/users/login", () => {
  test("should login user successfully", async () => {
    // Test success case
  });

  test("should fail with wrong password", async () => {
    // Test failure case
  });
});
```

### 3. Clean Up After Tests

```javascript
afterAll(async () => {
  // Logout and clean up resources
  await request(app)
    .post("/api/users/logout")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ refreshToken });
});
```

### 4. Use Descriptive Test Names

```javascript
// Good
test("should register a new user successfully", async () => {});

// Bad
test("register", async () => {});
```

### 5. Group Related Tests

```javascript
describe("Authentication API", () => {
  describe("POST /api/users/register", () => {
    test("should register a new user successfully", async () => {});
    test("should fail with duplicate email", async () => {});
  });

  describe("POST /api/users/login", () => {
    test("should login user successfully", async () => {});
    test("should fail with wrong password", async () => {});
  });
});
```

---

## Testing Pyramid

```
        /\
       /  \     E2E Tests (Few)
      /    \    - Full user flows
     /------\
    /        \  Integration Tests (Some) ✓ You have these
   /          \ - API endpoints
  /------------\
 /              \ Unit Tests (Many) ✓ You have these
/________________\ - Helper functions
```

**Current Distribution:**

- 78% Integration Tests (18/23)
- 22% Unit Tests (5/23)

**Recommended Distribution:**

- 70% Unit Tests
- 20% Integration Tests
- 10% E2E Tests

---

## Debugging Tests

### Run Specific Test File

```bash
npx jest auth.test.js
```

### Run Specific Test

```bash
npx jest -t "should register a new user"
```

### Show Console Logs

```bash
npm test -- --verbose
```

### Debug with VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Common Issues

### Issue: Tests Failing Due to Timeout

**Solution:** Increase Jest timeout

```javascript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Port Already in Use

**Solution:** Use different port in `.env.test`

```env
PORT=3001
```

### Issue: Tests Interfering with Each Other

**Solution:** Use unique test data per test

```javascript
const testUser = {
  email: `test${Date.now()}@example.com`,
};
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## Next Steps

1. **Increase Unit Test Coverage**: Add more tests for utility functions
2. **Add E2E Tests**: Test complete user workflows
3. **Mock External Dependencies**: Use Jest mocks for external services
4. **Add Performance Tests**: Test API response times
5. **Database Integration Tests**: Test with real database
6. **Test Edge Cases**: Test boundary conditions and edge cases

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
