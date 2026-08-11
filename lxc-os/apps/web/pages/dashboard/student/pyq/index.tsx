import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { ChevronLeft, Search, FileText, Download, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import Link from "next/link";
import { Loader } from '@/components/ui/feedback/Loader';

export default function StudentPYQPage() {
    const [pyqs, setPyqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");

    useEffect(() => {
        fetchPYQs();
    }, [selectedSubject]);

    const fetchPYQs = async () => {
        setLoading(true);
        try {
            const url = selectedSubject
                ? `/v1/dashboard/student/pyq?subjectId=${selectedSubject}`
                : "/v1/dashboard/student/pyq";
            const res = await client.get(url);
            setPyqs(res.data);

            // Extract unique subjects from PYQs for filter if not already set
            if (subjects.length === 0 && res.data.length > 0) {
                const uniqueSubjects = Array.from(new Set(res.data.map((p: any) => JSON.stringify(p.subject))))
                    .map((s: any) => JSON.parse(s));
                setSubjects(uniqueSubjects);
            }
        } catch (error) {
            console.error("Failed to fetch PYQs", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPYQs = pyqs.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Previous Year Questions - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 pb-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/student">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Previous Year Questions</h1>
                                <p className="text-sm text-gray-500">Access past exam papers to boost your preparation.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search papers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-2xl border border-gray-100 bg-white pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-gray-900"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="h-10 rounded-2xl border border-gray-100 bg-white px-4 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/5 dark:bg-gray-900"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPYQs.map((item) => (
                                <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{item.year}</span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                {item.subject?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-white/5">
                                        <span className="text-[10px] text-gray-400 italic">By {item.uploader?.name}</span>
                                        <a
                                            href={item.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {filteredPYQs.length === 0 && (
                                <div className="col-span-full text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10">
                                    <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No papers available for your class yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
