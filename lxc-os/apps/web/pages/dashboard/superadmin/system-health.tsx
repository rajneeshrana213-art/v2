
import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { HealthScoreGauge } from "@/components/dashboard/superadmin/health/HealthScoreGauge";
import { ServiceStatusCard } from "@/components/dashboard/superadmin/health/ServiceStatusCard";
import { ResourceMetricCard } from "@/components/dashboard/superadmin/health/ResourceMetricCard";
import { SystemLogsPanel } from "@/components/dashboard/superadmin/health/SystemLogsPanel";
import { LatestActiveUsersCard } from "@/components/dashboard/superadmin/health/LatestActiveUsersCard";
import { ModuleUsageCard } from "@/components/dashboard/superadmin/health/ModuleUsageCard";
import { GeoTrafficWidget } from "@/components/dashboard/superadmin/health/GeoTrafficWidget";
import { SlowQueriesList } from "@/components/dashboard/superadmin/health/SlowQueriesList";
import { RealtimeLatencyChart } from "@/components/dashboard/superadmin/health/RealtimeLatencyChart";
import { ErrorRateWidget } from "@/components/dashboard/superadmin/health/ErrorRateWidget";
import { RefreshCw } from "lucide-react";
import { getAccessToken } from "@/lib/api/client";
import { Loader } from "@/components/ui/feedback/Loader";

// Types corresponding to the API response
interface SystemHealthData {
    status: 'healthy' | 'degraded' | 'down';
    score: number;
    uptime: number;
    timestamp: string;
    resources: {
        memory: {
            used: number;
            total: number;
            usagePercentage: number;
        };
        cpu: {
            usagePercentage: number;
            cores: number;
        };
        apiLatency: number;
    };
    services: {
        name: string;
        status: 'operational' | 'degraded' | 'down';
        latency: number;
        message?: string;
    }[];
    apiErrorRate: number;
    apiTotalErrors: number;
    apiErrorSpikes: boolean;
    apiErrorTrend: 'up' | 'down' | 'stable';
    recentLogs: {
        id: string;
        timestamp: string;
        level: 'info' | 'warning' | 'error' | 'success';
        message: string;
        source: string;
    }[];
    latestActiveUsers: {
        name: string;
        email: string;
        role: string;
        loginTime: string;
        lastActive: string;
        duration: number;
        avatar?: string;
        schoolName?: string;
    }[];
    moduleUsage: {
        name: string;
        usage: number;
        color: string;
    }[];
}

export default function SystemHealthPage() {
    const [data, setData] = useState<SystemHealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/v1/superadmin/system-health', {
                headers: {
                    "Authorization": `Bearer ${getAccessToken()}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch system health");
            const jsonData = await res.json();
            setData(jsonData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 3 seconds for smoother graph feeling, though backend mock is stateless mostly
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>System Health | LearnXChain Super Admin</title>
                <meta name="description" content="LearnXChain system health monitoring — real-time infrastructure status, resource metrics, service health, and API latency." />
            </Head>

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">System Monitoring</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time infrastructure and service status</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading && !data ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader size="lg" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                        Error loading system health: {error}
                    </div>
                ) : data ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Summary Metrics Row */}
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            <HealthScoreGauge score={data.score} status={data.status} />
                            <ErrorRateWidget
                                    errorRate={data.apiErrorRate || 0}
                                    totalErrors={data.apiTotalErrors || 0}
                                    recentSpikes={data.apiErrorSpikes || false}
                                    trend={data.apiErrorTrend || 'stable'}
                            />
                            <div className="lg:col-span-2">
                                <ModuleUsageCard modules={data.moduleUsage} />
                            </div>
                        </div>

                        {/* Real-time Activity Row */}
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <LatestActiveUsersCard users={data.latestActiveUsers} />
                            </div>
                            <div className="flex flex-col gap-6">
                                <GeoTrafficWidget />
                                <SlowQueriesList />
                            </div>
                        </div>

                        {/* Resource Metrics & Services */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <ResourceMetricCard
                                type="memory"
                                label="Memory Usage"
                                value={`${data.resources.memory.used} MB`}
                                percentage={data.resources.memory.usagePercentage}
                                subLabel="Total Limit"
                                subValue={`${data.resources.memory.total} MB`}
                            />
                            <ResourceMetricCard
                                type="cpu"
                                label="CPU Load"
                                value={`${data.resources.cpu.usagePercentage}%`}
                                percentage={data.resources.cpu.usagePercentage}
                                subLabel="Cores"
                                subValue={`${data.resources.cpu.cores}`}
                            />
                            <ResourceMetricCard
                                type="uptime"
                                label="System Uptime"
                                value={formatUptime(data.uptime)}
                            />
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Latency</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{data.resources.apiLatency} ms</h3>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${data.resources.apiLatency < 50 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-700'}`}>
                                        Live
                                    </div>
                                </div>
                                <div className="flex-1 w-full min-h-[100px]">
                                    <RealtimeLatencyChart currentLatency={data.resources.apiLatency} />
                                </div>
                            </div>
                        </div>

                        {/* Service Status Grid */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">Service Health</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {data.services.map((service, idx) => (
                                    <ServiceStatusCard
                                        key={idx}
                                        name={service.name}
                                        status={service.status}
                                        latency={service.latency}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Logs */}
                        <SystemLogsPanel logs={data.recentLogs} />
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    );
}
