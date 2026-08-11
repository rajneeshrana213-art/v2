# 🚀 Getting Started with LearnXChain

Welcome to the **LearnXChain** monorepo — a full-stack educational management platform powered by AI.

---

## 📋 Prerequisites

Before you begin, make sure you have these installed:

| Tool | Version | Purpose |
|:---|:---|:---|
| **Node.js** | v20.9+ | Runtime for all JS/TS apps |
| **pnpm** | v10.22+ | Package manager (monorepo-aware) |
| **Python** | 3.10+ | AI services (face-attendance, timetable) |
| **PostgreSQL** | 15+ | Primary database (or use [Neon.tech](https://neon.tech)) |
| **Redis** | 7+ | Caching & session management |
| **Docker** | Latest | _(Optional)_ For containerized AI services |
| **Git** | Latest | Version control |

### Install pnpm (if not installed)

```bash
# Using npm
npm install -g pnpm@10

# Or using corepack (recommended)
corepack enable
corepack prepare pnpm@10.22.0 --activate
```

---

## 📂 Monorepo Structure

This is a **Turborepo** monorepo managed with **pnpm workspaces**.

```
learnxchain-monorepo/
├── apps/
│   ├── web/          → Main dashboard & API (Next.js 16, Pages Router)
│   ├── ai/           → AI Classroom & Chat (Next.js 16, App Router)
│   ├── lms/          → Learning Management System (CRA + Express)
│   └── mobile/       → Mobile app (Expo React Native)
├── packages/
│   ├── eslint-config → Shared ESLint configuration
│   ├── tsconfig/     → Shared TypeScript configs
│   ├── mathml2omml/  → MathML conversion library
│   └── pptxgenjs/    → PowerPoint generation library
├── services/
│   ├── face-attendance/  → Python face recognition service
│   ├── timetable-ai/     → Python timetable generator
│   └── ai-orchestrator/  → AI service orchestration
├── turbo.json        → Turborepo pipeline configuration
├── pnpm-workspace.yaml
└── package.json      → Root scripts
```

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rajneeshrana0/rit.git
cd rit
```

### 2. Install Dependencies

```bash
pnpm install
```

> This will install all dependencies across all apps and packages, and automatically run `prisma generate` for the web app.

### 3. Set Up Environment Variables

#### Web App (`apps/web`)

```bash
cd apps/web
cp example.env .env
```

Edit `.env` and fill in at minimum:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/learnxchain
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000

# AI Services (local defaults)
FACE_SERVICE_URL=http://localhost:5002
TIMETABLE_AI_URL=http://localhost:8000/generate-timetable

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Stream Chat (for messaging)
STREAM_API_KEY=your-key
STREAM_API_SECRET=your-secret
NEXT_PUBLIC_STREAM_API_KEY=your-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### AI App (`apps/ai`)

```bash
cd apps/ai
cp .env.example .env.local
```

Edit `.env.local` — you only need to configure the AI providers you want to use:

```env
# At minimum, configure one LLM provider:
OPENAI_API_KEY=sk-...
# or
GOOGLE_API_KEY=AIza...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Initialize the Database

```bash
# From the monorepo root:
pnpm db:generate          # Generate Prisma client
pnpm db:migrate:dev       # Run migrations

# Or from apps/web directly:
cd apps/web
npx prisma migrate dev    # Create/apply migrations
npx prisma generate       # Generate the client
```

### 5. Start Development

```bash
# Start ALL apps simultaneously (from root):
pnpm dev

# Or start individual apps:
pnpm dev:web    # → http://localhost:3000  (Dashboard & API)
pnpm dev:ai     # → http://localhost:5000  (AI Classroom)
pnpm dev:lms    # → http://localhost:3000  (LMS — note: change port if running with web)
pnpm dev:mobile # → Expo dev server
```

---

## 🤖 Python AI Services (Optional)

The face recognition and timetable AI services run as separate Python processes.

### Face Attendance Service

```bash
cd services/face-attendance
pip install -r requirements.txt
python main_app.py
# → Runs on http://localhost:5002
```

### Timetable AI Service

```bash
cd services/timetable-ai
pip install -r requirements.txt
# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
# → Runs on http://localhost:8000
```

---

## 🗄️ Database Commands

All database commands use Prisma and are scoped to `apps/web`:

```bash
# From monorepo root:
pnpm db:generate         # Regenerate Prisma client after schema changes
pnpm db:migrate:dev      # Create & apply a new migration
pnpm db:migrate:deploy   # Apply pending migrations (production)
pnpm db:studio           # Open Prisma Studio GUI → http://localhost:5555

# Creating a named migration:
cd apps/web
npx prisma migrate dev --name add_new_feature
```

---

## 🏗️ Building for Production

```bash
# Build all apps:
pnpm build

# Build specific apps:
pnpm build:web
pnpm build:ai
pnpm build:lms
```

---

## 🌐 Deployment Mapping

| App | Domain | Platform |
|:---|:---|:---|
| `apps/web` | [learnxchain.com](https://learnxchain.com) | Vercel |
| `apps/ai` | [https://chat.learnxchain.com](https://chat.learnxchain.com) | Vercel |
| `apps/lms` | [lms.learnxchain.com](https://lms.learnxchain.com) | Vercel |
| `apps/mobile` | App Store / Play Store | EAS Build |
| `services/*` | [rit.learnxchain.com](https://rit.learnxchain.com) | Railway / Render |

Each Vercel app has its own `vercel.json` with Turborepo-aware build commands. See `vercel apps domain config` for DNS details.

---

## 📱 Mobile App (Expo)

```bash
# Start Expo dev server
pnpm dev:mobile

# Build for iOS/Android
cd apps/mobile
npx eas build --platform ios
npx eas build --platform android
```

---

## 🔧 Useful Commands

| Command | Description |
|:---|:---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests across all apps |
| `pnpm db:studio` | Open Prisma Studio database GUI |
| `pnpm clean` | Remove all `node_modules` and build artifacts |
| `pnpm format` | Format all files with Prettier |

---

## 🔐 Key Architecture Notes

- **Authentication**: NextAuth.js v4 with Prisma adapter (in `apps/web`)
- **RBAC Roles**: Superadmin, Admin, Teacher, Student, Parent, and specialized roles (Hostel, Library, Transport, Accounts)
- **API Routes**: Located in `apps/web/pages/api/` — modular structure per feature
- **Database**: Single PostgreSQL database managed by Prisma ORM (`apps/web/prisma/schema.prisma` — 185KB+ schema)
- **Real-time**: Stream SDK for chat/video, Socket.io for live updates
- **Payments**: Razorpay integration for fee management
- **AI Services**: Python microservices communicate via REST API with the web app

---

## 🆘 Troubleshooting

### `prisma generate` fails
```bash
cd apps/web && npx prisma generate
```
Make sure `DATABASE_URL` is set in `apps/web/.env`.

### Port conflicts
The web app runs on `:3000` and AI app on `:5000` by default. If LMS also tries `:3000`, update the start script in `apps/lms/package.json`.

### pnpm install fails with EPERM
Run your terminal **as Administrator** on Windows, or:
```bash
pnpm store prune
pnpm install --force
```

### Python service errors
Make sure Python 3.10+ is installed and in your PATH:
```bash
python --version
pip install -r requirements.txt
```

---

© 2026 LearnXChain. All rights reserved.
