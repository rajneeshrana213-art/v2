'use client';

import { useEffect, useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Brain,
  Clock,
  Zap,
} from 'lucide-react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { XPBar } from '@/components/lxc/xp-bar';
import {
  loadStudentData,
  getWeakSubjects,
  getStrongSubjects,
  getAverageScore,
  recordStudySession,
  type LXCStudentData,
} from '@/lib/lxc/student-store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

interface CognitiveReport {
  productivityScore: number;
  productivityLabel: string;
  focusAnalysis: string;
  breakAdvice: string;
  forgettingCurveMessage: string;
  revisionAlerts: Array<{
    subject: string;
    topic: string;
    message: string;
    urgency: string;
  }>;
  studyTips: string[];
  pomodoroRecommendation: string;
  brainFoodTip: string;
  motivationalMessage: string;
  breakRecommendation?: { type: string; minutes: number; reason: string } | null;
  forgettingAlerts?: Array<{ subject: string; topic: string; daysAgo: number; urgency: string }>;
}

export default function PerformancePage() {
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [cogReport, setCogReport] = useState<CognitiveReport | null>(null);
  const [loadingCog, setLoadingCog] = useState(false);
  const [focusTimer, setFocusTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [logSubject, setLogSubject] = useState('');
  const [logTopic, setLogTopic] = useState('');
  const [logMinutes, setLogMinutes] = useState(30);
  const [logSaved, setLogSaved] = useState(false);

  useEffect(() => {
    setData(loadStudentData());
  }, []);

  // Focus timer
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setFocusTimer((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [timerRunning]);

  async function loadCognitiveReport() {
    if (!data) return;
    setLoadingCog(true);
    const config = getCurrentModelConfig();
    try {
      const res = await fetch('/api/lxc/cognitive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey,
          'x-base-url': config.baseUrl ?? '',
          'x-provider-type': config.providerType ?? '',
        },
        body: JSON.stringify({
          studySessions: data.studySessions.slice(0, 20),
          currentFocusMinutes: focusTimer,
          language: data.profile?.language ?? 'hindi',
        }),
      });
      const json = await res.json();
      if (json.success) setCogReport(json.data);
    } catch {
      // ignore
    } finally {
      setLoadingCog(false);
    }
  }

  function logSession() {
    if (!data || !logSubject || !logTopic) return;
    const updated = recordStudySession(data, {
      subject: logSubject,
      topic: logTopic,
      durationMinutes: logMinutes,
      type: 'learn',
    });
    setData(updated);
    setLogSaved(true);
    setTimeout(() => setLogSaved(false), 3000);
    setLogSubject('');
    setLogTopic('');
  }

  const weak = data ? getWeakSubjects(data) : [];
  const strong = data ? getStrongSubjects(data) : [];
  const overallAvg = data ? getAverageScore(data) : 0;

  const subjectScoreEntries = Object.entries(data?.subjectScores ?? {}).map(([sub, scores]) => ({
    subject: sub,
    avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    count: scores.length,
    trend: scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0,
  }));

  return (
    <div className="min-h-screen bg-[#0c1522]">
      <LXCNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-green-400" />
              Performance Dashboard
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Module 6 + 7 — Performance Intelligence & Cognitive Optimization
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

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon="📊" label="Overall Average" value={`${overallAvg}%`} color="blue" />
          <StatCard
            icon="📚"
            label="Study Sessions"
            value={data?.studySessions.length ?? 0}
            color="green"
          />
          <StatCard
            icon="⚠️"
            label="Weak Topics"
            value={weak.length}
            color={weak.length > 0 ? 'red' : 'green'}
          />
          <StatCard icon="🏆" label="Strong Topics" value={strong.length} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Subject Performance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">📈 Subject Performance</h2>
            {subjectScoreEntries.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No data yet. Take a quiz!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectScoreEntries.map((entry) => (
                  <div key={entry.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{entry.subject}</span>
                        {entry.trend > 5 && <TrendingUp className="w-3 h-3 text-green-400" />}
                        {entry.trend < -5 && <TrendingDown className="w-3 h-3 text-red-400" />}
                        {Math.abs(entry.trend) <= 5 && <Minus className="w-3 h-3 text-white/30" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{entry.count} quizzes</span>
                        <span
                          className={`text-sm font-bold ${
                            entry.avg >= 80
                              ? 'text-green-400'
                              : entry.avg >= 60
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        >
                          {entry.avg}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          entry.avg >= 80
                            ? 'bg-green-400'
                            : entry.avg >= 60
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                        }`}
                        style={{ width: `${entry.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak/Strong */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">🎯 Focus Areas</h2>
            {weak.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Weak Subjects (avg &lt; 60%)
                </p>
                <div className="flex flex-wrap gap-2">
                  {weak.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-xs border border-red-800/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {strong.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Strong Subjects (avg ≥ 80%)
                </p>
                <div className="flex flex-wrap gap-2">
                  {strong.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs border border-green-800/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {weak.length === 0 && strong.length === 0 && (
              <div className="text-center py-6 text-white/40 text-sm">
                Analysis will appear here after taking a quiz
              </div>
            )}
          </div>
        </div>

        {/* Study Session Logger */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3b8eef]" />
            📝 Log Study Session
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              value={logSubject}
              onChange={(e) => setLogSubject(e.target.value)}
            >
              <option value="" className="bg-[#0d1a2d]">
                Select Subject
              </option>
              {(data?.profile?.subjects ?? []).map((s) => (
                <option key={s} value={s} className="bg-[#0d1a2d]">
                  {s}
                </option>
              ))}
            </select>
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              placeholder="Topic"
              value={logTopic}
              onChange={(e) => setLogTopic(e.target.value)}
            />
            <select
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              value={logMinutes}
              onChange={(e) => setLogMinutes(Number(e.target.value))}
            >
              {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m} className="bg-[#0d1a2d]">
                  {m} min
                </option>
              ))}
            </select>
            <button
              onClick={logSession}
              disabled={!logSubject || !logTopic}
              className={`py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                logSaved ? 'bg-green-600 text-white' : 'bg-[#1a6fd8] text-white hover:bg-[#3b8eef]'
              }`}
            >
              {logSaved ? '✅ Saved!' : '+ Log Session'}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">
            * Logging a session awards XP and tracks Ebbinghaus forgetting curve
          </p>
        </div>

        {/* Cognitive Optimization Module 7 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-400" />
                Module 7 — Cognitive Optimization Engine
              </h2>
              <p className="text-sm text-white/40 mt-0.5">
                Ebbinghaus forgetting curve + Focus timer + Break recommendations
              </p>
            </div>
            <button
              onClick={loadCognitiveReport}
              disabled={loadingCog}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-900/30 text-pink-400 text-sm hover:bg-pink-900/50 transition-colors disabled:opacity-50"
            >
              {loadingCog ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {cogReport ? 'Refresh' : 'Run Analysis'}
            </button>
          </div>

          {/* Focus timer */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{focusTimer}</p>
              <p className="text-xs text-white/40">minutes focus</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimerRunning((r) => !r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timerRunning
                    ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                    : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'
                }`}
              >
                {timerRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={() => {
                  setFocusTimer(0);
                  setTimerRunning(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10"
              >
                Reset
              </button>
            </div>
            {focusTimer >= 45 && (
              <div className="flex-1 p-2 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                <p className="text-yellow-400 text-xs">
                  ⏰{' '}
                  {focusTimer >= 90 ? 'Take a 15-minute long break!' : 'Time for a 5-minute break!'}
                </p>
              </div>
            )}
          </div>

          {cogReport && (
            <div className="space-y-4">
              {/* Productivity score */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-16 h-16 rounded-full border-4 border-[#1a6fd8] flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {cogReport.productivityScore}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{cogReport.productivityLabel}</p>
                  <p className="text-xs text-white/50 mt-1">{cogReport.focusAnalysis}</p>
                </div>
              </div>

              {/* Revision alerts */}
              {cogReport.revisionAlerts?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-orange-400 mb-2">
                    🔔 Revision Alerts ({cogReport.revisionAlerts.length})
                  </p>
                  <div className="space-y-2">
                    {cogReport.revisionAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-sm ${
                          alert.urgency === 'high'
                            ? 'bg-red-900/20 border-red-800/30 text-red-300'
                            : alert.urgency === 'medium'
                              ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-300'
                              : 'bg-blue-900/20 border-blue-800/30 text-blue-300'
                        }`}
                      >
                        <span className="font-medium">{alert.subject}</span> — {alert.topic}:{' '}
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study tips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cogReport.studyTips?.map((tip, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl text-xs text-white/70">
                    💡 {tip}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#5cc21a]/10 border border-[#5cc21a]/20 rounded-xl">
                <p className="text-sm text-[#5cc21a]">✨ {cogReport.motivationalMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {data?.studySessions && data.studySessions.length > 0 && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">📝 Recent Study Sessions</h2>
            <div className="space-y-2">
              {data.studySessions.slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-white/3 rounded-xl text-sm"
                >
                  <div>
                    <span className="font-medium text-white">{s.subject}</span>
                    <span className="text-white/50 mx-2">—</span>
                    <span className="text-white/70">{s.topic}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <span>{s.durationMinutes} min</span>
                    {s.quizScore !== undefined && (
                      <span
                        className={`font-medium ${s.quizScore >= 80 ? 'text-green-400' : s.quizScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        {s.quizScore}%
                      </span>
                    )}
                    <span>{new Date(s.timestamp).toLocaleDateString('hi-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-800/30 bg-blue-900/10',
    green: 'border-green-800/30 bg-green-900/10',
    red: 'border-red-800/30 bg-red-900/10',
    yellow: 'border-yellow-800/30 bg-yellow-900/10',
  };
  return (
    <div
      className={`rounded-xl border p-4 text-center ${colorMap[color] ?? 'bg-white/5 border-white/10'}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
