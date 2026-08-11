import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    FileText, ChevronLeft, Calendar, Clock, PlusCircle,
    TrendingUp, AlertCircle, Users, Trash2, Edit2,
    CheckCircle2, Eye, X, Save, BookOpen, Hash,
    BarChart3, Zap
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";
import { toast } from "react-hot-toast";
import { encodeId } from "@/lib/utils/hashId";

const EXAM_TYPES = [
    { label: "Weekly Test", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    { label: "Biweekly Test", color: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" },
    { label: "Monthly Assessment", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
    { label: "Unit Test", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
    { label: "Custom", color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
];

const BLANK_FORM = {
    typeLabel: "Weekly Test",
    title: "",
    classId: "",
    subjectId: "",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    totalMarks: "100",
    passMark: "40",
    duration: "60",
    roomNumber: "",
};

function getGrade(score: number, total: number) {
    const pct = (score / total) * 100;
    if (pct >= 90) return { label: "A+", color: "text-emerald-600 dark:text-emerald-400" };
    if (pct >= 80) return { label: "A", color: "text-emerald-500 dark:text-emerald-400" };
    if (pct >= 70) return { label: "B+", color: "text-blue-600 dark:text-blue-400" };
    if (pct >= 60) return { label: "B", color: "text-blue-500 dark:text-blue-400" };
    if (pct >= 50) return { label: "C", color: "text-amber-600 dark:text-amber-400" };
    return { label: "F", color: "text-red-600 dark:text-red-400" };
}

export default function TeacherExamsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState<any>(null);
    const [form, setForm] = useState({ ...BLANK_FORM });
    const [classes, setClasses] = useState<any[]>([]);
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchExams = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/exams");
            setExams(res.data);
        } catch {
            toast.error("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/homework/metadata");
            setClasses(res.data.classes || []);
            setAllSubjects(res.data.subjects || []);
        } catch {
            toast.error("Failed to load class data");
        }
    };

    useEffect(() => { fetchExams(); fetchMetadata(); }, []);

    useEffect(() => {
        if (form.classId) {
            setFilteredSubjects(allSubjects.filter(s => s.classId === form.classId));
        } else {
            setFilteredSubjects([]);
        }
    }, [form.classId, allSubjects]);

    const openCreate = () => {
        setEditingExam(null);
        setForm({ ...BLANK_FORM });
        setShowModal(true);
    };

    const openEdit = (exam: any) => {
        setEditingExam(exam);
        setForm({
            typeLabel: EXAM_TYPES.find(t => exam.title.startsWith(t.label))?.label || "Custom",
            title: exam.title,
            classId: exam.classId,
            subjectId: exam.subjectId,
            scheduleDate: exam.scheduleDate ? exam.scheduleDate.slice(0, 10) : "",
            startTime: exam.startTime ? exam.startTime.slice(11, 16) : "",
            endTime: exam.endTime ? exam.endTime.slice(11, 16) : "",
            totalMarks: String(exam.totalMarks ?? 100),
            passMark: String(exam.passMark ?? 40),
            duration: String(exam.duration ?? 60),
            roomNumber: String(exam.roomNumber ?? ""),
        });
        setShowModal(true);
    };

    const handleTypeSelect = (label: string) => {
        setForm(f => ({
            ...f,
            typeLabel: label,
            title: label === "Custom" ? f.title : label,
        }));
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.classId || !form.subjectId || !form.scheduleDate) {
            return toast.error("Title, Class, Subject, and Date are required");
        }
        setSaving(true);
        try {
            const payload = {
                title: form.title,
                classId: form.classId,
                subjectId: form.subjectId,
                scheduleDate: form.scheduleDate,
                startTime: form.startTime ? `${form.scheduleDate}T${form.startTime}` : undefined,
                endTime: form.endTime ? `${form.scheduleDate}T${form.endTime}` : undefined,
                totalMarks: form.totalMarks,
                passMark: form.passMark,
                duration: form.duration,
                roomNumber: form.roomNumber || undefined,
            };

            if (editingExam) {
                await client.patch(`/v1/dashboard/teacher/exams?id=${editingExam.id}`, payload);
                toast.success("Exam updated");
            } else {
                await client.post("/v1/dashboard/teacher/exams", payload);
                toast.success("Exam created");
            }

            setShowModal(false);
            fetchExams();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to save exam");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (exam: any) => {
        if (!confirm(`Delete "${exam.title}"? This cannot be undone.`)) return;
        try {
            await client.delete(`/v1/dashboard/teacher/exams?id=${exam.id}`);
            toast.success("Exam deleted");
            fetchExams();
        } catch {
            toast.error("Failed to delete exam");
        }
    };

    const handlePublishToggle = async (exam: any) => {
        const action = exam.isPublished ? "un-publish" : "publish";
        if (!confirm(`${exam.isPublished ? "Unpublish" : "Publish"} results for "${exam.title}"? Students will ${exam.isPublished ? "no longer" : "now"} see this exam.`)) return;
        try {
            await client.patch(`/v1/dashboard/teacher/exams?id=${exam.id}`, { publish: !exam.isPublished });
            toast.success(`Results ${exam.isPublished ? "unpublished" : "published"}`);
            fetchExams();
        } catch {
            toast.error(`Failed to ${action} exam`);
        }
    };

    const now = new Date();
    const upcomingExams = exams.filter(e => new Date(e.scheduleDate) >= now);
    const pastExams = exams.filter(e => new Date(e.scheduleDate) < now);
    const displayedExams = activeTab === "upcoming" ? upcomingExams : pastExams;

    const pendingResults = pastExams.filter(e => e._count?.results === 0).length;
    const publishedCount = pastExams.filter(e => e.isPublished).length;

    return (
        <>
            <Head><title>Exam Management - LearnXChain</title></Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-10">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/teacher">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Create exams, enter results, and publish to students.</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Create Exam
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Exams", value: exams.length, icon: FileText, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
                            { label: "Upcoming", value: upcomingExams.length, icon: Calendar, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
                            { label: "Results Pending", value: pendingResults, icon: AlertCircle, color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" },
                            { label: "Published", value: publishedCount, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
                        ].map(stat => (
                            <div key={stat.label} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 w-fit">
                        {(["upcoming", "past"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-2 rounded-xl text-xs font-bold capitalize transition-all ${activeTab === tab
                                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    }`}
                            >
                                {tab} ({tab === "upcoming" ? upcomingExams.length : pastExams.length})
                            </button>
                        ))}
                    </div>

                    {/* Exam Grid */}
                    {loading ? (
                        <div className="flex h-40 items-center justify-center"><Loader size="lg" /></div>
                    ) : displayedExams.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <FileText className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No {activeTab} exams found.</p>
                            {activeTab === "upcoming" && (
                                <button onClick={openCreate} className="mt-3 text-sm font-bold text-indigo-600 hover:underline">
                                    Create your first exam →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {displayedExams.map((exam) => {
                                const typeObj = EXAM_TYPES.find(t => exam.title.startsWith(t.label)) || EXAM_TYPES[4];
                                const resultCount = exam._count?.results || 0;
                                const hasPendingResults = activeTab === "past" && resultCount === 0;

                                return (
                                    <div key={exam.id} className="group relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50">
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${typeObj.color}`}>
                                                {typeObj.label !== "Custom" ? typeObj.label : "Custom"}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(exam)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subject / Title / Class */}
                                        <div className="space-y-1 mb-5">
                                            <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">{exam.subject?.name}</h3>
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold truncate">{exam.title}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Users className="h-3 w-3" />
                                                Class {exam.class?.name}
                                            </div>
                                        </div>

                                        {/* Meta chips */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                                <Calendar className="h-3.5 w-3.5 text-rose-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {format(new Date(exam.scheduleDate), "MMM d")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {exam.duration ? `${exam.duration} min` : "—"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                                <BarChart3 className="h-3.5 w-3.5 text-amber-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {exam.totalMarks ?? 100} marks
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                                                <Hash className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Pass: {exam.passMark ?? "—"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Past exam actions */}
                                        {activeTab === "past" && (
                                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${resultCount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                        {resultCount} result{resultCount !== 1 ? "s" : ""} entered
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${exam.isPublished
                                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}>
                                                        {exam.isPublished ? "Published" : "Draft"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/teacher/exam/results/${encodeId(exam.id)}`} className="flex-1">
                                                        <button className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-indigo-500 transition-colors">
                                                            <Eye className="h-3.5 w-3.5" />
                                                            {resultCount > 0 ? "View / Edit Results" : "Enter Results"}
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handlePublishToggle(exam)}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${exam.isPublished
                                                            ? "border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                                                            : "border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                                            }`}
                                                    >
                                                        <Zap className="h-3.5 w-3.5" />
                                                        {exam.isPublished ? "Unpublish" : "Publish"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                        {editingExam ? "Edit Exam" : "Create New Exam"}
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the exam details below</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                                {/* Exam Type Quick Select */}
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Exam Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXAM_TYPES.map(t => (
                                            <button
                                                key={t.label}
                                                type="button"
                                                onClick={() => handleTypeSelect(t.label)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${form.typeLabel === t.label
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                                    : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Exam Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Weekly Test – Chapter 5"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>

                                {/* Class + Subject */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Class</label>
                                        <select
                                            value={form.classId}
                                            onChange={e => setForm(f => ({ ...f, classId: e.target.value, subjectId: "" }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Subject</label>
                                        <select
                                            value={form.subjectId}
                                            onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                                            disabled={!form.classId}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                                        >
                                            <option value="">{form.classId ? "Select Subject" : "Select Class first"}</option>
                                            {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Date + Times */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Date</label>
                                        <input
                                            type="date"
                                            value={form.scheduleDate}
                                            onChange={e => setForm(f => ({ ...f, scheduleDate: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Start Time</label>
                                        <input
                                            type="time"
                                            value={form.startTime}
                                            onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">End Time</label>
                                        <input
                                            type="time"
                                            value={form.endTime}
                                            onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Marks + Duration + Room */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { key: "totalMarks", label: "Total Marks", placeholder: "100" },
                                        { key: "passMark", label: "Pass Mark", placeholder: "40" },
                                        { key: "duration", label: "Duration (min)", placeholder: "60" },
                                        { key: "roomNumber", label: "Room No.", placeholder: "—" },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{field.label}</label>
                                            <input
                                                type="number"
                                                value={(form as any)[field.key]}
                                                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/30">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                                >
                                    {saving ? <Loader size="sm" variant="white" /> : <Save className="h-4 w-4" />}
                                    {editingExam ? "Save Changes" : "Create Exam"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
