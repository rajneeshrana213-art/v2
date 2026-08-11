import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Save,
    ArrowLeft,
    FileText,
    ListChecks,
    Type,
    Settings
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ArticleCreator = () => {
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        instructions: "",
        submissionType: "SUMMARY",
        classId: "",
        subjectId: "",
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/homework/metadata");

                const teacherSubjects = res.data.subjects || [];
                const assignedClassIds = new Set(teacherSubjects.map((s: any) => s.classId));
                const teacherClasses = (res.data.classes || []).filter((cls: any) => assignedClassIds.has(cls.id));

                setClasses(teacherClasses);
                setAllSubjects(teacherSubjects);
            } catch (error) {
                toast.error("Failed to load metadata");
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        if (formData.classId) {
            const filtered = allSubjects.filter(s => s.classId === formData.classId);
            setSubjects(filtered);
            if (!filtered.find(s => s.id === formData.subjectId)) {
                setFormData(prev => ({ ...prev, subjectId: "" }));
            }
        } else {
            setSubjects([]);
        }
    }, [formData.classId, allSubjects]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim() || !formData.classId || !formData.subjectId) {
            return toast.error("Please fill all required fields");
        }

        setLoading(true);
        try {
            await client.post("/v1/dashboard/teacher/enhancement/article", formData);
            toast.success("Article posted successfully!");
            router.push("/dashboard/teacher/enhancement");
        } catch (error: any) {
            console.error("Article creation error:", error);
            toast.error(error.response?.data?.error || "Failed to post article. Please check all fields.");
        } finally {
            setLoading(false);
        }
    };

    const selectClass = "w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer";

    return (
        <DashboardLayout role="teacher">
            <form onSubmit={handleSubmit} className="p-6 max-w-5xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                    >
                        {loading ? "Posting..." : (
                            <>
                                <Save className="h-5 w-5" />
                                Post Article
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white/10 space-y-10">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3 block">Article Details</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter Article Title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full text-4xl md:text-5xl font-black border-none focus:ring-0 outline-none placeholder:text-gray-200 dark:placeholder:text-gray-700 text-gray-900 dark:text-white bg-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-indigo-500 uppercase tracking-widest ml-1 block">Target Class</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                            className={selectClass}
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-indigo-500 uppercase tracking-widest ml-1 block">Subject</label>
                                        <select
                                            required
                                            disabled={!formData.classId}
                                            value={formData.subjectId}
                                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                            className={`${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                            <option value="">{formData.classId ? (subjects.length > 0 ? "Select Subject" : "No subjects assigned") : "Select Class first"}</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <Type className="h-3.5 w-3.5 text-indigo-600" />
                                        <label className="text-xs font-black text-indigo-500 uppercase tracking-widest block">Submission Task for Students</label>
                                    </div>
                                    <select
                                        value={formData.submissionType}
                                        onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                                        className={selectClass}
                                    >
                                        <option value="SUMMARY">Summarize Article</option>
                                        <option value="QA">Answering Questions</option>
                                        <option value="OPINION">Write an Opinion Piece</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-500/20 flex flex-col">
                                <label className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <ListChecks className="h-4 w-4" />
                                    Instructions
                                </label>
                                <textarea
                                    placeholder="Add specific instructions for students..."
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="w-full flex-1 bg-transparent border-none focus:ring-0 outline-none text-indigo-900 dark:text-indigo-300 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 font-medium leading-relaxed resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-600" />
                                Article Content
                            </label>
                            <textarea
                                required
                                placeholder="Paste or write the deep-dive article content here..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full min-h-[500px] p-8 md:p-12 bg-gray-50/30 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all text-xl leading-relaxed text-gray-800 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default ArticleCreator;
