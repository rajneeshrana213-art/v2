
import { Cpu, Server, Clock } from "lucide-react";

interface ResourceMetricCardProps {
    type: 'cpu' | 'memory' | 'uptime';
    value: string | number;
    label: string;
    subValue?: string;
    subLabel?: string;
    percentage?: number;
}

export function ResourceMetricCard({ type, value, label, subValue, subLabel, percentage }: ResourceMetricCardProps) {
    const getIcon = () => {
        switch (type) {
            case 'cpu': return { icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/20' };
            case 'memory': return { icon: Server, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/20' };
            case 'uptime': return { icon: Clock, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'hover:border-teal-500/20' };
        }
    };

    const config = getIcon();
    const Icon = config.icon;

    return (
        <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-white/10 dark:bg-gray-900 ${config.border}`}>
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</h3>
                </div>
                <div className={`rounded-lg p-2 ${config.bg} ${config.color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            {percentage !== undefined && (
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{subLabel || 'Usage'}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${type === 'cpu' ? 'from-blue-500 to-indigo-500' : 'from-purple-500 to-pink-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {subValue && !percentage && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {subLabel}: <span className="font-medium text-gray-700 dark:text-gray-300">{subValue}</span>
                </p>
            )}
        </div>
    );
}
