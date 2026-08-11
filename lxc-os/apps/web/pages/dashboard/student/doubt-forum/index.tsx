import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Plus, Search, MessageSquare, CheckCircle2, X, Send, Hash, ChevronRight, HelpCircle, BookOpen, ArrowLeft, ThumbsUp, ThumbsDown, Lock, Paperclip, Clock, Star } from 'lucide-react';
import client from "@/lib/api/client";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

// ── Helpers ────────────────────────────────────────────────────────────────
function Avatar({ name, role }: { name: string; role?: string }) {
    const colors: Record<string, string> = {
        teacher: "bg-violet-500",
        student: "bg-indigo-500",
        default: "bg-gray-400"
    };
    const bg = colors[role || "default"] || colors.default;
    return (
        <div className={`h-9 w-9 shrink-0 rounded-full ${bg} flex items-center justify-center text-white font-black text-sm select-none`}>
            {name?.[0]?.toUpperCase() || "?"}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        OPEN: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        ANSWERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        CLOSED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
    };
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${map[status] || map.OPEN}`}>
            {status}
        </span>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentDoubtForum() {
    const [doubts, setDoubts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [filterMine, setFilterMine] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAskModal, setShowAskModal] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [votes, setVotes] = useState<Record<string, number>>({}); // replyId -> +1 / -1 / 0
    const repliesEndRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({ title: "", content: "", subjectId: "", chapter: "", priority: "LOW" });
    const [postingDoubt, setPostingDoubt] = useState(false);

    useEffect(() => { fetchDoubts(); fetchMetadata(); }, [filterMine]);
    useEffect(() => { if (selectedDoubt) repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedDoubt?.replies?.length]);

    const fetchMetadata = async () => {
        try {
            const res = await client.get("/v1/dashboard/student/subjects");
            setSubjects(res.data);
        } catch { }
    };

    const fetchDoubts = async () => {
        setLoading(true);
        try {
            const params: any = { mine: filterMine };
            if (!filterMine) params.status = "ACTIVE";
            const res = await client.get("/v1/dashboard/student/doubt-forum", { params });
            setDoubts(res.data);
        } catch { toast.error("Failed to fetch doubts"); }
        finally { setLoading(false); }
    };

    const openDoubt = async (doubt: any) => {
        setSelectedDoubt(doubt);
        setDetailLoading(true);
        try {
            const res = await client.get(`/v1/dashboard/student/doubt-forum/${doubt.id}`);
            setSelectedDoubt(res.data);
        } catch { toast.error("Failed to load thread"); }
        finally { setDetailLoading(false); }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            await client.post("/v1/dashboard/student/doubt-forum", { action: "reply", doubtId: selectedDoubt.id, content: replyContent });
            setReplyContent("");
            const res = await client.get(`/v1/dashboard/student/doubt-forum/${selectedDoubt.id}`);
            setSelectedDoubt(res.data);
            // Update the doubts list reply count
            setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, _count: { ...d._count, replies: (d._count?.replies || 0) + 1 } } : d));
        } catch { toast.error("Failed to post reply"); }
        finally { setSubmitting(false); }
    };

    const markResolved = async () => {
        if (!selectedDoubt) return;
        try {
            await client.patch(`/v1/dashboard/student/doubt-forum/${selectedDoubt.id}`, { status: "CLOSED" });
            setSelectedDoubt((prev: any) => ({ ...prev, status: "CLOSED" }));
            setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, status: "CLOSED" } : d));
            toast.success("Marked as resolved!");
        } catch { toast.error("Failed to update"); }
    };

    const handleVote = async (replyId: string, dir: 1 | -1) => {
        const currentVote = votes[replyId] || 0;
        const newDirection = currentVote === dir ? -dir : dir;

        try {
            await client.patch(`/v1/dashboard/student/doubt-forum/${selectedDoubt.id}`, {
                action: "vote-reply", // Need to ensure student API also supports this
                replyId,
                direction: newDirection
            });
            setVotes(prev => ({ ...prev, [replyId]: currentVote === dir ? 0 : dir }));
            setSelectedDoubt((prev: any) => ({
                ...prev,
                replies: prev.replies.map((r: any) =>
                    r.id === replyId ? { ...r, upvotes: (r.upvotes || 0) + newDirection } : r
                )
            }));
        } catch {
            toast.error("Failed to save vote");
        }
    };

    const handleAskDoubt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.subjectId) { toast.error("Fill all required fields"); return; }
        setPostingDoubt(true);
        try {
            let payload: any = { ...formData };
            const fileInput = document.getElementById("doubt-file") as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                const fileContent = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                payload.file = fileContent;
                payload.fileName = file.name;
            }

            await client.post("/v1/dashboard/student/doubt-forum", payload);
            toast.success("Doubt posted!");
            setShowAskModal(false);
            setFormData({ title: "", content: "", subjectId: "", chapter: "", priority: "LOW" });
            fetchDoubts();
        } catch { toast.error("Submission failed"); }
        finally { setPostingDoubt(false); }
    };

    const filteredDoubts = doubts.filter(d =>
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="student">
            <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0e0e10] shadow-sm">

                {/* ── Left Sidebar: Thread List ── */}
                <div className={`${selectedDoubt ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 shrink-0 border-r border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#111114]`}>
                    {/* Header */}
                    <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-indigo-500" />
                                <h1 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest">Doubt Forum</h1>
                            </div>
                            <button
                                onClick={() => setShowAskModal(true)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                title="Ask a doubt"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search doubts..."
                                className="w-full rounded-lg bg-gray-100 dark:bg-white/5 py-2 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white dark:placeholder-gray-500"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                            {["All", "Mine"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterMine(tab === "Mine")}
                                    className={`flex-1 py-1 text-xs font-black rounded-md transition-colors ${filterMine === (tab === "Mine")
                                        ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Channel List */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-px">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="mx-2 h-14 rounded-lg bg-gray-100 dark:bg-white/5 animate-pulse" />
                            ))
                        ) : filteredDoubts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                                <HelpCircle className="h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400">No doubts yet.</p>
                            </div>
                        ) : filteredDoubts.map((doubt) => (
                            <button
                                key={doubt.id}
                                onClick={() => openDoubt(doubt)}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 mx-1 rounded-lg text-left transition-colors group ${selectedDoubt?.id === doubt.id
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-400"
                                    }`}
                                style={{ width: "calc(100% - 8px)" }}
                            >
                                <Hash className={`h-4 w-4 mt-0.5 shrink-0 ${selectedDoubt?.id === doubt.id ? "text-indigo-500" : "text-gray-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 justify-between">
                                        <p className="text-xs font-bold truncate">{doubt.title}</p>
                                        {doubt.status === "CLOSED" && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-gray-400 truncate">{doubt.subject?.name}</span>
                                        <span className="text-[10px] text-gray-300">·</span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                            <MessageSquare className="h-2.5 w-2.5" /> {doubt._count?.replies || 0}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5">
                        <button onClick={() => setShowAskModal(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-colors justify-center">
                            <Plus className="h-3.5 w-3.5" /> Ask a Doubt
                        </button>
                    </div>
                </div>

                {/* ── Main Chat Area ── */}
                <div className={`${selectedDoubt ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
                    {!selectedDoubt ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                                <BookOpen className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Select a doubt to view the thread</h2>
                            <p className="text-sm text-gray-400 mb-6 max-w-xs">Pick a doubt from the left panel or post a new one to start a discussion.</p>
                            <button onClick={() => setShowAskModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors">
                                <Plus className="h-4 w-4" /> Ask a Doubt
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Thread Header */}
                            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0e0e10]">
                                <button onClick={() => setSelectedDoubt(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ArrowLeft className="h-4 w-4 text-gray-500" />
                                </button>
                                <Hash className="h-5 w-5 text-indigo-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-black text-gray-900 dark:text-white text-sm truncate">{selectedDoubt.title}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-gray-400">{selectedDoubt.subject?.name}</span>
                                        <StatusBadge status={selectedDoubt.status} />
                                    </div>
                                </div>
                                {selectedDoubt.status !== "CLOSED" && (
                                    <button onClick={markResolved} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black hover:bg-emerald-100 transition-colors shrink-0">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                                    </button>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                                {detailLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader size="lg" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Original question as first "message" */}
                                        <div className="group flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                            <Avatar name={selectedDoubt.user?.name || "S"} role="student" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                                        {selectedDoubt.user?.name || "Student"}
                                                    </span>
                                                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 rounded font-bold">OP</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {format(new Date(selectedDoubt.createdAt), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedDoubt.content}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {selectedDoubt.chapter && (
                                                        <span className="inline-block text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                                                            📖 {selectedDoubt.chapter}
                                                        </span>
                                                    )}
                                                    {selectedDoubt.attachmentUrl && (
                                                        <a
                                                            href={selectedDoubt.attachmentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <Paperclip className="h-2.5 w-2.5" /> View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        {(selectedDoubt.replies?.length || 0) > 0 && (
                                            <div className="flex items-center gap-3 px-3 py-1">
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {selectedDoubt.replies.length} {selectedDoubt.replies.length === 1 ? "Reply" : "Replies"}
                                                </span>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {(selectedDoubt.replies || []).map((reply: any, i: number) => {
                                            const isTeacher = reply.role === "teacher";
                                            const voteVal = votes[reply.id] || 0;
                                            const upvotes = (reply.upvotes || 0) + (voteVal === 1 ? 1 : 0);
                                            return (
                                                <div
                                                    key={reply.id}
                                                    className={`group flex items-start gap-3 px-3 py-3 rounded-xl transition-colors ${isTeacher
                                                        ? "bg-violet-50/60 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                                        : "hover:bg-gray-50 dark:hover:bg-white/2"
                                                        }`}
                                                >
                                                    <Avatar name={reply.user?.name || "?"} role={reply.role} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{reply.user?.name}</span>
                                                            {isTeacher && (
                                                                <span className="text-[10px] bg-violet-200 dark:bg-violet-800/60 text-violet-700 dark:text-violet-300 px-1.5 rounded font-black uppercase">Teacher</span>
                                                            )}
                                                            <span className="text-[10px] text-gray-400">{format(new Date(reply.createdAt), "MMM d, h:mm a")}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{reply.content}</p>

                                                        {/* Vote buttons */}
                                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleVote(reply.id, 1)}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-colors ${voteVal === 1
                                                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                                                    : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                                    }`}
                                                                title="Upvote"
                                                            >
                                                                <ThumbsUp className="h-3 w-3" />
                                                                <span>{upvotes}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleVote(reply.id, -1)}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition-colors ${voteVal === -1
                                                                    ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                                                                    : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                                    }`}
                                                                title="Downvote"
                                                            >
                                                                <ThumbsDown className="h-3 w-3" />
                                                            </button>
                                                            {isTeacher && (
                                                                <span className="flex items-center gap-1 text-[10px] text-violet-500 font-bold">
                                                                    <Star className="h-3 w-3 fill-current" /> Expert Answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={repliesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Reply Box */}
                            {selectedDoubt.status !== "CLOSED" && !selectedDoubt.isLocked ? (
                                <form onSubmit={handleReply} className="px-4 pb-4 pt-2 bg-white dark:bg-[#0e0e10] border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-end gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                        <textarea
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e as any); } }}
                                            placeholder={`Reply in #${selectedDoubt.title?.slice(0, 30)}... (Shift+Enter for new line)`}
                                            rows={2}
                                            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || !replyContent.trim()}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                                        >
                                            {submitting ? <Loader size="sm" variant="white" /> : <Send className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 text-xs text-gray-400">
                                    <Lock className="h-3.5 w-3.5" />
                                    {selectedDoubt.isLocked ? "This thread is locked by the teacher." : "This doubt has been marked as resolved."}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Ask Doubt Modal ── */}
            {showAskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <Hash className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-lg font-black text-gray-900 dark:text-white">New Doubt</h2>
                            </div>
                            <button onClick={() => setShowAskModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAskDoubt} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Help with integration by parts"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-indigo-500 text-sm dark:text-white font-medium transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Subject *</label>
                                    <select
                                        value={formData.subjectId}
                                        onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-indigo-500 text-sm dark:text-white font-medium transition-colors"
                                    >
                                        <option value="">Select subject</option>
                                        {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Chapter</label>
                                    <input
                                        value={formData.chapter}
                                        onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                                        placeholder="e.g. Ch. 4"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-indigo-500 text-sm dark:text-white font-medium transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Description *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Explain your doubt in detail..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 focus:outline-none focus:border-indigo-500 text-sm dark:text-white font-medium resize-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Attachment</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="doubt-file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const label = document.getElementById("file-label");
                                            if (label && e.target.files?.[0]) {
                                                label.innerText = e.target.files[0].name;
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="doubt-file"
                                        id="file-label"
                                        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm text-gray-400 font-medium"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        Click to attach a file
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowAskModal(false)} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-black hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button disabled={postingDoubt} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                    {postingDoubt ? <Loader size="sm" variant="white" /> : <Send className="h-4 w-4" />}
                                    Post Doubt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
