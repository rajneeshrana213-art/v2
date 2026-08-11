---
name: error-diagnosis
description: >
  Systematic error diagnosis workflow for LearnXChain. Covers the full spectrum
  of errors: Prisma/DB, Next.js hydration, auth failures, subscription blocks,
  API crashes, and performance regressions. Includes decision trees, log reading
  patterns, and ready-to-apply fix templates. Use this skill whenever debugging
  or triaging any error in the project.
---

# LearnXChain — Error Diagnosis Skill

> **Don't guess — diagnose.** Every error in this codebase falls into a known
> category with a known fix pattern. Follow this skill to resolve issues in
> minutes, not hours.

---

## 🔍 Step 1: Classify the Error

Before touching any code, determine which **error class** you're dealing with:

```
┌─ Error occurs in ─────────────────────────────────────────────────┐
│                                                                   │
│  Browser console?  ──→  UI / Hydration / Auth / React Query       │
│  Terminal / Vercel logs?  ──→  API / Prisma / Service             │
│  Build fails?  ──→  TypeScript / Next.js Config / Prisma Gen      │
│  API returns HTTP error?  ──→  See HTTP Status Decision Tree      │
│  Page is blank / loading forever?  ──→  See "Infinite Loading"    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📊 HTTP Status Code Decision Tree

| Status | Meaning | Where to Look |
|---|---|---|
| **400** | Zod validation failed | Check `req.body` against the Zod schema in `lib/validations/[module].ts` |
| **401** | No session or invalid Bearer token | Check `lib/auth.ts` → `verifyAuth()`, check token expiry |
| **402** | Subscription expired | `lib/middleware/api-guard.ts` → `SubscriptionService.checkAccess()` |
| **403** | Role not in `allowedRoles` | Check the `withAuth(handler, [Role.xxx])` call — is the user's role listed? |
| **404** | Record not found in DB | Check if `schoolId` scoping is filtering it out, or record was soft-deleted |
| **405** | Wrong HTTP method | Handler expects `POST` but client sent `GET` (or vice versa) |
| **429** | Rate limit exceeded | Check `lib/middleware/rate-limit.ts` — Upstash Redis may be down |
| **500** | Unhandled server error | **Always** check the terminal/Vercel logs for the full stack trace |

---

## 🗄️ Prisma / Database Errors

### P1002 — Connection Timeout (Neon Serverless)
```
Error: Can't reach database server at `ep-xxx.neon.tech`
```
**Cause**: PgBouncer pooled connection can't acquire an advisory lock during migration.
**Fix**:
```powershell
# Use DIRECT_URL (not pooled) for migrations
$env:DATABASE_URL = $env:DIRECT_URL; npx prisma migrate dev --name "migration_name"
```

### P2002 — Unique Constraint Violation
```
Unique constraint failed on the fields: (`email`)
```
**Diagnosis**:
1. Is the user trying to create a duplicate record?
2. Is a seed script re-running without `skipDuplicates: true`?

**Fix**:
```typescript
// Option A: Use upsert
await prisma.model.upsert({
  where: { email },
  create: { ...data },
  update: { ...data },
});

// Option B: Check before insert
const existing = await prisma.model.findUnique({ where: { email } });
if (existing) return res.status(409).json({ error: 'Record already exists' });
```

### P2025 — Record Not Found on Update/Delete
```
An operation failed because it depends on one or more records that were required but not found.
```
**Cause**: The record was deleted between the check and the update, or `schoolId` scoping excluded it.
**Fix**: Always use `findFirst` with `schoolId` before updating:
```typescript
const record = await prisma.model.findFirst({ where: { id, schoolId: user.schoolId } });
if (!record) return res.status(404).json({ error: 'Not found' });
```

### P2003 — Foreign Key Constraint Failed
```
Foreign key constraint failed on the field: `classId`
```
**Cause**: Trying to reference a record that doesn't exist (e.g., assigning a student to a deleted class).
**Fix**: Validate that the referenced record exists before the mutation.

### Prisma Client Not Generated
```
@prisma/client did not initialize yet. Please run "prisma generate"
```
**Fix**:
```powershell
npx prisma generate
```

### Migration Drift / Shadow Database Error
```
Migration `xxx` was modified after it was applied
```
**Fix** (development only — destroys data):
```powershell
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🖥️ Next.js / Hydration Errors

### Hydration Mismatch
```
Warning: Text content did not match. Server: "Good Morning" Client: "Good Evening"
```

