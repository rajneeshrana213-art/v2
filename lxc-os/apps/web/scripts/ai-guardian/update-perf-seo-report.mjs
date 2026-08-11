#!/usr/bin/env node
/**
 * AI Code Guardian - Performance & SEO Report Updater
 *
 * Reads a Lighthouse JSON report and rewrites docs/AI-PERF-SEO-REPORT.md.
 *
 * Usage:
 *   node scripts/ai-guardian/update-perf-seo-report.mjs --lighthouse-report <path>
 */

import fs from "fs";
import path from "path";
import { parseArgs } from "util";

const { values: args } = parseArgs({
  options: {
    "lighthouse-report": {
      type: "string",
      default: "/tmp/lighthouse-report.json",
    },
  },
});

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs", "AI-PERF-SEO-REPORT.md");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function scorePercent(score) {
  if (typeof score !== "number") return "N/A";
  return Math.round(score * 100);
}

function getCategoryIssues(lh, categoryId, limit = 8) {
  const category = lh?.categories?.[categoryId];
  if (!category) return [];

  const audits = lh.audits || {};
  const issues = [];

  for (const ref of category.auditRefs || []) {
    const audit = audits[ref.id];
    if (!audit) continue;
    if (audit.scoreDisplayMode === "notApplicable") continue;
    if (typeof audit.score !== "number") continue;
    if (audit.score >= 0.9) continue;

    issues.push({
      id: ref.id,
      title: audit.title || ref.id,
      score: scorePercent(audit.score),
      numericValue:
        typeof audit.numericValue === "number" ? audit.numericValue : null,
      description: audit.description || "",
    });
  }

  issues.sort((a, b) => {
    const aNum = a.numericValue ?? 0;
    const bNum = b.numericValue ?? 0;
    return bNum - aNum;
  });

  return issues.slice(0, limit);
}

function buildIssuesSection(title, issues) {
  if (!issues.length) {
    return `## ${title}\n\n_No notable issues detected in this category._\n`;
  }

  const rows = issues
    .map((issue) => {
      const score = typeof issue.score === "number" ? issue.score : "N/A";
      const impact = issue.numericValue
        ? ` (${Math.round(issue.numericValue)})`
        : "";
      return `| ${issue.title.replace(/\|/g, "\\|")} | ${score} | ${issue.id}${impact} |`;
    })
    .join("\n");

  return `## ${title}\n\n| Audit | Score | Id |\n|------|-------|----|\n${rows}\n`;
}

function buildReport(lh) {
  const reports = Array.isArray(lh) ? lh : [lh];
  const now = new Date().toISOString();
  const summaryRows = reports
    .map((report) => {
      const url = report?.finalUrl || report?.requestedUrl || "(unknown)";
      const perf = scorePercent(report?.categories?.performance?.score);
      const seo = scorePercent(report?.categories?.seo?.score);
      const bp = scorePercent(report?.categories?.["best-practices"]?.score);
      const a11y = scorePercent(report?.categories?.accessibility?.score);
      return `| ${url} | ${perf} | ${seo} | ${bp} | ${a11y} |`;
    })
    .join("\n");

  const detailSections = reports
    .map((report) => {
      const url = report?.finalUrl || report?.requestedUrl || "(unknown)";
      const perfIssues = getCategoryIssues(report, "performance");
      const seoIssues = getCategoryIssues(report, "seo");
      const bpIssues = getCategoryIssues(report, "best-practices");
      const a11yIssues = getCategoryIssues(report, "accessibility");

      return [
        `## URL: ${url}`,
        "",
        buildIssuesSection("Performance: Top Issues", perfIssues),
        "---",
        buildIssuesSection("SEO: Top Issues", seoIssues),
        "---",
        buildIssuesSection("Best Practices: Top Issues", bpIssues),
        "---",
        buildIssuesSection("Accessibility: Top Issues", a11yIssues),
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return `# AI Performance & SEO Report\n\n> **Last updated:** ${now}\n> **Source:** GitHub Actions - Lighthouse\n\n---\n\n## Scores (per URL)\n\n| URL | Performance | SEO | Best Practices | Accessibility |\n|-----|-------------|-----|----------------|---------------|\n${summaryRows || "| (none) | N/A | N/A | N/A | N/A |"}\n\n---\n\n${detailSections}\n\n---\n\n## Notes\n\n- Scores below 100 list the highest-impact audits first.\n- For full details, open the Lighthouse JSON artifact from the workflow run.\n`;
}

function main() {
  const data = readJson(args["lighthouse-report"]);
  if (!data) {
    const empty = {
      categories: {
        performance: { score: null },
        seo: { score: null },
        "best-practices": { score: null },
        accessibility: { score: null },
      },
    };
    fs.writeFileSync(REPORT_PATH, buildReport(empty));
    console.warn("No Lighthouse report found - wrote empty report.");
    return;
  }

  fs.writeFileSync(REPORT_PATH, buildReport(data));
  console.log(`Report updated: ${REPORT_PATH}`);
}

main();
