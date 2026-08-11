
import { Activity } from "lucide-react";

interface HealthScoreGaugeProps {
    score: number;
    status: 'healthy' | 'degraded' | 'down';
}

export function HealthScoreGauge({ score, status }: HealthScoreGaugeProps) {
    const getColor = () => {
        if (score >= 90) return "text-emerald-500";
        if (score >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    const getBgColor = () => {
        if (score >= 90) return "bg-emerald-500/10";
        if (score >= 70) return "bg-yellow-500/10";
        return "bg-red-500/10";
    };

    return (
        <div className="flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:border-emerald-500/20">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                <svg className="absolute h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <path
                        className="text-gray-200 dark:text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={getColor()}
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex flex-col items-center">
                    <span className={`text-2xl font-bold ${getColor()}`}>{score}%</span>
                    <Activity className={`h-4 w-4 ${getColor()}`} />
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Overall System Status</h2>
                <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getColor()} ${getBgColor()}`}>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                    </span>
                    {status.toUpperCase()}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    All critical systems are functioning {status === 'healthy' ? 'optimally' : 'with issues'}.
                </p>
            </div>
        </div>
    );
}
