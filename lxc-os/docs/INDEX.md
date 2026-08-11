# 📚 LearnXChain Documentation

> Central hub for all LearnXChain platform documentation.  
> **Last Updated:** April 2026

---

## 📁 Documentation Structure

```
docs/
├── INDEX.md                           ← You are here
│
├── getting-started/                   # Onboarding & setup
│   ├── README.md                      # Documentation package overview
│   ├── START_HERE.md                  # Quick-start optimization guide
│   ├── SETUP_GUIDE.md                 # Step-by-step dev environment setup
│   ├── DEVELOPER_GUIDE.md            # Complete development guide
│   ├── ENVIRONMENT.md                 # Environment variables reference
│   ├── CREDENTIALS.md                 # Demo login credentials (all roles)
│   ├── ROLE_HIERARCHY.md              # System roles & permissions hierarchy
│   ├── USE_API_HOOK.md                # useApi() React hook documentation
│   └── CONTRIBUTING.md                # Contribution guidelines
│
├── architecture/                      # System design & data models
│   ├── SYSTEM_DESIGN.md              # Master system architecture & design specification
│   ├── DATABASE_SCHEMA.md            # Complete Prisma schema reference
│   ├── MODULE_GUIDE.md               # Module-by-module architecture guide
│   └── project/                       # Project-level documents
│       ├── project-report.md          # Full project report
│       ├── vision.md                  # Product vision & roadmap
│       └── v1-v9.md                   # Version history (v1 → v9)
│
├── api/                               # API documentation
│   ├── API_REFERENCE.md              # Master API reference (all endpoints)
│   └── endpoints/                     # Per-role endpoint docs
│       ├── index.md                   # Endpoints index
│       ├── admin.md                   # Admin API endpoints
│       ├── super-admin.md             # Superadmin API endpoints
│       ├── teacher.md                 # Teacher API endpoints
│       ├── student.md                 # Student API endpoints
│       ├── parent.md                  # Parent API endpoints
│       ├── finance.md                 # Finance API endpoints
│       ├── hostel.md                  # Hostel API endpoints
│       ├── transport.md              # Transport API endpoints
│       └── shared.md                  # Shared/common endpoints
│
├── modules/                           # Feature module deep-dives
│   ├── FINANCE_ENGINE.md             # Finance engine (fees, ledger, receipts)
│   ├── SUBSCRIPTION_SYSTEM.md        # Subscription & billing system
│   ├── SAAS_BILLING_GUIDE.md         # SaaS auto-renewal billing guide
│   └── MOBILE_APP.md                 # Expo React Native mobile app
│
├── ai/                                # AI & machine learning
│   └── RIT_AI.md                      # RIT AI — intelligence engine overview
│
├── performance/                       # Performance optimization
│   ├── frontend/                      # Frontend performance
│   │   ├── FRONTEND_PERFORMANCE_GUIDE.md    # Next.js optimization guide
│   │   ├── DASHBOARD_PERFORMANCE_GUIDE.md   # Dashboard lazy-loading audit
│   │   ├── OPTIMIZATION_CHECKLIST.md        # Pre-deploy performance checklist
│   │   ├── OPTIMIZATION_CHEAT_SHEET.md      # Quick-reference code patterns
│   │   └── PERFORMANCE_SUMMARY.md           # Visual performance summary
│   ├── database/                      # Database performance
│   │   ├── DB_OPTIMIZATION.md               # Index & query optimization report
│   │   ├── DB_OPTIMIZATION_ROADMAP.md       # Implementation roadmap
│   │   └── DB_OPTIMIZATION_COMPLETE.md      # Completion summary
│   └── reports/                       # Automated CI/CD reports
│       ├── COMPLETE_OPTIMIZATION_REPORT.md  # Full optimization report
│       ├── AI_BUG_REPORT.md                 # AI Code Guardian scan results
│       ├── AI_PERF_SEO_REPORT.md            # Lighthouse performance & SEO
│       └── AI_QUALITY_REPORT.md             # AI DevOps quality pipeline
│
└── deployment/                        # Deployment & infrastructure
    └── VERCEL_DOMAIN_CONFIG.md        # Vercel project + domain mapping
```

---

## 🚀 Quick Navigation

### I'm a new developer
1. **[SETUP_GUIDE.md](./getting-started/SETUP_GUIDE.md)** — Set up your dev environment
2. **[DEVELOPER_GUIDE.md](./getting-started/DEVELOPER_GUIDE.md)** — Understand the architecture
3. **[CREDENTIALS.md](./getting-started/CREDENTIALS.md)** — Log in with demo accounts
4. **[ENVIRONMENT.md](./getting-started/ENVIRONMENT.md)** — Configure env variables
5. **[CONTRIBUTING.md](./getting-started/CONTRIBUTING.md)** — How to contribute

### I need to build an API
1. **[API_REFERENCE.md](./api/API_REFERENCE.md)** — Full endpoint reference
2. **[Endpoint Docs](./api/endpoints/)** — Per-role endpoint details
3. **[USE_API_HOOK.md](./getting-started/USE_API_HOOK.md)** — Frontend `useApi()` hook

