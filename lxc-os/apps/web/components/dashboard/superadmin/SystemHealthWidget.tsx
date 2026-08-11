import { ShieldCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface SystemHealthWidgetProps {
    health: {
        errorRate: number;
        avgResponseTime: number;
        totalRequests: number;
        successRate: number;
    };
}

export function SystemHealthWidget({ health }: SystemHealthWidgetProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-teal-500/30">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">System Health</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Real-time platform metrics</p>
                    </div>
                </div>
                <Link href="/dashboard/superadmin/system-health">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Operational
                </div>
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Success Rate
                    </div>
                    <div className={`text-2xl font-bold ${health.successRate > 99 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}>
                        {health.successRate}%
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Error Rate
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {health.errorRate}%
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <Clock className="h-3.5 w-3.5" />
                        Avg Response
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {Math.round(health.avgResponseTime)}ms
                    </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Total Requests
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {health.totalRequests.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
