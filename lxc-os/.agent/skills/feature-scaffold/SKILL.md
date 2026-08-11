---
name: feature-scaffold
description: >
  End-to-end workflow and code templates for building a complete new module in
  LearnXChain — from Prisma schema to sidebar link. Follows the Test-First approach
  by writing tests BEFORE implementation at every layer. Use this skill whenever
  creating a new feature module from scratch.
---

# LearnXChain — Feature Scaffold Skill

> **One skill to build an entire module.** From zero to production in 10 steps.
> Tests are written BEFORE implementation code at every layer.

---

## 🏗️ The 10-Step Module Blueprint

Every new module follows this exact sequence. **DO NOT skip steps.**

```
┌──────────────────────────────────────────────────────────────┐
│  Step  1: DEFINE       → Acceptance criteria & test plan     │
│  Step  2: SCHEMA       → Prisma model + migration            │
│  Step  3: TESTS (API)  → Write failing API tests             │
│  Step  4: VALIDATION   → Zod schemas                         │
│  Step  5: SERVICE      → Business logic (makes tests pass)   │
│  Step  6: API ROUTES   → HTTP handlers (makes tests pass)    │
│  Step  7: DETECT       → Register in detectModule()          │
│  Step  8: FRONTEND     → React Query hooks + UI components   │
│  Step  9: PAGES        → Dashboard page with auth guard      │
│  Step 10: SIDEBAR      → Navigation link + feature flag      │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 1: DEFINE — Acceptance Criteria

Before touching any code, answer these questions:

```markdown
## Feature: [Module Name]

### What does it do?
[2-3 sentence description]

### Who uses it?
- Roles: [admin, teacher, student, etc.]

### Core Operations (CRUD+)
- [ ] Create / Add
- [ ] List / Search (paginated)
- [ ] View Details
- [ ] Update / Edit
- [ ] Delete / Deactivate
- [ ] Bulk operations (import/export)
- [ ] Reports / Analytics

### Test Plan
- [ ] API: Happy path for each operation
- [ ] API: Input validation (400 errors)
- [ ] API: Auth/role checks (401/403)
- [ ] API: Not found (404)
- [ ] API: Server errors (500)
- [ ] Service: Business rule enforcement
- [ ] UI: Loading states
- [ ] UI: Error states
- [ ] UI: Empty states
```

---

## Step 2: SCHEMA — Prisma Model + Migration

### Template: New Prisma Model
```prisma
// prisma/schema.prisma — add at the end

model FeatureName {
  id          String    @id @default(cuid())
  
  // ─── Core Fields ──────────────────────────
  name        String
  description String?
  status      String    @default("active")
  
  // ─── Multi-Tenant Scope (MANDATORY) ───────
  schoolId    String
  school      School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  
  // ─── Audit Fields ─────────────────────────
  createdBy   String?
  updatedBy   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // ─── Indexes ──────────────────────────────
  @@index([schoolId])
  @@index([schoolId, status])
  @@map("feature_names")  // snake_case table name
}
```

### Run Migration
```powershell
# From project root
npx prisma migrate dev --name "add_feature_name_model"
npx prisma generate
```

### Checklist After Schema
- [ ] `schoolId` relation to `School` model with `onDelete: Cascade`
- [ ] `@@index([schoolId])` for tenant scoping performance
- [ ] `@@map("snake_case_table")` for PostgreSQL naming convention
- [ ] `createdAt` / `updatedAt` audit fields
- [ ] All relations have proper `onDelete` behavior
- [ ] `npx prisma generate` ran without errors

---

## Step 3: TESTS (API) — Write Failing Tests FIRST

> **Tests MUST be written BEFORE Step 4-6 (validation, service, API).**

### Create Test File
```typescript
// __tests__/api/v1/[module]/create.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockApiRequest,
  createMockApiResponse,
  createMockUser,
} from '@tests/helpers/test-factory';
import { mockPrisma } from '@tests/helpers/mock-prisma';
import { mockLogger } from '@tests/helpers/mock-externals';

// Setup
mockLogger();
const { prismaMock } = mockPrisma();
const mockUser = createMockUser({ role: 'admin' as any });

vi.mock('@/lib/middleware/api-guard', () => ({
  withAuth: (handler: Function) => async (req: any, res: any) => {
    req.user = mockUser;
    return handler(req, res);
  },
}));

// Import AFTER all mocks
const { default: handler } = await import('@/pages/api/v1/[module]/create');

