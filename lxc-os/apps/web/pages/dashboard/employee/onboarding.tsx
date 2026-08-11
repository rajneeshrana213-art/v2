
import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { GraduationCap, CheckCircle2, Circle, Clock, ChevronRight, TrendingUp, Building, Target, Search, Filter, Plus, Edit, Trash2, X, Save, Phone, Mail, MapPin, Calendar, CheckSquare, Square, AlertCircle, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

enum OnboardingStatus {
    INITIATED = "INITIATED",
    DOCS_PENDING = "DOCS_PENDING",
    SETUP_IN_PROGRESS = "SETUP_IN_PROGRESS",
    TRAINING = "TRAINING",
    COMPLETED = "COMPLETED"
}

export default function OnboardingPage() {
    const [onboardings, setOnboardings] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, avgDaysToComplete: 14, activeCount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ totalCount: 0, totalPages: 1 });

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [editingStepKey, setEditingStepKey] = useState<string>("");

    // Form Inputs
    const [onboardingForm, setOnboardingForm] = useState({
        schoolId: "",
        assignedToId: "",
        status: OnboardingStatus.INITIATED
    });

    const [stepForm, setStepForm] = useState({
        completed: false,
        notes: ""
    });

    const [availableSchools, setAvailableSchools] = useState<any[]>([]);

    const fetchOnboardings = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = { page, limit: 10 };
            if (searchTerm) params.searchTerm = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;

            const response = await client.get("/v1/onboarding", { params });
            setOnboardings(response.data.onboardings || []);
            setPagination(response.data.pagination || { totalCount: 0, totalPages: 1 });
            setCurrentPage(page);
        } catch (err: any) {
            console.error("Failed to fetch onboardings:", err);
            toast.error(err.response?.data?.error || "Failed to load onboardings");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await client.get("/v1/onboarding/stats");
            setStats(response.data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const fetchAvailableSchools = async () => {
        try {
            // Fetch schools that don't have onboarding yet
            const response = await client.get("/v1/superadmin/core/schools");
            const allSchools = Array.isArray(response.data) ? response.data : (response.data?.schools || []);

            // Get schools that already have onboarding (with error handling)
            let onboardedSchoolIds = new Set<string>();
            try {
                const onboardingsRes = await client.get("/v1/onboarding", { params: { limit: 1000 } });
                onboardedSchoolIds = new Set((onboardingsRes.data.onboardings || []).map((o: any) => o.schoolId));
            } catch (onboardingErr: any) {
                // If fetching onboardings fails, just continue with empty set
                // This means all schools will be shown as available
                console.warn("Could not fetch existing onboardings:", onboardingErr);
            }

            // Filter out schools that already have onboarding
            const available = allSchools.filter((school: any) => !onboardedSchoolIds.has(school.id));
            setAvailableSchools(available);
        } catch (err: any) {
            console.error("Failed to fetch schools:", err);
            // If employee doesn't have access, show empty list
            setAvailableSchools([]);
            if (err.response?.status !== 403 && err.response?.status !== 401) {
                toast.error("Failed to load available schools");
            }
        }
    };

    useEffect(() => {
        fetchOnboardings();
        fetchStats();
        fetchAvailableSchools();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (currentPage === 1) {
                fetchOnboardings(1);
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        fetchOnboardings(currentPage);
    }, [currentPage]);

    const handleAddOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        toast.promise(
            client.post("/v1/onboarding", onboardingForm),
            {
                pending: 'Creating onboarding...',
                success: {
                    render() {
                        setIsAddModalOpen(false);
                        setOnboardingForm({ schoolId: "", assignedToId: "", status: OnboardingStatus.INITIATED });
                        fetchOnboardings(currentPage);
                        fetchStats();
                        return "Onboarding created successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to create onboarding";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleUpdateOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOnboarding) return;

        setIsSubmitting(true);

        toast.promise(
            client.patch(`/v1/onboarding/${selectedOnboarding.id}`, {
                status: onboardingForm.status,
                assignedToId: onboardingForm.assignedToId
            }),
            {
                pending: 'Updating onboarding...',
                success: {
                    render() {
                        setIsEditModalOpen(false);
                        fetchOnboardings(currentPage);
                        fetchStats();
                        return "Onboarding updated successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to update onboarding";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await client.patch(`/v1/onboarding/${id}`, { status });
            toast.success("Status updated successfully");
            fetchOnboardings(currentPage);
            fetchStats();
            if (selectedOnboarding?.id === id) {
                const res = await client.get(`/v1/onboarding/${id}`);
                setSelectedOnboarding(res.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update status");
        }
    };

    const handleUpdateStep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOnboarding || !editingStepKey) return;

        setIsSubmitting(true);

        toast.promise(
            client.patch(`/v1/onboarding/${selectedOnboarding.id}`, {
                stepKey: editingStepKey,
                stepData: stepForm
            }),
            {
                pending: 'Updating step...',
                success: {
                    render(res: any) {
                        setIsStepModalOpen(false);
                        setStepForm({ completed: false, notes: "" });
                        setEditingStepKey("");
                        const updated = res.data.data;
                        setSelectedOnboarding(updated);
                        fetchOnboardings(currentPage);
                        return "Step updated successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to update step";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleDeleteOnboarding = async (id: string) => {
        if (!confirm("Are you sure you want to delete this onboarding? This action cannot be undone.")) {
            return;
        }

        toast.promise(
            client.delete(`/v1/onboarding/${id}`),
            {
                pending: 'Deleting onboarding...',
                success: {
                    render() {
                        fetchOnboardings(currentPage);
                        fetchStats();
                        return "Onboarding deleted successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to delete onboarding";
                    }
                }
            }
        );
    };

    const openDetails = async (onboarding: any) => {
        setIsFetchingDetails(true);
        try {
            const res = await client.get(`/v1/onboarding/${onboarding.id}`);
            setSelectedOnboarding(res.data);
            setIsDetailsModalOpen(true);
        } catch (err) {
            toast.error("Failed to fetch onboarding details");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const openEdit = (onboarding: any) => {
        setSelectedOnboarding(onboarding);
        setOnboardingForm({
            schoolId: onboarding.schoolId,
            assignedToId: onboarding.assignedToId || "",
            status: onboarding.status
        });
        setIsEditModalOpen(true);
    };

    const openStepEdit = (stepKey: string, stepData: any) => {
        setEditingStepKey(stepKey);
        setStepForm({
            completed: stepData?.completed || false,
            notes: stepData?.notes || ""
        });
        setIsStepModalOpen(true);
    };

    const statusColors: any = {
        INITIATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        DOCS_PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        SETUP_IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        TRAINING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };

    const statusLabels: any = {
        INITIATED: "Initiated",
        DOCS_PENDING: "Docs Pending",
        SETUP_IN_PROGRESS: "Setup In Progress",
        TRAINING: "Training",
        COMPLETED: "Completed",
    };

    const steps = selectedOnboarding?.steps as any || {};
    const stepOrder = ["initialMeeting", "dataImport", "adminTraining", "parentAppLaunch", "feeEngineSetup", "goLive"];

    return (
        <>
            <Head>
                <title>School Onboarding - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Onboarding</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Track and manage the implementation lifecycle for new schools.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Avg. Go-Live</div>
                                    <div className="text-sm font-bold text-indigo-600">{stats.avgDaysToComplete || 14} Days</div>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:border-white/10 mx-2"></div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Active</div>
                                    <div className="text-sm font-bold text-emerald-600">{stats.activeCount || 0}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(true);
                                    fetchAvailableSchools();
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                New Onboarding
                            </button>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10 pb-4">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all",
                                statusFilter === "ALL"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-white/10"
                            )}
                        >
                            All ({stats.total || 0})
                        </button>
                        {Object.keys(statusColors).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border",
                                    statusFilter === status
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                        : "bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-white/10 hover:border-indigo-500/50"
                                )}
                            >
                                {statusLabels[status]} ({stats.byStatus?.[status] || 0})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by school name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Stats & Priority */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                <TrendingUp className="h-8 w-8 opacity-50" />
                                <div className="mt-4">
                                    <div className="text-4xl font-bold">{stats.activeCount || 0}</div>
                                    <div className="text-xs font-medium opacity-80 uppercase tracking-wider mt-1">Active Implementations</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Status Breakdown</h3>
                                <div className="space-y-4">
                                    {Object.keys(statusLabels).map((status) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{statusLabels[status]}</span>
                                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold text-white", statusColors[status])}>
                                                {stats.byStatus?.[status] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Onboardings List */}
                        <div className="lg:col-span-3 space-y-4">
                            {loading ? (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center">
                                    <Loader size="lg" />
                                </div>
                            ) : onboardings.length > 0 ? (
                                onboardings.map((onboarding) => (
                                    <div key={onboarding.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                                    <Building className="h-6 w-6 text-indigo-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{onboarding.school?.schoolName || "Unknown School"}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider", statusColors[onboarding.status])}>
                                                            {statusLabels[onboarding.status]}
                                                        </span>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <span className="text-xs text-gray-500">Current Phase: <span className="font-bold text-indigo-600">{onboarding.lastLabel || "Initial Meeting"}</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 max-w-xs">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Implementation Progress</span>
                                                    <span className="text-xs font-bold text-indigo-600">{onboarding.progress || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${onboarding.progress || 0}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(onboarding)}
                                                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-600 hover:bg-white transition-all"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOnboarding(onboarding.id)}
                                                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-600 hover:bg-white transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDetails(onboarding)}
                                                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-indigo-600 hover:bg-white transition-all"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center">
                                    <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No onboardings found. Start by creating a new onboarding!</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && onboardings.length > 0 && (
                                <div className="px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing <span className="font-semibold text-gray-900 dark:text-white">{onboardings.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalCount}</span> onboardings
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchOnboardings(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center px-4 text-xs font-bold text-gray-500">
                                            Page {currentPage} of {pagination.totalPages}
                                        </div>
                                        <button
                                            onClick={() => fetchOnboardings(currentPage + 1)}
                                            disabled={currentPage === pagination.totalPages}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Onboarding Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Onboarding</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddOnboarding} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">School</label>
                                    <select
                                        required
                                        value={onboardingForm.schoolId}
                                        onChange={(e) => setOnboardingForm({ ...onboardingForm, schoolId: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    >
                                        <option value="">Select a school</option>
                                        {availableSchools.map((school) => (
                                            <option key={school.id} value={school.id}>{school.schoolName || school.name || school.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Initial Status</label>
                                    <select
                                        value={onboardingForm.status}
                                        onChange={(e) => setOnboardingForm({ ...onboardingForm, status: e.target.value as OnboardingStatus })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    >
                                        {Object.keys(statusLabels).map((status) => (
                                            <option key={status} value={status}>{statusLabels[status]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Onboarding"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Onboarding Modal */}
                {isEditModalOpen && selectedOnboarding && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Onboarding</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateOnboarding} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                                    <select
                                        value={onboardingForm.status}
                                        onChange={(e) => setOnboardingForm({ ...onboardingForm, status: e.target.value as OnboardingStatus })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    >
                                        {Object.keys(statusLabels).map((status) => (
                                            <option key={status} value={status}>{statusLabels[status]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Details Modal */}
                {isDetailsModalOpen && selectedOnboarding && (
                    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Building className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedOnboarding.school?.schoolName || "Unknown School"}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">Onboarding ID: {selectedOnboarding.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-50 dark:bg-white/5 p-1.5 rounded-full">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="p-6 space-y-8">
                                    {/* School Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                                                <Building className="h-3 w-3" /> School Information
                                            </div>
                                            <div className="space-y-3">
                                                {selectedOnboarding.school?.schoolCode && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <Building className="h-3.5 w-3.5 text-indigo-500" /> Code: {selectedOnboarding.school.schoolCode}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <CheckCircle2 className={cn(
                                                        "h-3.5 w-3.5",
                                                        selectedOnboarding.school?.isActive ? "text-emerald-500" : "text-gray-400"
                                                    )} />
                                                    {selectedOnboarding.school?.isActive ? "Active" : "Inactive"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                                                <Target className="h-3 w-3" /> Status & Progress
                                            </div>
                                            <div className="space-y-3">
                                                <div className="relative group">
                                                    <select
                                                        disabled
                                                        value={selectedOnboarding.status}
                                                        className={cn(
                                                            "w-full px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border-0 ring-1 ring-gray-200 dark:ring-white/10 cursor-not-allowed opacity-80",
                                                            statusColors[selectedOnboarding.status]
                                                        )}
                                                    >
                                                        {Object.keys(statusLabels).map((status) => (
                                                            <option key={status} value={status}>{statusLabels[status]}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute -top-8 left-0 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                                        Status is automated based on steps
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Progress</span>
                                                        <span className="text-xs font-bold text-indigo-600">{selectedOnboarding.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${selectedOnboarding.progress || 0}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 italic">
                                                    Created on {new Date(selectedOnboarding.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Onboarding Steps */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                                            <CheckSquare className="h-3 w-3" /> Implementation Steps
                                        </div>
                                        <div className="space-y-3">
                                            {stepOrder.map((stepKey) => {
                                                const step = steps[stepKey];
                                                if (!step) return null;
                                                return (
                                                    <div key={stepKey} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            {step.completed ? (
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                                                            ) : (
                                                                <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{step.label || stepKey}</div>
                                                                {step.notes && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.notes}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => openStepEdit(stepKey, step)}
                                                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Edit Modal */}
                {isStepModalOpen && selectedOnboarding && editingStepKey && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Edit Step: {steps[editingStepKey]?.label || editingStepKey}
                                </h3>
                                <button onClick={() => setIsStepModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateStep} className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={stepForm.completed}
                                        onChange={(e) => setStepForm({ ...stepForm, completed: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Mark as completed</label>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</label>
                                    <textarea
                                        value={stepForm.notes}
                                        onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm min-h-24 resize-none"
                                        placeholder="Add notes about this step..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size="sm" variant="white" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Step"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
