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
    ShieldCheck,
    MessageSquare,
    Zap
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

export default function StudentTicketsPage() {
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
        category: 'ACADEMIC',
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
            toast.success('Ticket submitted successfully');
            setIsCreateModalOpen(false);
            setNewTicket({
                title: '',
                description: '',
                category: 'ACADEMIC',
                priority: 'LOW'
            });
            fetchTickets();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to submit ticket');
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

    return (
        <DashboardLayout role="student">
            <Head>
                <title>Support Tickets | Student Dashboard | LearnXChain</title>
            </Head>

            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Banner */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-md">
                                <LifeBuoy className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black mb-2 tracking-tight">Need some help?</h1>
                            <p className="text-indigo-50 text-lg opacity-80 font-medium">Raise a ticket for any academic or technical issues you're facing.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform shadow-xl active:scale-95"
                        >
                            <Plus className="h-6 w-6" />
                            Create New Ticket
                        </button>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Stats & Tips */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-indigo-600" />
                                Your Requests
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Total</span>
                                    <span className="font-black text-gray-900 dark:text-white">{tickets.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Open</span>
                                    <span className="font-black text-amber-600">{tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Resolved</span>
                                    <span className="font-black text-emerald-600">{tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                            <h4 className="text-indigo-900 dark:text-indigo-300 font-black mb-2 flex items-center gap-2 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                Quick Tip
                            </h4>
                            <p className="text-indigo-700 dark:text-indigo-400 text-xs leading-relaxed font-medium">
                                For faster resolution, please provide screenshots or clear details about the problem you are facing.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Ticket List */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your tickets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={fetchTickets}
                                className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 dark:bg-gray-900 dark:border-white/10 dark:text-gray-400 transition-all shadow-sm"
                            >
                                <RefreshCw className={clsx("h-5 w-5", loading && "animate-spin")} />
                            </button>
                        </div>

                        <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/20 dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader size="lg" />
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="mb-6 rounded-full bg-indigo-50 p-8 dark:bg-white/5">
                                        <Inbox className="h-12 w-12 text-indigo-200 dark:text-indigo-400/20" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">All caught up!</h3>
                                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs font-medium">You don't have any active support tickets at the moment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-white/5">
                                    {filteredTickets.map((ticket) => (
                                        <div key={ticket.id} className="p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-start gap-5 flex-1">
                                                <div className={clsx(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                    ticket.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                                )}>
                                                    <LifeBuoy className="h-7 w-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">{ticket.title}</h4>
                                                        <span className={clsx(
                                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                                            getStatusStyles(ticket.status)
                                                        )}>
                                                            {ticket.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-2xl leading-relaxed">{ticket.description}</p>
                                                    <div className="flex items-center gap-4 pt-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                            {ticket.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedTicket(ticket); setIsDetailModalOpen(true); }}
                                                className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 dark:shadow-none dark:bg-white dark:text-gray-900"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal & Detail Modal - Same as Teacher but with Student styling */}
            <Transition appear show={isCreateModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl transition-all dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">New Support Ticket</h3>
                                        <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                            <XCircle className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">What's the issue?</label>
                                            <input
                                                required
                                                value={newTicket.title}
                                                onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-white/5 dark:bg-white/5 dark:text-white"
                                                placeholder="Brief title (e.g. Cannot see homework)"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                                <select
                                                    value={newTicket.category}
                                                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none appearance-none dark:border-white/5 dark:bg-white/5 dark:text-white"
                                                >
                                                    <option value="ACADEMIC">Academic</option>
                                                    <option value="TECHNICAL">Technical</option>
                                                    <option value="FEES">Fees/Billing</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority</label>
                                                <select
                                                    value={newTicket.priority}
                                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 px-6 text-sm font-bold outline-none appearance-none dark:border-white/5 dark:bg-white/5 dark:text-white"
                                                >
                                                    <option value="LOW">Normal</option>
                                                    <option value="MEDIUM">Important</option>
                                                    <option value="HIGH">Urgent</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Explain in detail</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={newTicket.description}
                                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                                className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-white/5 dark:bg-white/5 dark:text-white resize-none"
                                                placeholder="Provide more details so we can help you faster..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={createLoading}
                                            className="w-full rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all"
                                        >
                                            {createLoading ? <Loader size="sm" variant="white" /> : "Submit Support Request"}
                                        </button>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl transition-all dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                                    {selectedTicket && (
                                        <>
                                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={clsx("text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ring-1 ring-inset", getStatusStyles(selectedTicket.status))}>
                                                            {selectedTicket.status.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">#{selectedTicket.id.slice(-6)}</span>
                                                    </div>
                                                    <Dialog.Title as="h3" className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                                        {selectedTicket.title}
                                                    </Dialog.Title>
                                                </div>
                                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                                    <XCircle className="h-6 w-6 text-gray-400" />
                                                </button>
                                            </div>
                                            <div className="space-y-8">
                                                <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/5">
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                                                        {selectedTicket.description}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/50">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Support Representative</p>
                                                        <p className="font-black text-gray-900 dark:text-white">{selectedTicket.assignedTo?.name || 'Waiting for assignment...'}</p>
                                                    </div>
                                                    <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/50">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Last Updated</p>
                                                        <p className="font-black text-gray-900 dark:text-white">{format(new Date(selectedTicket.createdAt), 'MMM d, h:mm a')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-10 flex justify-end">
                                                <button onClick={() => setIsDetailModalOpen(false)} className="px-12 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
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
