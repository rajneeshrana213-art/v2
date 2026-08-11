'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  Users,
  BookOpen,
  Zap,
  TrendingUp,
  Globe,
  Heart,
  Linkedin,
  ExternalLink,
  Star,
  Code2,
  Palette,
  BrainCircuit,
  Smartphone,
  Server,
} from 'lucide-react';

/* ── Team Data ── */
const team = [
  {
    name: 'Rajneesh Rana',
    role: 'Founder & CEO',
    tag: 'Present',
    tagColor: 'bg-[#0057C8]/15 text-[#0057C8] dark:bg-[#1A9FFF]/15 dark:text-[#1A9FFF]',
    description: 'Visionary behind LearnXChain. Leads product strategy and AI roadmap.',
    icon: <BrainCircuit className="w-5 h-5" />,
    gradient: 'from-[#0057C8] to-[#1A9FFF]',
    initials: 'RR',
    linkedin: '#',
  },
  {
    name: 'Aryan Sharma',
    role: 'Co-Founder & CTO',
    tag: 'Present',
    tagColor: 'bg-[#5CDD2B]/15 text-[#3aaa14] dark:bg-[#5CDD2B]/15 dark:text-[#5CDD2B]',
    description: 'Full-stack architect. Designs the core platform infrastructure and APIs.',
    icon: <Code2 className="w-5 h-5" />,
    gradient: 'from-[#5CDD2B] to-[#3aaa14]',
    initials: 'AS',
    linkedin: '#',
  },
  {
    name: 'Rohit Kumar Indra',
    role: 'Lead Backend Engineer',
    tag: 'Present',
    tagColor: 'bg-[#0057C8]/15 text-[#0057C8] dark:bg-[#1A9FFF]/15 dark:text-[#1A9FFF]',
    description: 'Powers the backend services, databases, and scalable microservices.',
    icon: <Server className="w-5 h-5" />,
    gradient: 'from-[#0057C8] to-[#5CDD2B]',
    initials: 'RKI',
    linkedin: '#',
  },
  {
    name: 'Tanisha Pahwa',
    role: 'UI/UX Designer',
    tag: 'Present',
    tagColor: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    description: 'Crafts pixel-perfect, accessible interfaces that students love to use.',
    icon: <Palette className="w-5 h-5" />,
    gradient: 'from-pink-500 to-rose-400',
    initials: 'TP',
    linkedin: '#',
  },
  {
    name: 'Neha',
    role: 'Content & Curriculum Lead',
    tag: 'Present',
    tagColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    description: 'Curates high-quality learning content aligned with CBSE & competitive exams.',
    icon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-amber-400 to-orange-500',
    initials: 'N',
    linkedin: '#',
  },
  {
    name: 'Biky Dev',
    role: 'Mobile App Developer',
    tag: 'Present',
    tagColor: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    description: 'Builds the cross-platform React Native app that brings RIT AI to mobile.',
    icon: <Smartphone className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-600',
    initials: 'BD',
    linkedin: '#',
  },
  {
    name: 'Tejaswa Rajput',
    role: 'AI/ML Engineer',
    tag: 'Present',
    tagColor: 'bg-[#5CDD2B]/15 text-[#3aaa14] dark:bg-[#5CDD2B]/15 dark:text-[#5CDD2B]',
    description: 'Develops the adaptive learning models, recommendation engine, and AI tutors.',
    icon: <BrainCircuit className="w-5 h-5" />,
    gradient: 'from-[#1A9FFF] to-[#5CDD2B]',
    initials: 'TR',
    linkedin: '#',
  },
];

