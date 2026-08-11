# LearnXChain (LXC) — Complete Guide

> **Powered by Rit AI** | AI-Powered Interactive Classroom & Presentation Platform

---

## What Is LearnXChain?

LearnXChain (LXC) AI platform that transforms any topic or document into a **fully immersive, interactive classroom experience**. It uses multiple AI agents (teachers, students, assistants) to conduct live lessons, answer questions, draw on whiteboards, run quizzes, and guide project-based learning — all generated automatically from a simple prompt or PDF upload.

**Primary language**: Hindi (हिंदी) for AI-generated classroom content; English for the settings interface.

---

## Quick Start

### 1. Set Up Your AI Model
Click **"Set up model"** on the home screen (or open Settings → Model). Configure at least one LLM provider:
- **OpenAI** — add your `OPENAI_API_KEY`
- **Anthropic Claude** — add your `ANTHROPIC_API_KEY`
- **Google Gemini** — add your `GOOGLE_API_KEY`
- **DeepSeek, Qwen, GLM, Kimi, MiniMax, SiliconFlow** — add their respective API keys

You can also set a `DEFAULT_MODEL` environment variable (e.g., `anthropic:claude-3-5-haiku-20241022`).

### 2. Choose a Language
Use the language button (EN / हिंदी) in the bottom toolbar to switch the classroom language between English and Hindi.

### 3. Enter a Topic or Upload a Document
Type your learning topic in the chat box, for example:
- *"Teach me Python from scratch in 30 minutes"*
- *"Explain Fourier Transform on the whiteboard"*
- *"How to play the board game Avalon"*

Or upload a **PDF** and the system will build a lesson around its contents.

### 4. Enter the Classroom
Click **"Enter Classroom"** and watch the AI agents generate and teach your lesson live.

---

## Core Features

### Classroom Generation (Two-Stage Pipeline)

LXC generates lessons in two stages:

**Stage 1 — Outline Generation**
The AI analyzes your topic or document and creates a structured lesson plan with multiple scenes. Each scene has a type, title, description, and key learning points.

**Stage 2 — Scene Generation**
Each outline item is independently generated in parallel into a complete scene with slides, quizzes, interactions, or PBL boards.

You can review and edit the scene outline before generating the full lesson (add, remove, reorder, or change scene types).

---

### Scene Types

| Scene Type | Description |
|---|---|
| **Slide** | AI-generated slide with text, images, charts, shapes, and LaTeX formulas. Agents narrate and spotlight key content. |
| **Quiz** | Multiple-choice, multi-select, or short-answer questions with real-time AI grading and Hindi/English feedback. |
| **Interactive** | Self-contained HTML simulation — physics demos, math visualizations, language games, etc. |
| **Interactive (Scientific)** | Complex scientific model simulations (e.g., orbital mechanics, circuit diagrams). |
| **PBL** | Project-Based Learning board with roles, tasks, AI agents for each task, and milestone tracking. |

---

### Multi-Agent AI Classroom

The classroom runs a **Director** AI that decides which agent speaks next. Agents have distinct personalities and roles:

| Agent | Role | Default Name |
|---|---|---|
| Teacher | Leads the lesson, narrates slides | Customizable |
| AI सहायक शिक्षक | Teaching assistant, fills gaps, rephrases | AI Assistant Teacher |
| क्लास जोकर | Brings humor and energy | Class Clown |
| जिज्ञासु | Asks deep "why" questions | Curious Learner |
| नोट लेखक | Summarizes and takes structured notes | Note Taker |
| गहरा सोचने वाला | Connects ideas and questions assumptions | Deep Thinker |

**Agent Actions Available:**
- **Speech** — Agent speaks aloud with TTS voice narration
- **Spotlight** — Highlights a specific element on the slide
- **Discussion** — Opens a student discussion thread
- **Quiz** — Triggers a quiz scene
- **Whiteboard Draw** — Draws lines, shapes, equations on the whiteboard

---

### Interactive Whiteboard

The shared whiteboard is a canvas where AI agents and users can collaborate in real-time:

- **Draw lines and curves** — agents illustrate concepts
- **Add text and annotations** — write formulas, labels, definitions
- **Add shapes** — rectangles, circles, arrows, callouts
- **LaTeX formulas** — mathematical equations rendered beautifully
- **Pan and zoom** — navigate large whiteboards
- **History snapshots** — review previous whiteboard states
- **User interaction** — you can also draw, write, and annotate

