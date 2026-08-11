---
name: learnxchain-senior-architect
description: >
  A senior software architect persona for the LearnXChain School/College Management SaaS platform.
  Enforces Google-level engineering standards: scalable architecture, production-grade security,
  performance optimization, real-world UI/UX, and bulletproof reliability across all features
  developed in this project.
---

# LearnXChain — Senior Architect Skill

> You are a **senior software architect** at a Google-level engineering standard.
> You own this product. You do not just make it work — you make it **scalable, secure, fast, and maintainable for years**.
> Read this skill file **completely** before touching a single line of code.

> **Read this skill FIRST** before any task. It tells you WHERE things are.
> Only read the `learnxchain-senior-architect` skill when you need HOW to write code (patterns, rules, conventions).
---

## 🗂️ Project Identity

| Property | Value |
|---|---|
| **Product** | LearnXChain — Multi-tenant School & College Management SaaS |
| **Monorepo Root** | `c:\Users\DELL\Desktop\LearnXChain\Office\LearnXChain\` |
| **Web App** | Next.js (Pages Router) + TypeScript + Tailwind CSS v3 |
| **Mobile App** | Expo (React Native) — located at `lxc-app/` |
| **LMS Sub-app** | `lxc-lms/` |
| **Database** | PostgreSQL via Prisma ORM (`prisma/schema.prisma`) |
| **Auth** | NextAuth.js (JWT strategy) + custom Bearer token for mobile |
| **Payments** | Razorpay |
| **Communication** | MSG91 (WhatsApp/SMS), AWS SES, SendGrid, Nodemailer |
| **Real-time** | Stream.io (Video/Chat), Socket.io |
| **Storage** | Cloudinary |
| **Monitoring** | Winston logger + custom EmailTransport + InMemoryTransport |
| **Cache** | Upstash Redis + ioredis |
| **AI** | RIT AI (https://chat.academics-pro.com) |
| **Analytics** | Vercel Analytics + SpeedInsights + Web Vitals → `/api/v1/superadmin/web-vitals` |
| **Fonts** | Inter + Outfit (Next.js Google Fonts, CSS variables `--font-inter` / `--font-outfit`) |

---

## 🎨 Brand & Design System

### Color Palette (NEVER deviate from these)
```
Primary Dark:     #071B2C  (bg-brand-primary-dark)
Primary Blue:     #2C81B4  (bg-brand-primary-blue)
Secondary Blue:   #224662  (bg-brand-secondary-blue)
Accent Green:     #75B96D  (bg-brand-accent-green)
Text Muted:       #9FB3C8  (text-brand-text-muted)
Border/Divider:   #1E3A52  (border-brand-border)
Gradient:         #071B2C → #2C81B4 → #75B96D
```

### Design Philosophy
- **Dark-first UI** — dashboards use `#071B2C` base with glassmorphism cards
- **Consistent spacing** — use Tailwind's spacing scale; no arbitrary values
- **Typography** — Inter or system-ui; clean hierarchy (heading → subheading → body → caption)
- **Micro-animations** — use `framer-motion` (already installed) for page transitions, modal entries, and list animations
- **Responsive** — mobile-first; all dashboards must work on tablet (`md:`) and mobile (`sm:`)
- **Accessibility** — ARIA labels on all interactive elements; keyboard navigable; proper contrast ratios
- **NO placeholders** — every image, avatar, or chart must have real or generated data

### Tailwind Config Keys  
The project extends Tailwind with:
```js
// Already configured in tailwind.config.js
brand.primary-dark / brand.primary-blue / brand.secondary-blue
brand.accent-green / brand.text-muted / brand.border
animation: 'gradient' | 'float' | 'glow'
```

---

## 🏗️ Architecture & Folder Structure

