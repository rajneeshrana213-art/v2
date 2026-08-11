
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    FileText,
    ChevronLeft,
    Calendar,
    Award,
    Search,
    Filter,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentExamsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"exams" | "results">("exams");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, resultsRes] = await Promise.all([
                    client.get("/v1/dashboard/student/exams"),
                    client.get("/v1/dashboard/student/results")
                ]);
                setExams(examsRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error("Failed to fetch exam/result data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <Head>
                <title>Exams & Results - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/student">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams & Results</h1>
                            <p className="text-sm text-gray-500">Track your upcoming tests and past performance.</p>
                        </div>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/50 w-fit">
                        <button
                            onClick={() => setActiveTab("exams")}
                            className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "exams"
                                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Upcoming Exams
                        </button>
                        <button
                            onClick={() => setActiveTab("results")}
                            className={`px-8 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "results"
                                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Past Results
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeTab === "exams" ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {exams.length > 0 ? exams.map((exam, idx) => (
                                        <div key={idx} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                    Scheduled
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{exam.subject?.name || exam.subject}</h3>
                                            <p className="text-sm text-gray-500 mb-6">{exam.title}</p>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-rose-500" />
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {format(new Date(exam.scheduleDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                                <button className="text-xs font-bold text-indigo-600 hover:underline">Notification Off</button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                            <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-500">No upcoming exams scheduled.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {results.length > 0 ? results.map((res, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-6 rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                            <div className="flex items-center gap-6">
                                                <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-black text-xl">
                                                    {res.score >= 90 ? "A+" : res.score >= 80 ? "A" : "B"}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                                                        {res.exam?.subject?.name || res.assignment?.subject?.name || "General Test"}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                                                        {res.exam?.title || res.assignment?.title} • {format(new Date(res.createdAt), "MMM yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{res.score}%</p>
                                                <p className="text-[10px] uppercase font-bold text-emerald-500">Qualified</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                            <Award className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-500">No results published yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