describe('POST /api/v1/[module]/create', () => {
  let req: any, res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = createMockApiRequest({ method: 'POST' });
    res = createMockApiResponse();
  });

  it('should create and return 200', async () => {
    req.body = { name: 'Test Item' };
    prismaMock.featureName.create.mockResolvedValue({ id: '1', name: 'Test Item' });
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
  });

  it('should return 400 for empty name', async () => {
    req.body = { name: '' };
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('should return 405 for GET request', async () => {
    req.method = 'GET';
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('should scope to user schoolId', async () => {
    req.body = { name: 'Test' };
    prismaMock.featureName.create.mockResolvedValue({ id: '1' });
    await handler(req, res);
    expect(prismaMock.featureName.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ schoolId: mockUser.schoolId }),
      })
    );
  });
});
```

### Also create list and update test files
Follow the same pattern for:
- `__tests__/api/v1/[module]/list.test.ts`
- `__tests__/api/v1/[module]/update.test.ts`
- `__tests__/api/v1/[module]/delete.test.ts`
- `__tests__/services/[module]-service.test.ts`

---

## Step 4: VALIDATION — Zod Schemas

```typescript
// lib/validations/[module].ts
import { z } from 'zod';

// ─── Create Schema ──────────────────────────────────────
export const CreateFeatureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().max(500).optional(),
  // Add domain-specific fields below
});

// ─── Update Schema ──────────────────────────────────────
export const UpdateFeatureSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ─── List/Filter Schema ─────────────────────────────────
export const ListFeatureSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Delete Schema ──────────────────────────────────────
export const DeleteFeatureSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

// ─── Type Exports ───────────────────────────────────────
export type CreateFeatureInput = z.infer<typeof CreateFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof UpdateFeatureSchema>;
export type ListFeatureInput = z.infer<typeof ListFeatureSchema>;
```

---

## Step 5: SERVICE — Business Logic

```typescript
// lib/services/[module]-service.ts
import { prisma } from '@/lib/prisma';
import Logger from '@/lib/utils/logger';
import type { CreateFeatureInput, UpdateFeatureInput, ListFeatureInput } from '@/lib/validations/[module]';