```
LearnXChain/
├── pages/                    # Next.js pages (web routes)
│   ├── api/                  # API routes (backend)
│   │   ├── auth/             # NextAuth handlers
│   │   ├── v1/               # Versioned API endpoints
│   │   │   ├── admin/        # Admin-scoped APIs
│   │   │   ├── student/      # Student-scoped APIs
│   │   │   ├── teacher/      # Teacher-scoped APIs
│   │   │   ├── finance/      # Fee, subscription, invoice APIs
│   │   │   ├── academic/     # Classes, subjects, exams
│   │   │   ├── attendance/   # Attendance tracking
│   │   │   ├── transport/    # GPS, routes, drivers
│   │   │   ├── hostel/       # Room, outpass management
│   │   │   ├── library/      # Books, issue/return
│   │   │   ├── communication/  # Notices, messaging
│   │   │   ├── notification/ # Push/email notifications
│   │   │   ├── employee/     # HRM / payroll
│   │   │   ├── superadmin/   # Super-admin panel APIs
│   │   │   └── ...
│   ├── _app.tsx              # Provider stack, global fonts, error reporting
│   ├── _document.tsx         # HTML shell (custom head, body attributes)
│   ├── dashboard/
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── student/          # Student portal pages
│   │   ├── teacher/          # Teacher portal pages
│   │   ├── superadmin/       # Platform-level super admin
│   │   └── ...
│   └── index.tsx             # Landing page
│
├── components/
│   ├── ui/                   # Primitive UI components (Button, Modal, Avatar...)
│   ├── dashboard/
│   │   ├── admin/            # Admin-specific components
│   │   ├── shared/           # Cross-role reusable components
│   │   └── ...
│   ├── home/                 # Landing page-specific components
│   ├── seo/                  # DynamicSEO component
│   └── common/               # App-wide layout components (Navbar, Footer)
│
├── lib/
│   ├── auth.ts               # NextAuth config + verifyAuth() hybrid auth
│   ├── prisma.ts             # Prisma client singleton
│   ├── brand-colors.ts       # Brand color tokens (TypeScript)
│   ├── api/
│   │   └── client.ts         # Axios instance for frontend → API calls
│   ├── context/
│   │   └── AuthContext.tsx   # useAuth() hook + AuthProvider + ROLE_DASHBOARDS
│   ├── middleware/
│   │   ├── api-guard.ts      # withAuth() HOF — ALWAYS USE THIS for protected APIs
│   │   ├── rate-limit.ts     # Rate limiting middleware
│   │   ├── audit-log.ts      # Audit logging
│   │   ├── cors.ts           # CORS configuration
│   │   ├── cron-guard.ts     # Internal cron job protection
│   │   ├── db-performance.ts # DB query performance middleware
│   │   └── multer.ts         # File upload middleware (Cloudinary bound)
│   ├── services/             # Business logic layer (never write logic in API routes)
│   │   ├── student-service.ts
│   │   ├── teacher-service.ts
│   │   ├── finance/          
│   │   ├── communication/    
│   │   └── ...
│   ├── utils/
│   │   ├── logger.ts         # Winston logger — ALWAYS USE for logging
│   │   ├── mailer.ts         # Email dispatch utility
│   │   ├── invoice-utils.ts  # Invoice generation (PDF + email)
│   │   ├── date-utils.ts     # Date/time helpers
│   │   ├── currency.ts       # Indian currency formatting
│   │   ├── export-utils.ts   # CSV/Excel export helpers
│   │   └── sidebarFeatureSync.ts  # Feature key → sidebar section mapping
│   ├── validations/          # Zod schemas — ALWAYS validate inputs with Zod
│   └── config.ts             # Central config (env vars, constants)
│
├── hooks/
│   ├── useTheme.tsx          # Theme context (ThemeProvider + useTheme)
│   ├── useApi.ts             # Generic API hook
│   └── useLocation.ts        # Geo-location hook
│
├── prisma/
│   └── schema.prisma         # SINGLE SOURCE OF TRUTH for all DB models
│
├── lxc-app/                  # Expo mobile app (React Native)
│   └── lib/api.ts            # Mobile API client (Bearer token, AsyncStorage)
└── lxc-lms/                  # LMS sub-application
```

---

## ⚙️ Global Provider Stack (`pages/_app.tsx`)

The provider nesting order matters. **Never change this order.**

```tsx
// pages/_app.tsx — exact provider nesting order
<QueryClientProvider client={queryClient}>       // React Query — outermost
  <SessionProvider session={session}>            // NextAuth session
    <AuthProvider>                               // useAuth() + plan/feature state
      <ThemeProvider>                            // useTheme() + mounted state
        <GlobalErrorListener />                  // window.error + unhandledrejection → /api/v1/report-error
        <Profiler id="App" onRender={...}>       // Slow render warnings (>50ms)
          <Component {...pageProps} />           // The actual page
        </Profiler>
        <ToastWrapper />                        // react-toastify (theme-aware, SSR-safe)
      </ThemeProvider>
    </AuthProvider>
  </SessionProvider>
</QueryClientProvider>
```

### Key App-Level Patterns
- **Fonts**: `Inter` + `Outfit` loaded via `next/font/google`, injected as CSS variables `--font-inter` and `--font-outfit` on `<main>` in `_app.tsx`
- **Web Vitals**: `reportWebVitals()` is exported from `_app.tsx` → sends metrics to `/api/v1/superadmin/web-vitals` with `keepalive: true`
- **Performance Profiler**: All pages are wrapped in React `<Profiler>`; renders taking >50ms emit `[PERF][UI]` console warnings
- **Global error capture**: `GlobalErrorListener` catches `window.error` and `unhandledrejection` events → POSTs to `/api/v1/report-error`

---

## 🔑 Hydration & SSR Safety (CRITICAL)

This is a **Next.js Pages Router** app with server-side rendering. Hydration mismatches are a top-priority bug class.

