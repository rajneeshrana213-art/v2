# LearnXChain

## Overview

LearnXChain is a school management mobile application built with Expo (React Native) and an Express.js backend. It provides role-based dashboards for four user types: **Students**, **Teachers**, **Parents**, and **Drivers**. Each role has a tailored interface with features like attendance tracking, homework management, exam results, timetables, leave requests, bus tracking, and more. The app uses a splash screen → login → role-based dashboard navigation flow with demo accounts for testing.

$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; ./gradlew bundleRelease



eas build --platform android --profile development

npx expo start --dev-client
http://192.168.31.96:8081
## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: `expo-router` with file-based routing. Routes are defined in the `app/` directory:
  - `app/index.tsx` — Animated splash screen that checks auth state and redirects
  - `app/login.tsx` — Login screen with demo credential validation
  - `app/dashboard/driver.tsx`, `student.tsx`, `teacher.tsx`, `parent.tsx` — Role-specific dashboards
- **State Management**: React Context (`lib/auth-context.tsx`) for auth state, `@tanstack/react-query` for server data fetching
- **Animations**: `react-native-reanimated` for smooth transitions and animations
- **UI Libraries**: `@expo/vector-icons` (Ionicons, MaterialCommunityIcons, Feather), `expo-linear-gradient`, `expo-blur`, `expo-haptics` for tactile feedback
- **Fonts**: Inter font family (400, 500, 600, 700 weights) via `@expo-google-fonts/inter`
- **Keyboard Handling**: `react-native-keyboard-controller` with a compatibility wrapper for web
- **Navigation Pattern**: Each dashboard has a sidebar (`components/Sidebar.tsx`) with sections and items. Sidebars are animated slide-in panels
- **Platform Support**: iOS, Android, and Web (web uses `react-native-web`)

### Authentication

- **Current Implementation**: Demo/mock authentication using hardcoded credentials in `lib/auth-context.tsx`
  - `student` / `student123` → Student Dashboard
  - `teacher` / `teacher123` → Teacher Dashboard
  - `parent` / `parent123` → Parent Dashboard
  - `driver` / `driver123` → Driver Dashboard
- **Session Persistence**: `@react-native-async-storage/async-storage` stores the logged-in user locally
- **No server-side auth yet** — the Express backend has user schema defined but auth routes are not implemented

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript, compiled via `tsx` (dev) or `esbuild` (production)
- **Server File**: `server/index.ts` — Sets up Express with CORS handling for LearnXChain domains and localhost
- **Routes**: `server/routes.ts` — Currently a skeleton; routes should be prefixed with `/api`
- **Storage**: `server/storage.ts` — Implements `IStorage` interface with an in-memory `MemStorage` class. This is a placeholder that should be replaced with database-backed storage
- **CORS**: Dynamically allows origins from `LearnXChain_DEV_DOMAIN` and `LearnXChain_DOMAINS` environment variables, plus any localhost origin

### Database Schema

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Tables**:
  - `users` — `id` (UUID, auto-generated), `username` (unique text), `password` (text)
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions (`insertUserSchema`)
- **Migration Config**: `drizzle.config.ts` uses `DATABASE_URL` env var, outputs to `./migrations`
- **Push Command**: `npm run db:push` to sync schema to database

### Build & Deployment

- **Dev Mode**: Two processes run concurrently:
  - `npm run expo:dev` — Expo dev server with LearnXChain proxy configuration
  - `npm run server:dev` — Express API server via `tsx`
- **Production Build**:
  - `npm run expo:static:build` — Custom build script (`scripts/build.js`) that bundles the Expo web app
  - `npm run server:build` — esbuild bundles the server
  - `npm run server:prod` — Runs the production server which serves the static web build
- **Landing Page**: `server/templates/landing-page.html` — Shown when the web build isn't available yet

### Project Structure

```
app/                    # Expo Router file-based routes
  _layout.tsx           # Root layout with providers
  index.tsx             # Splash screen
  login.tsx             # Login screen
  dashboard/            # Role-based dashboards
    driver.tsx
    student.tsx
    teacher.tsx
    parent.tsx
components/             # Reusable UI components
  Sidebar.tsx           # Animated sidebar navigation
  ErrorBoundary.tsx     # Error boundary wrapper
  ErrorFallback.tsx     # Error UI
  KeyboardAwareScrollViewCompat.tsx
constants/              # App-wide constants
  colors.ts             # Color theme (primary: #1A73B5)
lib/                    # Client-side utilities
  auth-context.tsx      # Auth provider with demo accounts
  query-client.ts       # TanStack Query + API request helpers
server/                 # Express backend
  index.ts              # Server entry point
  routes.ts             # API route registration
  storage.ts            # Data storage interface + in-memory impl
shared/                 # Shared between client and server
  schema.ts             # Drizzle DB schema + Zod types
scripts/                # Build tooling
  build.js              # Custom Expo web build script
```

## External Dependencies

### Database

- **PostgreSQL** via Drizzle ORM — requires `DATABASE_URL` environment variable
- Currently using in-memory storage (`MemStorage`) as a fallback; database integration is partially set up

### Key NPM Packages

- **Expo SDK 54** — Core mobile framework
- **Express 5** — Backend HTTP server
- **Drizzle ORM + drizzle-zod** — Database ORM with schema validation
- **@tanstack/react-query** — Server state management
- **pg** — PostgreSQL client driver
- **react-native-reanimated** — Animation library
- **react-native-gesture-handler** — Touch gesture handling
- **@react-native-async-storage/async-storage** — Local storage for auth persistence
- **expo-router** — File-based navigation
- **http-proxy-middleware** — Dev server proxying

### Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required for DB operations)
- `LearnXChain_DEV_DOMAIN` — Used for CORS and Expo proxy configuration
- `LearnXChain_DOMAINS` — Additional allowed CORS origins
- `EXPO_PUBLIC_DOMAIN` — Public domain for API requests from the client
