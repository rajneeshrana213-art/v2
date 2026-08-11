
import React, { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, MessageSquare, Search, Filter, MoreVertical } from 'lucide-react';
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Loader } from '@/components/ui/feedback/Loader';

interface Feedback {
    id: string;
    title: string;
    description: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    School: {
        schoolName: string;
        schoolLogo: string | null;
        schoolCode: string | null;
    };
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [procesingId, setProcessingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/superadmin/feedback?page=${page}&limit=10`);
            setFeedbacks(response.data.feedback);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            toast.error("Failed to fetch feedback requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [page]);


    const handleStatusUpdate = async (
        id: string,
        status: "APPROVED" | "REJECTED"
    ) => {
        setProcessingId(id);
        const loadingToast = toast.loading("Processing...");
        try {
            await axios.put(`/api/v1/superadmin/feedback/${id}`, { status });
            await fetchFeedbacks(); // Await refresh to ensure UI updates before unlocking
            toast.dismiss(loadingToast);
            toast.success(
                `Feedback ${status === "APPROVED" ? "approved" : "rejected"} successfully`
            );
        } catch (error) {
            console.error("Error updating status:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingFeedbacks = feedbacks.filter((f) => f.status === "PENDING");
    const historyFeedbacks = feedbacks.filter((f) => f.status !== "PENDING");

    if (loading) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        {
            title: "Total Feedback",
            value: feedbacks.length,
            icon: MessageSquare,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            title: "Pending Requests",
            value: pendingFeedbacks.length,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
        },
        {
            title: "Approved",
            value: feedbacks.filter((f) => f.status === "APPROVED").length,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
        },
        {
            title: "Rejected",
            value: feedbacks.filter((f) => f.status === "REJECTED").length,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
        },
    ];

    const pendingColumns = [
        {
            key: "school",
            header: "School",
            render: (_: any, row: Feedback) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                        {row.School.schoolLogo ? (
                            <img
                                src={row.School.schoolLogo}
                                alt={row.School.schoolName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                {row.School.schoolName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {row.School.schoolName}
                        </p>
                        <p className="text-xs text-gray-500">
                            Code: {row.School.schoolCode || "N/A"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "details",
            header: "Feedback Details",
            width: "40%",
            render: (_: any, row: Feedback) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {row.description}
                    </p>
                </div>
            ),
        },
        {
            key: "date",
            header: "Date",
            render: (_: any, row: Feedback) => (
                <span className="text-sm text-gray-500">
                    {format(new Date(row.createdAt), "MMM dd, yyyy")}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            render: (_: any, row: Feedback) => (
                <div className="flex justify-end gap-2">
                    <Button
                        className="h-8 px-3 text-xs border border-red-200 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleStatusUpdate(row.id, "REJECTED")}
                        disabled={procesingId === row.id}
                    >
                        {procesingId === row.id ? <Loader size="sm" /> : "Reject"}
                    </Button>
                    <Button
                        className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-500"
                        onClick={() => handleStatusUpdate(row.id, "APPROVED")}
                        disabled={procesingId === row.id}
                    >
                        {procesingId === row.id ? <Loader size="sm" variant="white" /> : "Approve"}
                    </Button>
                </div>
            ),
        },
    ];

    const historyColumns = [
        {
            key: "school",
            header: "School",
            render: (_: any, row: Feedback) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                        {row.School.schoolLogo ? (
                            <img
                                src={row.School.schoolLogo}
                                alt={row.School.schoolName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                {row.School.schoolName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {row.School.schoolName}
                        </p>
                        <p className="text-xs text-gray-500">
                            Code: {row.School.schoolCode || "N/A"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "details",
            header: "Feedback Details",
            width: "40%",
            render: (_: any, row: Feedback) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {row.description}
                    </p>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_: any, row: Feedback) => (
                <Badge
                    variant="soft"
                    tone={row.status === "APPROVED" ? "success" : "danger"}
                >
                    {row.status}
                </Badge>
            ),
        },
        {
            key: "date",
            header: "Date",
            render: (_: any, row: Feedback) => (
                <span className="text-sm text-gray-500">
                    {format(new Date(row.createdAt), "MMM dd, yyyy")}
                </span>
            ),
        },
    ];


    return (
        <>
            <Head>
                <title>All Feedbacks | Super Admin Dashboard</title>
            </Head>
            <DashboardLayout role="superadmin">
                <div className="space-y-6">
                    {/* ... (content) ... */}
                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Feedback Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Review and manage feedback/complaints from schools
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card
                                key={index}
                                className="border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50"
                            >
                                <div className="p-6 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </h3>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
                            <button
                                onClick={() => {
                                    setActiveTab("pending");
                                    setPage(1);
                                }}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "pending"
                                    ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                            >
                                Pending Requests
                                {pendingFeedbacks.length > 0 && (
                                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {pendingFeedbacks.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("history");
                                    setPage(1);
                                }}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "history"
                                    ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                            >
                                Request History
                            </button>
                        </div>

                        {/* Tables */}
                        {activeTab === "pending" ? (
                            <DataTable
                                columns={pendingColumns}
                                data={pendingFeedbacks}
                                emptyState={
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                            <CheckCircle className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            No pending feedback
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            All feedback requests have been processed.
                                        </p>
                                    </div>
                                }
                            />
                        ) : (
                            <DataTable
                                columns={historyColumns}
                                data={historyFeedbacks}
                                emptyState={
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                            <Clock className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            No history found
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            No approved or rejected feedback yet.
                                        </p>
                                    </div>
                                }
                            />
                        )}

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing <span className="font-medium text-gray-900 dark:text-gray-100">{(page - 1) * pagination.limit + 1}</span> to{" "}
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {Math.min(page * pagination.limit, pagination.totalItems)}
                                    </span>{" "}
                                    of <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalItems}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