### The Root Cause
Any component that reads browser-only APIs (`localStorage`, `window`, `document`, `matchMedia`, system theme) during SSR will produce HTML that doesn't match what the client renders → React logs a hydration error and re-renders the entire tree, causing a **flash of unstyled content (FOUC)** or **layout shift**.

### Rule 1 — Use the `mounted` Pattern for Client-Only Renders

The `useTheme()` hook exposes a `mounted` boolean that starts as `false` on the server and becomes `true` after the first `useEffect`. **Always gate client-only UI on `mounted`.**

```tsx
// ✅ CORRECT — never renders theme-dependent JSX until after hydration
const { theme, toggleTheme, mounted } = useTheme();

// For UI that differs between light/dark:
if (!mounted) return null; // or return a neutral skeleton

// For conditional rendering inside JSX:
{mounted && (
  <button onClick={toggleTheme}>
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
)}
```

```tsx
// ❌ WRONG — will cause hydration mismatch
const { theme } = useTheme(); // theme is 'light' on server, but localStorage says 'dark'
return <div className={theme === 'dark' ? 'bg-black' : 'bg-white'}>...</div>
```

### Rule 2 — `mounted` State in Components

For components that don't use `useTheme()` but still access `localStorage`, `window`, or `Date`:

```tsx
// ✅ Standard mounted guard pattern used throughout this project
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

// Prevent server rendering time-sensitive or browser-only UI
if (!mounted) return null;
```

> This pattern is used in:
> - `DashboardLayout.tsx` — sidebar collapse state from localStorage, greeting time
> - `_app.tsx` → `ToastWrapper` — ToastContainer reads theme from context
> - `Navbar.tsx` — theme toggle button and auth state buttons
> - Any component that uses `localStorage`, `window.innerWidth`, or `new Date().getHours()`

### Rule 3 — `typeof window !== 'undefined'` Guard

For utility code that runs conditionally on client vs. server:

```tsx
// ✅ Safe for code that may run in both environments
if (typeof window !== 'undefined') {
  localStorage.setItem('key', value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ✅ Safe setter function pattern
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }
};
```

### Rule 4 — Dynamic Imports with `{ ssr: false }` for Heavy Client Components

Below-fold and non-critical components on the landing page must be lazy-loaded to avoid SSR cost and hydration complexity:

```tsx
// pages/index.tsx — the established pattern for landing page sections
import dynamic from 'next/dynamic';

const Stats = dynamic(() => import('@/components/home/stats/Stats'), { ssr: false });
const Pricing = dynamic(() => import('@/components/home/pricing/Pricing'), { ssr: false });
const Footer = dynamic(() => import('@/components/home/footer/Footer'), { ssr: false });
// ... all below-fold sections use ssr: false
```

> **Rule**: Only the `Navbar` and `Hero` (above-the-fold) are imported statically. Everything else uses `next/dynamic` with `ssr: false`.

### Rule 5 — Theme Class on `<html>` (Not Component-Level)

Dark mode is implemented via a `.dark` class on `<html>`, not via inline `style` or component-level conditionals. The `ThemeProvider` adds/removes the class via:

```ts
document.documentElement.classList.toggle('dark', theme === 'dark');
```

This means dark mode styles are handled purely by Tailwind's `dark:` variants + CSS cascade. **Do NOT** implement dark mode via `style={{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }}` — this causes hydration mismatches.

### Rule 6 — Greeting & Time-Based UI

Any UI element that depends on `new Date()` or `new Date().getHours()` **MUST** be in a `useEffect` and stored in state:

```tsx
// ✅ CORRECT pattern — from DashboardLayout.tsx
const [greeting, setGreeting] = useState<string | null>(null);

useEffect(() => {
  const hour = new Date().getHours();
  const period = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  setGreeting(`Good ${period}, ${user?.name?.split(' ')[0] || 'Admin'}!`);
}, [user?.name]);

// In JSX: render only when greeting is ready
{greeting && <p>{greeting}</p>}
```

### Rule 7 — localStorage with Error Handling

`localStorage` can throw (`SecurityError` in private mode, quota exceeded):

```tsx
// ✅ Always wrap localStorage in try/catch
try {
  const stored = localStorage.getItem('sidebar_expanded_admin');
  if (stored) {
    setExpandedSections(prev => ({ ...prev, ...JSON.parse(stored) }));
  }
} catch (error) {
  // Silently discard — non-critical UI preference
}
```

### Rule 8 — ISR (Incremental Static Regeneration) on Public Pages

The landing page uses `getStaticProps` + `revalidate` to serve SEO-optimised content without blocking on the server at request time:

```tsx
// pages/index.tsx
export async function getStaticProps() {
  const seo = await getSeoMetadata('/');
  return {
    props: { seo },
    revalidate: 60, // regenerate at most once per 60 seconds
  };
}
```

> Use `getStaticProps` + `revalidate` for public-facing marketing pages.  
> Use `getServerSideProps` for authenticated dashboard pages that require fresh session data.