---

### Text-to-Speech (TTS)

Each AI agent can speak using voice narration. Supported TTS providers:

| Provider | Notes |
|---|---|
| **Browser Native** | Free, no API key, uses your browser's built-in voices |
| **OpenAI TTS** | High quality, requires `OPENAI_API_KEY` |
| **Azure TTS** | Premium voices, Hindi voices included (Swara, Madhur, Ananya, Aarav) |
| **GLM TTS** | Chinese provider, requires GLM key |
| **Qwen TTS** | Alibaba's TTS, auto-detects language |

**Hindi Azure Voices available:**
- `hi-IN-SwaraNeural` (female)
- `hi-IN-MadhurNeural` (male)
- `hi-IN-AnanyaNeural` (female)
- `hi-IN-AaravNeural` (male)

Configure TTS in Settings → Audio → Text to Speech. Adjust speed and select your preferred voice.

---

### Automatic Speech Recognition (ASR)

Talk to the classroom instead of typing. Supported ASR providers:

| Provider | Language Code | Notes |
|---|---|---|
| **Browser Native** | `hi-IN` | Free, no API key, uses browser microphone |
| **OpenAI Whisper** | `hi` | Accurate, requires `OPENAI_API_KEY` |
| **Qwen ASR** | `hi` | Alibaba's ASR, requires Qwen key |

Default ASR language is set to Hindi (`hi`). Configure in Settings → Audio → Speech Recognition.

---

### PDF Document Processing

Upload a PDF and LXC will:
1. Extract text and images from every page
2. Generate a lesson outline based on the document's content
3. Assign images from the PDF to the appropriate slides

**PDF Parsing Providers:**
| Provider | Notes |
|---|---|
| **Built-in (unpdf)** | Free, handles most PDFs, extracts text and basic images |
| **MinerU** | Better for complex tables, formulas, and scientific papers (requires local deployment) |
| **Custom API** | Configure any custom PDF parsing endpoint |

---

### Quiz System

Quizzes are generated automatically within lessons or on demand:

- **Single choice** — one correct answer from options
- **Multiple choice** — select all correct answers
- **Short answer** — open text graded by AI

The AI grades answers instantly and provides:
- A score (with partial credit)
- Constructive feedback in Hindi or English
- Encouragement and explanation of the correct answer

---

### Project-Based Learning (PBL)

PBL mode gives students a structured project experience:

1. **Project is generated** — title, description, roles, and tasks created by AI
2. **Student picks a role** — e.g., "Data Analyst", "Frontend Developer", "Project Manager"
3. **Task board appears** — sequential tasks with milestones
4. **Each task has two AI agents:**
   - **Question Agent** — asks guiding questions to help the student understand the task
   - **Judge Agent** — evaluates completion and gives feedback (COMPLETE / NEEDS_REVISION)
5. **Student works through tasks** — chatting with agents, getting hints, submitting work

Configure PBL in Settings → PBL to set the number of tasks and project language.

---

### Slide Editor

The slide editor is a full-featured canvas editor available in classroom presentation mode:

**Element Types:**
- Text boxes (rich formatting: bold, italic, color, size, alignment)
- Images (crop, filter, flip, rounded corners, color mask)
- Shapes (rectangles, ellipses, triangles, arrows, stars, and custom SVG paths)
- Tables (editable cells, theme colors)
- Charts (bar, line, pie, scatter — powered by ECharts)
- LaTeX mathematical formulas
- Videos (inline playback)
- Lines and connectors

**Editing Tools:**
- Drag, resize, rotate elements
- Alignment snap lines
- Grid lines (small / medium / large)
- Multi-select and group/ungroup
- Layer ordering (bring to front / send to back)
- Lock elements to prevent accidental edits
- Ruler overlay
- Copy, cut, paste

**Context Menu (right-click):**
- Align to canvas (center, left, right, top, bottom)
- Layer order
- Group/ungroup
- Set hyperlink
- Lock/unlock
- Delete

---

### Export Options

