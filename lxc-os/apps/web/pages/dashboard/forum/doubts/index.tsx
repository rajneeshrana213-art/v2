import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ANSWERED:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CLOSED:
      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${map[status] || map.OPEN}`}
    >
      {status}
    </span>
  );
}

export default function ForumDoubtsBrowse() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: String(page) });
      if (search) params.set("search", search);
      const res = await client.get(`/v1/forum/doubts?${params.toString()}`);
      setDoubts(res.data.data || []);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load doubts");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  return (
    <DashboardLayout role="forum_user">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Browse Doubts
            </h1>
            <p className="text-sm text-gray-500">
              {pagination?.total || 0} doubts available
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search doubts..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="OPEN">Open</option>
              <option value="ANSWERED">Answered</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Doubt List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No doubts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doubts.map((doubt: any) => (
              <Link
                key={doubt.id}
                href={`/dashboard/forum/doubts/${doubt.id}`}
                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm dark:border-gray-800 dark:bg-[#161B22] dark:hover:border-violet-800"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {doubt.title}
                    </h3>
                    <StatusBadge status={doubt.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {doubt.content}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {doubt.subject && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                        {doubt.subject.name}
                      </span>
                    )}
                    {doubt.class && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                        {doubt.class.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {doubt._count?.replies || 0} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(doubt.createdAt), "dd MMM yyyy")}
                    </span>
                    <span>by {doubt.user?.name}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 mt-1" />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
