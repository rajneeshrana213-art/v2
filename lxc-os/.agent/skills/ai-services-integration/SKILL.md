---
name: ai-services-integration
description: >
  Complete guide to all AI services in the LearnXChain platform. Covers the
  rit-ai monorepo (Face Recognition, Timetable AI, RIT AI Classroom), the
  integration layer (face-matcher.ts, proxy endpoints), deployment topology,
  and development workflow. Use this skill when building, debugging, or deploying
  any AI-powered feature.
---

# LearnXChain — AI Services Integration Skill

> **Three AI engines, one platform.** Face Recognition for biometric attendance,
> Timetable AI for constraint-based scheduling, and RIT AI for interactive
> AI-powered classrooms. This skill is your map to all of them.

---

## 🏗️ AI Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LearnXChain Main App                          │
│                    (Next.js — Pages Router)                      │
├──────────────┬──────────────┬───────────────────────────────────┤
│  Proxy API   │  Proxy API   │  Embedded (iframe/redirect)       │
│  /api/v1/ai  │  /api/v1/ai  │                                   │
│  /embedding  │  /timetable  │  RIT AI Classroom                 │
├──────┬───────┴──────┬───────┤  (Next.js App Router v16)         │
│      ▼              ▼       │                                   │
│ ┌──────────┐ ┌──────────┐   │  ┌──────────────────────────┐    │
│ │  Face    │ │Timetable │   │  │  rit-ai/rit/             │    │
│ │  Service │ │   AI     │   │  │  Deployed: rit.lxc.com   │    │
│ │ (Python) │ │ (Python) │   │  │  Port: 5000 (local)      │    │
│ │ Port:5002│ │ Port:8000│   │  │                          │    │
│ └──────────┘ └──────────┘   │  └──────────────────────────┘    │
└─────────────────────────────┴───────────────────────────────────┘

Deployment:
  Face + Timetable → Vercel Python Serverless (rit-ai/api/)
  RIT Classroom    → Separate Vercel Project (rit-ai/rit/)
  Fallback         → Docker (rit-ai/Dockerfile) for self-hosted
```

---

## 📁 Directory Structure (`rit-ai/`)

```
rit-ai/
├── api/                          → Vercel Serverless Functions (Python)
│   ├── face.py                   → Face recognition endpoints (Vercel)
│   └── timetable.py              → Timetable generation endpoint (Vercel)
│
├── face-attendance/              → Face Recognition Service (Standalone)
│   ├── main_app.py               → FastAPI app, port 5002
│   ├── requirements.txt          → Python deps (opencv, onnxruntime, etc.)
│   ├── model11/                  → ONNX model storage
│   └── src/
│       └── services/
│           └── faceRecognition.ts → Legacy Node.js face-api (deprecated)
│
├── timetableAi/                  → Timetable AI Service (Standalone)
│   ├── app/
│   │   ├── main.py               → FastAPI app, port 8000
│   │   ├── schema.py             → Pydantic models
│   │   ├── solver/               → OR-Tools constraint solver
│   │   └── helper/               → Utility functions
│   └── requirements.txt          → Python deps (ortools, fastapi)
│
├── rit/                          → RIT AI Classroom (Full Next.js App)
│   ├── app/                      → Next.js App Router (v16)
│   │   ├── api/                  → AI API routes (chat, quiz, generation)
│   │   ├── classroom/[id]/       → Interactive classroom view
│   │   └── page.tsx              → Home (classroom list)
│   ├── lib/
│   │   ├── ai/                   → LLM providers (OpenAI, Claude, Gemini)
│   │   ├── audio/                → TTS/ASR providers
│   │   ├── generation/           → Two-stage lesson pipeline
│   │   ├── orchestration/        → LangGraph multi-agent director
│   │   ├── pbl/                  → Project-Based Learning engine
│   │   ├── store/                → Zustand state management
│   │   └── utils/                → Dexie.js IndexedDB storage
│   ├── components/               → React UI (slide editor, whiteboard, chat)
│   ├── packages/                 → Workspace packages (pptxgenjs, mathml2omml)
│   ├── package.json              → pnpm workspace, Node ≥20.9
│   └── techstack.md              → Complete tech reference
│
├── run_all.py                    → Orchestrator (starts face + timetable)
├── Dockerfile                    → Multi-stage Docker build
├── vercel.json                   → Vercel routing for Python functions
├── requirements.txt              → Root Python dependencies
├── .env.example                  → Environment variable template
├── build-docker.bat              → Windows Docker build script
└── start.bat                     → Windows startup script
```

---

## 🧠 Service 1: Face Recognition

### Purpose
Biometric face-based attendance for teachers and staff. Generates face embeddings (512-dim float32 vectors) from photos and compares them for identity verification.

### Tech Stack
| Component | Technology |
|---|---|
| **Framework** | FastAPI (Python) |
| **Face Detection** | MediaPipe (primary) / Haar Cascade (fallback) |
| **Face Embedding** | ArcFace ONNX model (ResNet-100) |
| **Runtime** | ONNX Runtime (CPU) |
| **Image Processing** | OpenCV + NumPy |

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Model loaded check |
| `POST` | `/embedding` | Extract face embedding from image |
| `POST` | `/match-embeddings` | Compare two embeddings for identity match |

### `/embedding` — Extract Face Vector
```json
// Request
POST /embedding
{ "imageUrl": "base64_encoded_image_data_or_url" }