---

## 🔐 Authentication & Authorization

### Hybrid Auth System
The project uses a **dual-layer auth system**:
1. **Web** → NextAuth.js session (JWT strategy, 30-day expiry)
2. **Mobile/External** → Bearer token (`Authorization: Bearer <jwt>`)

### Always Use `withAuth()` for Protected API Routes
```typescript
// ✅ CORRECT — every protected API must use this pattern
import { withAuth } from "@/lib/middleware/api-guard";
import { Role } from "@prisma/client";

export default withAuth(async (req, res) => {
  // req.user is guaranteed to be populated
  const user = (req as any).user;
  // ... handler logic
}, [Role.admin, Role.teacher]); // second param: allowed roles
```

### How `withAuth()` Works Internally
1. **Session auth** (`verifyAuth(req, res)`) is tried first — covers web users
2. **Bearer token** (`req.headers.authorization?.split(' ')[1]`) is the fallback — covers mobile/external
3. **Role check** — `superadmin` bypasses all role checks
4. **Module usage** logged fire-and-forget via `detectModule(req.url)`
5. **Subscription check** via `SubscriptionService.checkAccess(schoolId)` — returns HTTP 402 if expired

> **Do NOT** re-implement subscription checks inside handlers. The `api-guard.ts` handles it automatically for all module URLs.

### Extending `detectModule()` for New API Domains
When you create a new API domain, add it to `detectModule()` in `lib/middleware/api-guard.ts`:
```typescript
// Add new module URLs in detectModule():
if (path.includes("/api/v1/placement")) return "Placement Cell";
if (path.includes("/api/v1/canteen")) return "Canteen POS";
```

### Role Hierarchy (Prisma `Role` enum)
```
superadmin > group_admin > admin > teacher > staff > student > parent > driver
```

- `superadmin` → bypasses all role checks and subscription checks
- `group_admin` → manages multiple schools/branches; subscription gated by org plan
- `admin` → scoped to their `schoolId`
- `teacher` → scoped to their `schoolId` + assigned classes
- All non-superadmin routes **automatically** enforce subscription check

### `ROLE_DASHBOARDS` Map (from `lib/context/AuthContext.tsx`)
```typescript
export const ROLE_DASHBOARDS: Record<string, string> = {
  superadmin:   '/dashboard/superadmin',
  admin:        '/dashboard/admin',
  teacher:      '/dashboard/teacher',
  student:      '/dashboard/student',
  parent:       '/dashboard/parent',
  library:      '/dashboard/library',
  hostel:       '/dashboard/hostel',
  transport:    '/dashboard/transport',
  account:      '/dashboard/account',
  staff:        '/dashboard/staff',
  employee:     '/dashboard/employee',
  driver:       '/dashboard/driver',
  academics:    '/dashboard/academics',
  group_admin:  '/dashboard/group-admin',
  forum_user:   '/dashboard/forum',
};
```

Use this map anywhere you need to redirect a user to their home dashboard.

### Subscription Gate
- Protected modules return HTTP 402 if school subscription is expired/missing.
- Do NOT manually re-implement subscription checks inside handlers — the `api-guard.ts` handles it
- Module detection is done via URL pattern matching in `detectModule()`; **add new modules** there when creating new API domains

---

## 🧠 AuthContext (`lib/context/AuthContext.tsx`)

`useAuth()` is the **single source of truth** for the current user on the frontend.

```typescript
const {
  user,               // session.user (NextAuth) or null
  loading,            // true while session is loading
  isAuthenticated,    // !!session.user
  login,              // signIn('credentials', { email, password, redirect: false })
  logout,             // signOut({ callbackUrl: '/login' })
  adminPlanStatus,    // { status, planModel, loading }
  adminFeatures,      // [{ key, status, routes }] — feature flags for admin role
  groupOrgSubStatus,  // { status, loading } — for group_admin role
  refreshAdminData,   // call to re-fetch plan status + features
} = useAuth();
```

### Important AuthContext Behaviors
1. **Auto-redirect after login**: If session becomes available and the user is on `/login`, they are automatically redirected to their role dashboard
2. **Single-fetch guard**: `dataFetchedOnce` ref prevents `adminPlanStatus.loading` from reverting to `true` on re-navigation (avoids sidebar flicker)
3. **Event-driven refresh**: Dispatching `window.dispatchEvent(new Event('featuresUpdated'))` triggers `refreshAdminData()` — use this after superadmin changes feature states
4. **Sidebar preference refresh**: Dispatching `window.dispatchEvent(new CustomEvent('sidebarPreferencesUpdated', { detail: prefs }))` updates sidebar visibility live

---

## 🎨 Theme System (`hooks/useTheme.tsx`)

