import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  MessageSquare,
  Star,
  Trophy,
  TrendingUp,
  CheckCircle2,
  User,
  ArrowRight,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = "New User";
  let color = "bg-gray-100 text-gray-600";
  if (reputation >= 2000) {
    level = "Master";
    color = "bg-amber-100 text-amber-700";
  } else if (reputation >= 500) {
    level = "Expert";
    color = "bg-violet-100 text-violet-700";
  } else if (reputation >= 100) {
    level = "Contributor";
    color = "bg-blue-100 text-blue-700";
  }
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${color}`}
    >
      {level}
    </span>
  );
}

export default function ForumDashboard() {
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
        client.get("/v1/forum/profile"),
        client.get("/v1/forum/leaderboard?limit=5"),
      ]);
      setProfile(profileRes.data);
      setLeaderboard(lbRes.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="forum_user">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const acceptedAnswers =
    profile?.doubtReplies?.filter((r: any) => r.isAccepted).length || 0;
  const totalAnswers = profile?.doubtReplies?.length || 0;

  return (
    <DashboardLayout role="forum_user">
      <div className="space-y-6 p-6">
        {/* Welcome Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">
                Welcome, {profile?.name?.split(" ")[0]}! 👋
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <ReputationBadge reputation={profile?.reputation || 0} />
                <span className="text-sm text-white/80">
                  {profile?.reputation || 0} reputation points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Reward Coins",
              value: profile?.coins || 0,
              icon: Star,
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
            {
              label: "Total Answers",
              value: totalAnswers,
              icon: MessageSquare,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Accepted",
              value: acceptedAnswers,
              icon: CheckCircle2,
              color: "text-emerald-500",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Reputation",
              value: profile?.reputation || 0,
              icon: TrendingUp,
              color: "text-violet-500",
              bg: "bg-violet-50 dark:bg-violet-900/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl ${stat.bg} p-4`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Answers */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#161B22]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">
                Recent Answers
              </h2>
              <Link
                href="/dashboard/forum/my-answers"
                className="flex items-center gap-1 text-sm text-violet-600 hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {profile?.doubtReplies?.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">No answers yet</p>
                <Link
                  href="/dashboard/forum/doubts"
                  className="mt-2 inline-block text-sm text-violet-600 hover:underline"
                >
                  Browse doubts to answer →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {profile?.doubtReplies?.slice(0, 5).map((reply: any) => (
                  <Link
                    key={reply.id}
                    href={`/dashboard/forum/doubts/${reply.doubt.id}`}
                    className="block rounded-xl border border-gray-100 p-3 transition hover:border-violet-200 hover:bg-violet-50/50 dark:border-gray-800 dark:hover:border-violet-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {reply.doubt.title}
                      </p>
                      {reply.isAccepted && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {reply.content}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span>👍 {reply.upvotes}</span>
                      <span>
                        {format(new Date(reply.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Preview */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#161B22]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white">
                Top Contributors
              </h2>
              <Link
                href="/dashboard/forum/leaderboard"
                className="flex items-center gap-1 text-sm text-violet-600 hover:underline"
              >
                Full board <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((u: any, idx: number) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl p-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-black text-white">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {u.name}
                    </p>
                    <p className="text-xs capitalize text-gray-400">
                      {u.role.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-black">{u.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <Link
          href="/dashboard/forum/doubts"
          className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 p-5 transition hover:from-violet-100 hover:to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900 dark:text-white">
                Browse Doubts
              </p>
              <p className="text-sm text-gray-500">
                Answer questions and earn coins
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-violet-600" />
        </Link>
      </div>
    </DashboardLayout>
  );
}
