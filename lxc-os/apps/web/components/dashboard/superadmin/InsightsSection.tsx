import { MapPin, Trophy, PieChart } from "lucide-react";
import Link from "next/link";

interface InsightsSectionProps {
    insights: {
        topSchoolsByRevenue: {
            schoolName: string;
            totalRevenue: number;
        }[];
        geographicDistribution: Record<string, number>;
        planDistribution: {
            planName: string;
            subscriptionCount: number;
        }[];
    };
}

export function InsightsSection({ insights }: InsightsSectionProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Top Schools */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-yellow-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-yellow-500/30">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Top Schools</h3>
                    </div>
                    <Link href="/dashboard/superadmin/schools" className="text-xs font-medium text-yellow-600 hover:underline dark:text-yellow-400">View All</Link>
                </div>
                <div className="space-y-3">
                    {insights.topSchoolsByRevenue.slice(0, 5).map((school, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" :
                                    i === 1 ? "bg-gray-100 text-gray-700" :
                                        i === 2 ? "bg-orange-100 text-orange-700" : "bg-white text-gray-500"
                                    }`}>
                                    {i + 1}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{school.schoolName}</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(school.totalRevenue)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan Distribution */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-purple-500/30">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <PieChart className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Active Plans</h3>
                    </div>
                    <Link href="/dashboard/superadmin/membership-plans" className="text-xs font-medium text-purple-600 hover:underline dark:text-purple-400">View All</Link>
                </div>
                <div className="space-y-3">
                    {insights.planDistribution.map((plan, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{plan.planName}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{plan.subscriptionCount}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className="h-full rounded-full bg-purple-500"
                                    style={{ width: `${Math.max((plan.subscriptionCount / 100) * 100, 5)}%` }} // Primitive scaling
                                />
                            </div>
                        </div>
                    ))}
                    {insights.planDistribution.length === 0 && (
                        <p className="text-sm text-gray-500">No active plans data.</p>
                    )}
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-red-500/30">
                <div className="mb-4 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">Regions</h3>
                </div>
                <div className="space-y-2">
                    {Object.entries(insights.geographicDistribution).slice(0, 6).map(([region, count], i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0 dark:border-white/5">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{region}</span>
                            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-700 dark:text-gray-300">
                                {count} users
                            </span>
                        </div>
                    ))}
                    {Object.keys(insights.geographicDistribution).length === 0 && (
                        <p className="text-sm text-gray-500">No regional data.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
