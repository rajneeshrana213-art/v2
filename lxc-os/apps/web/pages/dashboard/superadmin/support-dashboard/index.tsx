import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import client from '@/lib/api/client';
import { RefreshCw, MessageSquare, Clock, CheckCircle, AlertCircle, TrendingUp, Users, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { clsx } from 'clsx';
import { Loader } from '@/components/ui/feedback/Loader';

// Dynamic imports for heavy chart components
const TicketTrendsChart = dynamic(() => import('@/components/dashboard/superadmin/support/TicketTrendsChart').then(m => ({ default: m.TicketTrendsChart })), { ssr: false });
const PriorityDistributionChart = dynamic(() => import('@/components/dashboard/superadmin/support/PriorityDistributionChart').then(m => ({ default: m.PriorityDistributionChart })), { ssr: false });
const StatusDistributionChart = dynamic(() => import('@/components/dashboard/superadmin/support/StatusDistributionChart').then(m => ({ default: m.StatusDistributionChart })), { ssr: false });
const ResolutionTimeChart = dynamic(() => import('@/components/dashboard/superadmin/support/ResolutionTimeChart').then(m => ({ default: m.ResolutionTimeChart })), { ssr: false });
const RecentTicketsWidget = dynamic(() => import('@/components/dashboard/superadmin/support/RecentTicketsWidget').then(m => ({ default: m.RecentTicketsWidget })), { ssr: false });

interface DashboardStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    unassigned: number;
    avgResolutionTime: number;
    avgResponseTime: number;
    ticketsByPriority: Record<string, number>;
    ticketsByStatus: Record<string, number>;
    ticketTrends: { date: string; opened: number; closed: number }[];
    resolutionTimeTrends: { date: string; avgHours: number }[];
    recentTickets: any[];
}

