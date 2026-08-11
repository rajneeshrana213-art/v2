'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate send
    await new Promise((r) => setTimeout(r, 1400));
    setStatus('sent');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans">

      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-15"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[5%] left-[-8%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ background: 'radial-gradient(circle, #5CDD2B 0%, transparent 70%)' }}
        />
      </div>

      <LandingNav />

      <div className="relative z-10 pt-16">
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#0057C8] to-[#5CDD2B]
              flex items-center justify-center mx-auto mb-6
              shadow-[0_16px_40px_rgba(0,87,200,0.3)]"
          >
            <Phone className="w-9 h-9 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
          >
            Contact{' '}
            <span className="bg-linear-to-r from-[#0057C8] to-[#5CDD2B] bg-clip-text text-transparent">
              Us
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-slate-500 dark:text-white/50 font-semibold max-w-lg mx-auto"
          >
            We'd love to hear from you. Reach out and we'll get back to you as soon as possible.
          </motion.p>
        </section>

        {/* ── Main Content ── */}
        <section className="max-w-5xl mx-auto px-6 sm:px-10 pb-28 grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >

            {/* Info Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 flex flex-col gap-5">
              <h2 className="text-base font-black text-slate-800 dark:text-white">Get in Touch</h2>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35 mb-0.5">Email</p>
                  <a
                    href="mailto:hello@learnxchain.in"
                    className="text-sm font-semibold text-[#0057C8] dark:text-[#1A9FFF] hover:underline break-all"
                  >
                    hello@learnxchain.in
                  </a>
                  <p className="text-[11px] text-slate-400 dark:text-white/35 mt-0.5 font-medium">
                    We usually reply within 48–72 hours
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5CDD2B]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#5CDD2B]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35 mb-0.5">Phone</p>
                  <a
                    href="tel:+917015290569"
                    className="text-sm font-semibold text-slate-700 dark:text-white/80 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors"
                  >
                    +91 7015290569
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35 mb-0.5">Address</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-white/70 leading-relaxed">
                    LearnXChain Technologies Pvt. Ltd.<br />
                    Rohtak, Haryana — 124001<br />
                    India 🇮🇳
                  </p>
                </div>
              </div>

              {/* Response time */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/35 mb-0.5">Business Hours</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-white/70">
                    Mon – Sat: 10:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Refund Policy', href: '/refund-policy' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-semibold text-slate-500 dark:text-white/50 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#0057C8] dark:bg-[#1A9FFF] opacity-60" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">Send a Message</h2>
              </div>

              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#5CDD2B]/15 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#5CDD2B]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50 font-medium max-w-xs">
                    Thanks for reaching out. We'll get back to you within 48–72 hours.
                  </p>
                  <button
                    onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setStatus('idle'); }}
                    className="mt-6 text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] hover:underline"
                  >
                    Send another message →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Rajneesh Rana"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10
                          bg-slate-50 dark:bg-white/5 px-4 py-2.5
                          text-sm text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20
                          focus:outline-none focus:border-[#0057C8] dark:focus:border-[#1A9FFF]
                          focus:ring-2 focus:ring-[#0057C8]/10 dark:focus:ring-[#1A9FFF]/10
                          transition-all font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10
                          bg-slate-50 dark:bg-white/5 px-4 py-2.5
                          text-sm text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20
                          focus:outline-none focus:border-[#0057C8] dark:focus:border-[#1A9FFF]
                          focus:ring-2 focus:ring-[#0057C8]/10 dark:focus:ring-[#1A9FFF]/10
                          transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10
                        bg-slate-50 dark:bg-white/5 px-4 py-2.5
                        text-sm text-slate-800 dark:text-white
                        focus:outline-none focus:border-[#0057C8] dark:focus:border-[#1A9FFF]
                        focus:ring-2 focus:ring-[#0057C8]/10 dark:focus:ring-[#1A9FFF]/10
                        transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400 dark:bg-[#0c1824]">Select a subject…</option>
                      <option value="general" className="dark:bg-[#0c1824]">General Inquiry</option>
                      <option value="billing" className="dark:bg-[#0c1824]">Billing / Subscription</option>
                      <option value="technical" className="dark:bg-[#0c1824]">Technical Support</option>
                      <option value="school" className="dark:bg-[#0c1824]">School / College Partnership</option>
                      <option value="feedback" className="dark:bg-[#0c1824]">Feedback / Suggestions</option>
                      <option value="other" className="dark:bg-[#0c1824]">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help you…"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10
                        bg-slate-50 dark:bg-white/5 px-4 py-3
                        text-sm text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20
                        focus:outline-none focus:border-[#0057C8] dark:focus:border-[#1A9FFF]
                        focus:ring-2 focus:ring-[#0057C8]/10 dark:focus:ring-[#1A9FFF]/10
                        transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl
                      font-bold text-sm text-white
                      bg-linear-to-r from-[#0057C8] to-[#1A9FFF]
                      hover:from-[#004BB0] hover:to-[#1589E0]
                      shadow-[0_8px_20px_rgba(0,87,200,0.25)] hover:shadow-[0_12px_28px_rgba(0,87,200,0.35)]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400 dark:text-white/30 font-medium">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy-policy" className="text-[#0057C8] dark:text-[#1A9FFF] hover:underline">Privacy Policy</Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <LandingFooter />

      </div>
    </div>
  );
}