/* ── Impact Stats ── */
const stats = [
  { value: '15L+', label: 'Students Reached', sublabel: 'and growing', icon: <Users className="w-6 h-6" /> },
  { value: '50K+', label: 'Doubts Solved', sublabel: 'by AI daily', icon: <Zap className="w-6 h-6" /> },
  { value: '99%', label: 'Uptime', sublabel: 'SLA guarantee', icon: <TrendingUp className="w-6 h-6" /> },
  { value: '12+', label: 'Schools Onboarded', sublabel: 'across India', icon: <Globe className="w-6 h-6" /> },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050d17] text-slate-900 dark:text-white font-sans">

      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[160px] opacity-15"
          style={{ background: 'radial-gradient(circle, #0057C8 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] opacity-10"
          style={{ background: 'radial-gradient(circle, #5CDD2B 0%, transparent 70%)' }}
        />
      </div>

      <LandingNav />

      <div className="relative z-10 pt-16">
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6
              bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10
              text-slate-500 dark:text-white/70"
          >
            <Heart className="w-3.5 h-3.5 text-red-400" />
            Built with love in Bharat 🇮🇳
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <img src="/logo.svg" alt="RIT AI Logo" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4"
          >
            Welcome to{' '}
            <span className="bg-linear-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] bg-clip-text text-transparent">
              RIT AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="text-lg text-slate-500 dark:text-white/55 font-semibold max-w-2xl mx-auto mb-4"
          >
            Powered by{' '}
            <span className="text-[#0057C8] dark:text-[#1A9FFF] font-black">LearnXChain Technologies</span>
            {' '}— India's first AI-powered Student Operating System for school and college learners.
          </motion.p>
        </section>

        {/* ── Story ── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Origin */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0057C8]/10 dark:bg-[#1A9FFF]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#0057C8] dark:text-[#1A9FFF]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">Our Story</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-white/55 leading-relaxed font-medium">
                RIT AI started as a small experiment — what if every student in India could have a personal AI tutor?
                The idea took off when we saw how much time students were losing searching for quality content.
                We built a platform that combines adaptive learning, doubt solving in Hindi &amp; English, and
                career discovery — all in one place.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1824] p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5CDD2B]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#5CDD2B]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-white/55 leading-relaxed font-medium">
                Our vision is to make learning feel seamless and enjoyable — removing the "mugging up" factor
                you find in most places. We want to build India's most loved student-first platform covering
                every subject, every board, and every exam. No student should be left behind because of
                access to quality education.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Impact Numbers ── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-black text-slate-800 dark:text-white mb-8"
          >
            Our Impact in Numbers
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10
                  bg-white dark:bg-[#0c1824] p-6 flex flex-col items-center text-center group
                  hover:border-[#0057C8]/30 dark:hover:border-[#1A9FFF]/20 transition-colors"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-linear-to-br from-[#0057C8]/5 to-[#5CDD2B]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-[#0057C8] to-[#5CDD2B]
                  flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,87,200,0.25)] text-white">
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm font-bold text-slate-600 dark:text-white/70">{stat.label}</p>
                <p className="text-xs text-slate-400 dark:text-white/35 mt-0.5 font-medium">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-28">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-black text-slate-800 dark:text-white mb-2"
          >
            Our Amazing Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-sm text-slate-500 dark:text-white/45 font-medium mb-10"
          >
            The passionate builders making RIT AI a reality.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group relative rounded-2xl border border-slate-200 dark:border-white/10
                  bg-white dark:bg-[#0c1824] p-5 flex flex-col items-center text-center
                  hover:border-[#0057C8]/30 dark:hover:border-[#1A9FFF]/20
                  hover:shadow-lg hover:shadow-[#0057C8]/5 dark:hover:shadow-[#1A9FFF]/5
                  transition-all duration-300"
              >
                {/* Avatar */}
                <div className={`relative w-20 h-20 rounded-4xl bg-linear-to-br ${member.gradient}
                  flex items-center justify-center mb-4 shadow-lg
                  group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-2xl font-black text-white tracking-tight">{member.initials}</span>
                  {/* Icon badge */}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-[#0c1824]
                    border-2 border-slate-100 dark:border-white/10 flex items-center justify-center
                    text-slate-500 dark:text-white/60">
                    {member.icon}
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight mb-1">
                  {member.name}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-white/40 mb-3">
                  {member.role}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-white/45 leading-relaxed mb-4 font-medium">
                  {member.description}
                </p>

                {/* Tags row */}
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${member.tagColor}`}>
                    {member.tag}
                  </span>
                  <a
                    href={member.linkedin}
                    aria-label={`${member.name} LinkedIn`}
                    className="w-6 h-6 rounded-md bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center
                      text-[#0A66C2] hover:bg-[#0A66C2]/20 dark:hover:bg-[#0A66C2]/30 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative rounded-3xl overflow-hidden border border-[#0057C8]/20 dark:border-[#1A9FFF]/15 p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,87,200,0.06) 0%, rgba(92,221,43,0.04) 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,87,200,0.12) 0%, transparent 70%)' }}
            />
            <div className="relative">
              <Star className="w-8 h-8 text-[#0057C8] dark:text-[#1A9FFF] mx-auto mb-4" />
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                Join the Learning Revolution
              </h2>
              <p className="text-slate-500 dark:text-white/55 font-semibold mb-8 max-w-xl mx-auto">
                15 Lakh+ students are already learning smarter with RIT AI. Start your journey today — it's free.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white
                  bg-linear-to-r from-[#0057C8] to-[#5CDD2B]
                  hover:from-[#004BB0] hover:to-[#50C225]
                  shadow-[0_8px_20px_rgba(0,87,200,0.25)] hover:shadow-[0_12px_28px_rgba(0,87,200,0.35)]
                  transition-all hover:scale-105 active:scale-95"
              >
                Get Started Free
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <LandingFooter />

      </div>
    </div>
  );
}
