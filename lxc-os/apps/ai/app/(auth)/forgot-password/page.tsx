'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ArrowRight,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { lxcWebUrl } from '@/lib/lxc-api-base';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setIsSuccess(false);

    try {
      const res = await fetch(lxcWebUrl('/api/v1/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errMsg = 'Something went wrong. Please try again.';
        if (typeof data.error === 'string') {
          errMsg = data.error;
        } else if (Array.isArray(data.error)) {
          errMsg = data.error.map((err: any) => err.message).join(', ');
        }
        throw new Error(errMsg);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white flex flex-col font-sans relative transition-colors duration-300 pt-16">
      <LandingNav />

      {/* Main content wrapper */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto py-12 md:py-24">
        {/* ── Left Panel (Illustration) ── */}
        <div className="hidden lg:flex lg:w-[55%] flex-col items-center justify-center relative p-12">
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
            className="w-full max-w-[400px]"
          >
            {/* Header */}
            <div className="mb-10 text-left">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Reset{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Password
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {isSuccess
                  ? 'Check your email inbox for instructions'
                  : 'Enter your registered email and we will send you a password recovery link.'}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-[#FF7C7C]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Card */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="px-4 py-4 rounded-xl text-sm bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 text-green-600 dark:text-green-400">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold mb-1">Recovery link sent!</p>
                      <p className="opacity-90 leading-relaxed">
                        We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                    className="w-full rounded-xl py-3.5 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 bg-transparent cursor-pointer"
                  >
                    Resend Email
                  </button>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(26,159,255,0.4)]"
                    style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                  >
                    Back to Log In
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      id="forgot-email-input"
                      name="email"
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={handleChange}
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/50"
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(26,159,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(90deg, #0057C8 0%, #1A9FFF 100%)' }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-[#1A9FFF] hover:text-[#5CDD2B] transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