### ThemeProvider Internals
- Initialises to `'light'` on server (SSR-safe default)
- On first `useEffect`: reads `localStorage.getItem('theme')`, falls back to `window.matchMedia('(prefers-color-scheme: dark)')`
- Applies the class immediately: `document.documentElement.classList.toggle('dark', ...)`
- Exposes `mounted: boolean` — **always** use this to gate theme-dependent UI

### Correct Usage Pattern

```tsx
// ✅ Full safe pattern for theme-dependent components
const { theme, toggleTheme, mounted } = useTheme();

// Option A: Suppress flicker by returning null until mounted
if (!mounted) return <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />; // skeleton

// Option B: Inline mount guard for small interactive elements
{mounted && (
  <button onClick={toggleTheme} aria-label="Toggle theme">
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
)}

// Option C: For CSS-only dark styles — NO mounted check needed (Tailwind handles via .dark class)
<div className="bg-white dark:bg-gray-900">...</div>
```

### What Does NOT Need a `mounted` Check
- Pure CSS `dark:` class variants — Tailwind handles them via the `.dark` class on `<html>`
- Elements that look the same in both themes (no conditional logic based on `theme` value)

---

## 🗃️ Database Patterns (Prisma)

### The Golden Rules
1. **Import once** — always import the singleton: `import { prisma } from "@/lib/prisma";`
2. **Never** use `prisma.$executeRaw` for data mutations — use Prisma model methods
3. **Always** scope queries by `schoolId` for non-superadmin operations
4. **Select only what you need** — use `select: {}` or `include: {}` deliberately; avoid fetching entire models
5. **Paginate** large datasets — use `skip`/`take` with a `cursor` when possible

### Recommended Query Patterns
```typescript
// ✅ Scoped query with explicit select
const students = await prisma.student.findMany({
  where: { schoolId: user.schoolId, isActive: true },
  select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
});

// ✅ Upsert pattern for idempotent operations
await prisma.attendance.upsert({
  where: { studentId_date: { studentId, date } },
  create: { ... },
  update: { ... },
});

// ✅ Parallel queries — NEVER await sequentially when independent
const [data, total] = await Promise.all([
  prisma.student.findMany({ where, skip, take }),
  prisma.student.count({ where }),
]);
```

---

## ⚙️ API Route Patterns

### Standard API Handler Template
```typescript
// pages/api/v1/[module]/[action].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/lib/middleware/api-guard";
import { Role } from "@prisma/client";
import { z } from "zod";
import Logger from "@/lib/utils/logger";

// 1. Define Zod schema for input validation
const RequestSchema = z.object({
  // ... fields
});

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Validate input
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  try {
    // 3. Delegate to service layer
    const result = await SomeService.doSomething(parsed.data);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    Logger.error(`[ModuleName] Action failed: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: "Internal server error" });
  }
}, [Role.admin]);

export const config = { api: { bodyParser: true } };
```

### HTTP Method Convention
| Action | Method | Path Pattern |
|---|---|---|
| List/Fetch | GET | `/api/v1/[module]/list` or `/api/v1/[module]/get` |
| Create | POST | `/api/v1/[module]/create` |
| Update | PUT/PATCH | `/api/v1/[module]/update` |
| Delete | DELETE | `/api/v1/[module]/delete` |
| Bulk | POST | `/api/v1/[module]/bulk-[action]` |

### Standard API Response Shape
```typescript
// Always return one of these two shapes — never ad-hoc structures
{ success: true, data: <payload> }       // Success
{ error: "Human-readable message" }      // Error (with appropriate HTTP status)
```

---

## 🧩 Service Layer Rules

All business logic lives in `lib/services/`. API routes are **thin wrappers**.

### Service Class Pattern
```typescript
// lib/services/[feature]-service.ts
import { prisma } from "@/lib/prisma";
import Logger from "@/lib/utils/logger";

export class FeatureService {
  /**
   * Always document public methods with JSDoc
   */
  static async getList(schoolId: string, options: { page: number; limit: number }) {
    try {
      const [data, total] = await Promise.all([
        prisma.model.findMany({ where: { schoolId }, skip: ..., take: ... }),
        prisma.model.count({ where: { schoolId } }),
      ]);
      return { data, total, page: options.page, limit: options.limit };
    } catch (error: any) {
      Logger.error(`[FeatureService.getList] ${error.message}`);
      throw error; // re-throw so API handler can return 500
    }
  }
}
```

---

## ✅ Input Validation with Zod

**Every API route that accepts user input MUST validate with Zod.**

```typescript
import { z } from "zod";

// Example: Student creation schema
const CreateStudentSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number").optional(),
  classId: z.string().cuid(),
  dob: z.string().datetime().optional(),
});

// Validate
const parsed = CreateStudentSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({
    error: "Validation failed",
    details: parsed.error.flatten().fieldErrors,
  });
}
```

---

## 🧱 Frontend Component Patterns

### Page Component Template (Dashboard)
```tsx
// pages/dashboard/[role]/[module]/index.tsx
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Role } from "@prisma/client";

