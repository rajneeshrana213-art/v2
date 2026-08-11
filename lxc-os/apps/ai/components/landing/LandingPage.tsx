'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  Monitor,
  LayoutTemplate,
  MessageSquare,
  Sun,
  Moon,
  TrendingDown,
  Compass,
  GraduationCap,
  Mic,
  HeartPulse,
  ShieldCheck,
  MapPin,
  Building2,
  Phone,
  BookOpen,
  LogIn,
  Home,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/hooks/use-theme';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useUserProfileStore } from '@/lib/store/user-profile';
import { LandingFooter } from './LandingFooter';

// Canvas Particle Background Component
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; vx: number; vy: number; alpha: number }[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min((canvas.parentElement?.clientWidth || window.innerWidth) / 4, 180);

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.4 + 0.2,
        });
      }
    };

    const getGradientColor = (ratio: number, alpha: number) => {
      if (ratio < 0.5) {
        const r2 = ratio * 2;
        const r = Math.round(0 + (26 - 0) * r2);
        const g = Math.round(87 + (159 - 87) * r2);
        const b = Math.round(200 + (255 - 200) * r2);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        const r2 = (ratio - 0.5) * 2;
        const r = Math.round(26 + (92 - 26) * r2);
        const g = Math.round(159 + (221 - 159) * r2);
        const b = Math.round(255 + (43 - 255) * r2);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');

      particles.forEach((p, i) => {
        // Free float movement
        p.x += p.vx;
        p.y += p.vy;

        // Interactive mouse repel
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Screen boundary wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const ratio = Math.max(0, Math.min(1, p.x / canvas.width));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = getGradientColor(ratio, p.alpha);
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            const lineAlpha = (1.0 - cdist / 85) * (isDark ? 0.08 : 0.15) * p.alpha;
            ctx.strokeStyle = getGradientColor(ratio, lineAlpha);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
}

const founderSlides = [
  {
    image: '/assets/founder_3.jpg',
    name: 'Rajneesh Rana',
    role: 'Founder & CEO'
  },
  {
    image: '/assets/founder_4.jpg',
    name: 'Aryan Sharma',
    role: 'Co-Founder & CTO'
  }
];

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { user, status: authStatus, logout } = useAuth();
  const isAuthenticated = authStatus === 'authenticated';
  const [themeOpen, setThemeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authUrls, setAuthUrls] = useState({ login: '/login', register: '/register' });
  const [activeTab, setActiveTab] = useState<'workspace' | 'tour'>('workspace');
  const [faqExpanded, setFaqExpanded] = useState<Record<string, boolean>>({
    faq1: false,
    faq2: false,
    practice1: false,
  });

  const toggleFaq = (key: string) => {
    setFaqExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom premium navigation states
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Auto-cycling board prep state
  const [activeBoardTab, setActiveBoardTab] = useState<'CBSE' | 'ICSE' | 'UP' | 'JEE'>('CBSE');

  // Auto-cycling founder images
  const [activeFounderSlide, setActiveFounderSlide] = useState(0);

  // FAQ section state
  const [activeFaqCategory, setActiveFaqCategory] = useState('Getting Started');
  const [expandedFaqItem, setExpandedFaqItem] = useState<string | null>('faq-0-0');
  const toggleFaqItem = (id: string) => setExpandedFaqItem(prev => prev === id ? null : id);

  const faqData: Record<string, { q: string; a: string }[]> = {
    'Getting Started': [
      { q: 'What is Rit AI and who is it for?', a: 'Rit AI is an AI-powered learning platform for students and professionals across India. It delivers personalized learning in Hindi and English — covering DSA, career guidance, exam prep, and more.' },
      { q: 'Is Rit AI available in Hindi?', a: 'Yes! Rit AI is built first for Hindi speakers. All explanations, voice interactions, and career guidance are available in Hindi so learning feels natural, not forced.' },
      { q: 'Do I need prior coding knowledge to start?', a: "No, absolutely not. Rit AI's Adaptive Learning Engine starts from your current level — beginner or experienced developer looking to level up." },
      { q: 'Is there a free trial available?', a: 'Yes, you can start for free. Our free tier gives access to core AI features, a limited question bank, and career exploration tools — no credit card required.' },
    ],
    'Features & AI Tools': [
      { q: 'What is the Adaptive Learning Engine?', a: "It's our AI that studies how you learn — your pace, weak spots, and patterns. It generates questions and explanations tailored exactly to what you need next." },
      { q: 'How does Voice Mode work?', a: 'Voice Mode lets you speak your answers and questions instead of typing. It works on 2G connections, perfect for learners commuting or in low-bandwidth areas.' },
      { q: 'What is Career Discovery AI?', a: 'It maps your skills and interests to 500+ career paths and generates a personalized roadmap in Hindi. It shows real salary data and required skills for each path.' },
      { q: 'What is the Digital Twin feature?', a: 'Digital Twin is an AI model of your learning brain — it tracks how you think, where you get stuck, and adapts all future content accordingly.' },
    ],
    'Pricing & Plans': [
      { q: 'What plans does Rit AI offer?', a: 'We offer a Free tier, a Pro plan for individual learners, and an Enterprise plan for colleges and institutions. Visit our pricing page for current details.' },
      { q: 'Can I get a refund if I am not satisfied?', a: "Yes, we offer a 7-day money-back guarantee on all paid plans. No questions asked — if it's not right for you, we'll refund your payment in full." },
      { q: 'Are there student discounts available?', a: 'Yes! Students with a valid college email get 40% off the Pro plan. We believe cost should never be a barrier to quality education.' },
      { q: 'Can institutions get a custom plan?', a: 'Absolutely. LearnXChain offers institution-wide licensing with custom dashboards, attendance tracking, performance analytics, and WhatsApp-based parent communication.' },
    ],
    'Account & Access': [
      { q: 'Can I use Rit AI on mobile?', a: 'Yes! Rit AI works seamlessly on mobile browsers and we have a dedicated mobile app available for Android and iOS.' },
      { q: 'Can I share my account with others?', a: 'Accounts are individual — sharing violates our terms. For families or institutions needing multiple seats, please contact us for group plans.' },
      { q: 'How do I reset my password?', a: "Visit the login page and click \"Forgot Password\". We'll send a reset link to your registered email within 60 seconds." },
      { q: 'Is my data safe with Rit AI?', a: "Yes. We use AES-256 encryption, never sell your data, and comply with India's data protection guidelines. Your learning data is yours." },
    ],
    'Career Support': [
      { q: 'Does Rit AI help with placement preparation?', a: 'Yes. We offer company-specific prep paths for TCS, Infosys, Wipro, Zomato, and many more — including mock interviews, coding rounds, and HR question banks.' },
      { q: 'Are there AI mock interviews?', a: 'Yes, our AI Mock Interview feature simulates real technical and HR interviews. It gives instant feedback on your answers, tone, and confidence level.' },
      { q: 'Does Rit AI provide internship opportunities?', a: 'We partner with startups and companies to list verified internships directly in-platform. Learners who complete certification paths get priority access.' },
      { q: 'Is there a resume builder?', a: 'Yes. Our AI Resume Builder creates an ATS-optimized resume from your learning history, projects, and certifications on the platform.' },
    ],
    'Technical Support': [
      { q: 'What should I do if the app is not loading?', a: 'Clear your browser cache and try again. If the issue persists, check our status page or reach out to support@ritai.in.' },
      { q: 'Does Voice Mode work offline?', a: 'Voice Mode requires internet for AI processing. However, we cache previously viewed lessons so you can revise them offline.' },
      { q: 'Which browsers are supported?', a: 'Rit AI works best on Chrome, Firefox, Edge, and Safari (latest versions). We recommend Chrome for the best Voice Mode experience.' },
      { q: 'How do I report a bug or give feedback?', a: 'Use the feedback button inside the app or email bugs@ritai.in. We review all reports within 24 hours and ship fixes in our weekly update cycle.' },
    ],
  };

  useEffect(() => {
    const tabs: ('CBSE' | 'ICSE' | 'UP' | 'JEE')[] = ['CBSE', 'ICSE', 'UP', 'JEE'];
    const interval = setInterval(() => {
      setActiveBoardTab((prev) => {
        const nextIndex = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFounderSlide((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Hydrated user profile data
  const avatar = useUserProfileStore((s) => s.avatar);
  const nickname = useUserProfileStore((s) => s.nickname);

  useEffect(() => {
    setMounted(true);
    // Auth is now handled locally on this app — use relative paths
    setAuthUrls({
      login: '/login',
      register: '/login',
    });
  }, []);

  // Monitor scroll progress to trigger floating pill animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close logged in dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeOpen && themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, themeOpen]);

  const pricingPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      description: 'Basic AI help, 10 quizzes/day',
      features: ['Basic Adaptive Learning', 'Standard Chatbot', '10 Quizzes per day'],
      popular: false,
    },
    {
      name: 'Basic',
      price: '₹99',
      period: '/month',
      description: 'Adaptive tests, progress dashboard',
      features: ['Unlimited Quizzes', 'Progress Dashboard', 'Email Support'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹199',
      period: '/month',
      description: 'Career AI, voice mode, full analytics',
      features: ['Career Discovery AI', 'Voice-First Mode', 'Full Analytics', 'Priority Support'],
      popular: true,
    },
    {
      name: 'Elite',
      price: '₹299',
      period: '/month',
      description: 'Digital Twin, Skill Passport, Wellness AI',
      features: ['Digital Twin Model', 'Skill Passport', 'Wellness AI', '1-on-1 Mentorship'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 font-sans">

      {/* ── Background Effects ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 dark:opacity-20 transition-opacity"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-15 dark:opacity-15 transition-opacity"
          style={{ background: 'radial-gradient(circle, #5CDD2B 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full bg-transparent pointer-events-none transition-all duration-300">
        <nav className={`
          pointer-events-auto flex items-center justify-center transition-all duration-300 ease-in-out
          ${isScrolled
            ? 'mt-4 w-[90%] max-w-7xl h-14 bg-white/70 dark:bg-[#050d17]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/25 px-8 rounded-full'
            : 'w-full h-16 bg-transparent border-none rounded-none'
          }
        `}>
          <div className={`w-full flex items-center justify-between h-full ${isScrolled ? 'px-0' : 'max-w-360 px-6 sm:px-8 md:px-10 lg:px-12 mx-auto'}`}>
            {/* Logo representation */}
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
              <img
                src="/logo.svg"
                className="w-11 h-11 md:w-12 md:h-12 shrink-0 transition-transform duration-300 group-hover:scale-110"
                alt="RIT AI Logo"
              />
              <span className="hidden sm:inline text-xl md:text-2xl font-black tracking-tight bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent group-hover:from-[#0057C8] group-hover:to-[#1A9FFF] dark:group-hover:from-[#1A9FFF] dark:group-hover:to-[#55CFFF] transition-all duration-300 font-syne">
                RIT <span className="bg-linear-to-r from-[#0057C8] to-[#5CDD2B] bg-clip-text text-transparent">AI</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1.5 min-[385px]:gap-3 md:gap-7 text-xs md:text-sm font-semibold select-none">
              <Link href="/" className="group flex items-center gap-1 sm:gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
                <span className="hidden min-[385px]:inline">Home</span>
              </Link>

              <Link
                href="/lxc"
                className="group flex items-center gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
                <span className="hidden min-[385px]:inline">Plus<span className="hidden sm:inline"> Dashboard</span></span>
              </Link>
              
              {!isAuthenticated && (
                <Link href="/pricing" className="group flex items-center gap-1.5 text-slate-600 hover:text-[#0057C8] dark:text-white/70 dark:hover:text-[#1A9FFF] transition-all hover:-translate-y-[0.5px] duration-150 py-1 sm:py-1.5">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors" />
                  <span className="hidden min-[385px]:inline">Pricing</span>
                </Link>
              )}
            </div>

            {/* Actions panel */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Selector */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setThemeOpen(!themeOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-[#0057C8] dark:text-white/50 dark:hover:text-[#1A9FFF] hover:bg-slate-100 dark:hover:bg-white/5 hover:border-[#0057C8]/30 dark:hover:border-[#1A9FFF]/30 transition-all focus:outline-none"
                >
                  {mounted && theme === 'light' && <Sun className="w-4 h-4" />}
                  {mounted && theme === 'dark' && <Moon className="w-4 h-4" />}
                  {mounted && theme === 'system' && <Monitor className="w-4 h-4" />}
                  {!mounted && <div className="w-4 h-4" />}
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 min-w-35 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={() => { setTheme('light'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'light' ? 'text-[#0057C8] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button onClick={() => { setTheme('dark'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'dark' ? 'text-[#1A9FFF] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button onClick={() => { setTheme('system'); setThemeOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 ${theme === 'system' ? 'text-[#0057C8] font-semibold' : 'text-slate-600 dark:text-white/70'}`}>
                      <Monitor className="w-4 h-4" /> System
                    </button>
                  </div>
                )}
              </div>

              {!isAuthenticated ? (
                <>
                  {/* Desktop: Get Started Premium Theme Gradient Capsule Button */}
                  <Link href={authUrls.login} className="hidden md:flex">
                    <div className="relative group/btn cursor-pointer">
                      <div
                        className="absolute inset-0 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] rounded-full blur-md opacity-60 group-hover/btn:opacity-85 transition-opacity duration-300"
                      />
                      <button className="relative rounded-full px-6 py-2.5 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white font-bold text-sm tracking-wide transition-all shadow-[0_4px_12px_rgba(0,87,200,0.3)] hover:shadow-[0_6px_18px_rgba(0,87,200,0.4)] flex items-center gap-1 hover:scale-[1.03] active:scale-95 duration-200 cursor-pointer">
                        <span>Get Started</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </Link>

                  {/* Mobile: Circle Get Started Button */}
                  <Link href={authUrls.login} className="flex md:hidden">
                    <div className="relative group/btn cursor-pointer">
                      <div
                        className="absolute inset-0 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] rounded-full blur-md opacity-60 group-hover/btn:opacity-85 transition-opacity duration-300"
                      />
                      <button className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,87,200,0.3)] hover:shadow-[0_6px_18px_rgba(0,87,200,0.4)] hover:scale-[1.05] active:scale-95 duration-200 cursor-pointer">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      </button>
                    </div>
                  </Link>
                </>
              ) : (
                /* User Profile Dropdown (Member) */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-gray-800 shrink-0 shadow-sm">
                      <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-[-1]80' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full mt-2.5 right-0 w-64 bg-white/95 dark:bg-[#0c1824]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl backdrop-blur-xl p-4 flex flex-col gap-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                          Logged in as
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {nickname || user?.name || "Student"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400/70 truncate">
                          {user?.email || ""}
                        </span>
                      </div>

                      <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                      <div className="flex flex-col gap-1">
                        <Link
                          href="/lxc"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Go to Dashboard</span>
                        </Link>

                        <div className="flex items-center justify-between px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-2.5">
                            {theme === 'light' && <Sun className="w-4 h-4" />}
                            {theme === 'dark' && <Moon className="w-4 h-4" />}
                            {theme === 'system' && <Monitor className="w-4 h-4" />}
                            <span>Theme</span>
                          </span>
                          <div className="flex bg-slate-100 dark:bg-white/5 rounded-full p-0.5 border border-slate-200/50 dark:border-white/5">
                            <button
                              onClick={() => setTheme('light')}
                              className={`p-1 rounded-full transition-all ${theme === 'light' ? 'bg-white text-[#0057C8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                              title="Light"
                            >
                              <Sun className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTheme('dark')}
                              className={`p-1 rounded-full transition-all ${theme === 'dark' ? 'bg-[#050d17] text-[#1A9FFF] shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                              title="Dark"
                            >
                              <Moon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      <main className="relative z-10 pt-28 pb-20">

        {/* ── Hero Section ── */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <ParticleBackground />
          </div>

          <section className="max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 pt-12 pb-28 sm:pt-16 sm:pb-36 lg:pt-24 lg:pb-48 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Left Column: Copy & Actions */}
              <div className="text-left flex flex-col justify-center">
                {/* Brand Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-4 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-white/80 w-fit shadow-sm"
                >
                  <span>15,80,691+ Learners</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.12] mb-4 tracking-tight text-slate-900 dark:text-white font-sans"
                >
                  ONE STOP <br />
                  <span className="bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] bg-clip-text text-transparent">
                    Learning Platform
                  </span> <br />
                  For School Students
                </motion.h1>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-base sm:text-lg text-slate-500 dark:text-white/60 font-semibold leading-relaxed mb-5 max-w-xl"
                >
                  Learn concepts, practice adaptive tests, clear doubts in Hindi/English, and level up with India&apos;s first student AI Operating System.
                </motion.p>

                {/*`CTAs Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4 mb-6"
                >
                  <Link href={isAuthenticated ? '/lxc' : authUrls.register}>
                    <Button
                      className="rounded-full h-13 px-7 text-sm font-black text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                    >
                      Start Learning for Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      className="rounded-full h-13 px-7 text-sm font-black text-white bg-linear-to-r from-[#0057C8] to-[#5CDD2B] hover:from-[#004BB0] hover:to-[#50C225] border-0 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(0,87,200,0.25)] hover:shadow-[0_12px_28px_rgba(0,87,200,0.35)] cursor-pointer"
                    >
                      Explore Plus →
                    </Button>
                  </Link>
                </motion.div>

                {/* Bullets List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex flex-col gap-2.5 border-t border-slate-200/50 dark:border-white/5 pt-5"
                >
                  {[
                    { text: 'Curated Roadmap  designed for a better learning experience.', icon: <LayoutTemplate className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" /> },
                    { text: 'Detailed videos and editorials to help you master every problem.', icon: <GraduationCap className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" /> },
                    { text: 'Stay consistent with streaks and leaderboard competition.', icon: <Compass className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" /> },
                    { text: 'AI-powered instant doubt support for faster learning.', icon: <MessageSquare className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {item.icon}
                      <span className="text-sm font-semibold text-slate-600 dark:text-white/60 leading-normal">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right Column: Premium Mockup Window, Orbits & Floating Student Success Cards */}
              <div className="relative w-full flex items-center justify-center pt-8 lg:pt-0">
                {/* ── Concentric Orbit Paths (Further Compact Sizing) ── */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                  {/* Ring 1 (Inner) - Radius: 100px / sm: 160px */}
                  <div className="w-52 h-52 sm:w-80 sm:h-80 rounded-full border border-slate-200/50 dark:border-white/5 absolute" />
                  {/* Ring 2 (Middle) - Radius: 144px / sm: 240px */}
                  <div className="w-72 h-72 sm:w-120 sm:h-120 rounded-full border border-slate-200/50 dark:border-white/5 absolute" />
                  {/* Ring 3 (Outer) - Radius: 200px / sm: 310px */}
                  <div className="w-100 h-100 sm:w-155 sm:h-155 rounded-full border border-slate-200/50 dark:border-white/5 absolute" />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-full max-w-115 sm:max-w-125 h-85 sm:h-95 flex items-center justify-center"
                >
                  {/* Double layered futuristic giant volumetric glowing aura */}
                  <div className="absolute w-150 h-150 rounded-full bg-[#0057C8]/20 dark:bg-[#0057C8]/25 blur-[120px] -z-10 animate-pulse pointer-events-none" />
                  <div className="absolute w-125 h-125 rounded-full bg-[#5CDD2B]/10 dark:bg-[#5CDD2B]/12 blur-[100px] -z-10 animate-pulse pointer-events-none delay-1000" />

                  {/* ── Card 1: Backmost Fanned Card (Tilted with custom out-of-focus blur) ── */}
                  <div className="absolute w-full h-full rounded-3xl border border-slate-200/30 dark:border-white/5 bg-white/40 dark:bg-[#0c1824]/30 shadow-md -translate-y-4 -translate-x-2 scale-[0.94] pointer-events-none z-0 backdrop-blur-md rotate-12 blur-[2.5px]" />

                  {/* ── Card 2: Middle Fanned Card (Tilted with soft focus blur) ── */}
                  <div className="absolute w-full h-full rounded-3xl border border-slate-200/40 dark:border-white/10 bg-white/60 dark:bg-[#0c1824]/50 shadow-lg -translate-y-2 -translate-x-1 scale-[0.97] pointer-events-none z-5 backdrop-blur-lg rotate-12 blur-[1px]" />

                  {/* ── Browser Mock Window Player (Crisp active mockup or video tour) ── */}
                  <div className="relative w-full h-full rounded-3xl border border-slate-200/80 dark:border-white/15 bg-white/85 dark:bg-[#0c1824]/85 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden backdrop-blur-2xl z-10 rotate-12">
                    {/* Header Bar with Tabs */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 select-none">
                      <div className="flex gap-1.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>

                      <div className="flex bg-slate-200/50 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/40 dark:border-white/5 mx-2">
                        <button
                          onClick={() => setActiveTab('workspace')}
                          className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${activeTab === 'workspace' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                        >
                          💻 <span className="hidden sm:inline">Active</span> Workspace
                        </button>
                        <button
                          onClick={() => setActiveTab('tour')}
                          className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${activeTab === 'tour' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                        >
                          🎥 <span className="hidden sm:inline">Interactive</span> Tour
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] uppercase tracking-wider font-extrabold hidden min-[400px]:inline">Active</span>
                      </div>
                    </div>

                    {/* Tab 1: Native high-fidelity workspace */}
                    <div className={`w-full h-[calc(100%-46px)] overflow-y-auto scrollbar-none p-5 text-left flex flex-col gap-4 select-none ${activeTab === 'workspace' ? 'block' : 'hidden'}`}>
                      {/* Problem Header Row */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                          <BookOpen className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
                          <span className="text-xs font-extrabold uppercase tracking-wider">📐 Quadratic Equation</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <Sparkles className="w-3.5 h-3.5 text-[#5CDD2B] animate-pulse" />
                          <span className="text-[10px] font-bold">AI Active</span>
                        </div>
                      </div>

                      {/* Formulas/Constraints Section */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Key Formula:</span>
                        <div className="inline-block bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl px-4 py-2">
                          <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            ax² + bx + c = 0 &nbsp;(a ≠ 0)
                          </code>
                        </div>
                      </div>

                      {/* AI Teacher Hints Section */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">AI Teacher Hints:</span>
                        <div className="flex flex-col gap-2">
                          <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-xs">
                            <span className="font-bold text-[#0057C8] dark:text-[#1A9FFF] block mb-1">Hint 1: Discriminant Method</span>
                            <span className="text-slate-600 dark:text-slate-400 leading-normal">
                              Pehle discriminant nikalein: <code className="font-mono font-bold bg-slate-200/50 dark:bg-white/10 px-1 py-0.5 rounded text-[#FF6B00]">D = b² - 4ac</code>. Yeh roots ka nature batayega.
                            </span>
                          </div>
                          <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-xs">
                            <span className="font-bold text-[#5CDD2B] block mb-1">Hint 2: Nature of Roots</span>
                            <span className="text-slate-600 dark:text-slate-400 leading-normal">
                              Agar <code className="font-mono bg-slate-200/50 dark:bg-white/10 px-1 rounded">D &gt; 0</code> real roots honge, agar <code className="font-mono bg-slate-200/50 dark:bg-white/10 px-1 rounded">D &lt; 0</code> imaginary roots honge.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doubt AI FAQs Section */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Doubt AI FAQs:</span>
                        <div className="flex flex-col gap-2">
                          {/* FAQ 1 */}
                          <div className="border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                            <button
                              onClick={() => toggleFaq('faq1')}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
                            >
                              <span>Q1: What if discriminant (D) is negative?</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${faqExpanded.faq1 ? 'rotate-180' : ''}`} />
                            </button>
                            {faqExpanded.faq1 && (
                              <div className="px-4 pb-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 leading-relaxed">
                                Agar D negative hai, toh equation ke koi real roots nahi honge. Roots imaginary honge: <code className="font-mono">x = (-b ± i√|D|) / 2a</code>.
                              </div>
                            )}
                          </div>

                          {/* FAQ 2 */}
                          <div className="border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                            <button
                              onClick={() => toggleFaq('faq2')}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
                            >
                              <span>Q2: How does the AI Note Taker save this?</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${faqExpanded.faq2 ? 'rotate-180' : ''}`} />
                            </button>
                            {faqExpanded.faq2 && (
                              <div className="px-4 pb-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 leading-relaxed">
                                AI Note Taker class ke formulas ko automatically detect karke clean revision notes generate karta hai, jise aap direct click se download kar sakte hain!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Board Practice Section */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Practice & Board Prep:</span>
                        <div className="flex flex-col gap-2">
                          <div className="border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                            <button
                              onClick={() => toggleFaq('practice1')}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
                            >
                              <span>Solve: 2x² + kx + 3 = 0 (If roots are equal)</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${faqExpanded.practice1 ? 'rotate-180' : ''}`} />
                            </button>
                            {faqExpanded.practice1 && (
                              <div className="px-4 pb-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 bg-white/30 dark:bg-black/10 leading-relaxed">
                                Equal roots ke liye, <code className="font-mono font-bold">D = 0 ⇒ b² - 4ac = 0</code>.<br />
                                Yahan <code className="font-mono">a = 2, b = k, c = 3</code>.<br />
                                <code className="font-mono">k² - 4(2)(3) = 0 ⇒ k² = 24 ⇒ k = ±2√6</code>.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab 2: Embedded Video Demo Player */}
                    <div className={`w-full h-[calc(100%-46px)] bg-transparent ${activeTab === 'tour' ? 'block' : 'hidden'}`}>
                      <video
                        src="/assets/student_video.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Removed bottom soft gradient mask to keep graphics completely crisp */}

                {/* ── Floating Student Success & Tech Badges Orbiting Clockwise ── */}

                {/* Anusha Jha (Mid Right Orbit - Ring 3: radius 200px / sm: 310px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-20 overflow-visible [--r:200px] sm:[--r:310px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 10 }}
                    animate={{ rotate: 370 }}
                    transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -16 }}
                      animate={{ rotate: -376 }}
                      transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white dark:bg-[#0c1824] border border-slate-200/80 dark:border-white/10 shadow-xl backdrop-blur-md select-none text-left">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                            alt="Anusha Jha"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none">Anusha Jha</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold flex items-center gap-1">
                            <span>Joined</span>
                            <span className="flex items-center gap-0.5 text-[#86BC25] font-black">
                              <span className="w-1.5 h-1.5 rounded-xs bg-[#86BC25]" />
                              Deloitte.
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Rohit Sharma (Top Left Orbit - Ring 2: radius 144px / sm: 240px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-20 overflow-visible [--r:144px] sm:[--r:240px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 220 }}
                    animate={{ rotate: 580 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -226 }}
                      animate={{ rotate: -586 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white dark:bg-[#0c1824] border border-slate-200/80 dark:border-white/10 shadow-xl backdrop-blur-md select-none text-left">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                            alt="Rohit Sharma"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="pr-1.5">
                          <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none">Rohit Sharma</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold flex items-center gap-1">
                            <span>Class</span>
                            <span className="text-[#FF9900] dark:text-[#FFB300] font-black">10th</span>
                          </p>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white font-extrabold text-[9px] tracking-wide uppercase shadow-sm">
                          Run
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Kushagra Sahay (Bottom Left Orbit - Ring 3: radius 200px / sm: 310px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-20 overflow-visible [--r:200px] sm:[--r:310px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 140 }}
                    animate={{ rotate: 500 }}
                    transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -146 }}
                      animate={{ rotate: -506 }}
                      transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white dark:bg-[#0c1824] border border-slate-200/80 dark:border-white/10 shadow-xl backdrop-blur-md select-none text-left">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 dark:border-white/10 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face"
                            alt="Ritu  Sahay"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none">Kushagra Sahay</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold flex items-center gap-1">
                            <span>Joined</span>
                            <span className="flex items-center gap-0.5 text-[#0077B5] dark:text-[#00A0DC] font-black">
                              <span className="w-1.5 h-1.5 rounded-xs bg-[#0077B5] dark:bg-[#00A0DC]" />
                              LinkedIn
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* JS Badge (Mid Left Orbit - Ring 2: radius 144px / sm: 240px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-5 overflow-visible [--r:144px] sm:[--r:240px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 180 }}
                    animate={{ rotate: 540 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -186 }}
                      animate={{ rotate: -546 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F7DF1E] flex items-center justify-center text-[#323330] font-black text-xs sm:text-sm shadow-[0_4px_12px_rgba(247,223,30,0.2)]">
                        JS
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Python Badge (Bottom Orbit - Ring 1: radius 100px / sm: 160px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-5 overflow-visible [--r:100px] sm:[--r:160px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 80 }}
                    animate={{ rotate: 440 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -86 }}
                      animate={{ rotate: -446 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#0c1824] border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-center p-1 sm:p-1.5">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
                          <path fill="#3776AB" d="M11.968 0C8.423 0 5.603.266 5.603.266s.21.32.21.488c0 .248-.488.489-.78.489C3.123 1.243.682 2.378.682 5.922c0 3.328 2.76 3.65 3.649 3.65h.923v1.272a2.383 2.383 0 002.384 2.383h3.585v1.077c0 .878-.456.923-1.076.923H7.078c-2.316 0-3.649 1.153-3.649 3.65 0 2.497 1.83 3.65 3.649 3.65h6.142c1.787 0 3.65-.888 3.65-3.65V15.54h-.924a2.383 2.383 0 01-2.383-2.383V9.572h3.585c.62 0 1.076-.045 1.076-.923V7.572c0-2.497-1.333-3.65-3.65-3.65h-6.142V2.65a2.384 2.384 0 00-2.383-2.384l-2.09-.266zm-2.036 1.485c.348 0 .63.282.63.63 0 .348-.282.63-.63.63a.63.63 0 01-.63-.63c0-.348.282-.63.63-.63z" />
                          <path fill="#FFD343" d="M12.032 24c3.545 0 6.365-.266 6.365-.266s-.21-.32-.21-.488c0-.248.488-.489.78-.489 1.91 0 4.351-1.135 4.351-4.679 0-3.328-2.76-3.65-3.649-3.65h-.923v-1.272a2.383 2.383 0 00-2.384-2.383h-3.585v-1.077c0-.878.456-.923 1.076-.923h3.069c2.316 0 3.649-1.153 3.649-3.65 0-2.497-1.83-3.65-3.649-3.65h-6.142c-1.787 0-3.65.888-3.65 3.65v3.743h.924a2.383 2.383 0 012.383 2.383v3.585h-3.585c-.62 0-1.076.045-1.076.923v1.077c0 2.497 1.333 3.65 3.65 3.65h6.142v1.272c0 .488.21.488.21.488s.21-.32.21-.488a2.383 2.383 0 012.383 2.384c0 .348.282.63.63.63zm2.036-1.485c-.348 0-.63-.282-.63-.63 0-.348.282-.63.63-.63.348 0 .63.282.63.63 0 .348-.282.63-.63.63z" />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Java Badge (Top Orbit - Ring 1: radius 100px / sm: 160px) */}
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center z-5 overflow-visible [--r:100px] sm:[--r:160px]">
                  <motion.div
                    className="absolute pointer-events-auto"
                    initial={{ rotate: 280 }}
                    animate={{ rotate: 640 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 0, height: 0 }}
                  >
                    <motion.div
                      className="absolute -translate-x-1/2 -translate-y-1/2 scale-[0.7] sm:scale-100 transition-transform"
                      style={{ x: 'var(--r)' }}
                      initial={{ rotate: -286 }}
                      animate={{ rotate: -646 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#0c1824] border border-slate-200/80 dark:border-white/10 shadow-lg flex items-center justify-center p-1 sm:p-1.5">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
                          <path fill="#5382A1" d="M18.89 12.34c-1.58-.69-4.22-.69-4.22-.69s2.4.08 3.52.8c2.14 1.36.93 3.86-1.13 4.25-2.28.43-5.26.17-7.85-1.15-3.23-1.66-2.58-3.86 1.4-4.83 5.48-1.32 8.78-2.6 8.78-4.86 0-3.32-6.52-3.36-9.15-2.52C8.38 3.9 6.2 5.09 6.2 6.84c0 .96.6 1.54 1.54 1.77 1.15.28 2.06.07 3.32-.23 3-.73 6.9-.53 4.46 1.52-2.14 1.8-8.24 1.83-10.74 3.75-2.4 1.84-2.14 4.54.94 6.13 3.96 2.05 10.37 2 13.16.58 2.94-1.5 1.58-6.13-.99-7.96z" />
                          <path fill="#F89820" d="M9.1 1.62c0-.9-.9-1.62-1.62-1.62-.36 0-.72.18-.72.36s.36.72.72.72c.54 0 .9.36.9.72s-.36.72-.72 1.08c-.18.18-.18.36 0 .54.18.18.36.18.54 0 .54-.54.9-1.26.9-1.8zm2.52-1.26c0-.36-.36-.72-.72-.72s-.72.36-.72.72.36.72.72.72c.36-.18.72-.36.72-.72zm1.62 2.34c0-.9-.9-1.62-1.62-1.62-.36 0-.72.18-.72.36s.36.72.72.72c.54 0 .9.36.9.72s-.36.72-.72 1.08c-.18.18-.18.36 0 .54.18.18.36.18.54 0 .54-.54.9-1.26.9-1.8zM7.3 22.8c-1.32-.42-2.28-1-2.28-1.5 0-.9 2.58-.96 4.62-1.02 2.52-.06 5.82-.12 7.02-.72 0 0-1.86.6-4.68.72-2.52.12-5.7.18-6.9.84-1.32.72-.96 1.62.96 2.04 2.82.6 7.62.06 9.72-.48 0 0-1.8.66-4.68.78-2.16.06-4.92.06-6.12-.12-1.02-.12-1.68-.36-2.64-.54z" />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* ── Community Trust & Statistics Section ── */}
        <section id="community-stats" className="relative max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-32 pt-24 pb-20 overflow-hidden flex flex-col items-center justify-center text-center">
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

        {/* ── 4-Grid Animated Feature Showcase (takeUforward Style) ── */}
        <section id="excel-showcase" className="max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-32 pt-16 relative">
          {/* Inline keyframe animations style injection */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee-vertical {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            .animate-marquee-vertical {
              animation: marquee-vertical 24s linear infinite;
            }
            .animate-marquee-vertical:hover {
              animation-play-state: paused;
            }
            @keyframes dash-flow {
              to {
                stroke-dashoffset: -30;
              }
            }
            .animate-dash-flow {
              animation: dash-flow 1.5s linear infinite;
            }
          `}} />

          {/* Heading and Subtitle */}
          <div className="text-center max-w-4xl mx-auto mb-16 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight leading-tight">
              Everything You Need to{' '}
              <span className="text-[#2563EB] dark:text-[#3b82f6]">
                Crack School & Coding Exams
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              A single platform that combines structured school curricula, real-world coding practice, and instant AI tutoring so you can master science, math, and code with confidence.
            </p>
          </div>

          {/* 4-Grid Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* Grid 1: Board-Specific Prep (Auto-Cycling State) */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#0d1b2a]/30 backdrop-blur-xl shadow-sm flex flex-col justify-between h-112.5">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FF5A00]">BOARD-SPECIFIC CURRICULUM</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2 mb-3">Target Your Board & Olympiads</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Practice questions curated specifically for your syllabus. Switch boards or let the AI auto-adapt to keep you prepared for school exams.
                </p>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200/50 dark:border-white/5 w-fit mb-6">
                  {(['CBSE', 'ICSE', 'UP', 'JEE'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveBoardTab(tab)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeBoardTab === tab
                        ? 'bg-white dark:bg-white/10 text-[#0057C8] dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                    >
                      {tab === 'UP' ? 'UP Board' : tab === 'JEE' ? 'JEE Foundation' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus Checklists Container (Dynamic layout based on active tab) */}
              <div className="flex-1 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 p-4.5 overflow-hidden flex flex-col justify-center">
                {activeBoardTab === 'CBSE' && (
                  <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#5CDD2B]">✓</span> Quadratic Equation (Standard 10th Math)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#5CDD2B]">✓</span> Python Functions & Tuples (Class 11 IP)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#5CDD2B]">✓</span> Balanced Chemical Reactions (Class 10 Science)</div>
                  </div>
                )}
                {activeBoardTab === 'ICSE' && (
                  <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#1A9FFF]">✓</span> OOPs Concepts & Inheritance in Java (Class 10)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#1A9FFF]">✓</span> Trigonometric Identities (Class 10 Math)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#1A9FFF]">✓</span> Newton's Laws of Motion (Physics standard 9th)</div>
                  </div>
                )}
                {activeBoardTab === 'UP' && (
                  <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#FF9A00]">✓</span> द्विघात समीकरण (Math UP Board Class 10)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#FF9A00]">✓</span> प्रकाश का परावर्तन तथा अपवर्तन (Physics UP Board)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-[#FF9A00]">✓</span> Computer System Architecture & Basic Python</div>
                  </div>
                )}
                {activeBoardTab === 'JEE' && (
                  <div className="flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-purple-500">✓</span> Complex Numbers & Trigonometry (JEE Foundation)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-purple-500">✓</span> Mechanics: Kinematics & Vectors (Class 11 Physics)</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300"><span className="text-purple-500">✓</span> Basics of Chemical Bonding & Periodic Table</div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2: Personalized AI Roadmaps (Animated SVG Path) */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#0d1b2a]/30 backdrop-blur-xl shadow-sm flex flex-col justify-between h-112.5">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#1A9FFF]">AI GUIDANCE PATH</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2 mb-3">Structured Learning Roadmaps</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  No more guessing what to learn next. RIT AI traces your learning speed and guides you step-by-step from base concepts to a perfect score.
                </p>
              </div>

              {/* Animated Roadmaps SVG */}
              <div className="flex-1 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 p-6 flex items-center justify-center">
                <svg viewBox="0 0 380 180" className="w-full max-w-85 h-auto overflow-visible">
                  <defs>
                    <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1A9FFF" />
                      <stop offset="50%" stopColor="#5CDD2B" />
                      <stop offset="100%" stopColor="#FF9A00" />
                    </linearGradient>
                  </defs>

                  {/* Connecting line underlay */}
                  <path d="M 50,90 Q 140,20 230,90 T 330,90" fill="none" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-slate-800" />

                  {/* Pulsing animated indicator */}
                  <path
                    d="M 50,90 Q 140,20 230,90 T 330,90"
                    fill="none"
                    stroke="url(#glow-grad)"
                    strokeWidth="3.5"
                    strokeDasharray="12 18"
                    strokeDashoffset="0"
                    className="animate-dash-flow"
                  />

                  {/* Nodes */}
                  {[
                    { cx: 50, cy: 90, label: "Diagnostic", icon: "📋", color: "#1A9FFF" },
                    { cx: 140, cy: 45, label: "AI Roadmap", icon: "🗺️", color: "#5CDD2B" },
                    { cx: 230, cy: 90, label: "Practice", icon: "⚡", color: "#FF9A00" },
                    { cx: 330, cy: 90, label: "Perfect Score", icon: "🏆", color: "#8B5CF6" }
                  ].map((node, i) => (
                    <g key={i} className="cursor-pointer select-none">
                      <circle cx={node.cx} cy={node.cy} r="22" fill="white" className="dark:fill-[#0c1824] shadow-md border" stroke={node.color} strokeWidth="3" />
                      <text x={node.cx} y={node.cy + 4} textAnchor="middle" fontSize="14">{node.icon}</text>
                      <text x={node.cx} y={node.cy + 34} textAnchor="middle" fontSize="9" className="font-extrabold uppercase fill-slate-500 dark:fill-slate-400 tracking-wider">{node.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Grid 3: Master Coding & Syllabus (Auto-Scrolling Problem Feed) */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#0d1b2a]/30 backdrop-blur-xl shadow-sm flex flex-col justify-between h-112.5">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#5CDD2B]">PRACTICE ARCHIVE</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2 mb-3">1000+ Subject & Coding Questions</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Build strong foundations with math equations, chemical bonds, and real coding sheets that auto-scroll as new practice units unlock.
                </p>
              </div>

              {/* Scrolling Problem feed */}
              <div className="relative flex-1 h-52.5 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden p-3 flex flex-col gap-2.5">
                {/* Fade layer top & bottom */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-slate-50/90 dark:from-[#0d1b2a]/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-slate-50/90 dark:from-[#0d1b2a]/80 to-transparent z-10 pointer-events-none" />

                {/* Marquee Scroller */}
                <div className="flex flex-col gap-2.5 animate-marquee-vertical hover:animate-paused">
                  {[
                    { title: "Reverse a string in Python", difficulty: "Easy", topic: "IP Coding" },
                    { title: "Find roots of 2x² - 5x + 3 = 0", difficulty: "Medium", topic: "10th Math" },
                    { title: "Draw diagram of Human Heart & label", difficulty: "Hard", topic: "10th Biology" },
                    { title: "Balance: Fe + H₂O ➔ Fe₃O₄ + H₂", difficulty: "Medium", topic: "Science" },
                    { title: "Write a SQL query to list Student names", difficulty: "Easy", topic: "12th Database" },
                    { title: "Calculate acceleration: F = 15N, m = 3kg", difficulty: "Easy", topic: "9th Physics" },
                    // Duplicate for loop
                    { title: "Reverse a string in Python", difficulty: "Easy", topic: "IP Coding" },
                    { title: "Find roots of 2x² - 5x + 3 = 0", difficulty: "Medium", topic: "10th Math" },
                    { title: "Draw diagram of Human Heart & label", difficulty: "Hard", topic: "10th Biology" },
                    { title: "Balance: Fe + H₂O ➔ Fe₃O₄ + H₂", difficulty: "Medium", topic: "Science" },
                    { title: "Write a SQL query to list Student names", difficulty: "Easy", topic: "12th Database" },
                    { title: "Calculate acceleration: F = 15N, m = 3kg", difficulty: "Easy", topic: "9th Physics" }
                  ].map((prob, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0c1824]/60 border border-slate-200/50 dark:border-white/5 rounded-xl shadow-xs shrink-0 select-none">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-extrabold text-[#0057C8] dark:text-[#1A9FFF] tracking-wider uppercase">{prob.topic}</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{prob.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${prob.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        prob.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>{prob.difficulty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid 4: Topper logs & revision notes (Pulsing / Sliding checklist) */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#0d1b2a]/30 backdrop-blur-xl shadow-sm flex flex-col justify-between h-112.5">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FF9A00]">SHARED EXPERIENCES</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2 mb-3">Topper Notes & Study Logs</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Learn from student success. Review actual verified topper exam sheets, revision logs, and subject hacks automatically loaded to your planner.
                </p>
              </div>

              {/* Mock Student Experience Sheets */}
              <div className="flex-1 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 p-4.5 flex flex-col justify-center gap-3 overflow-hidden">
                {[
                  { title: "CBSE 10th Math Topper Notes", score: "99/100", details: "Handwritten formula booklet & quick hacks for quadratic roots.", pulse: true },
                  { title: "JEE Foundation Olympiad Path", score: "Rank 42", details: "Calculus & vector mechanics diagnostic planner logs.", pulse: false },
                  { title: "Class 12 Python Project File", score: "Full marks", details: "Sample SQL database connectivity logs with flask.", pulse: false }
                ].map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#0c1824]/60 border border-slate-200/50 dark:border-white/5 rounded-xl text-left select-none relative hover:border-[#1A9FFF]/30 transition-all">
                    {note.pulse && (
                      <span className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <span className="text-lg mt-0.5">📂</span>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <span>{note.title}</span>
                        <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] rounded text-[8px] font-black">{note.score}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{note.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Founder / Team Section (takeUforward Style) ── */}
        <section id="rit-team" className="max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-32 pt-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left Column: Copy, CTA and Social Badges */}
            <div className="text-left flex flex-col justify-start">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                <span className="text-slate-400 dark:text-slate-500 block mb-1">Building Intelligence,</span>
                <span className="text-slate-900 dark:text-white font-black block">Not Just AI</span>
              </h2>

              <div className="text-slate-600 dark:text-slate-300 space-y-3 text-sm sm:text-base mb-5 leading-relaxed font-medium font-kalam">
                <p>
                  We're the team behind <strong className="text-[#0057C8] dark:text-[#1A9FFF] font-black">Rit AI</strong>.
                </p>
                <p>
                  We believe technology should empower people, simplify learning, and unlock new opportunities for growth.
                </p>
                <p>
                  Our mission is simple: make powerful AI accessible to students, educators, businesses, and innovators everywhere.
                </p>
                <p>
                  Today, we're building intelligent solutions that help people learn faster, work smarter, and achieve more.
                </p>
              </div>

              {/* Remember Blockquote */}
              <div className="border-l-4 border-[#0057C8] dark:border-[#1A9FFF] pl-4 my-5 italic text-slate-700 dark:text-slate-300 font-medium font-kalam">
                <p className="text-xs uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF] font-bold not-italic mb-1">Remember:</p>
                <p className="text-sm sm:text-base mb-1">"You don't need perfect resources to build something meaningful."</p>
                <p className="text-sm sm:text-base">"You need vision, consistency, and the courage to begin."</p>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 leading-relaxed font-semibold font-kalam">
                Let's build the future, together. <br />
                <span className="text-[#0057C8] dark:text-[#1A9FFF] font-bold">Welcome to Rit AI. 🚀</span>
              </p>

              {/* CTA Button */}
              <div className="mb-8">
                <Link href={authUrls.login}>
                  <div className="relative group/btn cursor-pointer w-fit">
                    <div className="absolute inset-0 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] rounded-full blur-md opacity-60 group-hover/btn:opacity-85 transition-opacity duration-300" />
                    <button className="relative rounded-full px-8 py-3.5 bg-linear-to-r from-[#0057C8] to-[#1A9FFF] hover:from-[#004BB0] hover:to-[#1589E0] text-white font-bold text-base tracking-wide transition-all shadow-[0_4px_12px_rgba(0,87,200,0.3)] hover:shadow-[0_6px_18px_rgba(0,87,200,0.4)] flex items-center gap-2 hover:scale-[1.03] active:scale-95 duration-200 cursor-pointer">
                      <span>Get Started Now</span>
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                  </div>
                </Link>
              </div>

              {/* Social Channels / Stats Cards */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl w-full">
                {/* YouTube Card */}
                <a
                  href="https://youtube.com/@learnxchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-white/70 dark:bg-[#0c1824]/50 border border-slate-200/60 dark:border-white/10 shadow-xs hover:shadow-sm transition-all hover:-translate-y-0.5 duration-200 text-left flex-1"
                >
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0">
                    <img
                      src="./assets/logo.png"
                      alt="Rit AI Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1 leading-none">
                      <span>@learnxchain</span>
                      <span className="w-1 h-1 rounded-full bg-[#FF0000]" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">1M</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
                      100+ In-depth coding videos
                    </p>
                  </div>
                </a>

                {/* LinkedIn Card */}
                <a
                  href="https://linkedin.com/company/learnxchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-white/70 dark:bg-[#0c1824]/50 border border-slate-200/60 dark:border-white/10 shadow-xs hover:shadow-sm transition-all hover:-translate-y-0.5 duration-200 text-left flex-1"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                    <img
                      src="./assets/logo.svg"
                      alt="Rit AI Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1 leading-none">
                      <span>Rit AI Team</span>
                      <span className="w-1 h-1 rounded-full bg-[#0077B5]" />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">913k</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
                      Senior engineers
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Founder Image, takeUforward style */}
            <div className="relative w-full flex items-center justify-center lg:justify-end pt-12 lg:pt-0">

              {/* Image Cutout Wrapper — rounded corners, shadows, and subtle border */}
              <div className="relative w-full max-w-120 aspect-4/5 select-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/5">

                {/* Auto-cycling Founders Slides */}
                {founderSlides.map((slide, index) => {
                  const isActive = index === activeFounderSlide;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isActive ? 'opacity-100 z-0' : 'opacity-0 z-[-1] pointer-events-none'}`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.name}
                        className="w-full h-full object-cover object-top-right"
                      />
                    </div>
                  );
                })}

                {/* Left → Right dark fade: matches page background so left side bleeds into page */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(to right, #050d17 0%, transparent 55%)'
                      : 'linear-gradient(to right, #f8fafc 0%, transparent 55%)',
                  }}
                />

                {/* Bottom fade-out into page background */}
                <div className="absolute inset-x-0 bottom-0 h-28 z-10 pointer-events-none bg-linear-to-t from-slate-50 dark:from-[#050d17] to-transparent" />

              </div>
            </div>

          </div>
        </section>

        {/* ── Reviews / Testimonials Section ── */}
        <section id="reviews" className="w-full overflow-hidden mb-32 pt-8">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-14 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A9FFF]/10 border border-[#1A9FFF]/20 text-[#1A9FFF] text-xs font-semibold mb-5 tracking-wide">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              15,000+ Happy Learners
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Real Stories. Real Growth.
            </h2>
            <p className="text-slate-500 dark:text-white/50 max-w-xl mx-auto text-base">
              Students and professionals who levelled up with Rit AI &amp; LearnXChain.
            </p>
          </motion.div>

          {/* Marquee Row 1 — scrolls left */}
          <div className="relative mb-5">
            {/* Edge fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-r from-slate-50 dark:from-[#050d17] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-l from-slate-50 dark:from-[#050d17] to-transparent" />
            <div
              className="flex gap-5 w-max"
              style={{ animation: 'marquee-left 45s linear infinite' }}
            >
              {[
                { name: 'Priya Sharma', role: 'Software Engineer', company: 'Infosys', avatar: 'PS', color: '#1A9FFF', stars: 5, text: 'Rit AI ne meri preparation completely transform kar di. Hindi mein explanations itni clear hoti hain ki concepts kabhi nahi bhulaata. DSA ka डर khatam ho gaya!' },
                { name: 'Rahul Verma', role: 'Student, IIT Delhi', company: 'IIT Delhi', avatar: 'RV', color: '#5CDD2B', stars: 5, text: 'Career Discovery AI used karne ke baad mujhe pata chala ki Data Science mera field hai. 500+ career paths mein se apna dhundha — bahut acha feature hai!' },
                { name: 'Ananya Singh', role: 'Frontend Developer', company: 'Wipro', avatar: 'AS', color: '#FF9933', stars: 5, text: 'Voice mode is a game changer for me. Main commute karte waqt bhi padh sakti hoon bina screen ke. 2G pe bhi perfectly kaam karta hai!' },
                { name: 'Kiran Patel', role: 'Placement Student', company: 'NIT Surat', avatar: 'KP', color: '#FF4757', stars: 5, text: 'LearnXChain ki Adaptive Learning Engine ne exactly wahi questions diye jo mere weak areas the. Campus placement mein select ho gaya first attempt mein!' },
                { name: 'Deepak Mehta', role: 'Backend Developer', company: 'TCS', avatar: 'DM', color: '#A855F7', stars: 5, text: 'Wellness AI feature surprisingly helpful hai. Jab mai burnout feel kar raha tha, usne suggest kiya break lene ko — exactly woh cheez jo mujhe chahiye thi.' },
                { name: 'Sneha Gupta', role: 'Data Analyst', company: 'Accenture', avatar: 'SG', color: '#1A9FFF', stars: 5, text: 'Resume builder + AI mock interviews — ek hi platform pe sab kuch. 3 months mein mera package 4 LPA se 9 LPA ho gaya. Literally life changing!' },
              ].concat([
                { name: 'Priya Sharma', role: 'Software Engineer', company: 'Infosys', avatar: 'PS', color: '#1A9FFF', stars: 5, text: 'Rit AI ne meri preparation completely transform kar di. Hindi mein explanations itni clear hoti hain ki concepts kabhi nahi bhulaata. DSA ka डर khatam ho gaya!' },
                { name: 'Rahul Verma', role: 'Student, IIT Delhi', company: 'IIT Delhi', avatar: 'RV', color: '#5CDD2B', stars: 5, text: 'Career Discovery AI used karne ke baad mujhe pata chala ki Data Science mera field hai. 500+ career paths mein se apna dhundha — bahut acha feature hai!' },
                { name: 'Ananya Singh', role: 'Frontend Developer', company: 'Wipro', avatar: 'AS', color: '#FF9933', stars: 5, text: 'Voice mode is a game changer for me. Main commute karte waqt bhi padh sakti hoon bina screen ke. 2G pe bhi perfectly kaam karta hai!' },
              ]).map((r, i) => (
                <div
                  key={`r1-${i}`}
                  className="w-80 flex-shrink-0 rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white dark:bg-white/4 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${r.color}cc, ${r.color}66)` }}
                      >
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{r.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.role} · {r.company}</p>
                      </div>
                    </div>
                    {/* LinkedIn icon */}
                    <svg className="w-4 h-4 text-[#0077B5] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2.5">
                    {Array.from({ length: r.stars }).map((_, si) => (
                      <svg key={si} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Row 2 — scrolls right */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-r from-slate-50 dark:from-[#050d17] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-l from-slate-50 dark:from-[#050d17] to-transparent" />
            <div
              className="flex gap-5 w-max"
              style={{ animation: 'marquee-right 50s linear infinite' }}
            >
              {[
                { name: 'Arjun Nair', role: 'Full Stack Dev', company: 'Freelancer', avatar: 'AN', color: '#5CDD2B', stars: 5, text: 'Pehle coding seekhna ek nightmare tha. Rit AI ke saath har concept step by step samajh aaya. Ab main confidently projects deliver karta hoon clients ko.' },
                { name: 'Pooja Yadav', role: 'B.Tech CSE', company: 'VIT Vellore', avatar: 'PY', color: '#FF9933', stars: 5, text: 'Adaptive quizzes mujhe exactly wahan challenge karti hain jahan main weak hoon. 2 months mein mera DSA fundamentals rock solid ho gaya. Placement ready feel kar rahi hoon!' },
                { name: 'Mohit Sharma', role: 'Junior Developer', company: 'Zomato', avatar: 'MS', color: '#A855F7', stars: 5, text: 'LearnXChain ek complete ecosystem hai. Career guidance se lekar coding practice tak — sab ek jagah. Aur Hindi support? Best decision tha join karna!' },
                { name: 'Ritika Joshi', role: 'UI/UX Designer', company: 'Razorpay', avatar: 'RJ', color: '#FF4757', stars: 5, text: 'AI mock interviews feature ne meri confidence 10x kar di. Real interview se pehle 50+ mock sessions diye. Razorpay mein select ho gayi first attempt pe!' },
                { name: 'Suresh Kumar', role: 'DevOps Engineer', company: 'Amazon', avatar: 'SK', color: '#1A9FFF', stars: 5, text: 'Voice mode use karke daily 1 hour commute time mein padhai karna shuru kiya. 3 mahine mein AWS certification clear kar li. Rit AI genuinely game-changing hai.' },
                { name: 'Nisha Agarwal', role: 'Product Manager', company: 'Flipkart', avatar: 'NA', color: '#5CDD2B', stars: 5, text: 'Career Discovery AI ne mujhe PM role ke baare mein introduce karaya — pehle kabhi socha nahi tha. Step-by-step roadmap follow kiya, aur aaj Flipkart mein hoon!' },
              ].concat([
                { name: 'Arjun Nair', role: 'Full Stack Dev', company: 'Freelancer', avatar: 'AN', color: '#5CDD2B', stars: 5, text: 'Pehle coding seekhna ek nightmare tha. Rit AI ke saath har concept step by step samajh aaya. Ab main confidently projects deliver karta hoon clients ko.' },
                { name: 'Pooja Yadav', role: 'B.Tech CSE', company: 'VIT Vellore', avatar: 'PY', color: '#FF9933', stars: 5, text: 'Adaptive quizzes mujhe exactly wahan challenge karti hain jahan main weak hoon. 2 months mein mera DSA fundamentals rock solid ho gaya. Placement ready feel kar rahi hoon!' },
                { name: 'Mohit Sharma', role: 'Junior Developer', company: 'Zomato', avatar: 'MS', color: '#A855F7', stars: 5, text: 'LearnXChain ek complete ecosystem hai. Career guidance se lekar coding practice tak — sab ek jagah. Aur Hindi support? Best decision tha join karna!' },
              ]).map((r, i) => (
                <div
                  key={`r2-${i}`}
                  className="w-80 flex-shrink-0 rounded-2xl border border-slate-200/70 dark:border-white/8 bg-white dark:bg-white/4 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${r.color}cc, ${r.color}66)` }}
                      >
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{r.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.role} · {r.company}</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#0077B5] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className="flex gap-0.5 mb-2.5">
                    {Array.from({ length: r.stars }).map((_, si) => (
                      <svg key={si} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── FAQ Section ── */}
        <section id="faq" className="max-w-360 mx-auto px-6 sm:px-8 md:px-10 lg:px-12 mb-32">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* Left Column: Heading + Category Pills */}
            <div className="lg:w-80 shrink-0">
              <motion.h2
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold mb-10 leading-tight text-slate-900 dark:text-white"
                style={{ fontFamily: 'Syne, sans-serif' }}
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
                    className={`text-left text-sm font-medium px-4 py-2.5 rounded-full border transition-all duration-200 ${activeFaqCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
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
              <div className="divide-y divide-slate-200/80 dark:divide-white/8">
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
                        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                        aria-expanded={isOpen}
                      >
                        <span className={`text-lg font-semibold transition-colors duration-200 ${isOpen
                            ? 'text-slate-900 dark:text-white'
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
                        <p className="pb-5 text-base leading-relaxed text-slate-500 dark:text-slate-400 pr-12">
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

      </main>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
