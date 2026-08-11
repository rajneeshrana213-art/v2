'use client';

import { useState, useEffect } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getLXCStudentData } from '@/lib/lxc/student-store';
import {
  Award,
  Star,
  TrendingUp,
  Shield,
  BookOpen,
  Zap,
  Trophy,
  Download,
  Share2,
  Lock,
} from 'lucide-react';

interface SkillCertificate {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  description: string;
  requiredXP: number;
  requiredSessions: number;
  icon: typeof Award;
  color: string;
  bgColor: string;
  borderColor: string;
  unlockedAt?: number;
  isUnlocked: boolean;
}

const CERTIFICATES: Omit<SkillCertificate, 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'curious_learner',
    title: 'Curious Learner',
    titleHi: 'Curious Learner',
    category: 'Foundation',
    description: 'Completed first 5 study sessions',
    requiredXP: 100,
    requiredSessions: 5,
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'consistent_scholar',
    title: 'Consistent Scholar',
    titleHi: 'Consistent Scholar',
    category: 'Consistency',
    description: 'Studied for 7 days in a row',
    requiredXP: 300,
    requiredSessions: 15,
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    titleHi: 'Quiz Master',
    category: 'Academic',
    description: 'Scored 80%+ in adaptive quizzes',
    requiredXP: 500,
    requiredSessions: 20,
    icon: Star,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'career_explorer',
    title: 'Career Explorer',
    titleHi: 'Career Explorer',
    category: 'Career',
    description: 'Completed Career Discovery assessment',
    requiredXP: 200,
    requiredSessions: 10,
    icon: TrendingUp,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'wellness_champion',
    title: 'Wellness Champion',
    titleHi: 'Wellness Champion',
    category: 'Wellness',
    description: 'Completed 5 wellness check-ins',
    requiredXP: 250,
    requiredSessions: 12,
    icon: Zap,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  {
    id: 'knowledge_warrior',
    title: 'Knowledge Warrior',
    titleHi: 'Knowledge Warrior',
    category: 'Advanced',
    description: 'Earned 1000+ XP points',
    requiredXP: 1000,
    requiredSessions: 30,
    icon: Trophy,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'bharat_star',
    title: 'Bharat Star',
    titleHi: 'Bharat Star',
    category: 'Bharat Mode',
    description: 'Used Bharat Mode for voice learning',
    requiredXP: 400,
    requiredSessions: 20,
    icon: Star,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'lxc_master',
    title: 'LXC Master',
    titleHi: 'LXC Master',
    category: 'Elite',
    description: 'Reached Level 5+ on the LXC platform',
    requiredXP: 2000,
    requiredSessions: 50,
    icon: Award,
    color: 'text-[#1a6fd8]',
    bgColor: 'bg-[#1a6fd8]/10',
    borderColor: 'border-[#1a6fd8]/30',
  },
];

