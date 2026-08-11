import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    X,
    User as UserIcon,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/context/AuthContext";

// Define generic interface for Leave Request Data
interface LeaveRequest {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        profilePic: string | null;
        role: string;
        Employee?: {
            employeeCode?: string;
            designation?: { name: string };
            department?: { name: string };
        };
    };
    approver?: {
        id: string;
        name: string;
        email: string;
        profilePic: string | null;
        role: string;
    };
    reason: string;
    fromDate: string;
    toDate: string;
    status: string; // 'APPROVED' | 'REJECTED' | 'PENDING' based on secondary status or isApproved
    isApproved: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
}

interface DashboardStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface DashboardData {
    stats: DashboardStats;
    requests: LeaveRequest[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function LeaveRequests() {
    const router = useRouter();
    const { user } = useAuth(); // Get user from auth context
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

    // Filter State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showFilters, setShowFilters] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            params.append("page", page.toString());
            params.append("limit", "10");

            const response = await axios.get(`/api/v1/superadmin/leave-requests?${params.toString()}`);
            setData(response.data);
        } catch (error) {
            toast.error("Failed to fetch leave requests");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [activeTab, search, startDate, endDate, statusFilter, page]);

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setStatusFilter("ALL");
        setPage(1);
    };


    const handleAction = async (
        id: string,
        action: "APPROVE" | "REJECT",
        reason?: string
    ) => {
        setActionLoading(id);
        try {
            await axios.put(`/api/v1/superadmin/leave-requests/${id}`, {
                action,
                rejectionReason: reason,
                userId: user?.userId, // Use actual user ID
            });
            toast.success(`Leave request ${action.toLowerCase()}ed successfully`);
            if (action === "REJECT") setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} request`);
            console.error(error);
        } finally {
            setActionLoading(null);
            setRejectionReason("");
        }
    };

    const openRejectModal = (id: string) => {
        setSelectedRequestId(id);
        setIsModalOpen(true);
    };

    const getDuration = (from: string, to: string) => {
        const start = new Date(from);
        const end = new Date(to);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
    };

    if (loading && !data) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-96 items-center justify-center">
                    <Loader size="lg" variant="primary" />
                </div>
            </DashboardLayout>
        );
    }

    const pendingRequests = data?.requests.filter((r) => r.isApproved === "PENDING") || [];
    const historyRequests = data?.requests.filter((r) => r.isApproved !== "PENDING") || [];

    return (
        <DashboardLayout role="superadmin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Leave Requests
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manage and review employee leave applications
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition shadow-sm ${showFilters
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-400"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
                                }`}
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? "Hide Filters" : "Filter"}
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-white/10 dark:bg-gray-900 md:grid-cols-4">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <button
                                onClick={clearFilters}
                                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-red-500 dark:border-white/10 dark:bg-gray-800 dark:hover:bg-white/5"
                                title="Clear Filters"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Requests"
                        count={data?.stats.total || 0}
                        icon={FileText}
                        color="blue"
                    />
                    <StatsCard
                        title="Pending Requests"
                        count={data?.stats.pending || 0}
                        icon={Clock}
                        color="yellow"
                    />
                    <StatsCard
                        title="Approved"
                        count={data?.stats.approved || 0}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatsCard
                        title="Rejected"
                        count={data?.stats.rejected || 0}
                        icon={XCircle}
                        color="red"
                    />
                </div>

                {/* Tabs & Content */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 px-6 dark:border-white/10">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === "pending"
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                }`}
                        >
                            Pending Requests
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                                {data?.stats.pending || 0}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === "history"
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                }`}
                        >
                            Request History
                        </button>
                    </div>

                    {/* Table Content */}
                    <div className="relative overflow-x-auto">
                        {loading && data && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] dark:bg-gray-900/50">
                                <Loader size="lg" />
                            </div>
                        )}
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Employee</th>
                                    <th className="px-6 py-4 font-medium">Leave Type & Reason</th>
                                    <th className="px-6 py-4 font-medium">Duration</th>
                                    <th className="px-6 py-4 font-medium">Applied On</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    {activeTab === "history" && <th className="px-6 py-4 font-medium">Approved By</th>}
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {(activeTab === "pending" ? pendingRequests : historyRequests).length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === "history" ? 7 : 6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No {activeTab} requests found
                                        </td>
                                    </tr>
                                ) : (
                                    (activeTab === "pending" ? pendingRequests : historyRequests).map((request) => (
                                        <tr key={request.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {request.user.profilePic ? (
                                                        <img
                                                            src={request.user.profilePic}
                                                            alt={request.user.name}
                                                            className="h-9 w-9 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                            <UserIcon className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {request.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {request.user.Employee?.employeeCode || request.user.role}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <p className="font-medium text-gray-900 dark:text-white">Leave</p>
                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={request.reason}>
                                                        {request.reason}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {getDuration(request.fromDate, request.toDate)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {format(new Date(request.fromDate), 'MMM d')} - {format(new Date(request.toDate), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {format(new Date(request.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={request.isApproved} />
                                            </td>
                                            {activeTab === "history" && (
                                                <td className="px-6 py-4">
                                                    {request.approver ? (
                                                        <div className="flex items-center gap-2">
                                                            {request.approver.profilePic ? (
                                                                <img
                                                                    src={request.approver.profilePic}
                                                                    alt={request.approver.name}
                                                                    className="h-6 w-6 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                    <UserIcon className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-900 dark:text-white">{request.approver.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                {activeTab === "pending" ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAction(request.id, "APPROVE")}
                                                            disabled={!!actionLoading}
                                                            className="inline-flex items-center justify-center rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                                        >
                                                            {actionLoading === request.id ? "..." : "Approve"}
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(request.id)}
                                                            disabled={!!actionLoading}
                                                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                                        Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-900 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                    disabled={page === data.pagination.totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-400">
                                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{data.pagination.totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                            disabled={page === data.pagination.totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-white/10 dark:hover:bg-white/5"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Leave Request</h3>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reason for Rejection
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason..."
                                className="h-32 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:ring-indigo-900"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => selectedRequestId && handleAction(selectedRequestId, "REJECT", rejectionReason)}
                                disabled={!!actionLoading}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? "Rejecting..." : "Reject Request"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </DashboardLayout>
    );
}

function StatsCard({ title, count, icon: Icon, color }: { title: string; count: number; icon: any; color: "blue" | "yellow" | "green" | "red" }) {
    const colors = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        yellow: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-gray-900">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    } as const;

    const normalizedStatus = status as keyof typeof styles;

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[normalizedStatus] || styles.PENDING}`}>
            {status}
        </span>
    );
}
