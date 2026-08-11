import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    Calendar,
    ChevronLeft,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CalendarOff,
    Send,
    X
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { getISTDateString } from "@/lib/utils/date-utils";

export default function TeacherLeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        fromDate: "",
        toDate: "",
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await client.get("/v1/dashboard/teacher/leaves");
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason || !formData.fromDate || !formData.toDate) {
            toast.error("Please fill all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await client.post("/v1/dashboard/teacher/leaves", formData);
            toast.success("Leave request submitted!");
            setShowApplyModal(false);
            setFormData({ reason: "", fromDate: "", toDate: "" });
            fetchLeaves();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "text-emerald-600 bg-emerald-50 border-emerald-100";
            case "REJECTED": return "text-rose-600 bg-rose-50 border-rose-100";
            default: return "text-amber-600 bg-amber-50 border-amber-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED": return <CheckCircle2 className="h-4 w-4" />;
            case "REJECTED": return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head>
                <title>Leave Requests - LearnXChain</title>
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
                                <p className="text-sm text-gray-500">Apply for leave and track your requests.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowApplyModal(true)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Apply for Leave
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {leaves.length > 0 ? (
                                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <th className="px-6 py-4">Reason</th>
                                                <th className="px-6 py-4">From</th>
                                                <th className="px-6 py-4">To</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Requested On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {leaves.map((leave, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors dark:hover:bg-white/5">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{leave.reason}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500">{format(new Date(leave.fromDate), "MMM d, yyyy")}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500">{format(new Date(leave.toDate), "MMM d, yyyy")}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${getStatusColor(leave.status)}`}>
                                                            {getStatusIcon(leave.status)}
                                                            {leave.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">
                                                        {format(new Date(leave.createdAt), "MMM d, h:mm a")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                    <CalendarOff className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No leave requests found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 dark:bg-gray-900">
                            <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Apply for Leave</h2>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Submit your request</p>
                                </div>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="rounded-full bg-gray-50 p-3 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all dark:bg-white/5"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="p-8 space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">From Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                required
                                                min={getISTDateString()}
                                                value={formData.fromDate}
                                                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                                className="w-full rounded-2xl bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">To Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                required
                                                min={formData.fromDate || getISTDateString()}
                                                value={formData.toDate}
                                                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                                className="w-full rounded-2xl bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Reason for Leave</label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Briefly explain the reason for your leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-500 disabled:opacity-50 dark:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