export default function CertificatesPage() {
  const [certs, setCerts] = useState<SkillCertificate[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [selectedCert, setSelectedCert] = useState<SkillCertificate | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [mintedTxHashes, setMintedTxHashes] = useState<Record<string, string>>({});
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    const data = getLXCStudentData();
    const xp = data.totalXP;
    const sessions = data.studySessions.length;
    setTotalXP(xp);
    setTotalSessions(sessions);

    const computed = CERTIFICATES.map((c) => ({
      ...c,
      isUnlocked: xp >= c.requiredXP && sessions >= c.requiredSessions,
      unlockedAt: xp >= c.requiredXP && sessions >= c.requiredSessions ? Date.now() : undefined,
    }));
    setCerts(computed);
  }, []);

  const handleMint = async (certId: string, skillName: string) => {
    setIsMinting(true);
    try {
      const res = await fetch('/api/lxc/passport/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName }),
      });
      const data = await res.json();
      if (data.success && data.data?.credential) {
        setMintedTxHashes(prev => ({
          ...prev,
          [certId]: data.data.credential.blockchainHash
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMinting(false);
    }
  };

  const unlocked = certs.filter((c) => c.isUnlocked).length;
  const filtered = certs.filter((c) => {
    if (filter === 'unlocked') return c.isUnlocked;
    if (filter === 'locked') return !c.isUnlocked;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-1 text-sm text-yellow-300 mb-4">
            <Award className="w-4 h-4" />
            Module 16 — Skill Economy & Certifications
          </div>
          <h1 className="text-3xl font-bold mb-2">Skill Certificates</h1>
          <p className="text-white/60">Verify your skills — build your digital portfolio</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{unlocked}</p>
            <p className="text-xs text-white/40">Unlocked</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-white/40">Total XP</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalSessions}</p>
            <p className="text-xs text-white/40">Sessions</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">Portfolio Completion</span>
            <span className="font-bold">{Math.round((unlocked / CERTIFICATES.length) * 100)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${(unlocked / CERTIFICATES.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-white/30 mt-2">
            {unlocked} of {CERTIFICATES.length} certificates unlocked
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-[#1a6fd8] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {f === 'all' ? 'All' : f === 'unlocked' ? '✅ Unlocked' : '🔒 Locked'}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cert) => (
            <button
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className={`text-left border rounded-2xl p-5 transition-all ${
                cert.isUnlocked
                  ? `${cert.bgColor} ${cert.borderColor} hover:opacity-90`
                  : 'border-white/5 bg-white/3 opacity-50 hover:opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${cert.isUnlocked ? cert.bgColor : 'bg-white/5'} relative`}
                >
                  <cert.icon
                    className={`w-7 h-7 ${cert.isUnlocked ? cert.color : 'text-white/20'}`}
                  />
                  {!cert.isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold ${cert.isUnlocked ? 'text-white' : 'text-white/30'}`}>
                      {cert.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${cert.isUnlocked ? cert.bgColor + ' ' + cert.color : 'bg-white/5 text-white/20'}`}
                    >
                      {cert.category}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-1 ${cert.isUnlocked ? 'text-white/70' : 'text-white/20'}`}
                  >
                    {cert.description}
                  </p>
                  <div
                    className={`flex items-center gap-4 mt-2 text-xs ${cert.isUnlocked ? 'text-white/50' : 'text-white/20'}`}
                  >
                    <span>⚡ {cert.requiredXP} XP</span>
                    <span>📚 {cert.requiredSessions} sessions</span>
                  </div>
                  {cert.isUnlocked ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-green-400`} />
                      <span className="text-xs text-green-400 font-medium">Unlocked!</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/20 rounded-full"
                          style={{ width: `${Math.min(100, (totalXP / cert.requiredXP) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/20 mt-1">
                        {totalXP}/{cert.requiredXP} XP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Certificate Modal */}
        {selectedCert && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCert(null)}
          >
            <div
              className={`bg-[#0d1a2d] border ${selectedCert.borderColor} rounded-3xl p-8 max-w-sm w-full text-center`}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedCert.isUnlocked ? (
                <>
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl ${selectedCert.bgColor} flex items-center justify-center mb-4`}
                  >
                    <selectedCert.icon className={`w-10 h-10 ${selectedCert.color}`} />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{selectedCert.title}</h2>
                  <p className="text-sm text-white/50 mb-4">{selectedCert.title}</p>
                  <div
                    className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${selectedCert.bgColor} ${selectedCert.color} mb-4`}
                  >
                    {selectedCert.category}
                  </div>
                  <p className="text-sm text-white/70 mb-6">{selectedCert.description}</p>

                  {mintedTxHashes[selectedCert.id] ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-green-400 font-bold mb-1">✓ Minted as Soulbound NFT</p>
                      <p className="text-xs text-white/40 break-all font-mono">Tx: {mintedTxHashes[selectedCert.id]}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMint(selectedCert.id, selectedCert.title)}
                      disabled={isMinting}
                      className="w-full py-3 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                    >
                      {isMinting ? 'Minting Soulbound NFT...' : '⚡ Mint Soulbound NFT (Gasless)'}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-16 h-16 mx-auto text-white/20 mb-4" />
                  <h2 className="text-xl font-bold mb-2 text-white/40">{selectedCert.title}</h2>
                  <p className="text-sm text-white/30 mb-4">{selectedCert.description}</p>
                  <div className="bg-white/5 rounded-xl p-4 text-left">
                    <p className="text-xs text-white/40 mb-2">To unlock:</p>
                    <p className="text-sm text-white/60">
                      ⚡ {selectedCert.requiredXP} XP required (You have: {totalXP})
                    </p>
                    <p className="text-sm text-white/60">
                      📚 {selectedCert.requiredSessions} sessions required (You have: {totalSessions})
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={() => setSelectedCert(null)}
                className="mt-4 w-full py-2 text-white/40 text-sm hover:text-white/60 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
