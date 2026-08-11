
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function parentHomework() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    useEffect(() => {
        if (!studentId) return;

        const fetchHomework = async () => {
            setLoading(true);
            try {
                const res = await client.get(`/v1/dashboard/parent/homework?studentId=${studentId}`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch homework data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomework();
    }, [studentId]);

    return (
        <>
            <Head>
                <title>Child Homework - LearnXChain</title>
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
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Homework & Assignments</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Track daily learning tasks given to your child</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/homework?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    {!studentId || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {data.length > 0 ? data.map((hw: any) => (
                                <div key={hw.id} className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:border-white/5 dark:bg-gray-900 dark:hover:shadow-none">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                                    <BookOpen className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{hw.title}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{hw.subject}</p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">{hw.description}</p>

                                            <div className="flex flex-wrap gap-4 pt-2">
                                                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 dark:bg-white/5">
                                                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">Due: {format(new Date(hw.dueDate), "MMM dd, yyyy")}</span>
                                                </div>
                                                {hw.attachment && (
                                                    <a
                                                        href={hw.attachment}
                                                        target="_blank"
                                                        className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">Download Material</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${hw.status === "Submitted"
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                : "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse"
                                                }`}>
                                                {hw.status === "Submitted" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                {hw.status}
                                            </div>
                                            {hw.status === "Submitted" && hw.submittedAt && (
                                                <p className="text-[10px] font-bold text-gray-400">On {format(new Date(hw.submittedAt), "MMM dd, hh:mm a")}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] dark:bg-white/2">
                                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">No homework or assignments currently listed.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