export default function SupportDashboardPage() {
    const { get } = useApi();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const warningShownRef = useRef(false);
    const errorShownRef = useRef(false);

    const fetchDashboardData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // Fetch stats, tickets, and trends in parallel
            // Use client directly because useApi's request method aborts previous pending requests
            const [statsRes, ticketsRes, trendsRes, resolutionTrendsRes] = await Promise.all([
                client.get('/v1/superadmin/tickets/stats').then(res => res.data).catch(() => null),
                client.get('/v1/superadmin/tickets?page=1&limit=10').then(res => res.data).catch(() => ({ data: [], pagination: null })),
                client.get('/v1/superadmin/tickets/trends?days=30').then(res => res.data).catch(() => null),
                client.get('/v1/superadmin/tickets/resolution-trends?days=30').then(res => res.data).catch(() => null),
            ]);



            // If stats API failed, we can't show much
            if (!statsRes) {
                console.warn('Stats API failed');
                if (!isRefresh && !errorShownRef.current) {
                    toast.error('Unable to load dashboard stats', { autoClose: 4000 });
                    errorShownRef.current = true;
                }

                // Set empty/zero state
                setStats({
                    total: 0,
                    open: 0,
                    inProgress: 0,
                    resolved: 0,
                    closed: 0,
                    unassigned: 0,
                    avgResolutionTime: 0,
                    avgResponseTime: 0,
                    ticketsByPriority: {},
                    ticketsByStatus: {},
                    ticketTrends: [],
                    resolutionTimeTrends: [],
                    recentTickets: ticketsRes?.data || [],
                });
                return;
            }

            // Transform data for dashboard
            const dashboardData: DashboardStats = {
                total: statsRes.total || 0,
                open: statsRes.open || 0,
                inProgress: statsRes.inProgress || 0,
                resolved: statsRes.resolved || 0,
                closed: statsRes.closed || 0,
                unassigned: statsRes.unassigned || 0,
                avgResolutionTime: statsRes.avgResolutionTime || 0,
                avgResponseTime: statsRes.avgResponseTime || 0,
                ticketsByPriority: statsRes.ticketsByPriority || {},
                ticketsByStatus: statsRes.ticketsByStatus || {
                    OPEN: statsRes.open || 0,
                    IN_PROGRESS: statsRes.inProgress || 0,
                    RESOLVED: statsRes.resolved || 0,
                    CLOSED: statsRes.closed || 0,
                },
                ticketTrends: trendsRes || [],
                resolutionTimeTrends: resolutionTrendsRes || [],
                recentTickets: ticketsRes?.data || [],
            };

            setStats(dashboardData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Set empty state on error
            setStats({
                total: 0,
                open: 0,
                inProgress: 0,
                resolved: 0,
                closed: 0,
                unassigned: 0,
                avgResolutionTime: 0,
                avgResponseTime: 0,
                ticketsByPriority: {},
                ticketsByStatus: {},
                ticketTrends: [],
                resolutionTimeTrends: [],
                recentTickets: [],
            });

            if (!isRefresh && !errorShownRef.current) {
                toast.error('Unable to load dashboard data', { autoClose: 4000 });
                errorShownRef.current = true;
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const statCards = [
        {
            label: 'Total Tickets',
            value: stats?.total || 0,
            icon: MessageSquare,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/10',
            border: 'border-indigo-200 dark:border-indigo-800',
        },
        {
            label: 'Open',
            value: stats?.open || 0,
            icon: AlertCircle,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/10',
            border: 'border-blue-200 dark:border-blue-800',
        },
        {
            label: 'In Progress',
            value: stats?.inProgress || 0,
            icon: Clock,
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/10',
            border: 'border-yellow-200 dark:border-yellow-800',
        },
        {
            label: 'Resolved',
            value: stats?.resolved || 0,
            icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/10',
            border: 'border-green-200 dark:border-green-800',
        },
        {
            label: 'Closed',
            value: stats?.closed || 0,
            icon: XCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-900/10',
            border: 'border-gray-200 dark:border-gray-800',
        },
        {
            label: 'Unassigned',
            value: stats?.unassigned || 0,
            icon: Users,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/10',
            border: 'border-red-200 dark:border-red-800',
        },
    ];

    const metricCards = [
        {
            label: 'Avg Resolution Time',
            value: stats ? `${(stats.avgResolutionTime || 0).toFixed(1)}h` : '0h',
            icon: TrendingUp,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/10',
        },
        {
            label: 'Avg Response Time',
            value: stats ? `${(stats.avgResponseTime || 0).toFixed(1)}h` : '0h',
            icon: Clock,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/10',
        },
    ];

    if (loading) {
        return (
            <DashboardLayout role="superadmin">
                <Head>
                    <title>Support Dashboard - LearnXChain</title>
                    <meta name="description" content="LearnXChain support dashboard — analytics and insights for support tickets including trends, priorities, and resolution times." />
                </Head>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Support Dashboard - LearnXChain</title>
                <meta name="description" content="LearnXChain support dashboard — analytics and insights for support tickets including trends, priorities, and resolution times." />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive analytics and insights for support tickets</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-indigo-500 hover:text-indigo-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Refresh Data"
                    >
                        <RefreshCw className={clsx("h-4 w-4", refreshing && "animate-spin")} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </div>

                {/* Main Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={clsx(
                                    "group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300",
                                    "hover:-translate-y-1 hover:shadow-xl",
                                    card.border,
                                    "bg-white dark:bg-gray-900",
                                    "hover:border-opacity-60 dark:hover:border-opacity-40"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                            {loading ? '...' : card.value}
                                        </p>
                                    </div>
                                    <div className={clsx("rounded-xl p-3 transition-transform duration-300 group-hover:scale-110", card.bg, card.color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 dark:from-gray-900/0 dark:via-gray-900/0 dark:to-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {metricCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={clsx(
                                    "group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300",
                                    "hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20",
                                    "dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                            {loading ? '...' : card.value}
                                        </p>
                                    </div>
                                    <div className={clsx("rounded-xl p-3 transition-transform duration-300 group-hover:scale-110", card.bg, card.color)}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row 1: Trends and Priority */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-1">
                        <TicketTrendsChart data={stats?.ticketTrends || []} />
                    </div>
                    <div className="lg:col-span-1">
                        <PriorityDistributionChart data={stats?.ticketsByPriority || {}} />
                    </div>
                </div>

                {/* Charts Row 2: Status and Resolution Time */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-1">
                        <StatusDistributionChart data={stats?.ticketsByStatus || {}} />
                    </div>
                    <div className="lg:col-span-1">
                        <ResolutionTimeChart data={stats?.resolutionTimeTrends || []} />
                    </div>
                </div>

                {/* Recent Tickets */}
                <div>
                    <RecentTicketsWidget tickets={stats?.recentTickets || []} />
                </div>
            </div>
        </DashboardLayout>
    );
}