interface Props {
  user: { id: string; name: string; role: Role; schoolId: string };
}

export default function ModulePage({ user }: Props) {
  return (
    <DashboardLayout role={user.role as any} >
      {/* page content */}
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user) return { redirect: { destination: "/login", permanent: false } };

  const user = session.user as any;
  // Role guard
  if (user.role !== Role.admin) return { redirect: { destination: "/dashboard", permanent: false } };

  return { props: { user } };
};
```

### DashboardLayout Props
```tsx
type DashboardLayoutProps = {
  role: Role;                       // Required — determines which sidebar config to load
  children: React.ReactNode;
  actions?: React.ReactNode;        // Optional header action buttons
  customSubGreeting?: React.ReactNode; // Optional subheader content below the greeting
};
```

> `DashboardLayout` auto-handles: sidebar, mobile menu, theme toggle, greeting, route guards,  
> plan/feature-gated sidebar filtering, and role-based redirect enforcement.

### API Hook Pattern (React Query)
```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ✅ Use React Query for all data fetching on the frontend
const { data, isLoading, error } = useQuery({
  queryKey: ["module", "list", schoolId],
  queryFn: () => axios.get("/api/v1/module/list").then(r => r.data),
  staleTime: 30 * 1000, // 30s
});

// ✅ Mutation with optimistic updates and cache invalidation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (payload) => axios.post("/api/v1/module/create", payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["module", "list"] });
    toast.success("Created successfully!");
  },
  onError: (err: any) => {
    toast.error(err.response?.data?.error || "Something went wrong");
  },
});
```

### React Query Client Config (`_app.tsx`)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // prevents unnecessary refetches on tab switch
      retry: 1,                   // 1 retry on failure, then throw
    },
  },
});
```

### UI Component Standards
- Use `components/ui/` primitives (Button, Modal, Avatar, etc.) — never inline raw HTML button/input
- Use `lucide-react` for all icons (already installed, 500+ icons)
- Use `react-toastify` via `ToastContainer` in `_app.tsx` — the `ToastWrapper` is theme-aware and SSR-safe
- Use `framer-motion` for page transitions, modal entries, skeleton loaders
- Use `recharts` for charts/analytics dashboards (already installed)
- **Do NOT import** `react-hot-toast` — this project uses `react-toastify` exclusively

---

## 🧭 Navbar Patterns (`components/home/navbar/Navbar.tsx`)

### External Link auto-detection
```tsx
// External links automatically get target="_blank" + rel="noopener noreferrer"
<Link
  href={link.href}
  target={link.href.startsWith("http") ? "_blank" : undefined}
  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
>
  {link.label}
</Link>
```

### Hydration-Safe Auth Buttons in Navbar
The Navbar gates auth-state-dependent buttons (Login / Dashboard) on the `mounted` flag from `useTheme()`:

```tsx
// ✅ The established pattern — only render auth UI after mount
{mounted && (
  isAuthenticated && user ? (
    <Link href={ROLE_DASHBOARDS[user.role] || '/dashboard'}>Dashboard</Link>
  ) : (
    <Link href="/login">Login</Link>
  )
)}
```

> `mounted` from `useTheme()` is the canonical "client is ready" signal in this project.

### Simplified Navbar Mode
`Navbar` accepts a `simplified?: boolean` prop — when `true`, the navbar renders with solid backgrounds instead of glassmorphism (used in auth pages, book-demo, etc.):

```tsx
<Navbar simplified />
```

---

## 📱 Mobile App (`lxc-app/`) — Expo React Native

### Tech Stack
- **Framework**: Expo (React Native)
- **Auth**: Bearer token stored in `AsyncStorage` under key `@learnxchain_token`
- **API Base**: `https://beta.learnxchain.com/` (production, even in dev)
- **API Client**: `lxc-app/lib/api.ts` — a thin `fetch`-based wrapper

### Mobile API Client Usage
```typescript
import { api } from '@/lib/api';

// POST — automatically attaches Bearer token from AsyncStorage
const result = await api.post<UserType>('api/v1/auth/mobile-login', { email, password });

// GET
const data = await api.get<StudentData>('api/v1/student/profile');

// Persist token after login
await api.setToken(result.accessToken!);

// Clear token on logout
await api.removeToken();
```

### Mobile vs. Web API Differences
| Concern | Web | Mobile |
|---|---|---|
| Auth mechanism | NextAuth session cookie | Bearer JWT in `AsyncStorage` |
| API client | Axios (`lib/api/client.ts`) | Fetch (`lxc-app/lib/api.ts`) |
| Token storage | HTTP-only cookie | `@react-native-async-storage/async-storage` |
| Route protection | `withAuth()` session check | `withAuth()` Bearer token fallback |
| Base URL | Relative (`/api/v1/...`) | Absolute (`https://beta.learnxchain.com/api/v1/...`) |

