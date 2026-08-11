---
name: test-first-development
description: >
  Enforces a Test-First (TDD) development workflow for LearnXChain. Every feature
  must have failing tests written BEFORE any implementation code is created. Includes
  test templates for API endpoints, services, components, and integration flows.
  Uses Vitest as the test runner with project-specific patterns.
---

# LearnXChain — Test-First Development Skill

> **RED → GREEN → REFACTOR.** Write a failing test. Write the minimum code to pass it. Clean up. Repeat.
> This skill is the LAW for every new feature in this project.

---

## 🧪 The TDD Workflow (MANDATORY)

Every new feature MUST follow this exact sequence:

```
┌──────────────────────────────────────────────────────────────┐
│  1. UNDERSTAND  → Read the requirement, define acceptance    │
│                   criteria as test cases                     │
│  2. RED         → Write failing tests FIRST                  │
│  3. GREEN       → Write MINIMUM code to pass all tests       │
│  4. REFACTOR    → Clean up, optimize, document               │
│  5. VERIFY      → Run full test suite, check coverage        │
└──────────────────────────────────────────────────────────────┘
```

### Phase 1: UNDERSTAND (Before Writing Anything)
1. Define what the feature does in plain language
2. List the **acceptance criteria** as bullet points
3. Convert each criterion into a test case name:
   - ✅ Happy path (expected behavior)
   - ❌ Invalid input (400)
   - 🔒 Unauthorized access (401)
   - 🚫 Forbidden role (403)
   - 🔍 Resource not found (404)
   - 💥 Server error handling (500)

### Phase 2: RED (Write Failing Tests)
- Create test files BEFORE implementation files
- Tests MUST fail initially (Red phase)
- Each test should be small, focused, and test ONE thing
- Use descriptive test names: `should return 401 when no auth token provided`

### Phase 3: GREEN (Minimum Implementation)
- Write the MINIMUM code needed to pass each test
- Do NOT over-engineer — just make the tests pass
- Commit after each test goes green (atomic commits)

### Phase 4: REFACTOR (Clean Up)
- Extract reusable logic into helper functions
- Improve naming, add JSDoc comments
- Ensure code follows `learnxchain-senior-architect` patterns
- Tests MUST still pass after refactoring

### Phase 5: VERIFY (Final Check)
- Run full test suite: `npm test`
- Check for regressions in related modules
- Verify test coverage meets minimum thresholds

---

## 🛠️ Test Framework Setup

