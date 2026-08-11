'use client';

import { useState } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import {
  GitCompare,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Lightbulb,
  Users,
  ArrowRight,
} from 'lucide-react';

interface OptionAnalysis {
  name: string;
  verdict: string;
  verdictEmoji: string;
  pros: string[];
  cons: string[];
  averageIncome: string;
  difficultyScore: number;
  stabilityScore: number;
  growthScore: number;
  timeToSuccess: string;
  realExample: string;
  bestFor: string;
}

interface DecisionResult {
  summary: string;
  optionA: OptionAnalysis;
  optionB: OptionAnalysis;
  recommendation: string;
  hybridPath: string;
  keyQuestion: string;
  parentTalk: string;
  nextSteps: string[];
}

const PRESETS = [
  { a: 'Science Stream', b: 'Commerce Stream' },
  { a: 'Engineering (B.Tech)', b: 'Medicine (MBBS)' },
  { a: 'Government Job', b: 'Private Job' },
  { a: 'Start a Business', b: 'Study Further (Masters)' },
  { a: 'IIT JEE Preparation', b: 'State Board + Local College' },
  { a: 'Study Abroad', b: 'Study in India' },
];

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span className="font-bold text-white">{score}/10</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function DecisionSimulatorPage() {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [error, setError] = useState('');

  const handleSimulate = async () => {
    if (!optionA.trim() || !optionB.trim()) {
      setError('Please fill in both options');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const config = getCurrentModelConfig();
      const res = await fetch('/api/lxc/decision-simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey || '',
          'x-base-url': config.baseUrl || '',
          'x-provider-type': config.providerType || '',
        },
        body: JSON.stringify({ optionA: optionA.trim(), optionB: optionB.trim(), context }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError(data.error?.message || 'Analysis error');
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
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1 text-sm text-purple-300 mb-4">
            <GitCompare className="w-4 h-4" />
            Module 10 — Decision Simulator
          </div>
          <h1 className="text-3xl font-bold mb-2">Decision Simulator</h1>
          <p className="text-white/60">Deeply compare two paths — make the right decision</p>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <p className="text-sm text-white/50 mb-3">Common Comparisons:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.a}
                onClick={() => {
                  setOptionA(p.a);
                  setOptionB(p.b);
                }}
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
              >
                {p.a} vs {p.b}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Option A</label>
              <input
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="e.g., Science Stream"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Option B</label>
              <input
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="e.g., Commerce Stream"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Additional Information (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell us about your context — e.g., I like Math but my family's financial situation..."
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-[#1a6fd8] hover:opacity-90 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                AI is analyzing...
              </>
            ) : (
              <>
                <GitCompare className="w-5 h-5" />
                Compare Paths
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-5">
              <p className="text-lg font-medium text-center">{result.summary}</p>
            </div>

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  ['optionA', 'from-purple-500/20 to-purple-600/10', 'border-purple-500/30'],
                  ['optionB', 'from-blue-500/20 to-blue-600/10', 'border-blue-500/30'],
                ] as const
              ).map(([key, bg, border]) => {
                const opt = result[key] as OptionAnalysis;
                return (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-5`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{opt.name}</h3>
                      <span className="text-2xl">{opt.verdictEmoji}</span>
                    </div>
                    <div className="inline-block bg-white/10 rounded-full px-3 py-1 text-sm mb-4">
                      {opt.verdict}
                    </div>

                    <div className="space-y-2 mb-4">
                      <ScoreBar label="Difficulty" score={opt.difficultyScore} color="bg-red-400" />
                      <ScoreBar label="Stability" score={opt.stabilityScore} color="bg-green-400" />
                      <ScoreBar label="Growth" score={opt.growthScore} color="bg-blue-400" />
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 mb-4">
                      <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-sm font-medium">{opt.averageIncome}</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-white/50 mb-2">✅ Pros</p>
                      <ul className="space-y-1">
                        {opt.pros.map((p, i) => (
                          <li key={i} className="text-sm text-white/80 flex gap-2">
                            <span className="text-green-400 shrink-0">+</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-white/50 mb-2">⚠️ Challenges</p>
                      <ul className="space-y-1">
                        {opt.cons.map((c, i) => (
                          <li key={i} className="text-sm text-white/80 flex gap-2">
                            <span className="text-red-400 shrink-0">–</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/60 mt-3">
                      <Clock className="w-3 h-3" /> {opt.timeToSuccess}
                    </div>
                    <p className="text-xs text-white/40 mt-2 italic">{opt.realExample}</p>
                    <div className="mt-3 bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-white/50">Best Suited For:</p>
                      <p className="text-sm">{opt.bestFor}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Recommendation */}
            <div className="bg-[#1a6fd8]/20 border border-[#1a6fd8]/40 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold">AI Recommendation</h3>
              </div>
              <p className="text-white/80 mb-4">{result.recommendation}</p>

              {result.hybridPath && (
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">Alternative / Hybrid Path</span>
                  </div>
                  <p className="text-sm text-white/80">{result.hybridPath}</p>
                </div>
              )}
            </div>

            {/* Key Question + Parent Talk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <h3 className="font-bold text-sm">Key Question</h3>
                </div>
                <p className="text-white/80 italic">&ldquo;{result.keyQuestion}&rdquo;</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-pink-400" />
                  <h3 className="font-bold text-sm">How to Talk to Parents</h3>
                </div>
                <p className="text-white/80 text-sm">{result.parentTalk}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-400" />
                Next Steps
              </h3>
              <div className="space-y-3">
                {result.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1a6fd8] flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-white/80 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setOptionA('');
                setOptionB('');
                setContext('');
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm transition-all"
            >
              New Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
