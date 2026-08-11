---
name: production-deployment
description: >
  Complete production deployment workflow for LearnXChain. Covers Vercel
  deployment, Neon database migrations, environment configuration, domain
  setup, mobile app publishing (EAS), and zero-downtime deployment strategies.
  Use this skill when deploying any part of the LearnXChain platform.
---

# LearnXChain — Production Deployment Skill

> **Production is sacred ground.** Every deployment follows a strict protocol.
> One rushed deploy can break 100+ schools. Follow this skill exactly.

---

## 🏗️ Deployment Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    LearnXChain Platform                        │
├───────────────┬───────────────┬───────────────────────────────┤
│  Web App      │  Mobile App   │  AI Service                   │
│  (Vercel)     │  (EAS/Expo)   │  (Vercel — rit-ai/)           │
│               │               │                               │
│  Next.js      │  Expo RN      │  Express/Fastify              │
│  Pages Router │  File Router  │  https://chat.academics-pro.com         │
├───────────────┴───────────────┴───────────────────────────────┤
│  Database: Neon PostgreSQL (Serverless)                        │
│  Cache: Upstash Redis                                         │
│  Storage: Cloudinary                                          │
│  Payments: Razorpay                                           │
│  Comms: MSG91 (WhatsApp/SMS) + AWS SES (Email)               │
│  Real-time: Stream.io                                         │
└───────────────────────────────────────────────────────────────┘
```

### URLs
| Environment | URL | Purpose |
|---|---|---|
| **Production** | `https://learnxchain.com` | Live platform |
| **Beta/Staging** | `https://beta.learnxchain.com` | Pre-production testing |
| **AI Service** | `https://rit.learnxchain.com` | AI chat & processing |
| **Local Dev** | `http://localhost:3000` | Development server |

---

## 📋 Deployment Checklist (Web App — Vercel)

### Pre-Deploy (Run Locally First)
```powershell
# 1. Ensure schema is valid and client is generated
npx prisma validate
npx prisma generate

# 2. TypeScript check
npx tsc --noEmit

# 3. Run tests
npm test

# 4. Build locally to catch errors before deploy
npm run build

# 5. Check for pending migrations
npx prisma migrate status
```

### Deploy to Vercel
```powershell
# Option A: Auto-deploy via Git push (recommended)
git add .
git commit -m "feat: [description of changes]"
git push origin main

# Option B: Manual deploy via Vercel CLI
npx vercel --prod
```

### Post-Deploy Verification
```
1. Open https://beta.learnxchain.com (or production URL)
2. Test login flow for admin, teacher, student roles
3. Check dashboard loads without errors
4. Verify API endpoint: GET /api/v1/dashboard/stats
5. Check Vercel Functions tab for any runtime errors
6. Monitor for 5 minutes — watch for error spikes
```

---

## 🗄️ Database Migration (Neon PostgreSQL)

### Development Migrations
```powershell
# Create a new migration from schema changes
npx prisma migrate dev --name "descriptive_name"
```

### Production Migrations
```powershell
# ALWAYS use DIRECT_URL for production migrations
# PgBouncer (pooled connection) can't handle advisory locks

# PowerShell
$env:DATABASE_URL = $env:DIRECT_URL
npx prisma migrate deploy

# Or one-liner
$env:DATABASE_URL=$env:DIRECT_URL; npx prisma migrate deploy
```

### Migration Safety Protocol
```
BEFORE running migrate deploy on production:

1. ✅ Read the migration SQL file — understand every statement
   → prisma/migrations/[timestamp]_[name]/migration.sql

2. ✅ Verify it's ADDITIVE (new tables/columns/indexes)
   → Safe: CREATE TABLE, ADD COLUMN, CREATE INDEX
   → Dangerous: DROP, ALTER COLUMN TYPE, RENAME

3. ✅ Verify Neon snapshot exists
   → Neon Dashboard → Project → Branches → main → Snapshots

4. ✅ Test the migration on a Neon branch first (optional but recommended)
   → Neon Dashboard → Create Branch → Run migration → Verify → Delete branch

5. ✅ Deploy during low-traffic hours (early morning IST)
```

### Rollback Migrations
```
Prisma does NOT have a built-in rollback command.

If a migration breaks production:
1. Revert to previous Vercel deployment (Vercel → Deployments → Promote)
2. If migration was additive → leave new columns/tables (harmless)
3. If migration was destructive → restore from Neon point-in-time recovery
4. Create a NEW migration to undo the damage — never edit old migrations
```

---

## 📱 Mobile App Deployment (EAS Build)

### Prerequisites
```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
```

### Development Build (For Testing)
```powershell
cd lxc-app

# Android development build
eas build --platform android --profile development

# iOS development build (requires Apple Developer account)
eas build --platform ios --profile development
```

### Production Build
```powershell
cd lxc-app

# Android production APK/AAB
eas build --platform android --profile production

# iOS production IPA
eas build --platform ios --profile production
```

### OTA (Over-the-Air) Update
```powershell
# Push JS-only changes without a full rebuild
cd lxc-app
eas update --branch production --message "Fix: [description]"
```

