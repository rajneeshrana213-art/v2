import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    ArrowLeft,
    User,
    Trophy,
    CheckCircle,
    XCircle,
    BarChart3,
    Calendar,
    Target
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { decodeId } from "@/lib/utils/hashId";

const QuizResults = () => {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const res = await client.get(`/v1/dashboard/teacher/enhancement/quiz?id=${id}`);
                const found = res.data.find((q: any) => q.id === id);
                setQuiz(found);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to fetch quiz results");
            }
        };
        fetchQuiz();
    }, [id]);

    if (loading) return <DashboardLayout role="teacher"><div className="p-20 text-center animate-pulse text-gray-400">Loading results...</div></DashboardLayout>;
    if (!quiz) return <DashboardLayout role="teacher"><div className="p-20 text-center text-red-500">Quiz not found</div></DashboardLayout>;

    return (
        <DashboardLayout role="teacher">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Performance analytics and student scores</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="bg-primary/10 w-fit p-3 rounded-2xl mb-4">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Avg Score</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                            {quiz.quizResults?.length > 0
                                ? Math.round(quiz.quizResults.reduce((acc: any, curr: any) => acc + curr.score, 0) / quiz.quizResults.length)
                                : 0}%
                        </h2>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="bg-green-50 dark:bg-green-900/20 w-fit p-3 rounded-2xl mb-4">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Attempts</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{quiz.quizResults?.length || 0}</h2>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-fit p-3 rounded-2xl mb-4">
                            <BarChart3 className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Questions</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{quiz.questions?.length || 0}</h2>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="bg-amber-50 dark:bg-amber-900/20 w-fit p-3 rounded-2xl mb-4">
                            <Trophy className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Max XP</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{quiz.points} XP</h2>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-gray-800/40">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attempt History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
                                    <th className="px-8 py-5">Student Name</th>
                                    <th className="px-8 py-5 text-center">Score</th>
                                    <th className="px-8 py-5 text-center">XP Earned</th>
                                    <th className="px-8 py-5">Date & Time</th>
                                    <th className="px-8 py-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {(quiz.quizResults || []).map((result: any) => (
                                    <tr key={result.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">{result.user?.name || "Student"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center">
                                                <div className="w-24 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${result.score >= 50 ? "bg-green-500" : "bg-red-500"}`}
                                                        style={{ width: `${(result.score / quiz.points) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">{Math.round((result.score / quiz.points) * 100)}% Accuracy</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg font-black">{result.score} XP</span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{new Date(result.createdAt).toLocaleDateString()}</span>
                                                <span className="text-xs">{new Date(result.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {result.score >= (quiz.points * 0.4) ? (
                                                <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border border-green-100 dark:border-green-900/30">Passed</span>
                                            ) : (
                                                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border border-red-100 dark:border-red-900/30">Failed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!quiz.quizResults || quiz.quizResults.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No attempts yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QuizResults;
