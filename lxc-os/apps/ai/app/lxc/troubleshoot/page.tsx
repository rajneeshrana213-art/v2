'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Compass,
  Sparkles,
  FileText,
  Laptop,
  Wrench,
  ChevronDown,
  ArrowLeft,
  Home,
  Plus,
  Bug,
  User,
  Settings,
  CheckSquare,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  LogIn,
  GraduationCap,
  Sparkles as NewIcon,
  HelpCircle as QuestionIcon,
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

const FAQ_CATEGORIES = [
  { id: 'referrals', label: 'Referrals', icon: Users, activeColor: 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 text-slate-600 dark:text-white/60' },
  { id: 'roadmap', label: 'Roadmap', icon: Compass, activeColor: 'border-[#3b8eef] text-[#3b8eef] bg-[#3b8eef]/10 shadow-[0_0_15px_rgba(59,130,246,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-[#3b8eef]/50 hover:bg-[#3b8eef]/5 text-slate-600 dark:text-white/60' },
  { id: 'upgrade', label: 'Upgrade', icon: Sparkles, activeColor: 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-600 dark:text-white/60' },
  { id: 'notes', label: 'Notes', icon: FileText, activeColor: 'border-purple-500 text-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-600 dark:text-white/60' },
  { id: 'multi-device', label: 'Multi-Device', icon: Laptop, activeColor: 'border-blue-500 text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-600 dark:text-white/60' },
  { id: 'troubleshoot', label: 'Troubleshooting', icon: Wrench, activeColor: 'border-[#1a6fd8] text-[#1a6fd8] dark:text-[#3b8eef] bg-[#1a6fd8]/10 shadow-[0_0_15px_rgba(26,111,216,0.25)]', inactiveColor: 'border-slate-200 dark:border-white/5 hover:border-[#1a6fd8]/50 hover:bg-[#1a6fd8]/5 text-slate-600 dark:text-white/60' },
];

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'ref-1',
    category: 'referrals',
    question: 'How to get your referral link?',
    answer: (
      <ol className="list-decimal pl-5 space-y-1.5 font-medium text-left text-slate-300">
        <li>Hover over your profile avatar at the bottom-left corner of the sidebar.</li>
        <li>Click <strong>My Profile</strong> to open user settings.</li>
        <li>Open the <strong>Referral Dashboard</strong> option.</li>
        <li>Copy your unique referral URL and share it with your friends. Both of you will get referral rewards upon signup!</li>
      </ol>
    ),
  },
  {
    id: 'ref-2',
    category: 'referrals',
    question: 'When will my referral rewards credit?',
    answer: 'Referral rewards (including study experience points XP boosts and premium subscription trials) are automatically credited to your profile within 24 hours after your referred friend registers and verifies their student profile.',
  },
  {
    id: 'ref-3',
    category: 'referrals',
    question: 'Is there a limit to the number of friends I can refer?',
    answer: 'No! There is no limit. You can refer as many classmates as you want. For each verified referral, both you and your friend receive a 500 XP boost and a 7-day LXC Plus premium trial extension.',
  },
  {
    id: 'road-1',
    category: 'roadmap',
    question: 'How does the Study Roadmap adapt to my progress?',
    answer: 'The AI Roadmap companion continuously computes your subject mastery percentage based on your completed practice tests and study session durations. It automatically adjusts future modules to prioritize chapters where you have weaker comprehension scores.',
  },
  {
    id: 'road-2',
    category: 'roadmap',
    question: 'Can I change my target academic board or class level?',
    answer: (
      <p className="font-medium text-slate-300">
        Yes! Hover over the profile avatar {"\u2192"} <strong>My Profile</strong>, select your target class (6–12) and board (CBSE, ICSE, IB, or State Board), and save. The AI syllabus engine will instantly update your Daily Planner and Study Roadmap.
      </p>
    ),
  },
  {
    id: 'road-3',
    category: 'roadmap',
    question: 'What happens if I miss a daily roadmap milestone?',
    answer: 'Don\'t worry! Missing a daily study task will not reset your overall roadmap. The adaptive system will automatically redistribute the missed topics across the remaining days of your weekly study cycle.',
  },
  {
    id: 'up-1',
    category: 'upgrade',
    question: 'What premium features are unlocked in LXC Plus?',
    answer: 'LXC Plus grants full access to 22+ premium modules, including the personalized AI Classroom sessions, mock test generators, speaking coaching companion, and your digital twin dashboard.',
  },
  {
    id: 'up-2',
    category: 'upgrade',
    question: 'How do I cancel or modify my premium subscription?',
    answer: 'You can manage subscriptions by clicking your profile picture -> Account -> Billing. Click \'Cancel Subscription\' to cancel. You will keep premium access until the end of your billing cycle.',
  },
  {
    id: 'up-3',
    category: 'upgrade',
    question: 'What payment methods are supported and are they secure?',
    answer: 'We support international credit cards, debit cards, UPI, and net banking. All transactions are fully encrypted and processed through industry-standard secure gateways. We do not store credit card credentials.',
  },
  {
    id: 'note-1',
    category: 'notes',
    question: 'How to auto-generate smart notes?',
    answer: 'Open the Smart Notes page, select a subject, and click \'New Notes\'. Upload a study textbook PDF or write a brief topic prompt, and the AI will summarize the core concepts into bullet points and practice flashcards.',
  },
  {
    id: 'note-2',
    category: 'notes',
    question: 'Can I download generated notes offline?',
    answer: 'Yes! Click the download icon in the upper-right corner of the Smart Notes dashboard to export your notes as standard Markdown (.md) or PDF files.',
  },
  {
    id: 'note-3',
    category: 'notes',
    question: 'How does the offline notes sync work?',
    answer: 'Offline notes are saved directly to your browser\'s local cache. As soon as a stable internet connection is established, they are securely synced to your cloud database account.',
  },
  {
    id: 'dev-1',
    category: 'multi-device',
    question: 'Can I log in on mobile and desktop simultaneously?',
    answer: 'Absolutely! You can log in on the web portal and the Expo React Native app concurrently. Your daily streak status and XP will update instantly across both devices.',
  },
  {
    id: 'dev-2',
    category: 'multi-device',
    question: 'How do I pair the Expo mobile app with my browser?',
    answer: (
      <ol className="list-decimal pl-5 space-y-1.5 font-medium text-left text-slate-300">
        <li>On the web dashboard, hover over your profile avatar in the bottom-left sidebar.</li>
        <li>Select <strong>Account Settings</strong> {"\u2192"} <strong>Device Pairing</strong>.</li>
        <li>Open the Expo React Native mobile app and open the QR scanner.</li>
        <li>Scan the QR code shown on the desktop screen to pair instantly.</li>
      </ol>
    ),
  },
  {
    id: 'dev-3',
    category: 'multi-device',
    question: 'My daily streak is not syncing between devices',
    answer: 'Ensure both devices are logged in with the same student account and connected to the internet. Refresh the app to force a profile synchronization reload.',
  },
  {
    id: 't-1',
    category: 'troubleshoot',
    question: 'Why did my study streak reset to 0?',
    answer: 'Study streaks require completing at least one academic session every UTC calendar day. If you studied but the streak reset, check if you were offline. Click the Profile Settings -> Sync data button to re-upload offline streaks.',
  },
  {
    id: 't-2',
    category: 'troubleshoot',
    question: 'The AI classroom or doubt solver is taking too long to load',
    answer: 'High user volume can occasionally load-delay response generations. Try refreshing your page. If delays persist, check system health status or report a bug ticket in the Bugrazier dashboard.',
  },
  {
    id: 't-3',
    category: 'troubleshoot',
    question: 'Failed to upload screenshots or textbook PDFs',
    answer: 'Confirm files are under 5MB and format is JPG, PNG, or PDF. If it still fails, check browser extensions (such as ad blockers) that might block API uploads, or clear browser cache data.',
  },
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

const LANGUAGES = [
  { code: 'en', label: 'English - EN' },
  { code: 'hi', label: 'Hindi - हिंदी' },
  { code: 'pa', label: 'Punjabi - ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati - ગુજરાਤੀ' },
  { code: 'mr', label: 'Marathi - मराठी' },
  { code: 'bn', label: 'Bengali - বাংলা' },
  { code: 'ta', label: 'Tamil - தமிழ்' },
  { code: 'te', label: 'Telugu - తెలుగు' },
  { code: 'kn', label: 'Kannada - ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam - മലയാളਮ' },
  { code: 'ur', label: 'Urdu - اردو' },
];

export default function TroubleshootPage() {
  const storeAvatar = useUserProfileStore((s) => s.avatar);
  const storeNickname = useUserProfileStore((s) => s.nickname);
  const [activeCategory, setActiveCategory] = useState<string>('referrals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Sidebar and Profile setup state
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    name: '',
    class: '10',
    board: 'CBSE',
    subjects: [],
    studyHoursPerDay: 3,
    language: 'english',
  });
  const [saving, setSaving] = useState(false);

  const { status: authStatus, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    const loaded = loadStudentData();
    setData(loaded);
  }, []);

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

  useEffect(() => {
    if (data) {
      if (isAuthenticated && !data.profile) {
        setShowSetup(true);
      } else {
        setShowSetup(false);
      }
    }
  }, [isAuthenticated, data]);

  const toggleSubject = (sub: string) => {
    setProfile((p) => ({
      ...p,
      subjects: p.subjects?.includes(sub)
        ? p.subjects.filter((s) => s !== sub)
        : [...(p.subjects ?? []), sub],
    }));
  };

  const saveProfile = () => {
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

    const withBadge = unlockBadge(updated, PREDEFINED_BADGES[0]);
    saveStudentData(withBadge);
    setData(withBadge);
    setShowSetup(false);
    setSaving(false);
  };

  // Filter FAQs dynamically by search query or active category
  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === 'string' &&
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }
    return item.category === activeCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-10 bg-slate-50 dark:bg-[#060a13]">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0f1d] shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/lxc"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                Help Center <span className="text-[10px] bg-[#1a6fd8]/10 text-[#1a6fd8] dark:text-[#3b8eef] border border-[#1a6fd8]/20 px-2 py-0.5 rounded-md uppercase font-bold">Troubleshooting</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-bold">Solutions, FAQs, and step-by-step resolution guides</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/lxc/bugrazier"
              className="bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-95 transition-transform border-0"
            >
              <Bug className="w-3.5 h-3.5" />
              Report ticket
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden py-16 px-6 text-center select-none bg-linear-to-b from-white to-slate-50 dark:from-[#0a0f1d] dark:to-[#060a13]">
          {/* Glowing brand gradient circles in background */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-[#1a6fd8]/10 blur-[90px] -z-10" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-[#3b8eef]/5 blur-[100px] -z-10" />

          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
              Get the help you need
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-lg mx-auto leading-relaxed">
              Something Not Working? Reach Out To Us And We'll Sort It Out For You
            </p>

            {/* Dynamic Search Box */}
            <div className="relative max-w-lg mx-auto pt-4 group">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/3 text-slate-400 group-focus-within:text-[#1a6fd8] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search troubleshooting topics... (e.g., video, referral, roadmap)"
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-[#1a6fd8]/50 focus:shadow-[0_0_20px_rgba(26,111,216,0.15)] transition-all font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/3 text-xs text-slate-500 hover:text-white cursor-pointer font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Categories Section */}
        <div className="max-w-4xl mx-auto px-6 w-full space-y-8">
          {searchQuery.trim() === '' && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
              {FAQ_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setExpandedFAQ(null);
                    }}
                    className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive ? cat.activeColor : cat.inactiveColor
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 mb-3">
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-xs font-black tracking-wider uppercase">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Accordion FAQ Area */}
          <div className="space-y-4.5">
            <h3 className="text-xs font-black text-slate-550 dark:text-white/40 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2.5">
              {searchQuery.trim() !== '' ? 'Search Results' : `${activeCategory} FAQs`}
            </h3>

            {filteredFAQs.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-bold bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-white/5 rounded-2xl">
                No matching help articles found. Try another search query, or log a ticket in Bugrazier.
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredFAQs.map((faq) => {
                  const isExpanded = expandedFAQ === faq.id;
                  const catMeta = FAQ_CATEGORIES.find((c) => c.id === faq.category);

                  return (
                    <div
                      key={faq.id}
                      className="bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-white/1 transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                            faq.category === 'referrals'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                              : faq.category === 'roadmap'
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                                : faq.category === 'upgrade'
                                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                  : faq.category === 'notes'
                                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                                    : faq.category === 'multi-device'
                                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                                      : 'bg-blue-50 dark:bg-[#1a6fd8]/10 text-[#1a6fd8] dark:text-[#3b8eef] border border-blue-200 dark:border-[#1a6fd8]/20'
                          }`}>
                            {catMeta?.label || faq.category}
                          </span>
                          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-200">{faq.question}</span>
                        </div>
                        <ChevronDown
                          className={`w-4.5 h-4.5 text-slate-550 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-[#1a6fd8] dark:text-[#3b8eef]' : ''
                          }`}
                        />
                      </button>

                      {/* Expandable Panel */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isExpanded ? 'grid-rows-[1fr] border-t border-slate-200 dark:border-white/5' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 text-sm text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0c1221]/50 font-medium">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Setup Profile Modal (copied for sidebar functional integrity) */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0c1524] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#1a6fd8] to-[#3b8eef] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Complete Your Growth OS Setup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm mx-auto">
                Select your academic profile details to enable personalized study roadmaps and AI companion modules.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] placeholder-slate-400 dark:placeholder-slate-600 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Board</label>
                  <select
                    value={profile.board || 'CBSE'}
                    onChange={(e) => setProfile({ ...profile, board: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b} className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white">{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Class Level</label>
                  <select
                    value={profile.class || '10'}
                    onChange={(e) => setProfile({ ...profile, class: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-[#0c1524] text-slate-900 dark:text-white">Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Study Goal (Hours/Day)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={profile.studyHoursPerDay || 3}
                    onChange={(e) => setProfile({ ...profile, studyHoursPerDay: parseInt(e.target.value) || 3 })}
                    className="w-full bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1a6fd8] font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Subjects of Study</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-[#070c16] border border-slate-200 dark:border-white/10 rounded-xl scrollbar-thin">
                  {SUBJECTS_CBSE.map((sub) => {
                    const isSelected = profile.subjects?.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/40 text-[#1a6fd8] dark:text-[#3b8eef]'
                            : 'bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving || !profile.name || !profile.subjects?.length}
              className="w-full py-3 rounded-xl bg-linear-to-r from-[#1a6fd8] to-[#3b8eef] text-white text-xs font-black hover:opacity-95 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center cursor-pointer"
            >
              {saving ? 'Saving details...' : 'Initialize Growth OS Dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
