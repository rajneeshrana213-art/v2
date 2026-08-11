---
name: project-file-index
description: >
  Compact file-index and module map for LearnXChain. Read this FIRST on any task
  to know exactly where files live — avoids scanning the entire codebase and saves
  significant token usage. Use `learnxchain-senior-architect` skill only when you
  need detailed code patterns or architecture rules.
---

# LearnXChain — Project File Index

> **Read this skill FIRST** before any task. It tells you WHERE things are.
> Only read the `learnxchain-senior-architect` skill when you need HOW to write code (patterns, rules, conventions).

---

## Quick Lookup: "Where do I find…?"

| You need to… | Look here |
|---|---|
| Add/modify a DB model | `prisma/schema.prisma` |
| Create an API endpoint | `pages/api/v1/<module>/<action>.ts` |
| Protect an API route | `lib/middleware/api-guard.ts` → `withAuth()` |
| Add rate limiting | `lib/middleware/rate-limit.ts` |
| Add a dashboard page | `pages/dashboard/<role>/<module>/index.tsx` |
| Add sidebar nav items | `components/dashboard/config/dashboardConfig.ts` |
| Sync sidebar ↔ features | `lib/utils/sidebarFeatureSync.ts` |
| Register new module in auth guard | `lib/middleware/api-guard.ts` → `detectModule()` |
| Add a Zod validation schema | `lib/validations/<module>.ts` |
| Add business logic | `lib/services/<module>-service.ts` |
| Modify landing page | `pages/index.tsx` + `components/home/<section>/` |
| Modify login/auth flow | `pages/login.tsx` + `lib/auth.ts` + `lib/context/AuthContext.tsx` |
| Configure theme | `hooks/useTheme.tsx` |
| Use brand colors | `lib/brand-colors.ts` + `tailwind.config.js` |
| Send emails | `lib/utils/mailer.ts` + `lib/services/emailService.ts` |
| Send WhatsApp/SMS | `lib/services/msg91-service.ts` + `lib/services/whatsapp-service.ts` |
| Generate invoices/PDFs | `lib/utils/invoice-utils.ts` |
| Format currency | `lib/utils/currency.ts` |
| Export CSV/Excel | `lib/utils/export-utils.ts` |
| Add logging | `lib/utils/logger.ts` → `Logger.info/warn/error()` |
| Configure Prisma client | `lib/prisma.ts` |
| Modify app providers | `pages/_app.tsx` |
| Modify HTML shell | `pages/_document.tsx` |
| Add/use SEO component | `components/seo/` + `lib/seo/` |
| Mobile app entry | `lxc-app/app/` (Expo file-based routing) |
| Mobile API calls | `lxc-app/lib/api.ts` |

---

## Core File Map

### Entry Points
```
pages/_app.tsx             → Provider stack, fonts, error reporting, React Query
pages/_document.tsx        → HTML shell (<head>, <body>)
pages/index.tsx            → Landing page (ISR with getStaticProps)
pages/login.tsx            → Login page (credentials auth)
middleware.ts              → Next.js edge middleware (route protection)
```

### Auth & Security
```
lib/auth.ts                → NextAuth config (JWT strategy, callbacks, verifyAuth)
lib/context/AuthContext.tsx → useAuth() hook, ROLE_DASHBOARDS map, feature flags
lib/middleware/api-guard.ts → withAuth() HOF, detectModule(), subscription check
lib/middleware/rate-limit.ts → Rate limiting with Upstash
lib/middleware/cors.ts      → CORS configuration
lib/middleware/cron-guard.ts → Cron job protection
lib/middleware/audit-log.ts → Audit logging middleware
```

### Database
```
prisma/schema.prisma       → ALL models (single source of truth)
lib/prisma.ts              → Prisma client singleton
lib/db/                    → DB utility helpers
```

### Theme & UI Framework
```
hooks/useTheme.tsx         → ThemeProvider + useTheme() + mounted flag
lib/brand-colors.ts        → Brand color constants (TS)
tailwind.config.js         → Extended Tailwind config (brand.*)
```

### Dashboard Layout
```
components/dashboard/layout/DashboardLayout.tsx   → Main layout wrapper
components/dashboard/config/dashboardConfig.ts    → Sidebar nav config (ALL roles, 30KB)
lib/utils/sidebarFeatureSync.ts                   → Feature key ↔ sidebar section mapping
```

### UI Primitives (`components/ui/`)
```
button.tsx, card.tsx, badge.tsx, avatar.tsx
dialog.tsx, select.tsx, switch.tsx, tabs.tsx
input.tsx, label.tsx, container.tsx
data-table.tsx, dropdown-menu.tsx
badges/, cards/, charts/, feedback/, forms/
layout/, modals/, table/, utils/
```

