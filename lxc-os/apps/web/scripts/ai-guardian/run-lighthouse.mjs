#!/usr/bin/env node
/**
 * AI Code Guardian - Lighthouse Runner
 *
 * Discovers pages or reads a URL list, runs Lighthouse for each URL,
 * and writes a JSON array of Lighthouse reports.
 *
 * Usage:
 *   node scripts/ai-guardian/run-lighthouse.mjs \
 *     --output /tmp/lighthouse-report.json \
 *     --base-url https://www.learnxchain.com \
 *     --max-urls 20 \
 *     --urls-file scripts/ai-guardian/lighthouse-urls.json
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { parseArgs } from "util";

const { values: args } = parseArgs({
  options: {
    output: { type: "string", default: "/tmp/lighthouse-report.json" },
    "base-url": { type: "string", default: "" },
    "max-urls": { type: "string", default: "20" },
    "urls-file": {
      type: "string",
      default: "scripts/ai-guardian/lighthouse-urls.json",
    },
  },
});

const ROOT = process.cwd();
const BASE_URL =
  args["base-url"] ||
  process.env.LIGHTHOUSE_BASE_URL ||
  "https://www.learnxchain.com";
const MAX_URLS = Math.max(1, parseInt(args["max-urls"], 10) || 20);
const OUTPUT_PATH = args.output || "/tmp/lighthouse-report.json";
const URLS_FILE = path.isAbsolute(args["urls-file"])
  ? args["urls-file"]
  : path.join(ROOT, args["urls-file"]);

const DEFAULT_EXCLUDES = new Set([
  "/api",
  "/dashboard",
  "/admin",
  "/superadmin",
  "/debug",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/create-superadmin",
]);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function listPageFiles() {
  const pagesDir = path.join(ROOT, "pages");
  if (!fs.existsSync(pagesDir)) return [];

  const results = [];
  const stack = [pagesDir];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "api") continue;
        stack.push(fullPath);
      } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function toRoute(filePath) {
  const pagesDir = path.join(ROOT, "pages");
  let rel = path.relative(pagesDir, filePath).replace(/\\/g, "/");
  if (rel.startsWith("api/")) return null;
  if (rel.startsWith("_")) return null;
  if (rel.includes("[")) return null; // skip dynamic routes

  rel = rel.replace(/\.(tsx|ts|jsx|js)$/, "");
  if (rel.endsWith("/index")) {
    rel = rel.slice(0, -"/index".length);
  }

  const route = "/" + rel.replace(/^\//, "");
  return route === "/" ? "/" : route;
}

function discoverRoutes() {
  const files = listPageFiles();
  const routes = new Set();

  for (const filePath of files) {
    const rel = path
      .relative(path.join(ROOT, "pages"), filePath)
      .replace(/\\/g, "/");
    const baseName = path.basename(rel);
    if (baseName.startsWith("_")) continue;

    const route = toRoute(filePath);
    if (!route) continue;
    const shouldExclude = Array.from(DEFAULT_EXCLUDES).some(
      (prefix) => route === prefix || route.startsWith(prefix + "/"),
    );
    if (shouldExclude) continue;

    routes.add(route);
  }

  if (!routes.has("/")) routes.add("/");
  return Array.from(routes).sort();
}

function normalizeUrls(rawList) {
  const urls = [];
  for (const entry of rawList) {
    if (!entry || typeof entry !== "string") continue;
    if (entry.startsWith("http://") || entry.startsWith("https://")) {
      urls.push(entry);
    } else {
      const pathPart = entry.startsWith("/") ? entry : `/${entry}`;
      const base = BASE_URL.replace(/\/$/, "");
      urls.push(`${base}${pathPart}`);
    }
  }
  return urls;
}

function loadUrls() {
  const fromFile = readJson(URLS_FILE);
  if (Array.isArray(fromFile) && fromFile.length > 0) {
    return normalizeUrls(fromFile);
  }
  const routes = discoverRoutes();
  return normalizeUrls(routes);
}

function runLighthouse(url, outputPath) {
  const cmd = [
    "npx lighthouse",
    url,
    "--only-categories=performance,seo,best-practices,accessibility",
    "--output=json",
    `--output-path=${outputPath}`,
    '--chrome-flags="--headless --no-sandbox"',
    "--quiet",
  ].join(" ");
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  const urls = loadUrls().slice(0, MAX_URLS);
  if (!urls.length) {
    console.warn("No URLs found for Lighthouse scan.");
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([]));
    return;
  }

  const reports = [];
  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i];
    const tmpPath = `/tmp/lighthouse-${i + 1}.json`;
    try {
      console.log(`Running Lighthouse (${i + 1}/${urls.length}): ${url}`);
      runLighthouse(url, tmpPath);
      const report = readJson(tmpPath);
      if (report) reports.push(report);
    } catch (err) {
      console.error(`Lighthouse failed for ${url}:`, err?.message || err);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(reports, null, 2));
  console.log(`Wrote Lighthouse report: ${OUTPUT_PATH}`);
}

main();
