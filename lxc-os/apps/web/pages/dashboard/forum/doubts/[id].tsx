import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Clock,
  User as UserIcon,
  Paperclip,
} from "lucide-react";
import client from "@/lib/api/client";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

function Avatar({ name, role }: { name: string; role?: string }) {
  const colors: Record<string, string> = {
    teacher: "bg-violet-500",
    student: "bg-indigo-500",
    forum_user: "bg-emerald-500",
    default: "bg-gray-400",
  };
  const bg = colors[role || "default"] || colors.default;
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} select-none text-sm font-black text-white`}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-amber-100 text-amber-700",
    ANSWERED: "bg-emerald-100 text-emerald-700",
    CLOSED: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${map[status] || map.OPEN}`}
    >
      {status}
    </span>
  );
}

export default function ForumDoubtDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchDoubt();
  }, [id]);

  const fetchDoubt = async () => {
    try {
      const res = await client.get(`/v1/forum/doubts/${id}`);
      setDoubt(res.data);
    } catch {
      toast.error("Failed to load doubt");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await client.post("/v1/forum/doubts", {
        doubtId: id,
        content: replyContent,
      });
      setReplyContent("");
      toast.success("Answer posted! You earned 5 coins 🪙");
      fetchDoubt();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to post answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptReply = async (replyId: string) => {
    try {
      await client.patch(`/v1/forum/doubts/${id}`, {
        action: "accept-reply",
        replyId,
      });
      toast.success("Answer accepted! Contributor earned 20 coins 🎉");
      fetchDoubt();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept answer");
    }
  };

  const handleVote = async (replyId: string, direction: 1 | -1) => {
    try {
      await client.patch(`/v1/forum/doubts/${id}`, {
        action: "vote-reply",
        replyId,
        direction,
      });
      fetchDoubt();
    } catch {
      toast.error("Vote failed");
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

  if (!doubt) {
    return (
      <DashboardLayout role="forum_user">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Doubt not found</p>
          <Link href="/dashboard/forum/doubts" className="text-violet-600 hover:underline">
            ← Back to doubts
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isDoubtOwner = user?.id === doubt.userId;

  return (
    <DashboardLayout role="forum_user">
      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to doubts
        </button>

        {/* Doubt Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#161B22]">
          <div className="mb-3 flex items-start gap-3">
            <Avatar name={doubt.user?.name || "?"} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {doubt.user?.name}
                </span>
                <StatusBadge status={doubt.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {format(new Date(doubt.createdAt), "dd MMM yyyy, hh:mm a")}
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-xl font-black text-gray-900 dark:text-white">
            {doubt.title}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">{doubt.content}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {doubt.subject && (
              <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {doubt.subject.name}
              </span>
            )}
            {doubt.chapter && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {doubt.chapter}
              </span>
            )}
          </div>
        </div>

        {/* Answers */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-black text-gray-900 dark:text-white">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            {doubt.replies?.length || 0} Answers
          </h2>

          {doubt.replies?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">
                No answers yet. Be the first to help!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doubt.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className={`rounded-2xl border p-4 ${
                    reply.isAccepted
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
                      : "border-gray-100 bg-white dark:border-gray-800 dark:bg-[#161B22]"
                  }`}
                >
                  <div className="mb-2 flex items-start gap-3">
                    <Avatar name={reply.user?.name || "?"} role={reply.role} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {reply.user?.name}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-800">
                          {reply.role?.replace("_", " ")}
                        </span>
                        {reply.isAccepted && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Accepted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(
                          new Date(reply.createdAt),
                          "dd MMM yyyy, hh:mm a",
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300">
                    {reply.content}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => handleVote(reply.id, 1)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {reply.upvotes}
                    </button>

                    {isDoubtOwner && !reply.isAccepted && doubt.status !== "CLOSED" && (
                      <button
                        onClick={() => handleAcceptReply(reply.id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept Answer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {doubt.status !== "CLOSED" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#161B22]">
            <h3 className="mb-3 font-black text-gray-900 dark:text-white">
              Your Answer
            </h3>
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={5}
                placeholder="Write a helpful, detailed answer..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-violet-900/30"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  🪙 Earn 5 coins for posting • 20 coins if accepted
                </p>
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Posting..." : "Post Answer"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