---

## API Domain Map (`pages/api/v1/`)

| Domain | Path | Description |
|---|---|---|
| Academic | `v1/academic/` | Classes, subjects, sections, exams |
| Account | `v1/account/` | Account role management |
| Admin | `v1/admin/` | Admin-scoped operations |
| AI | `v1/ai/` | AI integrations |
| AI Timetable | `v1/ai-timetable/` | Auto-generated timetables |
| Analytics | `v1/analytics/` | Reports, dashboards |
| Attendance | `v1/attendance/` | Attendance tracking (web + face) |
| Auth | `v1/auth/` | Login, register, mobile auth |
| Careers | `v1/careers/` | Career/placement APIs |
| Communication | `v1/communication/` | Notices, WhatsApp, SMS, Email |
| Daily | `v1/daily/` | Daily activities |
| Dashboard | `v1/dashboard/` | Dashboard stats APIs |
| Demo | `v1/demo/` | Demo/trial management |
| Employee | `v1/employee/` | HRM / payroll |
| Finance | `v1/finance/` | Fees, invoices, payments (Razorpay) |
| Forum | `v1/forum/` | Discussion forum |
| Group Admin | `v1/group-admin/` | Multi-branch management |
| Hostel | `v1/hostel/` | Rooms, outpass, hostel fees |
| Leads | `v1/leads/` | Lead/enquiry management |
| Library | `v1/library/` | Books, issue/return, fines |
| Notification | `v1/notification/` | Push/email notifications |
| Onboarding | `v1/onboarding/` | School onboarding wizard |
| Project | `v1/project/` | Project management |
| Public | `v1/public/` | Public-facing APIs (no auth) |
| Student | `v1/student/` | Student CRUD, profiles |
| Superadmin | `v1/superadmin/` | Platform management (schools, plans, features) |
| Teacher | `v1/teacher/` | Teacher CRUD, assignments |
| Transport | `v1/transport/` | Routes, GPS, drivers, trips |
| User | `v1/user/` | User profile, preferences |
| Verify | `v1/verify/` | Email/phone verification |

---

## Service Layer Map (`lib/services/`)

### Root-Level Services
```
student-service.ts              → Student CRUD, bulk operations
teacher-service.ts              → Teacher CRUD, class assignments
user-service.ts                 → User profile, roles
school-service.ts               → School settings, config
onboarding-service.ts           → School setup wizard (15KB)
attendance-service.ts           → Attendance tracking
academic-service.ts             → Classes, subjects, sections
academic-activity-service.ts    → Assignments, activities
account-service.ts              → Accountant role operations
daily-activity-service.ts       → Daily student activities
performance-service.ts          → Student/teacher performance analytics (16KB)
library-service.ts              → Library CRUD, issue/return (14KB)
leads-service.ts                → Lead/enquiry management
transport-service.ts            → Routes, stops, assignments
trip-service.ts                 → Live trips, GPS tracking
driver-behavior-service.ts      → Driver safety scoring
transport-notification.ts       → Transport alerts
location-service.ts             → Geolocation/geofencing
student-dashboard-service.ts    → Student portal dashboard (14KB)
student-service.ts              → Student management (18KB)
student-id-card-service.ts      → ID card generation
student-leaderboard-service.ts  → Gamification/leaderboard
student-roadmap-service.ts      → Learning roadmap
password-service.ts             → Password reset/change
emailService.ts                 → Email dispatch
msg91-service.ts                → WhatsApp/SMS via MSG91
msg91-template-service.ts       → MSG91 template management
sms-service.ts                  → SMS dispatch
whatsapp-service.ts             → WhatsApp messaging
notification.ts                 → Push notification dispatch
stream-sync.ts                  → Stream.io user sync
DemoService.ts                  → Demo session management
bulk-upload-job-service.ts      → Bulk CSV/Excel uploads
```

### Subdirectory Services
```
lib/services/admin/             → Admin-specific services
lib/services/analytics/         → Analytics/reporting services
lib/services/common/            → Shared/reusable services
lib/services/communication/     → Communication services
lib/services/dashboard/         → Dashboard aggregation services
lib/services/finance/           → Fee, invoice, payment services
lib/services/hostel/            → Hostel management services
lib/services/notification/      → Notification services
lib/services/project/           → Project management services
lib/services/reports/           → Report generation services
lib/services/student/           → Student-scoped sub-services
lib/services/superadmin/        → Platform-level admin services
lib/services/teacher/           → Teacher-scoped sub-services
lib/services/timetable/         → Timetable generation services
lib/services/transport/         → Transport sub-services
```

