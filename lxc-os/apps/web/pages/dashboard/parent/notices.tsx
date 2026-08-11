
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    Bell,
    Calendar,
    User,
    ArrowRight,
    Search,
    Megaphone
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function parentNotices() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    useEffect(() => {
        // studentId is optional here for school-wide notices
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const query = studentId ? `?studentId=${studentId}` : "";
                const res = await client.get(`/v1/dashboard/parent/notices${query}`);
                setNotices(res.data);
            } catch (error) {
                console.error("Failed to fetch notices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [studentId]);

    return (
        <>
            <Head>
                <title>School Notices - LearnXChain</title>
            </Head>
            <DashboardLayout role="parent">
                <div className="space-y-8 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/parent">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">School Notices</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Official Announcements & Class Updates</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/notices?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter notices..."
                            className="w-full rounded-2xl border border-gray-100 bg-white py-2 pl-10 pr-4 text-xs font-bold focus:border-amber-500 focus:outline-none dark:border-white/5 dark:bg-gray-900"
                        />
                    </div>

                    {!notices || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {notices.length > 0 ? notices.map((notice, idx) => (
                                <div key={notice.id} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 transition-all hover:bg-amber-50/10 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-amber-950/5">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20">
                                                <Megaphone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Published {format(new Date(notice.publishDate || notice.createdAt), "MMM dd, yyyy")}</span>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors uppercase tracking-tight">{notice.title}</h3>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full dark:bg-white/5">
                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500">{notice.creator?.name || "Official Account"}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-4xl">{notice.message}</p>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            {notice.attachment && (
                                                <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View Attachment</button>
                                            )}
                                        </div>
                                        <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-amber-600 transition-colors">
                                            Acknowledge Notice
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] dark:bg-white/2">
                                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium tracking-tighter uppercase text-xs font-black">Everything seems quiet. Check back later for updates!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout >
        </>
    );
}
