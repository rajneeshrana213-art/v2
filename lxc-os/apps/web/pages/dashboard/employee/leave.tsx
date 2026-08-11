
import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getISTDateString, parseInstitutionalDate } from "@/lib/utils/date-utils";

export default function LeaveManagementPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [formData, setFormData] = useState({
        fromDate: "",
        toDate: "",
        reason: "",
        type: "LEAVE"
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateDays = (from: string, to: string) => {
        if (!from || !to) return 0;
        const d1 = parseInstitutionalDate(from);
        const d2 = parseInstitutionalDate(to);
        if (d2 < d1) return 0;
        const diff = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const totalDays = calculateDays(formData.fromDate, formData.toDate);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/employee/leave");
            setLeaves(res.data);
        } catch (err) {
            console.error("Failed to fetch leaves:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const fromDate = parseInstitutionalDate(formData.fromDate);
        const toDate = parseInstitutionalDate(formData.toDate);

        const today = parseInstitutionalDate(getISTDateString());

        if (fromDate < today) {
            setError("Cannot apply for leave in past days");
            return;
        }

        if (toDate < fromDate) {
            setError("To Date cannot be before From Date");
            return;
        }

        const diffDays = calculateDays(formData.fromDate, formData.toDate);

        if (formData.type === "LEAVE" && diffDays > 30) {
            setError("General Leave cannot exceed 30 days");
            return;
        }

        if (formData.type === "COMP_OFF" && diffDays > 15) {
            setError("Comp-off cannot exceed 15 days");
            return;
        }

        try {
            setSubmitting(true);
            await client.post("/v1/employee/leave", formData);
            setShowApplyModal(false);
            setFormData({ fromDate: "", toDate: "", reason: "", type: "LEAVE" });
            fetchLeaves();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit leave request");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
            case "REJECTED":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase"><XCircle className="h-3 w-3" /> Rejected</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase"><Clock className="h-3 w-3" /> Pending</span>;
        }
    };

    return (
        <>
            <Head>
                <title>Leave Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/dashboard/employee" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-2">
                                <ArrowLeft className="h-3 w-3" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave & Comp-off</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage your time off and view request history.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowApplyModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Apply Leave
                        </button>
                    </div>

                    {/* Leave List */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Request History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Duration</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Reason / Type</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Applied On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader size="md" />
                                                    <span className="text-xs font-medium">Loading history...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : leaves.length > 0 ? (
                                        leaves.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                                        {Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{leave.reason}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(leave.isApproved)}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {new Date(leave.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No leave requests found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Apply for Time Off</h3>
                                <button onClick={() => { setShowApplyModal(false); setError(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            min={getISTDateString()}
                                            value={formData.fromDate}
                                            onChange={(e) => {
                                                setFormData({ ...formData, fromDate: e.target.value });
                                                setError(null);
                                            }}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">To Date</label>
                                        <input
                                            type="date"
                                            required
                                            min={formData.fromDate || getISTDateString()}
                                            value={formData.toDate}
                                            onChange={(e) => {
                                                setFormData({ ...formData, toDate: e.target.value });
                                                setError(null);
                                            }}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                {totalDays > 0 && (
                                    <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10">
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Total Duration</span>
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Request Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, type: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="LEAVE">General Leave</option>
                                        <option value="COMP_OFF">Compensatory Off (Comp-off)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.reason}
                                        onChange={(e) => {
                                            setFormData({ ...formData, reason: e.target.value });
                                            setError(null);
                                        }}
                                        placeholder="Briefly explain the reason for leave..."
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader size="sm" variant="white" />
                                            <span>Submitting...</span>
                                        </div>
                                    ) : "Submit Request"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout >
        </>
    );
}
