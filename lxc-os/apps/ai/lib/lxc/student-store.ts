/**
 * LXC Student Growth OS — Persistent Student Store
 * Stores profile, XP, badges, study history, quiz scores, career data
 * Uses localStorage for lightweight persistence (no server required)
 */

export interface StudentProfile {
  name: string;
  class: string; // Class 6–12
  board: string; // CBSE, ICSE, State
  subjects: string[];
  studyHoursPerDay: number;
  language: 'hindi' | 'hinglish' | 'english';
  examDate?: string;
  goals?: string;
  createdAt: number;
  updatedAt: number;
}

export interface XPEntry {
  amount: number;
  reason: string;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  description: string;
  unlockedAt: number;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  timestamp: number;
  quizScore?: number; // 0–100
  type?: 'learn' | 'revise' | 'practice' | 'rest';
}

export interface CareerProfile {
  interests: string[];
  suggestedCareers: string[];
  completedAt?: number;
  quizAnswers?: Record<string, string>;
}

export interface WeeklyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
}

export interface LXCStudentData {
  profile: StudentProfile | null;
  totalXP: number;
  level: number;
  xpHistory: XPEntry[];
  badges: Badge[];
  studySessions: StudySession[];
  careerProfile: CareerProfile | null;
  streak: WeeklyStreak;
  studyPlan: StudyPlanDay[] | null;
  studyPlanGeneratedAt?: number;
  subjectScores: Record<string, number[]>; // subject → array of quiz scores
}

export interface StudyPlanDay {
  day: string; // e.g. "Day 1 — Monday"
  date?: string;
  theme?: string;
  tasks: StudyTask[];
  totalMinutes: number;
  motivation?: string;
}

export interface StudyTask {
  subject: string;
  topic: string;
  durationMinutes: number;
  type: 'learn' | 'revise' | 'practice' | 'rest';
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  tip?: string;
}

const STORAGE_KEY = 'lxc-student-data';

const DEFAULT_DATA: LXCStudentData = {
  profile: null,
  totalXP: 0,
  level: 1,
  xpHistory: [],
  badges: [],
  studySessions: [],
  careerProfile: null,
  streak: { currentStreak: 0, longestStreak: 0, lastStudyDate: '' },
  studyPlan: null,
  subjectScores: {},
};

export function loadStudentData(): LXCStudentData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveStudentData(data: LXCStudentData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function addXP(data: LXCStudentData, amount: number, reason: string): LXCStudentData {
  const newTotal = data.totalXP + amount;
  const newLevel = Math.floor(newTotal / 500) + 1;
  const newData = {
    ...data,
    totalXP: newTotal,
    level: newLevel,
    xpHistory: [{ amount, reason, timestamp: Date.now() }, ...data.xpHistory].slice(0, 50),
  };
  saveStudentData(newData);
  return newData;
}

export function recordStudySession(
  data: LXCStudentData,
  session: Omit<StudySession, 'id' | 'timestamp'>,
): LXCStudentData {
  const today = new Date().toISOString().split('T')[0];
  const newSession: StudySession = {
    ...session,
    id: `session-${Date.now()}`,
    timestamp: Date.now(),
  };

  // Update streak
  let streak = { ...data.streak };
  if (streak.lastStudyDate === today) {
    // Already studied today
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastStudyDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastStudyDate = today;
  }

  const newData = {
    ...data,
    studySessions: [newSession, ...data.studySessions].slice(0, 200),
    streak,
  };
  const withXP = addXP(
    newData,
    Math.round(session.durationMinutes * 2),
    `${session.subject} study session`,
  );
  saveStudentData(withXP);
  return withXP;
}

export function recordQuizScore(
  data: LXCStudentData,
  subject: string,
  score: number,
): LXCStudentData {
  const scores = data.subjectScores[subject] ?? [];
  const newScores = [...scores, score].slice(-20);
  const newData = {
    ...data,
    subjectScores: { ...data.subjectScores, [subject]: newScores },
  };
  const xpGained = Math.round(score * 0.5);
  const withXP = addXP(newData, xpGained, `Quiz: ${subject} (${score}%)`);
  saveStudentData(withXP);
  return withXP;
}

export function unlockBadge(
  data: LXCStudentData,
  badge: Omit<Badge, 'unlockedAt'>,
): LXCStudentData {
  if (data.badges.some((b) => b.id === badge.id)) return data;
  const newData = {
    ...data,
    badges: [{ ...badge, unlockedAt: Date.now() }, ...data.badges],
  };
  saveStudentData(newData);
  return newData;
}

export function getWeakSubjects(data: LXCStudentData): string[] {
  return Object.entries(data.subjectScores)
    .filter(([, scores]) => {
      if (scores.length === 0) return false;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg < 60;
    })
    .map(([subject]) => subject);
}

export function getStrongSubjects(data: LXCStudentData): string[] {
  return Object.entries(data.subjectScores)
    .filter(([, scores]) => {
      if (scores.length === 0) return false;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg >= 80;
    })
    .map(([subject]) => subject);
}

export function getAverageScore(data: LXCStudentData, subject?: string): number {
  if (subject) {
    const scores = data.subjectScores[subject] ?? [];
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  const all = Object.values(data.subjectScores).flat();
  if (all.length === 0) return 0;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

// XP to next level
export function xpToNextLevel(totalXP: number): {
  current: number;
  needed: number;
  progress: number;
} {
  const level = Math.floor(totalXP / 500) + 1;
  const levelStart = (level - 1) * 500;
  const levelEnd = level * 500;
  return {
    current: totalXP - levelStart,
    needed: 500,
    progress: Math.round(((totalXP - levelStart) / (levelEnd - levelStart)) * 100),
  };
}

// PREDEFINED BADGES
export const PREDEFINED_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'first-lesson',
    name: 'First Lesson',
    nameHi: 'पहला पाठ',
    icon: '📚',
    description: 'Completed your first study session',
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    nameHi: '3 दिन की स्ट्रीक',
    icon: '🔥',
    description: 'Studied 3 days in a row',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    nameHi: 'सप्ताह योद्धा',
    icon: '⚡',
    description: 'Studied 7 days in a row',
  },
  {
    id: 'quiz-ace',
    name: 'Quiz Ace',
    nameHi: 'क्विज़ विशेषज्ञ',
    icon: '🎯',
    description: 'Scored 90%+ on a quiz',
  },
  {
    id: 'career-explorer',
    name: 'Career Explorer',
    nameHi: 'करियर खोजकर्ता',
    icon: '🧭',
    description: 'Completed the career discovery quiz',
  },
  {
    id: 'study-plan',
    name: 'Planner',
    nameHi: 'योजनाकार',
    icon: '📅',
    description: 'Generated your first study plan',
  },
  {
    id: 'xp-500',
    name: 'Rising Star',
    nameHi: 'उभरता सितारा',
    icon: '⭐',
    description: 'Earned 500 XP',
  },
  {
    id: 'xp-2000',
    name: 'Knowledge Seeker',
    nameHi: 'ज्ञान साधक',
    icon: '🌟',
    description: 'Earned 2000 XP',
  },
];

// Convenience aliases used by LXC pages
export function getLXCStudentData(): LXCStudentData {
  return loadStudentData();
}

export function getLXCLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1;
}
