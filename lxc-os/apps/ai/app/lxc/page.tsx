'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BarChart2,
  Compass,
  Gamepad2,
  Brain,
  Zap,
  GraduationCap,
  Star,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Mic,
  ChevronRight,
  Plus,
  CheckCircle2,
  Lock,
  Flame,
  Trophy,
  CheckSquare,
  Sparkles,
  LogIn,
  Home,
  User,
  Settings,
  Bug,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  LogOut,
  Globe,
  Share2,
  Zap as ZapIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/hooks/use-theme';
import { useUserProfileStore } from '@/lib/store/user-profile';
import {
  loadStudentData,
  saveStudentData,
  type StudentProfile,
  type LXCStudentData,
  PREDEFINED_BADGES,
  unlockBadge,
} from '@/lib/lxc/student-store';
import { useForumPlan } from '@/lib/hooks/use-forum-plan';
import { PLAN_META, type PlanKey } from '@/lib/lxc/module-access';
import { UpgradeModal } from '@/components/lxc/UpgradeModal';

const VALID_PLAN_KEYS: PlanKey[] = ['free', 'ignite', 'zenith', 'apex', 'lifetime'];

const SUBJECTS_CBSE = [
  'Mathematics',
  'Science',
  'Social Science',
  'English',
  'Hindi',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'Physical Education',
];

const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB'];

const LANGUAGES = [
  { code: 'en', label: 'English - EN' },
  { code: 'hi', label: 'Hindi - हिंदी' },
  { code: 'pa', label: 'Punjabi - ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati - ગુજરાતી' },
  { code: 'mr', label: 'Marathi - मराठी' },
  { code: 'bn', label: 'Bengali - বাংলা' },
  { code: 'ta', label: 'Tamil - தமிழ்' },
  { code: 'te', label: 'Telugu - తెలుగు' },
  { code: 'kn', label: 'Kannada - ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam - മലയാളം' },
  { code: 'ur', label: 'Urdu - اردو' },
];

const LAYERS_META: Record<string, { title: string; icon: string }> = {
  L1: { title: 'Academic Intelligence (DSA & Syllabus)', icon: '📖' },
  L2: { title: 'Personalized Learning & Design', icon: '🎯' },
  L3: { title: 'Performance & Cognitive AI', icon: '🧠' },
  L4: { title: 'Career & Self-Enhancement AI', icon: '🧭' },
  L5: { title: 'Gamification & Skill Economy', icon: '🏆' },
  L6: { title: 'Accessibility & Bharat Mode', icon: '🇮🇳' },
};



const featuredModules = [
  {
    href: '/?workspace=true',
    icon: GraduationCap,
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
    title: 'AI Classroom',
    desc: 'Immersive, multi-agent learning classroom',
    color: 'from-emerald-600 to-emerald-400',
    moduleKey: 'ai-classroom',
  },
  {
    href: '/lxc/study-plan',
    icon: Target,
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/15',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
    title: 'Study Roadmap',
    desc: 'Personalized curriculum roadmaps',
    color: 'from-amber-600 to-amber-400',
    moduleKey: 'study-roadmap',
  },
  {
    href: '/dashboard/forum',
    icon: Users,
    bgColor: 'bg-blue-600/10 hover:bg-blue-600/15',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    iconColor: 'text-blue-400',
    title: 'Doubt Discussion',
    desc: 'Resolve doubts with peers & AI',
    color: 'from-blue-600 to-blue-400',
    moduleKey: 'doubt-forum',
  },
  {
    href: '/lxc/digital-twin',
    icon: Brain,
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
    iconColor: 'text-purple-400',
    title: 'Digital Twin AI',
    desc: 'Cognitive replica of your comprehension',
    color: 'from-purple-600 to-purple-400',
    moduleKey: 'digital-twin',
  },
];

