'use client';

import { useState, useEffect } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getLXCStudentData } from '@/lib/lxc/student-store';
import {
  BarChart2,
  Globe,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Map,
  Zap,
  Shield,
  Building,
} from 'lucide-react';

const GOVERNMENT_SCHEMES = [
  {
    name: 'PM e-VIDYA',
    description: 'One Nation One Digital Platform — free education content',
    link: 'pmvidya.gov.in',
    category: 'Education',
  },
  {
    name: 'DIKSHA',
    description: 'Digital learning material for CBSE, ICSE, State boards',
    link: 'diksha.gov.in',
    category: 'Education',
  },
  {
    name: 'SWAYAM',
    description: 'Free online courses from IITs, IIMs, universities',
    link: 'swayam.gov.in',
    category: 'Higher Ed',
  },
  {
    name: 'NSP Scholarships',
    description: 'National Scholarship Portal — scholarships for SC/ST/OBC/Minority',
    link: 'scholarships.gov.in',
    category: 'Scholarship',
  },
  {
    name: 'PM YASASVI',
    description: 'Scholarships for OBC, EBC and DNT students',
    link: 'yet.nta.ac.in',
    category: 'Scholarship',
  },
  {
    name: 'Startup India',
    description: 'Register startup, get tax benefits, mentorship',
    link: 'startupindia.gov.in',
    category: 'Entrepreneurship',
  },
  {
    name: 'Atal Tinkering Labs',
    description: 'Innovation labs in schools — robotics, AI, 3D printing',
    link: 'aim.gov.in',
    category: 'Innovation',
  },
  {
    name: 'INSPIRE Awards',
    description: 'Innovation in Science for students (Class 6-10)',
    link: 'inspireawards-dst.gov.in',
    category: 'Science',
  },
];

const INDIA_STATS = [
  { label: 'Students using EdTech', value: '80M+', icon: Users, color: 'text-blue-400' },
  { label: 'Digital India reach', value: '750K+ villages', icon: Globe, color: 'text-green-400' },
  { label: 'SWAYAM courses', value: '500+', icon: BookOpen, color: 'text-purple-400' },
  { label: 'Scholarships available', value: '120+ types', icon: Award, color: 'text-yellow-400' },
  { label: 'Atal Tinkering Labs', value: '10,000+', icon: Zap, color: 'text-orange-400' },
  { label: 'IIT+NIT+IIIT seats', value: '45,000+', icon: Building, color: 'text-pink-400' },
];

const CSR_PROGRAMS = [
  {
    company: 'Tata Trusts',
    program: 'Education Excellence Program',
    benefit: 'Scholarships + Mentorship',
    eligible: 'Rural students',
  },
  {
    company: 'Infosys Foundation',
    program: 'Spark The Rise',
    benefit: 'Grants for social innovation',
    eligible: 'Class 8-12',
  },
  {
    company: 'Reliance Foundation',
    program: 'Jio Schools Program',
    benefit: 'Digital learning labs',
    eligible: 'Government schools',
  },
  {
    company: 'HDFC Bank',
    program: 'Parivartan',
    benefit: 'Educational support for underprivileged',
    eligible: 'Class 1-12',
  },
  {
    company: 'HCL Foundation',
    program: 'HCL Samuday',
    benefit: 'Technology + education',
    eligible: 'Rural communities',
  },
  {
    company: 'Wipro Foundation',
    program: 'Wipro Education',
    benefit: 'Teacher training + scholarships',
    eligible: 'Government school students',
  },
];

