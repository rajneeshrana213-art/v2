
import { BarChart3 } from "lucide-react";

interface ModuleUsageCardProps {
    modules: {
        name: string;
        usage: number;
        color: string;
    }[];
}

export function ModuleUsageCard({ modules }: ModuleUsageCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 h-full">
            <div className="mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">Most Used Modules</h3>
            </div>

            <div className="space-y-5">
                {modules.map((mod, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mod.name}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{mod.usage}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${mod.color} transition-all duration-1000 ease-out`}
                                style={{ width: `${mod.usage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
