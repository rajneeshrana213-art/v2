'use client';

import { useState, useEffect } from 'react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { getLXCStudentData, getLXCLevel } from '@/lib/lxc/student-store';
import {
  Users,
  BarChart2,
  BookOpen,
  Star,
  TrendingUp,
  Clock,
  Award,
  Share2,
  Download,
} from 'lucide-react';

const LEVEL_NAMES = [
  'New Disciple',
  'Curious Student',
  'Hardworking Learner',
  'Smart Reader',
  'Quick Thinker',
  'Skilled Scholar',
  'Knowledge Seeker',
  'Scholar',
  'Genius',
  'RIT AI Prodigy',
];

export default function ParentPage() {
  const [data, setData] = useState<ReturnType<typeof getLXCStudentData> | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setData(getLXCStudentData());
  }, []);

  if (!data || !data.profile) {
    return (
      <div className="min-h-screen bg-[#0c1522] text-white flex items-center justify-center">
        <LXCNav />
        <div className="text-center">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Please create a LXC profile first</p>
        </div>
      </div>
    );
  }

  const level = getLXCLevel(data.totalXP);
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];

  const totalStudyMinutes = data.studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.floor(totalStudyMinutes / 60);
  const totalMins = totalStudyMinutes % 60;

  const subjectCounts: Record<string, number> = {};
  data.studySessions.forEach((s) => {
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgScore = data.studySessions.filter((s) => s.quizScore !== undefined).length
    ? Math.round(
        data.studySessions
          .filter((s) => s.quizScore !== undefined)
          .reduce((sum, s) => sum + (s.quizScore || 0), 0) /
          data.studySessions.filter((s) => s.quizScore !== undefined).length,
      )
    : null;

  const recentSessions = data.studySessions.slice(0, 5);

  const handleCopyReport = () => {
    const report = `
📊 LearnXChain — Progress Report
👤 Student: ${data.profile!.name}
🎓 Class: ${data.profile!.class} | Board: ${data.profile!.board}
📅 Generated: ${new Date().toLocaleDateString('hi-IN')}

⚡ Total XP: ${data.totalXP.toLocaleString()}
🏆 Level ${level}: ${levelName}
📚 Total Study Time: ${totalHours}h ${totalMins}min
📝 Study Sessions: ${data.studySessions.length}
🏅 Badges Earned: ${data.badges.length}
${avgScore !== null ? `📊 Average Quiz Score: ${avgScore}%` : ''}
🔥 Current Streak: ${data.streak.currentStreak} days

Powered by LearnXChain (LXC) — Rit AI
    `.trim();

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0c1522] text-white">
      <LXCNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1 text-sm text-green-300 mb-4">
            <Users className="w-4 h-4" />
            Module 18 — Parent Intelligence Module
          </div>
          <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
          <p className="text-white/60">For parents — track your child's complete learning progress</p>
        </div>

        {/* Share Button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm hover:bg-green-500/30 transition-all"
          >
            {copied ? (
              '✅ Copied!'
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Copy Report
              </>
            )}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 text-sm hover:bg-blue-500/30 transition-all">
            <Download className="w-4 h-4" /> PDF Download
          </button>
        </div>

        {/* Student Summary Card */}
        <div className="bg-gradient-to-br from-[#1a6fd8]/30 to-[#5cc21a]/20 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{data.profile.name}</h2>
              <p className="text-white/60">
                {data.profile.class} | {data.profile.board}
              </p>
              <p className="text-white/60">
                Subjects: {data.profile.subjects.slice(0, 3).join(', ')}
                {data.profile.subjects.length > 3 ? '...' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-[#1a6fd8]/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-3xl font-bold text-[#1a6fd8]">{level}</p>
                <p className="text-xs text-white/60">Level</p>
                <p className="text-xs text-white/50 mt-1">{levelName}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-400">{data.totalXP.toLocaleString()}</p>
              <p className="text-xs text-white/50">Total XP</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-400">
                {totalHours}h {totalMins}m
              </p>
              <p className="text-xs text-white/50">Study Time</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-400">{data.badges.length}</p>
              <p className="text-xs text-white/50">Badges</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400">{data.streak.currentStreak}</p>
              <p className="text-xs text-white/50">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Quiz Performance */}
        {avgScore !== null && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">Quiz Performance</h3>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="text-4xl font-bold"
                style={{
                  color: avgScore >= 70 ? '#5cc21a' : avgScore >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                {avgScore}%
              </div>
              <div>
                <p className="font-medium">
                  {avgScore >= 80
                    ? 'Excellent! 🌟'
                    : avgScore >= 60
                      ? 'Good Performance 👍'
                      : 'Needs Improvement 💪'}
                </p>
                <p className="text-sm text-white/50">
                  {data.studySessions.filter((s) => s.quizScore !== undefined).length} quizzes
                  completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subject Breakdown */}
        {topSubjects.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Subject Focus</h3>
            </div>
            <div className="space-y-3">
              {topSubjects.map(([subject, count]) => (
                <div key={subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{subject}</span>
                    <span className="text-white/50">{count} sessions</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1a6fd8] to-[#5cc21a] rounded-full"
                      style={{ width: `${(count / (topSubjects[0][1] || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {data.badges.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold">Earned Badges ({data.badges.length})</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2"
                >
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <p className="text-xs font-bold">{b.name}</p>
                    <p className="text-xs text-white/40">
                      {new Date(b.unlockedAt).toLocaleDateString('hi-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-400" />
              <h3 className="font-bold">Recent Study Sessions</h3>
            </div>
            <div className="space-y-3">
              {recentSessions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/5 pb-2"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {s.subject} — {s.topic}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(s.timestamp).toLocaleDateString('hi-IN')} • {s.durationMinutes} minutes
                    </p>
                  </div>
                  {s.quizScore !== undefined && (
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded-lg ${s.quizScore >= 70 ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}
                    >
                      {s.quizScore}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career */}
        {(data.careerProfile?.suggestedCareers?.length ?? 0) > 0 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Career Direction</h3>
            </div>
            <p className="text-sm text-white/60 mb-3">
              According to AI assessment, {data.profile.name} is suited for these careers:
            </p>
            <div className="flex flex-wrap gap-2">
              {(data.careerProfile?.suggestedCareers || []).slice(0, 5).map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips for Parents */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold">Parent Tips</h3>
          </div>
          <ul className="space-y-3">
            {[
              `${data.profile.name} studies ${data.profile.studyHoursPerDay} hours daily — encourage this habit`,
              'Limit leisure screen time but keep LXC learning time separate',
              'Do not judge by quiz results — celebrate the effort',
              'Support their career choices — explore the careers suggested by AI together',
              `${data.streak.currentStreak}-day streak is a major achievement — celebrate it!`,
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-yellow-400 shrink-0 mt-0.5">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
