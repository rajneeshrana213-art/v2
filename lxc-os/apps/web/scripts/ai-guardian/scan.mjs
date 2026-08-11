#!/usr/bin/env node
/**
 * AI Code Guardian – Static Analysis Scanner
 *
 * Scans the repository for:
 *   - ESLint violations (from pre-generated report)
 *   - TypeScript errors (from pre-generated tsc output)
 *   - Custom security & quality pattern checks
 *
 * Outputs a structured JSON report and, when GITHUB_TOKEN is present,
 * opens GitHub Issues for every finding and PRs for Critical ones.
 *
 * Usage:
 *   node scripts/ai-guardian/scan.mjs \
 *     --eslint-report <path> \
 *     --tsc-report    <path> \
 *     --output        <path>
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { parseArgs } from "util";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const { values: args } = parseArgs({
  options: {
    "eslint-report": { type: "string", default: "/tmp/eslint-report.json" },
    "tsc-report": { type: "string", default: "/tmp/tsc-report.txt" },
    output: { type: "string", default: "/tmp/guardian-report.json" },
  },
});

const ROOT = process.cwd();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO = process.env.REPO || "";
const SEVERITY = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

// ---------------------------------------------------------------------------
// Custom pattern checks
// Each entry:
//   pattern-based: { id, severity, title, pattern, message, fix, glob, onePerFile? }
//   file-level:    { id, severity, title, fileCheck(content, filePath), message, fix, glob }
// ---------------------------------------------------------------------------
const CUSTOM_CHECKS = [
  {
    id: "SEC-001",
    severity: SEVERITY.CRITICAL,
    title: "Hardcoded JWT / NextAuth secret fallback",
    // Matches literal string fallback values used as default secrets
    pattern: /\|\|\s*["']fallback-secret[^"']*["']/,
    message:
      "A hardcoded secret fallback was detected. If NEXTAUTH_SECRET or JWT_ACCESS_TOKEN_SECRET is not set in the environment, the application will silently use a weak, public secret, allowing attackers to forge JWT tokens.",
    fix: 'Remove the hardcoded fallback. Throw an error at startup instead:\n```ts\nif (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET env var is required");\n```',
    glob: "**/*.{ts,tsx,js,mjs}",
  },
  {
    id: "SEC-002",
    severity: SEVERITY.HIGH,
    title: "console.log leaking sensitive data (token / password / secret)",
    pattern: /console\.(log|info|debug)\s*\([^)]*\b(token|password|secret|credential)\b/i,
    message:
      "Logging sensitive values to the console can expose credentials in production log streams.",
    fix: "Remove the console statement or replace it with a structured logger that redacts sensitive fields.",
    glob: "**/*.{ts,tsx,js,mjs}",
    onePerFile: true,
  },
  {
    id: "SEC-003",
    severity: SEVERITY.HIGH,
    title: "API route missing authentication check",
    // File-level check: has handler export but no auth call
    fileCheck(content) {
      const hasHandler = /export\s+default\s+(?:async\s+)?function\s+handler\b/.test(content);
      const hasAuth = /verifyAuth|getServerSession|checkModuleAccess|checkPathAccess/.test(content);
      return hasHandler && !hasAuth;
    },
    message:
      "An API handler was found without an explicit authentication guard call (verifyAuth / getServerSession). Unauthenticated callers may access protected data.",
    fix: "Add `const user = await verifyAuth(req, res); if (!user) return;` at the top of every non-public API handler.",
    glob: "pages/api/v1/**/*.{ts,js}",
  },
  {
    id: "SEC-004",
    severity: SEVERITY.MEDIUM,
    title: "Missing leading slash in PUBLIC_PATHS entry",
    pattern: /'privacy'(?!\s*:)/,
    message:
      "The string 'privacy' in PUBLIC_PATHS is missing a leading slash. `pathname` from Next.js always starts with '/', so `/privacy` will never match 'privacy' and will be treated as a protected route.",
    fix: "Change `'privacy'` to `'/privacy'` in the PUBLIC_PATHS set.",
    glob: "middleware.ts",
  },
  {
    id: "SEC-005",
    severity: SEVERITY.MEDIUM,
    title: "Unhandled promise rejection – async API handler without try/catch",
    // File-level: async handler with no try { block anywhere in the file
    fileCheck(content) {
      const hasAsyncHandler = /export\s+default\s+async\s+function\s+handler\b/.test(content);
      const hasTryCatch = /\btry\s*\{/.test(content);
      return hasAsyncHandler && !hasTryCatch;
    },
    message:
      "An async API handler has no top-level try/catch. Any uncaught exception will crash the serverless function and may expose stack traces to callers.",
    fix: "Wrap the handler body in `try { ... } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }`.",
    glob: "pages/api/**/*.{ts,js}",
  },
  {
    id: "QUAL-001",
    severity: SEVERITY.LOW,
    title: "Use of `as any` disabling TypeScript type safety",
    pattern: /\bas\s+any\b/,
    message:
      "`as any` casts disable TypeScript's type system and can hide runtime errors. Use proper type definitions or unknown-narrowing patterns instead.",
    fix: "Replace `as any` with a concrete type or use a type guard.",
    glob: "**/*.{ts,tsx}",
    onePerFile: true,
  },
  {
    id: "QUAL-002",
    severity: SEVERITY.LOW,
    title: "Dead / placeholder comment left in code",
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|TEMP|REMOVE ME|PLACEHOLDER)\b/i,
    message: "A TODO/FIXME comment indicates incomplete or temporary code.",
    fix: "Resolve the TODO before merging to main.",
    glob: "**/*.{ts,tsx,js,mjs}",
    onePerFile: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

/** Recursively gather files matching an extension list */
function gatherFiles(dir, extensions, ignorePatterns = []) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (ignorePatterns.some((p) => fullPath.includes(p))) continue;
    if (entry.isDirectory()) {
      results.push(...gatherFiles(fullPath, extensions, ignorePatterns));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Simple glob-like filter: supports ** and * wildcards */
function matchGlob(filePath, globPattern) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const regex = new RegExp(
    "^" +
      globPattern
        .replace(/\./g, "\\.")
        .replace(/\*\*/g, "<<<DOUBLE>>>")
        .replace(/\*/g, "[^/]+")
        .replace(/<<<DOUBLE>>>/g, ".+")
        .replace(/\{([^}]+)\}/g, (_, group) => `(${group.split(",").join("|")})`) +
      "$"
  );
  return regex.test(rel);
}

