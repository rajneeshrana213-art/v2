import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { Plus, CheckCircle2, XCircle, Clock, Search, User, Ticket, ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StudentSearchPicker from "@/components/dashboard/shared/StudentSearchPicker";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Loader } from "@/components/ui/feedback/Loader";

type Concession = {
    id: string;
    studentFeePlan: {
        student: {
            user: { name: string };
            class: { name: string };
        };
    };
    feeHead?: { name: string } | null;
    amount: number;
    type: "FIXED_AMOUNT" | "PERCENTAGE" | "FULL_WAIVER";
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approver?: { name: string } | null;
    createdAt: string;
};

export default function AdminFinanceConcessionsPage() {
    const { user } = useAuth();
    const [academicYearId, setAcademicYearId] = useState<string>("");

    const { data: academicYears = [] } = useQuery({
        queryKey: ["academic-years", user?.schoolId],
        queryFn: async () => {
            const res = await client.get("/v1/admin/settings/academic-years");
            const data = res?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.years)) return data.years;
            return [];
        },
        enabled: !!user?.schoolId
    });

    const activeYearId = useMemo(() =>
        academicYears.find((y: any) => y.isActive)?.id || academicYears[0]?.id,
        [academicYears]);

    useEffect(() => {
        if (activeYearId && !academicYearId) {
            setAcademicYearId(activeYearId);
        }
    }, [activeYearId, academicYearId]);

    const { data: concessions = [], isLoading: loading, refetch } = useQuery({
        queryKey: ["concessions", user?.schoolId, academicYearId],
        queryFn: async () => {
            const res = await client.get("/v1/finance/concessions", {
                params: { academicYearId }
            });
            return res.data || [];
        },
        enabled: !!user?.schoolId && !!academicYearId
    });

    const handleApprove = async (id: string) => {
        try {
            await client.post(`/v1/finance/concessions/${id}/approve`, { userId: user?.userId });
            toast.success("Concession approved successfully");
            refetch();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Failed to approve concession");
        }
    };

    return (
        <>
            <Head>
                <title>Concessions – Admin | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <Link
                        href="/dashboard/admin/finance"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Finance Dashboard
                    </Link>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                                Fee Concessions
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Manage student fee waivers, scholarships, and special discounts.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Viewing Session</p>
                                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                    <SelectTrigger className="h-9 w-40 rounded-xl border-indigo-100 bg-white/50 px-4 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300">
                                        <SelectValue placeholder="Select Year">
                                            {academicYears.find((y: any) => y.id === academicYearId)?.year || (
                                                <div className="flex items-center gap-2">
                                                    <Loader size="sm" />
                                                    <span>Session...</span>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y: any) => (
                                            <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Link
                                href="/dashboard/admin/finance/concessions/apply"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                Apply New Concession
                            </Link>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Concession List</CardTitle>
                            <CardDescription>
                                Review and approve student-wise fee reductions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden dark:border-white/5 dark:bg-gray-950">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 dark:border-white/5">
                                            <th className="px-4 py-3 font-medium">Student</th>
                                            <th className="px-4 py-3 font-medium">Head</th>
                                            <th className="px-4 py-3 font-medium">Concession</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center">
                                                    <Loader size="lg" />
                                                </td>
                                            </tr>
                                        ) : concessions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                                    No concessions found.
                                                </td>
                                            </tr>
                                        ) : (
                                            concessions.map((c: Concession) => (
                                                <tr key={c.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {c.studentFeePlan.student.user.name}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500">
                                                                {c.studentFeePlan.student.class.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {c.feeHead?.name || "All Heads"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                                {c.type === "FULL_WAIVER"
                                                                    ? "100% Waiver"
                                                                    : c.type === "PERCENTAGE"
                                                                        ? `${c.amount}% off`
                                                                        : `₹${c.amount.toLocaleString("en-IN")} off`}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                                {c.reason}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="soft"
                                                            tone={
                                                                c.status === "APPROVED"
                                                                    ? "success"
                                                                    : c.status === "PENDING"
                                                                        ? "warning"
                                                                        : "danger"
                                                            }
                                                            className="text-[10px]"
                                                        >
                                                            {c.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-gray-400">
                                                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {c.status === "PENDING" && (
                                                            <button
                                                                onClick={() => handleApprove(c.id)}
                                                                className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all dark:bg-emerald-500/10"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </>
    );
}
