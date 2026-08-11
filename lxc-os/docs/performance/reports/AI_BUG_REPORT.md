# 🛡️ AI Bug Intelligence Report

> **Last updated:** 2026-04-07T07:40:24.634Z
> **Scan trigger:** GitHub Actions – AI Code Guardian

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total findings | **437** |
| 🔴 Critical | 0 |
| 🟠 High | 15 |
| 🟡 Medium | 24 |
| 🟢 Low | 398 |
| Open | 437 |
| Fixed | *(tracked via closed GitHub Issues)* |
| **Risk Score** | **521** *(10×Critical + 5×High + 2×Medium + 1×Low)* |

---

## 🚨 Severity Distribution

```
Critical  [....................] 0
High      [███████████████.....] 15
Medium    [████████████████████] 24
Low       [████████████████████] 398
```

---

## 🔁 Recurring Patterns (Top 5)

| Check ID | Occurrences |
|----------|-------------|
| `QUAL-001` | 358 |
| `QUAL-002` | 40 |
| `SEC-005` | 24 |
| `SEC-003` | 15 |

---

## 📋 Findings (latest scan)

| Severity | Check ID | Title | Location |
|----------|----------|-------|----------|
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/auth/forgot-password.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/auth/reset-password.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/careers/apply.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/careers/jobs/[id].ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/careers/jobs.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/demo/book.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/finance/webhook/razorpay.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/forum/register.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/group-admin/register.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/public/attendance/punch.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/public/attendance/today.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/public/registration/submit.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/public/registration/validate.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/transport/drivers/register.ts:1` |
| 🟠 High | `SEC-003` | API route missing authentication check | `pages/api/v1/verify/[docId].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/core/staff/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/core/staff/accounts/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/core/staff/hostel/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/core/staff/library/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/core/staff/transport/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/announcements/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/announcements/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/events/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/holidays/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/holidays/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/departments/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/departments/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/designations/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/designations/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/duties/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/duties/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/inventory/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/hrm/inventory/index.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/admin/dashboard/notices/[id].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/finance/import/template/[type].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/finance/invoice/fee/[paymentId].ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/finance/subscription/create-order.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/superadmin/performance.ts:1` |
| 🟡 Medium | `SEC-005` | Unhandled promise rejection – async API handler without try/catch | `pages/api/v1/superadmin/web-vitals.ts:1` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `components/dashboard/shared/communication/ChatPanel.tsx:174` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `components/seo/AnalyticsDashboard.tsx:168` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `components/ui/badge.tsx:41` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `components/ui/data-table.tsx:135` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/auth.ts:91` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/context/AuthContext.tsx:74` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/cron-jobs/subscription-management.ts:32` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/middleware/audit-log.ts:52` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/performance/fontOptimization.ts:105` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/performance/monitoring.ts:112` |
| 🟢 Low | `QUAL-001` | Use of `as any` disabling TypeScript type safety | `lib/prisma.ts:81` |


> ⚠️ Showing first 50 of 437 findings. See the full JSON artifact on the Actions run.


---

## 🗂️ Check Reference

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| SEC-001 | Critical | Security | Hardcoded JWT / NextAuth secret fallback |
| SEC-002 | High | Security | console.log leaking sensitive data |
| SEC-003 | High | Security | API route missing authentication check |
| SEC-004 | Medium | Security | Missing leading slash in PUBLIC_PATHS entry |
| SEC-005 | Medium | Security | Unhandled promise rejection in async handler |
| QUAL-001 | Low | Quality | Use of `as any` disabling TypeScript type safety |
| QUAL-002 | Low | Quality | Dead / placeholder TODO comment |
| ESLINT-* | High/Med | Linting | ESLint rule violations |
| TSC-* | High | Types | TypeScript compilation errors |

---

## 📖 About

This report is generated and maintained automatically by the **AI Code Guardian** workflow
(`.github/workflows/ai-code-guardian.yml`). It runs on every push, pull request, and every
6 hours on a schedule.

- A consolidated bug summary GitHub Issue is created automatically on every scan.
- Individual GitHub Issues are opened automatically for Critical and High severity findings.
- Critical issues trigger a dedicated PR with a suggested patch.
- Re-analysis runs after every push / merge to main.

*© LXC v2 – AI Code Guardian*