### Required Dependencies
```powershell
# Install test framework (run from project root)
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### Vitest Configuration
```typescript
// vitest.config.ts (project root)
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'node',              // Default: node for API/service tests
    environmentMatchGlobs: [
      ['**/*.component.test.{ts,tsx}', 'jsdom'],  // jsdom for component tests
      ['**/*.ui.test.{ts,tsx}', 'jsdom'],
    ],
    include: [
      '__tests__/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'components/**/*.test.{ts,tsx}',
    ],
    exclude: ['node_modules', '.next', 'lxc-app'],
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/services/**', 'pages/api/**', 'components/**'],
      exclude: ['node_modules', '__tests__', '*.config.*'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

### Test Setup File
```typescript
// __tests__/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/learnxchain_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Global test lifecycle hooks
beforeAll(() => {
  // Setup that runs once before all tests
});

afterEach(() => {
  // Cleanup after each test (reset mocks, etc.)
});

afterAll(() => {
  // Teardown after all tests complete
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 📁 Test File Organization

```
LearnXChain/
├── __tests__/
│   ├── setup.ts                          → Global test setup
│   ├── helpers/
│   │   ├── test-factory.ts               → Test data factories (Faker.js)
│   │   ├── mock-auth.ts                  → Auth mocking utilities
│   │   ├── mock-prisma.ts                → Prisma mock setup
│   │   └── mock-externals.ts             → External service mocks (MSG91, Razorpay, SES)
│   ├── api/
│   │   ├── v1/
│   │   │   ├── student/
│   │   │   │   ├── create.test.ts        → POST /api/v1/student/create
│   │   │   │   ├── list.test.ts          → GET /api/v1/student/list
│   │   │   │   └── update.test.ts        → PUT /api/v1/student/update
│   │   │   ├── finance/
│   │   │   │   ├── create-invoice.test.ts
│   │   │   │   └── payment.test.ts
│   │   │   └── [module]/
│   │   │       └── [action].test.ts
│   ├── services/
│   │   ├── student-service.test.ts       → Unit tests for StudentService
│   │   ├── finance-service.test.ts
│   │   └── [module]-service.test.ts
│   └── components/
│       ├── ui/
│       │   ├── button.component.test.tsx
│       │   └── data-table.component.test.tsx
│       └── dashboard/
│           ├── admin/
│           │   └── student-list.component.test.tsx
│           └── shared/
│               └── stats-card.component.test.tsx
```

### Naming Conventions
| Test Type | File Pattern | Environment |
|---|---|---|
| API endpoint | `__tests__/api/v1/[module]/[action].test.ts` | `node` |
| Service unit | `__tests__/services/[module]-service.test.ts` | `node` |
| Component | `__tests__/components/[path].component.test.tsx` | `jsdom` |
| Integration | `__tests__/integration/[flow].integration.test.ts` | `node` |
| E2E | `__tests__/e2e/[flow].e2e.test.ts` | `node` |

---

## 🏭 Test Data Factory (`@faker-js/faker`)

> **ALWAYS** use factories for test data. NEVER hardcode test values inline.

```typescript
// __tests__/helpers/test-factory.ts
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

// ─── User Factory ───────────────────────────────────────
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: faker.string.cuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role: Role.admin,
    schoolId: faker.string.cuid(),
    ...overrides,
  };
}

// ─── Student Factory ────────────────────────────────────
export function createMockStudent(overrides: Partial<any> = {}) {
  return {
    id: faker.string.cuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: `9${faker.string.numeric(9)}`,
    rollNumber: faker.string.alphanumeric(6).toUpperCase(),
    classId: faker.string.cuid(),
    sectionId: faker.string.cuid(),
    schoolId: faker.string.cuid(),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── School Factory ─────────────────────────────────────
export function createMockSchool(overrides: Partial<any> = {}) {
  return {
    id: faker.string.cuid(),
    name: faker.company.name() + ' School',
    code: faker.string.alphanumeric(6).toUpperCase(),
    email: faker.internet.email(),
    phone: `9${faker.string.numeric(9)}`,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    pincode: faker.string.numeric(6),
    isActive: true,
    ...overrides,
  };
}

// ─── API Request/Response Helpers ───────────────────────
export function createMockApiRequest(overrides: Partial<any> = {}) {
  return {
    method: 'GET',
    headers: {},
    query: {},
    body: {},
    ...overrides,
  } as any;
}

export function createMockApiResponse() {
  const res: any = {
    statusCode: 200,
    _json: null,
    status: function (code: number) {
      this.statusCode = code;
      return this;
    },
    json: function (data: any) {
      this._json = data;
      return this;
    },
    setHeader: function () { return this; },
    end: function () { return this; },
  };
  return res;
}

// ─── Type Definitions ───────────────────────────────────
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId: string;
  [key: string]: any;
}
```

---

## 🔒 Auth Mocking

```typescript
// __tests__/helpers/mock-auth.ts
import { vi } from 'vitest';
import { createMockUser } from './test-factory';

/**
 * Mock the withAuth HOF to bypass authentication in tests.
 * Pass a mock user to simulate an authenticated request.
 */
export function mockWithAuth(mockUser = createMockUser()) {
  vi.mock('@/lib/middleware/api-guard', () => ({
    withAuth: (handler: Function, _roles?: string[]) => {
      return async (req: any, res: any) => {
        // Inject mock user into request (simulates withAuth behavior)
        (req as any).user = mockUser;
        return handler(req, res);
      };
    },
  }));
  return mockUser;
}

/**
 * Mock NextAuth session for getServerSideProps tests
 */
export function mockSession(user = createMockUser()) {
  vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn().mockResolvedValue({
      user,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  }));
  return user;
}
```

---

## 🔌 External Service Mocking

> **Rule**: ALWAYS mock external services. NEVER call real APIs in tests.

```typescript
// __tests__/helpers/mock-externals.ts
import { vi } from 'vitest';

