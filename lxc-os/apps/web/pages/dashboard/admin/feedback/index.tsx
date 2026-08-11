import { useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Send,
    Upload,
    Video,
    Image as ImageIcon,
    FileText,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import client from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/feedback/Loader";

export default function AdminFeedbackPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (files.length + selectedFiles.length > 3) {
                setError("Maximum 3 attachments allowed");
                return;
            }
            setFiles((prev) => [...prev, ...selectedFiles]);
            setError(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            setError("Please fill in both title and description");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        files.forEach((file) => {
            formData.append("attachments", file);
        });

        try {
            await client.post("/v1/dashboard/admin/feedback", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setSubmitted(true);
        } catch (err: any) {
            console.error("Failed to submit feedback:", err);
            setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[70vh] items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6 max-w-md p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl"
                    >
                        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Submitted!</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Thank you for your valuable feedback. Our team will review it and get back to you if needed.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setSubmitted(false);
                                setTitle("");
                                setDescription("");
                                setFiles([]);
                            }}
                            className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
                        >
                            Submit More Feedback
                        </Button>
                    </motion.div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Help & Feedback - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-indigo-500" />
                            Help & Feedback
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Have a suggestion or facing an issue? Let us know and we'll help you out.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card accent="indigo" className="p-6 md:p-8">
                            <CardHeader>
                                <CardTitle>Submit New Feedback</CardTitle>
                                <CardDescription>Share your thoughts, report bugs, or request features.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 mt-4">
                                <Input
                                    label="Subject"
                                    placeholder="Summarize your feedback"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="h-12"
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200">Description</label>
                                    <textarea
                                        className={cn(
                                            "w-full min-h-[150px] rounded-xl border bg-white dark:bg-slate-900/60 px-3 py-3 text-sm text-gray-900 dark:text-slate-100 shadow-sm backdrop-blur-xl transition-all duration-200",
                                            "border-gray-200 dark:border-white/10 focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/50 hover:border-indigo-400/60 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                        )}
                                        placeholder="Provide details about your feedback..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Attachments (Max 3)
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                multiple
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                accept="image/*,video/*,.pdf"
                                            />
                                            <div className="h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-slate-900/40 group-hover:bg-gray-100 dark:group-hover:bg-slate-900/60 group-hover:border-indigo-500/40 transition-all">
                                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">Upload Media</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <AnimatePresence>
                                                {files.map((file, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ x: 10, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -10, opacity: 0 }}
                                                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-white/5 group shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                                                                {file.type.startsWith('video') ? <Video className="w-4 h-4" /> :
                                                                    file.type.startsWith('image') ? <ImageIcon className="w-4 h-4" /> :
                                                                        <FileText className="w-4 h-4" />}
                                                            </div>
                                                            <span className="text-xs text-gray-700 dark:text-slate-300 truncate font-medium">{file.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(idx)}
                                                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {files.length === 0 && (
                                                <div className="h-full flex items-center justify-center border border-dashed border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-slate-900/20">
                                                    <span className="text-xs text-slate-500 italic">No files selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader size="sm" variant="white" />
                                                Submitting...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Send className="w-4 h-4" />
                                                Send Feedback
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
