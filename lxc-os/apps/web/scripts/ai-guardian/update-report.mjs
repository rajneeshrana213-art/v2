#!/usr/bin/env node
/**
 * AI Code Guardian – Bug Intelligence Report Updater
 *
 * Reads the JSON guardian report and rewrites docs/AI-BUG-REPORT.md
 * so the markdown stays current after every scan.
 *
 * Also creates/updates a consolidated GitHub Issue summarising all findings.
 *
 * Usage:
 *   node scripts/ai-guardian/update-report.mjs --guardian-report <path>
 */

import fs from "fs";
import path from "path";
import { parseArgs } from "util";

const { values: args } = parseArgs({
  options: {
    "guardian-report": { type: "string", default: "/tmp/guardian-report.json" },
  },
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO = process.env.REPO || "";

// ---------------------------------------------------------------------------
// GitHub API helpers
// ---------------------------------------------------------------------------
async function githubRequest(method, endpoint, body) {
  if (!GITHUB_TOKEN || !REPO) return null;
  const url = `https://api.github.com/repos/${REPO}${endpoint}`;
  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`GitHub API ${method} ${endpoint} failed ${resp.status}: ${errText}`);
    return null;
  }
  return resp.json();
}

const SUMMARY_ISSUE_LABEL = "ai-guardian-summary";
const SUMMARY_ISSUE_TITLE_PREFIX = "Potential Bugs Detected in Repository";

async function ensureSummaryLabel() {
  const existing = await githubRequest("GET", `/labels/${encodeURIComponent(SUMMARY_ISSUE_LABEL)}`);
  if (!existing) {
    await githubRequest("POST", "/labels", {
      name: SUMMARY_ISSUE_LABEL,
      color: "0075ca",
      description: "Auto-generated bug summary issue by AI Code Guardian",
    });
  }
}

async function closeExistingSummaryIssues() {
  const issues = await githubRequest(
    "GET",
    `/issues?state=open&labels=${encodeURIComponent(SUMMARY_ISSUE_LABEL)}&per_page=100`
  );
  if (!Array.isArray(issues)) return;
  for (const issue of issues) {
    await githubRequest("PATCH", `/issues/${issue.number}`, { state: "closed" });
    console.log(`  ↳ Closed previous summary issue #${issue.number}`);
  }
}

function buildSummaryIssueBody(data) {
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "short", year: "numeric" });
  const { critical = 0, high = 0, medium = 0, low = 0 } = data.bySeverity || {};

  const topFindings = (data.findings || [])
    .filter((f) => f.severity === "Critical" || f.severity === "High")
    .slice(0, 20)
    .map(
      (f) =>
        `- **[${f.id}] ${f.title}** in \`${f.file}:${f.line || "?"}\`\n  ${f.message}`
    )
    .join("\n\n");

  const medLowFindings = (data.findings || [])
    .filter((f) => f.severity === "Medium" || f.severity === "Low")
    .slice(0, 10)
    .map((f) => `- **[${f.id}]** \`${f.file}:${f.line || "?"}\` – ${f.title}`)
    .join("\n");

  return `## Potential Issues found after code scan (${monthYear})

> This issue is **automatically generated** by the AI Code Guardian on every scan.
> Individual GitHub Issues are also opened for each Critical and High finding.

### 📊 Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${critical} |
| 🟠 High | ${high} |
| 🟡 Medium | ${medium} |
| 🟢 Low | ${low} |
| **Total** | **${data.totalFindings || 0}** |

---

### 🔴 Critical & 🟠 High Findings

${topFindings || "_No Critical or High findings detected._"}

---

### 🟡 Medium & 🟢 Low Findings (sample)

${medLowFindings || "_No Medium or Low findings detected._"}

---

**These are potential issues and might not all be true bugs in production. Please review for actionable problems and triage as needed.**

*Detected by AI Code Guardian · ${data.scannedAt || now.toISOString()}*
See [AI-BUG-REPORT.md](../../blob/main/docs/AI-BUG-REPORT.md) for the full report.`;
}

async function createSummaryIssue(data) {
  if (!GITHUB_TOKEN || !REPO) {
    console.log("ℹ️  No GITHUB_TOKEN/REPO – skipping summary issue creation.");
    return;
  }

  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "short", year: "numeric" });

  await ensureSummaryLabel();
  await closeExistingSummaryIssues();

  const issue = await githubRequest("POST", "/issues", {
    title: `${SUMMARY_ISSUE_TITLE_PREFIX} (${monthYear} scan)`,
    body: buildSummaryIssueBody(data),
    labels: ["ai-guardian-summary", "bug"],
  });

  if (issue) {
    console.log(`🐛  Created consolidated bug summary issue #${issue.number}`);
  }
}

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs", "AI-BUG-REPORT.md");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function severityEmoji(sev) {
  return { Critical: "🔴", High: "🟠", Medium: "🟡", Low: "🟢" }[sev] || "⚪";
}

