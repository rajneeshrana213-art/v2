import { useRouter } from 'next/router';
import { Eye, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface Ticket {
    id: string;
    ticketNumber: number;
    title: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    User?: {
        name: string;
        email: string;
    };
}

interface RecentTicketsWidgetProps {
    tickets: Ticket[];
}

export function RecentTicketsWidget({ tickets }: RecentTicketsWidgetProps) {
    const router = useRouter();

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <AlertCircle className="h-3 w-3" />;
            case 'IN_PROGRESS':
                return <RefreshCw className="h-3 w-3 animate-spin" />;
            case 'RESOLVED':
                return <CheckCircle className="h-3 w-3" />;
            case 'CLOSED':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    };

    const handleViewTicket = (ticketId: string) => {
        router.push(`/dashboard/superadmin/support-tickets`);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Tickets</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest support tickets</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/superadmin/support-tickets')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        View All
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-white/10">
                {tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent open tickets</p>
                    </div>
                ) : (
                    tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).slice(0, 10).map((ticket) => (
                        <div
                            key={ticket.id}
                            className="group px-6 py-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                            onClick={() => handleViewTicket(ticket.id)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                                            #{ticket.ticketNumber}
                                        </span>
                                        <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", getStatusColor(ticket.status))}>
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className={clsx("text-xs font-semibold", getPriorityColor(ticket.priority))}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {ticket.title}
                                    </p>
                                    {ticket.User && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {ticket.User.name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {formatDate(ticket.createdAt)}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewTicket(ticket.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400 transition-all duration-200"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