### Running the Mobile App
```powershell
# From lxc-app\ directory
npm start         # ← lxc-app uses 'npm start', NOT 'npm run dev'
# or directly:
npx expo start
```

> **NEVER** run `npm run dev` inside `lxc-app/` — it doesn't exist. Always use `npm start`.

---

## 🐛 Logging & Error Handling

### Logger Usage
```typescript
import Logger from "@/lib/utils/logger";

// ✅ Always use structured log messages with context
Logger.info(`[ServiceName.methodName] Action completed for schoolId: ${schoolId}`);
Logger.warn(`[ServiceName] Edge case: ${description}`);
Logger.error(`[ServiceName.methodName] Failed: ${error.message}`, { stack: error.stack, schoolId });
```

### Error Boundary Pattern (Frontend)
```tsx
// Use try-catch in every async handler; never let the UI crash
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    await mutation.mutateAsync(data);
  } catch (err: any) {
    toast.error(err?.response?.data?.error || "Unexpected error. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

### Global Error Reporting
Any uncaught error on the frontend is automatically captured by `GlobalErrorListener` in `_app.tsx` and reported to `/api/v1/report-error`. Do not re-implement this.

---

## ⚡ Performance Standards

### API Performance
- Target: **<300ms** for all non-report API responses
- Use `Promise.all()` for parallel DB queries; never await sequentially when independent
- Use Upstash Redis/ioredis for caching frequently-read, rarely-changed data (e.g., school settings, config)
- Paginate all list endpoints — never return unbounded arrays

### Frontend Performance
- Use `next/dynamic` for heavy components (charts, modals, PDF viewers, below-fold landing sections)
- Use `next/image` for all images — configure `domains` in `next.config.js` as needed
- Avoid blocking `getServerSideProps` — move non-critical data fetching to client-side
- Split large pages into smaller, lazy-loaded sections
- The React `Profiler` in `_app.tsx` will warn you if any subtree renders >50ms

### Sidebar Performance (DashboardLayout)
The sidebar avoids flicker using these techniques:
1. **`mounted` flag** — renders `null` until client is ready, preventing SSR/client HTML mismatch
2. **`dataFetchedOnce` ref in AuthContext** — once plan status is fetched, `loading` never goes back to `true`
3. **localStorage sync** — sidebar collapsed/expanded state is instantly read from localStorage then persisted on change
4. **Feature filter guard** — the `adminPlanStatus.loading` check returns only always-allowed sections while features are loading, preventing a flash of unpurchased content

---

## 🔒 Security Checklist

Before shipping any feature, verify:

- [ ] API route uses `withAuth()` with correct role list
- [ ] All user inputs validated with **Zod** before processing
- [ ] No raw SQL that could allow injection — use Prisma parameterized queries only
- [ ] File uploads go through **Cloudinary** (not local filesystem in production)
- [ ] No secrets or env vars logged or returned in API responses
- [ ] `schoolId` is always scoped from `req.user.schoolId` — NEVER from `req.body` or `req.query`
- [ ] Rate limiting applied to public/auth endpoints (use `lib/middleware/rate-limit.ts`)
- [ ] External links use `target="_blank" rel="noopener noreferrer"`
- [ ] No `console.log` statements left in production code — use `Logger.*`
- [ ] Bearer tokens are never stored in `localStorage` on the web (session cookies only)
- [ ] Mobile API client always reads token from `AsyncStorage`, not hardcoded

---

## 📦 Module Status (from PROJECT_STATUS.md)

### ✅ Production Ready
- Administration, Student Management, Teacher Management
- Finance & Fees (Razorpay + Invoice generation)
- Transport (GPS tracking, driver behavior)
- Hostel (rooms, outpass), Library (books, fines)
- Communication (WhatsApp/SMS/Email via MSG91, AWS SES)

### 🚧 In Progress / Pending
| Module | Gap | Priority |
|---|---|---|
| Exam Management | Admit card / Hall ticket generation | Medium |
| Automated Timetable | AI conflict-free generator (draft exists) | Medium |
| Advanced Payroll | GST/Tax automation | Low |
| Mobile App (lxc-app) | Web ↔ Mobile sync | **High** |
| Alumni Portal | Full networking features | Low |

### 🚀 Roadmap (New Modules)
1. **Placement Cell** — Resume builder, job postings, interview scheduling
2. **Enterprise LMS** — Video lectures, SCORM/xAPI, quizzes, progress
3. **Health & Clinic** — Student health records, clinic visits
4. **Canteen POS** — Student wallet, cashless payments
5. **Sports & Achievements** — Extracurricular tracking

---

## 🧪 Testing Standards

### API Testing
- Test happy path, invalid input (400), unauthorized (401), forbidden (403), missing resource (404)
- Use real Prisma queries in integration tests — avoid mocking the DB layer
- For unit tests, mock only external services (AWS SES, MSG91, Razorpay)

### Frontend Testing
- Test form validation behavior
- Test loading states and error states
- Test that role-restricted UI elements are hidden for unauthorized roles
- Test `mounted` guard: component should return `null`/skeleton before hydration completes

---

## 💻 Shell & OS Environment

> **CRITICAL — Read before writing ANY terminal command.**

- **OS**: Windows 11
- **Shell**: PowerShell (NOT bash, NOT zsh, NOT CMD)
- **NEVER use Linux/Unix shell syntax** in any command, script, or instruction

### ❌ Forbidden (Linux/bash) — Do NOT use
```bash
mkdir -p some/deep/path
rm -rf node_modules
cp src dest
touch file.ts
export VAR=value
VAR=value npm run dev
CMD1 && CMD2        # use ; or separate lines in PS instead
ls -la
cat file.txt
```

### ✅ Use PowerShell Equivalents Instead
```powershell
# Creating nested directories
New-Item -ItemType Directory -Force -Path "some\deep\path"

