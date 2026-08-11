'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Brain,
  Zap,
  GraduationCap,
  Building2,
  Compass,
  Check,
  ChevronRight
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { lxcWebUrl } from '@/lib/lxc-api-base';
import { GOAL_PLAN_MAP, type PlanKey } from '@/lib/lxc/module-access';

const CATEGORY_DETAILS = {
  school: {
    label: 'School Student',
    icon: GraduationCap,
    color: '#1A9FFF',
    desc: 'Classes 6–12. Mapped doubts solver, board roadmaps, and Socratic tutoring.',
    planName: 'IGNITE PLUS',
    price: '₹49',
    features: [
      'Unlimited doubts clearing chats',
      'NCERT & State Board Roadmaps',
      'Socratic coaching triggers',
      'Weekly Quiz Challenge access'
    ]
  },
  college: {
    label: 'College / Career',
    icon: Building2,
    color: '#5CDD2B',
    desc: 'UG/PG developer modules. DSA playgrounds, career engine, and resume builders.',
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
    icon: Compass,
    color: '#FBBF24',
    desc: 'JEE, NEET, UPSC, GATE. Chronological roadmaps, timed tests, and error logs.',
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

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Register steps: 1 = Choose Category, 2 = Form inputs, 3 = Plans (shown on successful signup)
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<'school' | 'college' | 'competitive'>('school');
  const [showPlans, setShowPlans] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    require('../../../assets/1.png'),
    require('../../../assets/2.png'),
    require('../../../assets/3.png'),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle SSO Google redirection parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('token');
    const ssoUser = params.get('user');

    if (ssoToken && ssoUser) {
      try {
        localStorage.setItem('@lxc_ai_token', ssoToken);
        localStorage.setItem('@lxc_ai_user', ssoUser);
        // Force full page reload to let AuthProvider re-read localStorage
        window.location.href = '/lxc';
      } catch (err) {
        console.error('Failed to save SSO credentials:', err);
        setError('Google authentication succeeded, but session could not be saved.');
      }
    }
  }, []);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/lxc');
    }
  }, [status, router]);

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setError('');
    setRegStep(1);
    setShowPlans(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleSelectPlan = async (planType: 'free' | 'premium') => {
    setIsSubmitting(true);
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
      setMode('login');
      setShowPlans(false);
      setRegStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (mode === 'register') {
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

        // Show recommended plans screen on successful register
        setShowPlans(true);
      } else {
        await login(formData.email.trim(), formData.password.trim());
        router.push('/lxc');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: <Brain className="w-5 h-5" />, label: 'AI-Powered Classrooms' },
    { icon: <Zap className="w-5 h-5" />, label: 'Instant Generation' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Multi-Agent Learning' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white flex flex-col font-sans relative transition-colors duration-300 pt-16">
      <LandingNav />

      {/* Main content wrapper */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto py-12 md:py-24">
        {/* ── Left Panel (Illustration) ── */}
        <div className="hidden lg:flex lg:w-[50%] flex-col items-center justify-center relative p-12">
          {/* The illustration slider */}
          <div className="relative w-full max-w-2xl h-[400px] flex items-center justify-center">
            <AnimatePresence>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src={slides[currentSlide]}
                  alt="Adaptive Learning Illustration"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Panel (Form) ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[480px] bg-white/60 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="mb-6 text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Rit AI
                </span>
              </h1>
            </div>

            {/* Tabs (Hidden during recommended plans step) */}
            {!showPlans && (
              <div className="flex gap-8 mb-6 border-b border-slate-200 dark:border-white/10">
                <button
                  onClick={() => handleModeSwitch('login')}
                  className={`pb-3 text-sm font-semibold px-1 border-b-2 transition-colors cursor-pointer ${mode === 'login' ? 'text-[#0057C8] dark:text-white border-[#0057C8] dark:border-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => handleModeSwitch('register')}
                  className={`pb-3 text-sm font-semibold px-1 border-b-2 transition-colors cursor-pointer ${mode === 'register' ? 'text-[#0057C8] dark:text-white border-[#0057C8] dark:border-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'}`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-[#FF7C7C]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Onboarding Step 3 Recommended Plans summary */}
            {mode === 'register' && showPlans ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Choose Your Plan</h3>
                  <p className="text-[10px] text-slate-400">Plans recommended for <b>{CATEGORY_DETAILS[selectedCategory].label}</b></p>
                </div>

                <div className="space-y-4">
                  {/* Free plan option */}
                  <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/2 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-700 dark:text-white">Basic Learner</span>
                      <span className="font-black">₹0</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Standard AI doubt solver and roadmaps.</p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSelectPlan('free')}
                      className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Choose Free Tier
                    </button>
                  </div>

                  {/* Recommended Paid plan option */}
                  <div className="border-2 border-[#1A9FFF] rounded-2xl p-4 bg-[#1A9FFF]/5 space-y-3 relative text-xs shadow-sm">
                    <span className="absolute top-3 right-3 bg-[#1A9FFF] text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase">RECOMMENDED</span>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-[#1A9FFF] tracking-wider uppercase">PREMIUM ACCESS</span>
                      <h4 className="font-extrabold text-slate-800 dark:text-white">{CATEGORY_DETAILS[selectedCategory].planName}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400">Unlimited doubts discussions, resume builder, and mock interviews.</p>
                    <div className="font-black text-sm text-[#1A9FFF]">{CATEGORY_DETAILS[selectedCategory].price} <span className="text-[9px] font-normal text-slate-400">/ mo</span></div>
                    
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSelectPlan('premium')}
                      className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold text-white transition-all hover:opacity-95 text-center shadow-md cursor-pointer"
                      style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                    >
                      Subscribe {CATEGORY_DETAILS[selectedCategory].planName}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : mode === 'register' ? (
              /* Registration Flow */
              <div>
                {/* Step 1: Prep Category Selector */}
                {regStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-400 block mb-1">What are you preparing for?</h3>
                      <p className="text-[10px] text-slate-400">Pick a profile to calibrate recommendations and roadmaps.</p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'school', title: 'School Student', icon: GraduationCap, color: '#1A9FFF', detail: 'Class 6 to 12 study and board roadmaps.' },
                        { id: 'college', title: 'College Student', icon: Building2, color: '#5CDD2B', detail: 'UG/PG developer learning paths, career engine.' },
                        { id: 'competitive', title: 'Competitive Exams', icon: Compass, color: '#FBBF24', detail: 'JEE, NEET, UPSC, GATE target syllabi.' }
                      ].map(cat => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id as any)}
                            className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-[#1A9FFF] bg-[#1A9FFF]/5' 
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                            >
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <span>{cat.title}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#1A9FFF]" />}
                              </h5>
                              <p className="text-[9px] text-slate-400 leading-normal mt-0.5">{cat.detail}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-full mt-4 rounded-xl py-3 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                    >
                      <span>Continue Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Input fields */}
                {regStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-white/10">
                      <span className="text-slate-400">Prep Focus: <b className="text-[#1A9FFF] uppercase">{selectedCategory}</b></span>
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          id="register-name"
                          name="name"
                          type="text"
                          required
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                        />
                      </div>

                      <div className="relative">
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          required
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                        />
                      </div>

                      <div className="relative">
                        <input
                          id="register-phone"
                          name="phone"
                          type="text"
                          required
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                        />
                      </div>

                      <div className="relative">
                        <input
                          id="login-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Please enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-xl pl-4 pr-12 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Toggles / back switch */}
                      <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                        <div />
                        <span>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => handleModeSwitch('login')}
                            className="text-[#1A9FFF] hover:text-[#5CDD2B] transition-colors font-medium cursor-pointer"
                          >
                            Log in
                          </button>
                        </span>
                      </div>

                      {/* Register Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 rounded-xl py-3 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
                        style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                      >
                        {isSubmitting ? 'Registering...' : 'Register Now'}
                      </button>

                      {/* Agreements Checkbox */}
                      <div className="flex items-start gap-2 pt-2">
                        <input
                          type="checkbox"
                          required
                          defaultChecked={true}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 bg-transparent accent-[#1A9FFF] cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 leading-tight text-left">
                          I have read and agree to the{' '}
                          <a href="#" className="text-[#1A9FFF] dark:text-slate-400 hover:underline transition-colors">User Agreement</a>
                          {' '}and{' '}
                          <a href="#" className="text-[#1A9FFF] dark:text-slate-400 hover:underline transition-colors">Privacy Policy</a>
                        </span>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Login Flow */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      id="login-email"
                      name="email"
                      type="text"
                      required
                      placeholder="Phone Number or Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl px-4 py-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Please enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl pl-4 pr-12 py-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-[#1A9FFF] hover:underline transition-colors font-medium"
                    >
                      Forgot Password?
                    </Link>
                    <span className="text-[11px] text-slate-500">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('register')}
                        className="text-[#1A9FFF] hover:text-[#5CDD2B] transition-colors font-medium cursor-pointer"
                      >
                        Sign up
                      </button>
                    </span>
                  </div>
                </div>

                {/* Login Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 rounded-xl py-3.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
                  style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                >
                  {isSubmitting ? 'Logging in...' : 'Log In Now'}
                </button>
              </form>
            )}

            {/* SSO Divider (Hidden during recommended plans step) */}
            {!showPlans && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/5" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-medium text-slate-500 bg-white dark:bg-[#0f0f13]">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google SSO */}
                <button
                  type="button"
                  onClick={() => {
                    const redirectUrl = `${window.location.origin}/login`;
                    window.location.href = `${lxcWebUrl('/sso-google')}?redirect_uri=${encodeURIComponent(redirectUrl)}`;
                  }}
                  className="w-full flex items-center justify-center gap-3 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 bg-transparent cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}

          </motion.div>
        </div>
      </div>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
