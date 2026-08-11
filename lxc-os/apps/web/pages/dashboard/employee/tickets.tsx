
import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import {
    LifeBuoy,
    Search,
    Filter,
    Plus,
    MessageCircle,
    Clock,
    AlertCircle,
    CheckCircle2,
    Tag,
    X,
    User,
    Building2,

    ArrowRightCircle,
    RotateCcw,
    CheckCircle,
    Save,
    ExternalLink,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function TicketsPage() {
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [availableTickets, setAvailableTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'MY' | 'AVAILABLE' | 'RESOLVED' | 'CLOSED'>('MY');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        priority: 'LOW'
    });
    const [attachment, setAttachment] = useState<File | null>(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const [myRes, allRes] = await Promise.all([
                client.get("/v1/employee/tickets/all", { params: { myTickets: true } }),
                client.get("/v1/employee/tickets/all", { params: { skipAssigned: true } })
            ]);
            setMyTickets(myRes.data || []);
            setAvailableTickets(allRes.data || []);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [activeTab]);

    const handleAssignToMe = async (ticketId: string) => {
        try {
            setIsSubmitting(true);
            await client.post("/v1/employee/tickets/assign", { ticketId });
            toast.success("Ticket assigned to you");
            fetchTickets();
            setIsDetailsModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to assign ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        try {
            setIsSubmitting(true);
            await client.patch("/v1/employee/tickets", { ticketId, status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchTickets();
            const updated = { ...selectedTicket, status: newStatus };
            setSelectedTicket(updated);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('title', createFormData.title);
            formData.append('description', createFormData.description);
            formData.append('category', createFormData.category);
            formData.append('priority', createFormData.priority);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            await client.post("/v1/employee/tickets/create", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Ticket created successfully");
            setIsCreateModalOpen(false);
            setCreateFormData({ title: '', description: '', category: 'General', priority: 'LOW' });
            setAttachment(null);
            fetchTickets();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "text-white bg-red-600 shadow-sm shadow-red-200";
            case "HIGH": return "text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400";
            case "MEDIUM": return "text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400";
            default: return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
            case "IN_PROGRESS": return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
            case "RESOLVED": return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
            case "CLOSED": return "text-gray-600 bg-gray-50 dark:bg-gray-800/50";
            default: return "text-gray-500 bg-gray-50 dark:bg-gray-800/50";
        }
    };

    const ticketsToShow = activeTab === 'MY'
        ? myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
        : activeTab === 'RESOLVED'
            ? myTickets.filter(t => t.status === 'RESOLVED')
            : activeTab === 'CLOSED'
                ? myTickets.filter(t => t.status === 'CLOSED')
                : availableTickets;

    return (
        <>
            <Head>
                <title>Support Tickets - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage and resolve support issues assigned to you.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchTickets()}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Open New Ticket
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "My Active", value: myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length, color: "text-blue-600" },
                            { label: "Resolved", value: myTickets.filter(t => t.status === 'RESOLVED').length, color: "text-emerald-600" },
                            { label: "Closed", value: myTickets.filter(t => t.status === 'CLOSED').length, color: "text-gray-600" },
                            { label: "Available", value: availableTickets.length, color: "text-indigo-600" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                <div className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setActiveTab('MY')}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2",
                                activeTab === 'MY' ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            Assigned to Me ({myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('RESOLVED')}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2",
                                activeTab === 'RESOLVED' ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            Resolved ({myTickets.filter(t => t.status === 'RESOLVED').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('CLOSED')}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2",
                                activeTab === 'CLOSED' ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            Closed ({myTickets.filter(t => t.status === 'CLOSED').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('AVAILABLE')}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2",
                                activeTab === 'AVAILABLE' ? "text-indigo-600 border-indigo-600" : "text-gray-400 border-transparent hover:text-gray-600"
                            )}
                        >
                            Available Tickets ({availableTickets.length})
                        </button>
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ticket Details</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Priority</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Updated</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader size="sm" />
                                                Loading tickets...
                                            </div>
                                        </td></tr>
                                    ) : ticketsToShow.length > 0 ? (
                                        ticketsToShow.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors shadow-sm">
                                                            <Tag className="h-4 w-4 text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{ticket.title}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#MT-{ticket.ticketNumber}</span>
                                                                {ticket.User?.school?.schoolName && (
                                                                    <>
                                                                        <span className="h-0.5 w-0.5 rounded-full bg-gray-300"></span>
                                                                        <span className="text-[10px] text-indigo-500 font-bold">{ticket.User?.school?.schoolName}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", getPriorityColor(ticket.priority))}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide",
                                                        getStatusColor(ticket.status)
                                                    )}>
                                                        {ticket.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                                    {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
                                                    >
                                                        Details
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic">
                                            <div className="flex flex-col items-center gap-2">
                                                <LifeBuoy className="h-10 w-10 text-gray-200" />
                                                <p className="text-sm font-medium">No tickets found in this section.</p>
                                            </div>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Ticket Details Modal */}
                <AnimatePresence>
                    {isDetailsModalOpen && selectedTicket && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                            >
                                <div className="p-8">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                                                <Tag className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">#MT-{selectedTicket.ticketNumber}</span>
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", getPriorityColor(selectedTicket.priority))}>
                                                        {selectedTicket.priority}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{selectedTicket.title}</h2>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsDetailsModalOpen(false)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                                        >
                                            <X className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="mt-8 space-y-6">
                                        {/* Description */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-white/5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {selectedTicket.description}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requester Information</p>
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                                        <User className="h-4 w-4 text-indigo-500" />
                                                        {selectedTicket.User?.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                        {selectedTicket.User?.school?.schoolName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Meta</p>
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                                                        <Clock className="h-4 w-4 text-indigo-500" />
                                                        Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 underline underline-offset-4 decoration-indigo-200">
                                                        Category: {selectedTicket.category || 'General Support'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attachment */}
                                        {selectedTicket.attachment && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachment</p>
                                                <a
                                                    href={selectedTicket.attachment}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-sm font-bold hover:bg-indigo-100 transition-all group"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View Attachment
                                                </a>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                            {activeTab === 'AVAILABLE' ? (
                                                <button
                                                    onClick={() => handleAssignToMe(selectedTicket.id)}
                                                    disabled={isSubmitting}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-50"
                                                >
                                                    {isSubmitting ? <RotateCcw className="h-5 w-5 animate-spin" /> : <ArrowRightCircle className="h-5 w-5" />}
                                                    Assign to Myself & Start
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Update Progress</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { status: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'hover:bg-amber-600' },
                                                            { status: 'RESOLVED', label: 'Resolve', icon: CheckCircle2, color: 'hover:bg-emerald-600' },
                                                            // { status: 'CLOSED', label: 'Close', icon: MessageCircle, color: 'hover:bg-gray-700' },
                                                        ].map((action) => (
                                                            <button
                                                                key={action.status}
                                                                onClick={() => handleUpdateStatus(selectedTicket.id, action.status)}
                                                                disabled={isSubmitting || selectedTicket.status === action.status}
                                                                className={cn(
                                                                    "flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm",
                                                                    selectedTicket.status === action.status ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white dark:bg-gray-800 text-gray-500 hover:text-white " + action.color
                                                                )}
                                                            >
                                                                <action.icon className="h-5 w-5" />
                                                                {action.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Ticket Creation Modal */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <form onSubmit={handleCreateTicket} className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                                                <Plus className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Internal Ticket</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                                        >
                                            <X className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                                            <input
                                                required
                                                type="text"
                                                value={createFormData.title}
                                                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                placeholder="Brief summary of the issue"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={createFormData.description}
                                                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                                placeholder="Provide more details..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                                <select
                                                    value={createFormData.category}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Technical">Technical</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="Bug">Bug Report</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                                <select
                                                    value={createFormData.priority}
                                                    onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Attachment</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm file:hidden text-transparent cursor-pointer"
                                                />
                                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                                                    <LifeBuoy className="h-4 w-4" />
                                                </div>
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sm text-gray-500">
                                                    {attachment ? attachment.name : "Choose a file..."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? <RotateCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                            Create Ticket
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </>
    );
}
