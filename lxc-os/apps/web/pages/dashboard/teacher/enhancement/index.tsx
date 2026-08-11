import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { encodeId } from "@/lib/utils/hashId";
import {
    Plus,
    BookOpen,
    FileQuestion,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    BarChart3,
    GraduationCap,
    PenTool
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";

const TeacherEnhancementHub = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"quiz" | "article">("quiz");
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/enhancement/quiz");
            setQuizzes(res.data);
        } catch (error) {
            toast.error("Failed to fetch quizzes");
        }
    };

    const fetchArticles = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/enhancement/article");
            setArticles(res.data);
        } catch (error) {
            toast.error("Failed to fetch articles");
        }
    };

    useEffect(() => {
        setLoading(true);
        if (activeTab === "quiz") fetchQuizzes();
        else fetchArticles();
        setLoading(false);
    }, [activeTab]);

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm("Delete this quiz?")) return;
        try {
            await client.delete(`/v1/dashboard/teacher/enhancement/quiz?id=${id}`);
            toast.success("Quiz deleted");
            fetchQuizzes();
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm("Delete this article?")) return;
        try {
            await client.delete(`/v1/dashboard/teacher/enhancement/article?id=${id}`);
            toast.success("Article deleted");
            fetchArticles();
        } catch (error) {
            toast.error("Failed to delete article");
        }
    };

    return (
        <DashboardLayout role="teacher">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            Self Enhancement Hub
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage quizzes, articles and student progress</p>
                    </div>

                    <div className="flex gap-4">
                        {activeTab === "quiz" ? (
                            <Link href="/dashboard/teacher/enhancement/quiz/create">
                                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20">
                                    <Plus className="h-5 w-5" />
                                    New Quiz
                                </button>
                            </Link>
                        ) : (
                            <Link href="/dashboard/teacher/enhancement/article/create">
                                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20">
                                    <Plus className="h-5 w-5" />
                                    Post Article
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab("quiz")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "quiz"
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        <FileQuestion className="h-5 w-5" />
                        Quizzes
                    </button>
                    <button
                        onClick={() => setActiveTab("article")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === "article"
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        <BookOpen className="h-5 w-5" />
                        Articles
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === "quiz" ? (
                            quizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-primary">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-primary font-bold text-sm uppercase tracking-wider">
                                            {quiz.subject?.name || "Mixed"}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{quiz.title}</h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            {quiz.timeLimit} Minutes
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <BarChart3 className="h-4 w-4" />
                                            {quiz.points} XP Points
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <CheckCircle className="h-4 w-4" />
                                            {quiz._count?.quizResults || 0} Attempts
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/teacher/enhancement/quiz/${encodeId(quiz.id)}`}>
                                        <button className="w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            View Results
                                        </button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            articles.map((article) => (
                                <div key={article.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-green-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl text-green-600 dark:text-green-400 font-bold text-sm uppercase tracking-wider">
                                            {article.submissionType}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteArticle(article.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{article.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6">{article.content}</p>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        <CheckCircle className="h-4 w-4" />
                                        {article._count?.NewspaperSubmission || 0} Submissions
                                    </div>

                                    <Link href={`/dashboard/teacher/enhancement/article/${encodeId(article.id)}`}>
                                        <button className="w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                            <PenTool className="h-4 w-4" />
                                            Evaluate Submissions
                                        </button>
                                    </Link>
                                </div>
                            ))
                        )}

                        {(activeTab === "quiz" && quizzes.length === 0) || (activeTab === "article" && articles.length === 0) ? (
                            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                <p className="text-gray-500 dark:text-gray-400 text-lg italic">No {activeTab}s created yet.</p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherEnhancementHub;
