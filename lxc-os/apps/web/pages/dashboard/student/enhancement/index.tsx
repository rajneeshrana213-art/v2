import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { encodeId } from "@/lib/utils/hashId";
import {
    Trophy,
    BookOpen,
    FileQuestion,
    CheckCircle2,
    Clock,
    Gamepad2,
    Zap,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";

const StudentEnhancementHub = () => {
    const [activeTab, setActiveTab] = useState<"quiz" | "article">("quiz");
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, aRes] = await Promise.all([
                client.get("/v1/dashboard/student/enhancement?type=quiz"),
                client.get("/v1/dashboard/student/enhancement?type=article")
            ]);
            setQuizzes(qRes.data);
            setArticles(aRes.data);
        } catch (error) {
            toast.error("Failed to load enhancement activities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardLayout role="student">
            <div className="p-6 max-w-7xl mx-auto pb-20">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 mb-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-md">
                                <Zap className="h-8 w-8 text-yellow-300 fill-yellow-300" />
                            </div>
                            <h1 className="text-4xl font-black mb-2">Self Enhancement Hub</h1>
                            <p className="text-blue-50 text-lg opacity-80">Master your skills, read daily articles, and climb the leaderboard!</p>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/dashboard/student/leaderboard">
                                <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                                    <Trophy className="h-6 w-6" />
                                    View Leaderboard
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                                Your Progress
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Quizzes Taken</span>
                                    <span className="font-black text-gray-900">{quizzes.filter(q => q.quizResults.length > 0).length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Articles Read</span>
                                    <span className="font-black text-gray-900">{articles.filter(a => a.NewspaperSubmission.length > 0).length}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs text-center text-gray-400 font-medium italic">Keep going! You're among the top 20% this month.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-blue-900 font-black mb-1">Weekly Challenge</h3>
                                <p className="text-blue-700 text-xs mb-4">Complete 3 quizzes and 2 articles to earn bonus 500 XP!</p>
                                <div className="w-full bg-blue-100 h-2 rounded-full mb-2">
                                    <div className="bg-blue-600 h-full rounded-full w-[60%]" />
                                </div>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">60% COMPLETED</p>
                            </div>
                            <Gamepad2 className="absolute top-4 right-4 h-12 w-12 text-blue-100 group-hover:rotate-12 transition-transform" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        {/* Tabs */}
                        <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem] mb-10 w-fit">
                            <button
                                onClick={() => setActiveTab("quiz")}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${activeTab === "quiz"
                                    ? "bg-white text-indigo-600 shadow-lg shadow-gray-200"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <FileQuestion className="h-5 w-5" />
                                Quizzes
                            </button>
                            <button
                                onClick={() => setActiveTab("article")}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${activeTab === "article"
                                    ? "bg-white text-indigo-600 shadow-lg shadow-gray-200"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <BookOpen className="h-5 w-5" />
                                Daily Articles
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                                {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 h-64 rounded-3xl" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {activeTab === "quiz" ? (
                                    quizzes.map((quiz) => {
                                        const isCompleted = quiz.quizResults.length > 0;
                                        return (
                                            <div key={quiz.id} className={`group bg-white rounded-[2.5rem] p-8 border transition-all hover:shadow-2xl hover:shadow-gray-100 ${isCompleted ? "border-green-100" : "border-gray-50"}`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isCompleted ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"}`}>
                                                        {quiz.subject?.name || "General"}
                                                    </div>
                                                    {isCompleted && (
                                                        <div className="flex items-center gap-1.5 text-green-500 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Completed
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                                        <Clock className="h-4 w-4" />
                                                        {quiz.timeLimit} Min
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                                        <Zap className="h-4 w-4 text-amber-400" />
                                                        {quiz.points} XP
                                                    </div>
                                                </div>

                                                <Link href={`/dashboard/student/enhancement/quiz/${encodeId(quiz.id)}`}>
                                                    <button className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isCompleted
                                                        ? "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                        : "bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:-translate-y-1"
                                                        }`}>
                                                        {isCompleted ? "Retake Quiz" : "Start Quiz"}
                                                        <ArrowRight className="h-5 w-5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        );
                                    })
                                ) : (
                                    articles.map((article) => {
                                        const isCompleted = article.NewspaperSubmission.length > 0;
                                        return (
                                            <div key={article.id} className={`group bg-white rounded-[2.5rem] p-8 border transition-all hover:shadow-2xl hover:shadow-gray-100 ${isCompleted ? "border-green-100" : "border-gray-50"}`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isCompleted ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                                        {article.submissionType}
                                                    </div>
                                                    {isCompleted && (
                                                        <div className="flex items-center gap-1.5 text-green-500 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Read
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2">{article.title}</h3>
                                                <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">{article.content}</p>

                                                <Link href={`/dashboard/student/enhancement/article/${encodeId(article.id)}`}>
                                                    <button className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isCompleted
                                                        ? "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                        : "bg-green-600 text-white shadow-xl shadow-green-200 hover:-translate-y-1"
                                                        }`}>
                                                        {isCompleted ? "Already Read" : "Read Article"}
                                                        <ArrowRight className="h-5 w-5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {!loading && ((activeTab === "quiz" && quizzes.length === 0) || (activeTab === "article" && articles.length === 0)) && (
                            <div className="py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                                <Zap className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                                <p className="text-gray-400 text-xl font-medium">All tasks completed! Check back later for more.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentEnhancementHub;
