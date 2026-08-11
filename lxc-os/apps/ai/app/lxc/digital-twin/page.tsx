'use client';

import { useState, useEffect } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getLXCStudentData } from '@/lib/lxc/student-store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import {
  Brain,
  Cpu,
  Zap,
  TrendingUp,
  AlertCircle,
  Target,
  Loader2,
  RefreshCcw,
  User,
} from 'lucide-react';

interface DigitalTwinResult {
  twinId: string;
  overallLearnerType: string;
  learningPersonality: string;
  knowledgeMap: { strongSubjects: string[]; weakSubjects: string[]; criticalGaps: string[] };
  cognitiveProfile: Record<string, number>;
  predictedPerformance: {
    nextExam: string;
    confidenceLevel: string;
    riskAreas: string[];
    readinessScore: number;
  };
  personalizedInsights: string[];
  idealStudyStyle: string;
  weeklyOptimalSchedule: string;
  twinRecommendations: { immediate: string[]; thisWeek: string[]; thisMonth: string[] };
  motivationalDNA: string;
  growthTrajectory: string;
  parentReport: string;
  generatedAt: number;
  dataPoints: number;
}

function RadarBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100;
  const color = value >= 7 ? 'bg-green-400' : value >= 5 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/60 w-40 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold w-8 text-right">{value}/10</span>
    </div>
  );
}

const COGNITIVE_LABELS: Record<string, string> = {
  memoryStrength: 'Memory Strength',
  analyticalThinking: 'Analytical Thinking',
  creativeProblemSolving: 'Creative Solving',
  consistency: 'Consistency',
  stressResilience: 'Stress Resilience',
};

