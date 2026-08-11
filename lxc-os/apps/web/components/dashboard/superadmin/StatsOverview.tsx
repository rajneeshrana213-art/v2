import {
    Users,
    GraduationCap,
    Wallet,
    TrendingUp,
    TrendingDown,
    Building2,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";

interface StatsOverviewProps {
    stats: {
        userStatistics: {
            totalUsers: number;
            activeUsers: number;
            userGrowth: number;
        };
        schoolStatistics: {
            totalSchools: number;
            activeSchools: number;
            schoolGrowth: number;
        };
        financialMetrics: {
            totalRevenue: number;
            outstandingPayments: number;
            todayRevenue: number;
        };
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const cards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.financialMetrics.totalRevenue, true),
            subValue: `+${formatCurrency(stats.financialMetrics.todayRevenue)} today`,
            icon: Wallet,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            trend: "up", // Assuming positive for now as we don't have historical comparison for total
            href: "/dashboard/superadmin/transaction",
        },
        {
            title: "Active Schools",
            value: stats.schoolStatistics.activeSchools.toString(),
            subValue: `${stats.schoolStatistics.schoolGrowth}% growth`,
            icon: Building2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: stats.schoolStatistics.schoolGrowth >= 0 ? "up" : "down",
            href: "/dashboard/superadmin/schools",
        },
        {
            title: "Total Users",
            value: stats.userStatistics.totalUsers.toString(),
            subValue: `${stats.userStatistics.userGrowth}% growth`,
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            trend: stats.userStatistics.userGrowth >= 0 ? "up" : "down",
            href: "/dashboard/superadmin/employees",
        },
        {
            title: "Outstanding",
            value: formatCurrency(stats.financialMetrics.outstandingPayments, true),
            subValue: "Pending payments",
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            trend: "neutral",
            href: "/dashboard/superadmin/transaction",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Link key={index} href={card.href}>
                    <div
                        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30 cursor-pointer"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {card.title}
                                </p>
                                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                                    {card.value}
                                </h3>
                            </div>
                            <div className={`rounded-xl p-2 ${card.bg} ${card.color}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {card.trend === "up" && (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            )}
                            {card.trend === "down" && (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${card.trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
                                card.trend === "down" ? "text-red-600 dark:text-red-400" :
                                    "text-gray-500 dark:text-gray-400"
                                }`}>
                                {card.subValue}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