export class FeatureService {
  /**
   * Create a new feature record scoped to school.
   */
  static async create(schoolId: string, data: CreateFeatureInput, userId?: string) {
    try {
      const record = await prisma.featureName.create({
        data: {
          ...data,
          schoolId,
          createdBy: userId,
        },
      });
      Logger.info(`[FeatureService.create] Created ${record.id} for school ${schoolId}`);
      return record;
    } catch (error: any) {
      Logger.error(`[FeatureService.create] Failed: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  /**
   * List features with pagination, search, and sorting.
   */
  static async getList(schoolId: string, options: ListFeatureInput) {
    const { page, limit, search, status, sortBy, sortOrder } = options;

    const where: any = { schoolId };
    if (status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [data, total] = await Promise.all([
        prisma.featureName.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.featureName.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      Logger.error(`[FeatureService.getList] Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single record by ID (scoped to school).
   */
  static async getById(schoolId: string, id: string) {
    const record = await prisma.featureName.findFirst({
      where: { id, schoolId },
    });
    if (!record) return null;
    return record;
  }

  /**
   * Update a record.
   */
  static async update(schoolId: string, data: UpdateFeatureInput, userId?: string) {
    const { id, ...updateData } = data;

    // Verify ownership
    const existing = await prisma.featureName.findFirst({ where: { id, schoolId } });
    if (!existing) return null;

    try {
      const updated = await prisma.featureName.update({
        where: { id },
        data: { ...updateData, updatedBy: userId },
      });
      Logger.info(`[FeatureService.update] Updated ${id} for school ${schoolId}`);
      return updated;
    } catch (error: any) {
      Logger.error(`[FeatureService.update] Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soft-delete (deactivate) a record.
   */
  static async delete(schoolId: string, id: string) {
    const existing = await prisma.featureName.findFirst({ where: { id, schoolId } });
    if (!existing) return null;

    try {
      await prisma.featureName.update({
        where: { id },
        data: { status: 'inactive' },
      });
      Logger.info(`[FeatureService.delete] Deactivated ${id} for school ${schoolId}`);
      return true;
    } catch (error: any) {
      Logger.error(`[FeatureService.delete] Failed: ${error.message}`);
      throw error;
    }
  }
}
```

---

## Step 6: API ROUTES — HTTP Handlers

```typescript
// pages/api/v1/[module]/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { CreateFeatureSchema } from '@/lib/validations/[module]';
import { FeatureService } from '@/lib/services/[module]-service';
import Logger from '@/lib/utils/logger';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = CreateFeatureSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const user = (req as any).user;
    const result = await FeatureService.create(user.schoolId, parsed.data, user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    Logger.error(`[API][FeatureName] Create failed: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: 'Internal server error' });
  }
}, [Role.admin]);
```

```typescript
// pages/api/v1/[module]/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { ListFeatureSchema } from '@/lib/validations/[module]';
import { FeatureService } from '@/lib/services/[module]-service';
import Logger from '@/lib/utils/logger';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = ListFeatureSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const user = (req as any).user;
    const result = await FeatureService.getList(user.schoolId, parsed.data);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    Logger.error(`[API][FeatureName] List failed: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: 'Internal server error' });
  }
}, [Role.admin, Role.teacher]);
```

---

## Step 7: DETECT — Register Module

```typescript
// In lib/middleware/api-guard.ts → detectModule() function
// Add this line:
if (path.includes("/api/v1/feature-name")) return "Feature Name";
```

---

## Step 8: FRONTEND — React Query Hook + UI

### React Query Hook
```typescript
// hooks/use[Module].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

const QUERY_KEY = 'feature-name';

export function useFeatureList(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: () => axios.get('/api/v1/feature-name/list', { params }).then(r => r.data),
    staleTime: 30_000,
  });
}

export function useCreateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => axios.post('/api/v1/feature-name/create', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create');
    },
  });
}

export function useUpdateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => axios.put('/api/v1/feature-name/update', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to update');
    },
  });
}
```

---

## Step 9: PAGES — Dashboard Page

```tsx
// pages/dashboard/admin/[module]/index.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { Role } from '@prisma/client';
import { useFeatureList } from '@/hooks/useFeatureName';
import { useState } from 'react';

interface Props {
  user: { id: string; name: string; role: string; schoolId: string };
}

export default function FeatureNamePage({ user }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFeatureList({ page, limit: 10 });

  return (
    <DashboardLayout role={user.role as any}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Name</h1>
          {/* Add create button here */}
        </div>

        {isLoading && <div className="animate-pulse">Loading...</div>}
        {error && <div className="text-red-500">Failed to load data</div>}
        {data?.data && (
          /* Render data table */
          <div>{JSON.stringify(data.data)}</div>
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user) return { redirect: { destination: '/login', permanent: false } };

  const user = session.user as any;
  if (user.role !== Role.admin) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  return { props: { user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId } } };
};
```

---

## Step 10: SIDEBAR — Navigation Link + Feature Flag

### 10a. Add to Dashboard Config
```typescript
// components/dashboard/config/dashboardConfig.ts
// Add a new section under the admin config:
{
  label: 'Feature Name',
  icon: 'LayoutGrid',  // lucide-react icon name
  items: [
    { label: 'Overview', href: '/dashboard/admin/feature-name', icon: 'List' },
    { label: 'Add New', href: '/dashboard/admin/feature-name/create', icon: 'Plus' },
  ],
}
```

### 10b. Sync Feature Key
```typescript
// lib/utils/sidebarFeatureSync.ts
// The label "Feature Name" auto-converts to feature key: "FEATURE_NAME"
// Verify this mapping exists or add it manually
```

### 10c. Register in Feature Catalog (Superadmin)
Add the feature to the `FEATURE_CATALOG` so superadmins can enable/disable it per school.

---

## 📋 Quick Reference — Files Created Per Module

| Layer | File Path | Template |
|---|---|---|
| Schema | `prisma/schema.prisma` | Step 2 |
| Tests | `__tests__/api/v1/[module]/*.test.ts` | Step 3 |
| Tests | `__tests__/services/[module]-service.test.ts` | Step 3 |
| Validation | `lib/validations/[module].ts` | Step 4 |
| Service | `lib/services/[module]-service.ts` | Step 5 |
| API Create | `pages/api/v1/[module]/create.ts` | Step 6 |
| API List | `pages/api/v1/[module]/list.ts` | Step 6 |
| API Update | `pages/api/v1/[module]/update.ts` | Step 6 |
| API Delete | `pages/api/v1/[module]/delete.ts` | Step 6 |
| Hook | `hooks/use[Module].ts` | Step 8 |
| Page | `pages/dashboard/admin/[module]/index.tsx` | Step 9 |
| Sidebar | `components/dashboard/config/dashboardConfig.ts` | Step 10 |

> **Total: 12+ files per module.** TDD ensures every one of them works correctly from day one.
