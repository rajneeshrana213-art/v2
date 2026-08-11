'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { lxcWebUrl } from '@/lib/lxc-api-base';
import { GOAL_PLAN_MAP, type PlanKey } from '@/lib/lxc/module-access';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Zap,
  Check,
  Compass
} from 'lucide-react';

const CATEGORY_DETAILS = {
  school: {
    label: 'School Student',
    icon: GraduationCap,
    color: '#1A9FFF',
    desc: 'Calibrated for classes 6–12. Mapped doubts solver, home assignments help, and Socratic coach assistance.',
    planName: 'IGNITE PLUS',
    price: '₹49',
    features: [
      'Unlimited Homework doubt chats',
      'NCERT & State Board Roadmaps',
      'Step-by-step Socratic teaching',
      'Weekly Quiz Challenge access'
    ]
  },
  college: {
    label: 'College / Career',
    icon: Building2,
    color: '#5CDD2B',
    desc: 'Calibrated for UG/PG developers. DSA playgrounds, career engine, resume builders, and job prep modules.',
    planName: 'ZENITH PRO',
    price: '₹99',
    features: [
      'Unlimited AI coding review & chats',
      'ATS-Optimized Resume Builder',
      'AI mock interview simulators',
      'DSA concept visual playgrounds'
    ]
  },
  competitive: {
    label: 'Competitive Exams',
    icon: Sparkles,
    color: '#FBBF24',
    desc: 'Calibrated for JEE, NEET, UPSC, GATE prep. Chronological syllabus tracking, time-boxed tests, and error logs.',
    planName: 'APEX ELITE',
    price: '₹149',
    features: [
      'JEE / NEET / UPSC syllabus planner',
      'Timed full-length practice tests',
      'Comprehension gap analytics log',
      'Priority expert AI tutor engine'
    ]
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Onboarding Step: 1 = Choose Category, 2 = Form, 3 = Recommended Plan (rendered on success)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<'school' | 'college' | 'competitive'>('school');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSelectPlan = async (planType: 'free' | 'premium') => {
    setIsSubmitting(true);
    setError('');
    try {
      const recommendedPlan = GOAL_PLAN_MAP[selectedCategory] as PlanKey;
      const extraRaw = localStorage.getItem('lxc-profile-extra') || '{}';
      const extra = JSON.parse(extraRaw);
      extra.educationGoal = selectedCategory;
      delete extra.activePlan;
      localStorage.setItem('lxc-profile-extra', JSON.stringify(extra));

      if (planType === 'premium') {
        localStorage.setItem('lxc_pending_upgrade_plan', recommendedPlan);
      } else {
        localStorage.removeItem('lxc_pending_upgrade_plan');
      }

      await login(formData.email.trim(), formData.password.trim());
      router.push('/lxc');
    } catch (err: any) {
      setError(err?.message || 'Auto-login failed. Please sign in manually.');
      router.push('/login');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Synth alerts
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      // AudioContext blocked
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleCategorySelect = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    playSound('toggle');
  };

  const handleNextStep = () => {
    playSound('click');
    setStep(2);
  };

  const handlePrevStep = () => {
    playSound('click');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Register via backend endpoint passing educationLevel
      const res = await fetch(lxcWebUrl('/api/v1/forum/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          educationLevel: selectedCategory
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed. Please try again.');
      }

      // Persist the selected goal locally for immediate UI continuity; plan access comes from the DB.
      try {
        const extraRaw = localStorage.getItem('lxc-profile-extra') || '{}';
        const extra = JSON.parse(extraRaw);
        extra.educationGoal = selectedCategory;
        delete extra.activePlan;
        localStorage.setItem('lxc-profile-extra', JSON.stringify(extra));
      } catch (err) {}

      playSound('success');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    'Choose prep focus',
    'Account registration details',
    'Plan recommendation summary',
  ];

  // Render Plan Recommendation on success
  if (success) {
    const details = CATEGORY_DETAILS[selectedCategory];
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white flex items-center justify-center p-6 transition-colors duration-300 overflow-y-auto relative">
        {/* Error Notification inside success block */}
        <AnimatePresence>
          {error && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-[#FF7C7C] shadow-lg"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-[#081422] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-center relative"
        >
          {/* Confetti details */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-mono font-bold text-[#5CDD2B] bg-[#5CDD2B]/10 px-3 py-1.5 rounded-full border border-[#5CDD2B]/20">
            <Check className="w-3.5 h-3.5" />
            <span>Account Registered!</span>
          </div>

          <h2 className="text-2xl font-black mb-1 text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Choose Your{' '}
            <span style={{ 
              background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              Starting Plan
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-8">
            Tailored learning path roadmaps calibrated for <b>{details.label}s</b>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Free Plan */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-slate-50 dark:bg-white/2 space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-neutral-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">STANDARD TIER</span>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">Basic Free Learner</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Core AI doubts clearance, single topic guides, and limited practice quiz assessments.</p>
                <div className="text-lg font-black pt-2">₹0 <span className="text-[10px] font-normal text-slate-400">/ Free Forever</span></div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  playSound('click');
                  handleSelectPlan('free');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Loading...' : 'Start Free Tier'}
              </button>
            </div>

            {/* Recommended Premium Plan */}
            <div className="border-2 border-[#1A9FFF] rounded-2xl p-5 bg-[#1A9FFF]/5 space-y-4 relative flex flex-col justify-between shadow-[0_0_20px_rgba(26,159,255,0.1)]">
              <div className="absolute top-4 right-4 bg-[#1A9FFF] text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">RECOMMENDED</div>
              
              <div className="space-y-2">
                <span className="bg-[#1A9FFF]/20 text-[#1A9FFF] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">PREMIUM TIER</span>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{details.planName}</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Unlimited AI chats, full curriculum exam calibrations, digital twin records, and fast responses.</p>
                
                {/* Features list */}
                <ul className="space-y-1.5 pt-2 text-[9px] text-slate-500 dark:text-neutral-400">
                  {details.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#5CDD2B] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-lg font-black pt-2 text-[#1A9FFF]">{details.price} <span className="text-[10px] font-normal text-slate-400">/ Month</span></div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  playSound('success');
                  handleSelectPlan('premium');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-white transition-all hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
              >
                {isSubmitting ? 'Subscribing...' : `Select ${details.planName}`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white overflow-hidden relative flex transition-colors duration-300">
      {/* ── Background Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[140px] opacity-15 dark:opacity-25"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full blur-[120px] opacity-15 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, #5CDD2B 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 relative z-10 border-r border-slate-200 dark:border-white/5">
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0057C8]/20 dark:bg-[#0057C8]/40 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
            <img src="/logo.svg" alt="Rit AI Logo" className="relative w-11 h-11 rounded-2xl" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Rit{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI
            </span>
          </span>
        </Link>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-mono tracking-widest uppercase mb-4 text-[#5CDD2B]">
              ◆ Join Thousands of Learners
            </p>
            <h1
              className="text-4xl font-extrabold leading-tight mb-6"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
            >
              Start Learning{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Smarter
              </span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-white/40 font-light leading-relaxed max-w-xs">
              Get access to AI-powered classrooms that adapt to your specific learning path.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 space-y-3"
          >
            {[
              'Custom doubt solving',
              'Socratic pedagogy modes',
              'Personalized recommended pricing plans',
              'Digital twin comprehension tracking',
            ].map((stepStr, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50 dark:bg-[#5CDD2B]/10 border border-green-200 dark:border-[#5CDD2B]/30"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#5CDD2B]" />
                </div>
                <span className="text-sm text-slate-700 dark:text-white/60">{stepStr}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-slate-400 dark:text-white/20 font-mono">© 2026 LearnXChain · Rit AI Platform</p>
      </div>

      {/* ── Right Panel (Form Onboarding steps) ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] bg-white dark:bg-[#081422] dark:bg-gradient-to-br dark:from-[#0D1B2A] dark:to-[#081422]"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.svg" alt="Rit AI Logo" className="w-10 h-10 rounded-xl" />
                <span className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Rit{' '}
                  <span style={{ background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI
                  </span>
                </span>
              </Link>
            </div>

            {/* Step 1: Prep Category Selector */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                    What are you preparing for?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-white/40">Select your study profile to curate plans and classes</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'school', title: 'School Student', icon: GraduationCap, color: '#1A9FFF', detail: 'Class 6 to 12. Boards (CBSE/ICSE) roadmaps.' },
                    { id: 'college', title: 'College Student', icon: Building2, color: '#5CDD2B', detail: 'University courses, careers discovery, coding prep.' },
                    { id: 'competitive', title: 'Competitive Exams', icon: Compass, color: '#FBBF24', detail: 'JEE, NEET, UPSC, GATE preparation paths.' }
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id as any)}
                        className={`w-full p-4 rounded-2xl border text-left flex gap-4 transition-all hover:scale-[1.01] cursor-pointer ${
                          isSelected 
                            ? 'border-[#1A9FFF] bg-[#1A9FFF]/5 shadow-sm' 
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span>{cat.title}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#1A9FFF]" />}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{cat.detail}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full mt-4 rounded-full py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Main Form */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Register Details
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-white/40">Category: <span className="font-bold text-[#1A9FFF] uppercase">{selectedCategory}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-[#FF7C7C]"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 outline-none transition-all bg-slate-50 dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] dark:focus:border-[#1A9FFF]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 outline-none transition-all bg-slate-50 dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] dark:focus:border-[#1A9FFF]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-1.5 ml-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                      <input
                        id="reg-phone"
                        name="phone"
                        type="text"
                        required
                        placeholder="+91 99999 99999"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 outline-none transition-all bg-slate-50 dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] dark:focus:border-[#1A9FFF]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-1.5 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-11 pr-12 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 outline-none transition-all bg-slate-50 dark:bg-[#0c1824] border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] dark:focus:border-[#1A9FFF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-1.5 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                      <input
                        id="reg-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-11 pr-12 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 outline-none transition-all bg-slate-50 dark:bg-[#0c1824] border focus:border-[#1A9FFF]"
                        style={{
                          borderColor:
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? 'rgba(255,91,91,0.5)'
                              : 'var(--tw-border-opacity)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 rounded-full py-3.5 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #5CDD2B 0%, #1A9FFF 100%)',
                      boxShadow: '0 4px 24px rgba(92,221,43,0.25)',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            <p className="text-center text-xs text-slate-500 dark:text-white/30 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-bold transition-colors text-[#1A9FFF] hover:text-[#0057C8] dark:hover:text-[#55CFFF]">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
