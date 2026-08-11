import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { LeaveRequestModal } from "@/components/dashboard/shared/LeaveRequestModal";
import { Loader } from "@/components/ui/feedback/Loader";

export default function StudentLeavePage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLeaves = async () => {
        try {
            const res = await client.get("/v1/dashboard/student/leave");
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leave requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmitLeave = async (data: { fromDate: string; toDate: string; reason: string }) => {
        await client.post("/v1/dashboard/student/leave", data);
        fetchLeaves();
    };

    return (
        <>
            <Head>
                <title>Leave Requests - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="space-y-6 pb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/student">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
                                <p className="text-sm text-gray-500">Apply for leave and track your request status.</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Apply for Leave
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Duration</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Reason</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Applied On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/2">
                                            {leaves.length > 0 ? (
                                                leaves.map((leave, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-white/2 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {format(new Date(leave.fromDate), "MMM d, yyyy")} - {format(new Date(leave.toDate), "MMM d, yyyy")}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {Math.ceil(Math.abs(new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 3600 * 24)) + 1} days
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                                                {leave.reason}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <StatusBadge status={leave.isApproved} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-xs text-gray-500">
                                                                {format(new Date(leave.createdAt), "MMM d, yyyy")}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                                        <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                        <p>No leave requests found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <LeaveRequestModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleSubmitLeave}
                    />
                </div>
            </DashboardLayout>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: any = {
        PENDING: {
            icon: Clock,
            className: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
            label: "Pending"
        },
        APPROVED: {
            icon: CheckCircle2,
            className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            label: "Approved"
        },
        REJECTED: {
            icon: XCircle,
            className: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
            label: "Rejected"
        }
    };

    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}
