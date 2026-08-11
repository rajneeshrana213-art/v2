
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ServiceStatusCardProps {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    latency: number;
}

export function ServiceStatusCard({ name, status, latency }: ServiceStatusCardProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'operational':
                return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/20' };
            case 'degraded':
                return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'hover:border-yellow-500/20' };
            case 'down':
                return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'hover:border-red-500/20' };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 dark:border-white/10 dark:bg-gray-900 ${config.border}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                    <p className={`text-xs font-medium ${config.color}`}>{status.toUpperCase()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{latency}ms</p>
                <p className="text-xs text-gray-500">Latency</p>
            </div>
        </div>
    );
}
