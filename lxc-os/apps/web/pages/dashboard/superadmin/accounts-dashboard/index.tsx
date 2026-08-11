
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    School,
    CreditCard,
    Ticket,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Activity,
    Plus
} from "lucide-react";
import Chart from "chart.js/auto";
import FinanceFormModal from "@/components/dashboard/superadmin/finance/FinanceFormModal";
import { getAccessToken } from "@/lib/api/client";
import { Loader } from "@/components/ui/feedback/Loader";
import { formatCurrency } from "@/lib/utils/currency";

interface DashboardData {
    stats: {
        totalSchools: number;
        totalPlans: number;
        totalCoupons: number;
        activeCoupons: number;
        expiredCoupons: number;
        activeSubscriptions: number;
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
    };
    graphData: {
        monthlyFinancials: { month: string; revenue: number; expense: number }[];
        planDistribution: { name: string; value: number }[];
        expenseBreakdown: { name: string; value: number }[];
    };
    recentActivity: {
        planPayments: any[];
        internalIncome: any[];
        internalExpenses: any[];
    };
    categories: { id: string; name: string }[];
}

export default function AccountsDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const planChartRef = useRef<HTMLCanvasElement>(null);
    const expenseChartRef = useRef<HTMLCanvasElement>(null);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/v1/superadmin/dashboard/accounts", {
                headers: {
                    "Authorization": `Bearer ${getAccessToken()}`
                }
            });
            const jsonData = await res.json();
            setData(jsonData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!data || !expenseChartRef.current) return;

        const ctx = expenseChartRef.current.getContext("2d");
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: data.graphData.expenseBreakdown.map((d) => d.name),
                datasets: [
                    {
                        data: data.graphData.expenseBreakdown.map((d) => d.value),
                        backgroundColor: [
                            "#ef4444",
                            "#f59e0b",
                            "#10b981",
                            "#6366f1",
                            "#8b5cf6",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                },
            },
        });

        return () => chart.destroy();
    }, [data]);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.graphData.monthlyFinancials.map((d) => d.month),
                datasets: [
                    {
                        label: "Revenue",
                        data: data.graphData.monthlyFinancials.map((d) => d.revenue),
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "Expense",
                        data: data.graphData.monthlyFinancials.map((d) => d.expense),
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" },
                    tooltip: { mode: "index", intersect: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(156, 163, 175, 0.1)" }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
            },
        });

        return () => chart.destroy();
    }, [data]);

    useEffect(() => {
        if (!data || !planChartRef.current) return;

        const ctx = planChartRef.current.getContext("2d");
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: data.graphData.planDistribution.map((d) => d.name),
                datasets: [
                    {
                        data: data.graphData.planDistribution.map((d) => d.value),
                        backgroundColor: [
                            "#6366f1",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                },
                cutout: "70%",
            },
        });

        return () => chart.destroy();
    }, [data]);

    if (loading) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-screen items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return null;


    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Accounts Dashboard | Superadmin</title>
            </Head>

            <div className="space-y-8 p-6 md:p-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                            Accounts Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Overview of financial performance and account metrics
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Transaction</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(data.stats.totalRevenue, true)}
                        icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
                        trend="+12.5%"
                        trendUp={true}
                        gradient="from-emerald-500/10 to-teal-500/10"
                    />
                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(data.stats.totalExpenses, true)}
                        icon={<TrendingDown className="w-6 h-6 text-rose-500" />}
                        trend="+5.2%"
                        trendUp={false}
                        gradient="from-rose-500/10 to-orange-500/10"
                    />
                    <StatCard
                        title="Net Profit"
                        value={formatCurrency(data.stats.netProfit, true)}
                        icon={<Wallet className="w-6 h-6 text-blue-500" />}
                        trend="+8.1%"
                        trendUp={true}
                        gradient="from-blue-500/10 to-indigo-500/10"
                    />
                    <StatCard
                        title="Active Subs"
                        value={data.stats.activeSubscriptions.toString()}
                        icon={<Activity className="w-6 h-6 text-amber-500" />}
                        trend="+2.4%"
                        trendUp={true}
                        gradient="from-amber-500/10 to-yellow-500/10"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Revenue vs Expense Chart */}
                    <div className="xl:col-span-2 bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Revenue vs Expense</h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Revenue</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-rose-500" /> Expense</span>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <canvas ref={chartRef} />
                        </div>
                    </div>

                    {/* Right Column: Mini Charts */}
                    <div className="space-y-8">
                        {/* Plan Distribution */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                            <h3 className="text-lg font-bold mb-4 text-center">Plan Distribution</h3>
                            <div className="h-[200px] flex items-center justify-center">
                                <canvas ref={planChartRef} />
                            </div>
                        </div>

                        {/* Expense Breakdown */}
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                            <h3 className="text-lg font-bold mb-4 text-center">Expense Breakdown</h3>
                            <div className="h-[200px] flex items-center justify-center">
                                <canvas ref={expenseChartRef} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Activities & Coupon Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Recent Plan Transactions */}
                    <div className="xl:col-span-2 bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Recent Plan Payments</h3>
                            <Link href="/superadmin/transaction" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {data.recentActivity.planPayments.map((payment) => (
                                <div key={payment.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{payment.school?.schoolName || "Unnamed School"}</p>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase">{payment.plan?.name || "No Plan"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-500">{formatCurrency(payment.amount)}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{payment.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Internal Cash Flow */}
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Cash Flow</h3>
                            <Link href="/superadmin/income-expense" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {data.recentActivity.internalIncome.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs">{item.source}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-xs text-emerald-600">+{formatCurrency(item.amount, true)}</p>
                                </div>
                            ))}
                            {data.recentActivity.internalExpenses.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <ArrowDownRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs">{item.category?.name || "General"}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-xs text-rose-600">-{formatCurrency(item.amount, true)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coupon Stats */}
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5">
                        <h3 className="text-xl font-bold mb-6">Coupon Stats</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Active</p>
                                    <p className="text-2xl font-black text-indigo-600">{data.stats.activeCoupons}</p>
                                </div>
                                <Ticket className="w-8 h-8 text-indigo-500 opacity-20" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-500/5 border border-gray-500/10">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Expired</p>
                                    <p className="text-2xl font-black text-gray-600">{data.stats.expiredCoupons}</p>
                                </div>
                                <Ticket className="w-8 h-8 text-gray-500 opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details Section - Simple Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LinkCard title="Schools & Accounts" count={data.stats.totalSchools} icon={<School className="w-8 h-8" />} color="indigo" href="/superadmin/schools" />
                    <LinkCard title="Membership Plans" count={data.stats.totalPlans} icon={<CreditCard className="w-8 h-8" />} color="amber" href="/superadmin/membership-plans" />
                    <LinkCard title="Coupon Codes" count={data.stats.totalCoupons} icon={<Ticket className="w-8 h-8" />} color="teal" href="/superadmin/coupon-codes" />
                </div>
            </div>

            {showModal && (
                <FinanceFormModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchData();
                    }}
                    categories={data.categories}
                />
            )}
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon, trend, trendUp, gradient }: any) {
    return (
        <div className={`relative group overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-xl shadow-black/5 hover:-translate-y-1 transition-all duration-300`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl transition-colors group-hover:bg-white dark:group-hover:bg-white/10">
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {trend}
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-3xl font-black">{value}</h3>
            </div>
        </div>
    );
}

function LinkCard({ title, count, icon, color, href }: any) {
    const colors: any = {
        indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20",
        amber: "text-amber-600 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
        teal: "text-teal-600 bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20"
    };
    return (
        <Link href={href || "#"} className={`group p-6 rounded-3xl border ${colors[color]} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                {icon}
                <div className="text-3xl font-black">{count}</div>
            </div>
            <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{title}</span>
                <div className="p-2 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
        </Link>
    );
}
