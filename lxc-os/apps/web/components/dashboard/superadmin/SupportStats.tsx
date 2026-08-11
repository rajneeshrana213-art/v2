import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SupportStatsProps {
    support: {
        openTickets: number;
        closedTickets: number;
        avgResolutionTime: number;
        totalFeedbacks: number;
    };
}

export function SupportStats({ support }: SupportStatsProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-orange-500/30">
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">Support & Feedback</h3>
                </div>
                <Link href="/dashboard/superadmin/support-tickets" className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400">View All</Link>
            </div>

            <div className="space-y-4">
                <Link href="/dashboard/superadmin/support-tickets">
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Open Tickets</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Needs attention</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-50">{support.openTickets}</span>
                </div>
                </Link>

                <Link href="/dashboard/superadmin/support-tickets">
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-500/5 cursor-pointer hover:bg-green-100 dark:hover:bg-green-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Resolved</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Closed tickets</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-50">{support.closedTickets}</span>
                </div>
                </Link>

                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-blue-600 dark:text-blue-400">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Resolution</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Time to close</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{support.avgResolutionTime}h</span>
                </div>
            </div>
        </div>
    );
}