---

## Validation Schemas Map (`lib/validations/`)

```
auth.ts                → Login, register, password schemas
student.ts             → Student CRUD schemas
academic.ts            → Class, subject, section schemas
academic-activity.ts   → Assignment, activity schemas
daily-activity.ts      → Daily activity schemas
finance.ts             → Fee, payment, invoice schemas
finance/               → Finance sub-validations
hostel.ts              → Hostel, room, outpass schemas
library.ts             → Book, issue, return schemas
transport.ts           → Route, stop, trip schemas
demo.ts                → Demo request schemas
project.ts             → Project management schemas
admin/                 → Admin-specific schemas
superadmin/            → Superadmin schemas
teacher/               → Teacher-specific schemas
```

---

## Dashboard Pages Map (`pages/dashboard/`)

```
dashboard/admin/           → Admin panel pages
dashboard/student/         → Student portal pages
dashboard/teacher/         → Teacher portal pages
dashboard/superadmin/      → Platform management pages
dashboard/parent/          → Parent portal pages
dashboard/group-admin/     → Multi-branch admin pages
dashboard/employee/        → HRM pages
dashboard/staff/           → Staff pages
dashboard/hostel/          → Hostel warden pages
dashboard/library/         → Librarian pages
dashboard/transport/       → Transport manager pages
dashboard/driver/          → Driver pages
dashboard/academics/       → Academic role pages
dashboard/forum/           → Forum pages
dashboard/profile.tsx      → Shared profile page
```

---

## Mobile App Map (`lxc-app/`)

```
lxc-app/app/               → Expo file-based routing (pages)
lxc-app/components/         → Mobile-specific components
lxc-app/lib/api.ts          → API client (fetch + Bearer token)
lxc-app/lib/                → Mobile utilities
lxc-app/constants/          → Mobile constants/config
lxc-app/shared/             → Shared code between web/mobile
lxc-app/assets/             → Images, fonts, icons
lxc-app/app.json            → Expo config
lxc-app/eas.json            → EAS Build config
lxc-app/metro.config.js     → Metro bundler config
```

---

## Utility Files Map (`lib/utils/`)

```
logger.ts                 → Winston logger (ALWAYS USE — never console.log)
mailer.ts                 → Email dispatch (AWS SES, SendGrid, Nodemailer)
invoice-utils.ts          → Invoice/PDF generation (18KB)
currency.ts               → Indian currency formatting (₹)
date-utils.ts             → Date/time helpers
export-utils.ts           → CSV/Excel export
sidebarFeatureSync.ts     → Feature key ↔ sidebar mapping
face-matcher.ts           → Face recognition matching
geo-fence.ts              → Geofencing calculations
hashId.ts                 → ID hashing/obfuscation
id-card-generator.ts      → Student ID card generation
id-card-templates.ts      → ID card PDF templates
emailChecker.ts           → Email validation
error-notifier.ts         → Error notification dispatch
performance.ts            → Performance measurement
school-utils.ts           → School-specific helpers
slugify.ts                → URL slug generation
template-engine.ts        → Template rendering
common.ts                 → Common utility functions
cache.ts                  → Caching helpers
```

---

## Config Files

```
.env                       → Environment variables (auto-loaded by Next.js)
next.config.js             → Next.js config (domains, redirects, etc.)
tailwind.config.js         → Tailwind config (brand colors, animations)
tsconfig.json              → TypeScript config
package.json               → Dependencies + scripts
prisma/schema.prisma       → Database schema
lib/config.ts              → Central app config constants
lib/config/                → Config subdirectory
```

---

## Key Patterns — Quick Reference

### Imports you'll use 90% of the time
```typescript
// Auth
import { withAuth } from "@/lib/middleware/api-guard";
import { Role } from "@prisma/client";

// DB
import { prisma } from "@/lib/prisma";

// Validation
import { z } from "zod";

// Logging
import Logger from "@/lib/utils/logger";

// Frontend auth
import { useAuth } from "@/lib/context/AuthContext";
const { user, isAuthenticated, loading } = useAuth();

// Theme
import { useTheme } from "@/hooks/useTheme";
const { theme, toggleTheme, mounted } = useTheme();

// Layout
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

// React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Toast (NOT react-hot-toast)
import { toast } from "react-toastify";

// Icons
import { IconName } from "lucide-react";

// Motion
import { motion } from "framer-motion";
```

### Response shapes
```typescript
// Success
{ success: true, data: <payload> }

// Error
{ error: "Human-readable message" }
```

### Role hierarchy
```
superadmin > group_admin > admin > teacher > staff > student > parent > driver
```
