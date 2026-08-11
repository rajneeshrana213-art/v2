import { useState, useMemo, useEffect } from "react";
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
import { Plus, Ticket, ArrowLeft, ChevronRight, Info, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import StudentSearchPicker from "@/components/dashboard/shared/StudentSearchPicker";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Loader from '@/components/ui/feedback/Loader';

export default function ApplyConcessionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [feePlan, setFeePlan] = useState<any>(null);
    const [academicYearId, setAcademicYearId] = useState<string>("");

    const [formData, setFormData] = useState({
        feeHeadId: "ALL",
        type: "FIXED_AMOUNT",
        amount: "",
        reason: "",
        autoApprove: true,
    });

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

    const fetchStudentPlan = async (studentId: string) => {
        if (!studentId || !academicYearId) return;
        try {
            setLoading(true);
            const [planRes, balRes] = await Promise.all([
                client.get("/v1/finance/student-fee-plans", {
                    params: { studentId, academicYearId },
                }),
                client.get("/v1/finance/reports/outstanding-summary", {
                    params: { schoolId: user?.schoolId, academicYearId, studentId },
                })
            ]);
            setFeePlan({
                ...planRes.data,
                balance: balRes.data
            });
        } catch (err: any) {
            toast.error("Failed to load student fee information");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStudent) fetchStudentPlan(selectedStudent.id);
        else setFeePlan(null);
    }, [selectedStudent, academicYearId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feePlan || !user) return;

        try {
            setLoading(true);
            await client.post("/v1/finance/concessions/apply", {
                studentFeePlanId: feePlan.id,
                feeHeadId: formData.feeHeadId === "ALL" ? null : formData.feeHeadId,
                type: formData.type,
                amount: formData.amount === "" ? 0 : parseFloat(formData.amount),
                reason: formData.reason,
                autoApprove: formData.autoApprove,
                schoolId: user.schoolId,
                userId: user.id,
            });
            toast.success("Concession applied successfully");
            router.push("/dashboard/admin/finance/concessions");
        } catch (err: any) {
            toast.error(err?.response?.data?.error?.[0]?.message || err?.response?.data?.error || "Failed to apply concession");
        } finally {
            setLoading(false);
        }
    };

    const totalAssigned = useMemo(() =>
        feePlan?.feeHeadAmounts?.reduce((s: number, h: any) => s + h.amount, 0) || 0,
        [feePlan]);

    return (
        <>
            <Head>
                <title>Apply Concession – Admin | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 pb-20">
                    {/* Breadcrumbs / Navigation */}
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/dashboard/admin/finance/concessions"
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Concessions List
                        </Link>

                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-50">
                                    New Fee Concession
                                </h1>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                    Configure special waivers, scholarships, or staff discounts for students.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Academic Session</p>
                                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                    <SelectTrigger className="h-10 w-48 rounded-xl border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 dark:border-white/10 dark:bg-gray-950 dark:text-gray-300">
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
                        </div>
                    </div>

                    <Card className="overflow-hidden border-indigo-100 ring-1 ring-indigo-500/5 dark:border-indigo-900/30">
                        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                                    <Ticket className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Concession Application</CardTitle>
                                    <CardDescription className="text-xs font-medium">Configure discount rules for the selected student.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8">
                                <div className="grid gap-8 md:grid-cols-2">
                                    {/* Identification Block */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">1</div>
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Identify Student</Label>
                                            </div>
                                            <StudentSearchPicker onSelect={setSelectedStudent} className="w-full h-12" />
                                            <p className="text-[10px] text-gray-400">Search by name, admission ID, or class.</p>
                                        </div>

                                        {feePlan && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-6 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                                                    <div className="flex items-center justify-between border-b border-indigo-100 pb-4 dark:border-indigo-900/50">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 italic">Financial Summary</span>
                                                        <Badge variant="soft" tone="neutral" className="text-[10px] font-black uppercase">Active Plan</Badge>
                                                    </div>

                                                    <div className="mt-4 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">Gross Assigned Amount</span>
                                                            <span className="text-sm font-black text-gray-900 dark:text-gray-100">₹{totalAssigned.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">Already Paid</span>
                                                            <span className="text-sm font-bold text-emerald-600">₹{feePlan.balance?.totalPaid?.toLocaleString() || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between border-t border-indigo-100 pt-3 dark:border-indigo-900/50">
                                                            <span className="text-xs font-black uppercase text-rose-500">Net Outstanding Dues</span>
                                                            <span className="text-xl font-black text-rose-600">₹{feePlan.balance?.totalOutstanding?.toLocaleString() || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Configuration Block */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">2</div>
                                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Configure Discount Rules</Label>
                                            </div>

                                            <div className="space-y-6 rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/5">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold">Apply On Which Fee Head?</Label>
                                                    <Select
                                                        value={formData.feeHeadId}
                                                        onValueChange={(v) => setFormData({ ...formData, feeHeadId: v })}
                                                    >
                                                        <SelectTrigger className="h-12 rounded-xl bg-white shadow-sm dark:bg-gray-950" disabled={!feePlan}>
                                                            <SelectValue placeholder={feePlan ? "Select target head" : "Select a student first"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ALL">Apply to Full Plan (Multi-head settlement)</SelectItem>
                                                            {feePlan?.feeHeadAmounts?.map((h: any) => (
                                                                <SelectItem key={h.feeHead.id} value={h.feeHead.id}>
                                                                    {h.feeHead.name} (Assigned: ₹{h.amount.toLocaleString()})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold">Reduction Type</Label>
                                                        <Select
                                                            value={formData.type}
                                                            onValueChange={(v) => setFormData({ ...formData, type: v, amount: v === "FULL_WAIVER" ? "0" : formData.amount })}
                                                        >
                                                            <SelectTrigger className="h-12 rounded-xl bg-white shadow-sm dark:bg-gray-950" disabled={!feePlan}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="FIXED_AMOUNT">Flat Amount (₹)</SelectItem>
                                                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                                <SelectItem value="FULL_WAIVER">100% Waiver</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold">Discount Value</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="h-12 rounded-xl bg-white shadow-sm dark:bg-gray-950"
                                                            disabled={!feePlan || formData.type === "FULL_WAIVER"}
                                                            value={formData.amount}
                                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold">Official Justification</Label>
                                                    <Input
                                                        placeholder="e.g. Sibling Discount, Merit Scholarship #2024"
                                                        className="h-12 rounded-xl bg-white shadow-sm dark:bg-gray-950"
                                                        required
                                                        disabled={!feePlan}
                                                        value={formData.reason}
                                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                    />
                                                    <p className="text-[10px] text-gray-400 italic px-1">This will be visible on audit reports and invoices.</p>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-2xl bg-amber-50/50 p-4 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                                                    <input
                                                        type="checkbox"
                                                        id="autoApprove"
                                                        checked={formData.autoApprove}
                                                        onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                                                        className="h-5 w-5 rounded-lg border-amber-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <label htmlFor="autoApprove" className="text-xs font-black text-amber-900 dark:text-amber-200 cursor-pointer">Post & Approve Immediately</label>
                                                        <span className="text-[10px] text-amber-700 dark:text-amber-400">If unchecked, it will go to the Super Admin for approval.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <div className="flex items-center justify-between border-t bg-gray-50/50 p-6 dark:bg-gray-900/50">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-xs font-black uppercase tracking-tighter text-gray-500 shadow-sm border border-gray-100 transition-all hover:bg-gray-50 active:scale-95"
                                >
                                    Discard Changes
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading || !feePlan || !formData.reason}
                                    className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-10 text-xs font-black uppercase tracking-tighter text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader size="sm" variant="white" />
                                            <span>Applying...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Apply Concession
                                        </>
                                    )}
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Documentation / Help Section */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-gray-900">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                                <Info className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Audit Trail</h4>
                            <p className="mt-2 text-xs leading-relaxed text-gray-500">All concessions are tracked by date, operator, and student ID. Once applied, they create an accounting entry that reverses the corresponding receivable.</p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-gray-900">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Immutable Records</h4>
                            <p className="mt-2 text-xs leading-relaxed text-gray-500">Concessions cannot be edited once approved. If a mistake is made, the concession must be rejected or reversed by an authorized auditor.</p>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-gray-900">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Fee Head Logic</h4>
                            <p className="mt-2 text-xs leading-relaxed text-gray-500">Applying to 'Full Plan' distributes the discount across all heads proportionally. Applying to a specific head only affects that particular component.</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
