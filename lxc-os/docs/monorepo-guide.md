# LearnXChain Monorepo Guide

Welcome to the LearnXChain Turborepo. This guide covers how to run, build, and deploy the apps.

## 🏃‍♂️ Running the Apps Locally

You can use Turborepo to run the dev server for all apps at once, or run just a specific app.

### Run everything at once
To start the development servers for all apps (`web`, `mobile`, `ai`, `lms`) simultaneously:
```bash
pnpm dev
```
*(Note: If you run into port conflicts or memory issues, it is recommended to run specific apps instead).*

### Run a specific app
Use the `--filter` flag to target a specific app using its package name (found in its `package.json`).

**Run the Main Web App** (Next.js Pages Router):
```bash
pnpm dev --filter=@learnxchain/web
```
*Accessible at http://localhost:3000*

**Run the AI App** (Next.js App Router):
```bash
pnpm dev --filter=@learnxchain/ai
```
*Accessible at http://localhost:3001*

**Run the LMS App**:
```bash
pnpm dev --filter=@learnxchain/lms
```

**Run the Mobile App** (Expo):
```bash
pnpm dev --filter=@learnxchain/mobile
```

---

## 🏗️ Building for Production

Turborepo aggressively caches build outputs. If nothing has changed, it will skip rebuilding in seconds!

### Build everything at once
```bash
pnpm build
```
This will build `docs`, `shared packages`, and all the apps in the correct dependency order.

### Build a specific app
```bash
pnpm build --filter=@learnxchain/web
```
*This will automatically build any shared packages (like `pptxgenjs` or `mathml2omml`) the web app depends on first.*

### Clean the cache
If you ever experience weird build caching issues, you can clear the turbo cache:
```bash
pnpm clean
```

---

## 🚀 Deployment to Vercel

Vercel has built-in support for Turborepo and Next.js. Because we moved from a standard repo to a Monorepo, **you must update the settings in the Vercel Dashboard for each project.**

### 1. Update the "Root Directory"
For each of your existing projects in Vercel, go to **Settings > General > Root Directory** and update it:

- For the Main Web App: set to `apps/web`
- For the AI App: set to `apps/ai`

### 2. Update Framework Preset
Ensure the Framework Preset remains "Next.js".

### 3. Build Command Settings
Leave the build command as default. Vercel automatically detects Turborepo and will run `pnpm build` scoped to the specific app (e.g., `cd apps/web && pnpm build`).

### 4. Enable Turborepo Remote Caching (Optional but Recommended)
To speed up Vercel builds and local builds:
1. Run `npx turbo login` locally and authenticate.
2. Run `npx turbo link` to connect your local repository to a Vercel remote cache.
3. Your Vercel deployments and local builds will now share cache!