function riskScore(bySeverity) {
  return (
    (bySeverity.critical || 0) * 10 +
    (bySeverity.high || 0) * 5 +
    (bySeverity.medium || 0) * 2 +
    (bySeverity.low || 0) * 1
  );
}

function formatBar(count, maxLength = 20) {
  const filled = Math.min(count, maxLength);
  return `[${"█".repeat(filled)}${".".repeat(maxLength - filled)}] ${count}`;
}

function buildReport(data) {
  const now = new Date().toISOString();
  const score = riskScore(data.bySeverity);
  const total = data.totalFindings || 0;
  const { critical = 0, high = 0, medium = 0, low = 0 } = data.bySeverity || {};

  // Group findings by check ID to find recurring patterns
  const patternCount = {};
  for (const f of data.findings || []) {
    patternCount[f.id] = (patternCount[f.id] || 0) + 1;
  }
  const recurringPatterns = Object.entries(patternCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => `| \`${id}\` | ${count} |`)
    .join("\n");

  // Table of findings (top 50)
  const findingRows = (data.findings || [])
    .slice(0, 50)
    .map(
      (f) =>
        `| ${severityEmoji(f.severity)} ${f.severity} | \`${f.id}\` | ${f.title.replace(/\|/g, "\\|")} | \`${f.file}:${f.line || "?"}\` |`
    )
    .join("\n");

  return `# 🛡️ AI Bug Intelligence Report

> **Last updated:** ${now}
> **Scan trigger:** GitHub Actions – AI Code Guardian

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total findings | **${total}** |
| 🔴 Critical | ${critical} |
| 🟠 High | ${high} |
| 🟡 Medium | ${medium} |
| 🟢 Low | ${low} |
| Open | ${total} |
| Fixed | *(tracked via closed GitHub Issues)* |
| **Risk Score** | **${score}** *(10×Critical + 5×High + 2×Medium + 1×Low)* |

---

## 🚨 Severity Distribution

\`\`\`
Critical  ${formatBar(critical)}
High      ${formatBar(high)}
Medium    ${formatBar(medium)}
Low       ${formatBar(low)}
\`\`\`

---

## 🔁 Recurring Patterns (Top 5)

| Check ID | Occurrences |
|----------|-------------|
${recurringPatterns || "| — | — |"}

---

## 📋 Findings (latest scan)

| Severity | Check ID | Title | Location |
|----------|----------|-------|----------|
${findingRows || "| — | — | No findings | — |"}

${total > 50 ? `\n> ⚠️ Showing first 50 of ${total} findings. See the full JSON artifact on the Actions run.\n` : ""}

---

## 🗂️ Check Reference

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| SEC-001 | Critical | Security | Hardcoded JWT / NextAuth secret fallback |
| SEC-002 | High | Security | console.log leaking sensitive data |
| SEC-003 | High | Security | API route missing authentication check |
| SEC-004 | Medium | Security | Missing leading slash in PUBLIC_PATHS entry |
| SEC-005 | Medium | Security | Unhandled promise rejection in async handler |
| QUAL-001 | Low | Quality | Use of \`as any\` disabling TypeScript type safety |
| QUAL-002 | Low | Quality | Dead / placeholder TODO comment |
| ESLINT-* | High/Med | Linting | ESLint rule violations |
| TSC-* | High | Types | TypeScript compilation errors |

---

## 📖 About

This report is generated and maintained automatically by the **AI Code Guardian** workflow
(\`.github/workflows/ai-code-guardian.yml\`). It runs on every push, pull request, and every
6 hours on a schedule.

- A consolidated bug summary GitHub Issue is created automatically on every scan.
- Individual GitHub Issues are opened automatically for Critical and High severity findings.
- Critical issues trigger a dedicated PR with a suggested patch.
- Re-analysis runs after every push / merge to main.

*© LXC v2 – AI Code Guardian*
`;
}

async function main() {
  const data = readJson(args["guardian-report"]);
  if (!data) {
    console.warn("No guardian report found – writing empty report.");
    const empty = { scannedAt: new Date().toISOString(), totalFindings: 0, bySeverity: {}, findings: [] };
    fs.writeFileSync(REPORT_PATH, buildReport(empty));
    await createSummaryIssue(empty);
    return;
  }

  fs.writeFileSync(REPORT_PATH, buildReport(data));
  console.log(`📄  Bug Intelligence Report updated: ${REPORT_PATH}`);

  await createSummaryIssue(data);
}

main();
