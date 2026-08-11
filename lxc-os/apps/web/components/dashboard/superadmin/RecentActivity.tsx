import { Building2, User, Ticket, CreditCard } from "lucide-react";
import Link from "next/link";
import { encodeId } from "@/lib/utils/hashId";

interface RecentActivityProps {
    recentActivity: {
        recentSchools: {
            id: string;
            schoolName: string;
            createdAt: Date | string;
            adminName: string;
        }[];
        recentUsers: {
            id: string;
            name: string;
            role: string;
            schoolName: string | null;
            createdAt: Date | string;
        }[];
        recentPayments: {
            id: string;
            amount: number;
            status: string;
            schoolName: string | null;
            createdAt: Date | string;
        }[];
    };
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
    const formatDate = (dateString: Date | string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Schools */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-blue-500/30">
                <div className="mb-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50">New Schools</h3>
                    </div>
                    <Link href="/dashboard/superadmin/schools" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline dark:text-blue-400">View All</Link>
                </div>
                <div className="space-y-1">
                    {recentActivity.recentSchools.slice(0, 5).map((school) => (
                        <Link key={school.id} href={`/dashboard/superadmin/schools/${encodeId(school.id)}`} className="block group">
                            <div className="flex items-start justify-between border-b border-gray-100/80 py-4 last:border-0 dark:border-white/5 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/5 rounded-xl px-3 transition-all duration-200 -mx-3">
                                <div className="space-y-1 pr-4">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight">{school.schoolName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        Admin: <span className="text-gray-700 dark:text-gray-300 font-medium">{school.adminName}</span>
                                    </p>
                                </div>
                                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md whitespace-nowrap mt-0.5">{formatDate(school.createdAt)}</span>
                            </div>
                        </Link>
                    ))}
                    {recentActivity.recentSchools.length === 0 && (
                        <p className="text-sm text-gray-500">No recent schools.</p>
                    )}
                </div>
            </div>

            {/* Recent Users */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
                <div className="mb-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <User className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50">New Users</h3>
                    </div>
                    <Link href="/dashboard/superadmin/employees" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors hover:underline dark:text-indigo-400">View All</Link>
                </div>
                <div className="space-y-1">
                    {recentActivity.recentUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-start justify-between border-b border-gray-100/80 py-4 last:border-0 dark:border-white/5 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 rounded-xl px-3 transition-all duration-200 -mx-3">
                            <div className="space-y-1 pr-4">
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{user.role}</span>
                                    {user.schoolName && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            <span className="truncate max-w-[150px]">{user.schoolName}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-md whitespace-nowrap mt-0.5">{formatDate(user.createdAt)}</span>
                        </div>
                    ))}
                    {recentActivity.recentUsers.length === 0 && (
                        <p className="text-sm text-gray-500">No recent users.</p>
                    )}
                </div>
            </div>

            {/* Recent Payments */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-emerald-500/30">
                <div className="mb-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Recent Payments</h3>
                    </div>
                    <Link href="/dashboard/superadmin/transaction" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline dark:text-emerald-400">View All</Link>
                </div>
                <div className="space-y-1">
                    {recentActivity.recentPayments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-start justify-between border-b border-gray-100/80 py-4 last:border-0 dark:border-white/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 rounded-xl px-3 transition-all duration-200 -mx-3">
                            <div className="space-y-1">
                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                    {payment.schoolName || "Unknown School"}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md ${payment.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                    }`}>
                                    {payment.status}
                                </span>
                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{formatDate(payment.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                    {recentActivity.recentPayments.length === 0 && (
                        <p className="text-sm text-gray-500">No recent payments.</p>
                    )}
                </div>
            </div>

        </div>
    );
}
