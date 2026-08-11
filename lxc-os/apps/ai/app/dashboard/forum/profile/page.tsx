'use client';

import { useState, useEffect } from 'react';
import { User, BookOpen, Star, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = 'New User';
  let color = 'bg-slate-800 text-slate-400 border border-slate-700';
  let emoji = '🌱';
  if (reputation >= 2000) {
    level = 'Master';
    color = 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
    emoji = '🏆';
  } else if (reputation >= 500) {
    level = 'Expert';
    color = 'bg-violet-500/10 text-violet-400 border border-violet-500/25';
    emoji = '⚡';
  } else if (reputation >= 100) {
    level = 'Contributor';
    color = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    emoji = '🎯';
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${color}`}
    >
      <span>{emoji}</span>
      <span>{level}</span>
    </span>
  );
}

export default function ForumUserProfileDetails() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/v1/forum/profile')
      .then((res) => setProfile(res))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load profile details');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-xs text-white/40">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Premium Profile Hero Card */}
      <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-500/5 blur-xl pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-2xl font-black text-white border border-white/10 shadow-lg select-none">
            {profile?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-black text-white truncate leading-none">
              {profile?.name}
            </h1>
            <p className="text-xs text-white/40 truncate mt-1">{profile?.email}</p>
            <div className="mt-3.5">
              <ReputationBadge reputation={profile?.reputation || 0} />
            </div>
          </div>
        </div>

        {/* Dynamic stat quick view tabs */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-5 text-center">
          {[
            { label: 'Total Coins', value: profile?.coins || 0, icon: Star, color: 'text-amber-400' },
            {
              label: 'Reputation',
              value: profile?.reputation || 0,
              icon: TrendingUp,
              color: 'text-violet-400',
            },
            {
              label: 'Doubt Answers',
              value: profile?.doubtReplies?.length || 0,
              icon: BookOpen,
              color: 'text-blue-400',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/5 rounded-xl p-3">
              <stat.icon className={`mx-auto mb-1.5 h-4.5 w-4.5 ${stat.color} shrink-0`} />
              <div className="text-base md:text-lg font-black text-white leading-none font-mono">
                {stat.value}
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-semibold mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expertise details card */}
      {profile?.forumUserProfile && (
        <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-5 shadow-xl">
          <h3 className="mb-4.5 text-xs font-black tracking-wide text-white/90 uppercase">
            Fields of Expertise
          </h3>
          <div className="space-y-4">
            {profile.forumUserProfile.educationLevel && (
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-violet-400 shrink-0">
                  <BookOpen className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none">Education Level</p>
                  <p className="text-xs font-extrabold text-white/90 mt-1">
                    {profile.forumUserProfile.educationLevel}
                  </p>
                </div>
              </div>
            )}
            {profile.forumUserProfile.subjectsExpertise && (
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-violet-400 shrink-0">
                  <Star className="h-4 w-4 shrink-0" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none">Subjects of Expertise</p>
                  <p className="text-xs font-extrabold text-white/90 mt-1">
                    {profile.forumUserProfile.subjectsExpertise}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-violet-400 shrink-0">
                <Calendar className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider leading-none">Member Since</p>
                <p className="text-xs font-extrabold text-white/90 mt-1">
                  {format(new Date(profile?.createdAt), 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gamification Level Guidelines progress */}
      <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-5 shadow-xl">
        <h3 className="mb-4.5 text-xs font-black tracking-wide text-white/90 uppercase">
          Reputation Progression System
        </h3>
        <div className="space-y-2.5">
          {[
            { level: 'New User', min: 0, max: 99, emoji: '🌱', bg: 'bg-slate-800 border-slate-700 text-slate-400' },
            { level: 'Contributor', min: 100, max: 499, emoji: '🎯', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
            { level: 'Expert', min: 500, max: 1999, emoji: '⚡', bg: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
            { level: 'Master', min: 2000, max: Infinity, emoji: '🏆', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
          ].map((tier) => {
            const current = profile?.reputation || 0;
            const isActive = current >= tier.min && current <= tier.max;
            const isUnlocked = current >= tier.min;
            return (
              <div
                key={tier.level}
                className={`flex items-center justify-between rounded-xl p-3.5 border transition-all ${
                  isActive
                    ? 'border-violet-500/30 bg-violet-600/10 shadow-[inset_0_0_12px_rgba(139,92,246,0.05)]'
                    : isUnlocked
                      ? 'border-white/5 bg-white/5'
                      : 'border-white/5 bg-white/5 opacity-30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0 select-none">{tier.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white/90">
                      {tier.level}
                    </p>
                    <p className="text-[10px] text-white/30 font-semibold font-mono mt-0.5">
                      {tier.max === Infinity
                        ? `${tier.min}+ reputation`
                        : `${tier.min}–${tier.max} reputation`}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[8px] font-black uppercase text-violet-400">
                    Current Level
                  </span>
                )}
                {isUnlocked && !isActive && (
                  <span className="text-emerald-400 text-xs font-bold font-sans">✓ Unlocked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
