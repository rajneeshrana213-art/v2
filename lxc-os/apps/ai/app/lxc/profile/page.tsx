'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  BookOpen,
  Save,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Home,
  Plus,
  Bug,
  LogIn,
  Settings,
  CheckSquare,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  GraduationCap,
  Trophy,
  Brain,
  MessageSquare,
  Check,
  ShieldAlert,
  Flame,
  Award,
  Shield,
  Key,
  History,
  CreditCard,
  Link as LinkIcon,
  Users,
  Share2,
  Volume2,
  Type,
  Eye,
  Star,
  Heart,
  Activity,
  Copy,
  Laptop
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/hooks/use-theme';
import { useUserProfileStore, AVATAR_OPTIONS } from '@/lib/store/user-profile';
import {
  loadStudentData,
  saveStudentData,
  xpToNextLevel,
  PREDEFINED_BADGES,
  getWeakSubjects,
  getStrongSubjects,
  getAverageScore,
  type LXCStudentData,
  type StudentProfile
} from '@/lib/lxc/student-store';
import { useForumPlan } from '@/lib/hooks/use-forum-plan';
import { PLAN_META, type PlanKey } from '@/lib/lxc/module-access';
import { UpgradeModal } from '@/components/lxc/UpgradeModal';
import { lxcWebUrl } from '@/lib/lxc-api-base';

const LANGUAGES_DASHBOARD = [
  { code: 'en', label: 'English - EN' },
  { code: 'hi', label: 'Hindi - हिंदी' },
  { code: 'pa', label: 'Punjabi - ਪੰਜਾਬी' },
  { code: 'gu', label: 'Gujarati - ગુજરાતી' },
  { code: 'mr', label: 'Marathi - मराठी' },
  { code: 'bn', label: 'Bengali - বাংলা' },
  { code: 'ta', label: 'Tamil - தமிழ்' },
  { code: 'te', label: 'Telugu - తెలుగు' },
  { code: 'kn', label: 'Kannada - ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam - മലയാളം' },
  { code: 'ur', label: 'Urdu - उर्दू' },
];

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

const LOGIN_HISTORY_MOCK = [
  { id: '1', date: '2026-06-10 09:45 AM', device: 'Chrome 125.0 / Windows 11', ip: '192.168.1.45', location: 'Mumbai, India', status: 'Active' },
  { id: '2', date: '2026-06-09 04:30 PM', device: 'Chrome 125.0 / Windows 11', ip: '192.168.1.45', location: 'Mumbai, India', status: 'Logged Out' },
  { id: '3', date: '2026-06-05 11:20 AM', device: 'Safari 17.2 / iOS 17', ip: '103.241.12.18', location: 'Pune, India', status: 'Expired' },
  { id: '4', date: '2026-05-28 08:15 AM', device: 'Firefox 120.0 / macOS Sonoma', ip: '203.111.45.22', location: 'Delhi, India', status: 'Expired' }
];

const REFERRAL_LIST_MOCK = [
  { name: 'Rohit Sharma', level: 4, date: 'June 08, 2026', status: 'Signed Up', reward: '300 XP' },
  { name: 'Priya Patel', level: 2, date: 'June 04, 2026', status: 'Signed Up', reward: '300 XP' },
  { name: 'Aniket Singh', level: 6, date: 'May 30, 2026', status: 'Subscribed to Ignite', reward: '₹150 + 500 XP' },
  { name: 'Tanmay Bhatt', level: 1, date: 'May 25, 2026', status: 'Pending Verification', reward: '300 XP (Pending)' },
];

const WEEKLY_QUESTS_MOCK = [
  { id: '1', title: 'Daily Focus Sprint', progress: '30m / 30m', xp: 50, status: 'Completed', detail: 'Study for 30 minutes in a single day.' },
  { id: '2', title: 'Quiz Challenger', progress: '0 / 1', xp: 100, status: 'Active', detail: 'Score 80%+ on any quiz.' },
  { id: '3', title: 'Socratic Explorer', progress: '3 / 5', xp: 60, status: 'Active', detail: 'Ask 5 questions to the Socratic Coach.' },
  { id: '4', title: 'Streak Keeper', progress: '1 / 1', xp: 40, status: 'Completed', detail: 'Log in and answer at least one prompt.' }
];

