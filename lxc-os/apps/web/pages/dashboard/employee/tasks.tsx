
import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import {
    CheckSquare,
    Clock,
    Calendar,
    AlertCircle,
    Plus,
    MoreVertical,
    CheckCircle2,
    Circle,
    LifeBuoy,
    MessageCircle,
    Tag,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'TASKS' | 'ACTIVE_TICKETS' | 'COMPLETED_TICKETS'>('TASKS');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/dashboard/employee");
            setTasks(res.data?.assignedTasks || []);
            setTickets(res.data?.assignedTickets?.tickets || []);
        } catch (err) {
            console.error("Failed to fetch tasks and tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        try {
            setProcessingId(ticketId);
            await client.patch("/v1/employee/tickets", { ticketId, status: newStatus });
            fetchData(); // Refresh data
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const activeTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
    const completedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');

    return (
        <>
            <Head>
                <title>My Tasks & Tickets - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-6 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Workspace</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Manage your internal tasks and support tickets in one place.
                            </p>
                        </div>
                    </div>

                    {/* Unified Full-Width Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-1 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-white/10">
                            <div className="flex overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('TASKS')}
                                    className={cn(
                                        "px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                                        activeTab === 'TASKS' ? "text-indigo-600 border-indigo-600 bg-white dark:bg-gray-900" : "text-gray-400 border-transparent hover:text-gray-600"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <CheckSquare className="h-4 w-4" />
                                        Internal Tasks ({tasks.length})
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('ACTIVE_TICKETS')}
                                    className={cn(
                                        "px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                                        activeTab === 'ACTIVE_TICKETS' ? "text-indigo-600 border-indigo-600 bg-white dark:bg-gray-900" : "text-gray-400 border-transparent hover:text-gray-600"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Active Tickets ({activeTickets.length})
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('COMPLETED_TICKETS')}
                                    className={cn(
                                        "px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                                        activeTab === 'COMPLETED_TICKETS' ? "text-indigo-600 border-indigo-600 bg-white dark:bg-gray-900" : "text-gray-400 border-transparent hover:text-gray-600"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Completed ({completedTickets.length})
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">{activeTab === 'TASKS' ? 'Task Details' : 'Ticket Info'}</th>
                                        <th className="px-6 py-4">Status / Due</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 text-sm">Loading workspace...</td></tr>
                                    ) : activeTab === 'TASKS' ? (
                                        tasks.length > 0 ? (
                                            tasks.map((task) => (
                                                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <button className="text-gray-300 hover:text-indigo-600">
                                                                <Circle className="h-5 w-5" />
                                                            </button>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{task.title}</div>
                                                                <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{task.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                                                            <Calendar className="h-3 w-3" /> Due Oct 30
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Medium</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic text-sm">No internal tasks found.</td></tr>
                                        )
                                    ) : (activeTab === 'ACTIVE_TICKETS' ? activeTickets : completedTickets).length > 0 ? (
                                        (activeTab === 'ACTIVE_TICKETS' ? activeTickets : completedTickets).map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                                                            <Tag className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{ticket.title}</div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter">#MT-{ticket.ticketNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                        ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-bold uppercase">
                                                    {ticket.priority}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                                                            disabled={processingId === ticket.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-sm"
                                                        >
                                                            {processingId === ticket.id ? "..." : <><CheckCircle2 className="h-3 w-3" /> Resolve</>}
                                                        </button>
                                                    ) : (
                                                        <button className="p-2 text-gray-400 hover:text-indigo-600">
                                                            <MessageCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic text-sm">No tickets in this category.</td></tr>
                                    )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardLayout >
        </>
    );
}
