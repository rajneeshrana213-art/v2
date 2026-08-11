'use client';

import { useEffect, useState } from 'react';
import { Gamepad2, Star, Zap, Trophy, Award, Target, TrendingUp, Flame, Lock } from 'lucide-react';
import { LXCNav } from '@/components/lxc/lxc-nav';
import { XPBar } from '@/components/lxc/xp-bar';
import {
  loadStudentData,
  xpToNextLevel,
  PREDEFINED_BADGES,
  type LXCStudentData,
} from '@/lib/lxc/student-store';

const LEVEL_TITLES = [
  { level: 1, title: 'Beginner', titleEn: 'Beginner', icon: '🌱', xpRequired: 0 },
  { level: 2, title: 'Curious Learner', titleEn: 'Curious Learner', icon: '📖', xpRequired: 500 },
  { level: 3, title: 'Practitioner', titleEn: 'Practitioner', icon: '✏️', xpRequired: 1000 },
  { level: 4, title: 'Scholar', titleEn: 'Scholar', icon: '🎓', xpRequired: 1500 },
  { level: 5, title: 'Knowledge Seeker', titleEn: 'Knowledge Seeker', icon: '🔬', xpRequired: 2000 },
  { level: 6, title: 'Expert', titleEn: 'Expert', icon: '⭐', xpRequired: 2500 },
  { level: 7, title: 'Master', titleEn: 'Master', icon: '🏆', xpRequired: 3000 },
  { level: 8, title: 'Grand Master', titleEn: 'Grand Master', icon: '👑', xpRequired: 4000 },
  { level: 9, title: 'Legend', titleEn: 'Legend', icon: '🌟', xpRequired: 5000 },
  { level: 10, title: 'Rit AI Genius', titleEn: 'Rit AI Genius', icon: '🧠', xpRequired: 7500 },
];

const XP_ACTIVITIES = [
  { activity: 'Log a study session', xp: '2 XP/min', icon: '📝' },
  { activity: 'Take a quiz', xp: '0.5 XP/% scored', icon: '🎯' },
  { activity: 'Career quiz complete', xp: '150 XP', icon: '🧭' },
  { activity: 'Study plan generate', xp: '100 XP', icon: '📅' },
  { activity: 'Profile setup', xp: '50 XP', icon: '👤' },
  { activity: 'Lesson companion use', xp: '30 XP', icon: '🤖' },
  { activity: 'Daily streak maintain', xp: 'Bonus badge', icon: '🔥' },
];

