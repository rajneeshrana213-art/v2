
import { Terminal, Clock, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface LogEntry {
    id: string;
    timestamp: string | Date;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    source: string;
}

interface SystemLogsPanelProps {
    logs: LogEntry[];
}

export function SystemLogsPanel({ logs }: SystemLogsPanelProps) {
    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getLevelClass = (level: string) => {
        switch (level) {
            case 'error': return "text-red-600 dark:text-red-400";
            case 'warning': return "text-yellow-600 dark:text-yellow-400";
            case 'success': return "text-emerald-600 dark:text-emerald-400";
            default: return "text-blue-600 dark:text-blue-400";
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/50">
                <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">System Logs</h3>
                </div>
                <div className="flex gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-red-400/80"></span>
                    <span className="flex h-3 w-3 rounded-full bg-yellow-400/80"></span>
                    <span className="flex h-3 w-3 rounded-full bg-green-400/80"></span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-sm max-h-[400px]">
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className="group flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="mt-0.5 shrink-0 opacity-80">
                                {getLevelIcon(log.level)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-xs text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className={`text-xs font-bold uppercase tracking-wide ${getLevelClass(log.level)}`}>
                                        [{log.level}]
                                    </span>
                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                        @{log.source}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-gray-700 dark:text-gray-300 break-all leading-relaxed">
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="py-8 text-center text-gray-400 italic">No recent logs found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
