import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    ArrowLeft,
    BookOpen,
    MessageSquare,
    Send,
    CheckCircle,
    Info,
    FileText
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { decodeId } from "@/lib/utils/hashId";

const ArticleReading = () => {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submissionContent, setSubmissionContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const fetchArticle = async () => {
        if (!id) return;
        try {
            const res = await client.get(`/v1/dashboard/student/enhancement?type=article`);
            const found = res.data.find((a: any) => a.id === id);
            setArticle(found);
            if (found.NewspaperSubmission.length > 0) {
                setHasSubmitted(true);
                setSubmissionContent(found.NewspaperSubmission[0].content);
            }
        } catch (error) {
            toast.error("Failed to load article");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const handleSubmit = async () => {
        if (!submissionContent.trim()) return toast.error("Please enter your content first");
        setSubmitting(true);
        try {
            await client.post("/v1/dashboard/student/enhancement/article", {
                newspaperId: id,
                content: submissionContent
            });
            toast.success("Submission successful!");
            setHasSubmitted(true);
        } catch (error) {
            toast.error("Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DashboardLayout role="student"><div className="p-20 text-center animate-pulse text-gray-400">Opening Article...</div></DashboardLayout>;

    return (
        <DashboardLayout role="student">
            <div className="p-6 max-w-5xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">{article.title}</h1>
                        <p className="text-gray-500 font-medium">Daily Enhancement Reading</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Article Body */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-10 md:p-16">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                        {article.submissionType} TASK
                                    </div>
                                    <div className="h-1 w-1 bg-gray-300 rounded-full" />
                                    <span className="text-gray-400 text-sm font-bold">{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>

                                {article.instructions && (
                                    <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[2rem] mb-12 flex items-start gap-4">
                                        <Info className="h-6 w-6 text-amber-500 shrink-0" />
                                        <div>
                                            <p className="font-black text-amber-900 mb-1">Teacher's Instructions</p>
                                            <p className="text-amber-800 leading-relaxed font-medium">{article.instructions}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="prose prose-lg max-w-none text-gray-800 leading-loose whitespace-pre-wrap font-serif text-xl">
                                    {article.content}
                                </div>
                            </div>

                            <div className="p-10 md:p-16 bg-gray-50/50 border-t border-gray-100">
                                <div className="max-w-3xl mx-auto">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                                            <MessageSquare className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900">Your Submission</h3>
                                            <p className="text-gray-500 text-sm font-medium">
                                                {article.submissionType === "SUMMARY" ? "Write a brief summary of the article above." :
                                                    article.submissionType === "QA" ? "Answer the questions based on the text." :
                                                        "Express your opinion on this topic."}
                                            </p>
                                        </div>
                                    </div>

                                    {hasSubmitted ? (
                                        <div className="relative">
                                            <textarea
                                                disabled
                                                value={submissionContent}
                                                className="w-full p-8 rounded-[2.5rem] border-2 border-green-500/20 bg-white text-gray-600 font-medium italic min-h-[300px] shadow-inner"
                                            />
                                            <div className="absolute top-6 right-6 bg-green-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-green-200">
                                                <CheckCircle className="h-4 w-4" />
                                                SUBMITTED FOR REVIEW
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <textarea
                                                placeholder={`Type your ${article.submissionType.toLowerCase()} here...`}
                                                value={submissionContent}
                                                onChange={(e) => setSubmissionContent(e.target.value)}
                                                className="w-full p-8 rounded-[2.5rem] border-2 border-gray-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg min-h-[300px] shadow-sm"
                                            />
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {submitting ? "Processing..." : (
                                                    <>
                                                        <Send className="h-6 w-6" />
                                                        Submit Entry
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ArticleReading;
