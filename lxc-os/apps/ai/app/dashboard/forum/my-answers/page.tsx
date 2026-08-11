'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, Clock, ThumbsUp, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ForumMyAnswersHistory() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/v1/forum/profile')
      .then((res) => setProfile(res))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load answers timeline');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-xs text-white/40">Fetching answers history timeline...</p>
      </div>
    );
  }

  const replies = profile?.doubtReplies || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
          My Answers History
        </h1>
        <p className="text-xs text-white/40 mt-1">
          You have posted {replies.length} replies to student queries
        </p>
      </div>

      {replies.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-[#0d0c15]/20">
          <MessageSquare className="mb-3 h-8 w-8 text-white/10" />
          <p className="text-sm text-white/40">No answers posted yet</p>
          <Link
            href="/dashboard/forum/doubts"
            className="mt-3 text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline"
          >
            Browse student doubts to answer &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {replies.map((reply: any) => (
            <Link
              key={reply.id}
              href={`/dashboard/forum/doubts/${reply.doubt.id}`}
              className={`block rounded-2xl border p-5 transition-all shadow-md relative overflow-hidden group ${
                reply.isAccepted
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-white/5 bg-[#0d0c15]/50 hover:bg-[#0d0c15]/80 hover:border-violet-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-sm md:text-base text-white/90 group-hover:text-violet-300 transition-colors line-clamp-1">
                    {reply.doubt.title}
                  </p>
                  {reply.doubt.subject && (
                    <span className="mt-2 inline-block rounded-md bg-violet-500/10 border border-violet-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-400 font-mono">
                      {reply.doubt.subject.name}
                    </span>
                  )}
                  <p className="mt-3 line-clamp-2 text-xs md:text-sm text-white/50 leading-relaxed font-normal">
                    {reply.content}
                  </p>
                </div>
                {reply.isAccepted && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Accepted Solution</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold font-mono text-white/30 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                  {reply.upvotes} upvotes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {format(new Date(reply.createdAt), 'dd MMM yyyy')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
