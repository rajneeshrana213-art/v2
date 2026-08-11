
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    Calendar,
    CheckCircle2,
    XCircle,
    BarChart3,
    Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function parentAttendance() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    useEffect(() => {
        if (!studentId) return;

        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const res = await client.get(`/v1/dashboard/parent/attendance?studentId=${studentId}`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch attendance data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [studentId]);

    return (
        <>
            <Head>
                <title>Child Attendance - LearnXChain</title>
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
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Attendance Logs</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Transparent Daily Presence Tracking</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/attendance?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    {!studentId || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {/* Stats Summary */}
                            <div className="grid sm:grid-cols-3 gap-6">
                                <div className="rounded-[2rem] bg-emerald-50 p-6 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                            <BarChart3 className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-emerald-600 mb-1">{data?.percentage}%</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Overall Presence</p>
                                </div>
                                <div className="rounded-[2rem] bg-blue-50 p-6 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                            <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-blue-600 mb-1">{data?.presentDays}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Total Present Days</p>
                                </div>
                                <div className="rounded-[2rem] bg-rose-50 p-6 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                            <XCircle className="h-6 w-6 text-rose-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-rose-600 mb-1">{data?.absentDays}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600/60">Total Absent Days</p>
                                </div>
                            </div>

                            {/* Detailed Table */}
                            <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white dark:border-white/5 dark:bg-gray-900">
                                <div className="p-6 border-b border-gray-50 dark:border-white/5">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Logs (Last 30 Days)</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-300">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Arrival</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {data?.recentRecords?.length > 0 ? data.recentRecords.map((log: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b last:border-none border-gray-50 dark:border-white/5">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                {format(new Date(log.date), "MMMM d, yyyy")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === "Present"
                                                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                            : "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                                                            }`}>
                                                            {log.status === "Present" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                            <Clock className="h-3 w-3" />
                                                            {log.status === "Present" ? "08:15 AM" : <span className="opacity-50">--</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-20 text-center">
                                                        <p className="text-sm text-gray-400 font-medium">No attendance records found for this period.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-amber-50 p-6 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/10">
                                <p className="text-xs text-amber-900 dark:text-amber-400 font-black italic">
                                    Note: Attendance is updated by class teachers daily by 10:00 AM. For any discrepancy, please contact the school office.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
