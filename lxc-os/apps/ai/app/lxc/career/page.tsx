'use client';

import { useEffect, useState } from 'react';
import {
  Compass,
  ChevronRight,
  RefreshCw,
  Star,
  Trophy,
  BookOpen,
  Target,
  TrendingUp,
  Lightbulb,
  Map,
} from 'lucide-react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { XPBar } from '@/components/lxc/xp-bar';
import {
  loadStudentData,
  saveStudentData,
  addXP,
  unlockBadge,
  PREDEFINED_BADGES,
  type LXCStudentData,
  type CareerProfile,
} from '@/lib/lxc/student-store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

// 20-question career discovery quiz
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What do you like to do the most?',
    options: [
      'Create new things',
      'Help people',
      'Work with numbers and data',
      'Write or read stories',
    ],
  },
  {
    id: 'q2',
    question: 'What do you do if a problem arises?',
    options: [
      'Think of new ways',
      'Ask friends for help',
      'Solve using facts and logic',
      'Follow my feelings',
    ],
  },
  {
    id: 'q3',
    question: 'Which subject do you find most interesting?',
    options: ['Math/Physics', 'Biology/Chemistry', 'Social Science/History', 'Languages/Arts'],
  },
  {
    id: 'q4',
    question: 'What is your dream?',
    options: [
      'Invent something new',
      'Heal or teach people',
      'Serve the nation',
      'Become a famous artist/writer',
    ],
  },
  {
    id: 'q5',
    question: 'What do you do in your free time?',
    options: [
      'Explore coding or gadgets',
      'Play or hang out with friends',
      'Read books',
      'Drawing, music, or dance',
    ],
  },
  {
    id: 'q6',
    question: 'What kind of work would you like to do?',
    options: [
      'In an office on a computer',
      'In a hospital or school',
      'Outdoor field work',
      'In a studio or creative space',
    ],
  },
  {
    id: 'q7',
    question: 'What does success mean to you?',
    options: [
      'Build a big company',
      'Change people\'s lives',
      'High position in government',
      'Become famous and respected',
    ],
  },
  {
    id: 'q8',
    question: 'Which role are you comfortable with in a group?',
    options: ['Leader', 'Problem solver', 'Supporter/Helper', 'Creative thinker'],
  },
  {
    id: 'q9',
    question: 'Which field in India do you see the most opportunity in?',
    options: [
      'Technology/IT',
      'Healthcare/Medicine',
      'Government/Civil Services',
      'Entertainment/Media',
    ],
  },
  {
    id: 'q10',
    question: 'How much money do you need to earn?',
    options: [
      'A lot — I want to be rich',
      'Good money — comfortable life',
      'Less is fine — passion matters',
      'Need to support my family',
    ],
  },
];

interface CareerResult {
  personalityType: string;
  personalityDescription: string;
  topCareers: Array<{
    title: string;
    titleEn: string;
    icon: string;
    match: number;
    description: string;
    requiredSubjects: string[];
    entryPath: string;
    timeToCareer: string;
    incomeRange: string;
    opportunities: string[];
    indianContext: string;
  }>;
  skillsToGrow: string[];
  actionPlan: { immediate: string; shortTerm: string; longTerm: string };
  encouragementMessage: string;
  alternateOptions: string[];
}

