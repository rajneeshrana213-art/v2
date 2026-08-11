import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Star, TrendingUp, ArrowUpRight } from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";

export default function ForumCoins() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/v1/forum/profile")
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Failed to load coins"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="forum_user">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const transactions = profile?.coinTransactions || [];

  return (
    <DashboardLayout role="forum_user">
      <div className="mx-auto max-w-xl space-y-6 p-6">
        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 fill-current" />
            <div>
              <p className="text-sm font-medium text-amber-100">
                Total Reward Coins
              </p>
              <p className="text-4xl font-black">{profile?.coins || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-100">
            <TrendingUp className="h-4 w-4" />
            {profile?.reputation || 0} reputation points earned
          </div>
        </div>

        {/* Reward Guide */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#161B22]">
          <h3 className="mb-3 font-black text-gray-900 dark:text-white">
            How to Earn Coins
          </h3>
          <div className="space-y-2">
            {[
              { action: "Post an answer", coins: "+5", color: "text-emerald-500" },
              { action: "Answer gets accepted", coins: "+20", color: "text-emerald-500" },
            ].map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 dark:bg-gray-800/50"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.action}
                </span>
                <span className={`font-black ${item.color}`}>{item.coins}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#161B22]">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <h3 className="font-black text-gray-900 dark:text-white">
              Transaction History
            </h3>
          </div>
          {transactions.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              No transactions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.reason}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(tx.createdAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600">
                    +{tx.coins}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