const ACCESSORIES = [
  { id: 'none', name: 'No Ornament', icon: '❌', level: 1 },
  { id: 'halo', name: 'Silver Halo', icon: '😇', level: 2 },
  { id: 'visor', name: 'Cyber Visor', icon: '🕶️', level: 5 },
  { id: 'crown', name: 'Golden Crown', icon: '👑', level: 8 }
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, status: authStatus, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // State Tabs
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'ai' | 'account' | 'security' | 'growth' | 'accessibility' | 'labs' | 'review'>('identity');

  // Zustand Store (Identity Tab)
  const storeAvatar = useUserProfileStore((s) => s.avatar);
  const storeNickname = useUserProfileStore((s) => s.nickname);
  const storeBio = useUserProfileStore((s) => s.bio);
  const setStoreAvatar = useUserProfileStore((s) => s.setAvatar);
  const setStoreNickname = useUserProfileStore((s) => s.setNickname);
  const setStoreBio = useUserProfileStore((s) => s.setBio);

  // Local Form State - Identity & Academic
  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [fullName, setFullName] = useState('');
  const [gradeClass, setGradeClass] = useState('10');
  const [board, setBoard] = useState('CBSE');
  const [studyHours, setStudyHours] = useState(3);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [subjects, setSubjects] = useState<string[]>([]);

  // Local Form State - AI Preferences (Extras)
  const [tutorStyle, setTutorStyle] = useState<'socratic' | 'direct' | 'expert'>('socratic');
  const [storeGaps, setStoreGaps] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [bharatMode, setBharatMode] = useState(true);
  const [showcaseBadge, setShowcaseBadge] = useState('first-lesson');

  // Expanded local accessibility & preference settings
  const [activeAccessory, setActiveAccessory] = useState<'none' | 'halo' | 'visor' | 'crown'>('none');
  const [fontFamily, setFontFamily] = useState<'outfit' | 'dyslexic' | 'mono' | 'sans'>('outfit');
  const [fontSizeScale, setFontSizeScale] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [glassOpacity, setGlassOpacity] = useState(60); // index 20 - 90
  const [voiceSpeechRate, setVoiceSpeechRate] = useState(1.0);

  // Expanded Account & Billing states — plan data comes from DB via useForumPlan
  const {
    planKey: activePlan,
    endDate: planEndDate,
    billingCycle: planBillingCycle,
    planName: activePlanName,
    billingHistory,
    isLoading: planLoading,
    isAutoRenew,
    refresh: refreshPlan,
  } = useForumPlan();
  const activePlanMeta = PLAN_META[activePlan];
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [referralCode, setReferralCode] = useState('SCHOLAR123');
  const [copiedLink, setCopiedLink] = useState(false);

  // Education Goal (from DB via ForumUserProfile)
  const [educationGoal, setEducationGoal] = useState<'school' | 'college' | 'competitive'>('school');
  const [isGoalUpdating, setIsGoalUpdating] = useState(false);
  const [goalUpdateMsg, setGoalUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Database Plans
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans');
        const data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
      }
    }
    fetchPlans();
  }, []);

  const getDynamicPriceText = (planKey: string) => {
    if (plans.length === 0) {
      return 'Loading...';
    }
    const goalUpper = educationGoal.toUpperCase();
    let dbName = '';
    if (planKey === 'ignite') {
      dbName = `RIT_AI_${goalUpper}_IGNITE`;
    } else if (planKey === 'zenith') {
      dbName = `RIT_AI_${goalUpper}_ZENITH_PRO`;
    } else if (planKey === 'apex') {
      dbName = `RIT_AI_${goalUpper}_ZENITH_ELITE`;
    } else if (planKey === 'lifetime') {
      dbName = `RIT_AI_${goalUpper}_LIFETIME`;
    }

    const p = plans.find(pl => pl.name === dbName);
    const price = p ? p.price : 0;
    return `₹${price}`;
  };

  // Expanded Security states
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Expanded Lab/Beta Features states
  const [aiVoiceMode, setAiVoiceMode] = useState(false);
  const [vrLabs, setVrLabs] = useState(false);
  const [speedReader, setSpeedReader] = useState(false);
  const [peerStudy, setPeerStudy] = useState(false);
  const [focusSounds, setFocusSounds] = useState(false);

  // Expanded Reviews states
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Page level controls
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [data, setData] = useState<LXCStudentData | null>(null);

  // Audio Synthesizer chimes via Web Audio API
  const playSound = (type: 'click' | 'success' | 'toggle') => {
    if (typeof window === 'undefined' || !soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'toggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(550, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      // AudioContext blocked
    }
  };

  // Synchronize local states on mount / database load
  useEffect(() => {
    if (isAuthenticated) {
      setAvatar(storeAvatar || AVATAR_OPTIONS[0]);
      setNickname(storeNickname || user?.name || '');
      setBio(storeBio || '');
    }
  }, [isAuthenticated, storeAvatar, storeNickname, storeBio, user]);

  // Fetch educationLevel from forum profile API (persisted in DB)
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('@lxc_ai_token');
    if (!token) return;
    fetch(lxcWebUrl('/api/v1/forum/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.forumUserProfile?.educationLevel) {
          const lvl = data.forumUserProfile.educationLevel as 'school' | 'college' | 'competitive';
          if (['school', 'college', 'competitive'].includes(lvl)) {
            setEducationGoal(lvl);
          }
        }
      })
      .catch(() => {/* ignore */});
  }, [isAuthenticated]);

  useEffect(() => {
    const loaded = loadStudentData();
    setData(loaded);
    if (loaded && loaded.profile) {
      setFullName(loaded.profile.name || '');
      setGradeClass(loaded.profile.class || '10');
      setBoard(loaded.profile.board || 'CBSE');
      setStudyHours(loaded.profile.studyHoursPerDay || 3);
      setLanguage(loaded.profile.language || 'english');
      setSubjects(loaded.profile.subjects || []);
    }

    // Load extra settings from localStorage
    try {
      const extraRaw = localStorage.getItem('lxc-profile-extra');
      if (extraRaw) {
        const extra = JSON.parse(extraRaw);
        if (extra.tutorStyle) setTutorStyle(extra.tutorStyle);
        if (extra.storeGaps !== undefined) setStoreGaps(extra.storeGaps);
        if (extra.audioFeedback !== undefined) setAudioFeedback(extra.audioFeedback);
        if (extra.bharatMode !== undefined) setBharatMode(extra.bharatMode);
        if (extra.showcaseBadge) setShowcaseBadge(extra.showcaseBadge);

        // Accessibilities
        if (extra.activeAccessory) setActiveAccessory(extra.activeAccessory);
        if (extra.fontFamily) setFontFamily(extra.fontFamily);
        if (extra.fontSizeScale !== undefined) setFontSizeScale(extra.fontSizeScale);
        if (extra.soundEnabled !== undefined) setSoundEnabled(extra.soundEnabled);
        if (extra.glassOpacity !== undefined) setGlassOpacity(extra.glassOpacity);
        if (extra.voiceSpeechRate !== undefined) setVoiceSpeechRate(extra.voiceSpeechRate);

        // Account / billing (plan is now from DB, skip local restore)
        if (extra.referralCode) setReferralCode(extra.referralCode);
        if (extra.twoFactorAuth !== undefined) setTwoFactorAuth(extra.twoFactorAuth);

        // Labs
        if (extra.aiVoiceMode !== undefined) setAiVoiceMode(extra.aiVoiceMode);
        if (extra.vrLabs !== undefined) setVrLabs(extra.vrLabs);
        if (extra.speedReader !== undefined) setSpeedReader(extra.speedReader);
        if (extra.peerStudy !== undefined) setPeerStudy(extra.peerStudy);
        if (extra.focusSounds !== undefined) setFocusSounds(extra.focusSounds);
      }

      const reviewRaw = localStorage.getItem('lxc-profile-review');
      if (reviewRaw) {
        const rev = JSON.parse(reviewRaw);
        if (rev.rating) setStarRating(rev.rating);
        if (rev.text) setReviewText(rev.text);
        if (rev.submitted !== undefined) setReviewSubmitted(rev.submitted);
      }
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated]);

  // Parse language cookie for sidebar dropdown
  useEffect(() => {
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

  const handleSubjectToggle = (sub: string) => {
    playSound('toggle');
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleCopyReferral = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(`https://ritai.in/ref/${referralCode}`);
    setCopiedLink(true);
    playSound('success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Goal-Module mapping
  const GOAL_PLAN_MAP = {
    school: { planKey: 'ignite', planName: 'IGNITE PLUS', price: '₹49', color: '#1A9FFF', desc: 'Class 6–12 · NCERT & Board roadmaps' },
    college: { planKey: 'zenith', planName: 'ZENITH PRO', price: '₹99', color: '#5CDD2B', desc: 'UG/PG · DSA + Career engine' },
    competitive: { planKey: 'apex', planName: 'APEX ELITE', price: '₹149', color: '#FBBF24', desc: 'JEE / NEET / UPSC / GATE' },
  } as const;

  const ALL_PREMIUM_PLANS = [
    { key: 'school',      planKey: 'ignite',   planName: 'IGNITE PLUS',    price: '₹49',   color: '#1A9FFF', emoji: '🎓', audience: 'School Students' },
    { key: 'college',    planKey: 'zenith',   planName: 'ZENITH PRO',     price: '₹99',   color: '#5CDD2B', emoji: '🏢', audience: 'College Students' },
    { key: 'competitive',planKey: 'apex',     planName: 'APEX ELITE',     price: '₹149',  color: '#FBBF24', emoji: '⚡', audience: 'Competitive Prep' },
    { key: 'lifetime',   planKey: 'lifetime', planName: 'LIFETIME ELITE', price: '₹3,999', color: '#A855F7', emoji: '♾️', audience: 'All Goals' },
  ] as const;


  const GOAL_LABEL_MAP = {
    school: 'School Student',
    college: 'College / Career',
    competitive: 'Competitive Exams',
  };

  const handleGoalChange = async (newGoal: 'school' | 'college' | 'competitive') => {
    if (newGoal === educationGoal || isGoalUpdating) return;
    setIsGoalUpdating(true);
    setGoalUpdateMsg(null);
    playSound('click');
    try {
      const token = localStorage.getItem('@lxc_ai_token');
      const res = await fetch(lxcWebUrl('/api/v1/forum/profile/update-goal'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ educationLevel: newGoal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update goal.');
      setEducationGoal(newGoal);
      // Refresh plan from DB after goal change
      refreshPlan();
      const extraRaw = localStorage.getItem('lxc-profile-extra') || '{}';
      const extra = JSON.parse(extraRaw);
      delete extra.activePlan;
      localStorage.setItem('lxc-profile-extra', JSON.stringify(extra));
      playSound('success');
      setGoalUpdateMsg({ type: 'success', text: `Goal updated to ${GOAL_LABEL_MAP[newGoal]}! Your available plans have been refreshed.` });
      setTimeout(() => setGoalUpdateMsg(null), 4000);
    } catch (err: any) {
      setGoalUpdateMsg({ type: 'error', text: err.message || 'Could not update goal.' });
    } finally {
      setIsGoalUpdating(false);
    }
  };

  const handleReviewSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    playSound('success');
    localStorage.setItem('lxc-profile-review', JSON.stringify({
      rating: starRating,
      text: reviewText.trim(),
      submitted: true
    }));
  };

  const handleTabSelect = (tab: typeof activeSubTab) => {
    setActiveSubTab(tab);
    playSound('click');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);

    // Simulate saving process
    setTimeout(() => {
      // 1. Save Identity settings in Zustand
      setStoreAvatar(avatar);
      setStoreNickname(nickname.trim());
      setStoreBio(bio.trim());

      // 2. Save Academic settings in LXC Student Data
      const loaded = loadStudentData();
      const updatedProfile: StudentProfile = {
        name: fullName.trim() || user?.name || 'Student',
        class: gradeClass,
        board: board,
        subjects: subjects.length ? subjects : ['Mathematics'],
        studyHoursPerDay: studyHours,
        language: language,
        createdAt: loaded.profile?.createdAt || Date.now(),
        updatedAt: Date.now()
      };
      const updatedData = { ...loaded, profile: updatedProfile };
      saveStudentData(updatedData);
      setData(updatedData);

      // 3. Save AI Preferences and Extra settings
      const extraSettings = {
        tutorStyle,
        storeGaps,
        audioFeedback,
        bharatMode,
        showcaseBadge,

        activeAccessory,
        fontFamily,
        fontSizeScale,
        soundEnabled,
        glassOpacity,
        voiceSpeechRate,

        referralCode,
        twoFactorAuth,

        aiVoiceMode,
        vrLabs,
        speedReader,
        peerStudy,
        focusSounds
      };
      localStorage.setItem('lxc-profile-extra', JSON.stringify(extraSettings));

      // 4. Save rating text if modified
      if (reviewText.trim()) {
        localStorage.setItem('lxc-profile-review', JSON.stringify({
          rating: starRating,
          text: reviewText.trim(),
          submitted: reviewSubmitted
        }));
      }

      setIsSaving(false);
      setShowSuccess(true);
      playSound('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Auto hide success banner after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 800);
  };

  const nextLvl = xpToNextLevel(data?.totalXP || 0);
  const studentLevel = data?.level || 1;
  const weakSubjects = data ? getWeakSubjects(data) : [];
  const strongSubjects = data ? getStrongSubjects(data) : [];
  const avgScore = data ? getAverageScore(data) : 75;

  // Render Live tutor dialogue bubble preview
  const renderTutorPreview = () => {
    switch (tutorStyle) {
      case 'socratic':
        return (
          <div className="bg-[#0057C8]/10 border border-[#0057C8]/20 rounded-2xl p-4 text-xs space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0057C8] dark:text-[#1A9FFF]">Socratic Coach</span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">Active Preview</span>
            </div>
            <p className="italic text-slate-600 dark:text-neutral-300">
              "That's a good starting point! If we look at the equation y = mx + c, what do you think 'm' represents if the line is steep? How does 'm' affect the direction?"
            </p>
          </div>
        );
      case 'direct':
        return (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Direct Summarist</span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">Active Preview</span>
            </div>
            <p className="text-slate-600 dark:text-neutral-300">
              "In the linear equation y = mx + c, 'm' is the slope (gradient) of the line, which determines its steepness, and 'c' is the y-intercept, where the line crosses the y-axis."
            </p>
          </div>
        );
      case 'expert':
        return (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-xs space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-purple-600 dark:text-purple-400">Rigorous Scientist</span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">Active Preview</span>
            </div>
            <p className="text-slate-600 dark:text-neutral-300 font-mono">
              "Let L be a line in R² defined by y = mx + c. The parameter m ∈ R represents dy/dx, the derivative defining the tangent angle θ = arctan(m). The constant c corresponds to the evaluation of L at x = 0."
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full">
      
      {/* Dyslexia and Visual styling overlays dynamically injected */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-style-dyslexic, .font-style-dyslexic * {
          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.18em !important;
          line-height: 1.62 !important;
        }
        .font-style-mono, .font-style-mono * {
          font-family: monospace !important;
        }
        .font-style-sans, .font-style-sans * {
          font-family: system-ui, sans-serif !important;
        }
        .font-style-outfit, .font-style-outfit * {
          font-family: var(--font-sans), sans-serif !important;
        }
      `}} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Background radial effects */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#0057C810_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-10%,#0057C815_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#5CDD2B05_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_40%,#5CDD2B08_0%,transparent_40%)]" />
          </div>

          <main className="flex-1 py-8 px-6 lg:px-12 overflow-y-auto scrollbar-hide relative z-10 flex items-start justify-center">
            <div className="w-full">
              
              {/* Back button */}
             

              {!isAuthenticated ? (
                /* Unauthenticated Lock Screen */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 dark:bg-[#0f0f13] backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-12 text-center shadow-2xl max-w-md mx-auto"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-500/20">
                    <Lock className="w-8 h-8 text-red-600 dark:text-[#FF7C7C]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Access Denied</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                    Please log in or register your account to configure settings.
                  </p>
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(26,159,255,0.4)]"
                    style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                  >
                    Sign In Now
                  </Link>
                </motion.div>
              ) : (
                /* Main Settings Dashboard */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative transition-all duration-300"
                  style={{ 
                    fontSize: `${fontSizeScale}rem`,
                    backgroundColor: resolvedTheme === 'dark' ? `rgba(15, 15, 19, ${glassOpacity / 100})` : `rgba(255, 255, 255, ${glassOpacity / 100})`,
                    backdropFilter: `blur(${glassOpacity / 5}px)`
                  }}
                >
                  {/* Success banner */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 text-green-600 dark:text-green-400 z-20 shadow-md overflow-hidden"
                      >
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
                        <span className="font-semibold">Your student settings have been successfully updated!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Header */}
                   <div className="mb-6 flex justify-between items-center">
                <Link
                  href="/lxc"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full select-none">
                  Student Settings Suite
                </div>
              </div>
                  <div className="mb-8 border-b border-slate-200 dark:border-white/5 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                        Student{' '}
                        <span style={{ 
                          background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)', 
                          WebkitBackgroundClip: 'text', 
                          WebkitTextFillColor: 'transparent' 
                        }}>
                          Control Hub
                        </span>
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold">
                        Configure personalization, active plans, security measures, and digital twin analytics.
                      </p>
                    </div>

                    {/* Level Badge details */}
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-inner shrink-0">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/10 shrink-0">
                        {avatar && <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />}
                        {/* Overlay frame icons depending on level */}
                        {activeAccessory === 'halo' && (
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-cyan-400 rounded-full blur-[0.5px] opacity-80" />
                        )}
                        {activeAccessory === 'visor' && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-9 h-1.5 bg-emerald-500 opacity-90" />
                        )}
                        {activeAccessory === 'crown' && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs select-none">👑</div>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-black truncate">{nickname || user?.name || 'Student'}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase mt-0.5">
                          <span>Level {studentLevel}</span>
                          <span className="text-slate-400">•</span>
                          <span>{data?.totalXP || 0} XP</span>
                          {activePlanMeta && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] text-white font-extrabold flex items-center gap-0.5 shrink-0" style={{ background: activePlanMeta.color }}>
                                {activePlanMeta.emoji} {activePlanMeta.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Form container */}
                  <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                    
                    {/* Left tabs links selector */}
                    <div className="flex flex-col gap-1 border-r border-slate-200 dark:border-white/5 pr-4 shrink-0">
                      {[
                        { id: 'identity', label: 'Identity & Academics', icon: User },
                        { id: 'ai', label: 'AI & Insights', icon: Brain },
                        { id: 'account', label: 'Account & Plan', icon: CreditCard },
                        { id: 'security', label: 'Security & Activity', icon: Shield },
                        { id: 'growth', label: 'Growth & Quests', icon: Trophy },
                        { id: 'accessibility', label: 'Preferences & Style', icon: Type },
                        { id: 'labs', label: 'Beta Feature Labs', icon: Activity },
                        { id: 'review', label: 'Submit App Review', icon: Heart }
                      ].map((subtab) => {
                        const Icon = subtab.icon;
                        const isSubActive = activeSubTab === subtab.id;
                        return (
                          <button
                            key={subtab.id}
                            type="button"
                            onClick={() => handleTabSelect(subtab.id as any)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white shadow-md shadow-blue-500/10'
                                : 'text-slate-600 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            <span>{subtab.label}</span>
                          </button>
                        );
                      })}

                      {/* Save settings control */}
                      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/5 text-center lg:text-left">
                        <button
                          type="submit"
                          disabled={isSaving || !nickname.trim()}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(26,159,255,0.4)] cursor-pointer"
                          style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                        >
                          {isSaving ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Active subtab panels */}
                    <div className={`min-h-[450px] font-style-${fontFamily}`}>
                      
                      {/* Identity & Academic tab */}
                      {activeSubTab === 'identity' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <User className="w-5 h-5 text-[#1A9FFF]" />
                              <span>Identity & Academics Configuration</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Customize your personal avatar, nickname, and subject roadmap curricula.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                            {/* Avatar visual preview */}
                            <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-white/2 p-4 rounded-2xl border border-slate-200 dark:border-white/5 justify-center">
                              <div className="relative">
                                {/* Overlays representing active level ornaments */}
                                {activeAccessory === 'halo' && (
                                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-cyan-400/20 border border-cyan-400 rounded-full blur-[0.5px] shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-bounce z-10 flex items-center justify-center opacity-90 transform -rotate-12" style={{ animationDuration: '3s' }}>
                                    <div className="w-12 h-2.5 border border-cyan-200/50 rounded-full" />
                                  </div>
                                )}
                                {activeAccessory === 'visor' && (
                                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-emerald-500/80 border-t border-b border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10 flex items-center justify-center opacity-95 rounded-sm">
                                    <div className="text-[5px] font-mono tracking-widest text-emerald-100 font-bold select-none">SYSTEM.ACTIVE</div>
                                  </div>
                                )}
                                {activeAccessory === 'crown' && (
                                  <svg className="absolute -top-6.5 left-1/2 -translate-x-1/2 w-10 h-8 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] z-10 animate-[setup-float_4s_infinite]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2 16 L5 7 L10 11 L12 5 L14 11 L19 7 L22 16 Z M2 18 L22 18 L22 20 L2 20 Z" />
                                  </svg>
                                )}

                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#121212] bg-slate-100 dark:bg-white/5 shrink-0 shadow-lg">
                                  {avatar && <img src={avatar} alt="Selected Avatar" className="w-full h-full object-cover" />}
                                </div>
                                <div className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#1A9FFF] text-white flex items-center justify-center shadow-md">
                                  <Sparkles className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Avatar</span>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                Choose Premium Avatar
                              </label>
                              <div className="flex flex-wrap gap-2 max-w-[320px]">
                                {AVATAR_OPTIONS.map((opt) => {
                                  const isSelected = avatar === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setAvatar(opt);
                                        playSound('toggle');
                                      }}
                                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 bg-slate-100 dark:bg-white/5 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer ${
                                        isSelected
                                          ? 'border-[#0057C8] dark:border-[#1A9FFF] ring-2 ring-[#0057C8]/20 dark:ring-[#1A9FFF]/20 scale-105'
                                          : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
                                      }`}
                                    >
                                      <img src={opt} alt="Avatar option" className="w-full h-full object-cover" />
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Level Lock Accessories */}
                              <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                  Level-Unlocked Ornaments
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {ACCESSORIES.map((acc) => {
                                    const isLocked = studentLevel < acc.level;
                                    const isSelected = activeAccessory === acc.id;
                                    return (
                                      <button
                                        key={acc.id}
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => {
                                          setActiveAccessory(acc.id as any);
                                          playSound('toggle');
                                        }}
                                        className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center relative cursor-pointer ${
                                          isLocked
                                            ? 'opacity-40 bg-slate-100/30 border-slate-200 dark:border-white/5 cursor-not-allowed'
                                            : isSelected
                                              ? 'border-[#1A9FFF] bg-[#1A9FFF]/5 text-[#1a6fd8] dark:text-[#1A9FFF] font-bold shadow-sm'
                                              : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-white/20'
                                        }`}
                                      >
                                        {isLocked && (
                                          <div className="absolute -top-1.5 -right-1 bg-red-500/20 text-red-500 text-[7px] font-black px-1 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Lock className="w-2 h-2" />
                                            <span>Lvl {acc.level}</span>
                                          </div>
                                        )}
                                        <span className="text-base">{acc.icon}</span>
                                        <span className="text-[9px] truncate w-full">{acc.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          </div>

                          <div className="space-y-4 pt-2">
                            {/* Full Name & Nickname row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Student Full Name</label>
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  className="w-full rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/30"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Learning Nickname</label>
                                <input
                                  type="text"
                                  required
                                  maxLength={25}
                                  placeholder="ScholarNickname"
                                  value={nickname}
                                  onChange={(e) => setNickname(e.target.value)}
                                  className="w-full rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/30"
                                />
                              </div>
                            </div>

                            {/* Class, Board, Hours, Language Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Class Level</label>
                                <select
                                  value={gradeClass}
                                  onChange={(e) => setGradeClass(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                                >
                                  {CLASSES.map((c) => (
                                    <option key={c} value={c} className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white">
                                      Class {c}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Education Board</label>
                                <select
                                  value={board}
                                  onChange={(e) => setBoard(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                                >
                                  {BOARDS.map((b) => (
                                    <option key={b} value={b} className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white">
                                      {b}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Study Hours Goal</label>
                                <select
                                  value={studyHours}
                                  onChange={(e) => setStudyHours(Number(e.target.value))}
                                  className="w-full bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                                >
                                  {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                                    <option key={h} value={h} className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white">
                                      {h} hours
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Primary Language</label>
                                <select
                                  value={language}
                                  onChange={(e) => setLanguage(e.target.value as any)}
                                  className="w-full bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                                >
                                  <option value="english" className="bg-white dark:bg-[#0c1524]">English</option>
                                  <option value="hindi" className="bg-white dark:bg-[#0c1524]">Hindi</option>
                                  <option value="hinglish" className="bg-white dark:bg-[#0c1524]">Hinglish</option>
                                </select>
                              </div>
                            </div>

                            {/* Subjects selection */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">
                                Select Active Subjects <span className="text-slate-400 font-medium">(At least 1)</span>
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {SUBJECTS_CBSE.map((sub) => {
                                  const isSelected = subjects.includes(sub);
                                  return (
                                    <button
                                      key={sub}
                                      type="button"
                                      onClick={() => handleSubjectToggle(sub)}
                                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                                        isSelected
                                          ? 'bg-gradient-to-r from-[#1a6fd8] to-[#3b8eef] text-white border-transparent'
                                          : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                      {sub}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Learning Bio */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Learning Bio / Tutor Instructions</label>
                              <textarea
                                rows={3}
                                maxLength={300}
                                placeholder="Explain your visual preferences to the AI... e.g. 'Keep math explanations intuitive with step-by-step examples. Use coding analogies where possible.'"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/30 resize-none"
                              />
                              <div className="flex justify-between items-center text-[9px] text-slate-400 ml-1">
                                <span>Directly personalize prompt parameters in chats.</span>
                                <span>{bio.length}/300 chars</span>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {/* AI & Cognitive Twin tab */}
                      {activeSubTab === 'ai' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Brain className="w-5 h-5 text-[#5CDD2B]" />
                              <span>AI Tutor & Cognitive Twin Diagnostics</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Adjust tutoring methodology parameters and review digital twin analytics.</p>
                          </div>

                          {/* Tutor styles */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">AI Explanation Methodology</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                { id: 'socratic', label: 'Socratic Coach', desc: 'Asks guiding questions to lead you to answers.' },
                                { id: 'direct', label: 'Direct Summarist', desc: 'Delivers core facts and straight summaries.' },
                                { id: 'expert', label: 'Rigorous Scientist', desc: 'Presents mathematical proofs and scientific code.' }
                              ].map((style) => {
                                const isSelected = tutorStyle === style.id;
                                return (
                                  <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => {
                                      setTutorStyle(style.id as any);
                                      playSound('toggle');
                                    }}
                                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-full transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-[#0057C8] dark:border-[#1A9FFF] bg-[#0057C8]/5 shadow-sm'
                                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                                  >
                                    <span className="text-xs font-extrabold flex items-center justify-between w-full">
                                      <span>{style.label}</span>
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1A9FFF]" />}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-white/40 mt-1 leading-normal">{style.desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Live Chat Bubble Preview */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Live Tutor Preview Bubble</label>
                            {renderTutorPreview()}
                          </div>

                          {/* Digital Twin Cognitive Metrics */}
                          <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Cognitive Memory Status (Digital Twin)</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                              {/* SVG dial meter */}
                              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl relative shrink-0">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="38" className="text-slate-200 dark:text-neutral-800" strokeWidth="6" fill="transparent" stroke="currentColor" />
                                    <circle cx="48" cy="48" r="38" className="text-[#1A9FFF] drop-shadow-[0_0_4px_rgba(26,159,255,0.4)]" strokeWidth="6" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 - (238.7 * avgScore) / 100} strokeLinecap="round" stroke="currentColor" />
                                  </svg>
                                  <div className="absolute flex flex-col items-center">
                                    <span className="text-lg font-black">{avgScore}%</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Avg Quiz</span>
                                  </div>
                                </div>
                              </div>

                              {/* Attributes */}
                              <div className="bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strong Subjects</div>
                                  <div className="flex flex-wrap gap-1">
                                    {strongSubjects.length > 0 ? strongSubjects.map(s => (
                                      <span key={s} className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded-full">{s}</span>
                                    )) : <span className="text-[9px] text-slate-400 italic">No strong subjects logged. Take a quiz to map your twin.</span>}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weak Topics (Target Areas)</div>
                                  <div className="flex flex-wrap gap-1">
                                    {weakSubjects.length > 0 ? weakSubjects.map(s => (
                                      <span key={s} className="bg-rose-500/15 border border-rose-500/25 text-rose-600 dark:text-[#FF7C7C] text-[8px] font-bold px-2 py-0.5 rounded-full">{s}</span>
                                    )) : <span className="text-[9px] text-slate-400 italic">No weak subjects detected. Excellent job!</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Twin Logs Toggle options */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl">
                              <div className="space-y-0.5 text-left">
                                <div className="text-xs font-extrabold flex items-center gap-1.5">
                                  <Brain className="w-4 h-4 text-purple-400" />
                                  <span>Cognitive Memory Tracking (Digital Twin)</span>
                                </div>
                                <p className="text-[10px] text-slate-400 max-w-sm">Allow AI tutor to log comprehension gaps to your profile to adjust roadmap recommendations.</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={storeGaps}
                                onChange={(e) => {
                                  setStoreGaps(e.target.checked);
                                  playSound('toggle');
                                }}
                                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-transparent accent-[#1A9FFF] cursor-pointer"
                              />
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* Account & Billing tab */}
                      {activeSubTab === 'account' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-[#1A9FFF]" />
                              <span>Account Billing & Affiliate Dashboard</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Manage subscription plans, check active status, and track referral income.</p>
                          </div>

                          {/* Learning Goal Badge */}
                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-2xl">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${GOAL_PLAN_MAP[educationGoal].color}18` }}>
                              <span className="text-base">
                                {educationGoal === 'school' ? '🎓' : educationGoal === 'college' ? '🏢' : '⚡'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Your Learning Goal</div>
                              <div className="text-xs font-black text-slate-800 dark:text-white">{GOAL_LABEL_MAP[educationGoal]}</div>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full"
                              style={{ color: GOAL_PLAN_MAP[educationGoal].color, background: `${GOAL_PLAN_MAP[educationGoal].color}18` }}>
                              ACTIVE
                            </span>
                          </div>

                          {/* Active Plan Summary card */}
                          <div className="rounded-2xl p-5 shadow-lg relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${activePlanMeta.color}CC, ${activePlanMeta.color}88)` }}>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                              <Sparkles className="w-44 h-44 text-white" />
                            </div>

                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <span className="bg-white/20 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">ACTIVE SUBSCRIPTION</span>
                                <h4 className="text-xl font-black text-white">
                                  {activePlanMeta.label}
                                </h4>
                                <p className="text-[10px] text-white/70">{activePlanMeta.desc}</p>
                              </div>
                              <span className="bg-[#5CDD2B] text-[#070c16] text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow">
                                {activePlan === 'free' ? 'FREE' : 'ACTIVE'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20 text-xs">
                              <div>
                                <div className="text-white/60 text-[9px] uppercase font-bold">Billing Term</div>
                                <div className="font-extrabold text-white">{activePlan === 'free' ? 'Free Forever' : (planBillingCycle === 'annual' ? 'Annual' : 'Monthly')}</div>
                              </div>
                              <div>
                                <div className="text-white/60 text-[9px] uppercase font-bold">Expires</div>
                                <div className="font-extrabold text-white">
                                  {activePlan === 'free' ? 'Never' : planEndDate ? planEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </div>
                              </div>
                              <div>
                                <div className="text-white/60 text-[9px] uppercase font-bold">Access</div>
                                <div className="font-extrabold text-white">{activePlan === 'free' ? 'Doubt Forum only' : 'All premium modules'}</div>
                              </div>
                              <div>
                                <div className="text-white/60 text-[9px] uppercase font-bold">Renewal</div>
                                <div className="font-extrabold text-white">{activePlan === 'free' ? 'None' : isAutoRenew ? 'Auto mandate' : 'One-time'}</div>
                              </div>
                            </div>

                            {activePlan === 'free' && (
                              <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="mt-4 w-full py-2.5 bg-white text-[#0057C8] rounded-xl text-xs font-black hover:bg-white/90 transition-all cursor-pointer"
                              >
                                ⚡ Upgrade to Ignite / Zenith / Apex / Lifetime ♾️
                              </button>
                            )}
                          </div>

                          {/* Module Plan Grid — locked/unlocked based on goal */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">AVAILABLE PLANS FOR YOUR GOAL</label>
                            {/* Free plan always unlocked */}
                            <button
                              type="button"
                              onClick={() => { setShowUpgradeModal(true); playSound('toggle'); }}
                              className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                activePlan === 'free'
                                  ? 'border-[#1A9FFF] bg-[#1A9FFF]/5'
                                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                              }`}
                            >
                              <span className="text-base">🆓</span>
                              <div className="flex-1">
                                <div className="text-xs font-black">Basic Free Learner</div>
                                <div className="text-[9px] text-slate-400">₹0 · Core doubt solver · Always available</div>
                              </div>
                              {activePlan === 'free' && <Check className="w-4 h-4 text-[#1A9FFF] shrink-0" />}
                            </button>

                            {/* Premium Plans — locked/unlocked based on goal (lifetime always unlocked) */}
                            {ALL_PREMIUM_PLANS.map((plan) => {
                              const isActive = activePlan === plan.planKey;
                              const isUnlocked = plan.key === 'lifetime' || plan.key === educationGoal || isActive;
                              return (
                                <div key={plan.key} className="relative">
                                  <button
                                    type="button"
                                    disabled={!isUnlocked}
                                    onClick={() => {
                                      if (isUnlocked) {
                                        setShowUpgradeModal(true);
                                        playSound('toggle');
                                      }
                                    }}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                                      isUnlocked
                                        ? isActive
                                          ? 'border-2 cursor-pointer'
                                          : 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20 border-slate-200 dark:border-white/10'
                                        : 'cursor-not-allowed opacity-50 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/1'
                                    }`}
                                    style={isActive && isUnlocked ? { borderColor: plan.color, background: `${plan.color}0D` } : {}}
                                  >
                                    <span className="text-base">{plan.emoji}</span>
                                    <div className="flex-1">
                                      <div className="text-xs font-black flex items-center gap-2">
                                        {plan.planName}
                                        {!isUnlocked && (
                                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                                            <Lock className="w-2.5 h-2.5" />
                                            {plan.audience} only
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[9px] text-slate-400">
                                        {getDynamicPriceText(plan.planKey)} {plan.planKey === 'lifetime' ? 'once' : '/mo'} · {plan.audience}
                                      </div>
                                    </div>
                                    {isActive && isUnlocked && <Check className="w-4 h-4 shrink-0" style={{ color: plan.color }} />}
                                  </button>
                                </div>
                              );
                            })}
                            <p className="text-[9px] text-slate-400 ml-1 mt-1">🔒 Locked plans are reserved for users with a matching goal. Change your goal below to unlock them.</p>
                          </div>

                          {/* Billing History */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">BILLING HISTORY</label>
                            {planLoading ? (
                              <div className="text-center py-4 text-[11px] text-slate-400">Loading...</div>
                            ) : billingHistory && billingHistory.length > 0 ? (
                              <div className="space-y-2">
                                {billingHistory.map((b: any) => (
                                  <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/2 text-xs">
                                    <div>
                                      <div className="font-black text-slate-800 dark:text-white">{b.planKey?.toUpperCase()} Plan</div>
                                      <div className="text-[9px] text-slate-400">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-black text-slate-800 dark:text-white">₹{((b.amount ?? 0) / 100).toFixed(0)}</div>
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${b.status === 'success' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                                        {b.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/2">
                                <CreditCard className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                                <span className="text-[10px] text-slate-400">No billing history yet</span>
                              </div>
                            )}
                          </div>

                          {/* Goal Update Notification */}
                          <AnimatePresence>
                            {goalUpdateMsg && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                                  goalUpdateMsg.type === 'success'
                                    ? 'bg-green-50 dark:bg-[#5CDD2B]/10 border border-green-200 dark:border-[#5CDD2B]/25 text-green-700 dark:text-[#5CDD2B]'
                                    : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-[#FF7C7C]'
                                }`}
                              >
                                {goalUpdateMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
                                {goalUpdateMsg.text}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Change Goal Section */}
                          <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-5 bg-slate-50 dark:bg-white/2 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-[#1A9FFF]" />
                              <span>Change Learning Goal</span>
                              {isGoalUpdating && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-3.5 h-3.5 border-2 border-slate-200 border-t-[#1A9FFF] rounded-full ml-1"
                                />
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                              Switch your focus area to unlock the corresponding premium plan. Changing your goal resets your active plan to the Free tier.
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {([
                                { key: 'school', emoji: '🎓', label: 'School', color: '#1A9FFF', sub: 'Class 6–12' },
                                { key: 'college', emoji: '🏢', label: 'College', color: '#5CDD2B', sub: 'UG / PG' },
                                { key: 'competitive', emoji: '⚡', label: 'Competitive', color: '#FBBF24', sub: 'JEE / NEET' },
                              ] as const).map((g) => (
                                <button
                                  key={g.key}
                                  type="button"
                                  disabled={isGoalUpdating || g.key === educationGoal}
                                  onClick={() => handleGoalChange(g.key)}
                                  className={`p-3 rounded-xl border text-center transition-all ${
                                    g.key === educationGoal
                                      ? 'cursor-default'
                                      : 'cursor-pointer hover:scale-[1.02]'
                                  } disabled:opacity-50`}
                                  style={{
                                    borderColor: g.key === educationGoal ? g.color : undefined,
                                    background: g.key === educationGoal ? `${g.color}12` : undefined,
                                  }}
                                >
                                  <div className="text-lg mb-1">{g.emoji}</div>
                                  <div className="text-[10px] font-black" style={{ color: g.key === educationGoal ? g.color : undefined }}>{g.label}</div>
                                  <div className="text-[8px] text-slate-400 mt-0.5">{g.sub}</div>
                                  {g.key === educationGoal && (
                                    <div className="mt-1.5">
                                      <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ color: g.color, background: `${g.color}20` }}>CURRENT</span>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Affiliate / Referral Dashboard */}
                          <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-5 bg-slate-50 dark:bg-white/2 space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-4 h-4 text-amber-500" />
                              <span>Affiliate Referral Program</span>
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Referral Code</div>
                                <input
                                  type="text"
                                  value={referralCode}
                                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                  className="w-full bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Custom Affiliate Link</div>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    readOnly
                                    value={`https://ritai.in/ref/${referralCode.toLowerCase()}`}
                                    className="flex-1 bg-white/50 dark:bg-[#0c1524]/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] focus:outline-none text-slate-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCopyReferral}
                                    className="bg-[#1A9FFF] hover:bg-[#1A9FFF]/95 text-white p-2 rounded-xl text-xs flex items-center justify-center shrink-0 cursor-pointer"
                                  >
                                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/5 text-center">
                              <div className="bg-white dark:bg-[#0c1524]/20 border border-slate-200 dark:border-white/5 p-2 rounded-xl">
                                <div className="text-[8px] text-slate-400 uppercase font-bold">Total Invites</div>
                                <div className="text-sm font-black text-[#1A9FFF]">8 Signed Up</div>
                              </div>
                              <div className="bg-white dark:bg-[#0c1524]/20 border border-slate-200 dark:border-white/5 p-2 rounded-xl">
                                <div className="text-[8px] text-slate-400 uppercase font-bold">XP Commission</div>
                                <div className="text-sm font-black text-amber-500">2,400 XP</div>
                              </div>
                              <div className="bg-white dark:bg-[#0c1524]/20 border border-slate-200 dark:border-white/5 p-2 rounded-xl">
                                <div className="text-[8px] text-slate-400 uppercase font-bold">Earnings Balance</div>
                                <div className="text-sm font-black text-emerald-500">₹400</div>
                              </div>
                            </div>

                            {/* Referral list */}
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recent Referral Activity</div>
                              <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-hide">
                                {REFERRAL_LIST_MOCK.map((ref, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[9px] p-2 bg-white dark:bg-[#0c1524]/20 border border-slate-200 dark:border-white/5 rounded-xl">
                                    <div className="font-extrabold">{ref.name} <span className="text-slate-400 font-semibold">(Lvl {ref.level})</span></div>
                                    <div className="text-slate-400">{ref.date}</div>
                                    <div className="text-emerald-500 font-bold">{ref.reward}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}

                      {/* Security & Sessions tab */}
                      {activeSubTab === 'security' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Shield className="w-5 h-5 text-rose-500" />
                              <span>Security Configuration & Sessions</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Manage login credentials, update passwords, toggle 2FA, and inspect login history.</p>
                          </div>

                          {/* Password update form mock */}
                          <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-white/2 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                              <Key className="w-4 h-4 text-rose-400" />
                              <span>Change Password</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase">Current Password</label>
                                <input
                                  type="password"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase">New Password</label>
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-400 uppercase">Confirm Password</label>
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Two-Factor Authentication */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl">
                            <div className="space-y-0.5 text-left">
                              <div className="text-xs font-extrabold flex items-center gap-1.5">
                                <ShieldAlert className="w-4.5 h-4.5 text-orange-500" />
                                <span>Two-Factor Authentication (2FA)</span>
                              </div>
                              <p className="text-[10px] text-slate-400 max-w-sm">Secure your account by requiring an OTP authenticator app at login.</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={twoFactorAuth}
                              onChange={(e) => {
                                setTwoFactorAuth(e.target.checked);
                                playSound('toggle');
                              }}
                              className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-transparent accent-[#1A9FFF] cursor-pointer"
                            />
                          </div>

                          {/* Login History Logs */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 ml-1">
                              <History className="w-4 h-4 text-purple-400" />
                              <span>Login History Logs</span>
                            </h4>
                            <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/2">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[10px]">
                                  <thead>
                                    <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-400">
                                      <th className="p-2.5 font-bold uppercase">Date & Time</th>
                                      <th className="p-2.5 font-bold uppercase">Device / OS</th>
                                      <th className="p-2.5 font-bold uppercase">IP Address</th>
                                      <th className="p-2.5 font-bold uppercase">Location</th>
                                      <th className="p-2.5 font-bold uppercase text-right">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {LOGIN_HISTORY_MOCK.map((log) => (
                                      <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all">
                                        <td className="p-2.5 font-semibold">{log.date}</td>
                                        <td className="p-2.5">{log.device}</td>
                                        <td className="p-2.5 font-mono text-slate-400">{log.ip}</td>
                                        <td className="p-2.5">{log.location}</td>
                                        <td className="p-2.5 text-right font-black">
                                          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] ${
                                            log.status === 'Active' 
                                              ? 'bg-emerald-500/10 text-emerald-500' 
                                              : log.status === 'Logged Out'
                                                ? 'bg-slate-500/15 text-slate-400'
                                                : 'bg-rose-500/10 text-rose-500'
                                          }`}>
                                            {log.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* Growth & Quests tab */}
                      {activeSubTab === 'growth' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-amber-500" />
                              <span>Gamification Engine & Quests</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Track streak calendars, milestones progress, unlocked badges, and review XP history logs.</p>
                          </div>

                          {/* XP Progress Bar */}
                          <div className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl space-y-2.5">
                            <div className="flex justify-between items-center text-xs font-black">
                              <span className="flex items-center gap-1.5">
                                <Flame className="w-4.5 h-4.5 text-orange-500" />
                                <span>LEVEL {studentLevel}</span>
                              </span>
                              <span className="text-slate-400">{nextLvl.current} / {nextLvl.needed} XP to Next Milestone</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] transition-all duration-300"
                                style={{ width: `${nextLvl.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Total Accumulation: {data?.totalXP || 0} XP</span>
                              <span>{nextLvl.progress}% Completed</span>
                            </div>
                          </div>

                          {/* Quest Challenges list */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Weekly Learning Quests</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {WEEKLY_QUESTS_MOCK.map((q) => (
                                <div key={q.id} className="p-3.5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-xl text-left flex flex-col justify-between">
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                        <Award className={`w-4 h-4 ${q.status === 'Completed' ? 'text-amber-500' : 'text-slate-400'}`} />
                                        <span>{q.title}</span>
                                      </h5>
                                      <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5">{q.detail}</p>
                                    </div>
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                                      q.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-[#1A9FFF]'
                                    }`}>{q.status}</span>
                                  </div>

                                  <div className="flex justify-between items-center text-[10px] pt-3 mt-2 border-t border-slate-200 dark:border-white/5">
                                    <span className="font-bold text-slate-400">{q.progress}</span>
                                    <span className="text-amber-500 font-extrabold">+{q.xp} XP</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Showcase Badge selector */}
                          <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Showcase Active Badge</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PREDEFINED_BADGES.map((badge) => {
                                const isUnlocked = data?.badges?.some(b => b.id === badge.id) || false;
                                const isShowcased = showcaseBadge === badge.id;
                                return (
                                  <button
                                    key={badge.id}
                                    type="button"
                                    disabled={!isUnlocked}
                                    onClick={() => {
                                      setShowcaseBadge(badge.id);
                                      playSound('toggle');
                                    }}
                                    className={`p-3.5 rounded-xl border text-left flex gap-3 transition-all ${
                                      !isUnlocked
                                        ? 'opacity-40 bg-slate-100/30 border-slate-200 dark:border-white/5 cursor-not-allowed'
                                        : isShowcased
                                          ? 'border-amber-500 bg-amber-500/5 cursor-pointer shadow-sm'
                                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 cursor-pointer'
                                    }`}
                                  >
                                    <span className="text-2xl shrink-0 select-none">{badge.icon}</span>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                        <span>{badge.name}</span>
                                        {isShowcased && <Check className="w-3 h-3 text-amber-500 shrink-0" />}
                                      </div>
                                      <p className="text-[9px] text-slate-500 dark:text-white/40 leading-normal mt-0.5 line-clamp-1">{badge.description}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* Preferences & Accessibility tab */}
                      {activeSubTab === 'accessibility' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Type className="w-5 h-5 text-[#1A9FFF]" />
                              <span>Preferences & Style Customization</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Toggle dyslexia assistance modes, resize UI fonts, adjust glassmorphic backdrops, and toggle sound effects.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Font selection */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Type className="w-3.5 h-3.5" />
                                <span>Font Family</span>
                              </label>
                              <select
                                value={fontFamily}
                                onChange={(e) => {
                                  setFontFamily(e.target.value as any);
                                  playSound('toggle');
                                }}
                                className="w-full bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                              >
                                <option value="outfit" className="bg-white dark:bg-[#0c1524]">Outfit (Standard)</option>
                                <option value="dyslexic" className="bg-white dark:bg-[#0c1524]">OpenDyslexic (Readable)</option>
                                <option value="mono" className="bg-white dark:bg-[#0c1524]">Monospace (Code-focused)</option>
                                <option value="sans" className="bg-white dark:bg-[#0c1524]">Sans-Serif (Default)</option>
                              </select>
                            </div>

                            {/* UI Sound effects */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl">
                              <div className="space-y-0.5 text-left">
                                <div className="text-xs font-extrabold flex items-center gap-1.5">
                                  <Volume2 className="w-4 h-4 text-cyan-400" />
                                  <span>Interface Sound effects</span>
                                </div>
                                <p className="text-[10px] text-slate-400 max-w-[180px]">Play synthesised chimes upon button interactions.</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={(e) => {
                                  setSoundEnabled(e.target.checked);
                                  // Wait, if enabling play sound to confirm
                                  if (e.target.checked) {
                                    setTimeout(() => {
                                      try {
                                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                        const osc = ctx.createOscillator();
                                        osc.connect(ctx.destination);
                                        osc.start();
                                        osc.stop(ctx.currentTime + 0.05);
                                      } catch {}
                                    }, 100);
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-transparent accent-[#1A9FFF] cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Font Scaling slider */}
                          <div className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 text-left">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4 text-blue-400" />
                                <span>Text Size Scale</span>
                              </span>
                              <span className="bg-[#1A9FFF]/10 text-[#1A9FFF] px-2 py-0.5 rounded-full font-mono text-[10px]">{fontSizeScale}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.85"
                              max="1.25"
                              step="0.05"
                              value={fontSizeScale}
                              onChange={(e) => setFontSizeScale(parseFloat(e.target.value))}
                              className="w-full accent-[#1A9FFF] bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                              <span>0.85x Compact</span>
                              <span>1.0x Normal</span>
                              <span>1.25x Accessible</span>
                            </div>
                          </div>

                          {/* Glassmorphic intensity */}
                          <div className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 text-left">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Settings className="w-4 h-4 text-emerald-400" />
                                <span>Glassmorphic Backdrop Opacity</span>
                              </span>
                              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-mono text-[10px]">{glassOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="90"
                              step="5"
                              value={glassOpacity}
                              onChange={(e) => setGlassOpacity(parseInt(e.target.value))}
                              className="w-full accent-[#5CDD2B] bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                              <span>20% Low Blur</span>
                              <span>60% Balanced</span>
                              <span>90% High Solid</span>
                            </div>
                          </div>

                          {/* AI speech rate */}
                          <div className="p-4 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 text-left">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="flex items-center gap-1.5">
                                <Volume2 className="w-4 h-4 text-purple-400" />
                                <span>AI Speech Speed Rate</span>
                              </span>
                              <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-mono text-[10px]">{voiceSpeechRate}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.75"
                              max="1.5"
                              step="0.25"
                              value={voiceSpeechRate}
                              onChange={(e) => setVoiceSpeechRate(parseFloat(e.target.value))}
                              className="w-full accent-purple-500 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer h-2"
                            />
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                              <span>0.75x Slow</span>
                              <span>1.0x Normal</span>
                              <span>1.5x Rapid</span>
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* Beta Feature Labs tab */}
                      {activeSubTab === 'labs' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              <span>Beta Features & Sandbox Labs</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Toggle new experimental AI algorithms and classroom visualization sandbox features.</p>
                          </div>

                          <div className="space-y-3">
                            {[
                              { state: aiVoiceMode, set: setAiVoiceMode, title: 'Real-time AI Voice Mode', desc: 'Allows direct vocal inputs inside homework doubt solver rooms.' },
                              { state: vrLabs, set: setVrLabs, title: 'Virtual 3D Chemistry Sandbox', desc: 'Generates 3D virtual molecular structures directly inside browser frames.' },
                              { state: speedReader, set: setSpeedReader, title: 'Cognitive Speed Reader', desc: 'Auto-highlights concept focus terms in explanations to assist recall.' },
                              { state: peerStudy, set: setPeerStudy, title: 'Vernacular Peer Study Rooms', desc: 'Pairs you with other active students studying similar concepts in Hinglish.' },
                              { state: focusSounds, set: setFocusSounds, title: 'Focus Soundscape Integration', desc: 'Plays custom lo-fi study background loops when discussions are active.' }
                            ].map((lab, index) => (
                              <div key={index} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition-all">
                                <div className="space-y-0.5 text-left">
                                  <div className="text-xs font-extrabold flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span>{lab.title}</span>
                                    <span className="bg-amber-500/10 text-amber-500 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">BETA</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 max-w-sm">{lab.desc}</p>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={lab.state}
                                  onChange={(e) => {
                                    lab.set(e.target.checked);
                                    playSound('toggle');
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-transparent accent-[#1A9FFF] cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>

                        </motion.div>
                      )}

                      {/* Submit Review tab */}
                      {activeSubTab === 'review' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6 text-left"
                        >
                          <div className="border-b border-slate-200 dark:border-white/5 pb-4">
                            <h3 className="text-base font-black flex items-center gap-2">
                              <Heart className="w-5 h-5 text-rose-500" />
                              <span>Submit App Review & Testimonial</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">We value your input! Share your study experience to help us improve LearnXChain.</p>
                          </div>

                          {reviewSubmitted ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                <Check className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-black">Thank you for your rating!</h4>
                              <p className="text-[10px] text-slate-500 dark:text-white/40 max-w-xs mx-auto">Your testimonial feedback has been recorded. We will use your inputs to calibrate AI updates.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewSubmitted(false);
                                  playSound('click');
                                }}
                                className="text-xs font-bold text-[#1A9FFF] hover:underline"
                              >
                                Edit Review
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-5 bg-slate-50 dark:bg-white/2 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                              {/* Star Ratings */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Your Rating</label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => {
                                        setStarRating(star);
                                        playSound('click');
                                      }}
                                      className="focus:outline-none transition-transform hover:scale-125 duration-100 cursor-pointer"
                                    >
                                      <Star
                                        className={`w-7 h-7 ${
                                          star <= starRating
                                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                            : 'text-slate-300 dark:text-neutral-600'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Review Comment Text */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Write Testimonial Details</label>
                                <textarea
                                  rows={4}
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  placeholder="What do you love most about Rit AI? E.g., 'Socratic coach helped me understand calculus proofs step-by-step in Hinglish!'"
                                  className="w-full rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/30 resize-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleReviewSubmit}
                                className="inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-xs font-bold text-white transition-all hover:opacity-90 bg-rose-500 hover:bg-rose-600 cursor-pointer shadow-md"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span>Submit Testimonial</span>
                              </button>
                            </div>
                          )}

                        </motion.div>
                      )}

                    </div>
                  </form>

                </motion.div>
              )}
            </div>
          </main>
        </div>

      {/* ── Upgrade Modal ── */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => { refreshPlan(); }}
        currentPlan={activePlan}
        educationGoal={educationGoal}
      />
    </div>
  );
}