export default function CareerPage() {
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCareer, setSelectedCareer] = useState(0);

  useEffect(() => {
    const loaded = loadStudentData();
    setData(loaded);
    // Load existing career profile if any
    if (loaded.careerProfile?.suggestedCareers?.length) {
      setStep('result');
    }
  }, []);

  function answerQuestion(answer: string) {
    const q = QUIZ_QUESTIONS[currentQ];
    const newAnswers = { ...answers, [q.question]: answer };
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }

  async function submitQuiz(finalAnswers: Record<string, string>) {
    setLoading(true);
    setError('');

    const config = getCurrentModelConfig();
    try {
      const res = await fetch('/api/lxc/career-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey,
          'x-base-url': config.baseUrl ?? '',
          'x-provider-type': config.providerType ?? '',
        },
        body: JSON.stringify({
          answers: finalAnswers,
          studentClass: data?.profile?.class,
          subjects: data?.profile?.subjects,
          language: data?.profile?.language ?? 'hindi',
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
      setStep('result');

      // Save career profile + XP + badge
      if (data) {
        const careerProfile: CareerProfile = {
          interests: Object.values(finalAnswers),
          suggestedCareers: json.data.topCareers?.map((c: { titleEn: string }) => c.titleEn) ?? [],
          completedAt: Date.now(),
          quizAnswers: finalAnswers,
        };
        const updated = { ...data, careerProfile };
        const withXP = addXP(updated, 150, 'Completed Career Discovery Quiz');
        const withBadge = unlockBadge(
          withXP,
          PREDEFINED_BADGES.find((b) => b.id === 'career-explorer')!,
        );
        saveStudentData(withBadge);
        setData(withBadge);
      }
    } catch {
      setError('Problem in career analysis. Please try again.');
      setStep('quiz');
    } finally {
      setLoading(false);
    }
  }

  function retakeQuiz() {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setStep('intro');
    setSelectedCareer(0);
  }

  return (
    <div className="min-h-screen bg-[#0c1522]">
      <LXCNav />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" />
              Career Discovery Engine
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Module 9 — Career Discovery Engine — Powered by Rit AI
            </p>
          </div>
          {data && (
            <XPBar
              totalXP={data.totalXP}
              level={data.level}
              streak={data.streak.currentStreak}
              compact
            />
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
            <p className="text-white font-semibold text-lg">Building your career profile...</p>
            <p className="text-white/50 text-sm mt-2">RIT AI is analyzing your responses</p>
          </div>
        )}

        {/* Intro */}
        {!loading && step === 'intro' && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-6">
              <Compass className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Discover Your Career! 🧭</h2>
            <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              This 10-question quiz analyzes your personality, interests, and strengths
              and gives you top 5 career suggestions — tailored to the Indian context.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl mb-1">🧠</div>
                <p className="text-xs text-white/50">AI Analysis</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🇮🇳</div>
                <p className="text-xs text-white/50">Indian Context</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💡</div>
                <p className="text-xs text-white/50">Action Plan</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep('quiz')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:opacity-90 transition-all"
              >
                Start Quiz (+150 XP) 🚀
              </button>
            </div>
            {data?.careerProfile && (
              <button
                onClick={() => setStep('result')}
                className="mt-3 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                See previous results →
              </button>
            )}
          </div>
        )}

        {/* Quiz */}
        {!loading && step === 'quiz' && (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-white/50 shrink-0">
                {currentQ + 1}/{QUIZ_QUESTIONS.length}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="text-sm text-purple-400 uppercase tracking-wider mb-3">
                Question {currentQ + 1}
              </p>
              <h2 className="text-xl font-bold text-white mb-6">
                {QUIZ_QUESTIONS[currentQ].question}
              </h2>
              <div className="space-y-3">
                {QUIZ_QUESTIONS[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => answerQuestion(opt)}
                    className="w-full text-left px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-purple-900/30 hover:border-purple-500 transition-all group"
                  >
                    <span className="text-purple-400 mr-3 font-bold">
                      {['A', 'B', 'C', 'D'][i]}.
                    </span>
                    {opt}
                    <ChevronRight className="w-4 h-4 inline float-right mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                disabled={currentQ === 0}
                className="text-sm text-white/30 hover:text-white/60 disabled:opacity-20"
              >
                ← Previous Question
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && step === 'result' && result && (
          <div>
            {/* Personality Card */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-700/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                  {result.personalityType?.[0] ?? '🧠'}
                </div>
                <div>
                  <p className="text-purple-400 text-sm uppercase tracking-wider">
                    Your Personality Type
                  </p>
                  <h2 className="text-xl font-bold text-white">{result.personalityType}</h2>
                  <p className="text-white/60 text-sm mt-1">{result.personalityDescription}</p>
                </div>
              </div>
            </div>

            {/* Top Career cards */}
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              Your Top 5 Career Matches
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {result.topCareers?.map((career, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCareer(i)}
                  className={`shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                    selectedCareer === i
                      ? 'bg-[#1a6fd8] border-[#1a6fd8]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{career.icon}</span>
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    {career.titleEn}
                  </span>
                  <span
                    className={`text-xs font-bold ${selectedCareer === i ? 'text-white' : 'text-[#5cc21a]'}`}
                  >
                    {career.match}% match
                  </span>
                </button>
              ))}
            </div>

            {/* Selected career detail */}
            {result.topCareers?.[selectedCareer] && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{result.topCareers[selectedCareer].icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {result.topCareers[selectedCareer].title}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {result.topCareers[selectedCareer].titleEn}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-2xl font-bold text-[#5cc21a]">
                      {result.topCareers[selectedCareer].match}%
                    </span>
                    <p className="text-xs text-white/40">match</p>
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-4 leading-relaxed">
                  {result.topCareers[selectedCareer].description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <InfoBox
                    label="Entry Path"
                    value={result.topCareers[selectedCareer].entryPath}
                    icon="🎓"
                  />
                  <InfoBox
                    label="Time to Career"
                    value={result.topCareers[selectedCareer].timeToCareer}
                    icon="⏱️"
                  />
                  <InfoBox
                    label="Income Range"
                    value={result.topCareers[selectedCareer].incomeRange}
                    icon="💰"
                  />
                  <InfoBox
                    label="Required Subjects"
                    value={result.topCareers[selectedCareer].requiredSubjects?.join(', ')}
                    icon="📚"
                  />
                </div>

                {result.topCareers[selectedCareer].indianContext && (
                  <div className="p-3 bg-[#1a6fd8]/10 border border-[#1a6fd8]/20 rounded-xl mb-3">
                    <p className="text-sm text-[#3b8eef]">
                      🇮🇳 {result.topCareers[selectedCareer].indianContext}
                    </p>
                  </div>
                )}

                {result.topCareers[selectedCareer].opportunities?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                      Opportunities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.topCareers[selectedCareer].opportunities.map((opp, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70"
                        >
                          {opp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skills + Action Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Skills to Develop
                </h3>
                <div className="space-y-2">
                  {result.skillsToGrow?.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5cc21a]" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4 text-blue-400" />
                  Action Plan
                </h3>
                <div className="space-y-3">
                  {result.actionPlan?.immediate && (
                    <div>
                      <p className="text-xs text-yellow-400 mb-1">🔥 This Month</p>
                      <p className="text-xs text-white/60">{result.actionPlan.immediate}</p>
                    </div>
                  )}
                  {result.actionPlan?.shortTerm && (
                    <div>
                      <p className="text-xs text-blue-400 mb-1">📅 In 6 Months</p>
                      <p className="text-xs text-white/60">{result.actionPlan.shortTerm}</p>
                    </div>
                  )}
                  {result.actionPlan?.longTerm && (
                    <div>
                      <p className="text-xs text-purple-400 mb-1">🌟 In 2-3 Years</p>
                      <p className="text-xs text-white/60">{result.actionPlan.longTerm}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Encouragement */}
            <div className="bg-gradient-to-r from-[#1a6fd8]/20 to-[#5cc21a]/20 border border-[#1a6fd8]/30 rounded-2xl p-5 mb-4">
              <p className="text-white leading-relaxed">💬 {result.encouragementMessage}</p>
            </div>

            <div className="text-center">
              <button
                onClick={retakeQuiz}
                className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon }: { label: string; value?: string; icon: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl text-center">
      <div className="text-lg mb-1">{icon}</div>
      <p className="text-xs font-medium text-white leading-tight">{value || '—'}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}