export default function GamificationPage() {
  const [data, setData] = useState<LXCStudentData | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    setData(loadStudentData());
    
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/lxc/leaderboard');
        const resJson = await res.json();
        if (resJson.success && resJson.data?.leaderboard) {
          setLeaderboard(resJson.data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      }
    };
    fetchLeaderboard();
  }, []);

  const level = data?.level ?? 1;
  const totalXP = data?.totalXP ?? 0;
  const { current, needed, progress } = xpToNextLevel(totalXP);
  const currentLevelInfo = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  const nextLevelInfo = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];

  const unlockedBadgeIds = new Set(data?.badges?.map((b) => b.id) ?? []);

  return (
    <div className="min-h-screen bg-[#0c1522]">
      <LXCNav />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-orange-400" />
              Gamification — XP & Achievements
            </h1>
            <p className="text-white/50 text-sm mt-1">Module 14 — Gamified Learning Engine</p>
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

        {/* Hero Level Card */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#1a6fd8]/30 rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 text-8xl">⭐</div>
            <div className="absolute bottom-4 left-4 text-8xl">🏆</div>
          </div>

          <div className="relative">
            <div className="text-6xl mb-3">{currentLevelInfo?.icon ?? '🌱'}</div>
            <div className="inline-flex items-center gap-2 bg-[#1a6fd8]/20 border border-[#1a6fd8]/30 rounded-full px-4 py-1 mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-white font-medium">Level {level}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {currentLevelInfo?.title ?? 'Beginner'}
            </h2>
            <p className="text-white/50 text-sm mb-6">{currentLevelInfo?.titleEn}</p>

            {/* XP Progress */}
            <div className="max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>{current} XP</span>
                <span>
                  {needed} XP needed for Level {level + 1}
                </span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1a6fd8] to-[#5cc21a] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/30 mt-2">
                {progress}% to <span className="text-[#5cc21a]">{nextLevelInfo?.title}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatGem icon="⭐" label="Total XP" value={totalXP} color="yellow" />
          <StatGem
            icon="🔥"
            label="Current Streak"
            value={`${data?.streak.currentStreak ?? 0}d`}
            color="orange"
          />
          <StatGem
            icon="🏆"
            label="Longest Streak"
            value={`${data?.streak.longestStreak ?? 0}d`}
            color="red"
          />
          <StatGem
            icon="🎖️"
            label="Badges Earned"
            value={data?.badges.length ?? 0}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Badge Collection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Badge Collection
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_BADGES.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);
                const earnedBadge = data?.badges.find((b) => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-yellow-900/20 border-yellow-700/30'
                        : 'bg-white/3 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{isUnlocked ? badge.icon : '🔒'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{badge.name}</p>
                        <p className="text-xs text-white/40 truncate">{badge.nameHi}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/50">{badge.description}</p>
                    {isUnlocked && earnedBadge && (
                      <p className="text-xs text-yellow-400 mt-1">
                        ✅ {new Date(earnedBadge.unlockedAt).toLocaleDateString('hi-IN')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Tree */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Level Tree
            </h2>
            <div className="space-y-2">
              {LEVEL_TITLES.map((lvl) => {
                const isReached = level >= lvl.level;
                const isCurrent = level === lvl.level;
                return (
                  <div
                    key={lvl.level}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-[#1a6fd8]/20 border border-[#1a6fd8]/40'
                        : isReached
                          ? 'bg-[#5cc21a]/10'
                          : 'opacity-40'
                    }`}
                  >
                    <span className="text-lg">{isReached ? lvl.icon : '🔒'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Level {lvl.level} — {lvl.title}
                      </p>
                      <p className="text-xs text-white/40">{lvl.xpRequired} XP</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-[#1a6fd8] text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                    {!isReached && <Lock className="w-3 h-3 text-white/30" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* XP Activities */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            How to earn XP?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {XP_ACTIVITIES.map((act) => (
              <div key={act.activity} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-xl">{act.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{act.activity}</p>
                </div>
                <span className="text-sm font-bold text-[#5cc21a] shrink-0">{act.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard & XP History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent XP History */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Recent XP Earned
            </h2>
            {data?.xpHistory && data.xpHistory.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {data.xpHistory.slice(0, 10).map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white/3 rounded-xl"
                  >
                    <p className="text-sm text-white/70">{entry.reason}</p>
                    <div className="flex items-center gap-1 text-[#5cc21a] font-bold text-sm">
                      <Zap className="w-3 h-3" />+{entry.amount} XP
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-8">No XP earned yet. Start a session or quiz!</p>
            )}
          </div>

          {/* Global Leaderboard */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Global XP Leaderboard
            </h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {leaderboard.map((user, idx) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      idx === 0
                        ? 'bg-yellow-950/20 border border-yellow-700/20'
                        : idx === 1
                          ? 'bg-slate-300/10'
                          : idx === 2
                            ? 'bg-amber-900/10'
                            : 'bg-white/3'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-white/40 w-4">#{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[#1a6fd8] flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#5cc21a] font-bold text-sm shrink-0">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {user.reputation} XP
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Fallback mock leaderboard if server has no other users */}
                {[
                  { id: '1', name: 'Rajneesh Rana', reputation: 4320 },
                  { id: '2', name: 'Ananya Sharma', reputation: 3850 },
                  { id: '3', name: 'Piyush Patel', reputation: 2900 },
                  { id: '4', name: 'Karan Singh', reputation: 2150 },
                  { id: '5', name: 'Sneha Gupta', reputation: 1800 },
                ].map((mockUser, idx) => (
                  <div
                    key={mockUser.id}
                    className="flex items-center justify-between p-2.5 bg-white/3 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-white/40 w-4">#{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[#1a6fd8]/30 border border-[#1a6fd8]/50 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {mockUser.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-white">{mockUser.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#5cc21a] font-bold text-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {mockUser.reputation} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatGem({
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
  const colors: Record<string, string> = {
    yellow: 'from-yellow-900/30 to-orange-900/30 border-yellow-800/30',
    orange: 'from-orange-900/30 to-red-900/30 border-orange-800/30',
    red: 'from-red-900/30 to-pink-900/30 border-red-800/30',
    purple: 'from-purple-900/30 to-pink-900/30 border-purple-800/30',
  };
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 text-center ${colors[color] ?? 'bg-white/5 border-white/10'}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