**Root Cause Categories**:

| Cause | Example | Fix |
|---|---|---|
| Theme-dependent rendering | `theme === 'dark' ? 'bg-black' : 'bg-white'` | Use Tailwind `dark:` variants instead of JS conditionals |
| Date/time-based UI | `new Date().getHours()` in render | Move to `useEffect` + state (see `greeting` pattern in DashboardLayout) |
| `localStorage` in render | `localStorage.getItem('key')` | Wrap in `useEffect`, use `mounted` guard |
| `window` object access | `window.innerWidth` | Use `typeof window !== 'undefined'` guard |
| Conditional auth UI | `isAuthenticated ? <Dashboard/> : <Login/>` | Gate with `mounted` from `useTheme()` |

**Universal Fix Pattern**:
```tsx
const { mounted } = useTheme(); // or useState + useEffect
if (!mounted) return null; // or <Skeleton />
// Now safe to render browser-dependent UI
```

### `document is not defined` / `window is not defined`
**Cause**: Code that accesses browser globals runs during SSR.
**Fix**:
```typescript
// Guard with typeof check
if (typeof window !== 'undefined') {
  // browser-only code
}

// Or use dynamic import for heavy client components
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```

---

## 🔐 Authentication Errors

### "Unauthorized: No valid session or token"
**Diagnosis Steps**:
1. Is the user logged in? Check `useAuth()` → `isAuthenticated`
2. Is the session expired? JWT tokens expire after 30 days
3. Is the API route using `withAuth()`? Check `pages/api/v1/[module]/[action].ts`
4. Mobile app: Is the Bearer token attached? Check `lxc-app/lib/api.ts` → `getHeaders()`

### "Forbidden: Insufficient permissions"
**Diagnosis**: The user's role is not in the `allowedRoles` array.
```typescript
// Check this line in the handler:
export default withAuth(handler, [Role.admin, Role.teacher]);
//                                 ↑ Is the user's role listed here?
```
**Note**: `superadmin` always bypasses role checks (line 72 in `api-guard.ts`).

### NextAuth `NEXTAUTH_URL` Mismatch
```
[next-auth] NEXTAUTH_URL environment variable is not set
```
**Fix**: Set in `.env`:
```env
NEXTAUTH_URL=http://localhost:3000      # Development
NEXTAUTH_URL=https://beta.learnxchain.com  # Production
```

---

## 💳 Subscription / Payment Errors

### HTTP 402 — "Payment Required"
**Cause**: School's subscription has expired or is missing.
**Diagnosis**:
1. Check `SchoolSubscriptionConfig` for the school in question
2. Check `subscription` table for active subscriptions
3. The `api-guard.ts` calls `SubscriptionService.checkAccess(schoolId)` automatically

**Quick Fix (Superadmin)**:
```sql
-- Temporarily extend a school's subscription (use with caution)
UPDATE subscription SET end_date = NOW() + INTERVAL '30 days'
WHERE school_id = 'xxx' AND status = 'ACTIVE';
```

### Razorpay Order Creation Fails
**Diagnosis**:
1. Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
2. Check if the amount is in paise (multiply INR by 100)
3. Check Razorpay dashboard for API rate limits

---

## ♻️ React Query / Data Fetching Errors

### Infinite Loading (Spinner Never Stops)
**Diagnosis Tree**:
```
1. Is the API endpoint returning data?
   → Check Network tab → Response tab
   → If 401/402/403 → Auth/subscription issue
   → If 500 → Check terminal logs

2. Is the queryKey correct?
   → useQuery({ queryKey: ['module', 'list', params] })
   → Changing params should trigger a refetch

3. Is the response shape correct?
   → API returns { success: true, data: { data: [...], total, page } }
   → Component expects data?.data?.data (3 levels deep)
   → If shape changed, component will show "no data"

4. Is the query enabled?
   → useQuery({ enabled: !!schoolId }) — if schoolId is undefined, query won't run
```

### Stale Data After Mutation
**Cause**: Missing `invalidateQueries` after mutation.
**Fix**:
```typescript
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => axios.post('/api/v1/module/create', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['module-name'] }); // ← THIS
    toast.success('Created!');
  },
});
```

---

## 🐌 Performance Issues

### Slow API Responses (>300ms)
The `withApiLogger` middleware in `lib/utils/logger.ts` automatically logs slow APIs:
```
[PERF][API] SLOW POST /api/v1/student/list - 1200ms (exceeded 300ms threshold)
```

