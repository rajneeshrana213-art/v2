# LearnXChain — Tech Stack & Data Storage Reference

> Complete guide to every technology used and exactly where all data lives.

---

## Framework & Runtime

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.2 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI rendering |
| **Node.js** | ≥ 20.9.0 | Server runtime |
| **TypeScript** | Latest | Type-safe development across all files |

---

## Styling & UI

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | v4 | Utility-first CSS framework |
| **Lucide React** | ^0.562.0 | Icon library |
| **Framer Motion** (`motion`) | ^12.27.5 | Animations and transitions |
| **Radix UI** | Various | Accessible headless UI primitives (checkbox, popover, slider, switch) |
| **Base UI** (`@base-ui/react`) | ^1.1.0 | Additional headless primitives |
| **CMDK** | ^1.1.1 | Command palette / search dialog |
| **Embla Carousel** | ^8.6.0 | Touch-friendly carousel |
| **Animate.css** | ^4.1.1 | CSS animation classes |
| **CVA** (`class-variance-authority`) | ^0.7.1 | Variant-based component styling |
| **clsx + tailwind-merge** | Latest | Conditional class name merging |
| **Geist** | ^1.7.0 | Primary font (Vercel's Geist) |
| **Inter** | ^5.2.8 | Secondary font |

---

## AI & Language Model Layer

| Technology | Version | Purpose |
|---|---|---|
| **Vercel AI SDK** (`ai`) | ^6.0.42 | Unified LLM streaming, tool calls, message management |
| **@ai-sdk/openai** | ^3.0.13 | OpenAI provider adapter |
| **@ai-sdk/anthropic** | ^3.0.23 | Anthropic (Claude) provider adapter |
| **@ai-sdk/google** | ^3.0.13 | Google Gemini provider adapter |
| **@ai-sdk/react** | ^3.0.44 | React hooks for streaming AI responses |
| **LangChain Core** (`@langchain/core`) | ^1.1.16 | Foundation for LangGraph orchestration |
| **LangGraph** (`@langchain/langgraph`) | ^1.1.1 | Multi-agent Director Graph orchestration |
| **CopilotKit** | ^1.51.2 | Real-time agent–UI state synchronization |

---

## State Management

| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | ^5.0.10 | Global client-side state stores |
| **Zustand persist middleware** | (bundled) | Auto-syncs selected stores to `localStorage` |
| **Immer** | ^11.1.3 | Immutable state updates inside Zustand |

### Zustand Stores (`lib/store/`)

| File | Store Name | Persisted to localStorage? |
|---|---|---|
| `settings.ts` | Settings (model, TTS, ASR, etc.) | Yes — key `rit-settings` |
| `stage.ts` | Active classroom / stage state | No (saved to IndexedDB) |
| `canvas.ts` | Slide editor canvas state | No |
| `snapshot.ts` | Undo/redo snapshots | No |
| `whiteboard-history.ts` | Whiteboard action history | No |
| `media-generation.ts` | Media generation job queue | No |
| `user-profile.ts` | User display name & avatar | Yes — key `user-profile` |
| `keyboard.ts` | Keyboard shortcut bindings | No |

---

## Client-Side Database (Primary Storage)

> All user data is stored **entirely in the browser** using IndexedDB. No server database is required for core functionality.

### Technology: Dexie.js (IndexedDB wrapper)

| Detail | Value |
|---|---|
| **Package** | `dexie` ^4.2.1 |
| **Storage type** | Browser IndexedDB (persistent, survives page refresh) |
| **Location in disk** | Browser manages this (DevTools → Application → IndexedDB) |
| **Database name** | `maic-local` (defined in `lib/utils/database.ts`) |

### Database Definition File

```
lib/utils/database.ts        ← Central Dexie DB definition and all table schemas
```

### Database Tables

| Table | Primary Key | Description | Related File |
|---|---|---|---|
| `stages` | `id` (string) | Classroom metadata (name, language, style, timestamps) | `lib/utils/stage-storage.ts` |
| `scenes` | `id` (string) | Individual scenes — slides, quizzes, PBL, interactive | `lib/utils/stage-storage.ts` |
| `audioFiles` | `id` (string) | TTS-generated audio blobs (mp3/wav) + metadata | `lib/utils/audio-player.ts` |
| `imageFiles` | `id` (string) | Uploaded image blobs (from PDF, user upload) | `lib/utils/image-storage.ts` |
| `snapshots` | `id` (auto) | Undo/redo history snapshots for slide editor | `lib/store/snapshot.ts` |
| `chatSessions` | `id` (string) | Full AI chat session history per scene | `lib/utils/chat-storage.ts` |
| `playbackState` | `stageId` | Last playback position per classroom (scene + action index) | `lib/utils/playback-storage.ts` |
| `stageOutlines` | `stageId` | Generated scene outline for resume-on-refresh | `lib/utils/stage-storage.ts` |
| `mediaFiles` | `id` (compound `stageId:elementId`) | AI-generated images and videos with their blobs | `lib/utils/image-storage.ts` |
| `generatedAgents` | `id` | Classroom-specific AI agent configurations | `lib/utils/database.ts` |

### Storage Utility Files

```
lib/utils/
├── database.ts          ← Dexie DB instance + all table schemas + CRUD helpers
├── stage-storage.ts     ← Save/load/list/delete full classroom data
├── chat-storage.ts      ← Persist and load AI chat sessions
├── playback-storage.ts  ← Save/restore playback position
├── image-storage.ts     ← Store uploaded and generated images/videos
└── audio-player.ts      ← Audio file caching and playback
```

---

## Server-Side Storage (Optional / Media CDN)

By default, the server uses a **Noop (no-op) storage provider** — meaning media files are only stored in the browser's IndexedDB and are not uploaded to any server.

For production CDN-based media persistence, you can plug in a custom storage provider:

```
lib/storage/
├── index.ts             ← Storage provider factory (returns NoopStorageProvider by default)
├── types.ts             ← StorageProvider interface (upload, exists, getUrl, batchExists)
└── providers/
    └── noop.ts          ← Default no-op provider (no server upload)
```

To add a real provider (e.g., S3, Cloudflare R2), implement the `StorageProvider` interface in `lib/storage/providers/` and register it in `lib/storage/index.ts`.

---

## Data & Utilities

| Technology | Version | Purpose |
|---|---|---|
| **Nanoid** | ^5.1.6 | Unique ID generation for all records |
| **Lodash** | ^4.17.21 | Utility functions (debounce, cloneDeep, etc.) |
| **Immer** | ^11.1.3 | Immutable state updates |
| **YAML** (`js-yaml`) | ^4.1.1 | Parse YAML-formatted AI responses |
| **JSON Repair** (`jsonrepair`) | ^3.13.2 | Fix malformed JSON from AI outputs |
| **Mitt** | ^3.0.1 | Tiny event emitter for cross-component events |

---

## Rendering & Math

| Technology | Version | Purpose |
|---|---|---|
| **KaTeX** | ^0.16.33 | LaTeX math formula rendering in slides |
| **ECharts** | ^6.0.0 | Bar, line, pie, scatter charts inside slides |
| **@napi-rs/canvas** | ^0.1.88 | Server-side canvas rendering (slide thumbnails, export) |
| **XY Flow** (`@xyflow/react`) | ^12.10.0 | Node graph visualizations |
| **MCP SDK** (`@modelcontextprotocol/sdk`) | ^1.27.1 | Model Context Protocol integration |

---

## Export Pipeline

| Technology | Version | Purpose |
|---|---|---|
| **pptxgenjs** | workspace:* | Generate `.pptx` PowerPoint files |
| **mathml2omml** | workspace:* | Convert LaTeX → OOXML math (for PowerPoint) |
| **pptxtojson** | ^1.11.0 | Parse uploaded `.pptx` files back to JSON |
| **JSZip** | ^3.10.1 | Create ZIP archives for batch export |
| **file-saver** | ^2.0.5 | Trigger browser file download |

Both `pptxgenjs` and `mathml2omml` are **custom workspace packages** located at:

```
packages/
├── pptxgenjs/          ← Modified PowerPoint generation library
└── mathml2omml/        ← LaTeX/MathML to OOXML converter
```

---

## PDF Processing

| Technology | Purpose |
|---|---|
| **unpdf** (built-in) | Default PDF text and image extraction |
| **MinerU API** (optional) | Advanced PDF parsing for tables and formulas |
| **Custom API** (configurable) | Any external PDF processing endpoint |

PDF parsing API route: `app/api/parse-pdf/`

---

## Audio (TTS & ASR)

```
lib/audio/
├── tts-providers.ts     ← All TTS provider adapters
├── asr-providers.ts     ← All ASR provider adapters
├── constants.ts         ← Provider IDs, default voices, language codes
├── types.ts             ← Shared audio types
├── tts-utils.ts         ← Audio chunking and stream helpers
└── azure.json           ← Azure voice list (500+ voices)
```

**TTS Providers**: Browser Native, OpenAI TTS, Azure TTS, GLM TTS, Qwen TTS
**ASR Providers**: Browser Native (Web Speech API), OpenAI Whisper, Qwen ASR

---

## API Routes (`app/api/`)

| Route | Purpose |
|---|---|
| `generate-classroom/` | Main classroom generation endpoint |
| `generate/` | General AI generation endpoint |
| `chat/` | Real-time AI chat streaming |
| `quiz-grade/` | AI-powered quiz answer grading |
| `pbl/` | PBL project generation and agent Q&A |
| `parse-pdf/` | PDF upload and text/image extraction |
| `transcription/` | ASR audio transcription |
| `web-search/` | Web search proxy (Tavily, Exa, Bocha) |
| `proxy-media/` | Media URL proxying (CORS bypass) |
| `server-providers/` | List server-configured AI providers |
| `verify-model/` | Test if an API key + model is valid |
| `verify-image-provider/` | Test image generation provider |
| `verify-video-provider/` | Test video generation provider |
| `verify-pdf-provider/` | Test PDF parsing provider |
| `classroom-media/` | Media generation for classroom scenes |
| `health/` | Health check endpoint |

---

## Development Tools

| Technology | Purpose |
|---|---|
| **pnpm** (v10) | Package manager with workspace support |
| **ESLint** | Code linting (`eslint.config.mjs`) |
| **Prettier** | Code formatting |
| **Docker** | Container deployment (`Dockerfile`, `docker-compose.yml`) |

---

## Folder Structure (Top Level)

```
/
├── app/                    ← Next.js App Router (pages, layouts, API routes)
│   ├── api/                ← All API route handlers
│   ├── classroom/[id]/     ← Classroom view page
│   ├── generation-preview/ ← Scene generation preview page
│   ├── globals.css         ← Global CSS + Tailwind theme variables
│   ├── layout.tsx          ← Root layout
│   └── page.tsx            ← Home page (classroom list)
│
├── components/             ← React UI components
│   ├── agent/              ← Agent config panel
│   ├── audio/              ← Audio recording/playback UI
│   ├── canvas/             ← Slide canvas editor
│   ├── chat/               ← Chat panel and message components
│   ├── generation/         ← Outline editor, scene type selectors
│   ├── header.tsx          ← Top navigation bar
│   ├── roundtable/         ← Multi-agent conversation display
│   ├── scene-renderers/    ← Quiz, PBL, interactive scene renderers
│   ├── settings/           ← Settings panel (model, TTS, ASR, etc.)
│   ├── slide-renderer/     ← Full slide editor and viewer
│   ├── stage/              ← Stage/classroom management
│   ├── ui/                 ← Shared generic UI primitives
│   └── whiteboard/         ← Whiteboard canvas component
│
├── lib/                    ← Core business logic (no React)
│   ├── ai/                 ← LLM provider configurations and adapters
│   ├── audio/              ← TTS and ASR provider implementations
│   ├── export/             ← PPTX and HTML export logic
│   ├── generation/         ← Two-stage pipeline (outline + scene generation)
│   │   └── prompts/        ← AI prompt templates (Markdown files)
│   ├── hooks/              ← Custom React hooks
│   ├── i18n/               ← Internationalization (Hindi/English)
│   ├── media/              ← Image and video generation orchestration
│   ├── orchestration/      ← LangGraph director graph + agent registry
│   ├── pbl/                ← Project-Based Learning generation
│   ├── pdf/                ← PDF parsing provider abstraction
│   ├── playback/           ← Classroom playback engine
│   ├── store/              ← Zustand state stores
│   ├── storage/            ← Server-side storage provider interface
│   ├── types/              ← Shared TypeScript type definitions
│   ├── utils/              ← Utilities + Dexie database layer
│   └── web-search/         ← Web search provider adapters
│
├── configs/                ← Static config data (shapes, animations, etc.)
├── packages/               ← Workspace packages (pptxgenjs, mathml2omml)
├── public/                 ← Static assets (logo, fonts, icons)
├── assets/                 ← Source assets
├── community/              ← Community links/docs
├── lxc.md                  ← Full use case and feature guide
├── techstack.md            ← This file
├── replit.md               ← Project architecture notes
├── Dockerfile              ← Container build
├── docker-compose.yml      ← Multi-service container setup
├── next.config.ts          ← Next.js configuration
├── tailwind.config.*       ← Tailwind CSS configuration
└── pnpm-workspace.yaml     ← pnpm monorepo workspace config
```

---

## Where Data Is Stored — Summary

| Data Type | Where Stored | Technology | Path |
|---|---|---|---|
| User settings (model, TTS, ASR keys) | Browser `localStorage` | Zustand persist | Key: `rit-settings` |
| User profile (name, avatar) | Browser `localStorage` | Zustand persist | Key: `user-profile` |
| Classrooms (stages) | Browser IndexedDB | Dexie.js | Table: `stages` |
| Scenes (slides, quizzes, PBL) | Browser IndexedDB | Dexie.js | Table: `scenes` |
| Chat history | Browser IndexedDB | Dexie.js | Table: `chatSessions` |
| TTS audio blobs | Browser IndexedDB | Dexie.js | Table: `audioFiles` |
| Uploaded images | Browser IndexedDB | Dexie.js | Table: `imageFiles` |
| AI-generated media | Browser IndexedDB | Dexie.js | Table: `mediaFiles` |
| Playback position | Browser IndexedDB | Dexie.js | Table: `playbackState` |
| Scene outlines (for resume) | Browser IndexedDB | Dexie.js | Table: `stageOutlines` |
| Undo/redo snapshots | Browser IndexedDB | Dexie.js | Table: `snapshots` |
| AI agent configs | Browser IndexedDB | Dexie.js | Table: `generatedAgents` |
| Slide editor canvas state | Browser memory | Zustand (no persist) | Runtime only |
| Media CDN (optional) | Server / Cloud | Custom StorageProvider | `lib/storage/providers/` |

> **Important**: All data is private to the user's browser. Nothing is sent to a server unless you configure a CDN storage provider or enable an AI provider API key.

---

*LearnXChain — LXC A PRODUCT BY LearnXChain *
