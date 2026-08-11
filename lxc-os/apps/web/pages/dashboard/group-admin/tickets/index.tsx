import { useState, useEffect, Fragment } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { Search, Filter, MoreVertical, Eye, CheckCircle, AlertCircle, Clock, XCircle, RefreshCw, Inbox, Paperclip, Download, File, Plus, Phone, Mail, Building2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import { Loader } from '@/components/ui/feedback/Loader';

// Types
interface User {
    name: string;
    email: string;
    profilePic: string | null;
    phone?: string;
}

interface Employee {
    id: string;
    user: User;
    employeeType: string;
}

interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
}

interface Ticket {
    id: string;
    ticketNumber: number;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    User: User;
    employeeId: string | null;
    employee: Employee | null;
    category?: string;
    attachment?: string | string[] | null;
    School?: {
        schoolName: string;
    };
}

interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

export default function GroupSupportTicketsPage() {
    const router = useRouter();
    const { get: getStats } = useApi();
    const { get, post } = useApi();

    // State
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'Technical Issue',
        priority: 'LOW'
    });

    // Detail View Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicketDetail, setSelectedTicketDetail] = useState<Ticket | null>(null);
    const [ticketAttachments, setTicketAttachments] = useState<Attachment[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, search, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, ticketsRes] = await Promise.all([
                getStats('/v1/group-admin/tickets/stats', { autoToast: false }).catch(() => null),
                get(`/v1/group-admin/tickets?page=${page}&search=${search}&status=${statusFilter}`)
            ]);

            setTickets(ticketsRes?.data || []);
            setPagination(ticketsRes?.pagination || null);
            setStats(statsRes);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', newTicket.title);
            formData.append('description', newTicket.description);
            formData.append('category', newTicket.category);
            formData.append('priority', newTicket.priority);

            files.forEach(file => {
                formData.append('attachments', file);
            });

            await post('/v1/group-admin/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Ticket created successfully');
            setIsCreateModalOpen(false);
            setNewTicket({
                title: '',
                description: '',
                category: 'Technical Issue',
                priority: 'LOW'
            });
            setFiles([]);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create ticket');
        } finally {
            setCreateLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            OPEN: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/20',
            IN_PROGRESS: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/10 dark:text-yellow-400 dark:ring-yellow-400/20',
            RESOLVED: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-400/20',
            CLOSED: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900/10 dark:text-gray-400 dark:ring-gray-400/20',
            CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-400/20',
        };
        return colors[status] || colors.OPEN;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            LOW: 'text-gray-600 dark:text-gray-400',
            MEDIUM: 'text-yellow-600 dark:text-yellow-400',
            HIGH: 'text-orange-600 dark:text-orange-400',
            URGENT: 'text-red-600 dark:text-red-400',
        };
        return colors[priority] || colors.LOW;
    };

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicketDetail(ticket);
        setIsDetailModalOpen(true);
        extractAttachments(ticket);
    };

    const extractAttachments = (ticket: Ticket) => {
        setLoadingAttachments(true);
        try {
            let urls: string[] = [];
            if (typeof ticket.attachment === 'string') {
                try {
                    urls = JSON.parse(ticket.attachment);
                } catch {
                    urls = [ticket.attachment];
                }
            } else if (Array.isArray(ticket.attachment)) {
                urls = ticket.attachment;
            }

            const attachments = urls.filter(Boolean).map((url, i) => ({
                id: `att-${i}`,
                fileName: url.split('/').pop() || `Attachment ${i + 1}`,
                fileUrl: url
            }));
            setTicketAttachments(attachments);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAttachments(false);
        }
    };

    return (
        <DashboardLayout role="group_admin">
            <Head>
                <title>Support Tickets - LearnXChain Organization</title>
            </Head>

            <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Organization Support</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage support tickets for your entire organization</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 dark:bg-gray-900 dark:border-white/10 dark:text-gray-400 dark:hover:text-indigo-400 transition-all shadow-sm"
                            title="Refresh Data"
                            disabled={loading}
                        >
                            {loading ? <Loader size="sm" /> : <RefreshCw className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-2xl text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Ticket</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'All Tickets', value: stats?.total || 0, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10', icon: <Clock className="h-5 w-5" /> },
                        { label: 'Open', value: stats?.open || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: <AlertCircle className="h-5 w-5" /> },
                        { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10', icon: <Clock className="h-5 w-5 text-yellow-500" /> },
                        { label: 'Resolved', value: (stats?.resolved || 0) + (stats?.closed || 0), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10', icon: <CheckCircle className="h-5 w-5" /> },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={clsx("rounded-2xl p-3", stat.bg, stat.color)}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{loading ? '...' : stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { value: 'ALL', label: 'All' },
                            { value: 'OPEN', label: 'Open' },
                            { value: 'IN_PROGRESS', label: 'In Progress' },
                            { value: 'RESOLVED', label: 'Resolved' },
                            { value: 'CLOSED', label: 'Closed' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={clsx(
                                    "px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap",
                                    statusFilter === tab.value
                                        ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-800"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                )}
                            >
                                {tab.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader size="lg" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="mb-6 rounded-full bg-indigo-50 p-8 dark:bg-white/5">
                                <Inbox className="h-16 w-16 text-indigo-200 dark:text-indigo-400/20" />
                            </div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">No tickets yet</p>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Any issues from your branches or your own will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-xs font-black uppercase text-gray-500 dark:bg-white/5 dark:text-gray-400 border-b border-gray-100 dark:border-white/5">
                                    <tr>
                                        <th className="px-8 py-5">Info</th>
                                        <th className="px-8 py-5">Issue Details</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="whitespace-nowrap px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-indigo-600 dark:text-indigo-400">#{ticket.ticketNumber}</span>
                                                    {ticket.School ? (
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                                                            <Building2 className="h-2 w-2" />
                                                            {ticket.School.schoolName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-1">Org Admin</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="max-w-xs">
                                                    <p className="font-black text-gray-900 dark:text-white">{ticket.title}</p>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{ticket.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{ticket.category}</span>
                                                        <span className={clsx("text-[10px] font-black uppercase tracking-widest", getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-8 py-6">
                                                <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ring-1 ring-inset", getStatusColor(ticket.status))}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleTicketClick(ticket)}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-600 dark:hover:text-white shadow-sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            <Transition appear show={isCreateModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-900 border border-gray-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <Dialog.Title as="h3" className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                                Create Support Ticket
                                            </Dialog.Title>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Get assistance directly for your organization</p>
                                        </div>
                                        <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                            <XCircle className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Subject / Title</label>
                                                <input
                                                    required
                                                    value={newTicket.title}
                                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                    placeholder="Briefly describe the issue"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Category</label>
                                                <select
                                                    value={newTicket.category}
                                                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                >
                                                    <option>Technical Issue</option>
                                                    <option>Billing Question</option>
                                                    <option>Feature Request</option>
                                                    <option>Bug Report</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Priority</label>
                                                <select
                                                    value={newTicket.priority}
                                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Detailed Description</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={newTicket.description}
                                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                                                    placeholder="Provide details about the issue or request..."
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Attachments</label>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={e => setFiles(Array.from(e.target.files || []))}
                                                        className="hidden"
                                                        id="ticket-files"
                                                        accept="image/*,application/pdf"
                                                    />
                                                    <label htmlFor="ticket-files" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all">
                                                        <div className="text-center">
                                                            <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Upload proofs or screenshots</p>
                                                            <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Images or PDFs (Max 5)</p>
                                                        </div>
                                                    </label>
                                                </div>
                                                {files.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {files.map((file, i) => (
                                                            <div key={i} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                                                <File className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[150px]">{file.name}</span>
                                                                <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                                                                    <XCircle className="h-3.5 w-3.5 text-indigo-400 hover:text-indigo-600" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreateModalOpen(false)}
                                                className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createLoading}
                                                className="flex-[2] rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {createLoading ? <Loader size="sm" variant="white" /> : "Submit Ticket"}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Ticket Detail Modal */}
            <Transition appear show={isDetailModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-900 border border-gray-200 dark:border-white/10">
                                    {selectedTicketDetail && (
                                        <>
                                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                                                            Ticket #{selectedTicketDetail.ticketNumber}
                                                        </span>
                                                        <span className={clsx("text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest ring-1 ring-inset", getStatusColor(selectedTicketDetail.status))}>
                                                            {selectedTicketDetail.status}
                                                        </span>
                                                        {selectedTicketDetail.School && (
                                                            <span className="text-[10px] font-black italic text-gray-400">Branch Ticket: {selectedTicketDetail.School.schoolName}</span>
                                                        )}
                                                    </div>
                                                    <Dialog.Title as="h3" className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                                        {selectedTicketDetail.title}
                                                    </Dialog.Title>
                                                    <p className="text-sm font-bold text-gray-400 mt-2">
                                                        Created on {new Date(selectedTicketDetail.createdAt).toLocaleDateString('en-US', {
                                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                                    <XCircle className="h-6 w-6 text-gray-400" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                <div className="lg:col-span-2 space-y-8">
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Description</h4>
                                                        <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                                                                {selectedTicketDetail.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {ticketAttachments.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                                                <Paperclip className="h-3 w-3" />
                                                                Attachments ({ticketAttachments.length})
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {ticketAttachments.map((att) => (
                                                                    <div key={att.id} className="group relative rounded-2xl border border-gray-100 bg-white p-3 dark:border-white/5 dark:bg-white/5 flex items-center gap-3 transition-all hover:border-indigo-500/30">
                                                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center dark:bg-white/5">
                                                                            <File className="h-6 w-6 text-gray-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-black text-gray-900 dark:text-white truncate">{att.fileName}</p>
                                                                            <a href={att.fileUrl} target="_blank" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View Original</a>
                                                                        </div>
                                                                        <a href={att.fileUrl} download className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 dark:bg-white/10 transition-colors">
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-8">
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Handling Information</h4>
                                                        <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/5">
                                                            {selectedTicketDetail.employee ? (
                                                                <div className="space-y-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                                                                            {selectedTicketDetail.employee.user.profilePic ? (
                                                                                <img src={selectedTicketDetail.employee.user.profilePic} alt="" className="h-full w-full object-cover" />
                                                                            ) : selectedTicketDetail.employee.user.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{selectedTicketDetail.employee.user.name}</p>
                                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{selectedTicketDetail.employee.employeeType}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/5">
                                                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                                            <Mail className="h-4 w-4" />
                                                                            <span className="text-xs font-bold">{selectedTicketDetail.employee.user.email}</span>
                                                                        </div>
                                                                        {selectedTicketDetail.employee.user.phone && (
                                                                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                                                <Phone className="h-4 w-4" />
                                                                                <span className="text-xs font-bold">{selectedTicketDetail.employee.user.phone}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-4">
                                                                    <div className="h-12 w-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center dark:bg-white/5 mb-3">
                                                                        <Clock className="h-6 w-6 text-gray-300" />
                                                                    </div>
                                                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Awaiting Admin</p>
                                                                    <p className="text-[10px] font-medium text-gray-500 mt-1">Our support staff will review this shortly</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-600/20">
                                                        <h5 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Need direct help?</h5>
                                                        <p className="text-sm font-bold leading-relaxed mb-4">Our support team is available 24/7 for urgent matters.</p>
                                                        <button className="w-full py-3 rounded-2xl bg-white/20 font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all">
                                                            Call Support
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                                <button
                                                    onClick={() => setIsDetailModalOpen(false)}
                                                    className="px-8 py-3 rounded-2xl bg-gray-100 text-sm font-black text-gray-600 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </DashboardLayout>
    );
}
