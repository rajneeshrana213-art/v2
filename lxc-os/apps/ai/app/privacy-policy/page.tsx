'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Eye, Lock, Database, Bell, Globe, UserCheck, AlertTriangle, Shield } from 'lucide-react';

const sections = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you register or use RIT AI, we may collect: full name, email address, phone number, school/college name, class/grade, date of birth (for age verification), and profile photo (optional).',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform — including pages visited, features used, quiz scores, time spent on content, AI chat logs (anonymised), and device/browser information.',
      },
      {
        subtitle: 'Payment Information',
        text: 'For paid plans, payments are processed by our third-party payment gateways (Razorpay). We do not store your card or banking details on our servers.',
      },
    ],
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'To provide, personalise, and improve the RIT AI learning experience — including adaptive quizzes, AI doubt resolution, career recommendations, and progress tracking.',
      },
      {
        subtitle: 'Communication',
        text: 'To send you important updates, account notifications, learning reminders, and (with your consent) promotional offers. You may opt out of marketing communications at any time.',
      },
      {
        subtitle: 'Analytics & Improvement',
        text: 'To analyse usage patterns and improve our product, fix bugs, and develop new features. Aggregated, anonymised data may be used for research purposes.',
      },
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: '3. Data Security',
    content: [
      {
        subtitle: 'Encryption',
        text: 'All data transmitted between your device and our servers is encrypted using TLS 1.3. Sensitive data at rest is encrypted using AES-256.',
      },
      {
        subtitle: 'Access Control',
        text: 'Access to personal data is restricted to authorised personnel on a need-to-know basis. We conduct regular security audits and vulnerability assessments.',
      },
      {
        subtitle: 'DPDP Compliance',
        text: 'We comply with India\'s Digital Personal Data Protection (DPDP) Act 2023 and applicable data protection regulations.',
      },
    ],
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: '4. Sharing of Information',
    content: [
      {
        subtitle: 'Third-Party Services',
        text: 'We share data only with trusted partners who help us operate our platform — including cloud providers (AWS), payment gateways (Razorpay), analytics tools, and email service providers. These partners are contractually obligated to protect your data.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information when required by law, court order, or government authority, or to protect the rights, property, or safety of LearnXChain, our users, or the public.',
      },
      {
        subtitle: 'We Never Sell Your Data',
        text: 'LearnXChain does not sell, rent, or trade your personal information to any third party for commercial purposes.',
      },
    ],
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access, review, and correct the personal information we hold about you at any time through your account settings.',
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request deletion of your account and associated data by contacting us at hello@learnxchain.in. We will process deletion requests within 30 days, subject to legal retention requirements.',
      },
      {
        subtitle: 'Consent Withdrawal',
        text: 'You may withdraw consent for non-essential data processing at any time. Withdrawal does not affect the lawfulness of processing prior to withdrawal.',
      },
    ],
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: '6. Cookies & Tracking',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'We use essential cookies to keep you logged in and provide core functionality. These cannot be disabled without affecting service quality.',
      },
      {
        subtitle: 'Analytics Cookies',
        text: 'With your consent, we use analytics cookies (e.g., PostHog) to understand how users interact with RIT AI and improve our platform.',
      },
      {
        subtitle: 'Managing Cookies',
        text: 'You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.',
      },
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: 'Age Requirement',
        text: 'RIT AI is designed for students aged 10 and above. For users under 18, we recommend parental/guardian supervision. We do not knowingly collect personal data from children under 10 without verifiable parental consent.',
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans">

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-10"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
      </div>

      <LandingNav />

      <div className="relative z-10 pt-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 sm:px-10 pt-16 pb-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#0057C8] to-[#1A9FFF] flex items-center justify-center mx-auto mb-5 shadow-[0_12px_32px_rgba(0,87,200,0.3)]">
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
            Privacy <span className="bg-linear-to-r from-[#0057C8] to-[#5CDD2B] bg-clip-text text-transparent">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
            className="text-slate-500 dark:text-white/50 font-medium text-sm">
            Last updated: 29 May 2026 &nbsp;·&nbsp; Effective: 29 May 2026
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-slate-500 dark:text-white/55 font-semibold max-w-2xl mx-auto mt-3">
            LearnXChain Technologies Pvt. Ltd. ("we", "our", "RIT AI") is committed to protecting your privacy.
            This policy describes how we collect, use, and safeguard your personal information.
          </motion.p>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-24 flex flex-col gap-5">
          {sections.map((section, i) => (
            <motion.div key={section.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center text-[#0057C8] dark:text-[#1A9FFF] shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">{section.title}</h2>
              </div>
              <div className="flex flex-col gap-4">
                {section.content.map((item) => (
                  <div key={item.subtitle}>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-1">{item.subtitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#0057C8]/20 dark:border-[#1A9FFF]/15 bg-[#0057C8]/5 dark:bg-[#1A9FFF]/5 p-6 sm:p-8">
            <h2 className="text-base font-black text-slate-800 dark:text-white mb-2">8. Contact Us</h2>
            <p className="text-sm text-slate-500 dark:text-white/55 font-medium leading-relaxed">
              For any privacy-related questions, requests, or concerns, contact our Data Protection Officer at{' '}
              <a href="mailto:hello@learnxchain.in" className="text-[#0057C8] dark:text-[#1A9FFF] font-bold hover:underline">hello@learnxchain.in</a>
              {' '}or write to us at: LearnXChain Technologies Pvt. Ltd., Rohtak, Haryana — 124001, India.
            </p>
          </motion.div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
}