const modules = [
  // L1: Academic Intelligence
  { href: '/?workspace=true', icon: GraduationCap, color: 'from-sky-600 to-sky-400', title: 'AI Classroom', titleEn: 'AI Classroom', desc: 'Upload PDF to instantly generate an immersive, multi-agent learning classroom', descEn: 'Upload PDF to instantly generate an immersive, multi-agent learning classroom', phase: 'Phase 1', module: 'Module 1', layerKey: 'L1', moduleKey: 'ai-classroom' },
  { href: '/lxc/projects', icon: BookOpen, color: 'from-blue-600 to-blue-400', title: 'Smart Notes', titleEn: 'Smart Notes', desc: 'Converts lectures/PDFs to AI summaries, concept maps, and core highlights', descEn: 'Converts lectures/PDFs to AI summaries, concept maps, and core highlights', phase: 'Phase 1', module: 'Module 2', layerKey: 'L1', moduleKey: 'smart-notes' },
  { href: '/dashboard/forum', icon: Users, color: 'from-teal-600 to-teal-400', title: 'Doubt Discussion Forum', titleEn: 'Doubt Discussion Forum', desc: 'Share and resolve your doubts with peers and teachers in real-time', descEn: 'Share and resolve your doubts with peers and teachers in real-time', phase: 'Phase 1', module: 'Module 3', layerKey: 'L1', moduleKey: 'doubt-forum' },
  // L2: Personalized Learning
  { href: '/lxc/study-plan', icon: BookOpen, color: 'from-blue-600 to-blue-400', title: 'Study Roadmap', titleEn: 'Study Roadmap', desc: 'AI-powered personalized study roadmap tailored to your curriculum', descEn: 'AI-powered personalized study roadmap tailored to your curriculum', phase: 'Phase 1', module: 'Module 4', layerKey: 'L2', moduleKey: 'study-roadmap' },
  { href: '/lxc/study-plan', icon: Brain, color: 'from-pink-600 to-pink-400', title: 'Practice Tests & Adaptive Quiz', titleEn: 'Practice Tests & Adaptive Quiz', desc: 'Adaptive practice quizzes adjusting in difficulty using IRT algorithm', descEn: 'Adaptive practice quizzes adjusting in difficulty using IRT algorithm', phase: 'Phase 1', module: 'Module 5', layerKey: 'L2', moduleKey: 'practice-tests' },
  { href: '/lxc/study-plan', icon: Star, color: 'from-yellow-600 to-yellow-400', title: 'Flashcard AI', titleEn: 'Flashcard AI', desc: 'Spaced repetition study decks and AI-generated mnemonics for topic memory', descEn: 'Spaced repetition study decks and AI-generated mnemonics for topic memory', phase: 'Phase 1', module: 'Module 6', layerKey: 'L2', moduleKey: 'flashcard-ai' },
  { href: '/lxc/study-plan', icon: Target, color: 'from-cyan-600 to-cyan-400', title: 'Learning Style Detector', titleEn: 'Learning Style Detector', desc: 'Classifies visual/audio/read-write preferences to optimize study plans', descEn: 'Classifies visual/audio/read-write preferences to optimize study plans', phase: 'Phase 1', module: 'Module 7', layerKey: 'L2', moduleKey: 'learning-style' },
  // L3: Performance & Cognitive AI
  { href: '/lxc/digital-twin', icon: Brain, color: 'from-indigo-600 to-indigo-400', title: 'Digital Twin Model', titleEn: 'Digital Twin Model', desc: 'An AI cognitive replica of your comprehension levels, strengths, and gaps', descEn: 'An AI cognitive replica of your comprehension levels, strengths, and gaps', phase: 'Phase 1', module: 'Module 8', layerKey: 'L3', moduleKey: 'digital-twin' },
  { href: '/lxc/performance', icon: BarChart2, color: 'from-green-600 to-green-400', title: 'Performance Dashboard', titleEn: 'Performance Dashboard', desc: 'Subject-wise performance analytics, weak areas, and improvement recommendations', descEn: 'Subject-wise performance analytics, weak areas, and improvement recommendations', phase: 'Phase 1', module: 'Module 9', layerKey: 'L3', moduleKey: 'performance-dash' },
  { href: '/lxc/performance', icon: Target, color: 'from-rose-600 to-rose-400', title: 'Failure Risk Alert AI', titleEn: 'Failure Risk Alert AI', desc: 'Predicts student academic vulnerabilities to trigger timely support systems', descEn: 'Predicts student academic vulnerabilities to trigger timely support systems', phase: 'Phase 1', module: 'Module 10', layerKey: 'L3', moduleKey: 'risk-alert' },
  { href: '/lxc/performance', icon: Zap, color: 'from-orange-600 to-orange-400', title: 'Focus AI Pomodoro', titleEn: 'Focus AI Pomodoro', desc: 'Pomodoro focus tracker paired with dynamic distraction detection alerts', descEn: 'Pomodoro focus tracker paired with dynamic distraction detection alerts', phase: 'Phase 1', module: 'Module 11', layerKey: 'L3', moduleKey: 'focus-pomodoro' },
  // L4: Career & Self-Enhancement AI
  { href: '/lxc/projects', icon: BookOpen, color: 'from-purple-600 to-purple-400', title: 'Project Companion', titleEn: 'Project Companion', desc: 'Generate, manage, and verify real-world, curriculum-aligned academic projects', descEn: 'Generate, manage, and verify real-world, curriculum-aligned academic projects', phase: 'Phase 2', module: 'Module 12', layerKey: 'L4', moduleKey: 'project-companion' },
  { href: '/lxc/life-skills', icon: Compass, color: 'from-fuchsia-600 to-fuchsia-400', title: 'Mentor AI & Life Skills Coach', titleEn: 'Mentor AI & Life Skills Coach', desc: 'Schedule WebRTC video coaching sessions and solve critical conflict scenarios', descEn: 'Schedule WebRTC video coaching sessions and solve critical conflict scenarios', phase: 'Phase 2', module: 'Module 13', layerKey: 'L4', moduleKey: 'mentor-ai' },
  { href: '/lxc/decision', icon: Target, color: 'from-rose-600 to-rose-400', title: 'Decision Simulator', titleEn: 'Decision Simulator', desc: 'Run multi-dimensional life simulations to compare college, stream, and career paths', descEn: 'Run multi-dimensional life simulations to compare college, stream, and career paths', phase: 'Phase 2', module: 'Module 14', layerKey: 'L4', moduleKey: 'decision-sim' },
  { href: '/lxc/wellness', icon: Star, color: 'from-red-600 to-red-400', title: 'Wellness & Emotion AI', titleEn: 'Wellness & Emotion AI', desc: 'Track stress metrics, perform mindfulness check-ins, and build mental resilience', descEn: 'Track stress metrics, perform mindfulness check-ins, and build mental resilience', phase: 'Phase 2', module: 'Module 15', layerKey: 'L4', moduleKey: 'wellness-ai' },
  { href: '/lxc/communication', icon: Mic, color: 'from-violet-600 to-violet-400', title: 'Soft Skills Coach & Avatar', titleEn: 'Soft Skills Coach & Avatar', desc: 'Improve your public speaking, essay writing, interview prep, and debate skills', descEn: 'Improve your public speaking, essay writing, interview prep, and debate skills', phase: 'Phase 2', module: 'Module 16', layerKey: 'L4', moduleKey: 'soft-skills' },
  { href: '/lxc/placement-engine', icon: Target, color: 'from-pink-600 to-pink-400', title: 'RIT AI Placement Engine', titleEn: 'RIT AI Placement Engine', desc: 'Select your target engineering track, level, and access curated SDE masterclass handbooks', descEn: 'Select your target engineering track, level, and access curated SDE masterclass handbooks', phase: 'Phase 2', module: 'Module 25', layerKey: 'L4', moduleKey: 'placement-engine' },
  // L5: Gamification & Skill Economy
  { href: '/lxc/gamification', icon: Gamepad2, color: 'from-orange-600 to-orange-400', title: 'Achievements & XP', titleEn: 'Achievements & XP', desc: 'Earn XP, win dynamic badges, build study streaks, and level up', descEn: 'Earn XP, win dynamic badges, build study streaks, and level up', phase: 'Phase 2', module: 'Module 17', layerKey: 'L5', moduleKey: 'achievements-xp' },
  { href: '/lxc/certificates', icon: Award, color: 'from-amber-600 to-amber-400', title: 'Skill Passport', titleEn: 'Skill Passport', desc: 'Mint verified blockchain Soulbound NFT credentials for your skill portfolio', descEn: 'Mint verified blockchain Soulbound NFT credentials for your skill portfolio', phase: 'Phase 2', module: 'Module 18', layerKey: 'L5', moduleKey: 'skill-passport' },
  { href: '/lxc/peers', icon: Users, color: 'from-cyan-600 to-cyan-400', title: 'Peer Study Arena', titleEn: 'Peer Study Arena', desc: 'Match with active peers, run study battles, and win streaks together', descEn: 'Match with active peers, run study battles, and win streaks together', phase: 'Phase 2', module: 'Module 19', layerKey: 'L5', moduleKey: 'peer-study' },
  // L6: Accessibility & Bharat Mode
  { href: '/lxc/bharat', icon: Zap, color: 'from-yellow-600 to-yellow-400', title: 'Bharat Mode & Voice AI', titleEn: 'Bharat Mode & Voice AI', desc: 'Voice-first, bilingual, offline-ready experience for student empowerment', descEn: 'Voice-first, bilingual, offline-ready experience for student empowerment', phase: 'Phase 1', module: 'Module 20 & 21', layerKey: 'L6', moduleKey: 'bharat-mode' },
  { href: '/lxc/talent', icon: TrendingUp, color: 'from-emerald-600 to-emerald-400', title: 'Talent Discovery', titleEn: 'Talent Discovery', desc: 'Discover and highlight latent technical, creative, and athletic talents', descEn: 'Discover and highlight latent technical, creative, and athletic talents', phase: 'Phase 2', module: 'Module 21', layerKey: 'L4', moduleKey: 'talent-discovery' },
  { href: '/lxc/parent', icon: Users, color: 'from-green-600 to-green-400', title: 'Parent Dashboard', titleEn: 'Parent Dashboard', desc: "For parents — track your child's complete learning progress and review insights", descEn: "For parents — track your child's complete learning progress and review insights", phase: 'Phase 2', module: 'Module 22', layerKey: 'L6', moduleKey: 'parent-dashboard' },
  { href: '/lxc/analytics', icon: BarChart2, color: 'from-emerald-600 to-emerald-400', title: 'Gov & CSR Analytics', titleEn: 'Gov & CSR Analytics', desc: 'India education ecosystem: discover government schemes, CSR programs, and scholarships', descEn: 'India education ecosystem: discover government schemes, CSR programs, and scholarships', phase: 'Phase 2', module: 'Module 22', layerKey: 'L6', moduleKey: 'gov-analytics' },
];

