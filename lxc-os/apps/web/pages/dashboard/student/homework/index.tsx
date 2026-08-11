
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    FileDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Calendar,
    History,
    Upload,
    X,
    FileText,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentHomeworkPage() {
    const [homework, setHomework] = useState<any[]>([]);
    const [studentId, setStudentId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    // Submission Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchHomework();
    }, []);

    const fetchHomework = async () => {
        try {
            const res = await client.get("/v1/dashboard/student/homework");
            setHomework(res.data.homework || []);
            setStudentId(res.data.studentId || "");
        } catch (error) {
            console.error("Failed to fetch homework", error);
            toast.error("Failed to load homework");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedItem || !studentId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("studentId", studentId);

        const endpoint = selectedItem.type === "HOMEWORK"
            ? "/v1/student/homework/submit"
            : "/v1/student/assignment/submit";

        formData.append(selectedItem.type === "HOMEWORK" ? "homeworkId" : "assignmentId", selectedItem.id);

        try {
            await client.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Submission successful!");
            setIsModalOpen(false);
            setFile(null);
            fetchHomework();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Submission failed");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredHomework = homework.filter(h => {
        const matchesSearch = h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.subject?.toLowerCase().includes(searchTerm.toLowerCase());

        const isPastDue = isPast(new Date(h.dueDate));
        const isSubmitted = h.status === "Submitted";

        if (activeTab === "upcoming") {
            // Upcoming = Not submitted AND (Not past due OR newly assigned)
            return matchesSearch && !isSubmitted;
        } else {
            // Past = Submitted OR Past Due
            return matchesSearch && (isSubmitted || isPastDue);
        }
    });

    return (
        <>
            <Head>
                <title>Homework - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 pb-20">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/student">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homework</h1>
                                <p className="text-sm text-gray-500">Track and submit your class assignments.</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Tabs */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab("upcoming")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "upcoming"
                                    ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Upcoming Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab("past")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "past"
                                    ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <History className="h-3.5 w-3.5" />
                                Past Submissions
                            </button>
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by subject or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 w-full rounded-2xl border border-gray-100 bg-white pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-gray-900"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredHomework.map((item) => (
                                <div key={item.id} className="group relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-5">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold text-xl shadow-inner">
                                                {item.subject?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {item.subject}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.description || "No description provided."}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                                            {item.status === "Submitted" ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Submitted
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${isPast(new Date(item.dueDate)) ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {isPast(new Date(item.dueDate)) ? 'Overdue' : 'Pending'}
                                                </span>
                                            )}
                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mt-1">
                                                Due: {format(new Date(item.dueDate), "MMM dd, yyyy")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-5 dark:border-white/5">
                                        {item.attachment ? (
                                            <a
                                                href={item.attachment}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors"
                                            >
                                                <FileDown className="h-4 w-4" />
                                                Material
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">No Reference</span>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (item.status !== "Submitted") {
                                                    setSelectedItem(item);
                                                    setIsModalOpen(true);
                                                }
                                            }}
                                            disabled={item.status === "Submitted"}
                                            className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${item.status === "Submitted"
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/5"
                                                : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-0.5 dark:shadow-none"
                                                }`}
                                        >
                                            {item.status === "Submitted" ? (
                                                <>Viewed <CheckCircle2 className="h-3.5 w-3.5" /></>
                                            ) : (
                                                <>Upload & Submit <Upload className="h-3.5 w-3.5" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredHomework.length === 0 && (
                                <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
                                    <div className="h-20 w-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="h-10 w-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">All Caught Up!</h3>
                                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">No homework assignments found in this category.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Submission Modal */}
                {isModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 dark:bg-gray-900 border border-white/10">
                            <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Submit Work</h2>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">{selectedItem.title}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFile(null);
                                    }}
                                    className="rounded-full bg-gray-50 p-3 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all dark:bg-white/5"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="h-4 w-4 text-indigo-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Deadline</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {format(new Date(selectedItem.dueDate), "MMMM dd, yyyy 'at' hh:mm a")}
                                        </p>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            required
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-gray-200 group-hover:border-indigo-500 bg-gray-50/50 dark:bg-white/5'
                                            }`}>
                                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-400'
                                                }`}>
                                                {file ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                                            </div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                                                {file ? file.name : "Choose Submission File"}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">
                                                PDF, DOCX, or Images
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isUploading || !file}
                                        className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-indigo-600 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-500 hover:-translate-y-1 disabled:opacity-50 dark:shadow-none"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                Confirm Submission
                                                <ArrowRight className="h-4 w-4" />
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
