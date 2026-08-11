#!/usr/bin/env node
/**
 * clear-cache.js
 * Deletes the .next build cache before the dev server starts.
 * Runs automatically via the "dev" npm script so stale Turbopack
 * bundles never cause "defined multiple times" or similar build errors.
 */

const fs = require("fs");
const path = require("path");

const dirs = [
  path.join(__dirname, "..", ".next"),
  path.join(__dirname, "..", ".turbo"),
];

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[clear-cache] Removed ${path.relative(process.cwd(), dir)}`);
  }
}

console.log("[clear-cache] Cache cleared — starting dev server…");