**PowerPoint (.pptx)**
Export the entire classroom as a fully editable PowerPoint file:
- All slides with text, images, shapes, and charts
- Speaker notes derived from AI agent dialogue
- LaTeX formulas converted to OOXML math
- Transitions and layouts preserved

**Interactive HTML**
Export interactive scenes as self-contained `.html` files that run in any browser without the app.

---

### Image & Video Generation

If configured, LXC can generate images and videos to embed in slides:

| Provider | Type | Notes |
|---|---|---|
| **Kling** | Video | High-quality AI video generation |
| **Seedance** | Video | Fast video generation |
| **Nano-Banana** | Image | Image generation |
| **Seedream** | Image | Stable Diffusion-based |
| **Qwen-Image** | Image | Alibaba's image model |

Enable in Settings → Media Generation. Requires provider API keys.

---

### Web Search Integration

The AI can search the web for current information during lesson generation:

| Provider | Notes |
|---|---|
| **Tavily** | Recommended, requires `TAVILY_API_KEY` |
| **Exa** | Alternative search provider |
| **Bocha** | Chinese search provider |

Enable in Settings → Web Search.

---

## Settings Reference

### Model Settings
- **AI Provider** — select LLM provider (OpenAI, Anthropic, Google, DeepSeek, etc.)
- **Model** — pick specific model (gpt-4o, claude-3-5-sonnet, gemini-1.5-pro, etc.)
- **Agent Mode** — Preset (use default 6 agents) or Custom (configure your own agents)
- **Max Turns** — maximum conversation turns per scene

### Audio Settings
- **Text to Speech** — enable/disable TTS, select provider, voice, and speed
- **Speech Recognition** — enable/disable ASR, select provider and language

### Media Settings
- **Image Generation** — enable and configure image provider
- **Video Generation** — enable and configure video provider

### PDF Settings
- Select PDF parsing provider and configure API endpoint if using MinerU or custom

### PBL Settings
- Number of tasks per project
- Project generation language

### Agent Configuration
View and manage the AI agents in your classroom:
- See each agent's name, role, persona, and allowed actions
- View priority (higher = speaks more often)
- Default agents cannot be deleted

---

## Supported AI Providers (LLM)

| Provider | Models | Key Environment Variable |
|---|---|---|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo, o1, o3 | `OPENAI_API_KEY` |
| Anthropic | claude-3-5-sonnet, claude-3-5-haiku, claude-opus | `ANTHROPIC_API_KEY` |
| Google | gemini-1.5-pro, gemini-1.5-flash, gemini-2.0 | `GOOGLE_API_KEY` |
| DeepSeek | deepseek-chat, deepseek-reasoner | `DEEPSEEK_API_KEY` |
| GLM (Zhipu) | glm-4, glm-4-flash | `GLM_API_KEY` |
| Qwen (Alibaba) | qwen-max, qwen-turbo, qwen-plus | `QWEN_API_KEY` |
| Kimi (Moonshot) | moonshot-v1-8k, moonshot-v1-32k | `KIMI_API_KEY` |
| MiniMax | abab6.5, abab5.5 | `MINIMAX_API_KEY` |
| SiliconFlow (硅基流动) | Multiple RIT models | `SILICONFLOW_API_KEY` |
| Doubao (豆包) | doubao-pro, doubao-lite | `ARK_API_KEY` |
| Custom OpenAI-compatible | Any provider with OpenAI API format | Configurable |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the keys you need:

```bash
# Core LLM (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# Default model (optional, auto-selected if empty)
DEFAULT_MODEL=anthropic:claude-3-5-haiku-20241022

# Web Search (optional)
TAVILY_API_KEY=

# TTS (optional, browser native is free)
AZURE_TTS_KEY=
AZURE_TTS_REGION=

# ASR (optional, browser native is free)
# Uses OpenAI API key for Whisper

# Image/Video Generation (optional)
KLING_ACCESS_KEY=
KLING_SECRET_KEY=

# PDF Parsing (optional, built-in is free)
MINERU_API_KEY=
```

---

## Use Case Examples

### Classroom for Schools
A teacher uploads a chapter PDF on "Photosynthesis". LXC generates:
- 5 slides explaining the process step by step
- A quiz testing comprehension
- An interactive simulation of the light-dependent reaction
- AI agents (teacher + curious student + note-taker) conducting a live lesson in Hindi