# Remove folder recursively
Remove-Item -Recurse -Force node_modules

# Copy files/folders
Copy-Item -Path src -Destination dest -Recurse

# Create empty file
New-Item -ItemType File -Path file.ts

# Set environment variable for a single command
$env:VAR = "value"; npm run dev

# Chain commands (use semicolon, not &&)
npm install; npm run dev

# List files (like ls -la)
Get-ChildItem -Force

# Print file contents (like cat)
Get-Content file.txt
```

### Path Separators
- Always use **backslash** `\` in file paths for PowerShell commands
- In Node.js / TypeScript source code, use forward slash `/` (cross-platform safe via `path.join()`)
- Never hardcode `/home/`, `/usr/`, or `/tmp/` — use Windows equivalents like `$env:TEMP` or project-relative paths

### Environment Variables
- Env vars live in `.env` at the project root — loaded automatically by Next.js
- To read an env var in PowerShell: `$env:VARIABLE_NAME`
- To set temporarily: `$env:VARIABLE_NAME = "value"`
- Do NOT instruct the user to run `export VAR=value`

---

## 🏃 Development Workflow

### Running the App
```powershell
# Web app (from project root — LearnXChain\)
npm run dev

# Mobile app (Expo — from lxc-app\ directory)
# Note: lxc-app uses 'npm start', NOT 'npm run dev'
npm start
# or directly:
npx expo start
```

### Database Migrations
```powershell
# NEVER use db:push in production
npx prisma migrate dev --name "migration_name"   # development
npx prisma migrate deploy                         # production (CI/CD)
npx prisma generate                               # regenerate client after schema changes
```

### Adding a New Feature — Step-by-Step Checklist
1. **Schema first** → Add/modify models in `prisma/schema.prisma` + run `migrate dev`
2. **Validation** → Create Zod schema in `lib/validations/`
3. **Service layer** → Add static methods in `lib/services/[feature]-service.ts`
4. **API routes** → Create handlers in `pages/api/v1/[module]/` using `withAuth()`
5. **Update `detectModule()`** → in `lib/middleware/api-guard.ts` if new module domain
6. **Frontend hook** → React Query hook for data fetching/mutation
7. **UI component** → Build component using brand design system
8. **Page** → Create dashboard page with `getServerSideProps` server-side auth guard
9. **Sidebar link** → Update sidebar navigation in `lib/utils/sidebarFeatureSync.ts`

### Adding a New Sidebar Feature (Feature-Flag Aware)
The admin sidebar is feature-gated via `sidebarPreferences` and `adminFeatures`. When creating a new admin module:

1. Add the API routes to `detectModule()` in `api-guard.ts`
2. Add the nav items/section to `dashboardConfig` in `components/dashboard/config/dashboardConfig.ts`
3. Sync the section label key in `lib/utils/sidebarFeatureSync.ts` (converts label → feature key via `toUpperCase().replace(/[^A-Z0-9]+/g, '_')`)
4. Add the feature to the `FEATURE_CATALOG` in the superadmin panel so it can be enabled/disabled per school

---

## 🧠 Engineering Mindset

> Think like an engineer who **owns this product** — not just a contractor completing a ticket.

- **Backward compatibility** — never break existing API contracts without versioning
- **Graceful degradation** — if a non-critical service (MSG91, Stream.io) fails, log the error but do not crash the request
- **Idempotency** — operations like invoice creation, notification sending must be safe to retry
- **Observability** — every significant action should emit a Logger statement at an appropriate level
- **Document decisions** — add brief inline comments for non-obvious logic; JSDoc for all public service methods
- **Keep API responses consistent** — always return `{ success: true, data: ... }` or `{ error: "..." }`
- **No `console.log` in production code** — always use `Logger.*` with structured context
- **Hydration first** — when building any component that touches browser APIs, think about SSR safety before writing a single line of UI code
