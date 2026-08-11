import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    ArrowLeft,
    Send,
    Paperclip,
    CheckCircle2,
    Lock,
    User as UserIcon,
    MessageSquare,
    Clock,
    ExternalLink
} from "lucide-react";
import client from "@/lib/api/client";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";

export default function StudentDoubtDetail() {
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [doubt, setDoubt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchDoubt();
    }, [id]);

    const fetchDoubt = async () => {
        try {
            const res = await client.get(`/v1/dashboard/student/doubt-forum/${id}`);
            setDoubt(res.data);
        } catch (error) {
            toast.error("Failed to fetch doubt details");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            await client.post("/v1/dashboard/student/doubt-forum", {
                action: "reply",
                doubtId: id,
                content: replyContent,
            });
            setReplyContent("");
            toast.success("Reply posted!");
            fetchDoubt();
        } catch (error) {
            toast.error("Failed to post reply");
        } finally {
            setSubmitting(false);
        }
    };

    const markResolved = async () => {
        if (!window.confirm("Mark this doubt as resolved/closed?")) return;
        try {
            await client.patch(`/v1/dashboard/student/doubt-forum/${id}`, {
                status: "CLOSED",
            });
            toast.success("Doubt resolved!");
            fetchDoubt();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!doubt) return null;

    return (
        <DashboardLayout role="student">
            <div className="p-6 max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to list
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                            {doubt.status === 'CLOSED' && (
                                <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                                    Resolved
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Your Question</h3>
                                    <p className="text-xs text-gray-400">{format(new Date(doubt.createdAt), "MMM d, yyyy • h:mm a")}</p>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{doubt.title}</h1>
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                                {doubt.content}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {doubt.subject.name}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${doubt.status === 'OPEN' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    doubt.status === 'ANSWERED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-gray-50 text-gray-600 border-gray-100"
                                    }`}>
                                    {doubt.status}
                                </span>
                            </div>

                            {doubt.attachmentUrl && (
                                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attachment</h4>
                                    <a
                                        href={doubt.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        <Paperclip className="w-4 h-4 text-indigo-600" />
                                        View Attached File
                                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Discussion */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                Discussion
                            </h2>

                            {doubt.replies.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 p-8 rounded-3xl text-center">
                                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Waiting for responses...</p>
                                </div>
                            ) : (
                                doubt.replies.map((reply: any) => (
                                    <div
                                        key={reply.id}
                                        className={`p-4 rounded-2xl border ${reply.role === 'teacher'
                                            ? "bg-violet-50/50 border-violet-100 dark:bg-violet-900/10 dark:border-violet-800"
                                            : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.role === 'teacher' ? "bg-violet-200" : "bg-gray-200"
                                                    }`}>
                                                    <UserIcon className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                    {reply.user.name}
                                                    {reply.role === 'teacher' && (
                                                        <span className="ml-2 text-[10px] bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">
                                                            Teacher
                                                        </span>
                                                    )}
                                                    {reply.isAccepted && (
                                                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">
                                                            ✓ Accepted
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">
                                                {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {reply.content}
                                        </div>
                                        {user?.id === doubt.userId && !reply.isAccepted && doubt.status !== 'CLOSED' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await client.patch(`/v1/dashboard/student/doubt-forum/${id}`, { action: "accept-reply", replyId: reply.id });
                                                            toast.success("Answer accepted! They earned 20 coins 🎉");
                                                            fetchDoubt();
                                                        } catch (err: any) {
                                                            toast.error(err.response?.data?.error || "Failed");
                                                        }
                                                    }}
                                                    className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-semibold"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Accept this Answer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Reply Editor */}
                        {doubt.status !== 'CLOSED' && !doubt.isLocked ? (
                            <form onSubmit={handleReply} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg sticky bottom-4 z-10">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Ask for clarification or reply..."
                                    className="w-full h-24 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all mb-3 text-sm"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        disabled={submitting || !replyContent.trim()}
                                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Post Reply
                                                <Send className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-dashed border-gray-200 text-center">
                                <Lock className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500">
                                    {doubt.isLocked ? "This thread is locked by the teacher." : "This doubt has been marked as resolved."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {doubt.status !== 'CLOSED' && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Are you satisfied?</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                                    If your doubt has been answered and you're satisfied with the explanation, please mark it as resolved.
                                </p>
                                <button
                                    onClick={markResolved}
                                    className="w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Mark as Resolved
                                </button>
                            </div>
                        )}

                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold mb-2">Learning tip!</h4>
                                <p className="text-xs opacity-90 leading-relaxed">
                                    "Doubt is the father of invention." Don't hesitate to ask questions. Every doubt resolved is a step towards mastery.
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
