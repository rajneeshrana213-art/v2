'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { lxcWebUrl } from '@/lib/lxc-api-base';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      setError('Reset token is missing. Please check your email link again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(lxcWebUrl('/api/v1/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errMsg = 'Failed to reset password. The link may have expired.';
        if (typeof data.error === 'string') {
          errMsg = data.error;
        } else if (Array.isArray(data.error)) {
          errMsg = data.error.map((err: any) => err.message).join(', ');
        }
        throw new Error(errMsg);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
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
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-500/10 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Password Updated!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                  Your credentials have been successfully updated. Redirecting you to the login screen...
                </p>
                <div className="h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF]"
                  />
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-10 text-left">
                  <h1 className="text-4xl font-bold mb-2 tracking-tight">
                    Set New{' '}
                    <span style={{
                      background: 'linear-gradient(90deg, #1A9FFF 0%, #5CDD2B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Password
                    </span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    Please set a strong, secure password containing at least 8 characters.
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    {/* Password input */}
                    <div className="relative">
                      <input
                        id="reset-password-input"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="New Password (min 8 chars)"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Confirm password input */}
                    <div className="relative">
                      <input
                        id="reset-confirm-password-input"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/10 focus:border-[#1A9FFF] focus:ring-1 focus:ring-[#1A9FFF]/50"
                      />
                    </div>
                  </div>

                  <button
                    id="reset-submit-btn"
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
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
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
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#1A9FFF]/30 border-t-[#1A9FFF] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
