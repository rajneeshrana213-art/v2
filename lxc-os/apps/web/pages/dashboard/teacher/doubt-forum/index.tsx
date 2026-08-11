import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Search, MessageSquare, CheckCircle2, X, Send, Hash, HelpCircle, BookOpen, ArrowLeft, ThumbsUp, ThumbsDown, Lock, Unlock, Pin, PinOff, Trash2, Star, ShieldCheck, ChevronDown, RefreshCw, Paperclip } from 'lucide-react';
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

// Use axios directly with full URL to avoid any client wrapper issues
const api = axios.create({ baseURL: "/api", withCredentials: true });

function Avatar({ name, role }: { name: string; role?: string }) {
    const bg = role === "teacher" || role === "admin" || role === "superadmin"
        ? "bg-violet-600" : "bg-indigo-500";
    return (
        <div className={`h-9 w-9 shrink-0 rounded-full ${bg} flex items-center justify-center text-white font-black text-sm select-none`}>
            {name?.[0]?.toUpperCase() || "?"}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        OPEN: "bg-amber-100 text-amber-700",
        ANSWERED: "bg-emerald-100 text-emerald-700",
        CLOSED: "bg-gray-100 text-gray-500"
    };
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${map[status] || map.OPEN}`}>
            {status}
        </span>
    );
}

export default function TeacherDoubtForum() {
    const [doubts, setDoubts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const repliesEndRef = useRef<HTMLDivElement>(null);

    const [filterClass, setFilterClass] = useState("");
    const [filterSubject, setFilterSubject] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Single fetch function that reads filter state from refs (no stale closure)
    const filterRef = useRef({ filterClass: "", filterSubject: "", filterStatus: "ALL", searchQuery: "" });

    const fetchDoubts = useCallback(async (overrides?: Partial<typeof filterRef.current>) => {
        const f = { ...filterRef.current, ...overrides };
        setLoading(true);
        setError(null);
        console.log("─── [DoubtForum] Fetching with filters:", f);
        try {
            const params: Record<string, string> = {};
            if (f.filterClass) params.classId = f.filterClass;
            if (f.filterSubject) params.subjectId = f.filterSubject;
            if (f.filterStatus && f.filterStatus !== "ALL") params.status = f.filterStatus;
            if (f.searchQuery) params.search = f.searchQuery;

            const res = await api.get("/v1/dashboard/teacher/doubt-forum", { params });
            console.log("─── [DoubtForum] API Response:", res.data);
            const data = res.data?.data ?? res.data;
            setDoubts(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("─── [DoubtForum] Fetch Error:", err);
            const msg = err?.response?.data?.error || err.message || "Failed to fetch doubts";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch meta (classes) on mount
    useEffect(() => {
        let mounted = true;
        api.get("/v1/dashboard/teacher/classes")
            .then(res => {
                if (!mounted) return;
                const cls = res.data || [];
                setClasses(cls);
                // Extract subjects from all classes
                const subMap = new Map<string, any>();
                cls.forEach((c: any) => {
                    (c.Subject || c.subjects || []).forEach((s: any) => subMap.set(s.id, s));
                });
                setSubjects(Array.from(subMap.values()));
            })
            .catch(() => { }); // Non-critical

        // Fetch doubts immediately on mount
        fetchDoubts();
        return () => { mounted = false; };
    }, [fetchDoubts]);

    // Apply filters
    const applyFilter = (key: keyof typeof filterRef.current, value: string) => {
        filterRef.current = { ...filterRef.current, [key]: value };
        switch (key) {
            case "filterClass": setFilterClass(value); break;
            case "filterSubject": setFilterSubject(value); break;
            case "filterStatus": setFilterStatus(value); break;
            case "searchQuery": setSearchQuery(value); break;
        }
        fetchDoubts({ [key]: value });
    };

    const clearFilters = () => {
        filterRef.current = { filterClass: "", filterSubject: "", filterStatus: "ALL", searchQuery: "" };
        setFilterClass(""); setFilterSubject(""); setFilterStatus("ALL"); setSearchQuery("");
        fetchDoubts({ filterClass: "", filterSubject: "", filterStatus: "ALL", searchQuery: "" });
    };

    const openDoubt = async (doubt: any) => {
        setSelectedDoubt(doubt);
        setDetailLoading(true);
        try {
            const res = await api.get(`/v1/dashboard/teacher/doubt-forum/${doubt.id}`);
            setSelectedDoubt(res.data);
        } catch { toast.error("Failed to load thread"); }
        finally { setDetailLoading(false); }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            await api.post("/v1/dashboard/teacher/doubt-forum", { doubtId: selectedDoubt.id, content: replyContent });
            setReplyContent("");
            const res = await api.get(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`);
            setSelectedDoubt(res.data);
            setDoubts(prev => prev.map(d => d.id === selectedDoubt.id
                ? { ...d, status: "ANSWERED", _count: { ...d._count, replies: (d._count?.replies || 0) + 1 } }
                : d));
            toast.success("Reply posted!");
        } catch { toast.error("Failed to post reply"); }
        finally { setSubmitting(false); }
    };

    const handleModAction = async (action: string, extraData?: any) => {
        if (!selectedDoubt) return;
        try {
            const payload = action === "status" ? { status: extraData } : { action };
            await api.patch(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`, payload);
            const res = await api.get(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`);
            setSelectedDoubt(res.data);
            setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, ...res.data } : d));
            toast.success("Done!");
        } catch { toast.error("Action failed"); }
    };

    const deleteReply = async (replyId: string) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            await api.delete(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`, { data: { replyId } });
            const res = await api.get(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`);
            setSelectedDoubt(res.data);
        } catch { toast.error("Delete failed"); }
    };

    const handleVote = async (replyId: string, dir: 1 | -1) => {
        const currentVote = votes[replyId] || 0;
        const newDirection = currentVote === dir ? -dir : dir; // Toggle or set

        try {
            await api.patch(`/v1/dashboard/teacher/doubt-forum/${selectedDoubt.id}`, {
                action: "vote-reply",
                replyId,
                direction: newDirection
            });
            setVotes(prev => ({ ...prev, [replyId]: currentVote === dir ? 0 : dir }));
            // Also update the local upvote count for immediate feedback
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

    const hasActiveFilters = filterClass || filterSubject || filterStatus !== "ALL" || searchQuery;

    const statusCounts = {
        ALL: doubts.length,
        OPEN: doubts.filter(d => d.status === "OPEN").length,
        ANSWERED: doubts.filter(d => d.status === "ANSWERED").length,
        CLOSED: doubts.filter(d => d.status === "CLOSED").length,
    };

    return (
        <DashboardLayout role="teacher">
            <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0e0e10] shadow-sm">

                {/* ── Left Sidebar ── */}
                <div className={`${selectedDoubt ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 shrink-0 border-r border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#111114]`}>

                    <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-violet-500" />
                                <h1 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest">Doubt Moderation</h1>
                            </div>
                            <button onClick={() => fetchDoubts()} title="Refresh" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                {loading ? <Loader size="sm" /> : <RefreshCw className="h-3.5 w-3.5 text-gray-500" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={e => applyFilter("searchQuery", e.target.value)}
                                placeholder="Search doubts..."
                                className="w-full rounded-lg bg-gray-100 dark:bg-white/5 py-2 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:text-white"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={filterClass}
                                onChange={e => { applyFilter("filterClass", e.target.value); applyFilter("filterSubject", ""); }}
                                className="w-full appearance-none rounded-lg bg-gray-100 dark:bg-white/5 py-2 pl-3 pr-7 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                <option value="">All Classes</option>
                                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={filterSubject}
                                onChange={e => applyFilter("filterSubject", e.target.value)}
                                className="w-full appearance-none rounded-lg bg-gray-100 dark:bg-white/5 py-2 pl-3 pr-7 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                            {(["ALL", "OPEN", "ANSWERED", "CLOSED"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => applyFilter("filterStatus", s)}
                                    className={`py-1 text-[10px] font-black rounded-md transition-colors ${filterStatus === s
                                        ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    {s === "ALL" ? "All" : s === "ANSWERED" ? "Ans" : s.slice(0, 4).charAt(0) + s.slice(1, 4).toLowerCase()}
                                    <span className="block text-[9px] opacity-60">{statusCounts[s]}</span>
                                </button>
                            ))}
                        </div>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-black text-violet-600 hover:text-violet-700">
                                <X className="h-3 w-3" /> Clear filters
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto py-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader size="lg" />
                            </div>
                        ) : error ? (
                            <div className="text-center p-4">
                                <p className="text-xs text-rose-500 font-bold mb-2">{error}</p>
                                <button onClick={() => fetchDoubts()} className="text-xs text-violet-600 font-bold hover:underline">Retry</button>
                            </div>
                        ) : doubts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400 font-bold">No doubts found</p>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="mt-2 text-[11px] text-violet-600 font-bold hover:underline">Clear filters</button>
                                )}
                            </div>
                        ) : doubts.map((doubt) => (
                            <button
                                key={doubt.id}
                                onClick={() => openDoubt(doubt)}
                                style={{ width: "calc(100% - 8px)" }}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 mx-1 mb-px rounded-lg text-left transition-colors ${selectedDoubt?.id === doubt.id
                                    ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700"
                                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-400"}`}
                            >
                                <Hash className={`h-4 w-4 mt-0.5 shrink-0 ${selectedDoubt?.id === doubt.id ? "text-violet-500" : "text-gray-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 justify-between">
                                        <p className="text-xs font-bold truncate flex items-center gap-1">
                                            {doubt.isPinned && <Pin className="h-2.5 w-2.5 text-amber-500 shrink-0" />}
                                            {doubt.title}
                                        </p>
                                        {doubt.status === "OPEN" && <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />}
                                        {doubt.status === "ANSWERED" && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                                        {doubt.status === "CLOSED" && <Lock className="h-3 w-3 text-gray-400 shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-gray-400 truncate">
                                            {doubt.class?.name && <span>{doubt.class.name} · </span>}
                                            {doubt.subject?.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-auto shrink-0">
                                            <MessageSquare className="h-2.5 w-2.5" /> {doubt._count?.replies || 0}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Thread View ── */}
                <div className={`${selectedDoubt ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
                    {!selectedDoubt ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="h-20 w-20 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-6">
                                <BookOpen className="h-10 w-10 text-violet-400" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Select a doubt to answer</h2>
                            <p className="text-sm text-gray-400 max-w-xs">Choose a thread from the left panel. Open doubts waiting for your response are marked with an amber dot.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-white/5">
                                <button onClick={() => setSelectedDoubt(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="h-4 w-4 text-gray-500" />
                                </button>
                                <Hash className="h-5 w-5 text-violet-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-black text-gray-900 dark:text-white text-sm truncate">
                                        {selectedDoubt.isPinned && <Pin className="inline h-3.5 w-3.5 text-amber-500 mr-1" />}
                                        {selectedDoubt.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-gray-400">
                                            {selectedDoubt.class?.name && `${selectedDoubt.class.name} · `}{selectedDoubt.subject?.name}
                                        </span>
                                        <StatusBadge status={selectedDoubt.status} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => handleModAction("pin")} title={selectedDoubt.isPinned ? "Unpin" : "Pin"} className={`p-2 rounded-lg transition-colors ${selectedDoubt.isPinned ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-400"}`}>
                                        {selectedDoubt.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                    </button>
                                    <button onClick={() => handleModAction("lock")} title={selectedDoubt.isLocked ? "Unlock" : "Lock"} className={`p-2 rounded-lg transition-colors ${selectedDoubt.isLocked ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-400"}`}>
                                        {selectedDoubt.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    </button>
                                    {selectedDoubt.status !== "ANSWERED" && (
                                        <button onClick={() => handleModAction("status", "ANSWERED")} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black hover:bg-emerald-100 rounded-lg transition-colors">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                                        </button>
                                    )}
                                    {selectedDoubt.status !== "CLOSED" && (
                                        <button onClick={() => handleModAction("status", "CLOSED")} className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-lg text-xs font-black hover:bg-gray-200 transition-colors">
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                                {detailLoading ? (
                                    <div className="flex items-center justify-center h-40"><Loader size="lg" /></div>
                                ) : (
                                    <>
                                        <div className="group flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                                            <Avatar name={selectedDoubt.user?.name || "S"} role="student" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{selectedDoubt.user?.name || "Student"}</span>
                                                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-1.5 rounded font-bold">OP</span>
                                                    <span className="text-[10px] text-gray-400">{selectedDoubt.createdAt ? format(new Date(selectedDoubt.createdAt), "MMM d, h:mm a") : ""}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedDoubt.content}</p>
                                                {selectedDoubt.chapter && <span className="inline-block mt-2 text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-bold">📖 {selectedDoubt.chapter}</span>}
                                                {selectedDoubt.attachmentUrl && (
                                                    <div className="mt-4">
                                                        <a
                                                            href={selectedDoubt.attachmentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Paperclip className="h-3 w-3" /> View Attachment
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {(selectedDoubt.replies?.length || 0) > 0 && (
                                            <div className="flex items-center gap-3 px-3 py-1">
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedDoubt.replies.length} replies</span>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                                            </div>
                                        )}

                                        {(selectedDoubt.replies || []).map((reply: any) => {
                                            const isTeacher = reply.role === "teacher" || reply.role === "admin";
                                            const voteVal = votes[reply.id] || 0;
                                            const upvoteCount = (reply.upvotes || 0) + (voteVal === 1 ? 1 : 0);
                                            return (
                                                <div key={reply.id} className={`group flex items-start gap-3 px-3 py-3 rounded-xl transition-colors ${isTeacher ? "bg-violet-50/60 dark:bg-violet-900/10" : "hover:bg-gray-50 dark:hover:bg-white/3"}`}>
                                                    <Avatar name={reply.user?.name || "?"} role={reply.role} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{reply.user?.name}</span>
                                                            {isTeacher && <span className="text-[10px] bg-violet-200 dark:bg-violet-800/60 text-violet-700 px-1.5 rounded font-black uppercase">Teacher</span>}
                                                            <span className="text-[10px] text-gray-400">{reply.createdAt ? format(new Date(reply.createdAt), "MMM d, h:mm a") : ""}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleVote(reply.id, 1)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${voteVal === 1 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-emerald-600"}`}>
                                                                <ThumbsUp className="h-3 w-3" /> {upvoteCount}
                                                            </button>
                                                            <button onClick={() => handleVote(reply.id, -1)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${voteVal === -1 ? "bg-rose-100 text-rose-600" : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500"}`}>
                                                                <ThumbsDown className="h-3 w-3" />
                                                            </button>
                                                            {isTeacher && <span className="flex items-center gap-1 text-[10px] text-violet-500 font-bold"><Star className="h-3 w-3 fill-current" /> Expert Answer</span>}
                                                            <button onClick={() => deleteReply(reply.id)} className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={repliesEndRef} />
                                    </>
                                )}
                            </div>

                            {!selectedDoubt.isLocked ? (
                                <form onSubmit={handleReply} className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-end gap-3 bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                                        <ShieldCheck className="h-4 w-4 text-violet-400 mt-1 shrink-0" />
                                        <textarea
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e as any); } }}
                                            placeholder="Reply as teacher... (Enter to send, Shift+Enter for new line)"
                                            rows={2}
                                            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
                                        />
                                        <button type="submit" disabled={submitting || !replyContent.trim()} className="h-8 w-8 flex items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-colors shrink-0">
                                            {submitting ? <Loader size="sm" variant="white" /> : <Send className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-violet-500 font-bold mt-1.5 ml-1 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Your reply will be highlighted for students
                                    </p>
                                </form>
                            ) : (
                                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Thread is locked.</span>
                                    <button onClick={() => handleModAction("lock")} className="text-violet-600 font-black hover:underline">Unlock</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