// Response 200
{ "embedding": "base64_float32_vector", "format": "float32-base64" }

// Response 400
{ "detail": "No face detected" }
```

### `/match-embeddings` — Compare Two Vectors
```json
// Request
POST /match-embeddings
{
  "embedding1": "base64_float32_vector",
  "embedding2": "base64_float32_vector"
}

// Response 200
{ "matched": true, "score": 0.87 }
```

### ONNX Model
- **Model**: ArcFace ResNet-100 (HuggingFace)
- **URL**: `https://huggingface.co/onnxmodelzoo/arcfaceresnet100-8/resolve/main/arcfaceresnet100-8.onnx`
- **Size**: ~250MB
- **Auto-download**: Model is downloaded on first use and cached
- **Vercel**: Stored in `/tmp/models/` (ephemeral)
- **Docker/Local**: Stored in `face-attendance/models/`

### Integration with Main App

The main Next.js app calls the face service via a **server-side proxy**:

```
User (mobile/web)
  → POST /api/v1/ai/embedding (Next.js API route)
    → lib/utils/face-matcher.ts → getFaceEmbedding()
      → POST $FACE_SERVICE_URL/embedding (Python service)
```

**Key file**: `lib/utils/face-matcher.ts`
```typescript
// Environment: FACE_SERVICE_URL=https://rit.learnxchain.com
// Local dev:   FACE_SERVICE_URL=http://localhost:5002

export async function getFaceEmbedding(imageUrl: string) → { embedding, latencyMs }
export async function compareEmbeddings(e1, e2) → { matched, score }
export async function matchFace() → DEPRECATED
```

**Embedding comparison** is done **locally in Node.js** (no round-trip to Python service). Only embedding extraction requires the Python service.

---

## 📅 Service 2: Timetable AI

### Purpose
Constraint-satisfaction-based automatic timetable generation. Uses Google OR-Tools CP-SAT solver to schedule classes, teachers, rooms, and time slots with conflict avoidance and teacher preferences.

### Tech Stack
| Component | Technology |
|---|---|
| **Framework** | FastAPI (Python) |
| **Solver** | Google OR-Tools (CP-SAT) |
| **Constraints** | Teacher conflicts, room conflicts, class conflicts |
| **Preferences** | Teacher time-slot preferences (soft constraints) |

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/generate-timetable` | Generate optimized timetable |

### `/generate-timetable` — Request Format
```json
// Request
POST /generate-timetable
{
  "payload": {
    "classes": [
      {
        "id": "cls_1",
        "roomNumber": "101",
        "subjects": [
          { "name": "Math", "teacherId": "t_1" },
          { "name": "Science", "teacherId": "t_2" }
        ],
        "periods_per_subject": 3
      }
    ],
    "rooms": [{ "id": "101" }, { "id": "102" }],
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "timeSlots": ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"]
  },
  "teacherPreferences": {
    "t_1": ["09:00", "10:00"],
    "t_2": ["14:00", "15:00"]
  }
}

// Response 200
{
  "success": true,
  "timetable": [
    {
      "classId": "cls_1",
      "subjectId": "Math",
      "teacherId": "t_1",
      "day": "Monday",
      "timeSlot": "09:00",
      "roomId": "101"
    }
  ]
}
```

### Integration with Main App

```
Admin Dashboard → "Generate Timetable" button
  → POST /api/v1/ai-timetable/generate (Next.js API)
    → lib/services/timetable/timetable-service.ts
      → POST $TIMETABLE_AI_URL/generate-timetable (Python service)
