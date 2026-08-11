
import Head from "next/head";
import { useEffect, useState, } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, Calendar, Layers, ChevronRight, Edit, Trash2, Clock, CheckCircle2, XCircle, Building2, ExternalLink, X, MessageSquare, Save } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

// LeadStatus enum - matching Prisma schema
enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    DEMO_SCHEDULED = "DEMO_SCHEDULED",
    NEGOTIATION = "NEGOTIATION",
    CONVERTED = "CONVERTED",
    LOST = "LOST"
}

export default function LeadsManagementPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalCount: 0, newCount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ totalCount: 0, totalPages: 1 });

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);

    // Form Inputs
    const [leadForm, setLeadForm] = useState({
        name: "",
        schoolName: "",
        address: "",
        phone: "",
        email: "",
        source: "",
        status: "NEW" as LeadStatus
    });

    const [demoForm, setDemoForm] = useState({
        scheduledAt: "",
        meetingLink: "",
        notes: ""
    });

    const [followUpForm, setFollowUpForm] = useState({
        content: "",
        scheduledAt: "",
        status: ""
    });

    const fetchLeads = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = { page, limit: 10 };
            if (searchTerm) params.searchTerm = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;

            const response = await client.get("/v1/leads", { params });
            setLeads(response.data.leads);
            setStats(response.data.stats);
            setPagination(response.data.pagination);
            setCurrentPage(page);
        } catch (err) {
            console.error("Failed to fetch leads:", err);
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(1);
    }, [searchTerm, statusFilter]);

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        toast.promise(
            client.post("/v1/leads", leadForm),
            {
                pending: 'Adding lead...',
                success: {
                    render() {
                        setIsAddModalOpen(false);
                        setLeadForm({ name: "", schoolName: "", address: "", phone: "", email: "", source: "", status: LeadStatus.NEW });
                        fetchLeads(1);
                        return "Lead added successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to add lead";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdatingStatusId(id);

        toast.promise(
            client.patch(`/v1/leads/${id}`, { status: newStatus }),
            {
                pending: 'Updating status...',
                success: {
                    render() {
                        fetchLeads(currentPage);
                        if (selectedLead && selectedLead.id === id) {
                            setSelectedLead({ ...selectedLead, status: newStatus });
                        }
                        return `Status updated to ${newStatus.replace('_', ' ')}`;
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to update status";
                    }
                }
            }
        ).finally(() => setIsUpdatingStatusId(null));
    };

    const handleUpdateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        toast.promise(
            client.patch(`/v1/leads/${selectedLead.id}`, leadForm),
            {
                pending: 'Updating lead...',
                success: {
                    render() {
                        setIsEditModalOpen(false);
                        fetchLeads(currentPage);
                        return "Lead updated successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to update lead";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;

        toast.promise(
            client.delete(`/v1/leads/${id}`),
            {
                pending: 'Deleting lead...',
                success: {
                    render() {
                        fetchLeads(currentPage);
                        return "Lead deleted successfully";
                    }
                },
                error: "Failed to delete lead"
            }
        );
    };

    const handleScheduleDemo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        toast.promise(
            client.post(`/v1/leads/${selectedLead.id}/demos`, demoForm),
            {
                pending: 'Scheduling demo...',
                success: {
                    render() {
                        setIsDemoModalOpen(false);
                        setDemoForm({ scheduledAt: "", meetingLink: "", notes: "" });
                        fetchLeads(currentPage);
                        return "Demo scheduled successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to schedule demo";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const handleAddFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        toast.promise(
            client.post(`/v1/leads/${selectedLead.id}/follow-ups`, followUpForm),
            {
                pending: 'Logging activity...',
                success: {
                    render() {
                        setIsFollowUpModalOpen(false);
                        setFollowUpForm({ content: "", scheduledAt: "", status: "" });
                        fetchLeads(currentPage);
                        return "Follow-up added successfully";
                    }
                },
                error: {
                    render({ data }: any) {
                        return data?.response?.data?.error || "Failed to add follow-up";
                    }
                }
            }
        ).finally(() => setIsSubmitting(false));
    };

    const openDetails = async (lead: any) => {
        setIsFetchingDetails(true);
        try {
            const res = await client.get(`/v1/leads/${lead.id}`);
            setSelectedLead(res.data);
            setIsDetailsModalOpen(true);
        } catch (err) {
            toast.error("Failed to fetch lead details");
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const openEdit = (lead: any) => {
        setSelectedLead(lead);
        setLeadForm({
            name: lead.name,
            schoolName: lead.schoolName,
            address: lead.address || "",
            phone: lead.phone,
            email: lead.email || "",
            source: lead.source || "",
            status: lead.status
        });
        setIsEditModalOpen(true);
    };

    const statusColors: any = {
        NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        CONTACTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        DEMO_SCHEDULED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        NEGOTIATION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        CONVERTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        LOST: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };

    return (
        <>
            <Head>
                <title>Leads Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Track and manage your sales pipeline and school outreach.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Add New Lead
                        </button>
                    </div>

                    {/* Stats Row */}

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
                                {status.replace('_', ' ')} ({stats[status] || 0})
                            </button>
                        ))}
                    </div>

                    {/* Filters & Search - Updated to be more compact */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, school, phone, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Leads Info</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">School</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Action</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <Loader size="md" />
                                            </td>
                                        </tr>
                                    ) : leads.length > 0 ? (
                                        leads.map((lead: any) => (
                                            <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 cursor-pointer" onClick={() => !isFetchingDetails && openDetails(lead)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-sm">
                                                            {isFetchingDetails && selectedLead?.id === lead.id ? (
                                                                <Loader size="sm" variant="white" />
                                                            ) : (
                                                                lead.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-tight">{lead.name}</div>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400"><Phone className="h-2.5 w-2.5" /> {lead.phone}</span>
                                                                {lead.email && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400"><Mail className="h-2.5 w-2.5" /> {lead.email}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{lead.schoolName}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-widest">{lead.source || 'Direct'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isUpdatingStatusId === lead.id ? (
                                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 animate-pulse">
                                                            <Loader size="sm" variant="white" /> Updating...
                                                        </div>
                                                    ) : (
                                                        <span className={cn(
                                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                                            statusColors[lead.status]
                                                        )}>
                                                            {lead.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(lead.updatedAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(lead)}
                                                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-all"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLead(lead.id)}
                                                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-rose-600 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDetails(lead)}
                                                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-all"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                No leads found. Start by adding a new prospect!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{leads.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalCount}</span> leads
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchLeads(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-white dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center px-4 text-xs font-bold text-gray-500">
                                    Page {currentPage} of {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => fetchLeads(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-white dark:hover:bg-white/5 transition-all text-gray-600 dark:text-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals Implementation */}
                {/* Add / Edit Lead Modal */}
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {isAddModalOpen ? "Add New Lead" : "Edit Lead Info"}
                                </h3>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-500 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={isAddModalOpen ? handleAddLead : handleUpdateLead} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            required
                                            value={leadForm.name}
                                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                            placeholder="Contact person name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            required
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Name</label>
                                    <input
                                        required
                                        value={leadForm.schoolName}
                                        onChange={(e) => setLeadForm({ ...leadForm, schoolName: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                        placeholder="Enter school or organization name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={leadForm.email}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Address</label>
                                    <textarea
                                        value={leadForm.address}
                                        onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm min-h-20 resize-none"
                                        placeholder="Full address of the school..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Status</label>
                                    <select
                                        value={leadForm.status}
                                        onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                    >
                                        <option value="NEW">New</option>
                                        <option value="CONTACTED">Contacted</option>
                                        <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                                        <option value="NEGOTIATION">Negotiation</option>
                                        <option value="CONVERTED">Converted</option>
                                        <option value="LOST">Lost</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source (Optional)</label>
                                    <input
                                        value={leadForm.source}
                                        onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                        placeholder="e.g. LinkedIn, Referral, Advertisement"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all border-b-2 border-indigo-800 active:border-b-0 active:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader size="lg" />
                                                Processing...
                                            </>
                                        ) : (
                                            isAddModalOpen ? "Create Lead" : "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Details / Operations Modal */}
                {isDetailsModalOpen && selectedLead && (
                    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom duration-300">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedLead.schoolName}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">Lead ID: {selectedLead.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-50 dark:bg-white/5 p-1.5 rounded-full">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                                <div className="p-6 space-y-8">
                                    {/* Action Header */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => { setIsDetailsModalOpen(false); setIsDemoModalOpen(true); }}
                                            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <Calendar className="h-3.5 w-3.5" /> Schedule Demo
                                        </button>
                                        <button
                                            onClick={() => { setIsDetailsModalOpen(false); setIsFollowUpModalOpen(true); }}
                                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" /> Log Follow-up
                                        </button>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Contact Person */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                                                <Users className="h-3 w-3" /> Contact Person
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{selectedLead.name.charAt(0)}</div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{selectedLead.name}</div>
                                                        <div className="text-xs text-gray-500">{selectedLead.source || 'Direct Source'}</div>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Phone className="h-3.5 w-3.5 text-indigo-500" /> {selectedLead.phone}</div>
                                                    {selectedLead.email && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Mail className="h-3.5 w-3.5 text-indigo-500" /> {selectedLead.email}</div>}
                                                    {selectedLead.address && <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><Building2 className="h-3.5 w-3.5 text-indigo-500 mt-1" /> {selectedLead.address}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Current Status */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                                                <Layers className="h-3 w-3" /> Sales Status
                                            </div>
                                            <div className="space-y-3">
                                                <select
                                                    value={selectedLead.status}
                                                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                                                    className={cn(
                                                        "w-full px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border-0 ring-1 ring-gray-200 dark:ring-white/10",
                                                        statusColors[selectedLead.status]
                                                    )}
                                                >
                                                    <option value="NEW">New</option>
                                                    <option value="CONTACTED">Contacted</option>
                                                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                                                    <option value="NEGOTIATION">Negotiation</option>
                                                    <option value="CONVERTED">Converted</option>
                                                    <option value="LOST">Lost</option>
                                                </select>
                                                <div className="text-xs text-gray-500 italic">Created on {new Date(selectedLead.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Secitons */}
                                    <div className="space-y-6 pt-4">
                                        {/* Demos */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
                                                <Calendar className="h-4 w-4 text-indigo-500" /> Demo History
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedLead.demos?.length > 0 ? (
                                                    selectedLead.demos.map((demo: any) => (
                                                        <div key={demo.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between">
                                                            <div>
                                                                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                                    {new Date(demo.scheduledAt).toLocaleString()}
                                                                </div>
                                                                <div className="text-[10px] text-gray-500 mt-0.5">{demo.notes || "No notes provided"}</div>
                                                                {demo.meetingLink && (
                                                                    <div className="mt-2">
                                                                        <a
                                                                            href={demo.meetingLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                        >
                                                                            <ExternalLink className="h-2.5 w-2.5" /> Launch Meeting
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                                                                demo.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                                                                {demo.status}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic px-2">No demos scheduled yet.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Follow-ups */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
                                                <MessageSquare className="h-4 w-4 text-emerald-500" /> Recent Follow-ups
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedLead.followUps?.length > 0 ? (
                                                    selectedLead.followUps.map((fu: any) => (
                                                        <div key={fu.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                                                                    {new Date(fu.scheduledAt || fu.createdAt).toLocaleDateString()}
                                                                </div>
                                                                {fu.isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-300">{fu.content}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic px-2">No follow-ups logged yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Demo Modal */}
                {isDemoModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Product Demo</h3>
                                <button onClick={() => setIsDemoModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleScheduleDemo} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={demoForm.scheduledAt}
                                        onChange={(e) => setDemoForm({ ...demoForm, scheduledAt: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={demoForm.meetingLink}
                                        onChange={(e) => setDemoForm({ ...demoForm, meetingLink: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm"
                                        placeholder="Zoom, Google Meet, or Teams link..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Presentation Notes</label>
                                    <textarea
                                        value={demoForm.notes}
                                        onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm min-h-24 resize-none"
                                        placeholder="Any specific points to cover or client requirements?"
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
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Confirm Schedule"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Follow-up Modal */}
                {isFollowUpModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log New Activity</h3>
                                <button onClick={() => setIsFollowUpModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddFollowUp} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={followUpForm.scheduledAt}
                                        onChange={(e) => setFollowUpForm({ ...followUpForm, scheduledAt: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Lead Status</label>
                                    <select
                                        value={followUpForm.status}
                                        onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm"
                                    >
                                        <option value="">No Change</option>
                                        <option value="NEW">New</option>
                                        <option value="CONTACTED">Contacted</option>
                                        <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                                        <option value="NEGOTIATION">Negotiation</option>
                                        <option value="CONVERTED">Converted</option>
                                        <option value="LOST">Lost</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Details</label>
                                    <textarea
                                        required
                                        value={followUpForm.content}
                                        onChange={(e) => setFollowUpForm({ ...followUpForm, content: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm min-h-24 resize-none"
                                        placeholder="What happened? e.g. 'Called client, they are interested in fees module...'"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size="sm" variant="white" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Finalize Activity"
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
