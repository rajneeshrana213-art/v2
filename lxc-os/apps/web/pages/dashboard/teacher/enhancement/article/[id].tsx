import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    ArrowLeft,
    User,
    Calendar,
    CheckCircle,
    MessageSquare,
    Trophy,
    ExternalLink
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { decodeId } from "@/lib/utils/hashId";

const ArticleEvaluation = () => {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [evalData, setEvalData] = useState({ score: 0, feedback: "" });

    const fetchSubmissions = async () => {
        if (!id) return;
        try {
            const res = await client.get(`/v1/dashboard/teacher/enhancement/article?id=${id}&type=submissions`);
            setSubmissions(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to fetch submissions");
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const handleEvaluate = async () => {
        if (!selectedSubmission) return;
        try {
            await client.post(`/v1/dashboard/teacher/enhancement/article?type=evaluate`, {
                submissionId: selectedSubmission.id,
                score: Number(evalData.score),
                feedback: evalData.feedback
            });
            toast.success("Evaluation saved!");
            fetchSubmissions();
            setSelectedSubmission(null);
            setEvalData({ score: 0, feedback: "" });
        } catch (error) {
            toast.error("Failed to save evaluation");
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluate Submissions</h1>
                        <p className="text-gray-500 dark:text-gray-400">Review student summaries and award enhancement points</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                                Students
                                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">{submissions.length}</span>
                            </h2>

                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                {submissions.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            setSelectedSubmission(sub);
                                            setEvalData({ score: sub.score || 0, feedback: sub.feedback || "" });
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedSubmission?.id === sub.id
                                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                                            : "border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{sub.student.name}</p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {sub.score !== null && (
                                            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-1.5 rounded-lg shrink-0">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="lg:col-span-8">
                        {selectedSubmission ? (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10 flex flex-col h-full min-h-[700px]">
                                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSubmission.student.name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSubmission.score !== null && (
                                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-green-100 dark:border-green-900/30">
                                            <Trophy className="h-4 w-4" />
                                            Final Score: {selectedSubmission.score}/100
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 flex-1">
                                    <div className="mb-8">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Submission Content</label>
                                        <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-white/5 text-lg leading-relaxed text-gray-800 dark:text-gray-300 italic">
                                            "{selectedSubmission.content}"
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-amber-500" />
                                                Award Enhancement Points (0-100)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={evalData.score}
                                                    onChange={(e) => setEvalData({ ...evalData, score: Number(e.target.value) })}
                                                    className="flex-1 accent-primary h-2 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="h-14 w-20 bg-primary text-white font-black text-xl flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
                                                    {evalData.score}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                                Provide Feedback
                                            </label>
                                            <textarea
                                                placeholder="Write detailed feedback for the student..."
                                                value={evalData.feedback}
                                                onChange={(e) => setEvalData({ ...evalData, feedback: e.target.value })}
                                                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50/30 dark:bg-gray-800/30 rounded-b-[2rem] border-t border-gray-100 dark:border-white/5">
                                    <button
                                        onClick={handleEvaluate}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                                    >
                                        <Save className="h-5 w-5" />
                                        Save & Release Grade
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center p-20 h-full min-h-[700px]">
                                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.5rem] mb-6">
                                    <Eye className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a submission</h2>
                                <p className="text-gray-400 text-center max-w-sm">Choose a student from the list on the left to review their work and start evaluation.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const Save = ({ className }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const Eye = ({ className }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

export default ArticleEvaluation;
