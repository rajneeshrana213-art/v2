'use client';

import { useState } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { Sparkles, Trophy, Rocket, Star, Target, Globe, Loader2, ChevronRight } from 'lucide-react';

interface TalentResult {
  talentProfile: {
    primaryTalent: string;
    talentType: string;
    rarityScore: number;
    potentialLevel: string;
    uniqueStrengthStatement: string;
  };
  pathways: Array<{
    path: string;
    type: string;
    description: string;
    indiaOpportunities: string[];
    firstStep: string;
    timeToResults: string;
    successStories: string;
  }>;
  hiddenTalents: string[];
  olympiadOpportunities: Array<{
    name: string;
    subject: string;
    eligibility: string;
    registrationMonth: string;
    website: string;
  }>;
  startupIdeas: Array<{ idea: string; problem: string; feasibility: string; firstAction: string }>;
  skillsToAcquire: Array<{ skill: string; why: string; freeResource: string }>;
  mentorProfile: string;
  threeyearVision: string;
  parentPitch: string;
  immediateWins: string[];
}

const POTENTIAL_COLORS: Record<string, string> = {
  Exceptional: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  High: 'text-green-400 bg-green-400/10 border-green-400/30',
  Strong: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Developing: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

const FEASIBILITY_COLORS: Record<string, string> = {
  High: 'text-green-400',
  Medium: 'text-yellow-400',
  Low: 'text-red-400',
};

const HOBBY_PRESETS = [
  'Reading',
  'Gaming',
  'Cricket',
  'Drawing/Art',
  'Music',
  'Coding',
  'Cooking',
  'Photography',
  'Dancing',
  'Writing stories',
  'Debating',
  'Mathematics puzzles',
];

export default function TalentPage() {
  const [interests, setInterests] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [achievements, setAchievements] = useState('');
  const [strengths, setStrengths] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [language, setLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TalentResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'pathways' | 'olympiads' | 'startups'>(
    'profile',
  );

  const toggleHobby = (h: string) => {
    const current = hobbies.split(', ').filter(Boolean);
    if (current.includes(h)) {
      setHobbies(current.filter((x) => x !== h).join(', '));
    } else {
      setHobbies([...current, h].join(', '));
    }
  };

  const handleDiscover = async () => {
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({
          interests,
          hobbies,
          achievements,
          strengths,
          studentClass,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setActiveTab('profile');
      } else setError(data.error?.message || 'Error discovering talent');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1 text-sm text-amber-300 mb-4">
            <Sparkles className="w-4 h-4" />
            Module 21 — Talent Incubator Mode
          </div>
          <h1 className="text-3xl font-bold mb-2">Talent Discovery</h1>
          <p className="text-white/60">Discover your hidden talent — that schools missed</p>
        </div>

        {!result ? (
          <div className="space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Tell us about yourself</h3>

              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Select Hobbies:</label>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_PRESETS.map((h) => (
                    <button
                      key={h}
                      onClick={() => toggleHobby(h)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${hobbies.includes(h) ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Interests / Passion areas:
                  </label>
                  <input
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Technology, Sports, Social work, Art..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Hobbies (or select above):
                  </label>
                  <input
                    value={hobbies}
                    onChange={(e) => setHobbies(e.target.value)}
                    placeholder="e.g. Coding, Cricket, Drawing..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Achievements / Awards (Optional):
                  </label>
                  <input
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="e.g. School chess champion, science fair winner, class topper..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Your strongest skills:
                  </label>
                  <input
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="e.g. Fast learner, creative, good communicator, problem solver..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white flex-1"
              >
                {[
                  'Class 6',
                  'Class 7',
                  'Class 8',
                  'Class 9',
                  'Class 10',
                  'Class 11',
                  'Class 12',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white flex-1"
              >
                <option value="hindi">Hindi</option>
                <option value="hinglish">Hinglish</option>
                <option value="english">English</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleDiscover}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> AI is searching for your talent...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Discover My Talent
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Talent Profile Header */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-amber-400 mb-1">{result.talentProfile.talentType}</p>
                  <h2 className="text-2xl font-bold">{result.talentProfile.primaryTalent}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-400">
                    {result.talentProfile.rarityScore}/10
                  </p>
                  <p className="text-xs text-white/40">Rarity Score</p>
                </div>
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm border mb-3 ${POTENTIAL_COLORS[result.talentProfile.potentialLevel] || 'text-white bg-white/10 border-white/20'}`}
              >
                {result.talentProfile.potentialLevel} Potential
              </div>
              <p className="text-white/80 italic">
                &ldquo;{result.talentProfile.uniqueStrengthStatement}&rdquo;
              </p>
            </div>

            {/* Hidden Talents */}
            {result.hiddenTalents.length > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-400" /> Hidden Talents (That you hadn't thought of)
                </h3>
                <ul className="space-y-2">
                  {result.hiddenTalents.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {(['profile', 'pathways', 'olympiads', 'startups'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${activeTab === t ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {t === 'profile'
                    ? '🎯 Pathways'
                    : t === 'pathways'
                      ? '🗺️ Detailed'
                      : t === 'olympiads'
                        ? '🏆 Olympiads'
                        : '🚀 Startup Ideas'}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-4">
                {result.pathways.slice(0, 3).map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold">{p.path}</h4>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{p.type}</span>
                    </div>
                    <p className="text-sm text-white/70 mb-3">{p.description}</p>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
                      <p className="text-xs text-green-400 mb-1">🚀 First Step This Week:</p>
                      <p className="text-sm">{p.firstStep}</p>
                    </div>
                    <p className="text-xs text-white/40">
                      ⏱️ {p.timeToResults} • 💡 {p.successStories}
                    </p>
                  </div>
                ))}

                {/* Immediate Wins */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" /> Actions for next 30 days
                  </h3>
                  {result.immediateWins.map((win, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/80 mb-2">
                      <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {win}
                    </div>
                  ))}
                </div>

                {/* 3 Year Vision */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border border-blue-500/30 rounded-2xl p-5">
                  <Globe className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-xs text-blue-400 mb-1">Where you could be in 3 years</p>
                  <p className="text-sm text-white/80">{result.threeyearVision}</p>
                </div>
              </div>
            )}

            {activeTab === 'pathways' && (
              <div className="space-y-4">
                {result.pathways.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h4 className="font-bold mb-1">{p.path}</h4>
                    <p className="text-sm text-white/60 mb-3">{p.description}</p>
                    <div className="mb-3">
                      <p className="text-xs text-white/40 mb-1">India Opportunities:</p>
                      <ul className="space-y-0.5">
                        {p.indiaOpportunities.map((o, j) => (
                          <li key={j} className="text-sm text-white/70">
                            • {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-green-400">✓ {p.firstStep}</p>
                  </div>
                ))}

                {/* Skills to Acquire */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="font-bold mb-3">Skills to Acquire</h3>
                  <div className="space-y-3">
                    {result.skillsToAcquire.map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3">
                        <p className="font-medium text-sm">{s.skill}</p>
                        <p className="text-xs text-white/50 mt-1">{s.why}</p>
                        <p className="text-xs text-blue-400 mt-1">🔗 {s.freeResource}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'olympiads' && (
              <div className="space-y-4">
                {result.olympiadOpportunities.map((o, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        {o.name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-white/40">Subject</p>
                        <p className="font-medium">{o.subject}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-white/40">Eligible</p>
                        <p className="font-medium">{o.eligibility}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs text-white/40">Register By</p>
                        <p className="font-medium">{o.registrationMonth}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-2">Organizer: {o.website}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'startups' && (
              <div className="space-y-4">
                {result.startupIdeas.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-orange-400" />
                        {s.idea}
                      </h4>
                      <span
                        className={`text-sm font-bold ${FEASIBILITY_COLORS[s.feasibility] || 'text-white'}`}
                      >
                        {s.feasibility}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">Problem: {s.problem}</p>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                      <p className="text-xs text-green-400 mb-1">First Action:</p>
                      <p className="text-sm">{s.firstAction}</p>
                    </div>
                  </div>
                ))}

                {/* Parent Pitch */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
                  <p className="text-xs text-blue-400 mb-2">👨‍👩‍👧 How to convince your parents:</p>
                  <p className="text-sm text-white/80">{result.parentPitch}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm transition-all"
            >
              Start New Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
