#!/usr/bin/env node
/**
 * AI Code Guardian - Auto-fix findings and open PRs.
 *
 * Usage:
 *   node scripts/ai-guardian/auto-fix.mjs --guardian-report <path> --base-branch <branch> --max-prs 5
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseArgs } from "util";
import { execSync } from "child_process";

const { values: args } = parseArgs({
  options: {
    "guardian-report": { type: "string", default: "/tmp/guardian-report.json" },
    "base-branch": { type: "string", default: "main" },
    "max-prs": { type: "string", default: "5" },
  },
});

const ROOT = process.cwd();
const WORKTREES_DIR = path.join(ROOT, ".worktrees");
const REPORT_PATH = args["guardian-report"];
const BASE_BRANCH = args["base-branch"] || process.env.BASE_BRANCH || "main";
const MAX_PRS = Math.max(0, parseInt(args["max-prs"], 10) || 0);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO = process.env.REPO || process.env.GITHUB_REPOSITORY || "";

function run(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: "pipe" }).toString().trim();
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function branchNameForFinding(finding) {
  const base = `${finding.id}-${path.basename(finding.file || "file")}`;
  const slug = slugify(base) || "eslint-fix";
  const hash = crypto
    .createHash("sha1")
    .update(`${finding.id}|${finding.file}|${finding.line || ""}`)
    .digest("hex")
    .slice(0, 8);
  return `ai-guardian/fix/${slug}-${hash}`;
}

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
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(
      `GitHub API error ${resp.status} for ${endpoint}: ${errText}`,
    );
    return null;
  }
  return resp.json();
}

async function prExists(owner, branch) {
  const prs = await githubRequest(
    "GET",
    `/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`,
  );
  return Array.isArray(prs) && prs.length > 0;
}

async function createPr(branch, finding, mode) {
  if (!REPO) return null;
  const [owner] = REPO.split("/");
  const titlePrefix = mode === "plan" ? "chore" : "fix";
  const title = `${titlePrefix}: ${finding.id} in ${finding.file}`;
  const body =
    mode === "plan"
      ? `## Fix Plan (manual)

**Finding:** ${finding.id}
**Severity:** ${finding.severity}
**File:** ${finding.file}
**Line:** ${finding.line || "?"}

This PR adds a fix plan with the suggested remediation. Apply the change manually and update the plan with the resolution.
`
      : `## Auto-fix

**Finding:** ${finding.id}
**Severity:** ${finding.severity}
**File:** ${finding.file}
**Line:** ${finding.line || "?"}

This PR applies automated changes for the finding above. Please review and merge if safe.
`;

  const exists = await prExists(owner, branch);
  if (exists) {
    console.log(`PR already exists for ${branch}, skipping.`);
    return null;
  }

  return githubRequest("POST", "/pulls", {
    title,
    head: branch,
    base: BASE_BRANCH,
    body,
    draft: false,
  });
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const CUSTOM_FIXERS = {
  "SEC-004": {
    file: "middleware.ts",
    apply(content) {
      if (content.includes("'/privacy'") || content.includes('"/privacy"'))
        return null;
      const updated = content.replace(/(['"])privacy\1/g, "$1/privacy$1");
      return updated === content ? null : updated;
    },
  },
  "SEC-002": {
    file: null,
    apply(content) {
      const lines = content.split("\n");
      const filtered = lines.filter(
        (line) =>
          !/console\.(log|info|debug)\s*\([^)]*\b(token|password|secret|credential)\b/i.test(
            line,
          ),
      );
      const updated = filtered.join("\n");
      return updated === content ? null : updated;
    },
  },
};

function getFindings(data) {
  const all = Array.isArray(data?.findings) ? data.findings : [];
  return all.filter((f) => typeof f.id === "string");
}

function runTests(worktreePath) {
  run("npm run lint", worktreePath);
  run("npx tsc --noEmit", worktreePath);
}

function fileExists(worktreePath, relPath) {
  return fs.existsSync(path.join(worktreePath, relPath));
}

function writeFixPlan(worktreePath, finding) {
  const plansDir = path.join(worktreePath, "docs", "ai-guardian", "fix-plans");
  ensureDir(plansDir);
  const hash = crypto
    .createHash("sha1")
    .update(`${finding.id}|${finding.file}|${finding.line || ""}`)
    .digest("hex")
    .slice(0, 8);
  const fileName = `${finding.id.toLowerCase()}-${hash}.md`;
  const planPath = path.join(plansDir, fileName);
  const content = [
    `# Fix Plan: ${finding.id}`,
    "",
    `- Severity: ${finding.severity}`,
    `- File: ${finding.file}`,
    `- Line: ${finding.line || "?"}`,
    "",
    "## Description",
    "",
    finding.message || "(no message)",
    "",
    "## Suggested Fix",
    "",
    finding.fix || "(no suggestion)",
    "",
    "## Snippet",
    "",
    "```",
    finding.snippet || "(not provided)",
    "```",
    "",
    "## Resolution",
    "",
    "- [ ] Implement fix",
    "- [ ] Add tests if needed",
    "- [ ] Verify locally",
    "",
  ].join("\n");

  fs.writeFileSync(planPath, content);
}

async function main() {
  if (!GITHUB_TOKEN || !REPO) {
    console.log("Missing GITHUB_TOKEN/REPO - skipping auto-fix.");
    return;
  }

  const data = readJson(REPORT_PATH);
  if (!data) {
    console.log("No guardian report found - skipping auto-fix.");
    return;
  }

  const findings = getFindings(data);
  if (!findings.length) {
    console.log("No ESLint findings to auto-fix.");
    return;
  }

  ensureDir(WORKTREES_DIR);

  const limited = MAX_PRS > 0 ? findings.slice(0, MAX_PRS) : findings;

  for (const finding of limited) {
    const branch = branchNameForFinding(finding);
    const worktreePath = path.join(
      WORKTREES_DIR,
      branch.replace(/[\/]/g, "__"),
    );

    try {
      if (fs.existsSync(worktreePath)) {
        console.log(`Worktree already exists for ${branch}, skipping.`);
        continue;
      }

      run(`git worktree add -b ${branch} ${worktreePath} ${BASE_BRANCH}`, ROOT);

      const hasFile = finding.file && fileExists(worktreePath, finding.file);
      const canFix =
        finding.id.startsWith("ESLINT-") ||
        (CUSTOM_FIXERS[finding.id] &&
          (CUSTOM_FIXERS[finding.id].file || hasFile));

      if (!canFix) {
        writeFixPlan(worktreePath, finding);
      } else if (finding.id.startsWith("ESLINT-")) {
        if (!hasFile) {
          console.log(`File not found for ${finding.file}, skipping.`);
          run(`git worktree remove ${worktreePath}`, ROOT);
          continue;
        }
        run(`npx next lint --fix --file ${finding.file}`, worktreePath);
      } else if (CUSTOM_FIXERS[finding.id]) {
        const fixer = CUSTOM_FIXERS[finding.id];
        const targetPath = fixer.file
          ? path.join(worktreePath, fixer.file)
          : path.join(worktreePath, finding.file);
        if (!fs.existsSync(targetPath)) {
          console.log(`Fix file not found for ${finding.id}, skipping.`);
          run(`git worktree remove ${worktreePath}`, ROOT);
          continue;
        }
        const current = fs.readFileSync(targetPath, "utf8");
        const updated = fixer.apply(current);
        if (!updated) {
          console.log(`No changes needed for ${finding.id}.`);
          run(`git worktree remove ${worktreePath}`, ROOT);
          continue;
        }
        fs.writeFileSync(targetPath, updated);
      }

      const status = run("git status --porcelain", worktreePath);
      if (!status) {
        console.log(`No changes for ${finding.id} in ${finding.file}.`);
        run(`git worktree remove ${worktreePath}`, ROOT);
        continue;
      }

      if (canFix) {
        try {
          runTests(worktreePath);
        } catch (err) {
          console.error(`Tests failed for ${finding.id}, skipping PR.`);
          run(`git worktree remove ${worktreePath}`, ROOT);
          continue;
        }
      }

      run("git add -A", worktreePath);
      const mode = canFix ? "fix" : "plan";
      const commitPrefix = mode === "plan" ? "chore" : "fix";
      run(
        `git commit -m "${commitPrefix}: ${finding.id} in ${finding.file} [skip ci]"`,
        worktreePath,
      );
      run(`git push origin ${branch}`, worktreePath);

      const pr = await createPr(branch, finding, mode);
      if (pr?.html_url) {
        console.log(`Opened PR: ${pr.html_url}`);
      }

      run(`git worktree remove ${worktreePath}`, ROOT);
    } catch (err) {
      console.error(`Auto-fix failed for ${finding.id}:`, err?.message || err);
      try {
        if (fs.existsSync(worktreePath)) {
          run(`git worktree remove ${worktreePath}`, ROOT);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  console.log("Auto-fix completed.");
}

main();