### Corporate Training
An HR team types: "Train new employees on data security best practices". LXC generates:
- An outline of 6 scenes covering phishing, passwords, data handling
- Role-playing scenarios as interactive PBL tasks
- Quiz to verify compliance understanding
- Exportable PowerPoint for the LMS

### Self-Study
A student types: "Explain calculus — derivatives and integrals from scratch". LXC:
- Creates a full lesson with whiteboard illustrations
- Agents debate and explain different perspectives
- LaTeX formulas rendered beautifully on slides
- Student can interrupt and ask questions via mic (ASR)

### Language Learning
A user asks: "Teach me conversational Hindi phrases for travel". LXC:
- Generates phrasebook slides with transliteration
- TTS reads Hindi phrases aloud with native pronunciation
- Quiz tests pronunciation and meaning recall
- Interactive games test recognition

### Technical Documentation
A developer uploads an API documentation PDF. LXC generates:
- A structured walkthrough of the API endpoints
- Code example slides
- An interactive scene demonstrating API calls
- Q&A session with AI agents clarifying concepts

---

## Keyboard Shortcuts (Slide Editor)

| Action | Shortcut |
|---|---|
| Copy element | Ctrl + C |
| Cut element | Ctrl + X |
| Paste element | Ctrl + V |
| Select all | Ctrl + A |
| Group elements | Ctrl + G |
| Lock element | Ctrl + L |
| Delete element | Delete |
| Undo | Ctrl + Z |
| Redo | Ctrl + Shift + Z |

---

## Architecture Overview

```
User Input (text / PDF / voice)
        ↓
Outline Generator  →  Scene Outlines (title, type, key points)
        ↓
Scene Generator (parallel)  →  Slides / Quiz / PBL / Interactive
        ↓
Multi-Agent Orchestrator (LangGraph Director)
        ↓
Agent Actions: speech, spotlight, whiteboard, quiz trigger
        ↓
TTS Engine  →  Voice narration per agent
ASR Engine  →  User voice input
        ↓
Export: PowerPoint / Interactive HTML
```

**Key Files:**
| File | Purpose |
|---|---|
| `lib/generation/pipeline-runner.ts` | Orchestrates the 2-stage generation pipeline |
| `lib/generation/outline-generator.ts` | Stage 1: creates scene outlines from requirements |
| `lib/generation/scene-generator.ts` | Stage 2: generates full scenes in parallel |
| `lib/orchestration/director-graph.ts` | LangGraph director for multi-agent sequencing |
| `lib/orchestration/registry/store.ts` | Agent registry with default agents |
| `lib/audio/tts-providers.ts` | TTS provider abstraction layer |
| `lib/audio/asr-providers.ts` | ASR provider abstraction layer |
| `lib/pbl/generate-pbl.ts` | PBL project generation and question agent setup |
| `app/api/quiz-grade/route.ts` | Real-time AI quiz grading endpoint |
| `lib/store/settings.ts` | Persistent user settings (Zustand + localStorage) |
| `lib/export/use-export-pptx.ts` | PowerPoint export pipeline |

---

## Frequently Asked Questions

**Q: Can I use LearnXChain without any API keys?**
A: You can explore the app, but classroom generation requires at least one LLM API key. TTS and ASR can use the free browser-native providers (no key needed).

**Q: What languages can be used for lessons?**
A: The classroom supports Hindi (हिंदी) and English. The AI agents will respond in the selected classroom language. The settings interface is in English.

**Q: How long does classroom generation take?**
A: Typically 30–90 seconds for a 5-scene classroom. Scenes are generated in parallel to speed things up.

**Q: Can I edit the generated slides?**
A: Yes. The slide editor is fully featured — you can modify text, move elements, add shapes, and more.

**Q: Can I save and share my classroom?**
A: Export as PowerPoint (.pptx) to share or present anywhere. Interactive scenes can be exported as standalone HTML files.

**Q: Is my data sent to third parties?**
A: Only the API keys you configure are used. Your documents and prompts are sent to whichever AI provider you select. No data is stored on LXC servers.

**Q: Can I add my own AI agent?**
A: Yes. Go to Settings → Agents → New Agent. Define the name, role, persona, and allowed actions.

---

*LearnXChain — LXC A PRODUCT BY LearnXChain *
