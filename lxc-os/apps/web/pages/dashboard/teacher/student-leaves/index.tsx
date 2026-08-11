import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    Check,
    X
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/feedback/Loader";

export default function TeacherStudentLeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await client.get("/v1/dashboard/teacher/student-leaves");
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch student leave requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
        try {
            await client.patch("/v1/dashboard/teacher/student-leaves", { leaveId, status });
            fetchLeaves();
        } catch (error) {
            console.error(`Failed to ${status} leave request`, error);
        }
    };

    return (
        <>
            <Head>
                <title>Student Leave Requests - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-8 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Student Leave Management</h1>
                            <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Review and approve/reject student leave requests.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-100/20 dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Student</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {leaves.length > 0 ? (
                                                leaves.map((leave, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b last:border-none border-gray-50 dark:border-white/5">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                                                                    <User className="h-4 w-4" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{leave.user.name}</span>
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                        {leave.user.student?.class?.name || "N/A"} • Roll {leave.user.student?.rollNo || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                        {format(new Date(leave.fromDate), "MMM d, yyyy")} - {format(new Date(leave.toDate), "MMM d, yyyy")}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                        {Math.ceil(Math.abs(new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 3600 * 24)) + 1} Days Leave
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate font-medium">
                                                                {leave.reason}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <StatusBadge status={leave.isApproved} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {leave.isApproved === "PENDING" && (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleAction(leave.id, "APPROVED")}
                                                                        className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(leave.id, "REJECTED")}
                                                                        className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                                        <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                        <p className="text-sm font-medium">No pending leave requests found.</p>
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

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        PENDING: {
            icon: Clock,
            className: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
            label: "Reviewing"
        },
        APPROVED: {
            icon: CheckCircle2,
            className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
            label: "Approved"
        },
        REJECTED: {
            icon: XCircle,
            className: "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
            label: "Declined"
        }
    };

    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}