const UserAvatar = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const avatarMap: Record<string, string> = {
    dineshsutihar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=dineshsutihar&skinColor=f8d25c&top=shortHair&hairColor=black&clothing=graphicShirt&clothingColor=red&backgroundColor=3b82f6',
    MohanJP: 'https://api.dicebear.com/9.x/avataaars/svg?seed=MohanJP&skinColor=edb98a&top=turban&clothing=hoodie&clothingColor=black&backgroundColor=fb923c',
    anirban94chakraborty: 'https://api.dicebear.com/9.x/avataaars/svg?seed=anirban&skinColor=f8d25c&top=shortHair&clothing=graphicShirt&clothingColor=red&backgroundColor=3b82f6',
    samarth254: 'https://api.dicebear.com/9.x/avataaars/svg?seed=samarth&skinColor=f8d25c&top=hat&clothing=hoodie&clothingColor=green&backgroundColor=10b981',
    rajneeshrana0: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rajneesh&skinColor=edb98a&top=shortHair&clothing=collarShirt&clothingColor=white&backgroundColor=10b981',
  };

  const src = avatarMap[name];
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} rounded-full object-cover border border-slate-300 dark:border-neutral-700/50 shrink-0`}
      />
    );
  }

  return (
    <div className={`${className} rounded-full bg-slate-200 dark:bg-[#32333b] flex items-center justify-center border border-slate-300 dark:border-neutral-700/50 shrink-0`}>
      <svg className="w-[60%] h-[60%] text-slate-400 dark:text-[#8a8b98]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

const LaurelBranch = ({ className, flip = false }: { className?: string; flip?: boolean }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="currentColor" 
    className={`${className} text-[#b45309]/80`}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
  >
    <path d="M10 90 Q 50 80, 80 20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M25 80 Q 12 65, 28 60 Q 35 75, 25 80 Z" />
    <path d="M40 68 Q 28 53, 43 48 Q 50 63, 40 68 Z" />
    <path d="M55 54 Q 43 39, 58 34 Q 65 49, 55 54 Z" />
    <path d="M70 38 Q 58 23, 73 18 Q 80 33, 70 38 Z" />
    <path d="M82 22 Q 78 8, 88 10 Q 88 20, 82 22 Z" />
    <path d="M35 83 Q 48 73, 40 65 Q 28 75, 35 83 Z" />
    <path d="M50 71 Q 63 61, 55 53 Q 43 63, 50 71 Z" />
    <path d="M65 57 Q 78 47, 70 39 Q 58 49, 65 57 Z" />
  </svg>
);

const PodiumTrophy = ({
  rank,
  name,
  color,
  baseColor,
  stemColor,
  glowColor,
  trophySize = "w-16 h-20",
  avatarSize = "w-7 h-7",
  avatarTop = "top-[25px]"
}: {
  rank: number;
  name: string;
  color: string;
  baseColor: string;
  stemColor: string;
  glowColor: string;
  trophySize?: string;
  avatarSize?: string;
  avatarTop?: string;
}) => {
  return (
    <div className="relative flex flex-col items-center">
      <svg className={`absolute inset-0 w-[140%] h-[140%] -top-[20%] -left-[20%] ${glowColor}`} viewBox="0 0 100 100" fill="currentColor">
        <path d="M15 50 C 15 72, 30 88, 50 88 C 70 88, 85 72, 85 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
      </svg>
      
      <svg className={`${trophySize} drop-shadow-md`} viewBox="0 0 64 72" fill="none">
        <path d="M32 2 L 35 10 L 43 10 L 37 15 L 39 23 L 32 18 L 25 23 L 27 15 L 21 10 L 29 10 Z" fill={color} />
        <path d="M16 16 H48 V32 C48 40.8 40.8 48 32 48 C23.2 48 16 40.8 16 32 Z" fill={color} />
        <path d="M16 20 H10 V28 C10 32.5 13.5 36 18 36" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M48 20 H54 V28 C54 32.5 50.5 36 46 36" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M30 48 H34 V60 H30 Z" fill={stemColor} />
        <path d="M20 60 H44 V65 H20 Z" fill={baseColor} />
      </svg>
      
      <div className={`absolute ${avatarTop} ${avatarSize} rounded-full overflow-hidden border-2 border-slate-50 dark:border-[#121212] bg-[#1a6fd8] flex items-center justify-center`}>
        <UserAvatar name={name} className="w-full h-full" />
      </div>
    </div>
  );
};

export default function LXCHubPage() {
  const storeAvatar = useUserProfileStore((s) => s.avatar);
  const storeNickname = useUserProfileStore((s) => s.nickname);
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string>('All');
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    name: '',
    class: '10',
    board: 'CBSE',
    subjects: [],
    studyHoursPerDay: 3,
    language: 'english',
  });
  const [saving, setSaving] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePreselect, setUpgradePreselect] = useState<PlanKey | undefined>(undefined);
  const { status: authStatus, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // ── Forum plan access ─────────────────────────────────────────────────────
  const {
    planKey,
    isLoading: planLoading,
    hasAccess,
    refresh: refreshPlan,
    educationLevel,
    recommendedPlanKey,
  } = useForumPlan();
  const planMeta = PLAN_META[planKey];

  const openUpgrade = useCallback((preselect?: PlanKey) => {
    setUpgradePreselect(preselect);
    setShowUpgradeModal(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || planLoading) return;

    try {
      const pendingPlan = localStorage.getItem('lxc_pending_upgrade_plan') as PlanKey | null;
      if (pendingPlan && VALID_PLAN_KEYS.includes(pendingPlan) && pendingPlan !== 'free') {
        localStorage.removeItem('lxc_pending_upgrade_plan');
        openUpgrade(pendingPlan);
      }
    } catch {
      // ignore storage errors
    }
  }, [isAuthenticated, planLoading, openUpgrade]);

  // Planner state
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Generate AI Classroom lesson', points: '50 XP', checked: false },
    { id: '2', text: 'Review today Study Roadmap', points: '100 XP', checked: true },
    { id: '3', text: 'Ask doubt in Peer Forum', points: '30 XP', checked: false },
    { id: '4', text: 'Mindfulness check-in with Wellness AI', points: '20 XP', checked: false },
  ]);

  // Planner expansion, tab, and task creation states
  const [isPlannerExpanded, setIsPlannerExpanded] = useState(false);
  const [activePlannerTab, setActivePlannerTab] = useState<'Ongoing' | 'Completed' | 'Missed'>('Ongoing');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // Calendar state and logic
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());
  const [showCalendarInfo, setShowCalendarInfo] = useState(false);

  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth(), 1);
      nextDate.setMonth(nextDate.getMonth() - 1);
      return nextDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => {
      const nextDate = new Date(prev.getFullYear(), prev.getMonth(), 1);
      nextDate.setMonth(nextDate.getMonth() + 1);
      return nextDate;
    });
  };

  const generateCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // First day of current month at 12:00:00 UTC to avoid DST offsets
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    const startDayOfWeek = firstDayOfMonth.getUTCDay();
    const dayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const startDate = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    startDate.setUTCDate(startDate.getUTCDate() - dayOffset);
    
    const days: Date[] = [];
    const tempDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(tempDate));
      tempDate.setUTCDate(tempDate.getUTCDate() + 1);
    }
    return days;
  };

  // Share Calendar Modal configurations
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUsername, setShowUsername] = useState(true);
  const [showRank, setShowRank] = useState(true);
  const [shareMessageText, setShareMessageText] = useState("");

  // Initialize the message when the modal opens or data changes
  useEffect(() => {
    if (data) {
      const currentStreakVal = data.streak.currentStreak;
      setShareMessageText(`🔥 LXC Calendar says it all - ${currentStreakVal} days streak unlocked!`);
    }
  }, [data, showShareModal]);

  const drawShareCalendar = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw dark theme background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0f1d');
    gradient.addColorStop(1, '#070c16');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    const cardPadding = 30;
    const cardWidth = canvas.width - cardPadding * 2;
    const cardHeight = canvas.height - cardPadding * 2;
    ctx.beginPath();
    ctx.roundRect(cardPadding, cardPadding, cardWidth, cardHeight, 24);
    ctx.fill();
    ctx.stroke();

    // 3. Draw Title & Month Navigator details
    const monthText = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(monthText, canvas.width / 2, 85);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('STUDY STREAK HEATMAP', canvas.width / 2, 115);

    // 4. Draw Weekday Headers: MON TUE WED THU FRI SAT SUN
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const startX = cardPadding + 25;
    const calendarWidth = cardWidth - 50;
    const colWidth = calendarWidth / 7;
    const startY = 160;

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#64748b';
    weekdays.forEach((day, index) => {
      const x = startX + index * colWidth + colWidth / 2;
      ctx.fillText(day, x, startY);
    });

    // 5. Draw Calendar Grid Days
    const gridDays = generateCalendarDays();
    const cellPadding = 6;
    const cellWidth = colWidth - cellPadding * 2;
    const cellHeight = cellWidth;
    const gridStartY = 190;
    const rowHeight = cellHeight + cellPadding * 2;

    gridDays.forEach((dayDate, index) => {
      const col = index % 7;
      const row = Math.floor(index / 7);

      const x = startX + col * colWidth + cellPadding;
      const y = gridStartY + row * rowHeight + cellPadding;

      const status = getCalendarStatus(dayDate);
      const isActive = status === 'active';
      const isCurrentMonth = dayDate.getUTCMonth() === currentCalendarDate.getMonth();

      // Check current month to fade out adjacent month cells
      ctx.globalAlpha = isCurrentMonth ? 1.0 : 0.3;

      // Draw cell background
      if (isActive) {
        ctx.fillStyle = 'rgba(92, 194, 26, 0.25)';
        ctx.strokeStyle = 'rgba(92, 194, 26, 0.35)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cellWidth, cellHeight, 10);
      ctx.fill();
      ctx.stroke();

      // Draw date number and Flame
      if (isActive) {
        ctx.fillStyle = '#5cc21a';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(String(dayDate.getUTCDate()), x + cellWidth / 2, y + cellHeight / 2 - 2);
        
        ctx.font = '11px sans-serif';
        ctx.fillText('🔥', x + cellWidth / 2, y + cellHeight / 2 + 13);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(String(dayDate.getUTCDate()), x + cellWidth / 2, y + cellHeight / 2 + 5);
      }
    });

    ctx.globalAlpha = 1.0; // Reset opacity

    // 6. Draw Streak Summary Footer
    const streakY = gridStartY + 6 * rowHeight + 35;
    
    // Draw horizontal separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardPadding + 20, streakY - 20);
    ctx.lineTo(canvas.width - cardPadding - 20, streakY - 20);
    ctx.stroke();

    const currentStreakVal = data ? data.streak.currentStreak : 0;
    const maxStreakVal = data ? data.streak.longestStreak : 0;
    const rankVal = data ? Math.max(1, 2335 - data.totalXP) : 0;

    // Draw Badge Boxes: Current, Max, and Rank (conditional)
    const badgesCount = showRank ? 3 : 2;
    const badgeWidth = 135;
    const badgeHeight = 36;
    const badgeSpacing = 15;
    const totalBadgesWidth = badgesCount * badgeWidth + (badgesCount - 1) * badgeSpacing;
    const startBadgeX = (canvas.width - totalBadgesWidth) / 2;

    const badges = [
      { text: `Current 🔥 ${currentStreakVal}`, color: '#f97316' },
      { text: `Max </> ${maxStreakVal}`, color: '#3b82f6' }
    ];
    if (showRank) {
      badges.push({ text: `Rank 🏆 ${rankVal}`, color: '#fbbf24' });
    }

    badges.forEach((badge, i) => {
      const bx = startBadgeX + i * (badgeWidth + badgeSpacing);
      const by = streakY - 5;
      
      // Draw badge background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Draw badge text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(badge.text, bx + badgeWidth / 2, by + badgeHeight / 2 + 4);
    });

    // 7. Draw Share Message Text
    const msgY = streakY + 65;
    ctx.fillStyle = '#f97316'; // orange/amber brand accent
    ctx.font = 'bold italic 13px sans-serif';
    ctx.fillText(shareMessageText, canvas.width / 2, msgY);

    // 8. Draw branding text at the very bottom
    const brandingY = msgY + 45;
    ctx.fillStyle = '#3b82f6'; // blue logo brand accent
    ctx.font = 'bold 12px sans-serif';
    
    const username = data?.profile?.name || 'student';
    const watermarkText = showUsername ? `learnxchain / ${username}` : 'learnxchain.ai';
    
    ctx.fillText(`⚡ ${watermarkText}`, canvas.width / 2, brandingY);
  };

  useEffect(() => {
    if (showShareModal) {
      const timer = setTimeout(() => {
        const canvas = document.getElementById('streak-share-canvas') as HTMLCanvasElement;
        if (canvas) {
          drawShareCalendar(canvas);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showShareModal, currentCalendarDate, showUsername, showRank, shareMessageText]);

  const handleDownloadShareImage = () => {
    const canvas = document.getElementById('streak-share-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const monthText = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${monthText.toLowerCase().replace(' ', '-')}-streak.png`;
    link.href = dataUrl;
    link.click();
  };

  const updateArrowVisibility = (key: string) => {
    const container = document.getElementById(`slider-${key}`);
    const leftArrow = document.getElementById(`arrow-left-${key}`);
    const rightArrow = document.getElementById(`arrow-right-${key}`);
    
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      if (leftArrow) {
        if (scrollLeft <= 5) {
          leftArrow.classList.add('opacity-0', 'pointer-events-none');
          leftArrow.classList.remove('opacity-100', 'pointer-events-auto');
        } else {
          leftArrow.classList.remove('opacity-0', 'pointer-events-none');
          leftArrow.classList.add('opacity-100', 'pointer-events-auto');
        }
      }
      
      if (rightArrow) {
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          rightArrow.classList.add('opacity-0', 'pointer-events-none');
          rightArrow.classList.remove('opacity-100', 'pointer-events-auto');
        } else {
          rightArrow.classList.remove('opacity-0', 'pointer-events-none');
          rightArrow.classList.add('opacity-100', 'pointer-events-auto');
        }
      }
    }
  };

  const scrollSlider = (key: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`slider-${key}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Minor timeout to trigger visibility checks post-scroll animation frame
      setTimeout(() => updateArrowVisibility(key), 300);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(LAYERS_META).forEach((key) => {
        updateArrowVisibility(key);
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedLayer, data]);

  useEffect(() => {
    const loaded = loadStudentData();
    setData(loaded);
  }, []);

  useEffect(() => {
    // Parse googtrans cookie if exists
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const cookieVal = getCookie('googtrans');
    if (cookieVal) {
      const lang = cookieVal.split('/').pop();
      if (lang) setSelectedLang(lang);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    
    const domain = window.location.hostname.replace('chat.', '');
    const cookieDomain = domain.startsWith('.') ? domain : `.${domain}`;

    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookieDomain};`;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";

    if (langCode !== 'en') {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${cookieDomain};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=localhost;`;
    }

    window.location.reload();
  };

  useEffect(() => {
    if (data) {
      if (isAuthenticated) {
        const currentName = user?.name || 'Student';
        if (!data.profile) {
          // Auto-create profile
          const newProfile: StudentProfile = {
            name: currentName,
            class: '10',
            board: 'CBSE',
            subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
            studyHoursPerDay: 3,
            language: 'english',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          const updated = { ...data, profile: newProfile };
          const withBadge = unlockBadge(updated, PREDEFINED_BADGES[0]);
          saveStudentData(withBadge);
          setData(withBadge);
          setShowSetup(false);
        } else if (data.profile.name !== currentName) {
          // Sync name with logged-in user
          const updatedProfile = { ...data.profile, name: currentName, updatedAt: Date.now() };
          const updated = { ...data, profile: updatedProfile };
          saveStudentData(updated);
          setData(updated);
        } else {
          setShowSetup(false);
        }
      } else {
        setShowSetup(false);
      }
    }
  }, [isAuthenticated, data, user]);

  function toggleSubject(sub: string) {
    setProfile((p) => ({
      ...p,
      subjects: p.subjects?.includes(sub)
        ? p.subjects.filter((s) => s !== sub)
        : [...(p.subjects ?? []), sub],
    }));
  }

  function saveProfile() {
    if (!profile.name || !profile.subjects?.length) return;
    setSaving(true);
    const loaded = loadStudentData();
    const newProfile: StudentProfile = {
      name: profile.name!,
      class: profile.class!,
      board: profile.board!,
      subjects: profile.subjects!,
      studyHoursPerDay: profile.studyHoursPerDay ?? 3,
      language: profile.language!,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...loaded, profile: newProfile };

    // Unlock first badge
    const withBadge = unlockBadge(updated, PREDEFINED_BADGES[0]);
    saveStudentData(withBadge);
    setData(withBadge);
    setShowSetup(false);
    setSaving(false);
  }

  const toggleTask = (id: string) => {
    if (!isAuthenticated) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: String(Date.now()),
        text: newTaskText,
        points: '50 XP',
        checked: false
      }
    ]);
    setNewTaskText('');
    setShowAddTask(false);
  };

  if (!data || isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0c1522] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1a6fd8] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Activity Status helpers
  const getCalendarStatus = (dayDate: Date) => {
    if (!isAuthenticated) return 'missed';
    
    const targetDateString = dayDate.toISOString().split('T')[0];
    
    // Check real study sessions
    const hasRealSession = data?.studySessions?.some((session) => {
      const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
      return sessionDate === targetDateString;
    });
    if (hasRealSession) return 'active';
    
    // Deterministic mock active states for past dates to preserve visual heatmap quality:
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
    const dayDateStart = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 0, 0, 0));
    
    if (dayDateStart < todayStart) {
      const dayVal = dayDate.getUTCDate();
      const monthVal = dayDate.getUTCMonth();
      const yearVal = dayDate.getUTCFullYear();
      
      // Deterministic pseudo-random pattern for past days
      const hash = (dayVal * 17 + monthVal * 31 + yearVal * 7) % 10;
      if (hash < 7) {
        return 'active';
      }
    }
    
    return 'missed';
  };

  const renderMedal = (
    rank: number,
    label: string,
    seedName: string,
    ribbonColor1: string,
    ribbonColor2: string,
    ringColor: string
  ) => {
    const avatarUrl = (rank === 4 && storeAvatar)
      ? storeAvatar
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          seedName
        )}&backgroundColor=1a6fd8&textColor=ffffff`;
    return (
      <div className="flex flex-col items-center gap-0.5 hover:scale-105 transition-all">
        <div className="relative w-11 h-13">
          <svg width="44" height="50" viewBox="0 0 64 72" fill="none" className="drop-shadow-sm mx-auto">
            <defs>
              <clipPath id={`clip-rank-${rank}`}>
                <circle cx="32" cy="30" r="20" />
              </clipPath>
            </defs>
            {/* Ribbons */}
            <path d="M22 36L12 62L28 54L30 36H22Z" fill={ribbonColor1} />
            <path d="M42 36L52 62L36 54L34 36H42Z" fill={ribbonColor2} />
            {/* Medal Outer Ring */}
            <circle cx="32" cy="30" r="24" fill={ringColor} />
            {/* Inner border */}
            <circle cx="32" cy="30" r="22" className="fill-white dark:fill-[#0d1a2d]" />
            <g clipPath={`url(#clip-rank-${rank})`}>
              <image href={avatarUrl} x="12" y="10" width="40" height="40" />
            </g>
          </svg>
        </div>
        <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 mt-1 whitespace-nowrap">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      {/* Share Calendar Image Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/85 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 w-full max-w-md text-white relative shadow-2xl flex flex-col items-center">
            {/* Top Brand Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] rounded-t-2xl" />
            
            {/* Modal Header */}
            <div className="flex justify-between items-center w-full pb-3 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
                  📷 Image
                </span>
                <button
                  onClick={handleDownloadShareImage}
                  className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-amber-500 hover:text-amber-400 transition-all cursor-pointer"
                  title="Download Image"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full w-7 h-7 flex items-center justify-center transition-all cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Canvas Preview Container */}
            <div className="w-full flex justify-center py-2 bg-slate-950/40 rounded-xl border border-white/5 p-3">
              <canvas
                id="streak-share-canvas"
                width={600}
                height={700}
                className="w-full max-w-[280px] rounded-lg border border-white/10 shadow-lg block bg-[#0a0f1d]"
                style={{ aspectRatio: '6/7' }}
              />
            </div>

            {/* Custom Input Message */}
            <div className="w-full space-y-1.5 mt-4 text-left">
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Custom Message</label>
              <input
                type="text"
                value={shareMessageText}
                onChange={(e) => setShareMessageText(e.target.value)}
                maxLength={60}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Switch Config Toggles */}
            <div className="w-full flex justify-between items-center gap-4 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold">Show Username</span>
                <button
                  onClick={() => setShowUsername(!showUsername)}
                  className={`w-8 h-4 rounded-full transition-all relative cursor-pointer ${showUsername ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <span className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${showUsername ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold">Show Rank</span>
                <button
                  onClick={() => setShowRank(!showRank)}
                  className={`w-8 h-4 rounded-full transition-all relative cursor-pointer ${showRank ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <span className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${showRank ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black/85 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-3xl text-slate-800 dark:text-white relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Top Brand Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B]" />
            
            <button 
              onClick={() => setShowLeaderboardModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0057C8] dark:text-neutral-400 dark:hover:text-[#5CDD2B] border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-[#0057C8] rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#0057C8]/10 transition-all z-10 cursor-pointer text-sm font-semibold"
            >
              ✕
            </button>
            
            {/* Podium Area */}
            <div className="flex items-end justify-center gap-4 py-8 mb-6 bg-slate-50/50 dark:bg-[#161616] rounded-2xl border border-slate-200/60 dark:border-neutral-800/50 relative overflow-hidden shrink-0 mt-4">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0057C8]/5 dark:bg-[#0057C8]/10 blur-[60px] -z-10" />

              {/* Rank 2 - Silver (Left) */}
              <div className="flex flex-col items-center flex-1 max-w-32 text-center relative z-10">
                {/* Wreath branch extending to the left */}
                <LaurelBranch className="absolute -left-12 bottom-6 w-16 h-16 opacity-25 dark:opacity-30" flip={true} />
                
                {/* Silver Trophy */}
                <PodiumTrophy 
                  rank={2} 
                  name="harsraj007" 
                  color="#a1a1aa" 
                  stemColor="#71717a" 
                  baseColor="#52525b" 
                  glowColor="text-[#71717a]/20" 
                  trophySize="w-16 h-20"
                  avatarSize="w-7 h-7"
                  avatarTop="top-[24px]"
                />
                
                {/* Silver Topper Shelf with Shadow */}
                <div className="w-[108%] h-[8px] bg-slate-300 dark:bg-[#2d313d] rounded-md z-20 shadow-[0_4px_6px_rgba(0,0,0,0.15)] dark:shadow-[0_5px_8px_rgba(0,0,0,0.8)] mt-2" />
                
                {/* Silver Pedestal Base */}
                <div className="w-full bg-slate-100 dark:bg-[#1f222b] border border-slate-200 dark:border-neutral-800/80 rounded-b-xl p-3 pt-4 -mt-[4px] z-10">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">harsraj007</h4>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1">Max Streak: 382</p>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400">Current Streak: 382</p>
                </div>
              </div>

              {/* Rank 1 - Gold (Center, tallest) */}
              <div className="flex flex-col items-center flex-1 max-w-36 text-center -translate-y-4 z-20 relative">
                {/* Floating Gold Star above trophy */}
                <span className="text-[#fbbf24] text-xl animate-pulse mb-1">★</span>
                
                {/* Laurel branches behind both sides */}
                <LaurelBranch className="absolute -left-10 bottom-6 w-14 h-14 opacity-20 dark:opacity-25" flip={true} />
                <LaurelBranch className="absolute -right-10 bottom-6 w-14 h-14 opacity-20 dark:opacity-25" />
                
                {/* Gold Trophy */}
                <PodiumTrophy 
                  rank={1} 
                  name="dineshsutihar" 
                  color="#fbbf24" 
                  stemColor="#d97706" 
                  baseColor="#92400e" 
                  glowColor="text-[#fbbf24]/20" 
                  trophySize="w-20 h-24"
                  avatarSize="w-9 h-9"
                  avatarTop="top-[28px]"
                />
                
                {/* Gold Topper Shelf with Shadow */}
                <div className="w-[108%] h-[8px] bg-amber-300 dark:bg-[#4e3a2f] rounded-md z-20 shadow-[0_4px_6px_rgba(251,191,36,0.15)] dark:shadow-[0_5px_8px_rgba(0,0,0,0.8)] mt-2" />
                
                {/* Gold Pedestal Base */}
                <div className="w-full bg-amber-50/50 dark:bg-[#2d241e] border border-amber-200 dark:border-amber-950/40 rounded-b-xl p-3 pt-4 -mt-[4px] z-10">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">dineshsutihar</h4>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1">Max Streak: 392</p>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400">Current Streak: 392</p>
                </div>
              </div>

              {/* Rank 3 - Bronze (Right) */}
              <div className="flex flex-col items-center flex-1 max-w-32 text-center relative z-10">
                {/* Wreath branch extending to the right */}
                <LaurelBranch className="absolute -right-12 bottom-6 w-16 h-16 opacity-25 dark:opacity-30" />
                
                {/* Bronze Trophy */}
                <PodiumTrophy 
                  rank={3} 
                  name="MohanJP" 
                  color="#fb923c" 
                  stemColor="#ea580c" 
                  baseColor="#9a3412" 
                  glowColor="text-[#fb923c]/20" 
                  trophySize="w-16 h-20"
                  avatarSize="w-7 h-7"
                  avatarTop="top-[24px]"
                />
                
                {/* Bronze Topper Shelf with Shadow */}
                <div className="w-[108%] h-[8px] bg-orange-200 dark:bg-[#3e2c25] rounded-md z-20 shadow-[0_4px_6px_rgba(251,146,60,0.15)] dark:shadow-[0_5px_8px_rgba(0,0,0,0.8)] mt-2" />
                
                {/* Bronze Pedestal Base */}
                <div className="w-full bg-orange-50/50 dark:bg-[#231b17] border border-orange-100 dark:border-neutral-800/80 rounded-b-xl p-3 pt-4 -mt-[4px] z-10">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">MohanJP</h4>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400 mt-1">Max Streak: 380</p>
                  <p className="text-[9px] text-slate-500 dark:text-neutral-400">Current Streak: 380</p>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_120px_120px_100px] text-left text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest px-4 pb-2 border-b border-slate-200 dark:border-neutral-800 shrink-0 select-none">
              <span>Rank</span>
              <span>Name</span>
              <span className="text-right">Current Streak</span>
              <span className="text-right">Max Streak</span>
              <span className="text-right">DSA Problem</span>
            </div>

            {/* List Items (scrollable container) */}
            <div className="flex-1 overflow-y-auto py-1.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-neutral-800 pr-1">
              {[
                { rank: "#4", name: "anirban94chakraborty", current: 374, max: 374, dsa: 108 },
                { rank: "#5", name: "swarupcs", current: 360, max: 360, dsa: 302 },
                { rank: "#6", name: "varang", current: 352, max: 352, dsa: 353 },
                { rank: "#7", name: "samarth254", current: 345, max: 345, dsa: 426 },
                { rank: "#8", name: "pranav_1397", current: 340, max: 340, dsa: 444 },
                { rank: "#9", name: "samyak_v35", current: 338, max: 338, dsa: 258 },
              ].map((row) => (
                <div key={row.name} className="grid grid-cols-[60px_1fr_120px_120px_100px] items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-900 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800/40 transition-all text-xs font-semibold text-slate-600 dark:text-neutral-300">
                  <span className="text-slate-400 dark:text-neutral-500 font-bold">{row.rank}</span>
                  <span className="flex items-center gap-2 truncate">
                    <UserAvatar name={row.name} className="w-5 h-5" />
                    <span className="truncate text-slate-800 dark:text-white">{row.name}</span>
                  </span>
                  <span className="text-right font-bold text-slate-800 dark:text-white flex items-center justify-end gap-1">
                    <span className="text-[#3b7a12] dark:text-[#5CDD2B]">🔥</span> {row.current}
                  </span>
                  <span className="text-right font-bold text-slate-800 dark:text-white flex items-center justify-end gap-1">
                    <span className="text-[#0057C8] dark:text-[#1A9FFF]">&lt;/&gt;</span> {row.max}
                  </span>
                  <span className="text-right font-bold text-slate-800 dark:text-white pr-2">{row.dsa}</span>
                </div>
              ))}
            </div>

            {/* Logged in User Highlighted Row (Branded with Dark Navy & Deep Blue border) */}
            <div className="mt-2.5 shrink-0 pt-2.5 border-t border-slate-200 dark:border-neutral-800">
              <div className="grid grid-cols-[60px_1fr_120px_120px_100px] items-center px-4 py-3 rounded-xl bg-[#0057C8]/5 dark:bg-gradient-to-r dark:from-[#0D1B2A] dark:to-[#081422] border border-[#0057C8]/30 dark:border-[#0057C8]/50 text-xs font-bold text-slate-800 dark:text-white shadow-md">
                <span className="text-slate-400 dark:text-neutral-400">
                  {isAuthenticated ? `#${Math.max(1, 2335 - data.totalXP)}` : "#16370"}
                </span>
                <span className="flex items-center gap-2 truncate">
                  <UserAvatar name={user?.name || data.profile?.name || "rajneeshrana0"} className="w-5 h-5" />
                  <span className="truncate text-slate-900 dark:text-white font-extrabold">{user?.name || data.profile?.name || "rajneeshrana0"}</span>
                </span>
                <span className="text-right flex items-center justify-end gap-1 text-[#3b7a12] dark:text-[#5CDD2B]">
                  <span>🔥</span> {isAuthenticated ? data.streak.currentStreak : 2}
                </span>
                <span className="text-right flex items-center justify-end gap-1 text-[#0057C8] dark:text-[#1A9FFF]">
                  <span>&lt;/&gt;</span> {isAuthenticated ? data.streak.longestStreak : 12}
                </span>
                <span className="text-right text-slate-900 dark:text-[#55CFFF] pr-2">
                  {isAuthenticated ? data.studySessions?.length || 0 : 59}
                </span>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-2 shrink-0 border-t border-slate-200 dark:border-neutral-900">
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-[#0057C8] dark:hover:text-[#5CDD2B] hover:border-[#0057C8]/50 hover:bg-[#0057C8]/10 transition-all text-xs font-bold shrink-0 cursor-pointer">
                &lt;
              </button>
              <span className="text-xs font-bold text-slate-500 select-none">
                Page 1 of 2068
              </span>
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-[#0057C8] dark:hover:text-[#5CDD2B] hover:border-[#0057C8]/50 hover:bg-[#0057C8]/10 transition-all text-xs font-bold shrink-0 cursor-pointer">
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1a2d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white transition-colors duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Welcome to LearnXChain!</h2>
              <p className="text-slate-500 dark:text-white/50 text-sm mt-1">Powered by Rit AI — Made for Bharat</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Your Name *</label>
                <input
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Class</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                    value={profile.class}
                    onChange={(e) => setProfile((p) => ({ ...p, class: e.target.value }))}
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#0d1a2d]">
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Board</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                    value={profile.board}
                    onChange={(e) => setProfile((p) => ({ ...p, board: e.target.value }))}
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b} className="bg-white dark:bg-[#0d1a2d]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Study Hours/Day</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={profile.studyHoursPerDay}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, studyHoursPerDay: Number(e.target.value) }))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-[#0d1a2d]">
                        {h} hours
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-white/70 block mb-1">Language</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
                    value={profile.language}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        language: e.target.value as StudentProfile['language'],
                      }))
                    }
                  >
                    <option value="english" className="bg-white dark:bg-[#0d1a2d]">
                      English
                    </option>
                    <option value="hindi" className="bg-white dark:bg-[#0d1a2d]">
                      Hindi
                    </option>
                    <option value="hinglish" className="bg-white dark:bg-[#0d1a2d]">
                      Hinglish
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-white/70 block mb-2">
                  Select Subjects * <span className="text-slate-400 dark:text-white/40">(At least 1)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS_CBSE.map((sub) => {
                    const selected = profile.subjects?.includes(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? 'bg-[#1a6fd8] text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={!profile.name || !profile.subjects?.length || saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a6fd8] to-[#3b8eef] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {saving ? 'Saving...' : '🚀 Start LearnXChain'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Main Feed + Right Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
          {/* Main Hub Feed */}
          <main className="flex-1 py-6 px-6 lg:px-8 max-w-6xl overflow-visible lg:overflow-y-auto scrollbar-hide">
            {/* Onboarding Welcome Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-5 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isAuthenticated ? `Hello, ${data.profile?.name || 'Student'}! 👋` : 'Hello, Guest! 👋'}
                </h1>
                <p className="text-slate-500 dark:text-white/40 text-xs mt-1 font-semibold">
                  {isAuthenticated ? (
                    <>
                      Class {data.profile?.class} • {data.profile?.board} •{' '}
                      <span className="text-[#5cc21a] font-extrabold uppercase">Growth OS</span>
                    </>
                  ) : (
                    <>
                      Welcome to LearnXChain •{' '}
                      <span className="text-[#3b8eef] font-extrabold uppercase">Guest Preview</span>
                    </>
                  )}
                </p>
              </div>

              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] text-white text-xs font-black hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Guest Promo Banner if not logged in */}
            {!isAuthenticated && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1a6fd8]/20 bg-white dark:bg-[#090f1d]/60 backdrop-blur-md p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md dark:shadow-xl">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#1a6fd8]/10 blur-[60px] -z-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#5cc21a]/10 blur-[60px] -z-10" />
                
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a6fd8]/20 border border-[#1a6fd8]/30 text-[10px] font-black text-[#3b8eef] uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#5cc21a] animate-pulse" />
                    <span>Premium OS Active</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Unlock All 22 Modules with LXC Plus</h2>
                  <p className="text-xs text-slate-600 dark:text-white/50 leading-relaxed max-w-xl">
                    Get access to specialized AI Classrooms, curriculum Study Roadmaps, practice tests, public speaking coaching, and the cognitive Digital Twin.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Link
                    href="/login"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1a6fd8] hover:bg-[#3b8eef] text-white font-bold text-xs text-center shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Start Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs text-center transition-all"
                  >
                    Pricing
                  </Link>
                </div>
              </div>
            )}

            {/* Featured Section */}
            <h2 className="text-xs font-black text-slate-500 dark:text-white/40 uppercase tracking-widest mb-3.5">
              Featured Modules
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {featuredModules.map((item) => {
                const Icon = item.icon;
                const canAccess = !isAuthenticated ? false : hasAccess(item.moduleKey || 'apex');
                const isLocked = isAuthenticated && !canAccess;

                return (
                  <div key={item.title} className="relative group overflow-hidden rounded-2xl">
                    <div
                      onClick={() => {
                        if (!isAuthenticated) { window.location.href = '/login'; return; }
                        if (isLocked) { openUpgrade(); return; }
                        window.location.href = item.href;
                      }}
                      className={`block bg-white dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl p-4.5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center h-full cursor-pointer shadow-xs dark:shadow-none ${
                        isLocked ? 'hover:border-[#1A9FFF]/30' : ''
                      }`}
                    >
                      <div className={(!isAuthenticated || isLocked) ? 'blur-[3.5px] select-none pointer-events-none' : ''}>
                        {/* Centered Box with Icon */}
                        <div className={`w-full aspect-video rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform`}>
                          <Icon className={`w-8 h-8 ${item.iconColor}`} />
                        </div>
                        {/* Title */}
                        <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight mb-1">{item.title}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 leading-normal line-clamp-2">{item.desc}</p>
                      </div>

                      {!isAuthenticated && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-[#070c16]/75 backdrop-blur-[2.5px] p-3 text-center transition-all duration-300 group-hover:bg-slate-100/80 dark:group-hover:bg-[#070c16]/65 rounded-2xl">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center mb-1 shadow-md shadow-blue-500/20">
                            <Lock className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white/90">Unlock Plus</span>
                        </div>
                      )}

                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/85 dark:bg-[#070c16]/70 backdrop-blur-[2.5px] p-3 text-center transition-all duration-300 group-hover:bg-slate-100/75 dark:group-hover:bg-[#070c16]/60 rounded-2xl">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A9FFF] to-[#5CDD2B] flex items-center justify-center mb-1 shadow-md shadow-blue-500/20">
                            <Lock className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h4 className="text-[10px] font-black text-slate-800 dark:text-white mb-0.5">Premium</h4>
                          <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold">Tap to upgrade</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Plan Banner — shows for free users (authenticated) */}
            {isAuthenticated && planKey === 'free' && !planLoading && (
              <div className="relative overflow-hidden rounded-2xl border border-[#1A9FFF]/20 bg-[#1A9FFF]/5 p-4 mb-6 flex items-center justify-between gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A9FFF]/5 to-[#5CDD2B]/5 pointer-events-none" />
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mb-0.5">🔓 You're on the Free Plan</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">Only Doubt Forum is unlocked. Upgrade to access all 24 AI modules.</div>
                </div>
                <button
                  onClick={() => openUpgrade(recommendedPlanKey)}
                  className="shrink-0 px-3 py-1.5 bg-[#1A9FFF] hover:bg-[#3b8eef] text-black text-[10px] font-black rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Upgrade Plan ⚡
                </button>
              </div>
            )}

            {/* Plan Banner — shows active plan badge for paid users */}
            {isAuthenticated && planKey !== 'free' && !planLoading && (
              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl border w-fit"
                style={{ borderColor: `${planMeta.color}30`, background: `${planMeta.color}08` }}>
                <span className="text-sm">{planMeta.emoji}</span>
                <span className="text-[10px] font-black" style={{ color: planMeta.color }}>{planMeta.label}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">active</span>
              </div>
            )}

            {/* Layer Filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
              {[
                { id: 'All', label: 'All Modules' },
                { id: 'L1', label: '📖 Academic' },
                { id: 'L2', label: '🎯 Personalized' },
                { id: 'L3', label: '🧠 Cognitive & Stats' },
                { id: 'L4', label: '🧭 Career & Growth' },
                { id: 'L5', label: '🏆 Gamification' },
                { id: 'L6', label: '🇮🇳 Bharat & Parents' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLayer(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    selectedLayer === tab.id
                      ? 'bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] text-white border-transparent shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Categorized Feed */}
            <div className="space-y-8">
              {Object.entries(LAYERS_META)
                .filter(([key]) => selectedLayer === 'All' || selectedLayer === key)
                .map(([key, meta]) => {
                  const layerModules = modules.filter((m) => m.layerKey === key);
                  if (layerModules.length === 0) return null;

                  return (
                    <div key={key} className="space-y-3.5">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                        <span className="text-sm">{meta.icon}</span>
                        <h3 className="text-xs font-black tracking-wider text-slate-500 dark:text-white/40 uppercase">{meta.title}</h3>
                      </div>

                      {/* Slider Wrapper */}
                      <div className="relative group/slider">
                        {/* Left Arrow */}
                        <button
                          id={`arrow-left-${key}`}
                          onClick={() => scrollSlider(key, 'left')}
                          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#0d1a2d]/90 hover:bg-slate-50 dark:hover:bg-[#0d1a2d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-all duration-300 shadow-lg shadow-black/10 dark:shadow-black/50 cursor-pointer opacity-0 pointer-events-none"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>

                        {/* Right Arrow */}
                        <button
                          id={`arrow-right-${key}`}
                          onClick={() => scrollSlider(key, 'right')}
                          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#0d1a2d]/90 hover:bg-slate-50 dark:hover:bg-[#0d1a2d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-all duration-300 shadow-lg shadow-black/10 dark:shadow-black/50 cursor-pointer opacity-0 pointer-events-none"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Modules Slider */}
                        <div
                          id={`slider-${key}`}
                          onScroll={() => updateArrowVisibility(key)}
                          className="flex gap-4 overflow-x-auto pb-3.5 scrollbar-hide snap-x snap-mandatory"
                        >
                        {layerModules.map((mod) => {
                          const canAccess = !isAuthenticated ? false : hasAccess((mod as any).moduleKey || 'apex');
                          const isLocked = isAuthenticated && !canAccess;
                          const buttonText = !isAuthenticated
                            ? 'Sign In'
                            : !canAccess
                            ? 'Upgrade to Unlock'
                            : (mod.titleEn === 'AI Classroom' || mod.titleEn === 'Study Roadmap' ? 'Resume' : 'Start Learning');

                          return (
                            <div key={mod.href + mod.title} className="relative group overflow-hidden rounded-2xl w-[280px] sm:w-[320px] shrink-0 snap-start">
                              <div
                                onClick={() => {
                                  if (!isAuthenticated) { window.location.href = '/login'; return; }
                                  if (isLocked) { openUpgrade(); return; }
                                  window.location.href = mod.href;
                                }}
                                className={`flex flex-col justify-between h-full bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-5 transition-all text-left shadow-xs dark:shadow-none ${
                                  isLocked
                                    ? 'cursor-pointer hover:border-[#1A9FFF]/30'
                                    : 'cursor-pointer hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/4'
                                }`}
                              >
                                <div className={isLocked ? 'blur-[2px] select-none pointer-events-none' : ''}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${mod.color} flex items-center justify-center`}>
                                      <mod.icon className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="flex gap-1.5">
                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 font-black">
                                        {mod.module}
                                      </span>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                        mod.phase === 'Phase 1'
                                          ? 'bg-emerald-50 dark:bg-green-950/40 text-emerald-600 dark:text-green-400 border border-emerald-200 dark:border-green-500/20'
                                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                      }`}>
                                        {mod.phase}
                                      </span>
                                    </div>
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1.5">{mod.titleEn}</h4>
                                  <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed mb-4">{mod.descEn || mod.desc}</p>
                                </div>

                                {/* Pill Button at the Bottom */}
                                <div className="mt-auto pt-2">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wide border transition-all ${
                                    isLocked
                                      ? 'bg-[#1A9FFF]/10 border-[#1A9FFF]/30 text-[#1A9FFF]'
                                      : !isAuthenticated
                                      ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40'
                                      : buttonText === 'Resume'
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20'
                                      : 'bg-[#1a6fd8]/10 border-[#1a6fd8]/30 text-[#3b8eef] group-hover:bg-[#1a6fd8]/20'
                                  }`}>
                                    {isLocked && <Lock className="w-3 h-3 mr-0.5" />}
                                    {buttonText}
                                    {!isLocked && <ChevronRight className="w-3.5 h-3.5 ml-0.5" />}
                                  </span>
                                </div>

                                {/* Lock overlay for authenticated-but-no-plan */}
                                {isLocked && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/85 dark:bg-[#070c16]/70 backdrop-blur-[3px] transition-all duration-300 group-hover:bg-slate-100/75 dark:group-hover:bg-[#070c16]/60 p-4 text-center rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A9FFF] to-[#5CDD2B] flex items-center justify-center mb-2 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                                      <Lock className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 dark:text-white mb-0.5">Premium Module</h4>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400">Tap to upgrade your plan</span>
                                  </div>
                                )}

                                {/* Guest lock overlay */}
                                {!isAuthenticated && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/95 dark:bg-[#070c16]/75 backdrop-blur-[2.5px] transition-all duration-300 group-hover:bg-slate-100/85 dark:group-hover:bg-[#070c16]/65 p-4 text-center rounded-2xl">
                                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#1a6fd8] to-[#5cc21a] flex items-center justify-center mb-1.5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                      <Lock className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Sign In First</h4>
                                    <span className="text-[10px] text-slate-500 dark:text-white/50">Free account unlocks Doubt Forum</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
          </main>

          {/* Right Sidebar Stats & Streaks */}
          <aside className="relative w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#090f1d]/40 flex flex-col lg:h-full shrink-0 overflow-hidden">
            {/* Scrollable Content (when planner is collapsed) */}
            <div className="flex-1 overflow-y-auto py-5 px-4.5 flex flex-col gap-5 scrollbar-hide">

              {/* Progress Circular Widget */}
              <div className="bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-xs dark:shadow-none">
                <h3 className="text-xs font-black text-slate-500 dark:text-white/40 uppercase tracking-wider mb-3">Academic Progress</h3>
                
                <div className={!isAuthenticated ? 'blur-[3px] select-none pointer-events-none relative' : 'relative'}>
                  <div className="flex items-center justify-center my-3 relative">
                    <svg className="w-22 h-22 transform -rotate-90">
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        className="stroke-slate-200 dark:stroke-white/5 fill-transparent"
                        strokeWidth="6.5"
                      />
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        className="stroke-[#1a6fd8] fill-transparent transition-all duration-500"
                        strokeWidth="6.5"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - (isAuthenticated ? 0.78 : 0.05))}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                        {isAuthenticated ? '78%' : '5%'}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mt-1">XP Target</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 text-xs font-semibold">
                    <div className="flex justify-between text-slate-600 dark:text-white/60">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sessions Completed</span>
                      <span className="text-slate-800 dark:text-white font-bold">{isAuthenticated ? data.studySessions?.length || 0 : 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-white/60">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Badges Earned</span>
                      <span className="text-slate-800 dark:text-white font-bold">{isAuthenticated ? data.badges?.length || 0 : 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-white/60">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Experience Points</span>
                      <span className="text-slate-800 dark:text-white font-bold">{isAuthenticated ? `${data.totalXP} XP` : '0 XP'}</span>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="flex flex-col items-center justify-center text-center py-6 mt-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-white/40 mb-1" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/60">Locked Progress Tracker</span>
                  </div>
                )}
              </div>

              {/* Streak Heatmap Calendar */}
              <div className="bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-xs dark:shadow-none">
                {/* Sleek Month Navigator Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-white/5">
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowCalendarInfo(true)}
                      onMouseLeave={() => setShowCalendarInfo(false)}
                      onClick={() => setShowCalendarInfo(prev => !prev)}
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-black cursor-pointer"
                    >
                      i
                    </button>
                    {showCalendarInfo && (
                      <div className="absolute top-9 left-0 w-64 p-4 bg-white/95 dark:bg-[#0d1527]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 text-[10px] text-slate-600 dark:text-white/70 pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                        {/* Top Gradient bar for premium design */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-amber-500 to-green-500 rounded-t-xl" />
                        
                        <div className="font-black text-[11px] text-slate-800 dark:text-white mb-1.5 flex items-center gap-1.5">
                          <span>Streak Maintenance Rules</span>
                          <span>🔥</span>
                        </div>
                        <p className="leading-relaxed mb-2 text-slate-500 dark:text-white/60 font-semibold">
                          To maintain your study streak, you must log at least one learning session every consecutive day.
                        </p>
                        <div className="space-y-1.5 font-semibold text-left">
                          <div className="flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5 shrink-0">✔</span>
                            <span><strong>Conscious Effort</strong>: Logging a study session increments your active day count.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                            <span><strong>24-Hour Window</strong>: If you do not study within a calendar day, your current streak resets to 0.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#5cc21a] mt-0.5 shrink-0">●</span>
                            <span><strong>Heatmap Tracking</strong>: Active days are highlighted green with a flame emoji.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevMonth}
                      className="text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition-all text-xs font-black cursor-pointer"
                    >
                      &lt;
                    </button>
                    <span className="text-xs font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-lg">
                      {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white transition-all text-xs font-black cursor-pointer"
                    >
                      &gt;
                    </button>
                  </div>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    title="Share Streak Calendar"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-white/40" />
                  </button>
                </div>

                <div className={!isAuthenticated ? 'blur-[3.5px] select-none pointer-events-none' : ''}>
                  {/* Mon-Sun header */}
                  <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <span key={i} className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase">{d}</span>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {generateCalendarDays().map((dayDate, i) => {
                      const status = getCalendarStatus(dayDate);
                      const isActive = status === 'active';
                      const isCurrentMonth = dayDate.getUTCMonth() === currentCalendarDate.getMonth();
                      const dateTitle = dayDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
                      
                      return (
                        <div
                          key={i}
                          className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                            isActive
                              ? 'bg-[#5cc21a]/25 text-[#5cc21a] border border-[#5cc21a]/30 shadow-md shadow-green-500/5'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/20 border border-slate-100 dark:border-white/5'
                          } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                          title={dateTitle}
                        >
                          {isActive ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[9px] font-black leading-tight">{dayDate.getUTCDate()}</span>
                              <span className="text-[8px] leading-none">🔥</span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black">{dayDate.getUTCDate()}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Current / Max Streak and Leaderboard Row */}
                  <div className="flex justify-between items-center gap-1.5 mt-4 pt-3.5 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[9px] font-black text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0">
                      <span>Current 🔥 {isAuthenticated ? data.streak.currentStreak : 0}</span>
                      <span className="text-slate-300 dark:text-white/10">|</span>
                      <span>Max &lt;/&gt; {isAuthenticated ? data.streak.longestStreak : 0}</span>
                    </div>

                    <button
                      onClick={() => setShowLeaderboardModal(true)}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[9px] font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>Leaderboard</span>
                    </button>
                  </div>

                  {/* Medals Row */}
                  <div className="flex items-center justify-between mt-4 px-1 pt-1">
                    {renderMedal(1, "Rank 1", "Rohan", "#fbbf24", "#d97706", "#fbbf24")}
                    {renderMedal(2, "Rank 2", "Simran", "#cbd5e1", "#64748b", "#cbd5e1")}
                    {renderMedal(3, "Rank 3", "Amit", "#fb923c", "#c2410c", "#f97316")}
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1" />

                    {renderMedal(
                      4,
                      isAuthenticated ? `Rank ${Math.max(1, 2335 - data.totalXP)}` : "Rank Guest",
                      data.profile?.name || "Student",
                      "#854d0e",
                      "#451a03",
                      "#713f12"
                    )}
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="flex flex-col items-center justify-center text-center py-6 mt-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-white/40 mb-1" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/60">Locked Heatmap</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Planner collapsed trigger - Pinned to the Bottom */}
            {!isPlannerExpanded && (
              <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#090f1d]/30 backdrop-blur-xs shrink-0 select-none">
                <div 
                  onClick={() => setIsPlannerExpanded(true)}
                  className="bg-white dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/4 transition-all shadow-xs"
                >
                  <div className="w-7 h-7" />
                  
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                    <span className="text-xs font-black text-slate-800 dark:text-white">Daily Planner</span>
                    <span className="bg-[#3e2e28] text-[#f27e52] rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] font-black">
                      {isAuthenticated ? tasks.filter(t => !t.checked).length : 0}
                    </span>
                  </div>
                  
                  <button 
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer bg-slate-50 dark:bg-white/5"
                    title="Expand Planner"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Slide-Up Expanded Daily Planner Overlay */}
            <div className={`absolute inset-0 bg-slate-50 dark:bg-[#070c16] p-4 lg:p-6 z-30 transition-all duration-300 transform flex flex-col ${
              isPlannerExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            }`}>
              <div className="flex-1 bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-3xl p-5 shadow-lg flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white text-xs font-black select-none">
                    Daily Planner
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowAddTask(prev => !prev)}
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer bg-slate-50 dark:bg-white/5"
                      title="Add Task"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsPlannerExpanded(false);
                        setShowAddTask(false);
                      }}
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer bg-slate-50 dark:bg-white/5"
                      title="Collapse Planner"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" y1="10" x2="21" y2="3" />
                        <line x1="10" y1="14" x2="3" y2="21" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Inline Add Task Input */}
                {showAddTask && (
                  <div className="flex gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 mb-3 transition-all">
                    <input
                      type="text"
                      placeholder="Add task..."
                      className="flex-1 bg-transparent text-xs outline-none text-slate-800 dark:text-white placeholder-slate-400"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTask();
                        }
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={handleAddTask} 
                      className="text-[#0057C8] dark:text-[#5CDD2B] text-xs font-black px-1.5 hover:scale-105 transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Tab Bar / Segmented Controls */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl mb-4 border border-slate-200/50 dark:border-white/5">
                  {[
                    { id: 'Ongoing', label: 'Ongoing', count: tasks.filter(t => !t.checked).length },
                    { id: 'Completed', label: 'Completed', count: tasks.filter(t => t.checked).length },
                    { id: 'Missed', label: 'Missed', count: 0 }
                  ].map((tab) => {
                    const isActive = activePlannerTab === tab.id;
                    let activeStyle = "";
                    if (isActive) {
                      if (tab.id === 'Ongoing') activeStyle = "bg-[#0057C8] text-white shadow-md shadow-blue-900/30";
                      else if (tab.id === 'Completed') activeStyle = "bg-[#5CDD2B] text-[#0D1B2A] font-bold shadow-md shadow-green-950/20";
                      else activeStyle = "bg-[#331c1d] border border-rose-500/30 text-rose-400 font-bold";
                    } else {
                      activeStyle = "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5";
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActivePlannerTab(tab.id as any)}
                        className={`py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer border border-transparent ${activeStyle}`}
                      >
                        <span>{tab.label} ({tab.count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Content Area */}
                <div className={!isAuthenticated ? 'blur-[3px] select-none pointer-events-none flex-1 overflow-y-auto' : 'flex-1 overflow-y-auto'}>
                  {activePlannerTab === 'Missed' || (activePlannerTab === 'Ongoing' && tasks.filter(t => !t.checked).length === 0) || (activePlannerTab === 'Completed' && tasks.filter(t => t.checked).length === 0) ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center text-center py-12 flex-1 h-full select-none">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center mb-4 shadow-sm">
                        <svg className="w-7 h-7 text-[#f27e52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="m9 14 2 2 4-4" />
                          <line x1="8" y1="10" x2="16" y2="10" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">Plan your daily tasks here</h4>
                      <p className="text-xs text-slate-500 dark:text-white/40 max-w-55 leading-relaxed">Track, manage, and complete accordingly</p>
                    </div>
                  ) : (
                    /* Tasks list */
                    <div className="space-y-2 pr-1">
                      {tasks
                        .filter(t => activePlannerTab === 'Ongoing' ? !t.checked : t.checked)
                        .map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/1 hover:bg-slate-100 dark:hover:bg-white/3 transition-all border border-slate-200 dark:border-white/5 text-left group shadow-xs dark:shadow-none"
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              task.checked
                                ? 'bg-[#5CDD2B] border-[#5CDD2B] text-[#0D1B2A]'
                                : 'border-slate-300 dark:border-white/20 group-hover:border-[#0057C8] dark:group-hover:border-[#1A9FFF]'
                            }`}>
                              {task.checked && <CheckCircle2 className="w-3.5 h-3.5 stroke-3 text-[#0D1B2A]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold leading-snug transition-all ${
                                task.checked ? 'text-slate-400 dark:text-white/30 line-through' : 'text-slate-800 dark:text-white/80'
                              }`}>{task.text}</p>
                              <span className="text-[9px] text-[#0057C8] dark:text-[#1A9FFF] font-bold mt-0.5 block">{task.points}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="flex flex-col items-center justify-center text-center py-6 mt-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-white/40 mb-1" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-white/60">Locked Planner</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

      {/* ── Upgrade Modal ── */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(newPlan) => { refreshPlan(); }}
        currentPlan={planKey}
        educationGoal={educationLevel ?? undefined}
        preselect={upgradePreselect}
      />
    </div>
  );
}