### I need to understand the database
1. **[SYSTEM_DESIGN.md](./architecture/SYSTEM_DESIGN.md)** — Master system architecture & design
2. **[DATABASE_SCHEMA.md](./architecture/DATABASE_SCHEMA.md)** — All Prisma models
3. **[MODULE_GUIDE.md](./architecture/MODULE_GUIDE.md)** — Module architecture

### I'm working on a specific module
- **Finance** → [FINANCE_ENGINE.md](./modules/FINANCE_ENGINE.md)
- **Subscriptions** → [SUBSCRIPTION_SYSTEM.md](./modules/SUBSCRIPTION_SYSTEM.md)
- **SaaS Billing** → [SAAS_BILLING_GUIDE.md](./modules/SAAS_BILLING_GUIDE.md)
- **Mobile App** → [MOBILE_APP.md](./modules/MOBILE_APP.md)
- **AI / RIT AI** → [RIT_AI.md](./ai/RIT_AI.md)

### I need to optimize performance
- **Frontend** → [FRONTEND_PERFORMANCE_GUIDE.md](./performance/frontend/FRONTEND_PERFORMANCE_GUIDE.md)
- **Dashboard** → [DASHBOARD_PERFORMANCE_GUIDE.md](./performance/frontend/DASHBOARD_PERFORMANCE_GUIDE.md)
- **Database** → [DB_OPTIMIZATION_ROADMAP.md](./performance/database/DB_OPTIMIZATION_ROADMAP.md)
- **Cheat Sheet** → [OPTIMIZATION_CHEAT_SHEET.md](./performance/frontend/OPTIMIZATION_CHEAT_SHEET.md)

### I need to deploy
1. **[VERCEL_DOMAIN_CONFIG.md](./deployment/VERCEL_DOMAIN_CONFIG.md)** — Domain & project setup
2. **[OPTIMIZATION_CHECKLIST.md](./performance/frontend/OPTIMIZATION_CHECKLIST.md)** — Pre-deploy checks

### I want to check quality reports
- **[AI_BUG_REPORT.md](./performance/reports/AI_BUG_REPORT.md)** — Security & code quality scan
- **[AI_PERF_SEO_REPORT.md](./performance/reports/AI_PERF_SEO_REPORT.md)** — Lighthouse scores (all pages)
- **[AI_QUALITY_REPORT.md](./performance/reports/AI_QUALITY_REPORT.md)** — CI/CD pipeline status

---

## 📖 Documentation by Role

| Role | Start Here | Then Read |
|------|-----------|-----------|
| **Frontend Dev** | [DEVELOPER_GUIDE](./getting-started/DEVELOPER_GUIDE.md) | [MODULE_GUIDE](./architecture/MODULE_GUIDE.md), [USE_API_HOOK](./getting-started/USE_API_HOOK.md) |
| **Backend Dev** | [API_REFERENCE](./api/API_REFERENCE.md) | [DATABASE_SCHEMA](./architecture/DATABASE_SCHEMA.md), [MODULE_GUIDE](./architecture/MODULE_GUIDE.md) |
| **Full-Stack Dev** | [SETUP_GUIDE](./getting-started/SETUP_GUIDE.md) | [DEVELOPER_GUIDE](./getting-started/DEVELOPER_GUIDE.md), [API_REFERENCE](./api/API_REFERENCE.md) |
| **Mobile Dev** | [MOBILE_APP](./modules/MOBILE_APP.md) | [API_REFERENCE](./api/API_REFERENCE.md) |
| **DevOps** | [ENVIRONMENT](./getting-started/ENVIRONMENT.md) | [VERCEL_DOMAIN_CONFIG](./deployment/VERCEL_DOMAIN_CONFIG.md) |

---

## 🔑 System Overview

### Tech Stack
- **Frontend:** Next.js (Pages Router), React 19, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Prisma ORM, PostgreSQL (Neon)
- **Mobile:** Expo SDK 54, React Native, Expo Router
- **AI:** RIT AI (LLM APIs, RAG pipeline, Face Recognition)
- **Payments:** Razorpay (subscriptions + feature billing)
- **Deployment:** Vercel (web), Railway/Render (Python AI services)

### Role Hierarchy
```
superadmin > group_admin > admin > teacher > staff > student > parent > driver
|
|
enployee
```

### Key Domains
| App | URL | Source |
|-----|-----|--------|
| Web Dashboard | learnxchain.com | `apps/web` |
| AI Chatbot | https://chat.learnxchain.com | `apps/ai` |
| LMS Platform | lms.learnxchain.com | `apps/lms` |
| Face AI | rit.learnxchain.com/face | `services/face-attendance` |
| Timetable AI | rit.learnxchain.com/timetable | `services/timetable-ai` |

---

## 📞 Getting Help

1. Search this documentation
2. Check [AI_BUG_REPORT.md](./performance/reports/AI_BUG_REPORT.md) for known issues
3. Review GitHub Issues
4. Contact the development team

---

**Maintained by:** LearnXChain Development Team
