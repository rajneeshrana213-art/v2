import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { User, BookOpen, Star, TrendingUp } from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";

function ReputationBadge({ reputation }: { reputation: number }) {
  let level = "New User";
  let color = "bg-gray-100 text-gray-600";
  let emoji = "🌱";
  if (reputation >= 2000) {
    level = "Master";
    color = "bg-amber-100 text-amber-700";
    emoji = "🏆";
  } else if (reputation >= 500) {
    level = "Expert";
    color = "bg-violet-100 text-violet-700";
    emoji = "⚡";
  } else if (reputation >= 100) {
    level = "Contributor";
    color = "bg-blue-100 text-blue-700";
    emoji = "🎯";
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black ${color}`}
    >
      {emoji} {level}
    </span>
  );
}

export default function ForumProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/v1/forum/profile")
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Failed to load profile"))
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

  return (
    <DashboardLayout role="forum_user">
      <div className="mx-auto max-w-xl space-y-6 p-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#161B22]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-black text-white">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                {profile?.name}
              </h1>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <div className="mt-2">
                <ReputationBadge reputation={profile?.reputation || 0} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            {[
              { label: "Coins", value: profile?.coins || 0, icon: Star },
              {
                label: "Reputation",
                value: profile?.reputation || 0,
                icon: TrendingUp,
              },
              {
                label: "Answers",
                value: profile?.doubtReplies?.length || 0,
                icon: BookOpen,
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-1 h-5 w-5 text-violet-500" />
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expertise */}
        {profile?.forumUserProfile && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#161B22]">
            <h3 className="mb-4 font-black text-gray-900 dark:text-white">
              Expertise
            </h3>
            <div className="space-y-3">
              {profile.forumUserProfile.educationLevel && (
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Education Level</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.forumUserProfile.educationLevel}
                    </p>
                  </div>
                </div>
              )}
              {profile.forumUserProfile.subjectsExpertise && (
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Subjects of Expertise</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {profile.forumUserProfile.subjectsExpertise}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(profile?.createdAt), "MMMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reputation Progress */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#161B22]">
          <h3 className="mb-4 font-black text-gray-900 dark:text-white">
            Reputation Levels
          </h3>
          <div className="space-y-3">
            {[
              { level: "New User", min: 0, max: 99, emoji: "🌱" },
              { level: "Contributor", min: 100, max: 499, emoji: "🎯" },
              { level: "Expert", min: 500, max: 1999, emoji: "⚡" },
              { level: "Master", min: 2000, max: Infinity, emoji: "🏆" },
            ].map((tier) => {
              const current = profile?.reputation || 0;
              const isActive = current >= tier.min && current <= tier.max;
              const isUnlocked = current >= tier.min;
              return (
                <div
                  key={tier.level}
                  className={`flex items-center justify-between rounded-xl p-3 ${
                    isActive
                      ? "bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-900/20"
                      : isUnlocked
                        ? "bg-gray-50 dark:bg-gray-800/50"
                        : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {tier.level}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tier.max === Infinity
                          ? `${tier.min}+ points`
                          : `${tier.min}–${tier.max} points`}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-black text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      Current
                    </span>
                  )}
                  {isUnlocked && !isActive && (
                    <span className="text-emerald-500">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
