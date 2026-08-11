---
name: pre-deploy-verification
description: >
  Mandatory checklist and automated verification workflow to run BEFORE every
  deployment of LearnXChain. Covers TypeScript compilation, Prisma generation,
  build verification, environment variable auditing, security scanning, and
  performance regression detection. Use this skill before every production push.
---

# LearnXChain — Pre-Deploy Verification Skill

> **Never deploy blind.** Every production push must pass this checklist.
> A single missed step can take down 100+ schools. Treat this as a flight preflight.

---

## 🛫 The Pre-Deploy Pipeline

Run these steps **in order**. If any step fails, **STOP and fix before proceeding**.

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: PRISMA     → Schema valid? Client generated?        │
│  Step 2: TYPES      → TypeScript compiles? No type errors?   │
│  Step 3: TESTS      → All tests pass? Coverage met?          │
│  Step 4: BUILD      → Next.js builds without errors?         │
│  Step 5: ENV        → All required env vars present?         │
│  Step 6: SECURITY   → No secrets in code? No SQL injection?  │
│  Step 7: PERF       → No N+1 queries? Pagination enforced?   │
│  Step 8: MIGRATION  → Migration safe for production data?    │
│  Step 9: ROLLBACK   → Can we revert if things break?         │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 1: Prisma Schema Validation

```powershell
# Validate schema syntax
npx prisma validate

# Generate client (must succeed)
npx prisma generate

# Check for pending migrations
npx prisma migrate status
```

### Failure Points
| Error | Cause | Fix |
|---|---|---|
| `Schema validation error` | Invalid relation or missing field | Fix the schema, re-validate |
| `Prisma Client not generated` | Forgot to run generate after schema change | Run `npx prisma generate` |
| `Pending migrations` | Schema changed but no migration created | Run `npx prisma migrate dev --name "description"` |

### Migration Safety Rules
- [ ] **No column deletions** — only deprecate (make nullable, stop writing)
- [ ] **New required fields** have `@default()` — otherwise existing rows will fail
- [ ] **New models** have `@@index([schoolId])` — mandatory for multi-tenant performance
- [ ] **Enums** — adding values is safe; removing/renaming is NOT safe in production
- [ ] **Relation changes** — verify `onDelete` behavior (Cascade vs SetNull vs Restrict)

---

## Step 2: TypeScript Compilation

```powershell
# Run TypeScript compiler in check-only mode (no emit)
npx tsc --noEmit
```

### Common Type Errors Before Deploy
| Error | Fix |
|---|---|
| `Property 'xxx' does not exist on type 'User'` | Prisma schema changed → run `npx prisma generate` to refresh types |
| `Type 'string' is not assignable to type 'Role'` | Cast with `as Role` or use the Prisma `Role` enum directly |
| `Cannot find module '@/lib/...'` | Check `tsconfig.json` paths — ensure `"@/*": ["./*"]` is present |
| `Argument of type 'undefined' is not assignable` | Add null checks or optional chaining (`?.`) |

### Acceptable Suppressions
Some third-party libraries have incomplete types. These are acceptable:
```typescript
// @ts-ignore — MSG91 SDK has no TypeScript types
// @ts-expect-error — Stream.io type mismatch (known issue)
```
**NEVER** use `@ts-ignore` on your own code. Fix the types.

---

## Step 3: Test Suite

```powershell
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run __tests__/api/v1/student/create.test.ts
```

### Coverage Thresholds (Minimum)
| Metric | Required | Good | Excellent |
|---|---|---|---|
| **Statements** | 70% | 80% | 90% |
| **Branches** | 60% | 70% | 85% |
| **Functions** | 70% | 80% | 90% |
| **Lines** | 70% | 80% | 90% |

### If Tests Fail
1. Read the test name — it tells you exactly what broke
2. Check if it's a **flaky test** (passes on retry) → fix the race condition
3. Check if a mock is stale (API response shape changed) → update the mock
4. **NEVER skip a failing test** — fix it or explain why it's okay to be failing