function lineAt(content, index) {
  return content.substring(0, index).split("\n").length;
}

// ---------------------------------------------------------------------------
// Run custom pattern checks
// ---------------------------------------------------------------------------
function runCustomChecks() {
  const findings = [];
  const extensions = [".ts", ".tsx", ".js", ".mjs"];
  const ignorePatterns = ["node_modules", ".next", "dist", ".git", "scripts/ai-guardian"];

  const allFiles = gatherFiles(ROOT, extensions, ignorePatterns);

  for (const check of CUSTOM_CHECKS) {
    for (const filePath of allFiles) {
      if (!matchGlob(filePath, check.glob)) continue;

      const content = readText(filePath);

      // File-level check (no regex pattern, uses a function)
      if (typeof check.fileCheck === "function") {
        if (check.fileCheck(content, filePath)) {
          findings.push({
            id: check.id,
            severity: check.severity,
            title: check.title,
            file: path.relative(ROOT, filePath),
            line: 1,
            snippet: "",
            message: check.message,
            fix: check.fix,
          });
        }
        continue;
      }

      // Pattern-based check
      const baseFlags = check.pattern.flags.replace(/g/g, "");
      const regex = new RegExp(check.pattern.source, baseFlags + "g");
      let match;
      while ((match = regex.exec(content)) !== null) {
        const line = lineAt(content, match.index);
        findings.push({
          id: check.id,
          severity: check.severity,
          title: check.title,
          file: path.relative(ROOT, filePath),
          line,
          snippet: match[0].trim().substring(0, 120),
          message: check.message,
          fix: check.fix,
        });
        // Only report first occurrence per file when onePerFile is set
        if (check.onePerFile) break;
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Parse ESLint JSON report
// ---------------------------------------------------------------------------
function parseEslintReport(reportPath) {
  const data = readJson(reportPath);
  if (!data || !Array.isArray(data)) return [];

  const findings = [];
  for (const fileResult of data) {
    for (const msg of fileResult.messages || []) {
      findings.push({
        id: `ESLINT-${msg.ruleId || "unknown"}`,
        severity: msg.severity === 2 ? SEVERITY.HIGH : SEVERITY.MEDIUM,
        title: `ESLint: ${msg.ruleId || "unknown rule"}`,
        file: path.relative(ROOT, fileResult.filePath),
        line: msg.line || 0,
        snippet: msg.source || "",
        message: msg.message,
        fix: msg.fix ? "Auto-fixable with `next lint --fix`." : "Review and address the linting rule violation.",
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Parse TypeScript error output
// ---------------------------------------------------------------------------
function parseTscReport(reportPath) {
  const text = readText(reportPath);
  if (!text.trim()) return [];

  const findings = [];
  const lineRegex = /^(.+\.tsx?)\((\d+),\d+\):\s+error\s+(TS\d+):\s+(.+)$/gm;
  let match;
  while ((match = lineRegex.exec(text)) !== null) {
    findings.push({
      id: `TSC-${match[3]}`,
      severity: SEVERITY.HIGH,
      title: `TypeScript error: ${match[3]}`,
      file: path.relative(ROOT, path.resolve(ROOT, match[1])),
      line: parseInt(match[2], 10),
      snippet: "",
      message: match[4].trim(),
      fix: "Fix the TypeScript compilation error. Run `npx tsc --noEmit` locally to reproduce.",
    });
  }
  return findings;
}

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------
async function githubPost(endpoint, body) {
  if (!GITHUB_TOKEN || !REPO) return null;
  const url = `https://api.github.com/repos/${REPO}${endpoint}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`GitHub API error ${resp.status} for ${endpoint}: ${errText}`);
    return null;
  }
  return resp.json();
}

async function githubGet(endpoint) {
  if (!GITHUB_TOKEN || !REPO) return null;
  const url = `https://api.github.com/repos/${REPO}${endpoint}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function getOrCreateLabel(name, color, description) {
  const existing = await githubGet(`/labels/${encodeURIComponent(name)}`);
  if (existing) return existing;
  return githubPost("/labels", { name, color, description });
}

async function ensureLabels() {
  await getOrCreateLabel("ai-guardian", "0075ca", "Detected by AI Code Guardian");
  await getOrCreateLabel("severity:critical", "b60205", "Critical severity issue");
  await getOrCreateLabel("severity:high", "d93f0b", "High severity issue");
  await getOrCreateLabel("severity:medium", "e4e669", "Medium severity issue");
  await getOrCreateLabel("severity:low", "0e8a16", "Low severity issue");
  await getOrCreateLabel("security", "ee0701", "Security vulnerability");
  await getOrCreateLabel("bug", "d73a4a", "Bug detected");
}

async function existingIssues() {
  const data = await githubGet('/issues?state=open&labels=ai-guardian&per_page=100');
  return Array.isArray(data) ? data : [];
}

function issueLabels(finding) {
  const labels = ["ai-guardian", "bug"];
  const sevLabel = `severity:${finding.severity.toLowerCase()}`;
  labels.push(sevLabel);
  if (finding.id.startsWith("SEC-")) labels.push("security");
  return labels;
}

function buildIssueBody(finding) {
  return `## 🔍 ${finding.title}

**Severity:** ${finding.severity}
**Check ID:** \`${finding.id}\`
**File:** \`${finding.file}\`${finding.line ? `\n**Line:** ${finding.line}` : ""}

### Description
${finding.message}

${finding.snippet ? `### Code Snippet\n\`\`\`\n${finding.snippet}\n\`\`\`` : ""}

### Suggested Fix
${finding.fix}

---
*Detected by AI Code Guardian · ${new Date().toISOString()}*`;
}

async function createIssue(finding, openIssues) {
  const title = `[${finding.severity}][${finding.id}] ${finding.title} in \`${finding.file}\``;

  // Avoid duplicates – match on title prefix
  const duplicate = openIssues.find((i) => i.title.includes(`[${finding.id}]`) && i.title.includes(finding.file));
  if (duplicate) {
    console.log(`  ↳ Issue already open: #${duplicate.number}`);
    return duplicate;
  }

  const issue = await githubPost("/issues", {
    title,
    body: buildIssueBody(finding),
    labels: issueLabels(finding),
  });

  if (issue) console.log(`  ↳ Created issue #${issue.number}`);
  return issue;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🛡️  AI Code Guardian – Starting scan…\n");

  const custom = runCustomChecks();
  console.log(`✅  Custom checks: ${custom.length} finding(s)`);

  const eslint = parseEslintReport(args["eslint-report"]);
  console.log(`✅  ESLint:        ${eslint.length} finding(s)`);

  const tsc = parseTscReport(args["tsc-report"]);
  console.log(`✅  TypeScript:    ${tsc.length} finding(s)`);

  const allFindings = [...custom, ...eslint, ...tsc];
  console.log(`\n📋  Total findings: ${allFindings.length}`);

  const bySeverity = {
    [SEVERITY.CRITICAL]: allFindings.filter((f) => f.severity === SEVERITY.CRITICAL),
    [SEVERITY.HIGH]: allFindings.filter((f) => f.severity === SEVERITY.HIGH),
    [SEVERITY.MEDIUM]: allFindings.filter((f) => f.severity === SEVERITY.MEDIUM),
    [SEVERITY.LOW]: allFindings.filter((f) => f.severity === SEVERITY.LOW),
  };

  console.log(`  Critical: ${bySeverity[SEVERITY.CRITICAL].length}`);
  console.log(`  High:     ${bySeverity[SEVERITY.HIGH].length}`);
  console.log(`  Medium:   ${bySeverity[SEVERITY.MEDIUM].length}`);
  console.log(`  Low:      ${bySeverity[SEVERITY.LOW].length}`);

  // Write JSON report
  const report = {
    scannedAt: new Date().toISOString(),
    totalFindings: allFindings.length,
    bySeverity: {
      critical: bySeverity[SEVERITY.CRITICAL].length,
      high: bySeverity[SEVERITY.HIGH].length,
      medium: bySeverity[SEVERITY.MEDIUM].length,
      low: bySeverity[SEVERITY.LOW].length,
    },
    findings: allFindings,
  };
  fs.writeFileSync(args.output, JSON.stringify(report, null, 2));
  console.log(`\n📄  Report written to ${args.output}`);

  // GitHub integration
  if (!GITHUB_TOKEN || !REPO) {
    console.log("\nℹ️  No GITHUB_TOKEN/REPO – skipping issue creation.");
    return;
  }

  console.log("\n🐙  Creating GitHub issues (Critical & High only)…");
  await ensureLabels();
  const openIssues = await existingIssues();

  // Only auto-file issues for Critical and High to avoid overwhelming the tracker.
  // Medium/Low findings appear in the JSON report and AI-BUG-REPORT.md.
  const issueableFindings = allFindings.filter(
    (f) => f.severity === SEVERITY.CRITICAL || f.severity === SEVERITY.HIGH
  );

  for (const finding of issueableFindings) {
    process.stdout.write(`  [${finding.severity}] ${finding.id} ${finding.file}:${finding.line || "?"} `);
    await createIssue(finding, openIssues);
  }

  console.log("\n✅  Done.");
}

main().catch((err) => {
  console.error("❌  Guardian scan failed:", err);
  process.exit(1);
});
