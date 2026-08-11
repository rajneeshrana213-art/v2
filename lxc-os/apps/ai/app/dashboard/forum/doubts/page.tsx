'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageSquare,
  Clock,
  Filter,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export default function ForumBrowseDoubts() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: String(page) });
      if (search.trim()) params.set('search', search.trim());
      const res = await client.get(`/v1/forum/doubts?${params.toString()}`);
      setDoubts(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doubts');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Browse Student Doubts
          </h1>
          <p className="text-xs text-white/40 mt-1">
            {pagination?.total || 0} total questions matches your filter
          </p>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search queries, concepts, subjects..."
            className="w-full rounded-xl border border-white/5 bg-[#0d0c15]/60 px-4 py-2.5 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-violet-500/50 focus:bg-[#0d0c15] dark:focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 pointer-events-none" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-xl border border-white/5 bg-[#0d0c15]/60 py-2.5 pl-10 pr-9 text-sm text-white outline-none focus:border-violet-500/50"
          >
            <option value="ACTIVE" className="bg-[#0d0c15]">Active</option>
            <option value="OPEN" className="bg-[#0d0c15]">Open</option>
            <option value="ANSWERED" className="bg-[#0d0c15]">Answered</option>
            <option value="CLOSED" className="bg-[#0d0c15]">Closed</option>
          </select>
        </div>
      </div>

      {/* Doubts list */}
      {loading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-xs text-white/40">Fetching doubts feed...</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-[#0d0c15]/20">
          <MessageSquare className="mb-3 h-8 w-8 text-white/10" />
          <p className="text-sm text-white/40">No matching doubts found</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {doubts.map((doubt: any) => (
            <Link
              key={doubt.id}
              href={`/dashboard/forum/doubts/${doubt.id}`}
              className="flex items-start justify-between gap-5 rounded-2xl border border-white/5 bg-[#0d0c15]/50 p-5 transition-all hover:border-violet-500/30 hover:bg-[#0d0c15]/80 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3.5">
                  <h3 className="font-extrabold text-sm md:text-base text-white/90 group-hover:text-violet-300 transition-colors line-clamp-1">
                    {doubt.title}
                  </h3>
                  <StatusBadge status={doubt.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs md:text-sm text-white/40 leading-relaxed">
                  {doubt.content}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-white/30 font-semibold font-mono uppercase tracking-wider">
                  {doubt.subject && (
                    <span className="rounded-md bg-white/5 border border-white/5 px-2.5 py-0.5 text-violet-400 font-bold">
                      {doubt.subject.name}
                    </span>
                  )}
                  {doubt.class && (
                    <span className="rounded-md bg-white/5 border border-white/5 px-2.5 py-0.5 font-bold">
                      {doubt.class.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 shrink-0" />
                    {doubt._count?.replies || 0} answers
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {format(new Date(doubt.createdAt), 'dd MMM yyyy')}
                  </span>
                  <span>•</span>
                  <span className="font-sans lowercase font-normal text-white/40">
                    by {doubt.user?.name}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 group-hover:border-violet-500/30 flex items-center justify-center shrink-0 group-hover:bg-violet-600/10 group-hover:text-violet-400 transition-all self-center text-white/30">
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-white/40 font-mono">
            Page <span className="text-white font-bold">{page}</span> of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
