import { Bell, Calendar } from "lucide-react";
import Link from "next/link";

interface AlertsWidgetProps {
    alerts: {
        subscriptionsExpiring: {
            id: string;
            schoolName: string;
            endDate: Date | string;
            daysRemaining: number;
        }[];
    };
}

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-red-500/30">
            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                    <Bell className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                    Alerts & Expirations
                </h3>
            </div>

            <div className="space-y-3">
                {alerts.subscriptionsExpiring.length > 0 ? (
                    alerts.subscriptionsExpiring.map((sub) => (
                        <div
                            key={sub.id}
                            className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3 dark:border-red-500/10 dark:bg-red-500/5"
                        >
                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {sub.schoolName}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Expires in {sub.daysRemaining} days ({formatDate(sub.endDate)})
                                </p>
                            </div>
                            <Link href="/dashboard/superadmin/assign-plan" className="text-xs font-medium text-red-600 underline hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                Renew
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No active alerts.</p>
                )}
            </div>
        </div>
    );
}
