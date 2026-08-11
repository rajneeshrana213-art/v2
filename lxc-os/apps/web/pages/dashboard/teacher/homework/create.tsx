
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { ChevronLeft, Save, Calendar, FileText, BookOpen, Users, Paperclip, AlertCircle } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { Loader } from '@/components/ui/feedback/Loader';
import { FileUpload } from "@/components/ui/forms/FileUpload";
import { getISTDateString, parseInstitutionalDate } from "@/lib/utils/date-utils";

export default function CreateHomeworkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [metadataLoading, setMetadataLoading] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        classId: "",
        subjectId: "",
        attachment: ""
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/homework/metadata");
                setClasses(res.data.classes);
                setSubjects(res.data.subjects);
            } catch (error) {
                console.error("Failed to fetch metadata", error);
                toast.error("Failed to load classes and subjects");
            } finally {
                setMetadataLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const today = parseInstitutionalDate(getISTDateString());
        if (formData.dueDate && parseInstitutionalDate(formData.dueDate) < today) {
            toast.error("Due date cannot be in the past");
            return;
        }

        setLoading(true);

        try {
            await client.post("/v1/dashboard/teacher/homework", formData);
            toast.success("Homework assigned successfully!");
            router.push("/dashboard/teacher/homework");
        } catch (error: any) {
            console.error("Failed to create homework", error);
            toast.error(error.response?.data?.error || "Failed to create homework");
        } finally {
            setLoading(false);
        }
    };

    // Filter subjects based on selected class
    const filteredSubjects = subjects.filter(s => !formData.classId || s.classId === formData.classId);

    if (metadataLoading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex h-40 items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Create Homework - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="max-w-4xl mx-auto space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher/homework">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Assignment</h1>
                            <p className="text-sm text-gray-500">Post new homework for your students.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-gray-900">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Title */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Assignment Title</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Calculus Basics - Chapter 1"
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                {/* Class Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Target Class</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <select
                                            required
                                            name="classId"
                                            value={formData.classId}
                                            onChange={handleChange}
                                            className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Subject Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Subject</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <select
                                            required
                                            name="subjectId"
                                            value={formData.subjectId}
                                            onChange={handleChange}
                                            disabled={!formData.classId}
                                            className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-white/5 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select Subject</option>
                                            {filteredSubjects.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {!formData.classId && <p className="text-[10px] text-amber-500 font-bold">Please select a class first</p>}
                                </div>

                                {/* Due Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Due Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            required
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            min={getISTDateString()}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
                                        />
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <FileUpload
                                        label="Attachment (Optional)"
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, attachment: url }))}
                                        onClear={() => setFormData(prev => ({ ...prev, attachment: "" }))}
                                        defaultValue={formData.attachment}
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Detailed Instructions</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Explain the assignment details, expectations, and any helpful tips..."
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-white/5"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <Link href="/dashboard/teacher/homework">
                                    <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                        Cancel
                                    </button>
                                </Link>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 disabled:opacity-50 transition-all dark:shadow-indigo-900/20"
                                >
                                    {loading ? <Loader size="sm" variant="white" /> : <Save className="h-4 w-4" />}
                                    Assign Homework
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/20 dark:bg-blue-950/20">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                                <div className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                    <p className="font-bold mb-1 uppercase tracking-widest">Teacher Tip</p>
                                    Homework will be visible to all students in the selected class immediately after publishing. You can track submissions from the homework management dashboard.
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
