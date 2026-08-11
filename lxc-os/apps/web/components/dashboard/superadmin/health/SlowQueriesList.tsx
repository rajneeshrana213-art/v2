
import { useEffect, useState } from "react";
import { Zap, AlertTriangle } from "lucide-react";
import { getAccessToken } from "@/lib/api/client";

interface SlowApiEntry {
  id: string;
  method: string;
  url: string;
  duration: number;
  timestamp: string;
  status?: number;
}

export function SlowQueriesList() {
  const [entries, setEntries] = useState<SlowApiEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const res = await fetch("/api/v1/superadmin/performance", {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEntries(data.slowApiRequests || []);
        }
      } catch {
        // silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Slow API Requests</h3>
        {entries.length > 0 && (
          <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
            {entries.length}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-gray-400">No slow API requests detected. 🚀</p>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0"
            >
              <code className="truncate rounded bg-gray-50 p-1.5 text-xs font-mono text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {entry.method} {entry.url}
              </code>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="h-3 w-3" />
                  {entry.duration}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
