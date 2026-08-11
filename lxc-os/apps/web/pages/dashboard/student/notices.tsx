
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    Bell,
    ChevronLeft,
    Calendar,
    AlertCircle,
    Megaphone,
    User
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentNoticesPage() {
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await client.get("/v1/dashboard/student/notices");
                setNotices(res.data);
            } catch (error) {
                console.error("Failed to fetch notices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    return (
        <>
            <Head>
                <title>Notices & Updates - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/student">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Updates</h1>
                            <p className="text-sm text-gray-500">Official announcements from your school.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notices.length > 0 ? notices.map((notice, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-amber-500 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                                <Megaphone className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{notice.title}</h3>
                                                    {idx === 0 && (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                                                    {notice.content}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="sm:text-right">
                                            <div className="flex items-center gap-2 sm:justify-end text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(notice.createdAt), "MMM d, yyyy")}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 sm:justify-end text-xs text-gray-400 font-medium">
                                                <User className="h-3 w-3" />
                                                By {notice.creator?.name || "Principal"}
                                            </div>
                                        </div>
                                    </div>

                                    {notice.attachment && (
                                        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5">
                                            <a href={notice.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-500">
                                                <AlertCircle className="h-4 w-4" />
                                                View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                    <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No active notices at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
