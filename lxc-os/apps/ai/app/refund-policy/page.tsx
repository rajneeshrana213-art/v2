'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { RefreshCw, CheckCircle2, XCircle, Clock, CreditCard, AlertTriangle, Mail } from 'lucide-react';

const eligibleFor = [
  'Technical error or bug that made the platform completely unusable for more than 72 continuous hours',
  'Duplicate payment charged for the same subscription period',
  'Accidental purchase of the wrong plan (requested within 24 hours of purchase)',
  'Account unable to be created due to a verified system error on our end',
];

const notEligibleFor = [
  'Change of mind after using the platform or accessing premium content',
  'Partial usage of a billing period — refunds are not prorated',
  'Forgetting to cancel before the next billing cycle',
  'Slow internet speed or device compatibility issues on your end',
  'Dissatisfaction with AI-generated content quality (our AI tools are provided as-is)',
  'Free plan users (no payment involved)',
  'Requests made more than 7 days after the billing date',
];

const steps = [
  { step: '01', icon: <Mail className="w-4 h-4" />, title: 'Email Us', desc: 'Send a refund request to hello@learnxchain.in with subject "Refund Request — [Order ID]".' },
  { step: '02', icon: <CheckCircle2 className="w-4 h-4" />, title: 'Verification', desc: 'Our support team will verify your request and eligibility within 2 business days.' },
  { step: '03', icon: <Clock className="w-4 h-4" />, title: 'Processing', desc: 'Approved refunds are processed within 5–7 business days to your original payment method.' },
  { step: '04', icon: <CreditCard className="w-4 h-4" />, title: 'Credit Received', desc: 'Funds appear in your bank account or card statement within the processing timelines of your bank.' },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans">

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[130px] opacity-10"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
      </div>

      <LandingNav />

      <div className="relative z-10 pt-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 sm:px-10 pt-16 pb-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-[0_12px_32px_rgba(245,158,11,0.3)]">
            <RefreshCw className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
            Cancellation &amp;{' '}
            <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Refund Policy
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
            className="text-slate-500 dark:text-white/50 font-medium text-sm">
            Last updated: 29 May 2026 &nbsp;·&nbsp; Effective: 29 May 2026
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-slate-500 dark:text-white/55 font-semibold max-w-2xl mx-auto mt-3">
            We want you to love RIT AI. If something goes wrong, here's everything you need to know about cancellations and refunds.
          </motion.p>
        </section>

        <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-24 flex flex-col gap-6">

          {/* Cancellation */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-500 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">1. Subscription Cancellation</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-1">How to Cancel</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                  You may cancel your subscription at any time through your Account Settings → Subscription → Cancel Plan, or by emailing us at hello@learnxchain.in with the subject "Cancel Subscription".
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-1">What Happens After Cancellation</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                  Your subscription remains active until the end of the current billing period. You will not be charged for the next cycle. After expiry, your account reverts to the Free plan and premium features will be disabled.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-1">Data Retention</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                  Your learning data, quiz history, and notes are retained for 90 days after cancellation, after which they are permanently deleted unless you re-subscribe.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Refund Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center text-[#0057C8] dark:text-[#1A9FFF] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">2. Refund Overview</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium mb-5">
              RIT AI operates on a <span className="font-bold text-slate-700 dark:text-white/80">no-refund</span> policy for most cases, as we provide immediate access to digital content and AI services upon payment. However, we do offer refunds in specific circumstances listed below.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-1">Refund Window</p>
              <p className="text-sm font-bold text-slate-700 dark:text-white/80">
                7 days from the date of payment — for eligible cases only.
              </p>
            </div>
          </motion.div>

          {/* Eligible */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-2xl border border-[#5CDD2B]/20 bg-[#5CDD2B]/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#5CDD2B]/15 flex items-center justify-center text-[#5CDD2B] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">3. When You ARE Eligible for a Refund</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {eligibleFor.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#5CDD2B] mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-white/60 font-medium leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not Eligible */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-red-200 dark:border-red-500/15 bg-red-50 dark:bg-red-500/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">4. When You Are NOT Eligible for a Refund</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {notEligibleFor.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-white/60 font-medium leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Process */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center text-[#0057C8] dark:text-[#1A9FFF] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">5. Refund Request Process</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((step) => (
                <div key={step.step} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#0057C8] to-[#5CDD2B] flex items-center justify-center text-white shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mb-0.5">Step {step.step}</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white mb-0.5">{step.title}</p>
                    <p className="text-xs text-slate-500 dark:text-white/45 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Annual Plans */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">6. Annual Plans & Special Offers</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium">
              Annual subscription purchases are eligible for a refund only within the first 7 days and only if you have not accessed any premium content, videos, or AI features. Discounted plans, voucher-based purchases, and promotional offers are strictly non-refundable.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#0057C8]/20 dark:border-[#1A9FFF]/15 bg-[#0057C8]/5 dark:bg-[#1A9FFF]/5 p-6 sm:p-8">
            <h2 className="text-base font-black text-slate-800 dark:text-white mb-2">Need Help?</h2>
            <p className="text-sm text-slate-500 dark:text-white/55 font-medium leading-relaxed">
              For refund or cancellation requests, email{' '}
              <a href="mailto:hello@learnxchain.in" className="text-[#0057C8] dark:text-[#1A9FFF] font-bold hover:underline">hello@learnxchain.in</a>
              {' '}with your registered email, Order ID, and reason for the request. You can also reach us at{' '}
              <a href="tel:+916371418920" className="text-[#0057C8] dark:text-[#1A9FFF] font-bold hover:underline">+91 63714 18920</a>
              {' '}(Mon–Sat, 10 AM – 7 PM IST).
            </p>
          </motion.div>

        </section>

        <LandingFooter />
      </div>
    </div>
  );
}