```

### Constraint Rules
1. **No teacher double-booking**: Same teacher can't be in two classes at the same time
2. **No room conflicts**: Same room can't host two classes simultaneously
3. **No class overlap**: Same class can't attend two subjects at the same time
4. **Teacher preferences**: Soft constraints — preferred time slots are prioritized

---

## 🎓 Service 3: RIT AI Classroom

### Purpose
A full-featured AI-powered interactive classroom platform. Generates complete lessons from topics or PDFs using multiple AI agents (teacher, students, assistants). Includes slide editor, whiteboard, quizzes, PBL, and export to PowerPoint.

### Identity
| Property | Value |
|---|---|
| **Framework** | Next.js 16.1.2 (App Router) |
| **Package Manager** | pnpm 10 (workspace) |
| **State Management** | Zustand + Dexie.js (IndexedDB) |
| **AI Orchestration** | LangGraph (Director Graph) |
| **AI SDKs** | Vercel AI SDK + @ai-sdk/openai + @ai-sdk/anthropic + @ai-sdk/google |
| **Port** | 5000 (dev), Vercel (prod) |
| **URL** | `https://rit.learnxchain.com` (production) |

### Key Features
| Feature | Description | Key Files |
|---|---|---|
| **Classroom Generation** | Two-stage pipeline: Outline → Scenes (parallel) | `lib/generation/pipeline-runner.ts` |
| **Multi-Agent Director** | LangGraph orchestrates 6 AI agents | `lib/orchestration/director-graph.ts` |
| **Slide Editor** | Full canvas editor (text, shapes, charts, LaTeX) | `components/slide-renderer/` |
| **Interactive Whiteboard** | Real-time drawing, annotations, formulas | `components/whiteboard/` |
| **Quiz System** | MCQ/short-answer with AI grading | `app/api/quiz-grade/route.ts` |
| **PBL Engine** | Project-based learning with AI mentors | `lib/pbl/generate-pbl.ts` |
| **TTS/ASR** | Text-to-speech and speech recognition | `lib/audio/tts-providers.ts` |
| **PPTX Export** | Export to editable PowerPoint | `lib/export/use-export-pptx.ts` |
| **PDF Import** | Upload PDF → auto-generate lesson | `app/api/parse-pdf/route.ts` |

### Storage (Browser-Only)
All user data is stored in the browser using **IndexedDB** (Dexie.js v4):
- Database name: `maic-local`
- Tables: `stages`, `scenes`, `audioFiles`, `imageFiles`, `chatSessions`, `snapshots`, etc.
- Settings: `localStorage` via Zustand persist (key: `rit-settings`)
- **No server database** required for core functionality

### Supported LLM Providers
| Provider | SDK Package | Env Variable |
|---|---|---|
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `@ai-sdk/google` | `GOOGLE_API_KEY` |
| DeepSeek | OpenAI-compatible | `DEEPSEEK_API_KEY` |
| Qwen | OpenAI-compatible | `QWEN_API_KEY` |

---

## 🔐 Environment Variables

### Face Service (`rit-ai/.env`)
```env
FACE_SERVICE_PORT=5002
FACE_MODEL_PATH=/app/face-attendance/models
FACE_THRESHOLD=0.6
MODEL_URL=https://huggingface.co/onnxmodelzoo/arcfaceresnet100-8/resolve/main/arcfaceresnet100-8.onnx
```

### Timetable Service (`rit-ai/.env`)
```env
TIMETABLE_SERVICE_PORT=8000
```

### Main App Integration (`.env`)
```env
FACE_SERVICE_URL=https://rit.learnxchain.com     # Production
FACE_SERVICE_URL=http://localhost:5002             # Local dev
AI_TIMEOUT_MS=15000                                # Face service timeout
```

### RIT Classroom (`rit-ai/rit/.env.local`)
```env
OPENAI_API_KEY=                   # Required: at least one LLM key
ANTHROPIC_API_KEY=                # Optional
GOOGLE_API_KEY=                   # Optional
DEFAULT_MODEL=anthropic:claude-3-5-haiku-20241022
TAVILY_API_KEY=                   # Optional: web search
AZURE_TTS_KEY=                    # Optional: premium TTS
AZURE_TTS_REGION=                 # Optional: Azure region
```

---

## 🚀 Development Workflow

### Start All AI Services (Local)
```powershell
# Option A: Python orchestrator (starts both Face + Timetable)
cd rit-ai
python run_all.py

# Option B: Start individually
# Face Recognition Service
cd rit-ai/face-attendance
python main_app.py      # Runs on port 5002

# Timetable AI Service
cd rit-ai/timetableAi
uvicorn app.main:app --host 0.0.0.0 --port 8000

# RIT AI Classroom
cd rit-ai/rit
pnpm install
pnpm dev               # Runs on port 5000
```

### Verify Services
```
Face:      http://localhost:5002/health  → { "status": "ok" }
Timetable: http://localhost:8000/health  → { "status": "ok" }
RIT:       http://localhost:5000         → Classroom homepage
```

### Docker (All-in-One)
```powershell
cd rit-ai
docker build -t learnxchain-ai .
docker run -p 5002:5002 -p 8000:8000 learnxchain-ai
```

---

## 📦 Deployment Topology

### Vercel (Current Production)

