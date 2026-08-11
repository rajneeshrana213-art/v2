import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    ArrowLeft,
    Send,
    Paperclip,
    CheckCircle2,
    Lock,
    Pin,
    Trash2,
    User as UserIcon,
    AlertCircle,
    Clock,
    ExternalLink,
    MessageSquare
} from "lucide-react";
import client from "@/lib/api/client";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";

export default function TeacherDoubtDetail() {
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
            const res = await client.get(`/v1/dashboard/teacher/doubt-forum/${id}`);
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
            await client.post("/v1/dashboard/teacher/doubt-forum", {
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

    const handleAction = async (action: string, status?: string) => {
        try {
            await client.patch(`/v1/dashboard/teacher/doubt-forum/${id}`, {
                action,
                status,
            });
            toast.success("Updated successfully");
            fetchDoubt();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const deleteReply = async (replyId: string) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            await client.delete(`/v1/dashboard/teacher/doubt-forum/${id}`, {
                data: { replyId }
            });
            toast.success("Deleted");
            fetchDoubt();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!doubt) return null;

    return (
        <DashboardLayout role="teacher">
            <div className="p-6 max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to list
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Discussion Thread */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{doubt.user.name}</h3>
                                        <p className="text-xs text-gray-400">{format(new Date(doubt.createdAt), "MMM d, yyyy • h:mm a")}</p>
                                    </div>
                                </div>
                                {doubt.isPinned && <Pin className="w-4 h-4 text-primary fill-primary" />}
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{doubt.title}</h1>
                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                                {doubt.content}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {doubt.subject.name}
                                </span>
                                {doubt.chapter && (
                                    <span className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                                        Chapter: {doubt.chapter}
                                    </span>
                                )}
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
                                        <Paperclip className="w-4 h-4 text-primary" />
                                        View Attached File
                                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Replies */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Discussion
                            </h2>

                            {doubt.replies.map((reply: any) => (
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
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">
                                                {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                                            </span>
                                            <button
                                                onClick={() => deleteReply(reply.id)}
                                                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {reply.content}
                                    </div>
                                    {reply.attachmentUrl && (
                                        <a
                                            href={reply.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                                        >
                                            <Paperclip className="w-3 h-3" />
                                            View Attachment
                                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Reply Editor */}
                        {!doubt.isLocked ? (
                            <form onSubmit={handleReply} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg sticky bottom-4 z-10 transition-shadow">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Type your explanation or reply..."
                                    className="w-full h-24 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-3 text-sm"
                                />
                                <div className="flex items-center justify-between">
                                    <button type="button" className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button
                                        disabled={submitting || !replyContent.trim()}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:translate-y-[-1px] transition-all"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Sending...
                                            </>
                                        ) : "Post Reply"}
                                        <Send className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-gray-500 text-sm">
                                <Lock className="w-4 h-4 mx-auto mb-2 opacity-50" />
                                This discussion is locked.
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Controls */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Management</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Status</span>
                                    <select
                                        value={doubt.status}
                                        onChange={(e) => handleAction("", e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs font-bold"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="ANSWERED">Answered</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>

                                <hr className="border-gray-50 dark:border-gray-700" />

                                <button
                                    onClick={() => handleAction("pin")}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-colors ${doubt.isPinned ? "bg-primary/10 text-primary" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Pin className={`w-4 h-4 ${doubt.isPinned ? "fill-primary" : ""}`} />
                                        Pin this doubt
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${doubt.isPinned ? "bg-primary" : "bg-gray-300"}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${doubt.isPinned ? "right-0.5" : "left-0.5"}`} />
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleAction("lock")}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-colors ${doubt.isLocked ? "bg-amber-100 text-amber-700" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4" />
                                        Lock Thread
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${doubt.isLocked ? "bg-amber-600" : "bg-gray-300"}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${doubt.isLocked ? "right-0.5" : "left-0.5"}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-200 dark:shadow-none relative overflow-hidden">
                            <div className="relative z-10">
                                <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                                <h4 className="font-bold mb-2">Academic Support</h4>
                                <p className="text-xs opacity-90 leading-relaxed mb-4">
                                    Regularly addressing student doubts improves student satisfaction and academic performance.
                                </p>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">LXC Tips</div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
