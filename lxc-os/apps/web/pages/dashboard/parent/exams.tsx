
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    FileText,
    Calendar,
    Award,
    ChevronRight,
    Target,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function parentExams() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [exams, setExams] = useState<any[]>([]);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    useEffect(() => {
        if (!studentId) return;

        const fetchExams = async () => {
            setLoading(true);
            try {
                const [examRes, resultsRes] = await Promise.all([
                    client.get(`/v1/dashboard/parent/exams?studentId=${studentId}`),
                    client.get(`/v1/dashboard/parent/results?studentId=${studentId}`)
                ]);
                setExams(examRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error("Failed to fetch academic data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, [studentId]);

    return (
        <>
            <Head>
                <title>Exams & Results - LearnXChain</title>
            </Head>
            <DashboardLayout role="parent">
                <div className="space-y-8 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/parent">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Exams & Academic Performance</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Track results, grades and upcoming test schedules</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/exams?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    {!studentId || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Upcoming Exams Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-amber-500" />
                                        Upcoming Schedule
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {exams.length > 0 ? exams.map((exam: any) => (
                                        <div key={exam.id} className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900 transition-all hover:border-amber-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-black text-lg text-gray-900 dark:text-white">{exam.title}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{exam.subject?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">{format(new Date(exam.scheduleDate), "MMM dd")}</p>
                                                    <p className="text-[10px] font-bold text-gray-400">{exam.startTime || "09:00 AM"}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2">
                                                {exam.syllabus && (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-900/20 dark:text-indigo-400">Includes Syllabus</span>
                                                )}
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-950/20 dark:text-amber-400">Class {exam.classId}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center rounded-[2rem] bg-gray-50/50 dark:bg-white/2">
                                            <p className="text-xs text-gray-400 font-bold uppercase">No upcoming exams scheduled.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results & Progress Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        Published Results
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {results?.averages?.length > 0 ? results.averages.map((avg: any, idx: number) => (
                                        <div key={idx} className="rounded-[2rem] border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900 group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center dark:bg-orange-950/20">
                                                        <Target className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 dark:text-white">{avg.subject}</h4>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Avg Marks</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-emerald-600">{avg.average.toFixed(1)}%</p>
                                                    <span className="text-[10px] font-black text-orange-500 uppercase">Grade: {avg.grade}</span>
                                                </div>
                                            </div>

                                            {/* Recent Scores in this Subject */}
                                            <div className="space-y-2 mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                                                {avg.recentScores?.map((score: any, sIdx: number) => (
                                                    <div key={sIdx} className="flex items-center justify-between text-[10px] font-bold">
                                                        <span className="text-gray-500 uppercase">{score.title}</span>
                                                        <span className="text-gray-900 dark:text-gray-300">{score.score}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center rounded-[2rem] bg-gray-50/50 dark:bg-white/2">
                                            <p className="text-xs text-gray-400 font-bold uppercase">No results published yet.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                                    <Award className="h-8 w-8 text-indigo-300 mb-4" />
                                    <h3 className="text-lg font-black mb-1">Performance Insight</h3>
                                    <p className="text-xs text-indigo-100/70 font-medium">Your child is showing great consistency in Mathematics. Aim for 90% in the upcoming mid-terms for a Distinction grade.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
