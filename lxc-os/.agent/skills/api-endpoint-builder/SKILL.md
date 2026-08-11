---
name: api-endpoint-builder
description: >
  Step-by-step guide for creating bulletproof API endpoints in LearnXChain.
  Covers handler templates, HTTP conventions, error handling, file uploads,
  bulk operations, rate limiting, and the detectModule() registration process.
  Use this skill when building or modifying any API route.
---

# LearnXChain — API Endpoint Builder Skill

> **Every API route is a thin controller.** It validates input, delegates to a service,
> and returns a consistent response. No business logic lives here.

---

## 🏗️ API Endpoint Creation Checklist

```
┌──────────────────────────────────────────────────────────────┐
│  1. CREATE TEST FILE (TDD)  → __tests__/api/v1/[module]/    │
│  2. CREATE ZOD SCHEMA       → lib/validations/[module].ts   │
│  3. CREATE SERVICE METHOD   → lib/services/[module]-svc.ts  │
│  4. CREATE HANDLER FILE     → pages/api/v1/[module]/[act].ts│
│  5. REGISTER IN detectModule() → lib/middleware/api-guard.ts │
│  6. TEST & VERIFY           → npm test                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Handler Templates

### Template A: Single-Method Handler (Most Common)

```typescript
// pages/api/v1/[module]/[action].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { CreateSchema } from '@/lib/validations/[module]';
import { ModuleService } from '@/lib/services/[module]-service';
import Logger from '@/lib/utils/logger';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  // ─── Method Guard ───────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Input Validation ──────────────────────────────
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  // ─── Delegate to Service ───────────────────────────
  try {
    const user = (req as any).user;
    const result = await ModuleService.create(user.schoolId, parsed.data, user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    Logger.error(`[API][Module] Action failed: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: 'Internal server error' });
  }
}, [Role.admin]);
```

### Template B: Multi-Method Handler (REST-Style)

```typescript
// pages/api/v1/[module]/[id].ts — handles GET, PUT, DELETE by ID
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { UpdateSchema } from '@/lib/validations/[module]';
import { ModuleService } from '@/lib/services/[module]-service';
import Logger from '@/lib/utils/logger';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  const user = (req as any).user;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }

  switch (req.method) {
    case 'GET': {
      const record = await ModuleService.getById(user.schoolId, id);
      if (!record) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ success: true, data: record });
    }

    case 'PUT': {
      const parsed = UpdateSchema.safeParse({ ...req.body, id });
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        });
      }
      try {
        const updated = await ModuleService.update(user.schoolId, parsed.data, user.id);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ success: true, data: updated });
      } catch (error: any) {
        Logger.error(`[API][Module] Update failed: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'DELETE': {
      try {
        const deleted = await ModuleService.delete(user.schoolId, id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ success: true, data: { deleted: true } });
      } catch (error: any) {
        Logger.error(`[API][Module] Delete failed: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}, [Role.admin]);
```

### Template C: List Handler with Pagination & Search

```typescript
// pages/api/v1/[module]/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { ListSchema } from '@/lib/validations/[module]';
import { ModuleService } from '@/lib/services/[module]-service';
import Logger from '@/lib/utils/logger';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse query params with Zod (uses z.coerce for numbers)
  const parsed = ListSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const user = (req as any).user;
    const result = await ModuleService.getList(user.schoolId, parsed.data);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    Logger.error(`[API][Module] List failed: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}, [Role.admin, Role.teacher]);
```

### Template D: File Upload Handler

```typescript
// pages/api/v1/[module]/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import Logger from '@/lib/utils/logger';

// Disable Next.js body parser — formidable handles the stream
export const config = { api: { bodyParser: false } };

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({ maxFileSize: 5 * 1024 * 1024 }); // 5MB
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file provided' });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: `learnxchain/[module]`,
      resource_type: 'auto',
    });

    return res.status(200).json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error: any) {
    Logger.error(`[API][Module] Upload failed: ${error.message}`);
    return res.status(500).json({ error: 'Upload failed' });
  }
}, [Role.admin]);
```

### Template E: Bulk Operation (CSV Import)

```typescript
// pages/api/v1/[module]/bulk-import.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/api-guard';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import Logger from '@/lib/utils/logger';

const BulkImportSchema = z.object({
  records: z.array(z.object({
    name: z.string().min(1),
    // ... fields
  })).min(1).max(500), // Cap at 500 records per batch
});

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = BulkImportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
  }

  try {
    const user = (req as any).user;

    // Bulk create with schoolId injection
    const result = await prisma.featureName.createMany({
      data: parsed.data.records.map(r => ({
        ...r,
        schoolId: user.schoolId,
        createdBy: user.id,
      })),
      skipDuplicates: true,
    });

    Logger.info(`[API][Module] Bulk imported ${result.count} records for school ${user.schoolId}`);
    return res.status(200).json({ success: true, data: { imported: result.count } });
  } catch (error: any) {
    Logger.error(`[API][Module] Bulk import failed: ${error.message}`);
    return res.status(500).json({ error: 'Bulk import failed' });
  }
}, [Role.admin]);
```

---

## 📊 HTTP Method Conventions

| Action | Method | Path | Description |
|---|---|---|---|
| List | `GET` | `/api/v1/[module]/list` | Paginated list with filters |
| Get One | `GET` | `/api/v1/[module]/[id]` | Single record by ID |
| Create | `POST` | `/api/v1/[module]/create` | Create new record |
| Update | `PUT` | `/api/v1/[module]/update` | Update existing record |
| Delete | `DELETE` | `/api/v1/[module]/delete` | Delete/deactivate record |
| Bulk Create | `POST` | `/api/v1/[module]/bulk-import` | Import multiple records |
| Bulk Update | `POST` | `/api/v1/[module]/bulk-update` | Update multiple records |
| Export | `GET` | `/api/v1/[module]/export` | CSV/Excel export |
| Stats | `GET` | `/api/v1/[module]/stats` | Aggregated analytics |

---

## 📦 Standard Response Shapes

```typescript
// ─── Success Response ───────────────────────────────
{ success: true, data: { ... } }
// Single record: data is the object
// List: data = { data: [...], total, page, limit, totalPages }