**Common Causes**:
| Cause | Fix |
|---|---|
| N+1 queries | Use `include`/`select` instead of looping with individual queries |
| Missing `@@index` | Add composite indexes for frequently-filtered columns |
| Sequential awaits | Use `Promise.all()` for independent queries |
| Large result sets | Add pagination (`skip`/`take`, max 100 per page) |
| Cold start (Neon) | First request after idle wakes the DB — this is expected |

**Quick Check**: Look for `[PERF][API]` entries in the Vercel/terminal logs via the superadmin dashboard.

### Slow UI Renders (>50ms)
The `<Profiler>` in `_app.tsx` logs slow renders:
```
[PERF][UI] App render: mountTime=120ms (exceeded 50ms threshold)
```

**Common Causes**:
- Re-rendering entire list on every state change → memoize with `React.memo`
- Large inline objects/arrays in JSX → extract to `useMemo`
- Uncontrolled re-fetches → set `staleTime` on React Query

---

## 🏗️ Build / TypeScript Errors

### `Module not found: Can't resolve '@/lib/...'`
**Fix**: Check `tsconfig.json` for path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### `Type 'xxx' is not assignable to type 'yyy'`
**Common in this project**:
```typescript
// Problem: Prisma types don't match component prop types
const user = (req as any).user; // ← Cast to any when Prisma types are incomplete

// Better: Create a typed user interface
interface AuthUser {
  id: string;
  name: string;
  role: Role;
  schoolId: string;
}
const user = (req as any).user as AuthUser;
```

### Prisma Generate Errors After Schema Change
```powershell
# Always run after schema changes
npx prisma generate

# If types are still stale, restart TypeScript server in VS Code:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📋 Error Log Reading Guide

### Where to Find Logs

| Environment | Log Location |
|---|---|
| **Local dev** | Terminal where `npm run dev` is running |
| **Local file** | `logs/error.log` and `logs/all.log` (dev only) |
| **Production** | Vercel dashboard → Deployments → Functions → Logs |
| **Superadmin** | Dashboard → System Logs (in-memory, last 50 entries) |
| **Slow APIs** | Dashboard → Performance → Slow API Requests |

### Log Format
```
2026-04-07 12:30:45:123 error: [FeatureService.create] Failed: P2002 — duplicate email
2026-04-07 12:30:45:123 info: [PERF][API] POST /api/v1/student/create - 45ms
2026-04-07 12:30:45:123 warn: [PERF][API] SLOW GET /api/v1/analytics/dashboard - 850ms
```

### Key Log Prefixes
| Prefix | Meaning |
|---|---|
| `[PERF][API]` | API performance metrics from `withApiLogger` |
| `[PERF][UI]` | UI render performance from React `<Profiler>` |
| `[FeatureService.xxx]` | Service-layer errors (always check these first) |
| `[API][ModuleName]` | API handler-level errors |
| `[ErrorNotifier]` | Email notification system errors (ignore for diagnosis) |
| `[EmailService]` | Email dispatch failures |

---

## 🚨 Emergency Playbook

### Production Is Down
```
1. Check Vercel dashboard for deployment status
2. Check Neon dashboard for database status
3. Check Upstash dashboard for Redis status
4. Look at Vercel function logs for the first error
5. If it's a migration issue → rollback to previous deployment
6. If it's a code issue → revert the last commit and redeploy
```

### Data Corruption / Wrong Data
```
1. NEVER delete data directly — always use soft-delete (isDeleted + deletedAt)
2. Check the Prisma audit fields (createdAt, updatedAt, createdBy)
3. Check the FinanceLedger for financial data issues
4. Use Prisma Studio to inspect: npx prisma studio
```

---

## ⚠️ Anti-Patterns in Error Handling

```typescript
// ❌ Swallowing errors silently
try { await riskyOperation(); } catch {} // BAD — error disappears

// ❌ Logging with console.log instead of Logger
console.log('Error:', error); // BAD — use Logger.error()

// ❌ Exposing internal error messages to client
return res.status(500).json({ error: error.message }); // BAD — leaks stack trace

// ❌ Not checking response shape on frontend
const name = data.data.name; // BAD — crashes if data is undefined

// ✅ Correct error handling pattern
try {
  const result = await riskyOperation();
  return res.status(200).json({ success: true, data: result });
} catch (error: any) {
  Logger.error(`[ModuleName] Operation failed: ${error.message}`, { stack: error.stack });
  return res.status(500).json({ error: 'Internal server error' });
}
```
