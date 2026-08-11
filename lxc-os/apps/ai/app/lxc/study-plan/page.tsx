'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Play,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw,
  Brain,
  Target,
} from 'lucide-react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { XPBar } from '@/components/lxc/xp-bar';
import {
  loadStudentData,
  saveStudentData,
  addXP,
  unlockBadge,
  recordQuizScore,
  PREDEFINED_BADGES,
  type StudyPlanDay,
  type StudyTask,
  type LXCStudentData,
} from '@/lib/lxc/student-store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

const TASK_TYPE_COLORS: Record<string, string> = {
  learn: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  revise: 'bg-purple-900/30 text-purple-400 border-purple-800/40',
  practice: 'bg-green-900/30 text-green-400 border-green-800/40',
  rest: 'bg-gray-700/30 text-gray-400 border-gray-700/40',
};

const TASK_TYPE_ICONS: Record<string, string> = {
  learn: '📖',
  revise: '🔄',
  practice: '✏️',
  rest: '☕',
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
};

export default function StudyPlanPage() {
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [examDate, setExamDate] = useState('');
  const [strategy, setStrategy] = useState('');
  const [studentMessage, setStudentMessage] = useState('');
  const [daysCount, setDaysCount] = useState(7);
  const streamRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setData(loadStudentData());
  }, []);

  async function generatePlan() {
    if (!data?.profile) return;
    setGenerating(true);
    setError('');

    streamRef.current?.abort();
    streamRef.current = new AbortController();

    const config = getCurrentModelConfig();
    try {
      const res = await fetch('/api/lxc/study-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey,
          'x-base-url': config.baseUrl ?? '',
          'x-provider-type': config.providerType ?? '',
        },
        body: JSON.stringify({
          studentName: data.profile.name,
          class: data.profile.class,
          subjects: data.profile.subjects,
          examDate,
          studyHoursPerDay: data.profile.studyHoursPerDay,
          language: data.profile.language,
          daysToGenerate: daysCount,
          weakTopics: Object.entries(data.subjectScores)
            .filter(([, scores]) => {
              const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
              return avg < 60;
            })
            .map(([s]) => s),
          strongTopics: Object.entries(data.subjectScores)
            .filter(([, scores]) => {
              const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
              return avg >= 80;
            })
            .map(([s]) => s),
        }),
        signal: streamRef.current.signal,
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
      }

      // Parse JSON from stream
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response');
      const parsed = JSON.parse(jsonMatch[0]);

      setStrategy(parsed.strategy ?? '');
      setStudentMessage(parsed.studentMessage ?? '');

      const newData: LXCStudentData = {
        ...data,
        studyPlan: parsed.days ?? [],
        studyPlanGeneratedAt: Date.now(),
      };

      // Award XP + badge
      const withXP = addXP(newData, 100, 'Generated study plan');
      const withBadge = unlockBadge(withXP, PREDEFINED_BADGES.find((b) => b.id === 'study-plan')!);
      saveStudentData(withBadge);
      setData(withBadge);
      setActiveDay(0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Failed to generate roadmap. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }

  function toggleTask(dayIdx: number, taskIdx: number) {
    if (!data?.studyPlan) return;
    const updatedPlan = data.studyPlan.map((day, di) => {
      if (di !== dayIdx) return day;
      return {
        ...day,
        tasks: day.tasks.map((task, ti) =>
          ti === taskIdx ? { ...task, completed: !task.completed } : task,
        ),
      };
    });
    const newData = { ...data, studyPlan: updatedPlan };
    saveStudentData(newData);
    setData(newData);
  }

  const plan = data?.studyPlan;
  const currentDay = plan?.[activeDay];

  return (
    <div className="min-h-screen bg-[#0c1522]">
      <LXCNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#1a6fd8]" />
              Study Roadmap
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Module 4 — Personalized Study Roadmap Engine
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

        {/* Generate Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-4">🎯 Build your AI Study Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm text-white/60 block mb-1">
                Exam Date (optional)
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Roadmap Duration?</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
              >
                {[3, 5, 7, 10, 14].map((d) => (
                  <option key={d} value={d} className="bg-[#0d1a2d]">
                    {d} Days
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generatePlan}
                disabled={generating || !data?.profile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1a6fd8] to-[#3b8eef] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : plan ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Generate New Plan
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Plan (+100 XP)
                  </>
                )}
              </button>
            </div>
          </div>
          {!data?.profile && (
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Set up your profile first —{' '}
              <a href="/lxc" className="underline">
                Go to Hub
              </a>
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Strategy message */}
        {studentMessage && (
          <div className="bg-[#1a6fd8]/10 border border-[#1a6fd8]/30 rounded-xl p-4 mb-6">
            <p className="text-[#3b8eef] text-sm leading-relaxed">💬 {studentMessage}</p>
          </div>
        )}

        {/* Plan */}
        {plan && plan.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day selector */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Select Day
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {plan.map((day, idx) => {
                  const completedTasks = day.tasks.filter((t) => t.completed).length;
                  const totalTasks = day.tasks.length;
                  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDay(idx)}
                      className={`shrink-0 lg:shrink text-left px-4 py-3 rounded-xl border transition-all ${
                        activeDay === idx
                          ? 'bg-[#1a6fd8] border-[#1a6fd8] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8'
                      }`}
                    >
                      <p className="text-sm font-semibold whitespace-nowrap">{day.day}</p>
                      <p className="text-xs opacity-60 mt-0.5">
                        {completedTasks}/{totalTasks} tasks
                      </p>
                      <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5cc21a] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Tasks */}
            <div className="lg:col-span-3">
              {currentDay && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentDay.day}</h3>
                      {currentDay.theme && (
                        <p className="text-sm text-[#3b8eef] mt-0.5">🎯 {currentDay.theme}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/50">Total Duration</p>
                      <p className="text-base font-bold text-white">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {currentDay.totalMinutes} minutes
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentDay.tasks.map((task, taskIdx) => (
                      <div
                        key={taskIdx}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                          task.completed
                            ? 'opacity-50 bg-white/3 border-white/5'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(activeDay, taskIdx)}
                          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                            task.completed
                              ? 'bg-[#5cc21a] border-[#5cc21a]'
                              : 'border-white/30 hover:border-[#5cc21a]'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-base">{TASK_TYPE_ICONS[task.type]}</span>
                            <span className="text-sm font-semibold text-white">{task.subject}</span>
                            <span className="text-sm text-white/60">— {task.topic}</span>
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${TASK_TYPE_COLORS[task.type]}`}
                            >
                              {task.type}
                            </span>
                            <span className="text-xs text-white/40">
                              <Clock className="w-3 h-3 inline mr-0.5" />
                              {task.durationMinutes} min
                            </span>
                            {(task as StudyTask & { tip?: string }).tip && (
                              <span className="text-xs text-yellow-400/70">
                                💡 {(task as StudyTask & { tip?: string }).tip}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentDay.motivation && (
                    <div className="mt-4 p-3 bg-[#5cc21a]/10 border border-[#5cc21a]/20 rounded-xl">
                      <p className="text-sm text-[#5cc21a]">✨ {currentDay.motivation}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Adaptive Quiz Section */}
        {data?.profile && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#3b8eef]" />
              Module 5 — Adaptive Quiz
            </h2>
            <p className="text-sm text-white/50 mb-4">
              AI automatically adjusts difficulty based on your performance (IRT Algorithm)
            </p>
            <AdaptiveQuizSection data={data} onDataChange={setData} />
          </div>
        )}
      </div>
    </div>
  );
}

// Adaptive Quiz embedded component
function AdaptiveQuizSection({
  data,
  onDataChange,
}: {
  data: LXCStudentData;
  onDataChange: (d: LXCStudentData) => void;
}) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<{
    questions: Array<{
      id: number;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      concept: string;
    }>;
    difficulty: string;
    difficultyHi: string;
    adaptiveNote: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const subjects = data.profile?.subjects ?? [];

  async function generateQuiz() {
    if (!subject || !topic) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);

    const config = getCurrentModelConfig();
    const recentScores = data.subjectScores[subject] ?? [];

    try {
      const res = await fetch('/api/lxc/adaptive-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': config.modelString,
          'x-api-key': config.apiKey,
          'x-base-url': config.baseUrl ?? '',
          'x-provider-type': config.providerType ?? '',
        },
        body: JSON.stringify({
          subject,
          topic,
          studentClass: data.profile?.class,
          recentScores,
          language: data.profile?.language ?? 'hindi',
          questionCount: 5,
        }),
      });
      const json = await res.json();
      if (json.success) setQuiz(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function submitQuiz() {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setScore(pct);
    setSubmitted(true);

    // Record score
    const updated = recordQuizScore(data, subject, pct);

    // Check for ace badge
    if (pct >= 90) {
      const withBadge = unlockBadge(updated, PREDEFINED_BADGES.find((b) => b.id === 'quiz-ace')!);
      onDataChange(withBadge);
    } else {
      onDataChange(updated);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="" className="bg-[#0d1a2d]">
            Select Subject
          </option>
          {subjects.map((s) => (
            <option key={s} value={s} className="bg-[#0d1a2d]">
              {s}
            </option>
          ))}
        </select>
        <input
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a6fd8]"
          placeholder="Topic (e.g. Quadratic Equations)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={generateQuiz}
          disabled={!subject || !topic || loading}
          className="py-2 rounded-lg bg-[#1a6fd8] text-white text-sm font-medium hover:bg-[#3b8eef] transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating...' : '🎯 Build Quiz'}
        </button>
      </div>

      {quiz && (
        <div>
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                quiz.difficulty === 'basic'
                  ? 'bg-green-900/40 text-green-400'
                  : quiz.difficulty === 'intermediate'
                    ? 'bg-yellow-900/40 text-yellow-400'
                    : 'bg-red-900/40 text-red-400'
              }`}
            >
              {quiz.difficultyHi} — {quiz.difficulty}
            </span>
            <p className="text-xs text-white/50">{quiz.adaptiveNote}</p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, qi) => {
              const selected = answers[q.id];
              const isCorrect = submitted && selected === q.correctIndex;
              const isWrong = submitted && selected !== undefined && selected !== q.correctIndex;

              return (
                <div key={q.id} className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm font-medium text-white mb-3">
                    Q{qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const showCorrect = submitted && oi === q.correctIndex;
                      const showWrong = submitted && isSelected && oi !== q.correctIndex;
                      return (
                        <button
                          key={oi}
                          onClick={() => !submitted && setAnswers((a) => ({ ...a, [q.id]: oi }))}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                            showCorrect
                              ? 'bg-green-900/30 border-green-500 text-green-300'
                              : showWrong
                                ? 'bg-red-900/30 border-red-500 text-red-300'
                                : isSelected
                                  ? 'bg-[#1a6fd8]/30 border-[#1a6fd8] text-white'
                                  : 'bg-white/3 border-white/10 text-white/70 hover:bg-white/8'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="text-xs text-yellow-400/80 mt-2">💡 {q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < quiz.questions.length}
              className="mt-4 w-full py-3 rounded-xl bg-[#5cc21a] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              ✅ Submit Quiz
            </button>
          ) : (
            <div className="mt-4 p-4 bg-white/5 rounded-xl text-center">
              <p className="text-2xl font-bold text-white mb-1">{score}%</p>
              <p className="text-sm text-white/60 mb-2">
                {score! >= 90
                  ? '🏆 Fantastic! Quiz Ace Badge unlocked!'
                  : score! >= 70
                    ? '👍 Good effort!'
                    : '📚 Practice more'}
              </p>
              <button
                onClick={() => {
                  setQuiz(null);
                  setAnswers({});
                  setSubmitted(false);
                  setScore(null);
                }}
                className="text-sm text-[#3b8eef] hover:underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
