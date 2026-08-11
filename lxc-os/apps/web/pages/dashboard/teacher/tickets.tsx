import { useState, useEffect, Fragment } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import client from '@/lib/api/client';
import { 
    Search, 
    Filter, 
    Eye, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    XCircle, 
    RefreshCw, 
    Inbox, 
    Plus, 
    LifeBuoy,
    ChevronLeft,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Loader } from '@/components/ui/feedback/Loader';
import { format } from 'date-fns';

// Types
interface Ticket {
    id: string;
    ticketNo?: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category: string;
    createdAt: string;
    assignedTo?: { name: string; role: string } | null;
}

export default function TeacherTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'TECHNICAL',
        priority: 'LOW'
    });

    // Detail Modal State
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await client.get('/v1/user/tickets');
            setTickets(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.title || !newTicket.description) {
            toast.error("Please fill all required fields");
            return;
        }

        setCreateLoading(true);
        try {
            await client.post('/v1/user/tickets', newTicket);
            toast.success('Ticket created successfully');
            setIsCreateModalOpen(false);
            setNewTicket({
                title: '',
                description: '',
                category: 'TECHNICAL',
                priority: 'LOW'
            });
            fetchTickets();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create ticket');
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400';
            case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400';
            case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'CLOSED': return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-800 dark:text-gray-400';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
    };

    return (
        <DashboardLayout role="teacher">
            <Head>
                <title>Support Tickets | Teacher Dashboard | LearnXChain</title>
            </Head>

            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher">
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-6 w-6 text-gray-500" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Support Tickets</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Need help? Raise a ticket and we'll assist you.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTickets}
                            className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 dark:bg-gray-900 dark:border-white/10 dark:text-gray-400 transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className={clsx("h-5 w-5", loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-sm font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Ticket</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 sm:grid-cols-3">
                    {[
                        { label: 'Total Tickets', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: LifeBuoy },
                        { label: 'Pending Action', value: stats.open, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Clock },
                        { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-gray-900 transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={clsx("rounded-2xl p-3", stat.bg, stat.color)}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{loading ? '...' : stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by subject or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest",
                                        statusFilter === s
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-white/10"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/20 dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader size="lg" />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                                <div className="mb-6 rounded-full bg-indigo-50 p-8 dark:bg-white/5">
                                    <Inbox className="h-12 w-12 text-indigo-200 dark:text-indigo-400/20" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">No tickets found</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs font-medium">Try adjusting your filters or create a new support request.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Subject & Description</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Created</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {filteredTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                        #{ticket.id.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="max-w-xs md:max-w-md">
                                                        <p className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{ticket.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{ticket.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
                                                        getStatusStyles(ticket.status)
                                                    )}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                                        <span className="text-[10px] font-bold text-gray-400">{format(new Date(ticket.createdAt), 'hh:mm a')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
                                                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all dark:bg-white/5"
                                                    >
                                                        <Eye className="h-5 w-5" />
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
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl transition-all dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                                <LifeBuoy className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                                    New Support Request
                                                </Dialog.Title>
                                                <p className="text-sm font-medium text-gray-500">We'll get back to you as soon as possible.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                            <XCircle className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject / Title</label>
                                            <input
                                                required
                                                value={newTicket.title}
                                                onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white"
                                                placeholder="What can we help you with?"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                                <select
                                                    value={newTicket.category}
                                                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-white/5 dark:bg-white/5 dark:text-white appearance-none"
                                                >
                                                    <option value="TECHNICAL">Technical Issue</option>
                                                    <option value="ACADEMIC">Academic Help</option>
                                                    <option value="BILLING">Billing/Fees</option>
                                                    <option value="FEEDBACK">Feedback</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority</label>
                                                <select
                                                    value={newTicket.priority}
                                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-white/5 dark:bg-white/5 dark:text-white appearance-none"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Description</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={newTicket.description}
                                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white resize-none"
                                                placeholder="Provide as much detail as possible so we can help you better..."
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreateModalOpen(false)}
                                                className="flex-1 rounded-2xl border border-gray-200 py-4 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-50 dark:border-white/5 dark:text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createLoading}
                                                className="flex-[2] rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {createLoading ? <Loader size="sm" variant="white" /> : <><Send className="h-4 w-4" /> Submit Request</>}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Detail Modal */}
            <Transition appear show={isDetailModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl transition-all dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                                    {selectedTicket && (
                                        <>
                                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg uppercase tracking-widest ring-1 ring-indigo-500/10">
                                                            Ticket #{selectedTicket.id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span className={clsx("text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ring-1 ring-inset", getStatusStyles(selectedTicket.status))}>
                                                            {selectedTicket.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <Dialog.Title as="h3" className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                                        {selectedTicket.title}
                                                    </Dialog.Title>
                                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                                                        Created on {format(new Date(selectedTicket.createdAt), 'MMMM d, yyyy · hh:mm a')}
                                                    </p>
                                                </div>
                                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                                    <XCircle className="h-6 w-6 text-gray-400" />
                                                </button>
                                            </div>

                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Problem Description</h4>
                                                    <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/5">
                                                        <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                                                            {selectedTicket.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status Tracking</h4>
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={clsx("h-2 w-2 rounded-full", 
                                                                    selectedTicket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                                                                )} />
                                                                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                                    {selectedTicket.status === 'OPEN' ? 'Waiting for Admin' : 
                                                                     selectedTicket.status === 'IN_PROGRESS' ? 'Being Reviewed' :
                                                                     selectedTicket.status === 'RESOLVED' ? 'Resolved successfully' : 'Ticket Closed'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Support</h4>
                                                        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px] dark:bg-indigo-950/30">
                                                                    {selectedTicket.assignedTo ? selectedTicket.assignedTo.name.charAt(0) : <ShieldCheck className="h-4 w-4" />}
                                                                </div>
                                                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                                                    {selectedTicket.assignedTo?.name || 'Pending Assignment'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600 shadow-sm">
                                                            <AlertCircle className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-indigo-900 dark:text-indigo-100 tracking-tight">Need urgent help?</p>
                                                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400 font-medium">Contact your school administrator directly.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                                <button
                                                    onClick={() => setIsDetailModalOpen(false)}
                                                    className="px-10 py-3.5 rounded-2xl bg-gray-900 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                                                >
                                                    Got it
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

function Send(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}