const STATE_INITIATIVES = [
  { state: 'Gujarat', initiative: 'e-Upakram', focus: 'Digital classrooms in rural areas' },
  { state: 'Kerala', initiative: 'IT@School', focus: '100% digital literacy in schools' },
  {
    state: 'Rajasthan',
    initiative: 'Smile Program',
    focus: 'WhatsApp-based learning for COVID recovery',
  },
  { state: 'Maharashtra', initiative: 'Samagra Shiksha', focus: 'Universal secondary education' },
  {
    state: 'Odisha',
    initiative: '5T Transformation',
    focus: 'Smart classrooms + sports academies',
  },
  {
    state: 'Andhra Pradesh',
    initiative: 'Amma Vodi',
    focus: '₹15,000/year for parents who send children to school',
  },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<ReturnType<typeof getLXCStudentData> | null>(null);
  const [tab, setTab] = useState<'overview' | 'schemes' | 'csr' | 'states'>('overview');

  useEffect(() => {
    setData(getLXCStudentData());
  }, []);

  const lxcImpact = {
    sessionsLogged: data?.studySessions.length || 0,
    xpEarned: data?.totalXP || 0,
    subjectsCovered: [...new Set(data?.studySessions.map((s) => s.subject) || [])].length,
    daysActive: data?.streak.longestStreak || 0,
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1 text-sm text-emerald-300 mb-4">
            <BarChart2 className="w-4 h-4" />
            Module 22 — Government & CSR Analytics Layer
          </div>
          <h1 className="text-3xl font-bold mb-2">India Education Ecosystem</h1>
          <p className="text-white/60">Government schemes, CSR programs, scholarships — all in one place</p>
        </div>

        {/* Your LXC Impact */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold">Your LXC Impact</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{lxcImpact.sessionsLogged}</p>
              <p className="text-xs text-white/40">Sessions</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-400">{lxcImpact.xpEarned}</p>
              <p className="text-xs text-white/40">XP Earned</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-400">{lxcImpact.subjectsCovered}</p>
              <p className="text-xs text-white/40">Subjects</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400">{lxcImpact.daysActive}</p>
              <p className="text-xs text-white/40">Day Streak</p>
            </div>
          </div>
        </div>

        {/* India Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {INDIA_STATS.map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {(
            [
              { key: 'overview', label: '📊 Overview' },
              { key: 'schemes', label: '🏛️ Gov Schemes' },
              { key: 'csr', label: '🏢 CSR Programs' },
              { key: 'states', label: '🗺️ State Initiatives' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${tab === t.key ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-400" /> India Education Landscape 2025
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'School enrollment (6-18 years)', value: '97.5%', trend: '+2.1%' },
                  { label: 'Girls in secondary school', value: '81%', trend: '+4.2%' },
                  { label: 'Digital learning adoption', value: '68%', trend: '+15%' },
                  { label: 'Rural internet access', value: '58%', trend: '+8%' },
                  { label: 'Students receiving scholarships', value: '14M+', trend: '+20%' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 border-b border-white/5"
                  >
                    <span className="text-sm text-white/70">{row.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-white">{row.value}</span>
                      <span className="text-xs text-green-400 ml-2">{row.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Key Policy Priorities 2025
              </h3>
              <ul className="space-y-2">
                {[
                  'NEP 2020 implementation — vocational training from Class 6',
                  'PM SHRI Schools — 14,500 model schools being upgraded',
                  'Foundational Literacy and Numeracy Mission (NIPUN)',
                  'PMJAY health coverage for students from EWS',
                  'One District One Product — skill linkage with local industries',
                  'Digital skilling via PMGDISHA — rural digital literacy',
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 shrink-0">→</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'schemes' && (
          <div className="space-y-4">
            {GOVERNMENT_SCHEMES.map((scheme) => (
              <div key={scheme.name} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold">{scheme.name}</h4>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    {scheme.category}
                  </span>
                </div>
                <p className="text-sm text-white/70 mb-2">{scheme.description}</p>
                <p className="text-xs text-blue-400">🌐 {scheme.link}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'csr' && (
          <div className="space-y-4">
            <p className="text-sm text-white/40">
              India CSR spending in education: ₹4,200+ crore annually
            </p>
            {CSR_PROGRAMS.map((prog) => (
              <div key={prog.company} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold">{prog.company}</h4>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {prog.eligible}
                  </span>
                </div>
                <p className="text-sm text-white/70 mb-2">{prog.program}</p>
                <p className="text-xs text-green-400">✓ {prog.benefit}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'states' && (
          <div className="space-y-4">
            <p className="text-sm text-white/40">
              Leading state education transformation initiatives:
            </p>
            {STATE_INITIATIVES.map((state) => (
              <div key={state.state} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{state.state}</h4>
                  <span className="text-sm font-medium text-emerald-400">{state.initiative}</span>
                </div>
                <p className="text-sm text-white/70">{state.focus}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