export default function DigitalTwinPage() {
  const [studentData, setStudentData] = useState<ReturnType<typeof getLXCStudentData> | null>(null);
  const [twin, setTwin] = useState<DigitalTwinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    const data = getLXCStudentData();
    setStudentData(data);
  }, []);

  const buildTwin = async () => {
    if (!studentData?.profile) {
      setError('Please create your profile first');
      return;
    }
    setError('');
    setLoading(true);
    setTwin(null);

    const quizHistory = studentData.studySessions
      .filter((s) => s.quizScore !== undefined)
      .map((s) => s.quizScore as number);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/digital-twin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({
          profile: studentData.profile,
          studySessions: studentData.studySessions,
          quizHistory,
          careerProfile: studentData.careerProfile,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) setTwin(data.data);
      else setError(data.error?.message || 'Error building your Digital Twin');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const confColors: Record<string, string> = {
    High: 'text-green-400',
    Medium: 'text-yellow-400',
    Low: 'text-red-400',
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1a6fd8]/20 border border-[#1a6fd8]/40 rounded-full px-4 py-1 text-sm text-blue-300 mb-4">
            <Cpu className="w-4 h-4" />
            Module 8 — Digital Twin Student Model
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Digital Twin</h1>
          <p className="text-white/60">
            AI's complete cognitive model of you — knows you better than yourself
          </p>
        </div>

        {!twin ? (
          <div className="space-y-4">
            {/* Data Summary */}
            {studentData && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold">Data Points</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {studentData.studySessions.length}
                    </p>
                    <p className="text-xs text-white/40">Study Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{studentData.totalXP}</p>
                    <p className="text-xs text-white/40">Total XP</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {studentData.badges.length}
                    </p>
                    <p className="text-xs text-white/40">Badges</p>
                  </div>
                </div>
                {studentData.studySessions.length < 5 && (
                  <div className="mt-4 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-300">
                      For a more accurate twin, complete at least 5 study sessions. Currently you have{' '}
                      {studentData.studySessions.length} sessions.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white flex-1"
              >
                <option value="english">Result in English</option>
                <option value="hindi">Result in Hindi</option>
                <option value="hinglish">Result in Hinglish</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={buildTwin}
              disabled={loading || !studentData?.profile}
              className="w-full py-4 bg-gradient-to-r from-[#1a6fd8] to-purple-600 hover:opacity-90 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> AI is building your Digital Twin...
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" /> Generate Digital Twin
                </>
              )}
            </button>

            <p className="text-xs text-white/30 text-center">
              This analyzes your learning data to construct a personalized AI model
            </p>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Twin Identity */}
            <div className="bg-gradient-to-br from-[#1a6fd8]/30 to-purple-500/20 border border-[#1a6fd8]/40 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-white/40 mb-1">Twin ID: {twin.twinId}</p>
                  <h2 className="text-xl font-bold">{twin.learningPersonality}</h2>
                  <p className="text-white/70">{twin.overallLearnerType} Learner</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">
                    {twin.predictedPerformance.readinessScore}%
                  </p>
                  <p className="text-xs text-white/40">Readiness Score</p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Created from {twin.dataPoints} data points •{' '}
                {new Date(twin.generatedAt).toLocaleDateString('en-US')}
              </p>
            </div>

            {/* Knowledge Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                <p className="text-xs text-green-400 mb-2 font-bold">💪 Strong Subjects</p>
                <ul className="space-y-1">
                  {twin.knowledgeMap.strongSubjects.map((s, i) => (
                    <li key={i} className="text-sm text-white/80">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-xs text-yellow-400 mb-2 font-bold">📚 Weak Subjects</p>
                <ul className="space-y-1">
                  {twin.knowledgeMap.weakSubjects.map((s, i) => (
                    <li key={i} className="text-sm text-white/80">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <p className="text-xs text-red-400 mb-2 font-bold">🚨 Critical Gaps</p>
                <ul className="space-y-1">
                  {twin.knowledgeMap.criticalGaps.map((s, i) => (
                    <li key={i} className="text-sm text-white/80">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cognitive Profile */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Cognitive Profile
              </h3>
              <div className="space-y-3">
                {Object.entries(twin.cognitiveProfile).map(([key, val]) => (
                  <RadarBar key={key} label={COGNITIVE_LABELS[key] || key} value={val} />
                ))}
              </div>
            </div>

            {/* Predicted Performance */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Performance Prediction
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs text-white/40">Predicted Score</p>
                  <p className="font-bold text-blue-400">{twin.predictedPerformance.nextExam}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs text-white/40">Confidence</p>
                  <p
                    className={`font-bold ${confColors[twin.predictedPerformance.confidenceLevel] || 'text-white'}`}
                  >
                    {twin.predictedPerformance.confidenceLevel}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs text-white/40">Readiness</p>
                  <p className="font-bold text-green-400">
                    {twin.predictedPerformance.readinessScore}%
                  </p>
                </div>
              </div>
              {twin.predictedPerformance.riskAreas.length > 0 && (
                <div>
                  <p className="text-xs text-red-400 mb-1">⚠️ Risk Areas:</p>
                  {twin.predictedPerformance.riskAreas.map((r, i) => (
                    <p key={i} className="text-sm text-white/70">
                      • {r}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Personalized Insights */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Personalized Insights
              </h3>
              <div className="space-y-2">
                {twin.personalizedInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✦</span>
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Study Style + Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-2 text-sm">Ideal Study Style</h3>
                <p className="text-sm text-white/70">{twin.idealStudyStyle}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-2 text-sm">Weekly Optimal Schedule</h3>
                <p className="text-sm text-white/70">{twin.weeklyOptimalSchedule}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" /> Twin Recommendations
              </h3>
              <div className="space-y-4">
                {Object.entries(twin.twinRecommendations).map(([period, items]) => (
                  <div key={period}>
                    <p className="text-xs text-white/40 mb-2 uppercase">
                      {period === 'immediate'
                        ? 'Do Now'
                        : period === 'thisWeek'
                          ? 'This Week'
                          : 'This Month'}
                    </p>
                    <ul className="space-y-1">
                      {(items as string[]).map((item, i) => (
                        <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-green-400 shrink-0">→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational DNA + Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl p-5">
                <p className="text-xs text-pink-400 mb-2">💗 Motivational DNA</p>
                <p className="text-sm text-white/80">{twin.motivationalDNA}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
                <p className="text-xs text-green-400 mb-2">🌱 3 Month Trajectory</p>
                <p className="text-sm text-white/80">{twin.growthTrajectory}</p>
              </div>
            </div>

            {/* Parent Report */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-white/40 mb-2">👨‍👩‍👧 Parent Summary</p>
              <p className="text-sm text-white/80 italic">&ldquo;{twin.parentReport}&rdquo;</p>
            </div>

            <button
              onClick={() => {
                setTwin(null);
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Rebuild Twin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
