# 🚀 LearnXChain(LXC): The Next-Gen Educational Ecosystem

**LearnXChain** is a high-performance, full-stack educational management platform built as a **Turborepo monorepo** with **Next.js 16**, **TypeScript**, **Prisma**, and **Python AI services**. It integrates advanced AI capabilities, role-based access control, and a comprehensive suite of ERP/LMS features into a unified platform.

> **New here?** Check out the [Getting Started Guide](./getting-started.md) for setup instructions.

---

## 🌟 Key Features

### 🏛️ ERP & Administration
- **Multi-Role Dashboards**: Custom experiences for Superadmins, Admins, Teachers, Students, Parents, and specialized staff (Accounts, Transport, Hostel, etc.)
- **Finance & Fee Management**: Automated fee structures, payment tracking with **Razorpay** integration, and financial reporting
- **Lead & Admission Management**: Streamlined student onboarding and lead tracking
- **Academic Management**: Class scheduling, subject allocation, and curriculum planning

### 📚 Learning Management (LMS)
- **Course & Content Delivery**: Interactive lesson planning and resource sharing
- **Homework & Assessments**: Digital assignments, automated grading, and student roadmaps
- **Exam Management**: Comprehensive exam scheduling, result processing, and report card generation

### 🤖 Advanced AI Services
- **AI Classroom** (`apps/ai`): Multi-LLM chat interface supporting OpenAI, Anthropic, Google, and more
- **Face Attendance** (`services/face-attendance`): Python-based automated attendance tracking via facial recognition
- **AI Timetable Generator** (`services/timetable-ai`): Intelligent scheduling engine that optimizes resource allocation

### 💬 Communication & Collaboration
- **Real-time Messaging**: Powered by **Stream SDK** for seamless teacher-student communication
- **Omnichannel Notifications**: Integrated **Twilio (SMS)**, **WhatsApp**, and **SendGrid/SES (Email)** for automated alerts
- **Video Conferencing**: Native **Zoom** integration for virtual classrooms

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| **Backend** | API Routes (Next.js), Express.js (LMS) |
| **Database** | PostgreSQL (Prisma ORM), MongoDB (LMS) |
| **AI/ML** | Python, OpenAI, Anthropic, Google AI, Face Recognition |
| **Real-time** | Stream SDK, Socket.io |
| **Payments** | Razorpay Integration |
| **Mobile** | Expo React Native |
| **Infrastructure** | Redis, Cloudinary, Docker, Turborepo |
| **Deployment** | Vercel (web apps), Railway/Render (Python services), EAS (mobile) |

---

## 📂 Monorepo Architecture

```text
learnxchain-monorepo/
├── apps/
│   ├── web/              → Dashboard & API (Next.js 16, Pages Router)
│   │   ├── pages/api/    → Modular API endpoints
│   │   ├── pages/dashboard/ → Role-based dashboard routes
│   │   ├── components/   → Premium UI components
│   │   ├── lib/services/ → Business logic layer
│   │   └── prisma/       → Database schema & migrations
│   ├── ai/               → AI Classroom (Next.js 16, App Router)
│   ├── lms/              → Learning Management System (CRA + Express)
│   └── mobile/           → Mobile app (Expo React Native)
├── packages/
│   ├── eslint-config/    → Shared linting rules
│   ├── tsconfig/         → Shared TypeScript configs
│   ├── mathml2omml/      → MathML conversion library
│   └── pptxgenjs/        → PowerPoint generation library
├── services/
│   ├── face-attendance/  → Python face recognition microservice
│   ├── timetable-ai/     → Python timetable optimization
│   └── ai-orchestrator/  → AI service orchestration
├── turbo.json            → Build pipeline configuration
└── pnpm-workspace.yaml   → Workspace definition
```

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Primary Scope |
| :--- | :--- |
| **Superadmin** | Global configuration, security, and multi-tenant oversight |
| **Admin** | School operations, staff management, and financial control |
| **Teacher** | Classroom management, attendance, and grading |
| **Student** | Learning path, homework, and performance tracking |
| **Parent** | Child monitoring, fee payments, and communication |
| **Specialized** | Hostel, Library, Transport, and Accounts modules |

---

## ⚡ Quick Start

```bash
# Clone & install
git clone https://github.com/rajneeshrana0/rit.git
cd rit
pnpm install

# Set up environment
cd apps/web && cp example.env .env  # Edit .env with your values
cd ../ai && cp .env.example .env.local  # Configure AI providers

# Initialize database
pnpm db:migrate:dev

# Start development
pnpm dev
```

👉 See the full [Getting Started Guide](./getting-started.md) for detailed instructions.

---

## 🌐 Deployment

| App | Domain | Platform |
|:---|:---|:---|
| `apps/web` | learnxchain.com | Vercel |
| `apps/ai` | https://chat.learnxchain.com | Vercel |
| `apps/lms` | lms.learnxchain.com | Vercel |
| `apps/mobile` | App Store / Play Store | EAS Build |
| `services/*` | rit.learnxchain.com | Railway / Render |

---

## 📜 License

*Copyright © 2026 LearnXChain. All rights reserved.*