---

## Step 4: Next.js Production Build

```powershell
# Build the production bundle
npm run build
```

### What the Build Checks
- All pages compile without errors
- All API routes are valid
- Dynamic imports resolve correctly
- Image optimization configs are valid
- `getServerSideProps` / `getStaticProps` don't throw

### Common Build Failures
| Error | Fix |
|---|---|
| `Module not found` | Missing dependency → `npm install` then rebuild |
| `Page "/api/v1/..." is using unstable_getServerSession` | Update to `getServerSession` from `next-auth/next` |
| `Error: Image Optimization requires...` | Check `next.config.js` → `images.remotePatterns` |
| `ReferenceError: window is not defined` | Code accessing `window` at module level → move to `useEffect` |
| Build takes >10 minutes | Check for large unoptimized imports → use `optimizePackageImports` |

---

## Step 5: Environment Variable Audit

### Required Variables (Production)

```env
# ─── Database ────────────────────────────
DATABASE_URL=                    # Pooled Neon connection (with pgbouncer=true)
DIRECT_URL=                      # Direct Neon connection (for migrations)

# ─── Auth ────────────────────────────────
NEXTAUTH_SECRET=                 # Random 32+ char string
NEXTAUTH_URL=                    # https://beta.learnxchain.com
JWT_SECRET=                      # For mobile Bearer token signing

# ─── Payments ────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ─── Communication ───────────────────────
MSG91_AUTH_KEY=                   # WhatsApp/SMS
MSG91_SENDER_ID=
SES_ACCESS_KEY=                  # AWS SES for email
SES_SECRET_KEY=
SES_REGION=

# ─── Storage ─────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ─── Real-time ───────────────────────────
STREAM_API_KEY=
STREAM_API_SECRET=

# ─── Cache ───────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ─── AI ──────────────────────────────────
RIT_AI_URL=                      # AI service endpoint
```

### Verification Script
```powershell
# Check all required env vars are set (non-empty)
$required = @(
  'DATABASE_URL', 'DIRECT_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL',
  'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'
)

foreach ($var in $required) {
  $val = [System.Environment]::GetEnvironmentVariable($var)
  if ([string]::IsNullOrEmpty($val)) {
    Write-Host "❌ MISSING: $var" -ForegroundColor Red
  } else {
    Write-Host "✅ SET: $var" -ForegroundColor Green
  }
}
```

---

## Step 6: Security Scan

### Secrets in Code (CRITICAL)
```powershell
# Search for potential hardcoded secrets
# These patterns should NEVER appear in committed code
npx grep -rn "sk_live\|sk_test\|rzp_live\|password\s*=\s*['\"]" --include="*.ts" --include="*.tsx" lib/ pages/ components/
```

**If any match is found → STOP DEPLOY. Remove the secret, rotate it, and audit git history.**

### Security Checklist
- [ ] No `console.log` of sensitive data (tokens, passwords, API keys)
- [ ] All API routes use `withAuth()` (except `/api/v1/public/*`)
- [ ] `schoolId` comes from `req.user.schoolId` — NEVER from `req.body` or `req.query`
- [ ] Zod validation on ALL user inputs (no raw `req.body` access)
- [ ] File uploads have size limits (`maxFileSize: 5 * 1024 * 1024`)
- [ ] No `$executeRaw` with user-provided values (Prisma handles parameterization)
- [ ] CORS is configured correctly in `lib/middleware/cors.ts`
- [ ] Rate limiting is applied to auth and payment endpoints

---

## Step 7: Performance Check

### Query Performance
- [ ] **No N+1 queries**: Never query in a loop — use `include`/`select` or `Promise.all()`
- [ ] **All list endpoints paginated**: Max 100 per page, `skip`/`take` enforced by Zod schema
- [ ] **Indexes exist**: Every `WHERE` clause used in production has a matching `@@index`
- [ ] **Select only needed fields**: Use `select: {}` — never fetch entire models
- [ ] **Parallel queries**: Independent queries use `Promise.all()`, not sequential `await`

