/**
 * module-access.ts
 *
 * Static module access matrix for LXC AI platform.
 * Maps each plan tier to the set of moduleKeys it can access.
 *
 * Free     → Only doubt forum + achievements
 * Ignite   → School-focused modules (L1 + L2 partial + L5 partial)
 * Zenith   → College/Career modules (L1 + L2 + L3 + L4 partial)
 * Apex     → Everything (all 24 modules)
 * Lifetime → Same as Apex but never expires — pay once, use forever
 */

export type PlanKey = 'free' | 'ignite' | 'zenith' | 'apex' | 'lifetime';

export interface ModuleMeta {
  key: string;
  title: string;
  minPlan: PlanKey;
  layer: string;
}

// ── Plan hierarchy ───────────────────────────────────────────────────────────
const PLAN_RANK: Record<PlanKey, number> = {
  free: 0,
  ignite: 1,
  zenith: 2,
  apex: 3,
  lifetime: 4, // Highest rank — superset of Apex, never expires
};

export function planIncludes(userPlan: PlanKey, requiredPlan: PlanKey): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}

// ── Module definitions ───────────────────────────────────────────────────────
export const MODULE_META: ModuleMeta[] = [
  // L1 — Academic Intelligence
  { key: 'ai-classroom',      title: 'AI Classroom',                   minPlan: 'ignite', layer: 'L1' },
  { key: 'smart-notes',       title: 'Smart Notes',                    minPlan: 'ignite', layer: 'L1' },
  { key: 'doubt-forum',       title: 'Doubt Discussion Forum',         minPlan: 'free',   layer: 'L1' },

  // L2 — Personalized Learning
  { key: 'study-roadmap',     title: 'Study Roadmap',                  minPlan: 'ignite', layer: 'L2' },
  { key: 'practice-tests',    title: 'Practice Tests & Adaptive Quiz', minPlan: 'ignite', layer: 'L2' },
  { key: 'flashcard-ai',      title: 'Flashcard AI',                   minPlan: 'ignite', layer: 'L2' },
  { key: 'learning-style',    title: 'Learning Style Detector',        minPlan: 'ignite', layer: 'L2' },

  // L3 — Performance & Cognitive
  { key: 'digital-twin',      title: 'Digital Twin Model',             minPlan: 'zenith', layer: 'L3' },
  { key: 'performance-dash',  title: 'Performance Dashboard',          minPlan: 'zenith', layer: 'L3' },
  { key: 'risk-alert',        title: 'Failure Risk Alert AI',          minPlan: 'zenith', layer: 'L3' },
  { key: 'focus-pomodoro',    title: 'Focus AI Pomodoro',              minPlan: 'ignite', layer: 'L3' },

  // L4 — Career & Self-Enhancement
  { key: 'project-companion', title: 'Project Companion',              minPlan: 'zenith', layer: 'L4' },
  { key: 'mentor-ai',         title: 'Mentor AI & Life Skills',        minPlan: 'zenith', layer: 'L4' },
  { key: 'decision-sim',      title: 'Decision Simulator',             minPlan: 'apex',   layer: 'L4' },
  { key: 'wellness-ai',       title: 'Wellness & Emotion AI',          minPlan: 'apex',   layer: 'L4' },
  { key: 'soft-skills',       title: 'Soft Skills Coach & Avatar',     minPlan: 'zenith', layer: 'L4' },
  { key: 'placement-engine',  title: 'RIT AI Placement Engine',        minPlan: 'apex',   layer: 'L4' },
  { key: 'talent-discovery',  title: 'Talent Discovery',               minPlan: 'zenith', layer: 'L4' },

  // L5 — Gamification
  { key: 'achievements-xp',   title: 'Achievements & XP',              minPlan: 'free',   layer: 'L5' },
  { key: 'skill-passport',    title: 'Skill Passport',                 minPlan: 'zenith', layer: 'L5' },
  { key: 'peer-study',        title: 'Peer Study Arena',               minPlan: 'ignite', layer: 'L5' },

  // L6 — Accessibility & Bharat
  { key: 'bharat-mode',       title: 'Bharat Mode & Voice AI',         minPlan: 'ignite', layer: 'L6' },
  { key: 'parent-dashboard',  title: 'Parent Dashboard',               minPlan: 'ignite', layer: 'L6' },
  { key: 'gov-analytics',     title: 'Gov & CSR Analytics',            minPlan: 'zenith', layer: 'L6' },
];

// Quick lookup map: moduleKey → minPlan
export const MODULE_MIN_PLAN: Record<string, PlanKey> = Object.fromEntries(
  MODULE_META.map((m) => [m.key, m.minPlan])
);

// ── Plan display metadata ─────────────────────────────────────────────────────
export const PLAN_META: Record<PlanKey, {
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  price: { monthly: number; annual: number; lifetime: number };
  desc: string;
  badge: string;
}> = {
  free: {
    label: 'Free Learner',
    emoji: '🆓',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-400',
    price: { monthly: 0, annual: 0, lifetime: 0 },
    desc: 'Doubt Forum access only',
    badge: 'FREE',
  },
  ignite: {
    label: 'Ignite Plus',
    emoji: '🎓',
    color: '#1A9FFF',
    gradient: 'from-blue-600 to-[#1A9FFF]',
    price: { monthly: 49, annual: 499, lifetime: 1499 },
    desc: 'School students — L1 + L2 modules',
    badge: 'IGNITE',
  },
  zenith: {
    label: 'Zenith Pro',
    emoji: '🏢',
    color: '#5CDD2B',
    gradient: 'from-green-600 to-[#5CDD2B]',
    price: { monthly: 99, annual: 999, lifetime: 2999 },
    desc: 'College & career — L1–L4 modules',
    badge: 'ZENITH',
  },
  apex: {
    label: 'Apex Elite',
    emoji: '⚡',
    color: '#FBBF24',
    gradient: 'from-amber-500 to-yellow-400',
    price: { monthly: 149, annual: 1499, lifetime: 3999 },
    desc: 'Competitive exams — all 24 modules',
    badge: 'APEX',
  },
  lifetime: {
    label: 'Lifetime Elite',
    emoji: '♾️',
    color: '#A855F7',
    gradient: 'from-purple-600 to-violet-500',
    price: { monthly: 0, annual: 0, lifetime: 3999 },
    desc: 'All 24 modules — pay once, use forever',
    badge: 'LIFETIME',
  },
};

// Map educationLevel goal → recommended plan
export const GOAL_PLAN_MAP: Record<string, PlanKey> = {
  school: 'ignite',
  college: 'zenith',
  competitive: 'apex',
};