/**
 * Mock MSG91 (WhatsApp/SMS) — never send real messages in tests
 */
export function mockMsg91() {
  vi.mock('@/lib/services/msg91-service', () => ({
    MSG91Service: {
      sendWhatsapp: vi.fn().mockResolvedValue({ success: true }),
      sendSms: vi.fn().mockResolvedValue({ success: true }),
    },
  }));
}

/**
 * Mock Razorpay — never process real payments in tests
 */
export function mockRazorpay() {
  vi.mock('razorpay', () => ({
    default: vi.fn().mockImplementation(() => ({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: 'order_test_123',
          amount: 10000,
          currency: 'INR',
          status: 'created',
        }),
      },
      payments: {
        fetch: vi.fn().mockResolvedValue({
          id: 'pay_test_123',
          status: 'captured',
          amount: 10000,
        }),
      },
    })),
  }));
}

/**
 * Mock Email Service (AWS SES / SendGrid / Nodemailer)
 */
export function mockEmailService() {
  vi.mock('@/lib/services/emailService', () => ({
    EmailService: {
      send: vi.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
      sendWithTemplate: vi.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
    },
  }));
}

/**
 * Mock Cloudinary — never upload real files in tests
 */
export function mockCloudinary() {
  vi.mock('cloudinary', () => ({
    v2: {
      config: vi.fn(),
      uploader: {
        upload: vi.fn().mockResolvedValue({
          secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
          public_id: 'test-public-id',
        }),
        destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
  }));
}

/**
 * Mock Winston Logger — suppress log output in tests
 */
export function mockLogger() {
  vi.mock('@/lib/utils/logger', () => ({
    default: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  }));
}
```

---

## 🔌 Prisma Mocking

```typescript
// __tests__/helpers/mock-prisma.ts
import { vi } from 'vitest';

/**
 * Creates a deeply-mocked Prisma client.
 * Each model method is a vi.fn() that you can configure per-test.
 *
 * Usage:
 *   const { prismaMock } = mockPrisma();
 *   prismaMock.student.findMany.mockResolvedValue([...]);
 */
export function mockPrisma() {
  const createModelMock = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((args: any) => Promise.resolve({ id: 'new-id', ...args.data })),
    update: vi.fn().mockImplementation((args: any) => Promise.resolve({ ...args.data })),
    delete: vi.fn().mockResolvedValue({}),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation((args: any) => Promise.resolve({ ...args.create })),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    aggregate: vi.fn().mockResolvedValue({}),
    groupBy: vi.fn().mockResolvedValue([]),
  });

  const prismaMock: any = {
    student: createModelMock(),
    teacher: createModelMock(),
    user: createModelMock(),
    school: createModelMock(),
    class: createModelMock(),
    section: createModelMock(),
    subject: createModelMock(),
    attendance: createModelMock(),
    fee: createModelMock(),
    invoice: createModelMock(),
    payment: createModelMock(),
    notification: createModelMock(),
    book: createModelMock(),
    hostelRoom: createModelMock(),
    transport: createModelMock(),
    // Add more models as needed
    $transaction: vi.fn().mockImplementation((fn: Function) => fn(prismaMock)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
  }));

  return { prismaMock };
}
```

---

## 📝 Test Templates

### Template 1: API Endpoint Test (Most Common)

```typescript
// __tests__/api/v1/[module]/[action].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockApiRequest, createMockApiResponse, createMockUser } from '@tests/helpers/test-factory';
import { mockPrisma } from '@tests/helpers/mock-prisma';
import { mockLogger } from '@tests/helpers/mock-externals';

// ─── Setup ──────────────────────────────────────────────
mockLogger();
const { prismaMock } = mockPrisma();

// Mock auth BEFORE importing the handler
const mockUser = createMockUser({ role: 'admin' as any });
vi.mock('@/lib/middleware/api-guard', () => ({
  withAuth: (handler: Function) => {
    return async (req: any, res: any) => {
      req.user = mockUser;
      return handler(req, res);
    };
  },
}));

// Import AFTER mocks are set up
const { default: handler } = await import('@/pages/api/v1/[module]/[action]');

