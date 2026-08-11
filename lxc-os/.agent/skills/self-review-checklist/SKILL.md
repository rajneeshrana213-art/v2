---
name: self-review-checklist
description: >
  Comprehensive self-review checklist for every code change in LearnXChain.
  Covers code quality, security, performance, accessibility, and consistency
  checks. Run through this checklist before marking any task as complete or
  submitting any code for deployment.
---

# LearnXChain — Self-Review Checklist Skill

> **You are your own senior reviewer.** Before submitting any code, run through
> this checklist. Every item missed is a potential production incident.

---

## 🔍 When to Use This Skill

Run this checklist:
- **After** completing any feature implementation
- **Before** marking a task as done
- **Before** committing code
- **Before** creating a deployment

---

## ✅ Code Quality Checklist

### Architecture & Structure
- [ ] **Thin handlers**: API routes contain NO business logic — all logic is in `lib/services/`
- [ ] **Service layer**: Business logic is in a properly named service file (`lib/services/[module]-service.ts`)
- [ ] **Validation layer**: Zod schemas exist in `lib/validations/[module].ts` for all inputs
- [ ] **File placement**: Files are in the correct directory per the project-file-index skill
- [ ] **Naming conventions**: Files use kebab-case, components use PascalCase, functions use camelCase

### TypeScript
- [ ] **No `any` types** in function signatures (acceptable only for Prisma casts and 3rd-party libs)
- [ ] **Interfaces defined** for props, API responses, and service parameters
- [ ] **No `@ts-ignore`** on project code (only acceptable for 3rd-party library issues)
- [ ] **`as const`** used for literal types where appropriate
- [ ] **Exhaustive switch/case** — all enum values handled (use `default: never` pattern)

### Error Handling
- [ ] **Every `try/catch`** logs with `Logger.error()` (never `console.log`)
- [ ] **Error messages**: API returns `{ error: "Human-readable message" }` — never stack traces
- [ ] **No swallowed errors**: Every `catch` block either re-throws, logs, or returns an error response
- [ ] **Async errors**: All async functions in API handlers are wrapped in try/catch

### Imports & Dependencies
- [ ] **No circular imports**: A imports B and B imports A → refactor to shared module
- [ ] **No unused imports**: Remove all grey/dimmed imports
- [ ] **Correct logger**: `import Logger from '@/lib/utils/logger'` — never `console.log`
- [ ] **Correct toast**: `import { toast } from 'react-toastify'` — never `react-hot-toast`
- [ ] **Prisma singleton**: `import { prisma } from '@/lib/prisma'` — never `new PrismaClient()`

---

## 🔐 Security Checklist

### Authentication & Authorization
- [ ] **`withAuth()` used**: Every protected API route wraps with `withAuth(handler, [Role.xxx])`
- [ ] **Roles are correct**: The `[Role.xxx]` array includes ONLY the roles that should have access
- [ ] **`schoolId` is from auth**: `schoolId` comes from `(req as any).user.schoolId` — NEVER from `req.body`
- [ ] **No public endpoints leak data**: Only `/api/v1/public/` routes skip auth

### Input Validation
- [ ] **Zod validates ALL inputs**: Every `req.body`, `req.query`, and `req.params` is validated
- [ ] **`.safeParse()` used**: Never `.parse()` (which throws uncaught errors)
- [ ] **String inputs trimmed**: `.trim()` applied to name/email/search fields in Zod schema
- [ ] **ID inputs validated**: All IDs use `.cuid()` validation
- [ ] **Pagination enforced**: List endpoints have `limit: z.coerce.number().max(100).default(10)`

### Data Protection
- [ ] **No secrets in responses**: Passwords, tokens, and API keys are excluded via `select: {}`
- [ ] **No secrets in logs**: Logger calls don't include passwords, tokens, or full credit card numbers
- [ ] **No secrets in code**: No hardcoded API keys, passwords, or connection strings
- [ ] **File uploads validated**: Size limits set, file type checked, folder scoped

---

## ⚡ Performance Checklist

### Database Queries
- [ ] **No N+1 queries**: Never query inside a loop — use `include`/`select` or batch queries
- [ ] **`Promise.all()`**: Independent queries run in parallel, not sequentially
- [ ] **Pagination**: All list endpoints use `skip`/`take` with max 100 per page
- [ ] **`select` used**: Only required fields are fetched — no `findMany()` without `select`
- [ ] **Indexes exist**: Every `WHERE` clause used frequently has a matching `@@index` in schema
- [ ] **Counts use `.count()`**: Never fetch all rows and count in JavaScript

### Frontend Performance
- [ ] **React Query `staleTime`**: Set to at least `30_000` (30s) to prevent excessive refetches
- [ ] **`placeholderData`**: Keeps old data visible while loading new page
- [ ] **Heavy components**: Below-fold components use `dynamic(() => import(...), { ssr: false })`
- [ ] **Lists are memoized**: Large lists use `React.memo()` to prevent unnecessary re-renders
- [ ] **No inline objects in deps**: `useEffect` / `useMemo` deps don't contain `{}` or `[]` literals

### Bundle Size
- [ ] **Icon imports**: Use `import { IconName } from 'lucide-react'` — never import the whole library
- [ ] **Dynamic imports**: Large charts/editors use `next/dynamic` with `ssr: false`
- [ ] **No duplicate libraries**: Don't introduce a new library that duplicates existing functionality

---

## 🖥️ UI / UX Checklist

