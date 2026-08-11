
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Calendar,
    Filter,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentAttendancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await client.get("/v1/dashboard/student/attendance");
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch attendance data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    return (
        <>
            <Head>
                <title>My Attendance - LearnXChain</title>
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Tracker</h1>
                            <p className="text-sm text-gray-500">Keep track of your presence and stay motivated.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {/* Stats Overview */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <AttendanceSummaryCard
                                    label="Presence Score"
                                    value={`${Math.round(data?.percentage || 0)}%`}
                                    subtext="Overall attendance"
                                    icon={TrendingUp}
                                    color="indigo"
                                />
                                <AttendanceSummaryCard
                                    label="Present Days"
                                    value={data?.presentDays || 0}
                                    subtext={`Out of ${data?.totalDays || 0} recorded`}
                                    icon={CheckCircle2}
                                    color="emerald"
                                />
                                <AttendanceSummaryCard
                                    label="Absent Days"
                                    value={(data?.totalDays || 0) - (data?.presentDays || 0)}
                                    subtext="Aim for zero absents"
                                    icon={XCircle}
                                    color="rose"
                                />
                            </div>

                            {/* Attendance Log */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-indigo-500" />
                                        Attendance Logs (Last 30 Days)
                                    </h2>
                                </div>

                                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/2">
                                            {data?.recentRecords?.length > 0 ? (
                                                data.recentRecords.map((record: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-white/2 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {format(new Date(record.date), "EEEE, MMM d, yyyy")}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {record.status === "Present" ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Present
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    Absent
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-xs text-gray-400 italic">Self-checked</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-20 text-center text-gray-500">
                                                        <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                        <p>No attendance records found for the past 30 days.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

function AttendanceSummaryCard({ label, value, subtext, icon: Icon, color }: any) {
    const colors: any = {
        indigo: "bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/20",
        emerald: "bg-white text-emerald-600 border border-gray-100 dark:bg-gray-900 dark:border-white/5",
        rose: "bg-white text-rose-600 border border-gray-100 dark:bg-gray-900 dark:border-white/5",
    };

    return (
        <div className={`rounded-3xl p-6 transition-all hover:scale-[1.02] ${colors[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <p className={`text-xs font-black uppercase tracking-widest ${color === "indigo" ? "text-indigo-100" : "text-gray-400"}`}>
                    {label}
                </p>
                <div className={`p-2 rounded-xl ${color === "indigo" ? "bg-white/20" : "bg-gray-50 dark:bg-gray-800"}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <h3 className="text-3xl font-black mb-1">{value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-tight ${color === "indigo" ? "text-indigo-200" : "text-gray-400"}`}>
                {subtext}
            </p>
        </div>
    );
}
