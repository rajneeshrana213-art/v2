'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ForumCoinsDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/v1/forum/profile')
      .then((res) => setProfile(res))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to fetch reward coins transaction history');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-xs text-white/40">Fetching transaction logs...</p>
      </div>
    );
  }

  const transactions = profile?.coinTransactions || [];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Dynamic Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-6 text-slate-950 shadow-[0_4px_30px_rgba(245,158,11,0.25)] border border-amber-400/20">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner">
            <Star className="h-7 w-7 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-950/70 uppercase tracking-wider">
              Total Reward Coins
            </p>
            <p className="text-3xl md:text-4xl font-black font-mono leading-none mt-1">
              {profile?.coins || 0}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-amber-950/70 relative z-10 border-t border-slate-950/10 pt-3">
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span>{profile?.reputation || 0} reputation points earned</span>
        </div>
      </div>

      {/* Gamification Reward Guide */}
      <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-5 shadow-xl">
        <h3 className="mb-3.5 text-xs font-black tracking-wide text-white/90 uppercase">
          Gamified Coins System
        </h3>
        <div className="space-y-2">
          {[
            { action: 'Post a helpful solution to doubt', coins: '+5 🪙', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { action: 'Student accepts solution as correct', coins: '+20 🪙', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ].map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-2.5"
            >
              <span className="text-xs text-white/60 font-medium">
                {item.action}
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${item.color}`}>
                {item.coins}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History */}
      <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="border-b border-white/5 px-5 py-4.5 bg-[#0d0c15]/80">
          <h3 className="text-xs font-black tracking-wide text-white/90 uppercase">
            Transaction History Logs
          </h3>
        </div>
        {transactions.length === 0 ? (
          <div className="flex h-36 items-center justify-center text-xs text-white/30 font-medium">
            No transactions recorded yet
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-0.5">
            {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white/80 truncate">
                      {tx.reason}
                    </p>
                    <p className="text-[10px] text-white/30 font-semibold font-mono mt-0.5">
                      {format(new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 font-mono pl-3 shrink-0">
                  +{tx.coins}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
