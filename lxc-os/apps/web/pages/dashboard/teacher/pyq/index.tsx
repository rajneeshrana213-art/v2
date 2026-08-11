import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { ChevronLeft, PlusCircle, Search, FileText, Download, Trash2, Calendar, BookOpen, Users, Paperclip, AlertCircle, X } from 'lucide-react';
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

export default function TeacherPYQPage() {
    const [pyqs, setPyqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        year: new Date().getFullYear(),
        classId: "",
        subjectId: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchPYQs();
        fetchMetadata();
    }, []);

    const fetchPYQs = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/pyq");
            setPyqs(res.data);
        } catch (error) {
            console.error("Failed to fetch PYQs", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/homework/metadata");
            const allSubjects = res.data.subjects || [];
            const allClasses = res.data.classes || [];

            const assignedClassIds = new Set(allSubjects.map((s: any) => s.classId));
            const teacherClasses = allClasses.filter((cls: any) => assignedClassIds.has(cls.id));

            setClasses(teacherClasses);
            setSubjects(allSubjects);
        } catch (error) {
            console.error("Failed to fetch metadata", error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentYear = new Date().getFullYear();
        if (formData.year > currentYear) {
            toast.error("Year cannot be in the future.");
            return;
        }

        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append("file", selectedFile);
        data.append("title", formData.title);
        data.append("year", formData.year.toString());
        data.append("classId", formData.classId);
        data.append("subjectId", formData.subjectId);

        try {
            await client.post("/v1/dashboard/teacher/pyq", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("PYQ uploaded successfully!");
            setShowUploadModal(false);
            setFormData({ title: "", year: new Date().getFullYear(), classId: "", subjectId: "" });
            setSelectedFile(null);
            fetchPYQs();
        } catch (error: any) {
            console.error("Upload failed", error);
            toast.error(error.response?.data?.error || "Failed to upload PYQ");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this PYQ?")) return;
        try {
            await client.delete(`/v1/dashboard/teacher/pyq?id=${id}`);
            toast.success("PYQ deleted successfully");
            fetchPYQs();
        } catch (error) {
            toast.error("Failed to delete PYQ");
        }
    };

    const filteredPYQs = pyqs.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSubjects = subjects.filter(s => !formData.classId || s.classId === formData.classId);

    return (
        <>
            <Head>
                <title>Previous Year Questions - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/teacher">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Previous Year Questions</h1>
                                <p className="text-sm text-gray-500">Upload and manage past exam papers for your students.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Upload PYQ
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by subject, title, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-2xl border border-gray-100 bg-white pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-gray-900"
                        />
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredPYQs.map((item) => (
                                <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{item.title} ({item.year})</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {item.subject?.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                                            Class {item.class?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-400">Uploaded on {new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredPYQs.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10">
                                    <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No PYQs found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold dark:text-white">Upload New PYQ</h2>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Paper Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Final Exam 2023 - Mathematics"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Year</label>
                                        <input
                                            required
                                            type="number"
                                            max={new Date().getFullYear()}
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Class</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: "" })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                        >
                                            <option value="" className="dark:bg-gray-800">Select Class</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id} className="dark:bg-gray-800">{cls.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subject</label>
                                    <select
                                        required
                                        disabled={!formData.classId}
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-3 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-white/5 dark:bg-white/5 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                    >
                                        <option value="" className="dark:bg-gray-800">Select Subject</option>
                                        {filteredSubjects.map(sub => <option key={sub.id} value={sub.id} className="dark:bg-gray-800">{sub.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">File (PDF/Images)</label>
                                    <div
                                        onClick={() => document.getElementById('pyq-file')?.click()}
                                        className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors"
                                    >
                                        <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {selectedFile ? selectedFile.name : "Click to select or drag and drop paper"}
                                        </p>
                                        <input
                                            id="pyq-file"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 disabled:opacity-50 transition-all dark:shadow-indigo-900/20"
                                    >
                                        {uploading ? <Loader size="sm" variant="white" /> : <PlusCircle className="h-4 w-4" />}
                                        Upload Paper
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
