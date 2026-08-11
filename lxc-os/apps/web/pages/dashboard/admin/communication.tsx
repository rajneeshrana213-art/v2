
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useAuth } from "@/lib/context/AuthContext";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    MessageSquare, Video, History, ShieldCheck, Users, Search,
    Plus, X, Check, ChevronDown, Filter, UserCheck, BookOpen,
    Loader2, Send, GraduationCap, User, Briefcase, Baby
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ChatPanel = dynamic(() => import("@/components/dashboard/shared/communication/ChatPanel"), { ssr: false });
const MeetingPanel = dynamic(() => import("@/components/dashboard/shared/communication/MeetingPanel"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "chat" | "people" | "meetings" | "history";

type RoleFilter = "all" | "teacher" | "student" | "parent" | "staff";

interface SchoolUser {
    id: string;
    name: string;
    email: string;
    profilePic?: string | null;
    role: string;
}

interface ClassItem {
    id: string;
    name: string;
    section?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { key: "chat", label: "Chat", icon: MessageSquare },
    // { key: "people", label: "People & Groups", icon: Users },
    { key: "meetings", label: "Schedule Meeting", icon: Video },
    { key: "history", label: "Meeting History", icon: History },
];

const ROLE_FILTERS: { key: RoleFilter; label: string; icon: React.ComponentType<any>; color: string }[] = [
    { key: "all", label: "All", icon: Users, color: "blue" },
    { key: "teacher", label: "Teachers", icon: UserCheck, color: "green" },
    { key: "student", label: "Students", icon: GraduationCap, color: "purple" },
    { key: "parent", label: "Parents", icon: Baby, color: "orange" },
    { key: "staff", label: "Staff", icon: Briefcase, color: "gray" },
];

const ROLE_BADGE: Record<string, string> = {
    teacher: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    student: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    parent: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    staff: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// ─── Avatar helper ────────────────────────────────────────────────────────────

function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
    const initials = name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: size, height: size }}
            />
        );
    }
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-rose-500", "bg-teal-500"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div
            className={`${color} text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
            style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
            {initials}
        </div>
    );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
    adminId: string;
    schoolId?: string;
    onCreated: () => void;
}

function CreateGroupModal({ open, onClose, adminId, schoolId, onCreated }: CreateGroupModalProps) {
    const [step, setStep] = useState<"select" | "name">("select");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [classFilter, setClassFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<SchoolUser[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Load classes once
    useEffect(() => {
        if (!open || !schoolId) return;
        client.get("/v1/dashboard/admin/classes").then(r => {
            setClasses(r.data?.data || r.data || []);
        }).catch(() => { });
    }, [open, schoolId]);

    // Fetch users with debounce
    const fetchUsers = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const params: Record<string, string> = { schoolId };
            if (roleFilter !== "all") params.role = roleFilter;
            if (classFilter && roleFilter === "student") params.classId = classFilter;
            const res = await client.get("/v1/communication/users", { params });
            setUsers(res.data || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [schoolId, roleFilter, classFilter]);

    useEffect(() => {
        if (!open) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchUsers, 300);
    }, [open, fetchUsers]);

    const filtered = users.filter(u =>
        u.id !== adminId &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selected.size < 1) {
            toast.error("Add a group name and select at least 1 member.");
            return;
        }
        setCreating(true);
        try {
            await client.post("/v1/communication/chat/channel/create", {
                type: "school_group",
                memberIds: Array.from(selected),
                name: groupName.trim(),
            });
            toast.success(`Group "${groupName}" created!`);
            onCreated();
            handleClose();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to create group");
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        setStep("select");
        setSelected(new Set());
        setGroupName("");
        setSearch("");
        setRoleFilter("all");
        setClassFilter("");
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Group</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {step === "select"
                                ? `Select members · ${selected.size} selected`
                                : "Name your group"}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === "select" ? (
                    <>
                        {/* Filters */}
                        <div className="p-4 space-y-3 border-b border-gray-100 dark:border-gray-800">
                            {/* Role pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {ROLE_FILTERS.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => { setRoleFilter(key); setClassFilter(""); }}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${roleFilter === key
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Class filter (students only) */}
                            {roleFilter === "student" && classes.length > 0 && (
                                <select
                                    value={classFilter}
                                    onChange={e => setClassFilter(e.target.value)}
                                    className="w-full text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-none outline-none text-gray-700 dark:text-gray-300"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}{c.section ? ` - ${c.section}` : ""}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name…"
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* User list */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">No users found</div>
                            ) : (
                                filtered.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => toggle(u.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selected.has(u.id)
                                                ? "bg-blue-50 dark:bg-blue-900/20"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        <div className="relative">
                                            <Avatar name={u.name} src={u.profilePic} size={38} />
                                            {selected.has(u.id) && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.staff}`}>
                                            {u.role}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-sm text-gray-500">{selected.size} selected</span>
                            <button
                                onClick={() => selected.size > 0 && setStep("name")}
                                disabled={selected.size === 0}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                ) : (
                    /* Step 2: Name */
                    <div className="p-5 flex flex-col gap-5 flex-1">
                        {/* Selected preview */}
                        <div className="flex flex-wrap gap-2">
                            {Array.from(selected).map(id => {
                                const u = users.find(x => x.id === id);
                                if (!u) return null;
                                return (
                                    <span key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                        <Avatar name={u.name} src={u.profilePic} size={18} />
                                        {u.name.split(" ")[0]}
                                        <button onClick={() => toggle(id)} className="ml-0.5 hover:text-blue-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Group Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="e.g. Class 10A Parents, Staff Meeting…"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={60}
                                autoFocus
                            />
                            <p className="text-xs text-gray-400 mt-1">{groupName.length}/60</p>
                        </div>

                        <div className="flex items-center gap-3 mt-auto">
                            <button
                                onClick={() => setStep("select")}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !groupName.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium transition flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? "Creating…" : "Create Group"}
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── People Panel ─────────────────────────────────────────────────────────────

interface PeoplePanelProps {
    adminId: string;
    schoolId?: string;
    onStartChat: (userId: string, userName: string) => void;
    onOpenCreateGroup: () => void;
}

function PeoplePanel({ adminId, schoolId, onStartChat, onOpenCreateGroup }: PeoplePanelProps) {
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [classFilter, setClassFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<SchoolUser[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [starting, setStarting] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Load classes
    useEffect(() => {
        if (!schoolId) return;
        client.get("/v1/dashboard/admin/classes").then(r => {
            setClasses(r.data?.data || r.data || []);
        }).catch(() => { });
    }, [schoolId]);

    const fetchUsers = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const params: Record<string, string> = { schoolId };
            if (roleFilter !== "all") params.role = roleFilter;
            if (classFilter && roleFilter === "student") params.classId = classFilter;
            const res = await client.get("/v1/communication/users", { params });
            setUsers(res.data || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [schoolId, roleFilter, classFilter]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchUsers, 300);
    }, [fetchUsers]);

    const handleStartDM = async (u: SchoolUser) => {
        setStarting(u.id);
        try {
            await client.post("/v1/communication/chat/channel/create", {
                type: "direct",
                memberIds: [u.id],
            });
            toast.success(`Chat with ${u.name} started`);
            onStartChat(u.id, u.name);
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to start chat");
        } finally {
            setStarting(null);
        }
    };

    const filtered = users.filter(u =>
        u.id !== adminId &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group by role for nicer display
    const grouped: Record<string, SchoolUser[]> = {};
    filtered.forEach(u => {
        const r = u.role || "other";
        if (!grouped[r]) grouped[r] = [];
        grouped[r].push(u);
    });

    return (
        <div className="flex flex-col h-full min-h-[600px]">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search teachers, students, parents, staff…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                </div>
                <button
                    onClick={onOpenCreateGroup}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Group
                </button>
            </div>

            {/* Role filter pills */}
            <div className="flex flex-wrap gap-2 mb-3">
                {ROLE_FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => { setRoleFilter(key); setClassFilter(""); }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${roleFilter === key
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600"
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Class filter (students only) */}
            <AnimatePresence>
                {roleFilter === "student" && classes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500 font-medium">Filter by Class:</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button
                                onClick={() => setClassFilter("")}
                                className={`px-3 py-1 text-xs rounded-lg transition border ${classFilter === ""
                                        ? "bg-purple-600 border-purple-600 text-white"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}
                            >
                                All Classes
                            </button>
                            {classes.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setClassFilter(c.id)}
                                    className={`px-3 py-1 text-xs rounded-lg transition border ${classFilter === c.id
                                            ? "bg-purple-600 border-purple-600 text-white"
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    {c.name}{c.section ? ` – ${c.section}` : ""}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                        <Users className="w-12 h-12 opacity-30" />
                        <p className="text-sm font-medium">No people found</p>
                        <p className="text-xs opacity-70">Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    <div>
                        {/* Stats bar */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{filtered.length} people found</span>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                {Object.entries(grouped).map(([role, list]) => (
                                    <span key={role} className={`px-2 py-0.5 rounded-full ${ROLE_BADGE[role] || ROLE_BADGE.staff}`}>
                                        {list.length} {role}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* User rows */}
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filtered.map(u => (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
                                >
                                    <Avatar name={u.name} src={u.profilePic} size={40} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize hidden sm:inline-flex ${ROLE_BADGE[u.role] || ROLE_BADGE.staff}`}>
                                        {u.role}
                                    </span>
                                    <button
                                        onClick={() => handleStartDM(u)}
                                        disabled={starting === u.id}
                                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
                                    >
                                        {starting === u.id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Send className="w-3.5 h-3.5" />}
                                        Message
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCommunicationPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("chat");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [chatRefreshKey, setChatRefreshKey] = useState(0);

    if (!user) return null;

    const switchToChat = () => setActiveTab("chat");
    const handleGroupCreated = () => {
        setChatRefreshKey(k => k + 1);
        setActiveTab("chat");
    };

    return (
        <>
            <Head>
                <title>Communication · Admin · LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="flex flex-col h-full min-h-screen p-6 space-y-5">
                    {/* Page header */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Search, message, and group teachers · students · parents · staff
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowCreateGroup(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Group
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                Admin
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === key
                                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1">
                        {activeTab === "chat" && (
                            <ChatPanel
                                key={chatRefreshKey}
                                userId={user.id}
                                userName={user.name}
                                userImage={user.profilePic}
                                role={user.role}
                                schoolId={user.schoolId}
                                channelFilter={{ type: { $in: ["messaging", "team"] } }}
                                canCreateGroup
                            />
                        )}

                        {activeTab === "people" && (
                            <PeoplePanel
                                adminId={user.id}
                                schoolId={user.schoolId}
                                onStartChat={switchToChat}
                                onOpenCreateGroup={() => setShowCreateGroup(true)}
                            />
                        )}

                        {activeTab === "meetings" && (
                            <MeetingPanel
                                userId={user.id}
                                canSchedule
                                canInstant
                            />
                        )}

                        {activeTab === "history" && (
                            <MeetingPanel
                                userId={user.id}
                                canSchedule={false}
                                canInstant={false}
                            />
                        )}
                    </div>
                </div>

                {/* Create Group Modal */}
                <AnimatePresence>
                    {showCreateGroup && (
                        <CreateGroupModal
                            open={showCreateGroup}
                            onClose={() => setShowCreateGroup(false)}
                            adminId={user.id}
                            schoolId={user.schoolId}
                            onCreated={handleGroupCreated}
                        />
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </>
    );
}