// ─── Tests ──────────────────────────────────────────────
describe('POST /api/v1/[module]/[action]', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = createMockApiRequest({ method: 'POST' });
    res = createMockApiResponse();
  });

  // ✅ Happy Path
  it('should create resource and return 200 with data', async () => {
    req.body = { name: 'Test Resource', /* ... */ };
    prismaMock.[model].create.mockResolvedValue({ id: '1', name: 'Test Resource' });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._json).toEqual({
      success: true,
      data: expect.objectContaining({ id: '1', name: 'Test Resource' }),
    });
  });

  // ❌ Invalid Input (400)
  it('should return 400 for invalid input', async () => {
    req.body = { name: '' }; // Empty name should fail Zod validation

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._json).toHaveProperty('error');
  });

  // 🚫 Wrong HTTP Method (405)
  it('should return 405 for unsupported method', async () => {
    req.method = 'GET'; // Handler expects POST

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._json).toEqual({ error: 'Method not allowed' });
  });

  // 🔍 Resource Not Found (404)
  it('should return 404 when resource does not exist', async () => {
    req.body = { id: 'non-existent-id' };
    prismaMock.[model].findUnique.mockResolvedValue(null);

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._json).toHaveProperty('error');
  });

  // 💥 Database Error (500)
  it('should return 500 when database throws', async () => {
    req.body = { name: 'Valid Name' };
    prismaMock.[model].create.mockRejectedValue(new Error('DB connection failed'));

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._json).toEqual({ error: 'Internal server error' });
  });

  // 🔒 SchoolId Scoping
  it('should scope query to authenticated user schoolId', async () => {
    req.body = { name: 'Test' };
    prismaMock.[model].create.mockResolvedValue({ id: '1' });

    await handler(req, res);

    expect(prismaMock.[model].create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          schoolId: mockUser.schoolId,
        }),
      })
    );
  });
});
```

---

### Template 2: Service Layer Unit Test

```typescript
// __tests__/services/[module]-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma } from '@tests/helpers/mock-prisma';
import { mockLogger } from '@tests/helpers/mock-externals';
import { createMockStudent, createMockUser } from '@tests/helpers/test-factory';

// Setup mocks
mockLogger();
const { prismaMock } = mockPrisma();

// Import service AFTER mocks
const { StudentService } = await import('@/lib/services/student-service');

describe('StudentService', () => {
  const schoolId = 'school-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getList()', () => {
    it('should return students paginated with total count', async () => {
      const mockStudents = [createMockStudent(), createMockStudent()];
      prismaMock.student.findMany.mockResolvedValue(mockStudents);
      prismaMock.student.count.mockResolvedValue(50);

      const result = await StudentService.getList(schoolId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(50);
      // Verify schoolId scoping
      expect(prismaMock.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ schoolId }),
        })
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.student.findMany.mockResolvedValue([]);
      prismaMock.student.count.mockResolvedValue(0);

      await StudentService.getList(schoolId, { page: 3, limit: 20 });

      expect(prismaMock.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,  // (3-1) * 20
          take: 20,
        })
      );
    });

    it('should throw when database fails', async () => {
      prismaMock.student.findMany.mockRejectedValue(new Error('Connection lost'));

      await expect(
        StudentService.getList(schoolId, { page: 1, limit: 10 })
      ).rejects.toThrow('Connection lost');
    });
  });
});
```

---

### Template 3: Frontend Component Test

```typescript
// __tests__/components/dashboard/[module].component.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useAuth hook
vi.mock('@/lib/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin', role: 'admin', schoolId: 's1' },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock useTheme hook (SSR safety)
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    mounted: true,  // Always true in tests (simulates client)
  }),
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