// ─── Error Response (Client Error: 400-499) ────────
{ error: "Human-readable error message" }
// With validation details:
{ error: "Validation failed", details: { name: ["Too short"], email: ["Invalid"] } }

// ─── Error Response (Server Error: 500) ─────────────
{ error: "Internal server error" }
// Never expose stack traces or internal details to the client

// ─── Subscription Error (402) ───────────────────────
{ error: "Payment Required", message: "Your subscription has expired.", reason: "expired" }
// Handled automatically by withAuth() — never implement this manually
```

---

## 🔐 Security Checklist (Per Endpoint)

Before deploying any endpoint, verify:

- [ ] Uses `withAuth()` with the correct `[Role.xxx]` array
- [ ] `schoolId` comes from `(req as any).user.schoolId` — NEVER from `req.body`
- [ ] All inputs validated with Zod (`.safeParse()`)
- [ ] `Logger.error()` used for all catch blocks (never `console.log`)
- [ ] No secrets, passwords, or tokens returned in response
- [ ] Method guard is the first line (`if (req.method !== 'POST')`)
- [ ] Service layer handles the business logic (handler is thin)
- [ ] Pagination is enforced for list endpoints (max 100 per page)
- [ ] File uploads have size limits and type validation
- [ ] Bulk operations are capped (max 500 records per batch)

---

## 🗂️ Registering in `detectModule()`

When you create a new API domain, add it to the `detectModule()` function in `lib/middleware/api-guard.ts`:

```typescript
// lib/middleware/api-guard.ts → detectModule() function
function detectModule(url: string | undefined): string | null {
  if (!url) return null;
  const path = url.split("?")[0].toLowerCase();

  // ─── Existing modules ─────────────────────────────
  if (path.includes("/api/v1/finance/subscription")) return null;
  if (path.includes("/api/v1/finance")) return "Finance Engine";
  if (path.includes("/api/v1/student")) return "Student Portal";
  // ... existing entries ...

  // ─── NEW MODULE — add here ────────────────────────
  if (path.includes("/api/v1/placement")) return "Placement Cell";
  if (path.includes("/api/v1/canteen")) return "Canteen POS";
  if (path.includes("/api/v1/clinic")) return "Health & Clinic";

  return null;
}
```

> **This is mandatory** for every new API domain. Without it, module usage tracking
> and subscription gating won't work for the new module.

---

## ⚡ Rate Limiting

For public-facing or high-risk endpoints, add rate limiting:

```typescript
import { rateLimit } from '@/lib/middleware/rate-limit';

// Inside your handler, before processing:
const rateLimitResult = await rateLimit(req, {
  interval: 60 * 1000,   // 1 minute window
  uniqueTokenPerInterval: 500,
  limit: 10,             // max 10 requests per minute per IP
});

if (!rateLimitResult.success) {
  return res.status(429).json({ error: 'Too many requests. Please try again later.' });
}
```

### Recommended Limits by Endpoint Type
| Type | Limit | Window |
|---|---|---|
| Login/Auth | 5 requests | 1 minute |
| Create/Update | 30 requests | 1 minute |
| List/Read | 60 requests | 1 minute |
| Bulk operations | 5 requests | 5 minutes |
| File uploads | 10 requests | 5 minutes |
| Export/Report | 5 requests | 5 minutes |

---

## 🔄 Zod Schema Quick Reference

```typescript
import { z } from 'zod';

// Common field validators for LearnXChain
const commonFields = {
  id:         z.string().cuid(),
  name:       z.string().min(2).max(100).trim(),
  email:      z.string().email().toLowerCase(),
  phone:      z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(10),
  date:       z.string().datetime(),
  amount:     z.number().positive().multipleOf(0.01),
  status:     z.enum(['active', 'inactive']),
  search:     z.string().max(100).trim().optional(),
  sortOrder:  z.enum(['asc', 'desc']).default('desc'),
};
```

---

## ⚠️ Anti-Patterns

```typescript
// ❌ Business logic in the handler
export default withAuth(async (req, res) => {
  const students = await prisma.student.findMany({ ... }); // BAD — logic belongs in service
  // ... 50 lines of processing ...
  return res.json({ data });
});

// ❌ No Zod validation
export default withAuth(async (req, res) => {
  const { name, email } = req.body; // BAD — no validation
  await prisma.student.create({ data: { name, email } });
});

// ❌ schoolId from request body
const { schoolId } = req.body; // BAD — attacker controls this

// ❌ console.log instead of Logger
console.log('Created student:', result); // BAD — use Logger.info()

// ❌ Hardcoded error messages
return res.status(500).json({ error: error.message }); // BAD — leaks internals
```
