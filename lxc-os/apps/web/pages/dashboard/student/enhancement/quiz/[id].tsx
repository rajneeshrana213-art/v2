import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Clock,
    ArrowLeft,
    Zap,
    CheckCircle2,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { decodeId } from "@/lib/utils/hashId";

const QuizAttempt = () => {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<any>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);

    const fetchQuiz = async () => {
        if (!id) return;
        try {
            const res = await client.get(`/v1/dashboard/student/enhancement/quiz?id=${id}`);
            setQuiz(res.data);
            setTimeLeft(res.data.timeLimit * 60);
        } catch (error) {
            toast.error("Failed to load quiz");
            router.push("/dashboard/student/enhancement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted && !loading) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !submitted && !loading) {
            handleSubmit();
        }
    }, [timeLeft, submitted, loading]);

    const handleOptionSelect = (questionId: string, option: string) => {
        if (submitted) return;
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmit = async () => {
        if (submitted) return;
        setSubmitted(true);
        try {
            const res = await client.post("/v1/dashboard/student/enhancement/quiz", {
                quizId: id,
                answers
            });
            setResult(res.data);
            toast.success("Quiz submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit quiz");
            setSubmitted(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return <DashboardLayout role="student"><div className="p-20 text-center animate-pulse text-gray-400">Preparing your challenge...</div></DashboardLayout>;

    if (result) {
        const percentage = Math.round((result.score / quiz.points) * 100);
        return (
            <DashboardLayout role="student">
                <div className="p-6 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 w-full text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
                                <ShieldCheck className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-2">Quiz Completed!</h2>
                            <p className="text-gray-400 font-bold mb-10 uppercase tracking-widest">{quiz.title}</p>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="bg-gray-50 p-8 rounded-3xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Accuracy</p>
                                    <h3 className="text-4xl font-black text-gray-900">{percentage}%</h3>
                                </div>
                                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                                    <p className="text-xs font-bold text-primary uppercase mb-2">XP Earned</p>
                                    <h3 className="text-4xl font-black text-primary">+{result.score}</h3>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push("/dashboard/student/enhancement")}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                            >
                                Back to Learning Hub
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="p-6 max-w-4xl mx-auto pb-20">
                <div className="fixed top-[10%] right-8 z-50 bg-white shadow-2xl rounded-3xl p-4 border-2 border-primary/20 flex flex-col items-center min-w-[120px]">
                    <Clock className={`h-8 w-8 mb-2 ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary"}`} />
                    <span className={`text-2xl font-black ${timeLeft < 60 ? "text-red-600" : "text-gray-900"}`}>{formatTime(timeLeft)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">TIME LEFT</span>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => { if (confirm("Discard quiz attempt?")) router.back() }}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">{quiz.title}</h1>
                        <p className="text-gray-500 font-medium">Select the best answer for each question</p>
                    </div>
                </div>

                <div className="space-y-12">
                    {quiz.questions.map((q: any, qIndex: number) => (
                        <div key={q.id} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative group transition-all hover:shadow-xl hover:shadow-gray-50">
                            <div className="absolute -top-5 -left-5 h-14 w-14 bg-primary text-white font-black text-2xl flex items-center justify-center rounded-2xl shadow-xl shadow-primary/30">
                                {qIndex + 1}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">{q.questionText}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt: string, oIndex: number) => (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleOptionSelect(q.id, opt)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${answers[q.id] === opt
                                            ? "border-primary bg-primary/5 shadow-inner"
                                            : "border-gray-50 bg-gray-50/30 hover:bg-gray-100 hover:border-gray-200"
                                            }`}
                                    >
                                        <div className={`h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${answers[q.id] === opt ? "border-primary bg-primary" : "border-gray-300 bg-white"
                                            }`}>
                                            {answers[q.id] === opt && <div className="h-2 w-2 bg-white rounded-full shadow-sm" />}
                                        </div>
                                        <span className={`font-bold ${answers[q.id] === opt ? "text-primary" : "text-gray-700"}`}>
                                            {opt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gray-400 font-bold">
                        <AlertCircle className="h-6 w-6" />
                        <span>Ensure all questions are answered before submitting</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/30"
                    >
                        Submit Attempt
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default QuizAttempt;
