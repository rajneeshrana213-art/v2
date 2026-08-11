'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = 'New User';
  let color = 'text-white/40';
  if (reputation >= 2000) {
    level = 'Master';
    color = 'text-amber-400 font-extrabold';
  } else if (reputation >= 500) {
    level = 'Expert';
    color = 'text-violet-400 font-bold';
  } else if (reputation >= 100) {
    level = 'Contributor';
    color = 'text-blue-400 font-semibold';
  }
  return <span className={`text-[10px] uppercase tracking-wider ${color}`}>{level}</span>;
}

export default function ForumLeaderboard() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/v1/forum/leaderboard?limit=50')
      .then((res) => setContributors(res))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load leaderboard database');
      })
      .finally(() => setLoading(false));
  }, []);

  const podiumColors = [
    'from-amber-400 to-yellow-500 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.2)]', // gold
    'from-slate-300 to-slate-400 text-slate-950 shadow-[0_0_30px_rgba(203,213,225,0.15)]', // silver
    'from-orange-400 to-amber-600 text-orange-950 shadow-[0_0_30px_rgba(217,119,6,0.15)]', // bronze
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Trophy Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.15)] mb-2">
          <Trophy className="h-7 w-7 text-amber-400 animate-pulse" />
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
          Contributors Leaderboard
        </h1>
        <p className="text-xs text-white/40">
          Celebrating top-performing master minds and contributors in the community
        </p>
      </div>

      {loading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-xs text-white/40">Analyzing rankings feed...</p>
        </div>
      ) : contributors.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-white/40">
          No contributors recorded yet
        </div>
      ) : (
        <>
          {/* Top 3 Podium layout */}
          {contributors.length >= 3 && (
            <div className="flex items-end justify-center gap-4 py-8">
              {/* Rank 2 (Silver) */}
              {contributors[1] && (
                <div className="flex flex-col items-center">
                  <div
                    className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${podiumColors[1]} text-lg font-black`}
                  >
                    {contributors[1].name?.[0]?.toUpperCase()}
                    <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-xs font-black text-slate-300">
                      2
                    </div>
                  </div>
                  <div className="h-24 w-28 rounded-t-2xl bg-gradient-to-b from-white/5 to-white/0 border-t border-x border-white/5 flex flex-col items-center justify-center p-3 text-center">
                    <p className="truncate w-full text-xs font-bold text-white/80">
                      {contributors[1].name}
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-1 text-amber-400 text-xs font-black font-mono">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{contributors[1].coins}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {contributors[0] && (
                <div className="flex flex-col items-center">
                  <div
                    className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${podiumColors[0]} text-xl font-black`}
                  >
                    {contributors[0].name?.[0]?.toUpperCase()}
                    <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-amber-500/30 text-xs font-black text-amber-400">
                      1
                    </div>
                  </div>
                  <div className="h-32 w-32 rounded-t-3xl bg-gradient-to-b from-violet-500/10 to-violet-600/0 border-t border-x border-violet-500/20 flex flex-col items-center justify-center p-3 text-center shadow-lg">
                    <p className="truncate w-full text-sm font-extrabold text-white">
                      {contributors[0].name}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-amber-400 text-xs font-black font-mono">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{contributors[0].coins}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {contributors[2] && (
                <div className="flex flex-col items-center">
                  <div
                    className={`relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${podiumColors[2]} text-lg font-black`}
                  >
                    {contributors[2].name?.[0]?.toUpperCase()}
                    <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-xs font-black text-amber-600">
                      3
                    </div>
                  </div>
                  <div className="h-20 w-28 rounded-t-2xl bg-gradient-to-b from-white/5 to-white/0 border-t border-x border-white/5 flex flex-col items-center justify-center p-3 text-center">
                    <p className="truncate w-full text-xs font-bold text-white/80">
                      {contributors[2].name}
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-1 text-amber-400 text-xs font-black font-mono">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{contributors[2].coins}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full List Rankings Table */}
          <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              {contributors.map((user: any, idx: number) => {
                const rankStyles =
                  idx === 0
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : idx === 1
                      ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20'
                      : idx === 2
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-white/5 text-white/40';
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-6 py-4.5 hover:bg-white/5 transition-colors duration-150"
                  >
                    {/* Rank index */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold font-mono ${rankStyles}`}
                    >
                      {idx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500/20 to-purple-600/30 text-sm font-black text-violet-300 border border-violet-500/25">
                      {user.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Username and level details */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-extrabold text-white/90">
                        {user.name}
                      </p>
                      <div className="flex items-center flex-wrap gap-2.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-white/30 capitalize tracking-wider">
                          {user.role?.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-white/20">•</span>
                        <ReputationBadge reputation={user.reputation || 0} />
                      </div>
                    </div>

                    {/* Reward coins count */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-amber-400 text-sm font-black font-mono">
                      <Star className="h-4 w-4 fill-current shrink-0" />
                      <span>{user.coins}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