### EAS Configuration (`lxc-app/eas.json`)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Mobile API Base URL
The mobile app connects to:
- **Development**: Auto-detected local IP (`http://<ip>:3000/`)
- **Production**: `https://beta.learnxchain.com/`

This is configured in `lxc-app/lib/api.ts` → `getBaseUrl()`.

---

## 🔐 Environment Variables (Vercel)

### Setting Variables in Vercel Dashboard
```
Vercel → Project → Settings → Environment Variables

For each variable:
  - Name: VARIABLE_NAME
  - Value: the_secret_value
  - Environment: ☑ Production  ☑ Preview  ☑ Development
```

### Critical Variables

| Variable | Purpose | Where to Get It |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection | Neon Dashboard → Connection Details |
| `DIRECT_URL` | Neon direct connection | Neon Dashboard → Connection Details (Direct) |
| `NEXTAUTH_SECRET` | Session encryption | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL | `https://beta.learnxchain.com` |
| `JWT_SECRET` | Mobile token signing | `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID` | Payment gateway | Razorpay Dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | Payment gateway | Razorpay Dashboard → API Keys |
| `CLOUDINARY_*` | Image/file storage | Cloudinary Dashboard |
| `STREAM_API_KEY` | Real-time chat/video | Stream.io Dashboard |
| `STREAM_API_SECRET` | Real-time chat/video | Stream.io Dashboard |
| `MSG91_AUTH_KEY` | WhatsApp/SMS | MSG91 Dashboard |
| `UPSTASH_REDIS_*` | Rate limiting cache | Upstash Dashboard |

---

## 🌐 Domain & DNS Configuration

### Vercel Custom Domain
```
Vercel → Project → Settings → Domains → Add Domain

Domains:
  learnxchain.com        → Production
  beta.learnxchain.com   → Staging (same project, different branch)
  rit.learnxchain.com    → AI service (separate project)
```

### DNS Records (Cloudflare/Registrar)
```
Type    Name     Value                  TTL
A       @        76.76.21.21            Auto    (Vercel)
CNAME   www      cname.vercel-dns.com   Auto    (Vercel)
CNAME   beta     cname.vercel-dns.com   Auto    (Vercel staging)
CNAME   rit      cname.vercel-dns.com   Auto    (AI service)
```

---

## 🔄 Zero-Downtime Deployment Strategy

### Vercel Handles Immutable Deployments
Vercel automatically:
1. Builds the new version in isolation
2. Runs health checks
3. Atomically switches traffic to the new version
4. Keeps the old version available for instant rollback

### Database Migration Strategy (Zero-Downtime)
```
For schema changes that require data migration:

1. Deploy V1: Add new column (nullable), keep old column
2. Deploy V2: Write to BOTH old and new columns
3. Run backfill script: Copy data from old to new column
4. Deploy V3: Read from new column only
5. Deploy V4: Remove old column (after verification period)
```

---

## 🚨 Incident Response

### Production Is Down
```
1. Check Vercel Status: https://vercel-status.com
2. Check Neon Status: https://status.neon.tech
3. Check Vercel Logs: Vercel → Project → Deployments → Functions
4. If code issue → Rollback: Vercel → Deployments → Previous → Promote
5. If DB issue → Check Neon → Connection Pooler → Active connections
6. Notify team immediately
```

### Rollback Procedure
```powershell
# Option A: Vercel Dashboard
# → Deployments → Find last working deploy → ⋮ → Promote to Production

# Option B: Git revert
git revert HEAD
git push origin main
# Vercel will auto-deploy the reverted version
```

---

## 📊 Post-Deploy Monitoring

### What to Watch (First 30 Minutes)
| Metric | Where | Threshold |
|---|---|---|
| **Error rate** | Vercel → Functions | > 1% → investigate |
| **Response time** | Vercel → Analytics | p95 > 3s → investigate |
| **DB connections** | Neon → Dashboard | > 80% pool → scale |
| **Memory usage** | Vercel → Functions | > 1024MB → optimize |
| **Build time** | Vercel → Deployments | > 10min → optimize imports |

### Health Check Endpoints
```
GET https://beta.learnxchain.com/api/v1/public/health
→ Should return { status: "ok", timestamp: "..." }

GET https://beta.learnxchain.com/api/v1/public/version
→ Should return { version: "x.y.z", commit: "abc123" }
```

---

## ⚠️ Deployment Anti-Patterns

```
❌ Deploying on Friday evening
   → If it breaks, nobody is available to fix it

❌ Deploying without running `npm run build` locally
   → Build errors caught on Vercel waste 5-10 minutes per attempt

❌ Running `prisma migrate dev` against production database
   → ALWAYS use `prisma migrate deploy` for production

❌ Hardcoding API base URL to localhost in committed code
   → Use environment variables or the getBaseUrl() pattern

❌ Deploying schema changes without reviewing the migration SQL
   → Always read prisma/migrations/[timestamp]/migration.sql

❌ Deploying without checking pending migrations first
   → Run `npx prisma migrate status` before every deploy

❌ Skipping post-deploy verification
   → Always test login + dashboard + key API after deploy
```
