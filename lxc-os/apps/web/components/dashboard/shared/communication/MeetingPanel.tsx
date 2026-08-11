
import React, { useEffect, useRef, useState } from "react";
import { Calendar, Video, Plus, Clock, Users, Link2, Search, X, Check, Loader2, Copy } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import client from "@/lib/api/client";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/context/AuthContext";

interface Participant {
    user: { id: string; name: string; profilePic?: string | null };
}

interface Meeting {
    id: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime?: string | null;
    joinToken: string;
    isActive: boolean;
    isEnded: boolean;
    creator: { id: string; name: string; profilePic?: string | null };
    participants: Participant[];
}

interface SchoolUser {
    id: string;
    name: string;
    email: string;
    profilePic?: string | null;
    role: string;
}

interface MeetingPanelProps {
    canSchedule?: boolean;
    canInstant?: boolean;
    userId: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, src, size = 28 }: { name: string; src?: string | null; size?: number }) {
    const initials = (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-rose-500"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={`${color} text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {initials}
        </div>
    );
}

// ─── Participant Picker ───────────────────────────────────────────────────────
function ParticipantPicker({
    schoolId,
    selected,
    onChange,
}: {
    schoolId?: string;
    selected: SchoolUser[];
    onChange: (users: SchoolUser[]) => void;
}) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SchoolUser[]>([]);
    const [loading, setLoading] = useState(false);
    const debounce = useRef<NodeJS.Timeout>();

    useEffect(() => {
        clearTimeout(debounce.current);
        if (!search.trim() || !schoolId) { setResults([]); return; }
        setLoading(true);
        debounce.current = setTimeout(async () => {
            try {
                const res = await client.get("/v1/communication/users", { params: { schoolId } });
                const all: SchoolUser[] = res.data || [];
                setResults(all.filter(u => u.name.toLowerCase().includes(search.toLowerCase())));
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 350);
    }, [search, schoolId]);

    const toggle = (u: SchoolUser) => {
        const exists = selected.some(s => s.id === u.id);
        onChange(exists ? selected.filter(s => s.id !== u.id) : [...selected, u]);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Participants
            </label>
            {/* Selected chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.map(u => (
                        <span key={u.id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            <Avatar name={u.name} src={u.profilePic} size={16} />
                            {u.name.split(" ")[0]}
                            <button onClick={() => toggle(u)} className="ml-0.5 hover:text-blue-900">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name…"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
            </div>
            {search.trim() && (
                <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                    {loading ? (
                        <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 text-blue-500 animate-spin" /></div>
                    ) : results.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No results</p>
                    ) : results.map(u => {
                        const isSelected = selected.some(s => s.id === u.id);
                        return (
                            <button
                                type="button"
                                key={u.id}
                                onClick={() => toggle(u)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                            >
                                <Avatar name={u.name} src={u.profilePic} size={24} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate capitalize">{u.role}</p>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function MeetingPanel({ canSchedule = false, canInstant = false, userId }: MeetingPanelProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [startingInstant, setStartingInstant] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<SchoolUser[]>([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        startTime: "",
        durationMinutes: 60,
    });

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const { data } = await client.get(`/v1/communication/meetings/list?filter=${tab}`);
            setMeetings(data.meetings || []);
        } catch {
            toast.error("Failed to load meetings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMeetings(); }, [tab]);

    const handleInstant = async () => {
        setStartingInstant(true);
        try {
            const { data } = await client.post("/v1/communication/meetings/instant");
            toast.success("Meeting started!");
            router.push(`/meet/${data.callId}`);
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to start meeting");
        } finally {
            setStartingInstant(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setScheduling(true);
        try {
            await client.post("/v1/communication/meetings/schedule", {
                title: form.title,
                description: form.description,
                startTime: form.startTime,
                durationMinutes: form.durationMinutes,
                participantIds: selectedParticipants.map(p => p.id),
            });
            toast.success("Meeting scheduled!");
            setShowScheduleForm(false);
            setForm({ title: "", description: "", startTime: "", durationMinutes: 60 });
            setSelectedParticipants([]);
            loadMeetings();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || "Failed to schedule meeting");
        } finally {
            setScheduling(false);
        }
    };

    const copyLink = (callId: string) => {
        const link = `${window.location.origin}/meet/${callId}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copied!");
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                    {(["upcoming", "past"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                        >
                            {t === "upcoming" ? "Upcoming" : "Past"}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {canInstant && (
                        <button
                            onClick={handleInstant}
                            disabled={startingInstant}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition"
                        >
                            {startingInstant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                            Instant Meeting
                        </button>
                    )}
                    {canSchedule && (
                        <button
                            onClick={() => setShowScheduleForm(!showScheduleForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
                        >
                            <Plus className="w-4 h-4" />
                            Schedule
                        </button>
                    )}
                </div>
            </div>

            {/* Schedule Form */}
            {showScheduleForm && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Schedule a Meeting</h3>
                        <button onClick={() => setShowScheduleForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <form onSubmit={handleSchedule} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Meeting title"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.startTime}
                                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                min={15}
                                max={480}
                                value={form.durationMinutes}
                                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <ParticipantPicker
                            schoolId={user?.schoolId}
                            selected={selectedParticipants}
                            onChange={setSelectedParticipants}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={2}
                                placeholder="Optional description…"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowScheduleForm(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={scheduling}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                {scheduling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {scheduling ? "Scheduling…" : "Schedule Meeting"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Meetings list */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : meetings.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{tab === "upcoming" ? "No upcoming meetings" : "No past meetings"}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {meetings.map((meeting) => {
                        const isHost = meeting.creator.id === userId;
                        const start = parseISO(meeting.startTime);
                        const ended = meeting.isEnded || (meeting.endTime ? isPast(parseISO(meeting.endTime)) : false);
                        // Participants list already excludes the creator from DB; add 1 for the host
                        const totalParticipants = meeting.participants.length + 1;

                        return (
                            <div
                                key={meeting.id}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-800/50 transition"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {meeting.isActive && !ended && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Live
                                                </span>
                                            )}
                                            {ended && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ended</span>
                                            )}
                                            {isHost && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Host</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                                        {meeting.description && meeting.description !== "Instant meeting" && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{meeting.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(start, "MMM d, yyyy · h:mm a")}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                {totalParticipants} {totalParticipants === 1 ? "participant" : "participants"}
                                            </span>
                                            {/* Participant avatars */}
                                            <div className="flex -space-x-1.5 items-center">
                                                <Avatar name={meeting.creator.name} src={meeting.creator.profilePic} size={20} />
                                                {meeting.participants.slice(0, 3).map((p) => (
                                                    <Avatar key={p.user.id} name={p.user.name} src={p.user.profilePic} size={20} />
                                                ))}
                                                {meeting.participants.length > 3 && (
                                                    <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-medium text-gray-500">
                                                        +{meeting.participants.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => copyLink(meeting.joinToken)}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                            title="Copy meeting link"
                                        >
                                            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                        {!ended && (
                                            <button
                                                onClick={() => router.push(`/meet/${meeting.joinToken}`)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

