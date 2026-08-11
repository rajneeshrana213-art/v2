import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Trophy, Star } from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = "New User";
  let color = "text-gray-500";
  if (reputation >= 2000) {
    level = "Master";
    color = "text-amber-500";
  } else if (reputation >= 500) {
    level = "Expert";
    color = "text-violet-500";
  } else if (reputation >= 100) {
    level = "Contributor";
    color = "text-blue-500";
  }
  return <span className={`text-xs font-bold ${color}`}>{level}</span>;
}

export default function ForumLeaderboard() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/v1/forum/leaderboard?limit=50")
      .then((res) => setContributors(res.data))
      .catch(() => toast.error("Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  const podiumColors = [
    "from-amber-400 to-yellow-500",
    "from-gray-300 to-gray-400",
    "from-orange-400 to-amber-500",
  ];

  return (
    <DashboardLayout role="forum_user">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="text-center">
          <Trophy className="mx-auto mb-2 h-12 w-12 text-amber-500" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500">
            Top contributors across the forum
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : contributors.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-gray-400">No contributors yet</p>
          </div>
        ) : (
          <>
            {/* Podium Top 3 */}
            {contributors.length >= 3 && (
              <div className="flex items-end justify-center gap-4 py-6">
                {[1, 0, 2].map((rankIdx) => {
                  const u = contributors[rankIdx];
                  if (!u) return null;
                  const pos = rankIdx === 0 ? 1 : rankIdx === 1 ? 2 : 3;
                  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
                  return (
                    <div key={u.id} className="flex flex-col items-center">
                      <div
                        className={`relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${podiumColors[pos - 1]} text-2xl font-black text-white shadow-lg`}
                      >
                        {u.name?.[0]?.toUpperCase()}
                        <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black shadow dark:bg-gray-900">
                          {pos}
                        </div>
                      </div>
                      <div
                        className={`${heights[pos as 1 | 2 | 3]} w-28 rounded-t-2xl bg-gradient-to-b from-violet-100 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/20 flex flex-col items-center justify-center p-2`}
                      >
                        <p className="text-center text-xs font-bold text-gray-900 dark:text-white">
                          {u.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-sm font-black">{u.coins}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full List */}
            <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#161B22]">
              {contributors.map((u: any, idx: number) => (
                <div
                  key={u.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    idx < contributors.length - 1
                      ? "border-b border-gray-100 dark:border-gray-800"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                      idx === 0
                        ? "bg-amber-100 text-amber-700"
                        : idx === 1
                          ? "bg-gray-100 text-gray-600"
                          : idx === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-50 text-gray-400 dark:bg-gray-800"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-black text-white">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {u.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs capitalize text-gray-400">
                        {u.role?.replace("_", " ")}
                      </span>
                      <ReputationBadge reputation={u.reputation || 0} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-black">{u.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
