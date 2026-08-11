---
name: database-operations
description: >
  Safe Prisma workflow for LearnXChain — migrations, schema changes, seeding,
  query patterns, multi-tenant scoping, and troubleshooting common errors.
  Read this skill before making ANY database schema changes.
---

# LearnXChain — Database Operations Skill

> **The database is the foundation.** One bad migration can bring down production.
> Follow this skill religiously when touching `prisma/schema.prisma`.

---

## 🔑 Critical Rules

1. **NEVER** use `npx prisma db push` — always use `migrate dev` or `migrate deploy`
2. **ALWAYS** scope queries by `schoolId` for non-superadmin operations
3. **ALWAYS** run `npx prisma generate` after schema changes
4. **NEVER** delete columns in production — deprecate them first (mark nullable, stop writing)
5. **NEVER** use `$executeRaw` for data mutations — use Prisma model methods
6. **ALWAYS** add `@@index([schoolId])` on every tenant-scoped model

---

## 🗄️ Database Architecture

| Property | Value |
|---|---|
| **Database** | PostgreSQL (Neon.tech — serverless) |
| **ORM** | Prisma v7+ |
| **Schema file** | `prisma/schema.prisma` (single source of truth) |
| **Client singleton** | `lib/prisma.ts` |
| **Connection** | Pooled URL for app, Direct URL for migrations |

### Connection Strings (`.env`)
```env
# Pooled connection — used by the app at runtime (connection pooling via Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/learnxchain?sslmode=require&pgbouncer=true"

# Direct connection — used ONLY for migrations (bypasses PgBouncer)
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/learnxchain?sslmode=require"
```

### Prisma Schema Header
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 📝 Migration Workflow

### Development (Local / Dev Branch)
```powershell
# 1. Make schema changes in prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name "descriptive_migration_name"

# 3. Regenerate client (auto-runs after migrate dev, but run explicitly if needed)
npx prisma generate

# 4. Verify in Prisma Studio
npx prisma studio
```

### Production (CI/CD / Deploy)
```powershell
# ONLY run deploy — never run migrate dev in production
npx prisma migrate deploy
```

### Migration Naming Conventions
```
✅ Good names:
  add_placement_model
  add_canteen_order_status_field
  make_student_phone_optional
  add_index_on_attendance_date
  rename_fee_to_invoice
  add_clinic_visit_relations

❌ Bad names:
  update
  fix
  migration_1
  changes
```

---

## 🏗️ Schema Change Patterns

### Pattern 1: Add a New Model
```prisma
// 1. Define the model
model Placement {
  id          String    @id @default(cuid())
  studentId   String
  companyName String
  package     Float?
  status      String    @default("pending")
  
  // Multi-tenant scope (MANDATORY)
  schoolId    String
  school      School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  student     Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([schoolId])
  @@index([schoolId, studentId])
  @@index([schoolId, status])
  @@map("placements")
}

// 2. Add relation back-reference to School model
model School {
  // ... existing fields ...
  placements  Placement[]
}

// 3. Add relation back-reference to Student model
model Student {
  // ... existing fields ...
  placements  Placement[]
}
```

**Checklist:**
- [ ] `schoolId` with `@relation` to `School`
- [ ] `onDelete: Cascade` on school relation
- [ ] `@@index([schoolId])` for query performance
- [ ] `@@map("snake_case")` table name
- [ ] Back-references added to related models
- [ ] `createdAt` + `updatedAt` audit fields

### Pattern 2: Add a New Field to Existing Model
```prisma
// Adding a nullable field (safe — no data migration needed)
model Student {
  // ... existing fields ...
  bloodGroup  String?   // nullable = safe to add
}

// Adding a required field with default (safe)
model Student {
  // ... existing fields ...
  isVerified  Boolean   @default(false)  // default = safe to add
}
```

> [!CAUTION]
> **Adding a required field WITHOUT a default will fail** if the table has existing rows. Always use `?` (optional) or `@default()`.

### Pattern 3: Add an Enum
```prisma
enum PlacementStatus {
  pending
  shortlisted
  interviewed
  offered
  accepted
  rejected
}

model Placement {
  status  PlacementStatus  @default(pending)
}
```

### Pattern 4: Add an Index
```prisma
model Attendance {
  // ... fields ...
  
  // Composite unique constraint (prevent duplicate attendance)
  @@unique([studentId, date, schoolId])
  
  // Performance indexes
  @@index([schoolId, date])
  @@index([schoolId, classId, date])
}
```

### Pattern 5: Rename a Field (Two-Step Migration)
```
Step 1: Add new field, copy data, keep old field
Step 2: (Next release) Remove old field

NEVER rename in a single migration — it will cause downtime.
```

### Pattern 6: Delete a Field (Deprecation Path)
```
Step 1: Make field nullable (if not already)
Step 2: Stop writing to the field in application code
Step 3: Deploy and verify nothing reads the field
Step 4: Remove field from schema in a future migration
```

---

## 🔍 Query Patterns