### SSR / Hydration Safety
- [ ] **`mounted` guard**: Any component reading `theme`, `localStorage`, or `window` uses the `mounted` pattern
- [ ] **No `Date` in render**: `new Date()` calls are in `useEffect` + stored in state
- [ ] **Tailwind `dark:` variants**: Dark mode uses CSS-only `dark:bg-xxx` — never JS conditionals
- [ ] **Auth-dependent UI**: Login/Dashboard buttons are gated on `mounted` from `useTheme()`

### States Coverage
- [ ] **Loading state**: Shows skeleton/spinner while data is fetching (never blank)
- [ ] **Error state**: Shows user-friendly error message with retry option
- [ ] **Empty state**: Shows helpful message + CTA when no data exists
- [ ] **Disabled state**: Buttons show loading spinner and are disabled during submission

### Accessibility
- [ ] **`aria-label`**: All icon-only buttons have descriptive labels
- [ ] **Keyboard navigation**: All actions reachable via Tab + Enter/Space
- [ ] **Focus rings**: `focus:ring-2 focus:ring-brand-primary-blue` on all interactive elements
- [ ] **Form labels**: Every `<input>` has an associated `<label>`
- [ ] **Alt text**: All images have descriptive `alt` attributes
- [ ] **Color contrast**: Text meets 4.5:1 ratio against background

### Responsiveness
- [ ] **Mobile-first**: Styles start with mobile, then add `md:` and `lg:` breakpoints
- [ ] **Tested at 375px**: Content doesn't overflow on small phones
- [ ] **Tested at 768px**: Tablet layout works correctly
- [ ] **Sidebar collapses**: Mobile sidebar uses hamburger menu (handled by DashboardLayout)

### Brand Consistency
- [ ] **Brand colors used**: `bg-brand-primary-blue`, `bg-brand-accent-green` — never generic colors
- [ ] **Font hierarchy**: Headings use `font-outfit`, body uses `font-inter`
- [ ] **Glassmorphism cards**: Use `bg-white/5 backdrop-blur-lg border-white/10` for premium feel
- [ ] **Micro-animations**: Key interactions use `framer-motion` (page enter, card hover, modal open)

---

## 🗄️ Database Checklist

### Schema Changes
- [ ] **`schoolId` relation**: New models have `schoolId` → `School` with `onDelete: Cascade`
- [ ] **`@@index([schoolId])`**: Mandatory on every tenant-scoped model
- [ ] **`@@map("snake_case")`**: Table name follows PostgreSQL convention
- [ ] **Audit fields**: `createdAt`, `updatedAt` present on all models
- [ ] **Soft delete**: Destructive operations use `isDeleted`/`status` — never `DELETE`
- [ ] **No required fields without defaults**: New required columns have `@default()` or are nullable

### Migrations
- [ ] **Migration named descriptively**: `add_placement_model`, not `update` or `fix`
- [ ] **Migration SQL reviewed**: Read `migration.sql` before deployment
- [ ] **`npx prisma generate`** ran after schema changes
- [ ] **No destructive operations**: No `DROP TABLE`, `DROP COLUMN`, or `RENAME COLUMN` in a single step

---

## 🔗 API Endpoint Checklist

### Handler Structure
- [ ] **Method guard**: First line checks `req.method` and returns 405 if wrong
- [ ] **Zod validation**: Input is validated with `.safeParse()` before processing
- [ ] **Service delegation**: Handler calls service method — no direct Prisma queries
- [ ] **Response shape**: Returns `{ success: true, data: ... }` or `{ error: "..." }`

### Registration
- [ ] **`detectModule()` updated**: New API domain is registered in `lib/middleware/api-guard.ts`
- [ ] **Feature key synced**: Module appears in sidebar feature sync (`lib/utils/sidebarFeatureSync.ts`)

### HTTP Status Codes
- [ ] **200**: Successful operation
- [ ] **400**: Validation error (with field details)
- [ ] **401**: Missing/invalid auth (handled by `withAuth`)
- [ ] **403**: Wrong role (handled by `withAuth`)
- [ ] **404**: Resource not found
- [ ] **405**: Wrong HTTP method
- [ ] **500**: Server error (logged, generic message returned)

---

## 📱 Mobile App Checklist (If Applicable)

- [ ] **API calls use `api.get()`/`api.post()`**: From `lxc-app/lib/api.ts`
- [ ] **Token attached**: Bearer token is auto-attached by the API client
- [ ] **Error handling**: Network errors show user-friendly messages
- [ ] **Loading states**: Screens show `ActivityIndicator` while fetching
- [ ] **Offline handling**: Graceful message when no network connection
- [ ] **No localhost URLs**: Production builds use `https://beta.learnxchain.com/`

---

## 📋 Final Sign-Off Template

Copy this for every completed task:

```markdown
## Self-Review Completed — [Feature Name]

### Code Quality
- [x] Architecture follows thin-handler → service → DB pattern
- [x] TypeScript compiles without errors
- [x] No console.log — Logger used throughout

### Security
- [x] withAuth() with correct roles
- [x] schoolId from auth context
- [x] All inputs Zod-validated

### Performance
- [x] No N+1 queries
- [x] Pagination enforced
- [x] Promise.all for independent queries

### UI/UX
- [x] Loading / Error / Empty states
- [x] Hydration-safe (mounted guard)
- [x] Responsive on mobile

### Tests
- [x] API tests: happy + error paths
- [x] Service tests: business logic
- [x] All tests passing

### Verified
- [x] npm run build succeeds
- [x] Manually tested in browser
```
