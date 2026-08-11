'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Clock,
  Loader2,
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

function Avatar({ name, role }: { name: string; role?: string }) {
  const colors: Record<string, string> = {
    teacher: 'from-violet-500 to-purple-600',
    student: 'from-blue-500 to-indigo-600',
    forum_user: 'from-emerald-500 to-teal-600',
    default: 'from-slate-500 to-slate-600',
  };
  const bg = colors[role || 'default'] || colors.default;
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${bg} select-none text-xs font-black text-white border border-white/10`}
    >
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    ANSWERED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CLOSED: 'bg-slate-800 text-slate-400 border border-slate-700',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
        map[status] || map.OPEN
      }`}
    >
      {status}
    </span>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ForumDoubtDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchDoubt();
  }, [id]);

  const fetchDoubt = async () => {
    try {
      const res = await client.get(`/v1/forum/doubts/${id}`);
      setDoubt(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doubt details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await client.post('/v1/forum/doubts', {
        doubtId: id,
        content: replyContent,
      });
      setReplyContent('');
      toast.success('Answer posted successfully! You earned 5 coins 🪙');
      fetchDoubt();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptReply = async (replyId: string) => {
    try {
      await client.put(`/v1/forum/doubts/${id}`, {
        action: 'accept-reply',
        replyId,
      });
      toast.success('Answer accepted! Contributor earned 20 coins 🎉');
      fetchDoubt();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept answer');
    }
  };

  const handleVote = async (replyId: string, direction: 1 | -1) => {
    try {
      await client.put(`/v1/forum/doubts/${id}`, {
        action: 'vote-reply',
        replyId,
        direction,
      });
      fetchDoubt();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vote');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-xs text-white/40">Loading doubt details thread...</p>
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-white/40 font-medium">Doubt thread not found</p>
        <Link
          href="/dashboard/forum/doubts"
          className="text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline"
        >
          &larr; Back to all doubts
        </Link>
      </div>
    );
  }

  const isDoubtOwner = user?.id === doubt.userId;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to doubts feed
      </button>

      {/* Main Doubt Card */}
      <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-500/5 blur-xl pointer-events-none" />
        <div className="mb-5 flex items-start gap-4">
          <Avatar name={doubt.user?.name || '?'} role={doubt.role} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-extrabold text-sm text-white/95 leading-none">
                {doubt.user?.name}
              </span>
              <StatusBadge status={doubt.status} />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/30 font-semibold font-mono mt-1">
              <Clock className="h-3 w-3 shrink-0" />
              {format(new Date(doubt.createdAt), 'dd MMM yyyy, hh:mm a')}
            </div>
          </div>
        </div>

        <h1 className="mb-3 text-lg md:text-xl font-black text-white/95 leading-tight tracking-tight">
          {doubt.title}
        </h1>
        <p className="text-sm text-white/70 leading-relaxed font-normal whitespace-pre-wrap">
          {doubt.content}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider font-mono">
          {doubt.subject && (
            <span className="rounded-lg bg-violet-600/10 border border-violet-500/15 px-3 py-1 text-violet-400">
              {doubt.subject.name}
            </span>
          )}
          {doubt.chapter && (
            <span className="rounded-lg bg-white/5 border border-white/5 px-3 py-1 text-white/50">
              {doubt.chapter}
            </span>
          )}
        </div>
      </div>

      {/* Replies Thread Feed */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2.5 text-base font-black tracking-wide text-white/90">
          <MessageSquare className="h-4.5 w-4.5 text-violet-400 shrink-0" />
          <span>{doubt.replies?.length || 0} Answers Feed</span>
        </h2>

        {doubt.replies?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/5 py-12 text-center bg-[#0d0c15]/10">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-white/10" />
            <p className="text-xs text-white/40">
              No replies posted yet. Share your expertise and earn coins!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {doubt.replies.map((reply: any) => (
              <div
                key={reply.id}
                className={`rounded-2xl border p-5 transition-all shadow-md relative overflow-hidden ${
                  reply.isAccepted
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/5 bg-[#0d0c15]/50 hover:bg-[#0d0c15]/75'
                }`}
              >
                <div className="mb-3.5 flex items-start gap-4">
                  <Avatar name={reply.user?.name || '?'} role={reply.role} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-white/90 leading-none">
                        {reply.user?.name}
                      </span>
                      <span className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/40">
                        {reply.role?.replace('_', ' ')}
                      </span>
                      {reply.isAccepted && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 font-semibold font-mono mt-1">
                      {format(new Date(reply.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed font-normal whitespace-pre-wrap">
                  {reply.content}
                </p>

                <div className="mt-4 flex items-center gap-3.5 pt-2">
                  <button
                    onClick={() => handleVote(reply.id, 1)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                    <span className="font-mono text-[11px] font-bold">{reply.upvotes}</span>
                  </button>

                  {isDoubtOwner && !reply.isAccepted && doubt.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleAcceptReply(reply.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Accept Answer</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Composition Form */}
      {doubt.status !== 'CLOSED' && (
        <div className="rounded-2xl border border-white/5 bg-[#0d0c15]/60 backdrop-blur-md p-6 shadow-xl">
          <h3 className="mb-3.5 text-sm font-black tracking-wide text-white/90 uppercase">
            Your Contribution Answer
          </h3>
          <form onSubmit={handleReply} className="space-y-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              placeholder="Provide a constructive, detailed explanation of the solution..."
              className="w-full resize-none rounded-xl border border-white/5 bg-[#080710] px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 leading-relaxed"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-semibold text-white/30 tracking-wide">
                🪙 Earn 5 coins for helping • 20 coins bonus if accepted as correct solution
              </p>
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 disabled:text-white/30 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg hover:shadow-violet-500/15 duration-200"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Send className="h-4 w-4 shrink-0" />
                )}
                <span>{submitting ? 'Submitting...' : 'Post Answer'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