### Always Scope by `schoolId`
```typescript
// ✅ CORRECT — scoped to school
const students = await prisma.student.findMany({
  where: { schoolId: user.schoolId, isActive: true },
});

// ❌ WRONG — fetches ALL schools' data
const students = await prisma.student.findMany({
  where: { isActive: true },
});

// ❌ WRONG — schoolId from user input (attackers can change it)
const students = await prisma.student.findMany({
  where: { schoolId: req.body.schoolId }, // NEVER DO THIS
});
```

### Select Only What You Need
```typescript
// ✅ CORRECT — explicit select
const students = await prisma.student.findMany({
  where: { schoolId },
  select: {
    id: true,
    name: true,
    email: true,
    class: { select: { name: true } },
  },
});

// ❌ WRONG — fetches everything (passwords, tokens, etc.)
const students = await prisma.student.findMany({
  where: { schoolId },
});
```

### Parallel Queries with Promise.all
```typescript
// ✅ CORRECT — parallel execution
const [data, total] = await Promise.all([
  prisma.student.findMany({ where, skip, take }),
  prisma.student.count({ where }),
]);

// ❌ WRONG — sequential execution (2x slower)
const data = await prisma.student.findMany({ where, skip, take });
const total = await prisma.student.count({ where });
```

### Pagination Pattern
```typescript
static async getList(schoolId: string, page: number, limit: number) {
  const where = { schoolId };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.model.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.model.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}
```

### Upsert Pattern (Idempotent Operations)
```typescript
// ✅ Safe to retry — won't create duplicates
await prisma.attendance.upsert({
  where: {
    studentId_date: { studentId, date },
  },
  create: { studentId, date, status: 'present', schoolId },
  update: { status: 'present' },
});
```

### Transaction Pattern
```typescript
// ✅ For operations that must succeed or fail together
const result = await prisma.$transaction(async (tx) => {
  const invoice = await tx.invoice.create({ data: invoiceData });
  const payment = await tx.payment.create({
    data: { ...paymentData, invoiceId: invoice.id },
  });
  await tx.student.update({
    where: { id: studentId },
    data: { balanceDue: { decrement: paymentData.amount } },
  });
  return { invoice, payment };
});
```

---

## 🌱 Seed Data

### Seed Script Pattern
```typescript
// scripts/seed-[module].ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding [module] data...');

  const school = await prisma.school.findFirst();
  if (!school) {
    console.error('❌ No school found. Run seed-demo-users.ts first.');
    process.exit(1);
  }

  // Create seed records
  for (let i = 0; i < 20; i++) {
    await prisma.featureName.create({
      data: {
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        schoolId: school.id,
        status: faker.helpers.arrayElement(['active', 'inactive']),
      },
    });
  }

  console.log('✅ Seeded 20 feature records.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Running Seeds
```powershell
# Run the main seed
npm run seed

# Run a specific seed
npx tsx scripts/seed-[module].ts
```

---

## 🐛 Common Prisma Errors & Fixes

### P1002 — Connection Timeout (Neon)
```
Error: Can't reach database server at `ep-xxx.neon.tech`
```
**Fix**: Use the `DIRECT_URL` (not pooled) for migrations:
```powershell
$env:DATABASE_URL = $env:DIRECT_URL; npx prisma migrate dev --name "migration_name"
```

### P2002 — Unique Constraint Violation
```
Unique constraint failed on the fields: (`email`)
```
**Fix**: Check for duplicates before insert, or use `upsert`.

### P2025 — Record Not Found (Update/Delete)
```
An operation failed because it depends on one or more records that were required but not found.
```
**Fix**: Always check if the record exists before update/delete:
```typescript
const existing = await prisma.model.findFirst({ where: { id, schoolId } });
if (!existing) return res.status(404).json({ error: 'Not found' });
```

### P2003 — Foreign Key Constraint Failed
```
Foreign key constraint failed on the field: `classId`
```
**Fix**: Ensure the referenced record exists, or set `onDelete: SetNull` / `Cascade`.

### Migration Drift (Schema out of sync)
```powershell
# Reset dev database (WARNING: deletes all data)
npx prisma migrate reset

# Then re-apply migrations
npx prisma migrate dev
```

---

## 📊 Performance Guidelines

| Scenario | Recommendation |
|---|---|
| List endpoint | Always paginate with `skip`/`take` (max 100 per page) |
| Dashboard stats | Use `aggregate`/`groupBy` — never fetch all rows to count in JS |
| Related data | Use `include`/`select` — never N+1 query in a loop |
| Frequently read | Cache in Redis (school settings, config, plan data) |
| Bulk insert | Use `createMany` — never loop with individual `create` calls |
| Search | Use `contains` with `mode: 'insensitive'` — add indexes for large tables |
| Count + Data | Use `Promise.all([findMany, count])` — never sequential |

---

## 🔒 Security Rules

1. **`schoolId` comes from `req.user.schoolId`** — NEVER from `req.body` or `req.query`
2. **Never return passwords, tokens, or secrets** in query results — use `select` to exclude
3. **Use parameterized queries** (Prisma handles this) — NEVER concatenate user input into SQL
4. **Validate all IDs** with Zod `.cuid()` before querying — prevents injection attempts
5. **Rate-limit** bulk operations — a single request should never create/update more than 500 rows
