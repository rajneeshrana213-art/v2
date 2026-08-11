
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    Clock,
    CheckCircle2,
    Search,
    Users,
    Calendar,
    FileText,
    ExternalLink,
    Star,
    X,
    MessageSquare,
    Save
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId } from "@/lib/utils/hashId";

export default function HomeworkDetailsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [homework, setHomework] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [gradingData, setGradingData] = useState({ score: "", feedback: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) fetchHomeworkDetails();
    }, [id]);

    const fetchHomeworkDetails = async () => {
        try {
            const res = await client.get(`/v1/dashboard/teacher/homework/${id}`);
            setHomework(res.data);
        } catch (error) {
            console.error("Failed to fetch homework details", error);
            toast.error("Failed to load homework details");
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingData.score) return toast.error("Please enter a score");

        setIsSaving(true);
        try {
            await client.patch(`/v1/dashboard/teacher/homework/submissions/${selectedSubmission.id}`, gradingData);
            toast.success("Submission graded successfully!");
            setSelectedSubmission(null);
            fetchHomeworkDetails();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Grading failed");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredSubmissions = homework?.HomeworkSubmission?.filter((s: any) =>
        s.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex h-screen items-center justify-center">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!homework) {
        return (
            <DashboardLayout role="teacher">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Homework not found</h2>
                    <Link href="/dashboard/teacher/homework">
                        <button className="mt-4 text-indigo-600 font-bold hover:underline flex items-center gap-2 mx-auto">
                            <ChevronLeft className="h-4 w-4" /> Back to Homework
                        </button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>{homework.title} - Homework Details</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-12">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{homework.title}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {homework.subject?.name}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                        Class {homework.class?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Due Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {format(new Date(homework.dueDate), "MMM dd, yyyy")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Content - Submissions List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900 dark:text-white">Submissions</h2>
                                            <p className="text-xs text-gray-500">{homework.HomeworkSubmission?.length || 0} Total Submissions</p>
                                        </div>
                                    </div>
                                    <div className="relative w-48">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search student..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-50 dark:border-white/5">
                                                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Student</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Submitted On</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Score</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {filteredSubmissions.map((sub: any) => (
                                                <tr key={sub.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10">
                                                                {sub.student?.user?.profilePic ? (
                                                                    <img src={sub.student.user.profilePic} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="text-[10px] font-bold text-gray-400">{sub.student?.user?.name?.[0]}</div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{sub.student?.user?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-xs text-gray-500">{format(new Date(sub.submittedAt), "MMM dd, h:mm a")}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {sub.score !== null ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                                <Star className="h-3 w-3 fill-current" />
                                                                {sub.score}/100
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-amber-500">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSubmission(sub);
                                                                setGradingData({ score: sub.score?.toString() || "", feedback: sub.feedback || "" });
                                                            }}
                                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 underline"
                                                        >
                                                            {sub.score !== null ? "View/Edit" : "Grade"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredSubmissions.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-gray-500 text-sm italic">
                                                        No submissions found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Details Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Description
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                        {homework.description || "No description provided."}
                                    </p>
                                </div>

                                {homework.attachment && (
                                    <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Attachment</h4>
                                        <a
                                            href={homework.attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600 shadow-sm">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">View Reference Material</span>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-gray-400" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight">Timeline</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-indigo-100 uppercase tracking-widest font-bold">Created</span>
                                        <span className="font-bold">{format(new Date(homework.createdAt), "MMM dd, yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-indigo-100 uppercase tracking-widest font-bold">Deadline</span>
                                        <span className="font-bold">{format(new Date(homework.dueDate), "MMM dd, yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-indigo-100 uppercase tracking-widest font-bold">Status</span>
                                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${homework.status === 'PUBLISHED' ? 'bg-emerald-500/30 text-emerald-100' : 'bg-amber-500/30 text-amber-100'}`}>
                                            {homework.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grading Modal */}
                {selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 dark:bg-gray-900 border border-white/10">
                            <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Grade Submission</h2>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Student: {selectedSubmission.student?.user?.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="rounded-full bg-gray-50 p-3 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all dark:bg-white/5"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleGrade} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-2xl bg-indigo-50/50 p-4 dark:bg-indigo-950/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Submitted Work</span>
                                        </div>
                                        <a
                                            href={selectedSubmission.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500"
                                        >
                                            View File
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Score (Out of 100)</label>
                                            <div className="relative">
                                                <Star className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    required
                                                    value={gradingData.score}
                                                    onChange={(e) => setGradingData({ ...gradingData, score: e.target.value })}
                                                    className="w-full rounded-2xl bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                                    placeholder="85"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Feedback</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <textarea
                                                rows={4}
                                                value={gradingData.feedback}
                                                onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                                className="w-full rounded-2xl bg-gray-50 py-4 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white resize-none"
                                                placeholder="Provide constructive feedback..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-500 disabled:opacity-50 dark:shadow-none"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Grade
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
