import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
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
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { LeaveRequestModal } from "@/components/dashboard/shared/LeaveRequestModal";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function ParentLeavePage() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    const fetchLeaves = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await client.get(`/v1/dashboard/parent/leave?studentId=${studentId}`);
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leave requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [studentId]);

    const handleSubmitLeave = async (data: { fromDate: string; toDate: string; reason: string }) => {
        if (!studentId) return;
        await client.post("/v1/dashboard/parent/leave", { ...data, studentId });
        fetchLeaves();
    };

    return (
        <>
            <Head>
                <title>Child Leave Requests - LearnXChain</title>
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
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Leave Requests</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Apply for leave and track child requests.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <ChildSelector
                                selectedId={studentId}
                                onSelect={(id) => {
                                    setStudentId(id);
                                    router.push(`/dashboard/parent/leave?studentId=${encodeId(id)}`, undefined, { shallow: true });
                                }}
                            />
                            {studentId && (
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.2rem] h-12 px-6"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Request
                                </Button>
                            )}
                        </div>
                    </div>

                    {!studentId || loading ? (
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
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Applied On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {leaves.length > 0 ? (
                                                leaves.map((leave, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b last:border-none border-gray-50 dark:border-white/5">
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
                                                            <span className="text-xs font-bold text-gray-500">
                                                                {format(new Date(leave.createdAt), "MMM d, yyyy")}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                                        <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                        <p className="text-sm font-medium">No leave requests found for this student.</p>
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
                        title={`Apply for ${leaves[0]?.user?.name || 'Child'}'s Leave`}
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
