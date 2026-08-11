import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { Search, Filter, MoreVertical, Edit2, Trash2, Eye, CheckCircle, AlertCircle, Clock, XCircle, UserPlus, ChevronDown, RefreshCw, Settings, Inbox, Paperclip, Download, File, Activity } from 'lucide-react';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import { toast } from 'react-toastify';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Ticket as TicketIcon, Save, X } from 'lucide-react';
import { Loader } from '@/components/ui/feedback/Loader';


// Types
interface User {
    name: string;
    email: string;
    profilePic: string | null;
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
    fileSize?: number;
    mimeType?: string;
    uploadedAt?: string;
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
    school?: string | { name: string };
    School?: { name: string; id?: string } | null; // School relation object
    schoolId?: string | null; // School ID reference
    attachments?: Attachment[];
    ticket_attachment?: string[] | null; // Array of Cloudinary URLs stored in DB
    attachment?: string | string[] | null; // JSON string or array of Cloudinary URLs stored in DB
}

interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    cancelled: number;
    unassigned: number;
}

export default function SupportTicketsPage() {
    const router = useRouter();
    const { get, put, patch, post } = useApi();

    // State
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);

    // Assignment Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Status Update State
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    // Detail View Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicketDetail, setSelectedTicketDetail] = useState<Ticket | null>(null);
    const [ticketAttachments, setTicketAttachments] = useState<Attachment[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);

    // Create Ticket Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: "",
        description: "",
        category: "General",
        priority: "LOW",
        employeeId: ""
    });
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        category: "General",
        priority: "LOW",
        employeeId: ""
    });
    const [editLoading, setEditLoading] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    useEffect(() => {
        fetchData();
    }, [page, search, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // For ASSIGNED/UNASSIGNED filters, fetch all tickets and filter client-side
            // NOTE: The backend handles filters, but the user specifically asked for global summary counts
            // regardless of the current page results.
            const response = await get(`/v1/superadmin/tickets?page=${page}&search=${search}&status=${statusFilter}`);

            setTickets(response?.data || []);
            setPagination(response?.pagination || null);

            if (response?.summaryCounts) {
                setStats({
                    total: response.summaryCounts.all || 0,
                    open: response.summaryCounts.open || 0,
                    inProgress: response.summaryCounts.inProgress || 0,
                    resolved: response.summaryCounts.resolved || 0,
                    closed: response.summaryCounts.closed || 0,
                    cancelled: response.summaryCounts.cancelled || 0,
                    unassigned: response.summaryCounts.unassigned || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load tickets');
            setStats(null);
            setTickets([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await get('/v1/superadmin/employees?limit=100&status=ACTIVE');
            setEmployees(res.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees list');
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', newTicket.title);
            formData.append('description', newTicket.description);
            formData.append('category', newTicket.category);
            formData.append('priority', newTicket.priority);
            if (newTicket.employeeId) {
                formData.append('employeeId', newTicket.employeeId);
            }
            if (attachment) {
                formData.append('attachment', attachment);
            }

            // useApi post doesn't support FormData directly with headers easily if it's JSON by default
            const response = await fetch('/api/v1/superadmin/tickets', {
                method: 'POST',
                body: formData,
                headers: {
                    // Get token if needed, or assume current session handles it (NextAuth/custom)
                    // The useApi hook likely handles authentication.
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create ticket');
            }

            toast.success('Ticket created successfully');
            setIsCreateModalOpen(false);
            setNewTicket({
                title: "",
                description: "",
                category: "General",
                priority: "LOW",
                employeeId: ""
            });
            setAttachment(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create ticket');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleAssignClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setSelectedEmployeeId(ticket.employeeId || '');
        if (employees.length === 0) fetchEmployees();
        setIsAssignModalOpen(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedTicket) return;
        setAssignLoading(true);
        try {
            await put(`/v1/superadmin/tickets/${selectedTicket.id}`, {
                employeeId: selectedEmployeeId || null
            });
            toast.success('Ticket assigned successfully');
            setIsAssignModalOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Failed to assign ticket');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
        setUpdatingStatusId(ticketId);
        try {
            await put(`/v1/superadmin/tickets/${ticketId}`, { status: newStatus });
            toast.success(`Ticket marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatusId(null);
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
        // Extract attachments from ticket_attachment field (array of URLs)
        extractAttachmentsFromTicket(ticket);
    };

    const extractAttachmentsFromTicket = (ticket: Ticket) => {
        setLoadingAttachments(true);
        try {
            // Try multiple possible field names and formats
            let attachmentUrls: string[] = [];
            const ticketAny = ticket as any;

            // Check 'attachment' field (as seen in console logs - JSON string)
            if (ticketAny.attachment) {
                if (Array.isArray(ticketAny.attachment)) {
                    // Already an array
                    attachmentUrls = ticketAny.attachment;
                } else if (typeof ticketAny.attachment === 'string') {
                    // Parse JSON string to array
                    try {
                        const parsed = JSON.parse(ticketAny.attachment);
                        attachmentUrls = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        // If not JSON, might be a single URL
                        attachmentUrls = ticketAny.attachment.trim() ? [ticketAny.attachment] : [];
                    }
                }
            }

            // Check ticket_attachment (snake_case) - fallback
            if (!attachmentUrls.length && ticket.ticket_attachment) {
                const ticketAttachmentValue: string | string[] | null = ticket.ticket_attachment;
                if (Array.isArray(ticketAttachmentValue)) {
                    attachmentUrls = ticketAttachmentValue;
                } else if (typeof ticketAttachmentValue === 'string') {
                    const ticketAttachmentStr: string = ticketAttachmentValue;
                    try {
                        const parsed = JSON.parse(ticketAttachmentStr);
                        attachmentUrls = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        // If not JSON, treat as single URL
                        if (ticketAttachmentStr && ticketAttachmentStr.trim()) {
                            attachmentUrls = [ticketAttachmentStr];
                        }
                    }
                }
            }

            // Check ticketAttachment (camelCase) - fallback
            if (!attachmentUrls.length && ticketAny.ticketAttachment) {
                if (Array.isArray(ticketAny.ticketAttachment)) {
                    attachmentUrls = ticketAny.ticketAttachment;
                } else if (typeof ticketAny.ticketAttachment === 'string') {
                    try {
                        const parsed = JSON.parse(ticketAny.ticketAttachment);
                        attachmentUrls = Array.isArray(parsed) ? parsed : [ticketAny.ticketAttachment];
                    } catch {
                        attachmentUrls = ticketAny.ticketAttachment.trim() ? [ticketAny.ticketAttachment] : [];
                    }
                }
            }

            console.log('Extracted attachment URLs:', attachmentUrls);

            // Convert URLs to Attachment format
            const attachments: Attachment[] = attachmentUrls
                .filter((url): url is string => typeof url === 'string' && url.trim() !== '' && url !== 'null' && url !== 'NULL')
                .map((url, index) => {
                    // Extract filename from Cloudinary URL or use a generic name
                    const fileName = extractFileNameFromUrl(url) || `Attachment ${index + 1}`;
                    return {
                        id: `attachment-${index}`,
                        fileName: fileName,
                        fileUrl: url,
                    };
                });

            console.log('Processed attachments:', attachments);
            setTicketAttachments(attachments);
        } catch (error) {
            console.error('Error extracting attachments:', error);
            setTicketAttachments([]);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const extractFileNameFromUrl = (url: string): string => {
        try {
            // Extract filename from Cloudinary URL
            // Format: https://res.cloudinary.com/.../v1234567890/ticket_attachments/filename
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            // Remove query parameters if any
            const cleanFileName = fileName.split('?')[0];

            // Decode URL-encoded characters
            return decodeURIComponent(cleanFileName);
        } catch (error) {
            return 'Attachment';
        }
    };

    const isImageFile = (url: string): boolean => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const lowerUrl = url.toLowerCase();
        return imageExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('image/upload');
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleEditClick = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setEditFormData({
            title: ticket.title,
            description: ticket.description,
            category: ticket.category || "General",
            priority: ticket.priority,
            employeeId: ticket.employeeId || ""
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTicket) return;
        setEditLoading(true);
        try {
            await put(`/v1/superadmin/tickets/${editingTicket.id}`, {
                title: editFormData.title,
                description: editFormData.description,
                category: editFormData.category,
                priority: editFormData.priority,
            });
            toast.success('Ticket updated successfully');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update ticket');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteClick = (ticketId: string) => {
        setDeletingTicketId(ticketId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTicketId) return;
        setDeleteLoading(true);
        try {
            // Delete request using custom fetch since useApi might not have delete method exposed similarly or to ensure it works
            const response = await fetch(`/api/v1/superadmin/tickets/${deletingTicketId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete ticket');
            }

            toast.success('Ticket deleted successfully');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to delete ticket');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Support Tickets - LearnXChain</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage and assign support tickets</p>
                    </div>
                    {/* <button
                        onClick={fetchData}
                        className="self-start sm:self-auto p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={clsx("h-5 w-5", loading && "animate-spin")} />
                    </button> */}
                    <button
                        onClick={() => {
                            if (employees.length === 0) fetchEmployees();
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Create Ticket
                    </button>
                </div>


                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        { label: 'All Tickets', value: stats?.total || 0, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10', icon: <Clock className="h-5 w-5" /> },
                        { label: 'Open', value: stats?.open || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: <AlertCircle className="h-5 w-5" /> },
                        { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10', icon: <Activity className="h-5 w-5" /> },
                        { label: 'Resolved / Closed', value: (stats?.resolved || 0) + (stats?.closed || 0), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10', icon: <CheckCircle className="h-5 w-5" /> },
                        { label: 'Unassigned', value: stats?.unassigned || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10', icon: <UserPlus className="h-5 w-5" /> },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <div className={clsx("rounded-lg p-2", stat.bg, stat.color)}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 dark:border-white/10">
                    {[
                        { value: 'ALL', label: 'All', count: stats?.total },
                        { value: 'OPEN', label: 'Open', count: stats?.open },
                        { value: 'IN_PROGRESS', label: 'In Progress', count: stats?.inProgress },
                        { value: 'RESOLVED', label: 'Resolved', count: stats?.resolved },
                        { value: 'CLOSED', label: 'Closed', count: stats?.closed },
                        { value: 'CANCELLED', label: 'Cancelled', count: stats?.cancelled },
                        { value: 'UNASSIGNED', label: 'Unassigned', count: stats?.unassigned },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setStatusFilter(tab.value);
                                setPage(1); // Reset to first page when changing filter
                            }}
                            className={clsx(
                                "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2",
                                statusFilter === tab.value
                                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    statusFilter === tab.value
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tickets Table */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader size="lg" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                                <Inbox className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">No data</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No tickets found matching your criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-4">Ticket #</th>
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Priority</th>
                                            <th className="px-6 py-4">Assigned To</th>
                                            <th className="px-6 py-4">School</th>
                                            <th className="px-6 py-4">Created</th>
                                            <th className="px-6 py-4">Quick Assign</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-900">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    #{ticket.ticketNumber}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">{ticket.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{ticket.description}</p>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {ticket.category || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <select
                                                        value={ticket.status}
                                                        onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                                        className={clsx(
                                                            "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer outline-none bg-transparent appearance-none hover:opacity-80 transition-opacity",
                                                            getStatusColor(ticket.status)
                                                        )}
                                                        disabled={updatingStatusId === ticket.id}
                                                    >
                                                        <option value="OPEN" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Open</option>
                                                        <option value="IN_PROGRESS" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">In Progress</option>
                                                        <option value="RESOLVED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Resolved</option>
                                                        <option value="CLOSED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Closed</option>
                                                        <option value="CANCELLED" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={clsx("font-semibold", getPriorityColor(ticket.priority))}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {ticket.employee ? (
                                                        <div className="flex items-center gap-2">
                                                            {ticket.employee.user.profilePic ? (
                                                                <img
                                                                    src={ticket.employee.user.profilePic}
                                                                    className="h-6 w-6 rounded-full"
                                                                    alt={ticket.employee.user.name}
                                                                />
                                                            ) : (
                                                                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold dark:bg-indigo-900/20 dark:text-indigo-400">
                                                                    {ticket.employee.user.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {ticket.employee.user.name.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {(() => {
                                                            const ticketAny = ticket as any;
                                                            // Check multiple possible fields for school name
                                                            if (ticketAny.School?.name) {
                                                                return ticketAny.School.name;
                                                            }
                                                            if (typeof ticket.school === 'string') {
                                                                return ticket.school;
                                                            }
                                                            if (ticket.school?.name) {
                                                                return ticket.school.name;
                                                            }
                                                            // If no school name found, show N/A
                                                            return 'N/A';
                                                        })()}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <button
                                                        onClick={() => handleAssignClick(ticket)}
                                                        className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                                        title="Quick assign"
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                        {ticket.employee ? 'Reassign' : 'Assign'}
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleTicketClick(ticket)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                                                            title="View details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(ticket)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-white/5 dark:hover:text-blue-400"
                                                            title="Edit Ticket"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(ticket.id)}
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                                                            title="Delete Ticket"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                                            title="More options"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {pagination && pagination.total > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-gray-900 sm:px-6 gap-4">
                                    <div className="text-sm text-gray-700 dark:text-gray-400">
                                        Showing <span className="font-semibold text-gray-900 dark:text-white">{Math.min((page - 1) * pagination.limit + 1, pagination.total)}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> tickets
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        {(() => {
                                            const totalPages = pagination.pages;
                                            const pages = [];
                                            const showEllipsis = totalPages > 7;

                                            if (showEllipsis) {
                                                if (page <= 4) {
                                                    for (let i = 1; i <= 5; i++) pages.push(i);
                                                    pages.push('...');
                                                    pages.push(totalPages);
                                                } else if (page >= totalPages - 3) {
                                                    pages.push(1);
                                                    pages.push('...');
                                                    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                                                } else {
                                                    pages.push(1);
                                                    pages.push('...');
                                                    for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                                                    pages.push('...');
                                                    pages.push(totalPages);
                                                }
                                            } else {
                                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                                            }

                                            return pages.map((p, idx) => (
                                                p === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p as number)}
                                                        className={clsx(
                                                            "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
                                                            page === p
                                                                ? "bg-indigo-600 text-white shadow-sm"
                                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            ));
                                        })()}

                                        <button
                                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                            disabled={page === pagination.pages}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Create Ticket Modal - Updated Design */}
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
                                <form onSubmit={handleCreateSubmit} className="p-8">
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
                                                value={newTicket.title}
                                                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                placeholder="Brief summary of the issue"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                                placeholder="Provide more details..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                                <select
                                                    value={newTicket.category}
                                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Technical">Technical</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="Bug">Bug Report</option>
                                                    <option value="Support">Support</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                                <select
                                                    value={newTicket.priority}
                                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Assign to Employee (Optional)</label>
                                            <select
                                                value={newTicket.employeeId}
                                                onChange={(e) => setNewTicket({ ...newTicket, employeeId: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.user.name} ({emp.employeeType})
                                                    </option>
                                                ))}
                                            </select>
                                        </div> */}

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Attachment</label>
                                            <div className="relative group">
                                                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm flex items-center justify-between cursor-pointer">
                                                    <span className={clsx("truncate pr-4", attachment ? "text-gray-900 dark:text-white" : "text-gray-500")}>
                                                        {attachment ? attachment.name : "Choose a file..."}
                                                    </span>
                                                    <Paperclip className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    title={attachment ? attachment.name : "Choose a file..."}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader size="sm" variant="white" /> : <Save className="h-5 w-5" />}
                                            Create Ticket
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Ticket Modal */}
                <AnimatePresence>
                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <form onSubmit={handleEditSubmit} className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                                                <Edit2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Ticket</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
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
                                                value={editFormData.title}
                                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                placeholder="Brief summary of the issue"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={editFormData.description}
                                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                                placeholder="Provide more details..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                                <select
                                                    value={editFormData.category}
                                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Technical">Technical</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="Bug">Bug Report</option>
                                                    <option value="Support">Support</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                                                <select
                                                    value={editFormData.priority}
                                                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editLoading}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {editLoading ? (
                                                <>
                                                    <Loader size="sm" variant="white" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden p-6"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                        <Trash2 className="h-8 w-8 text-red-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Delete Ticket</h3>
                                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                        Are you sure you want to delete this ticket? This action cannot be undone.
                                    </p>
                                    <div className="flex w-full gap-3">
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            disabled={deleteLoading}
                                            className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-all"
                                        >
                                            {deleteLoading ? <Loader size="sm" variant="white" /> : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>


            {/* Assignment Modal */}
            <Transition appear show={isAssignModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsAssignModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-900">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        Assign Ticket #{selectedTicket?.ticketNumber}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            Select an employee to assign this ticket to.
                                        </p>

                                        <select
                                            className="w-full rounded-md border border-gray-300 p-2 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.user.name} ({emp.employeeType})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                            onClick={() => setIsAssignModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
                                            onClick={handleAssignSubmit}
                                            disabled={assignLoading}
                                        >
                                            {assignLoading ? <Loader size="sm" variant="white" /> : 'Assign'}
                                        </button>
                                    </div>
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
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-900">
                                    {selectedTicketDetail && (
                                        <>
                                            <div className="flex items-start justify-between mb-4">
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-xl font-semibold leading-6 text-gray-900 dark:text-white"
                                                >
                                                    Ticket #{selectedTicketDetail.ticketNumber}
                                                </Dialog.Title>
                                                <button
                                                    onClick={() => {
                                                        setIsDetailModalOpen(false);
                                                        setTicketAttachments([]);
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Header Info */}
                                                <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
                                                    <select
                                                        value={selectedTicketDetail.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            handleStatusUpdate(selectedTicketDetail.id, newStatus);
                                                            setSelectedTicketDetail({ ...selectedTicketDetail, status: newStatus as any });
                                                        }}
                                                        className={clsx(
                                                            "rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset cursor-pointer outline-none bg-transparent appearance-none hover:opacity-80 transition-opacity",
                                                            getStatusColor(selectedTicketDetail.status)
                                                        )}
                                                        disabled={updatingStatusId === selectedTicketDetail.id}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="OPEN">Open</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="RESOLVED">Resolved</option>
                                                        <option value="CLOSED">Closed</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                    {updatingStatusId === selectedTicketDetail.id && (
                                                        <Loader size="sm" />
                                                    )}
                                                    <span className={clsx("text-sm font-semibold", getPriorityColor(selectedTicketDetail.priority))}>
                                                        {selectedTicketDetail.priority} Priority
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Created {new Date(selectedTicketDetail.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</h4>
                                                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                        {selectedTicketDetail.title}
                                                    </p>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-800/50">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                            {selectedTicketDetail.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Ticket Details Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Reporter */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reporter</h4>
                                                        <div className="flex items-center gap-2">
                                                            {selectedTicketDetail.User.profilePic ? (
                                                                <img
                                                                    src={selectedTicketDetail.User.profilePic}
                                                                    className="h-8 w-8 rounded-full"
                                                                    alt={selectedTicketDetail.User.name}
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold dark:bg-indigo-900/20 dark:text-indigo-400">
                                                                    {selectedTicketDetail.User.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {selectedTicketDetail.User.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {selectedTicketDetail.User.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Assignee */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assignee</h4>
                                                        {selectedTicketDetail.employee ? (
                                                            <div
                                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors w-fit"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAssignClick(selectedTicketDetail);
                                                                }}
                                                                title="Click to reassign"
                                                            >
                                                                {selectedTicketDetail.employee.user.profilePic ? (
                                                                    <img
                                                                        src={selectedTicketDetail.employee.user.profilePic}
                                                                        className="h-8 w-8 rounded-full"
                                                                        alt={selectedTicketDetail.employee.user.name}
                                                                    />
                                                                ) : (
                                                                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold dark:bg-indigo-900/20 dark:text-indigo-400">
                                                                        {selectedTicketDetail.employee.user.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {selectedTicketDetail.employee.user.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {selectedTicketDetail.employee.employeeType}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAssignClick(selectedTicketDetail);
                                                                }}
                                                                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                                            >
                                                                <UserPlus className="h-4 w-4" />
                                                                Assign Ticket
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Attachments */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <Paperclip className="h-4 w-4" />
                                                    Attachments
                                                </h4>
                                                {loadingAttachments ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
                                                        <Loader size="sm" />
                                                        Loading attachments...
                                                    </div>
                                                ) : ticketAttachments && ticketAttachments.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {ticketAttachments.map((attachment) => {
                                                            const isImage = isImageFile(attachment.fileUrl);
                                                            return (
                                                                <div
                                                                    key={attachment.id}
                                                                    className="rounded-lg border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-gray-800/50"
                                                                >
                                                                    {/* Image Preview or File Icon */}
                                                                    {isImage ? (
                                                                        <div className="relative w-full bg-gray-100 dark:bg-gray-900">
                                                                            <img
                                                                                src={attachment.fileUrl}
                                                                                alt={attachment.fileName}
                                                                                className="w-full h-48 object-contain"
                                                                                onError={(e) => {
                                                                                    // Fallback to file icon if image fails to load
                                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                                    const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.image-fallback');
                                                                                    if (fallback) fallback.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                            <div className="image-fallback absolute inset-0 hidden items-center justify-center bg-gray-100 dark:bg-gray-900">
                                                                                <File className="h-12 w-12 text-gray-400" />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900">
                                                                            <File className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                                        </div>
                                                                    )}

                                                                    {/* File Info and Actions */}
                                                                    <div className="flex items-center gap-3 p-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                                {attachment.fileName}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                                                {attachment.fileUrl}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <a
                                                                                href={attachment.fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                                                                                title="Open in new tab"
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </a>
                                                                            <a
                                                                                href={attachment.fileUrl}
                                                                                download={attachment.fileName}
                                                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                                                                                title="Download"
                                                                            >
                                                                                <Download className="h-4 w-4" />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No attachments found</p>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center rounded-lg border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                                    onClick={() => setIsDetailModalOpen(false)}
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