import { useQuery } from '@tanstack/react-query';
// import YourComponent from '@/components/dashboard/admin/YourComponent';

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton when data is loading', () => {
    (useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    // render(<YourComponent />);
    // expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should display data table when data loads', async () => {
    (useQuery as any).mockReturnValue({
      data: { success: true, data: [{ id: '1', name: 'Item' }] },
      isLoading: false,
      error: null,
    });

    // render(<YourComponent />);
    // expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('should show error toast when API fails', async () => {
    (useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    // render(<YourComponent />);
    // expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should NOT render theme-dependent UI without mounted check', () => {
    // This test ensures the component follows the mounted pattern
    // Re-mock with mounted = false
    vi.mocked(require('@/hooks/useTheme').useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
      mounted: false,
    });

    // render(<YourComponent />);
    // The component should return null or a skeleton
  });
});
```

---

## ✅ Test Checklist (Use for Every Feature)

Before marking any test file as complete, verify:

### API Endpoint Tests
- [ ] Happy path returns `{ success: true, data: ... }` with HTTP 200
- [ ] Invalid input returns `{ error: "..." }` with HTTP 400
- [ ] Missing auth returns HTTP 401
- [ ] Wrong role returns HTTP 403
- [ ] Missing resource returns HTTP 404
- [ ] Wrong HTTP method returns HTTP 405
- [ ] Database error returns HTTP 500
- [ ] `schoolId` is always scoped from `req.user.schoolId`
- [ ] Pagination uses `skip`/`take` correctly
- [ ] Zod validation catches edge cases (empty strings, XSS, SQL injection attempts)

### Service Layer Tests
- [ ] Returns correct data shape for happy path
- [ ] Handles empty results gracefully
- [ ] Throws on database errors (re-throws for API handler to catch)
- [ ] Logger is called on errors
- [ ] `schoolId` scoping is enforced
- [ ] Parallel queries use `Promise.all()` (not sequential `await`)

### Component Tests
- [ ] Shows loading skeleton during data fetch
- [ ] Displays data correctly when loaded
- [ ] Shows error state on API failure
- [ ] Respects `mounted` pattern (returns null/skeleton before mount)
- [ ] Role-restricted elements are hidden for unauthorized roles
- [ ] Form validation shows inline errors
- [ ] Submit button is disabled during submission
- [ ] Toast messages appear on success/error

---

## 🚀 Running Tests

```powershell
# Run all tests
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npx vitest run __tests__/api/v1/student/create.test.ts

# Run tests matching a pattern
npx vitest run --grep "should return 400"

# Run only API tests
npx vitest run __tests__/api/

# Run only service tests
npx vitest run __tests__/services/
```

---

## ⚠️ Anti-Patterns (NEVER DO THIS)

```typescript
// ❌ WRONG: Writing implementation before tests
// Step 1: Create the service → Step 2: Create the API → Step 3: Maybe write some tests later
// This defeats the entire purpose of TDD

// ❌ WRONG: Testing implementation details
it('should call prisma.student.findMany', () => { ... });
// Instead test the OUTPUT and BEHAVIOR

// ❌ WRONG: Hardcoded test data
const student = { id: 'abc123', name: 'John Doe', email: 'john@test.com' };
// Instead: use test factories
const student = createMockStudent();

// ❌ WRONG: Calling real external services
await MSG91Service.sendWhatsapp(...); // This sends a real message!
// Instead: mock everything external

// ❌ WRONG: Skipping error cases
describe('createStudent', () => {
  it('should create a student', () => { ... }); // Only happy path
});
// Always test error paths too (400, 404, 500)

// ❌ WRONG: Giant test files with no organization
it('test 1', () => { ... });
it('test 2', () => { ... });
// Instead: use describe() blocks to group related tests
```

---

## 📊 Coverage Targets

| Layer | Minimum Coverage | Ideal Coverage |
|---|---|---|
| Service Layer | 80% | 95% |
| API Endpoints | 70% | 90% |
| UI Components | 60% | 80% |
| Utility Functions | 90% | 100% |

> Coverage is a guide, not a goal. **100% coverage with bad tests is worse than 70% coverage with great tests.**

---

## 🔄 Integration with Feature Development

When the `feature-scaffold` skill is used to create a new module, tests are the **SECOND step** (right after the Prisma schema):

```
1. Schema    → prisma/schema.prisma
2. TESTS     → __tests__/api/v1/[module]/*.test.ts   ← BEFORE implementation
               __tests__/services/[module]-service.test.ts
3. Validation → lib/validations/[module].ts
4. Service   → lib/services/[module]-service.ts       ← Makes tests pass
5. API Route → pages/api/v1/[module]/[action].ts      ← Makes tests pass
6. Frontend  → components + pages                     
```

This ensures every feature is born with a safety net of tests.
