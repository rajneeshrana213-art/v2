import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorRateWidgetProps {
    errorRate: number;
    totalErrors: number;
    recentSpikes: boolean;
    trend: 'up' | 'down' | 'stable';
}

export function ErrorRateWidget({ errorRate, totalErrors, recentSpikes, trend }: ErrorRateWidgetProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">API Error Rate</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Real-time failures</p>
                    </div>
                </div>

                <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border",
                    errorRate > 5
                        ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
                        : errorRate > 1
                            ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
                            : "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
                )}>
                    {errorRate}% Failures
                </div>
            </div>

            <div className="mt-4 flex-1 flex flex-col justify-end relative z-10">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white flex items-baseline gap-1">
                            {totalErrors}
                            <span className="text-sm font-medium text-gray-500 ">errors/hr</span>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-1 text-sm font-bold",
                        trend === 'up' ? "text-red-500" : trend === 'down' ? "text-emerald-500" : "text-gray-500"
                    )}>
                        {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                        {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
                    </div>
                </div>

                {recentSpikes && (
                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-red-800 dark:text-red-300">Spike Detected</p>
                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">Unusual number of 5xx errors recorded in the last 5 minutes.</p>
                        </div>
                    </div>
                )}

                {!recentSpikes && (
                    <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-800/50 dark:border-white/5 flex items-center gap-3">
                        <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Error rates are within normal operational thresholds.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
