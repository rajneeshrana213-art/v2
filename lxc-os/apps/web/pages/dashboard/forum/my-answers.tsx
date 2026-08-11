import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { CheckCircle2, MessageSquare, Clock, ThumbsUp } from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";
import Link from "next/link";

export default function ForumMyAnswers() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/v1/forum/profile")
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Failed to load answers"))
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

  const replies = profile?.doubtReplies || [];

  return (
    <DashboardLayout role="forum_user">
      <div className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            My Answers
          </h1>
          <p className="text-sm text-gray-500">{replies.length} answers posted</p>
        </div>

        {replies.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No answers yet</p>
            <Link
              href="/dashboard/forum/doubts"
              className="mt-2 text-sm text-violet-600 hover:underline"
            >
              Browse doubts to answer →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply: any) => (
              <Link
                key={reply.id}
                href={`/dashboard/forum/doubts/${reply.doubt.id}`}
                className={`block rounded-2xl border p-4 transition hover:shadow-sm ${
                  reply.isAccepted
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
                    : "border-gray-100 bg-white dark:border-gray-800 dark:bg-[#161B22]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-semibold text-gray-900 dark:text-white">
                      {reply.doubt.title}
                    </p>
                    {reply.doubt.subject && (
                      <span className="mt-1 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        {reply.doubt.subject.name}
                      </span>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {reply.content}
                    </p>
                  </div>
                  {reply.isAccepted && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Accepted
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {reply.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(reply.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