### Bundle Size
```powershell
# Check the build output for large pages
npm run build
# Look for pages > 200KB in the build output — they need code splitting
```

### Image Optimization
- [ ] All images use `next/image` (not raw `<img>`)
- [ ] Remote image domains are listed in `next.config.js` → `images.remotePatterns`
- [ ] Avatar fallbacks use DiceBear API (already configured)

---

## Step 8: Migration Readiness (Production DB)

### Before Running `migrate deploy`
```powershell
# 1. Verify migration status
npx prisma migrate status

# 2. Review the migration SQL
# Open prisma/migrations/[timestamp]_[name]/migration.sql
# Read every line — understand what it does

# 3. Backup check
# Neon auto-snapshots, but verify:
# → Neon Dashboard → Project → Branches → main → Snapshots
```

### Destructive Migration Warning Signs
| SQL Pattern | Risk | Action Required |
|---|---|---|
| `DROP TABLE` | **Data loss** | NEVER do this. Archive the table first. |
| `DROP COLUMN` | **Data loss** | Use 2-step deprecation (see database-operations skill) |
| `ALTER COLUMN ... SET NOT NULL` | **Fails if NULLs exist** | Backfill data first, then alter |
| `ALTER TYPE ... RENAME VALUE` | **Breaks running queries** | Add new value, migrate data, remove old later |

### Production Migration Command
```powershell
# Use DIRECT_URL for production migrations (bypasses PgBouncer)
$env:DATABASE_URL = $env:DIRECT_URL; npx prisma migrate deploy
```

---

## Step 9: Rollback Plan

Before every deploy, document your rollback strategy:

```markdown
## Rollback Plan for [Feature Name]

### If API breaks:
1. Revert to previous Vercel deployment (Vercel Dashboard → Deployments → Promote)
2. No DB rollback needed (API-only change)

### If migration breaks:
1. Revert Vercel deployment
2. If migration was additive (new table/column) → leave in DB (harmless)
3. If migration was destructive → restore from Neon snapshot

### If data is corrupted:
1. Stop all writes (maintenance mode)
2. Identify affected records via audit fields (createdAt, updatedAt)
3. Restore from Neon point-in-time recovery
4. Re-apply clean data
```

---

## ✅ Final Pre-Deploy Checklist (Copy & Use)

```markdown
## Pre-Deploy Checklist — [Date] — [Feature]

### Automated
- [ ] `npx prisma validate` — ✅ passed
- [ ] `npx prisma generate` — ✅ passed
- [ ] `npx tsc --noEmit` — ✅ no type errors
- [ ] `npm test` — ✅ all tests pass
- [ ] `npm run build` — ✅ build succeeds

### Manual
- [ ] All required env vars set in Vercel
- [ ] No hardcoded secrets in code
- [ ] All new API routes use `withAuth()`
- [ ] All new models have `@@index([schoolId])`
- [ ] All new endpoints handle 400/401/403/404/405/500
- [ ] Migration SQL reviewed (if applicable)
- [ ] Rollback plan documented

### Sign-off
- [ ] I am confident this deploy will not break existing functionality
```

---

## ⚠️ Anti-Patterns

```powershell
# ❌ Deploying without building locally first
git push  # BAD — you should have run `npm run build` first

# ❌ Running migrate dev in production
npx prisma migrate dev  # BAD — use `migrate deploy` in production

# ❌ Skipping type checks
# "It works in dev, it'll work in prod" — WRONG

# ❌ Not checking env vars
# Works locally because .env exists, fails on Vercel because var is missing

# ❌ Deploying on Friday evening
# If it breaks, nobody is around to fix it — deploy Monday-Thursday
```
