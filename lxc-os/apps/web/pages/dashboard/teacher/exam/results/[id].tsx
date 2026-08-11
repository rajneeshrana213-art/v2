import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState, useCallback } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft, Save, Users, CheckCircle2, AlertCircle,
    Search, User, BarChart3, Trophy, Zap, XCircle, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";
import { toast } from "react-hot-toast";
import { decodeId, encodeId } from "@/lib/utils/hashId";

function getGrade(score: number, total: number) {
    const pct = (score / total) * 100;
    if (pct >= 90) return { label: "A+", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" };
    if (pct >= 80) return { label: "A", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" };
    if (pct >= 70) return { label: "B+", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" };
    if (pct >= 60) return { label: "B", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" };
    if (pct >= 50) return { label: "C", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" };
    return { label: "F", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" };
}

export default function TeacherExamResultsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const examId = rawId ? decodeId(rawId as string) : undefined;

    const [exam, setExam] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        if (!examId) return;
        setLoading(true);
        try {
            const res = await client.get(`/v1/dashboard/teacher/exam/${examId}/results`);
            setExam(res.data.exam);
            setStudents(res.data.students);

            // Pre-fill existing scores
            const initial: Record<string, string> = {};
            res.data.students.forEach((s: any) => {
                if (s.results?.[0]) {
                    initial[s.id] = String(s.results[0].score);
                }
            });
            setScores(initial);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to load exam data");
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        const results = students
            .filter(s => scores[s.id] !== undefined && scores[s.id] !== "")
            .map(s => ({ studentId: s.id, score: scores[s.id] }));

        if (results.length === 0) return toast.error("Enter at least one score");

        // Validate scores
        const total = exam?.totalMarks ?? 100;
        for (const r of results) {
            const v = parseInt(r.score);
            if (isNaN(v) || v < 0 || v > total) {
                return toast.error(`Scores must be between 0 and ${total}`);
            }
        }

        setSaving(true);
        try {
            await client.post(`/v1/dashboard/teacher/exam/${examId}/results`, { results });
            toast.success(`${results.length} result${results.length !== 1 ? "s" : ""} saved`);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to save results");
        } finally {
            setSaving(false);
        }
    };

    const handlePublishToggle = async () => {
        if (!exam) return;
        const action = exam.isPublished ? "Unpublish" : "Publish";
        if (!confirm(`${action} results for "${exam.title}"?`)) return;

        setPublishing(true);
        try {
            await client.patch(`/v1/dashboard/teacher/exams?id=${examId}`, { publish: !exam.isPublished });
            toast.success(`Results ${exam.isPublished ? "unpublished" : "published"} successfully`);
            fetchData();
        } catch {
            toast.error("Failed to update publish status");
        } finally {
            setPublishing(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.academicRecords?.[0]?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const enteredCount = students.filter(s => scores[s.id] !== undefined && scores[s.id] !== "").length;
    const total = exam?.totalMarks ?? 100;
    const passMark = exam?.passMark ?? 40;
    const passCount = students.filter(s => {
        const v = parseInt(scores[s.id] ?? "");
        return !isNaN(v) && v >= passMark;
    }).length;
    const avgScore = enteredCount > 0
        ? (students.reduce((acc, s) => {
            const v = parseInt(scores[s.id] ?? "");
            return !isNaN(v) ? acc + v : acc;
        }, 0) / enteredCount).toFixed(1)
        : "—";

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex h-[60vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    if (!exam) {
        return (
            <DashboardLayout role="teacher">
                <div className="text-center py-20">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Exam not found.</p>
                    <Link href="/dashboard/teacher/exam">
                        <button className="mt-4 text-indigo-600 font-bold hover:underline">Back to Exams</button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head><title>{exam.title} – Results | LearnXChain</title></Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-12">

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <Link href="/dashboard/teacher/exam">
                                <button className="rounded-full p-2 mt-1 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">{exam.title}</h1>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${exam.isPublished
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                        {exam.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {exam.subject?.name} • Class {exam.class?.name} •{" "}
                                    {exam.scheduleDate && format(new Date(exam.scheduleDate), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handlePublishToggle}
                                disabled={publishing}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition-all disabled:opacity-50 ${exam.isPublished
                                    ? "border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10"
                                    : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                    }`}
                            >
                                {publishing ? <Loader size="sm" /> : <Zap className="h-4 w-4" />}
                                {exam.isPublished ? "Unpublish Results" : "Publish Results"}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || enteredCount === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader size="sm" variant="white" /> : <Save className="h-4 w-4" />}
                                Save Results
                            </button>
                        </div>
                    </div>

                    {/* Exam Info + Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Marks", value: total, icon: BarChart3, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
                            { label: "Pass Mark", value: passMark, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
                            { label: "Avg Score", value: avgScore, icon: TrendingUp, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
                            { label: `Passed (${enteredCount > 0 ? passCount : "—"})`, value: enteredCount > 0 ? `${Math.round((passCount / enteredCount) * 100)}%` : "—", icon: Trophy, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
                        ].map(stat => (
                            <div key={stat.label} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Results Entered: <span className="text-indigo-600 dark:text-indigo-400">{enteredCount}</span> / {students.length}
                            </p>
                            <p className="text-xs font-bold text-gray-400">{Math.round((enteredCount / Math.max(students.length, 1)) * 100)}%</p>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${(enteredCount / Math.max(students.length, 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Student Results Table */}
                    <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-gray-900 dark:text-white">Student Results</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{students.length} students in class</p>
                                </div>
                            </div>
                            <div className="relative w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="h-9 w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 text-xs dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-white/5">
                                        <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Student</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Roll No</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                            Score <span className="text-gray-400 font-normal">/ {total}</span>
                                        </th>
                                        <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">%</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Grade</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filteredStudents.map((student) => {
                                        const scoreVal = scores[student.id] ?? "";
                                        const numScore = parseInt(scoreVal);
                                        const hasScore = !isNaN(numScore) && scoreVal !== "";
                                        const pct = hasScore ? Math.round((numScore / total) * 100) : null;
                                        const grade = hasScore ? getGrade(numScore, total) : null;
                                        const passed = hasScore && numScore >= passMark;

                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {student.user?.profilePic ? (
                                                                <img src={student.user.profilePic} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <User className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{student.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                        {student.academicRecords?.[0]?.rollNumber || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={total}
                                                            value={scoreVal}
                                                            onChange={e => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                            placeholder="—"
                                                            className="w-20 text-center px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {pct !== null ? `${pct}%` : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {grade ? (
                                                        <span className={`inline-flex items-center justify-center h-8 w-10 rounded-xl text-xs font-black ${grade.bg} ${grade.text}`}>
                                                            {grade.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 dark:text-gray-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {hasScore ? (
                                                        passed ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                                <CheckCircle2 className="h-3 w-3" /> Pass
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                                                <XCircle className="h-3 w-3" /> Fail
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm italic">
                                                No students found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Save */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {enteredCount === students.length
                                    ? "All scores entered — ready to save and publish."
                                    : `${students.length - enteredCount} student${students.length - enteredCount !== 1 ? "s" : ""} still pending.`}
                            </p>
                            <button
                                onClick={handleSave}
                                disabled={saving || enteredCount === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50 transition-all"
                            >
                                {saving ? <Loader size="sm" variant="white" /> : <Save className="h-4 w-4" />}
                                Save All Results
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