| Service | Deploy Method | URL |
|---|---|---|
| Face API | `rit-ai/api/face.py` → Vercel Python Serverless | `rit.learnxchain.com/api/face/*` |
| Timetable API | `rit-ai/api/timetable.py` → Vercel Python Serverless | `rit.learnxchain.com/api/timetable/*` |
| RIT Classroom | `rit-ai/rit/` → Separate Vercel Project | `rit.learnxchain.com` or `https://chat.academics-pro.com` |

### Vercel Routing (`rit-ai/vercel.json`)
```json
{
  "rewrites": [
    { "source": "/api/face/(.*)", "destination": "/api/face.py" },
    { "source": "/api/timetable/(.*)", "destination": "/api/timetable.py" }
  ]
}
```

### Docker (Self-Hosted Alternative)
Multi-stage Dockerfile builds all services into one container:
- Stage 1: Base Python 3.10 + system deps (OpenCV, gcc)
- Stage 2: Face service
- Stage 3: Timetable service
- Stage 4: Combined runtime (both services)
- Healthcheck: Pings both `/health` endpoints

---

## 🔌 Adding a New AI Service

Follow this pattern to add a new AI service to the platform:

### 1. Create the Python Service
```python
# rit-ai/[service-name]/main_app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Service Name")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/process")
async def process(data: dict):
    # Business logic
    return {"result": "processed"}
```

### 2. Create the Vercel Serverless Handler
```python
# rit-ai/api/[service].py (copy of main_app but with /api/[service]/ prefix routes)
```

### 3. Add Vercel Routing
```json
// rit-ai/vercel.json
{ "source": "/api/[service]/(.*)", "destination": "/api/[service].py" }
```

### 4. Create the Integration Layer
```typescript
// lib/utils/[service]-client.ts
const SERVICE_URL = process.env.[SERVICE]_URL;

export async function callService(data: any) {
  const response = await axios.post(`${SERVICE_URL}/process`, data, { timeout: 15000 });
  return response.data;
}
```

### 5. Create Proxy API Route
```typescript
// pages/api/v1/ai/[service].ts
import { withAuth } from '@/lib/middleware/api-guard';
import { callService } from '@/lib/utils/[service]-client';

export default withAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const result = await callService(req.body);
  return res.status(200).json({ success: true, data: result });
}, [Role.admin, Role.teacher]);
```

### 6. Register in `detectModule()`
```typescript
// lib/middleware/api-guard.ts → detectModule()
if (path.includes("/api/v1/ai")) return "AI Assistant";
```

---

## ⚠️ Anti-Patterns

```python
# ❌ Calling AI service directly from frontend (CORS + security risk)
fetch('https://rit.learnxchain.com/api/face/embedding', ...)
# ✅ Proxy through Next.js API route
fetch('/api/v1/ai/embedding', ...)

# ❌ Not handling model download failures
session = ort.InferenceSession(MODEL_PATH)  # Crashes if file is corrupted
# ✅ Validate model file before loading (check size, header bytes)

# ❌ Sending full images to match (expensive, slow)
# ✅ Extract embeddings once during registration, compare vectors during attendance

# ❌ Running OR-Tools without timeout
solver = cp_model.CpSolver()
solver.Solve(model)  # Can run forever on infeasible input
# ✅ Set solver time limit
solver.parameters.max_time_in_seconds = 30

# ❌ Hardcoding AI service URLs
FACE_URL = "http://localhost:5002"  # BAD
# ✅ Use environment variables
FACE_URL = process.env.FACE_SERVICE_URL
```

---

## 🧪 Testing AI Services

### Face Service
```powershell
# Health check
curl http://localhost:5002/health

# Extract embedding (base64 image)
curl -X POST http://localhost:5002/embedding -H "Content-Type: application/json" -d '{"imageUrl":"base64_data_here"}'

# Match embeddings
curl -X POST http://localhost:5002/match-embeddings -H "Content-Type: application/json" -d '{"embedding1":"...", "embedding2":"..."}'
```

### Timetable Service
```powershell
# Health check
curl http://localhost:8000/health

# Generate timetable
curl -X POST http://localhost:8000/generate-timetable -H "Content-Type: application/json" -d '{"payload":{"classes":[],"days":[],"timeSlots":[]}}'
```

### Mocking in Tests
```typescript
// __tests__/helpers/mock-externals.ts
export function mockFaceService() {
  vi.mock('@/lib/utils/face-matcher', () => ({
    getFaceEmbedding: vi.fn().mockResolvedValue({
      embedding: 'mock_base64_embedding',
      latencyMs: 150,
    }),
    compareEmbeddings: vi.fn().mockResolvedValue({
      matched: true,
      score: 0.92,
    }),
  }));
}
```
