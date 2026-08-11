
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { encodeId } from "@/lib/utils/hashId";
import {
    BookOpen,
    ChevronLeft,
    PlusCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Users,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function TeacherHomeworkPage() {
    const [homework, setHomework] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchHomework = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/homework");
                setHomework(res.data);
            } catch (error) {
                console.error("Failed to fetch homework", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomework();
    }, []);

    const filteredHomework = homework.filter(h =>
        h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Homework Management - LearnXChain</title>
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homework Management</h1>
                                <p className="text-sm text-gray-500">Create and track assignments for your classes.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/teacher/homework/create">
                            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
                                <PlusCircle className="h-4 w-4" />
                                Create Homework
                            </button>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredHomework.map((item) => (
                                <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold">
                                                {item.subject?.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{item.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {item.subject?.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                            Class {item.class?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description || "No description provided."}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {item._count?.HomeworkSubmission || 0} Submissions
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                Due: {format(new Date(item.dueDate), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-white/5">
                                        <div className="flex gap-4">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${item.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {item.status === 'PUBLISHED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                {item.status}
                                            </span>
                                        </div>

                                        <Link href={`/dashboard/teacher/homework/${encodeId(item.id)}`}>
                                            <button className="group flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500">
                                                View Details & Submissions
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {filteredHomework.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10">
                                    <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No homework assignments found.</p>
                                    <Link href="/dashboard/teacher/homework/create">
                                        <button className="mt-4 text-sm font-bold text-indigo-600 hover:underline">
                                            Create your first assignment
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
