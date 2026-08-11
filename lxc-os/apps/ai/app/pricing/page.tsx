'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Check,
  X,
  Clock,
  ArrowRight,
  ChevronRight,
  Phone,
  MessageSquare,
  Youtube,
  Linkedin,
  Zap,
  Star,
  Brain,
  ShieldCheck,
  GraduationCap,
  Code2,
  Compass,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

/* ── Ticking Timer Implementation ── */
function CountdownTimer() {
  const [time, setTime] = useState({ hours: 12, minutes: 15, seconds: 38 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 15, seconds: 38 }; // Reset/Loop for demo
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const format = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1A9FFF] dark:text-[#5CDD2B] bg-[#1A9FFF]/10 px-2.5 py-1 rounded-full border border-[#1A9FFF]/20">
      <Clock className="w-3.5 h-3.5" />
      <span>{format(time.hours)}H : {format(time.minutes)}M : {format(time.seconds)}S</span>
    </div>
  );
}

export default function PricingPage() {
  const { status: authStatus } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';

  /* ── Interactive State ── */
  const [pricingCategory, setPricingCategory] = useState<'school' | 'college' | 'competitive' | 'enterprise'>('school');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'school' | 'coding' | 'competitive' | 'cs' | 'aptitude'>('aptitude');
  const [zenithTier, setZenithTier] = useState<'pro' | 'elite'>('pro');

  /* ── Database Plans Fetching ── */
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const getDbPrice = (dbName: string) => {
    const p = plans.find(pl => pl.name === dbName);
    if (!p) {
      console.warn(`[PricingPage] Plan ${dbName} not found in database.`);
      return 0;
    }
    return p.price;
  };

  /* ── FAQ State ── */
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('Getting Started');
  const [expandedFaqItem, setExpandedFaqItem] = useState<string | null>('faq-0-0');
  const toggleFaqItem = (id: string) => setExpandedFaqItem(prev => prev === id ? null : id);

  const faqData: Record<string, { q: string; a: string }[]> = {
    'Getting Started': [
      { q: 'What is Rit AI and who is it for?', a: 'Rit AI is an AI-powered learning platform for students and professionals across India. It delivers personalized learning in Hindi and English — covering DSA, career guidance, exam prep, and more.' },
      { q: 'Is Rit AI available in Hindi?', a: 'Yes! Rit AI is built first for Hindi speakers. All explanations, voice interactions, and career guidance are available in Hindi so learning feels natural, not forced.' },
      { q: 'Do I need prior coding knowledge to start?', a: "No, absolutely not. Rit AI's Adaptive Learning Engine starts from your current level — beginner or experienced developer looking to level up." },
      { q: 'Is there a free trial available?', a: 'Yes, you can start for free. Our free tier gives access to core AI features, a limited question bank, and career exploration tools — no credit card required.' }
    ],
    'Features & AI Tools': [
      { q: 'What is the Adaptive Learning Engine?', a: "It's our AI that studies how you learn — your pace, weak spots, and patterns. It generates questions and explanations tailored exactly to what you need next." },
      { q: 'How does Voice Mode work?', a: 'Voice Mode lets you speak your answers and questions instead of typing. It works on 2G connections, perfect for learners commuting or in low-bandwidth areas.' },
      { q: 'What is Career Discovery AI?', a: 'It maps your skills and interests to 500+ career paths and generates a personalized roadmap in Hindi. It shows real salary data and required skills for each path.' },
      { q: 'What is the Digital Twin feature?', a: 'Digital Twin is an AI model of your learning brain — it tracks how you think, where you get stuck, and adapts all future content accordingly.' }
    ],
    'Pricing & Plans': [
      { q: 'What plans does Rit AI offer?', a: 'We offer a Free tier, a Pro plan for individual learners, and an Enterprise plan for colleges and institutions. Visit our pricing page for current details.' },
      { q: 'Can I get a refund if I am not satisfied?', a: "Yes, we offer a 7-day money-back guarantee on all paid plans. No questions asked — if it's not right for you, we'll refund your payment in full." },
      { q: 'Are there student discounts available?', a: 'Yes! Students with a valid college email get 40% off the Pro plan. We believe cost should never be a barrier to quality education.' },
      { q: 'Can institutions get a custom plan?', a: 'Absolutely. LearnXChain offers institution-wide licensing with custom dashboards, attendance tracking, performance analytics, and WhatsApp-based parent communication.' }
    ],
    'Account & Access': [
      { q: 'Can I use Rit AI on mobile?', a: 'Yes! Rit AI works seamlessly on mobile browsers and we have a dedicated mobile app available for Android and iOS.' },
      { q: 'Can I share my account with others?', a: 'Accounts are individual — sharing violates our terms. For families or institutions needing multiple seats, please contact us for group plans.' },
      { q: 'How do I reset my password?', a: "Visit the login page and click \"Forgot Password\". We'll send a reset link to your registered email within 60 seconds." },
      { q: 'Is my data safe with Rit AI?', a: "Yes. We use AES-256 encryption, never sell your data, and comply with India's data protection guidelines. Your learning data is yours." }
    ],
    'Career Support': [
      { q: 'Does Rit AI help with placement preparation?', a: 'Yes. We offer company-specific prep paths for TCS, Infosys, Wipro, Zomato, and many more — including mock interviews, coding rounds, and HR question banks.' },
      { q: 'Are there AI mock interviews?', a: 'Yes, our AI Mock Interview feature simulates real technical and HR interviews. It gives instant feedback on your answers, tone, and confidence level.' },
      { q: 'Does Rit AI provide internship opportunities?', a: 'We partner with startups and companies to list verified internships directly in-platform. Learners who complete certification paths get priority access.' },
      { q: 'Is there a resume builder?', a: 'Yes. Our AI Resume Builder creates an ATS-optimized resume from your learning history, projects, and certifications on the platform.' }
    ],
    'Technical Support': [
      { q: 'What should I do if the app is not loading?', a: 'Clear your browser cache and try again. If the issue persists, check our status page or reach out to support@ritai.in.' }
    ]
  };

  /* ── Pricing Config ── */
  const pricingPlans: Record<string, any[]> = {
    school: [
      {
        name: 'IGNITE',
        badge: 'Popular',
        desc: 'Unlock school learning & basic coding',
        priceMonthly: getDbPrice('RIT_AI_SCHOOL_IGNITE'),
        priceAnnual: getDbPrice('RIT_AI_SCHOOL_IGNITE') * 10,
        glowClass: 'hover:border-blue-300 dark:hover:border-[#0057C8]/40 hover:shadow-blue-50 dark:hover:shadow-[0_0_30px_rgba(0,87,200,0.05)]',
        features: [
          { text: 'Doubt Discussion Forum Access', check: true },
          { text: 'Unlimited Chats with RIT AI', check: true },
          { text: 'NCERT Textbook Solutions', check: true },
          { text: 'Concept Slides & Video Summaries', check: true },
          { text: 'Smart Chapter Notes', check: true },
          { text: 'Weekly Class Tests', check: false },
          { text: 'AI-Generated Study Roadmap', check: false }
        ]
      },
      {
        name: 'ZENITH',
        isTiered: true,
        tiers: {
          pro: {
            badge: 'Best Value',
            desc: 'Advanced adaptive path & parent sync',
            priceMonthly: getDbPrice('RIT_AI_SCHOOL_ZENITH_PRO'),
            priceAnnual: getDbPrice('RIT_AI_SCHOOL_ZENITH_PRO') * 10,
            glowClass: 'hover:border-emerald-300 dark:hover:border-[#5CDD2B]/40 hover:shadow-emerald-50 dark:hover:shadow-[0_0_30px_rgba(92,221,43,0.05)]',
            features: [
              { text: 'Everything in IGNITE', check: true },
              { text: 'Weekly Class Tests', check: true },
              { text: 'AI-Generated Study Roadmap', check: true },
              { text: 'Parent Dashboard & SMS Sync', check: true },
              { text: 'Weakness Diagnostic Report', check: true },
              { text: 'CBSE Boards Prep Guide', check: true },
              { text: '1-on-1 AI Doubt Solver Tutor', check: false }
            ]
          },
          elite: {
            badge: 'Olympiad & NTSE',
            desc: '1-on-1 AI mentoring & elite prep',
            priceMonthly: getDbPrice('RIT_AI_SCHOOL_ZENITH_ELITE'),
            priceAnnual: getDbPrice('RIT_AI_SCHOOL_ZENITH_ELITE') * 10,
            glowClass: 'hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-purple-50 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)]',
            features: [
              { text: 'Everything in ZENITH PRO', check: true },
              { text: '1-on-1 AI Doubt Solver Tutor', check: true },
              { text: 'Olympiad & NTSE Prep Module', check: true },
              { text: 'Visual Coding for Kids Sandbox', check: true },
              { text: 'Audio Speak Mode for Offline Study', check: true },
              { text: 'Guaranteed Marks Improvement Plan', check: true }
            ]
          }
        }
      },
      {
        name: 'LIFETIME',
        badge: 'Best Value',
        desc: 'One-time payment for lifetime school access',
        priceLifetime: getDbPrice('RIT_AI_SCHOOL_LIFETIME'),
        isLifetime: true,
        glowClass: 'hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-purple-50 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] border border-purple-200 dark:border-purple-900/30',
        features: [
          { text: 'Everything in ZENITH ELITE', check: true },
          { text: 'Lifetime Updates & New Features', check: true },
          { text: '1-on-1 AI Doubt Solver Tutor', check: true },
          { text: 'Parent Dashboard & SMS Sync', check: true },
          { text: 'Olympiad & NTSE Prep Module', check: true },
          { text: 'Visual Coding Sandbox', check: true },
          { text: 'Guaranteed Marks Improvement Plan', check: true }
        ]
      }
    ],
    college: [
      {
        name: 'IGNITE',
        badge: 'Placement Core',
        desc: 'Advanced sheets & exam preparation',
        priceMonthly: getDbPrice('RIT_AI_COLLEGE_IGNITE'),
        priceAnnual: getDbPrice('RIT_AI_COLLEGE_IGNITE') * 10,
        glowClass: 'hover:border-blue-300 dark:hover:border-[#0057C8]/40 hover:shadow-blue-50 dark:hover:shadow-[0_0_30px_rgba(0,87,200,0.05)]',
        features: [
          { text: 'Basic Coding Playground', check: true },
          { text: 'Doubt Forum Access', check: true },
          { text: 'Unlimited AI Prompts', check: true },
          { text: 'CSE Core Subjects Notes', check: true },
          { text: 'Advanced DSA Sheets', check: true },
          { text: 'Mock Coding Interviews', check: false },
          { text: 'Career Path Guidance', check: false }
        ]
      },
      {
        name: 'ZENITH',
        isTiered: true,
        tiers: {
          pro: {
            badge: 'Interview Ready',
            desc: 'Real projects & mock interviews',
            priceMonthly: getDbPrice('RIT_AI_COLLEGE_ZENITH_PRO'),
            priceAnnual: getDbPrice('RIT_AI_COLLEGE_ZENITH_PRO') * 10,
            glowClass: 'hover:border-[#1A9FFF]/40 dark:hover:border-[#1A9FFF]/45 hover:shadow-[#1A9FFF]/5 dark:hover:shadow-[0_0_30px_rgba(26,159,255,0.05)]',
            features: [
              { text: 'Everything in IGNITE', check: true },
              { text: 'Mock Coding Interviews', check: true },
              { text: 'Resume Builder & Review', check: true },
              { text: 'Interactive Tech Roadmaps', check: true },
              { text: 'Full-Stack Web Dev Sandboxes', check: true },
              { text: 'System Design Preparation', check: true },
              { text: 'Off-Campus Jobs Tracker', check: false }
            ]
          },
          elite: {
            badge: 'Mentorship & Jobs',
            desc: '1-on-1 resume reviews & active referrals',
            priceMonthly: getDbPrice('RIT_AI_COLLEGE_ZENITH_ELITE'),
            priceAnnual: getDbPrice('RIT_AI_COLLEGE_ZENITH_ELITE') * 10,
            glowClass: 'hover:border-[#5CDD2B]/40 dark:hover:border-[#5CDD2B]/45 hover:shadow-[#5CDD2B]/5 dark:hover:shadow-[0_0_30px_rgba(92,221,43,0.05)]',
            features: [
              { text: 'Everything in ZENITH PRO', check: true },
              { text: 'Off-Campus Jobs Tracker', check: true },
              { text: 'AI Mock Interview Practice & Feedback', check: true },
              { text: 'Blockchain-Verified Portfolio Credentials', check: true },
              { text: 'Group Project Collaboration Hub', check: true },
              { text: '1-on-1 Professional Mentorship Sessions', check: true }
            ]
          }
        }
      },
      {
        name: 'LIFETIME',
        badge: 'Best Value',
        desc: 'One-time payment for lifetime college & coding access',
        priceLifetime: getDbPrice('RIT_AI_COLLEGE_LIFETIME'),
        isLifetime: true,
        glowClass: 'hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-purple-50 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] border border-purple-200 dark:border-purple-900/30',
        features: [
          { text: 'Everything in ZENITH ELITE', check: true },
          { text: 'Lifetime Updates & Support', check: true },
          { text: '1-on-1 Professional Mentorship Sessions', check: true },
          { text: 'Off-Campus Jobs Tracker', check: true },
          { text: 'AI Mock Interview Practice & Feedback', check: true },
          { text: 'Full-Stack Web Dev Sandboxes', check: true },
          { text: 'Blockchain-Verified Portfolio Credentials', check: true }
        ]
      }
    ],
    competitive: [
      {
        name: 'IGNITE',
        badge: 'Analytics Boost',
        desc: 'Subject tests & progress analytics',
        priceMonthly: getDbPrice('RIT_AI_COMPETITIVE_IGNITE'),
        priceAnnual: getDbPrice('RIT_AI_COMPETITIVE_IGNITE') * 10,
        glowClass: 'hover:border-blue-300 dark:hover:border-[#0057C8]/40 hover:shadow-blue-50 dark:hover:shadow-[0_0_30px_rgba(0,87,200,0.05)]',
        features: [
          { text: 'Doubt Forum Access', check: true },
          { text: 'Unlimited Doubt Resolution Chats', check: true },
          { text: 'Standard Formula Sheets', check: true },
          { text: 'Subject Mock Tests', check: true },
          { text: 'Test Performance Analytics', check: true },
          { text: 'Weak-Area Diagnostics', check: false },
          { text: 'National Mock Ranks', check: false }
        ]
      },
      {
        name: 'ZENITH',
        isTiered: true,
        tiers: {
          pro: {
            badge: 'Solver Engine',
            desc: 'Step-by-step solver & mock series',
            priceMonthly: getDbPrice('RIT_AI_COMPETITIVE_ZENITH_PRO'),
            priceAnnual: getDbPrice('RIT_AI_COMPETITIVE_ZENITH_PRO') * 10,
            glowClass: 'hover:border-[#1A9FFF]/40 dark:hover:border-[#1A9FFF]/45 hover:shadow-[#1A9FFF]/5 dark:hover:shadow-[0_0_30px_rgba(26,159,255,0.05)]',
            features: [
              { text: 'Everything in IGNITE', check: true },
              { text: 'Full Test Mock Papers', check: true },
              { text: 'Weak-Area Diagnostics', check: true },
              { text: 'Interactive Formulas Deck', check: true },
              { text: 'Multi-Step Math Solver', check: true },
              { text: 'Focus Pomodoro Coach', check: true },
              { text: 'National Mock Ranks', check: false }
            ]
          },
          elite: {
            badge: 'Rank Accelerator',
            desc: '1-on-1 review with rank mentors',
            priceMonthly: getDbPrice('RIT_AI_COMPETITIVE_ZENITH_ELITE'),
            priceAnnual: getDbPrice('RIT_AI_COMPETITIVE_ZENITH_ELITE') * 10,
            glowClass: 'hover:border-[#5CDD2B]/40 dark:hover:border-[#5CDD2B]/45 hover:shadow-[#5CDD2B]/5 dark:hover:shadow-[0_0_30px_rgba(92,221,43,0.05)]',
            features: [
              { text: 'Everything in ZENITH PRO', check: true },
              { text: 'National Mock Ranks', check: true },
              { text: '1-on-1 Mentor Review Sessions', check: true },
              { text: 'Target Rank Calculator', check: true },
              { text: 'Advanced Olympiad Problem Sets', check: true },
              { text: 'Infinite Mock Tests', check: true }
            ]
          }
        }
      },
      {
        name: 'LIFETIME',
        badge: 'Best Value',
        desc: 'One-time payment for lifetime competitive exam prep',
        priceLifetime: getDbPrice('RIT_AI_COMPETITIVE_LIFETIME'),
        isLifetime: true,
        glowClass: 'hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-purple-50 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] border border-purple-200 dark:border-purple-900/30',
        features: [
          { text: 'Everything in ZENITH ELITE', check: true },
          { text: 'Lifetime Updates & Support', check: true },
          { text: '1-on-1 Mentor Review Sessions', check: true },
          { text: 'National Mock Ranks', check: true },
          { text: 'Target Rank Calculator', check: true },
          { text: 'Advanced Olympiad Problem Sets', check: true },
          { text: 'Infinite Mock Tests', check: true }
        ]
      }
    ],
    enterprise: [
      {
        name: 'RIT AI ENTERPRISE',
        badge: 'Custom Campus Plan',
        desc: 'For schools, coaching centers, colleges & universities buying for their students.',
        priceMonthly: getDbPrice('RIT_AI_ENTERPRISE_CUSTOM'),
        priceAnnual: 0,
        isCustom: true,
        glowClass: 'hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-purple-50 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] border-2 border-purple-600/80 dark:border-purple-500/50 shadow-md shadow-purple-500/5',
        features: [
          { text: 'Unlimited Students & Branches', check: true },
          { text: 'Complete Teacher & Admin Dashboard', check: true },
          { text: 'Automatic Attendance & Progress Sync', check: true },
          { text: 'Custom Subject & Syllabus Mapping', check: true },
          { text: 'Parent WhatsApp & SMS Alerts Sync', check: true },
          { text: 'White-Label Branding & Custom Domain', check: true },
          { text: 'API & SIS ERP Integrations', check: true },
          { text: 'SLA Support & Dedicated Success Manager', check: true }
        ]
      }
    ]
  };

  /* ── Skeleton Loading View ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans selection:bg-[#1A9FFF]/30 pb-16 flex flex-col justify-between transition-colors duration-300">
        <LandingNav />
        <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-24 flex flex-col items-center justify-center relative z-10">
          {/* Blurred background skeletons */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-40 dark:opacity-20 blur-md pointer-events-none select-none -z-10 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full max-w-5xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-white dark:bg-[#0c1824]/80 p-6 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-[450px]">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-2">
                        <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-36 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10"></div>
                    </div>
                    <div className="h-10 w-28 bg-slate-200 dark:bg-white/10 rounded-lg mb-8"></div>
                    <div className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-6">
                      {[1, 2, 3, 4].map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
                          <div className="h-3 w-4/5 bg-slate-100 dark:bg-white/5 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-12 w-full bg-slate-200 dark:bg-white/10 rounded-xl mt-6"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[80px] bg-gradient-to-tr from-[#1A9FFF]/20 via-purple-500/10 to-[#5CDD2B]/10 opacity-60 dark:opacity-40 animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-md mx-auto text-center bg-white/60 dark:bg-[#0c1824]/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 px-8 py-10 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none">
            {/* Spinning/pulsing circular logo holder */}
            <div className="relative w-20 h-20 mb-6 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-white/5" />
              
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1A9FFF] border-r-purple-500 animate-spin" />
              
              {/* Inner glowing circle */}
              <div className="absolute inset-2.5 rounded-full bg-white dark:bg-[#0c1824] flex items-center justify-center shadow-md border border-slate-100 dark:border-white/5">
                <Sparkles className="w-6 h-6 text-[#1A9FFF] dark:text-[#5CDD2B] animate-pulse" />
              </div>

              {/* Orbiting particle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 rounded-full bg-[#5CDD2B] shadow-lg shadow-[#5CDD2B]/80 animate-ping" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2 bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-purple-500 bg-clip-text text-transparent">
              Securing Latest Plans
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
              Connecting to RIT AI database servers to load updated pricing models...
            </p>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  /* ── Syllabus Content Data ── */
  const syllabusData = {
    school: [
      { title: 'Class 10 CBSE Boards', desc: 'Complete Math, Science, and Social Science curriculum.', info: '15+ Topics', problems: '2200+ Practice Doubts' },
      { title: 'Class 12 Boards PCM/B', desc: 'Targeted physics, chemistry, maths, and biology prep.', info: '24+ Topics', problems: '3500+ Practice Doubts' },
      { title: 'Class 9 Science Foundation', desc: 'Prepare basic science and mathematics concepts thoroughly.', info: '10+ Topics', problems: '1200+ Practice Doubts' },
      { title: 'School Olympiads Prep', desc: 'Level up for NSTSE, IMO, and NSO with structured guides.', info: '12+ Topics', problems: '1800+ Olympiad Problems' }
    ],
    coding: [
      { title: 'DSA Mastery Course', desc: 'Basics to advanced data structures and algorithms in C++ & Java.', info: '25+ Topics', problems: '450+ Solved Challenges' },
      { title: 'Full-Stack Web Dev', desc: 'Build real-world responsive apps with HTML/CSS, React, and Node.js.', info: '18+ Topics', problems: '12+ Practical Projects' },
      { title: 'Python for AI & ML', desc: 'Master Python syntax, NumPy, Pandas, and basic neural networks.', info: '12+ Topics', problems: '80+ Coding Notebooks' },
      { title: 'SQL & Database Design', desc: 'Write optimized queries and design normalized database schemas.', info: '8+ Topics', problems: '150+ Queries Practice' }
    ],
    competitive: [
      { title: 'JEE Mathematics', desc: 'Calculus, Algebra, and Coordinate Geometry for JEE Mains & Advanced.', info: '16+ Topics', problems: '2000+ JEE Problems' },
      { title: 'JEE Physics', desc: 'Mechanics, Electrodynamics, and Modern Physics guides.', info: '18+ Topics', problems: '1500+ Hard Practice Problems' },
      { title: 'NEET Biology', desc: 'Detailed biology pathways, diagrams, and mock paper practice.', info: '22+ Topics', problems: '3000+ Biology MCQs' },
      { title: 'Olympiad Rank Booster', desc: 'Extremely advanced physics & math modules for top-tier exams.', info: '14+ Topics', problems: '1000+ Ranker Challenges' }
    ],
    cs: [
      { title: 'DBMS Fundamentals', desc: 'Transactions, indexing, ACID properties, and relational algebra.', info: '10+ Topics', problems: '200+ Interview Questions' },
      { title: 'Operating Systems', desc: 'Process scheduling, memory management, threads, and deadlocks.', info: '12+ Topics', problems: '250+ Practice Problems' },
      { title: 'Computer Networks', desc: 'TCP/IP layers, routing algorithms, DNS, and HTTP protocol suite.', info: '12+ Topics', problems: '180+ Practice Problems' },
      { title: 'System Design Basics', desc: 'Scaling, load balancers, caching, CDN, and system architecture.', info: '8+ Topics', problems: '15+ Architecture Cases' }
    ],
    aptitude: [
      { title: 'Logical Reasoning', desc: 'Improve your logical thinking, puzzles, and pattern recognition.', info: '13+ Topics', problems: '840+ Problems' },
      { title: 'Quantitative Aptitude', desc: 'Master quick maths, percentages, ratios, and placement test sums.', info: '25+ Topics', problems: '1500+ Problems' },
      { title: 'Verbal Ability', desc: 'Enhance your grammar, comprehension, and vocabulary skills.', info: '8+ Topics', problems: '480+ Problems' },
      { title: 'Mock Test Accelerator', desc: 'Practice under pressure with actual school and placement mock tests.', info: '3+ Topics', problems: '60+ Quizzes & 1500+ Questions' }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans selection:bg-[#1A9FFF]/30 selection:text-slate-900 dark:selection:text-white pb-16 transition-colors duration-300">
      <LandingNav />

      {/* ── Background Gradients ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-15 dark:opacity-20 transition-opacity"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[20%] right-[-15%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-10 dark:opacity-15 transition-opacity"
          style={{ background: 'radial-gradient(circle, #5CDD2B 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* ── SECTION 1: Hero Header ── */}
        <section className="text-center pt-10 pb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold mb-6 bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-[#1A9FFF]/25 text-[#0057C8] dark:text-[#1A9FFF] transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Pricing &amp; Plans
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-slate-900 dark:text-white"
          >
            Your Entire Study &amp; Learning Journey <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] bg-clip-text text-transparent">
              Simplified in ONE STOP
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto mb-10"
          >
            Trusted by 15 Lakh+ learners, RIT AI simplifies your school and coding preparation by bringing everything high-quality under one umbrella. It saves you the time and confusion that many students waste while hopping between multiple resources.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/" className="px-6 py-3 rounded-full text-xs font-bold bg-white dark:bg-[#1d1d21] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#28282c] transition-all flex items-center gap-1 shadow-sm">
              Try Free Preview
            </Link>
            <a href="#plans" className="px-6 py-3 rounded-full text-xs font-bold bg-linear-to-r from-[#0057C8] to-[#1A9FFF] text-white hover:opacity-90 shadow-lg shadow-[#0057C8]/20 transition-all flex items-center gap-1">
              Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </section>

        {/* ── SECTION 2: Pricing Plans Cards ── */}
        <section id="plans" className="py-12 max-w-7xl mx-auto px-4">
          {/* Audience Toggle Tabs */}
          <div className="flex justify-center mb-8 px-4">
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-full max-w-xl w-full">
              {(['school', 'college', 'competitive', 'enterprise'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPricingCategory(cat)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${pricingCategory === cat
                      ? 'bg-linear-to-r from-[#0057C8] to-[#1A9FFF] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {cat === 'school' ? '🏫 School' : cat === 'college' ? '🎓 College' : cat === 'competitive' ? '🎯 Competitive' : '🏢 Enterprise'}
                </button>
              ))}
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12 px-4 flex-wrap">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs sm:text-sm font-bold uppercase transition-colors cursor-pointer ${billingCycle === 'monthly' ? 'text-[#0057C8] dark:text-[#1A9FFF]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle billing cycle"
              className="relative w-12 h-6 rounded-full transition-colors p-1 cursor-pointer bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/5"
            >
              <div className={`w-4 h-4 rounded-full bg-[#0057C8] dark:bg-[#1A9FFF] transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`text-xs sm:text-sm font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-[#0057C8] dark:text-[#1A9FFF]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <span>Annual</span>
              <span className="text-[10px] font-extrabold text-[#5CDD2B] bg-[#5CDD2B]/10 px-2 py-0.5 rounded-full border border-[#5CDD2B]/20 animate-pulse normal-case">
                Save 2 Months
              </span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className={
            pricingPlans[pricingCategory].length === 1
              ? "flex justify-center mb-12 max-w-md sm:max-w-lg mx-auto w-full"
              : "grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12 max-w-5xl mx-auto"
          }>
            {pricingPlans[pricingCategory].map((plan) => {
              const isTiered = plan.isTiered;
              const planDetails = isTiered ? plan.tiers[zenithTier] : plan;
              const isPaid = planDetails.isLifetime ? true : planDetails.priceMonthly > 0;
              const displayPrice = planDetails.isLifetime ? planDetails.priceLifetime : (billingCycle === 'monthly' ? planDetails.priceMonthly : Math.round(planDetails.priceAnnual / 12));
              const billingPeriodText = planDetails.isLifetime ? 'one-time payment' : (billingCycle === 'monthly' ? '/mo' : '/mo');

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-3xl bg-white dark:bg-[#0c1824] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${
                    plan.name === 'ZENITH'
                      ? zenithTier === 'pro'
                        ? 'border-2 border-[#1A9FFF] shadow-md shadow-[#1A9FFF]/5 pt-10'
                        : 'border-2 border-[#5CDD2B] shadow-md shadow-[#5CDD2B]/5 pt-10'
                      : plan.name === 'CAMPUS PRO'
                        ? 'border-2 border-[#5CDD2B] shadow-md shadow-[#5CDD2B]/5'
                        : plan.name === 'LIFETIME'
                          ? 'border-2 border-purple-500/50 shadow-md shadow-purple-500/5'
                          : 'border border-slate-200 dark:border-white/5'
                  } ${planDetails.glowClass}`}
                >
                  {/* Banner badge for Zenith */}
                  {plan.name === 'ZENITH' && (
                    <div className={`w-full text-white text-center py-2 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-sm absolute top-0 left-0 ${
                      zenithTier === 'pro'
                        ? 'bg-linear-to-r from-[#0057C8] to-[#1A9FFF]'
                        : 'bg-linear-to-r from-[#0057C8] to-[#5CDD2B]'
                    }`}>
                      <Star className="w-3 h-3 fill-current animate-pulse" /> {zenithTier === 'pro' ? 'Most Popular' : 'Premium Elite'}
                    </div>
                  )}

                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            plan.name === 'LIFETIME'
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/20 dark:border-purple-800/30'
                            : plan.name === 'FREE'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : plan.name === 'IGNITE'
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                                : plan.name === 'ZENITH'
                                  ? zenithTier === 'pro'
                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                  : plan.name === 'UNIVERSITY'
                                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                                    : plan.name === 'CAMPUS PRO'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          }`}>
                            {planDetails.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">{planDetails.desc}</p>
                      </div>

                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        plan.name === 'LIFETIME'
                          ? 'bg-purple-100/50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                        : plan.name === 'FREE'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                          : plan.name === 'IGNITE' || plan.name === 'INSTITUTE LITE'
                            ? 'bg-blue-100/50 dark:bg-blue-950/30 text-[#0057C8] dark:text-[#1A9FFF]'
                            : plan.name === 'ZENITH'
                              ? zenithTier === 'pro'
                                ? 'bg-blue-100/50 dark:bg-blue-950/30 text-[#0057C8] dark:text-[#1A9FFF]'
                                : 'bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-[#5CDD2B]'
                              : plan.name === 'CAMPUS PRO'
                                ? 'bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-[#5CDD2B]'
                                : 'bg-purple-100/50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                      }`}>
                        {plan.name === 'LIFETIME'
                          ? <Sparkles className="w-4 h-4 fill-current" />
                        : plan.name === 'FREE' 
                          ? <Compass className="w-4 h-4" /> 
                          : plan.name === 'IGNITE' || plan.name === 'INSTITUTE LITE'
                            ? <Zap className="w-4 h-4 fill-current" /> 
                            : <GraduationCap className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Tier selector switcher inside Zenith */}
                    {plan.name === 'ZENITH' && (
                      <div className="flex p-1 bg-slate-100 dark:bg-[#1a1a1c] rounded-2xl border border-slate-200/50 dark:border-white/5 mb-4 w-full mt-2">
                        <button
                           onClick={() => setZenithTier('pro')}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            zenithTier === 'pro'
                              ? 'bg-[#1A9FFF] text-white shadow-sm font-bold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          PRO (₹{billingCycle === 'monthly' ? plan.tiers.pro.priceMonthly : Math.round(plan.tiers.pro.priceAnnual / 12)}/mo)
                        </button>
                        <button
                          onClick={() => setZenithTier('elite')}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            zenithTier === 'elite'
                              ? 'bg-[#5CDD2B] text-slate-950 shadow-sm font-bold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          ELITE (₹{billingCycle === 'monthly' ? plan.tiers.elite.priceMonthly : Math.round(plan.tiers.elite.priceAnnual / 12)}/mo)
                        </button>
                      </div>
                    )}

                    {/* Pricing Display */}
                    <div className="mb-6 font-sans">
                      {isPaid && billingCycle === 'annual' && !planDetails.isCustom && !planDetails.isLifetime && (
                        <p className="text-xs line-through text-slate-400 dark:text-slate-500 font-semibold mb-0.5">
                          ₹{planDetails.priceMonthly * 12}/{planDetails.isPerStudent ? 'student/yr' : 'yr'}
                        </p>
                      )}
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                          {planDetails.isCustom ? 'Contact Us' : `₹${displayPrice.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {planDetails.isCustom 
                            ? 'for pricing' 
                            : planDetails.isPerStudent 
                              ? (billingCycle === 'monthly' ? '/student/mo' : '/student/yr')
                              : billingPeriodText}
                        </span>
                      </div>

                      {isPaid && billingCycle === 'annual' && !planDetails.isCustom && !planDetails.isLifetime && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                          Billed ₹{planDetails.priceAnnual}/{planDetails.isPerStudent ? 'student/yr' : 'yr'}
                        </p>
                      )}

                      {isPaid && !planDetails.isCustom && (
                        <div className="mt-3">
                          <CountdownTimer />
                        </div>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 border-t border-slate-200 dark:border-white/5 pt-4 mb-6">
                      {planDetails.features.map((feat: { text: string; check: boolean }, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          {feat.check ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-3" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 shrink-0 mt-0.5">
                              <X className="w-2.5 h-2.5 stroke-3" />
                            </div>
                          )}
                          <span className={`text-[12px] font-medium leading-snug ${
                            feat.check
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-600 line-through'
                          }`}>
                            {feat.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Button */}
                  <Link href={planDetails.isCustom ? '/contact' : (isAuthenticated ? '/lxc' : '/login')} className="w-full mt-auto block">
                    <button className={`w-full font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer ${
                      plan.name === 'LIFETIME'
                        ? 'bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-black shadow-md shadow-purple-500/10'
                      : plan.name === 'FREE'
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white'
                        : planDetails.isCustom
                          ? 'bg-linear-to-r from-purple-600 to-[#1A9FFF] hover:opacity-90 text-white font-black shadow-md shadow-purple-500/10'
                          : plan.name === 'IGNITE'
                            ? 'bg-[#0057C8] hover:bg-[#0057C8]/90 text-white shadow-md shadow-[#0057C8]/10'
                            : zenithTier === 'pro'
                              ? 'bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:opacity-90 text-white font-black shadow-md shadow-[#0057C8]/10'
                              : 'bg-linear-to-r from-[#0057C8] to-[#5CDD2B] hover:opacity-90 text-white font-black shadow-md shadow-[#5CDD2B]/10'
                    }`}>
                      {plan.name === 'LIFETIME'
                        ? 'Get Lifetime Access'
                      : plan.name === 'FREE' 
                        ? 'Get Started' 
                        : planDetails.isCustom 
                          ? 'Talk to Sales' 
                          : 'Upgrade Now'} <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

       
        </section>

        {/* ── SECTION 3: Community Trust & Statistics Section ── */}
        <section id="community-stats" className="relative max-w-4xl mx-auto px-6 mb-32 pt-24 pb-20 overflow-hidden flex flex-col items-center justify-center text-center border-t border-slate-200 dark:border-white/5 mt-12">
          {/* Faded Background Video */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-luminosity overflow-hidden"
            style={{  
              maskImage: 'radial-gradient(circle at center, black 15%, transparent 65%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 15%, transparent 65%)'
            }}
          >
            <video
              src="/assets/student_video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-12 dark:opacity-22"
            />
          </div>

          {/* Centered Stat Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Massive Brand Theme Solid Counter */}
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 select-none text-[#2563EB] dark:text-[#3b82f6]"
            >
              15,80,691+
            </motion.h2>

            {/* Subtitle */}
            <motion.h3
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tight"
            >
              Students learning on RIT AI
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mb-10"
            >
              From school classrooms to state boards, our global community keeps growing every day. RIT AI is the go-to place for students preparing for exams and future tech skills.
            </motion.p>

            {/* Social Channels Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-8 sm:gap-12 py-3 px-8 rounded-full border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0c1824]/30 backdrop-blur-md shadow-sm"
            >
              {/* YouTube Stat */}
              <div className="flex items-center gap-3 text-left">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#FF0000] fill-current shrink-0">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-none">50k+ subscribers</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">@learnxchain</p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />

              {/* LinkedIn Stat */}
              <div className="flex items-center gap-3 text-left">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0077B5] fill-current shrink-0 rounded-xs">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-none">500k+ followers</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">LearnXChain</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 4: Everything You Need to Crack Exams (Interactive Tabs) ── */}
        <section className="py-20 border-t border-slate-200 dark:border-white/5 mt-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              Everything You Need to{' '}
              <span className="bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] bg-clip-text text-transparent">
                Crack Exams
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed">
              Unlock top-tier study assets, questions database, syllabus checklists, and mock series curated by elite educators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">

            {/* Left vertical tabs menu */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 border-r border-slate-200 dark:border-white/5 lg:pr-8">
              {[
                { id: 'school', label: 'School Syllabus', icon: <GraduationCap className="w-4.5 h-4.5" /> },
                { id: 'coding', label: 'Coding Mastery', icon: <Code2 className="w-4.5 h-4.5" /> },
                { id: 'competitive', label: 'Competitive Prep', icon: <Compass className="w-4.5 h-4.5" /> },
                { id: 'cs', label: 'CS Fundamentals', icon: <Brain className="w-4.5 h-4.5" /> },
                { id: 'aptitude', label: 'Aptitude Accelerator', icon: <Zap className="w-4.5 h-4.5" /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left text-sm font-bold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-slate-100 dark:bg-white/5 text-[#1A9FFF] shadow-sm border-l-4 border-[#1A9FFF]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <div className={isActive ? 'text-[#1A9FFF]' : 'text-slate-400 dark:text-slate-500'}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right content grids */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  {syllabusData[activeTab].map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c1824] flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 transition-colors group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-[#1A9FFF] bg-[#1A9FFF]/10 px-2 py-0.5 rounded-full border border-[#1A9FFF]/20">{item.info}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{item.problems}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-[#1A9FFF] transition-colors">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">{item.desc}</p>
                      </div>

                      <button className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer">
                        View Syllabus <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </section>

        {/* ── SECTION 5: Callback & Whatsapp Doubts Resolve ── */}
        <section className="py-12 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c1824] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0057C8]/5 blur-3xl -z-10 rounded-full" />

            <div className="max-w-2xl text-left">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">Got any doubts or interested in a plan?</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                We&apos;re just a message away! Whether you&apos;re unsure which plan suits you or want to know more, we&apos;re here to help.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
              <a href="tel:#" className="px-5 py-3 rounded-full text-xs font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1d1d21] hover:bg-slate-50 dark:hover:bg-[#28282c] text-slate-700 dark:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
                <Phone className="w-3.5 h-3.5 text-[#1A9FFF]" />
                Request for Callback
              </a>
              <a href="https://wa.me/#" target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5 text-white shrink-0 fill-current" />
                Message on Whatsapp
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── SECTION 6: FAQ Section ── */}
        <section id="faq" className="py-20 border-t border-slate-200 dark:border-white/5 mt-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* Left Column: Heading + Category Pills */}
            <div className="lg:w-80 shrink-0">
              <motion.h2
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black mb-10 leading-tight text-slate-900 dark:text-white"
              >
                Frequently<br />Asked<br />Questions
              </motion.h2>

              <div className="flex flex-col gap-2">
                {Object.keys(faqData).map((cat, i) => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    onClick={() => {
                      setActiveFaqCategory(cat);
                      setExpandedFaqItem(`faq-${Object.keys(faqData).indexOf(cat)}-0`);
                    }}
                    className={`text-left text-sm font-semibold px-4 py-2.5 rounded-full border transition-all duration-200 cursor-pointer ${activeFaqCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm font-bold'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-800 dark:hover:text-white'
                      }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right Column: Accordion */}
            <div className="flex-1 min-w-0">
              <div className="divide-y divide-slate-200 dark:divide-white/8">
                {(faqData[activeFaqCategory] ?? []).map((item, i) => {
                  const id = `faq-${Object.keys(faqData).indexOf(activeFaqCategory)}-${i}`;
                  const isOpen = expandedFaqItem === id;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => toggleFaqItem(id)}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className={`text-lg font-semibold transition-colors duration-200 ${isOpen
                            ? 'text-slate-900 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                          {item.q}
                        </span>
                        <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen
                            ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white rotate-180'
                            : 'border-slate-300 dark:border-white/20 bg-transparent'
                          }`}>
                          <svg
                            className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 pr-12 font-medium">
                          {item.a}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
