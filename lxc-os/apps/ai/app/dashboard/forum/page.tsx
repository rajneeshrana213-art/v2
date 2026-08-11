'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = 'New User';
  let color = 'bg-slate-800 text-slate-400 border border-slate-700';
  if (reputation >= 2000) {
    level = 'Master';
    color = 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
  } else if (reputation >= 500) {
    level = 'Expert';
    color = 'bg-violet-500/10 text-violet-400 border border-violet-500/25';
  } else if (reputation >= 100) {
    level = 'Contributor';
    color = 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
  }
  return (
    <span
      className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${color}`}
    >
      {level}
    </span>
  );
}

export default function ForumDashboardOverview() {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, lbRes] = await Promise.all([
        client.get('/v1/forum/profile'),
        client.get('/v1/forum/leaderboard?limit=5'),
      ]);
      setProfile(profileRes);
      setLeaderboard(lbRes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="text-sm text-white/40">Syncing session & fetching dashboard...</p>
      </div>
    );
  }

  const acceptedAnswers =
    profile?.doubtReplies?.filter((r: any) => r.isAccepted).length || 0;
  const totalAnswers = profile?.doubtReplies?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/40 via-purple-600/30 to-[#0e0c18] border border-violet-500/20 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/20 to-purple-600/25 border border-violet-500/30 shadow-inner">
            <UserIcon className="h-6 w-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Welcome back, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <div className="mt-2 flex items-center flex-wrap gap-2.5">
              <ReputationBadge reputation={profile?.reputation || 0} />
              <span className="text-xs text-white/50 font-medium">
                {profile?.reputation || 0} reputation points earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Reward Coins',
            value: profile?.coins || 0,
            icon: Star,
            color: 'text-amber-400',
            bg: 'from-amber-500/10 to-amber-600/5 border-amber-500/15',
          },
          {
            label: 'Total Answers',
            value: totalAnswers,
            icon: MessageSquare,
            color: 'text-blue-400',
            bg: 'from-blue-500/10 to-blue-600/5 border-blue-500/15',
          },
          {
            label: 'Accepted Answers',
            value: acceptedAnswers,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/15',
          },
          {
            label: 'Forum Reputation',
            value: profile?.reputation || 0,
            icon: TrendingUp,
            color: 'text-violet-400',
            bg: 'from-violet-500/10 to-violet-600/5 border-violet-500/15',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl bg-gradient-to-b ${stat.bg} border p-5 hover:scale-[1.02] transition-transform duration-200 shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="mt-4 text-3xl font-black text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-side feed grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Answers */}
        <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-black tracking-wide text-white/90">
                Recent Answers
              </h2>
              <Link
                href="/dashboard/forum/my-answers"
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {profile?.doubtReplies?.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-white/10" />
                <p className="text-xs text-white/40">No answers posted yet</p>
                <Link
                  href="/dashboard/forum/doubts"
                  className="mt-3 inline-block text-xs font-semibold text-violet-400 hover:underline"
                >
                  Browse doubts to answer &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {profile?.doubtReplies?.slice(0, 4).map((reply: any) => (
                  <Link
                    key={reply.id}
                    href={`/dashboard/forum/doubts/${reply.doubt.id}`}
                    className="block rounded-xl border border-white/5 bg-white/5 p-3.5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-xs font-bold text-white/90">
                        {reply.doubt.title}
                      </p>
                      {reply.isAccepted && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-[11px] text-white/40 leading-relaxed">
                      {reply.content}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-white/30 font-semibold font-mono">
                      <span>👍 {reply.upvotes}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(reply.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Contributors Leaderboard Preview */}
        <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-black tracking-wide text-white/90">
                Top Contributors
              </h2>
              <Link
                href="/dashboard/forum/leaderboard"
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
              >
                Full board <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {leaderboard.slice(0, 4).map((user: any, idx: number) => {
                const colors = [
                  'from-amber-400 to-yellow-500 text-amber-950',
                  'from-slate-300 to-slate-400 text-slate-950',
                  'from-orange-400 to-amber-600 text-orange-950',
                  'bg-white/5 border border-white/10 text-white/70',
                ];
                const rankColor = colors[idx] || colors[3];
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black bg-gradient-to-br ${rankColor}`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-white/90">
                        {user.name}
                      </p>
                      <p className="text-[9px] font-semibold text-white/30 capitalize tracking-wider mt-0.5">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/25 px-2 py-1 text-amber-400 text-xs font-black font-mono">
                      <Star className="h-3 w-3 fill-current shrink-0" />
                      <span>{user.coins}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <Link
        href="/dashboard/forum/doubts"
        className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/25 via-purple-600/10 to-[#0e0c18] border border-violet-500/15 p-6 hover:border-violet-500/40 hover:from-violet-600/35 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 shadow-lg group-hover:scale-105 transition-transform">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base">
              Solve Doubts & Earn Coins
            </p>
            <p className="text-xs text-white/50 font-medium mt-0.5">
              Browse unanswered questions, reply accurately, and redeem gamified reward coins.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-violet-400 group-hover:translate-x-1.5 transition-transform" />
      </Link>
    </div>
  );
}
