import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    GraduationCap,
    School,
    TrendingUp,
    Activity,
    Search,
    Filter,
    BarChart3,
    CheckCircle2
} from 'lucide-react';
import { Loader } from "@/components/ui/feedback/Loader";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import client from "@/lib/api/client";
import BranchSwitcher from "@/components/dashboard/group-admin/BranchSwitcher";
import { cn } from "@/lib/utils";

const Line = dynamic(
    () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Line })),
    { ssr: false }
);
const Bar = dynamic(
    () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Bar })),
    { ssr: false }
);

interface GroupDashboardData {
    summary: {
        totalBranches: number;
        totalStudents: number;
        totalTeachers: number;
        totalRevenue: number;
        planName?: string;
        branchLimit?: number;
    };
    branchPerformance: {
        branchId: string;
        branchName: string;
        students: number;
        attendance: number;
        revenue: number;
    }[];
    analytics?: {
        revenueTrends: { month: string; revenue: number }[];
    };
}

export default function GroupAdminDashboardPage() {
    const [data, setData] = useState<GroupDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                setLoading(true);
                const [dashRes, statsRes] = await Promise.all([
                    client.get("/v1/dashboard/group-admin"),
                    client.get("/v1/group-admin/stats")
                ]);
                setData({
                    ...dashRes.data,
                    analytics: statsRes.data
                });
            } catch (err: any) {
                console.error("Failed to fetch group dashboard data:", err);
                setError("Failed to load group-level statistics. Please ensure you have sufficient permissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="group_admin">
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Group Admin Dashboard - LearnXChain</title>
            </Head>
            <DashboardLayout role="group_admin">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Overview</h1>
                            <p className="text-gray-500">Aggregated insights across all your branches</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="soft" tone="info" className="px-3 py-1">
                                Active Organization
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Total Branches" value={data?.summary?.totalBranches ?? 0} icon={School} color="indigo" />
                        <MetricCard title="Total Students" value={data?.summary?.totalStudents ?? 0} icon={GraduationCap} color="emerald" />
                        <MetricCard title="Total Teachers" value={data?.summary?.totalTeachers ?? 0} icon={Users} color="sky" />
                        <MetricCard title="Total Revenue" value={`₹${(data?.summary?.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="violet" />
                    </div>

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Quick Branch Focus</h3>
                        </div>
                        <BranchSwitcher />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Revenue Growth Trend</CardTitle>
                                <CardDescription>Monthly aggregated revenue across all branches</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {data?.analytics?.revenueTrends ? (
                                    <Line
                                        data={{
                                            labels: data.analytics.revenueTrends.map(t => t.month),
                                            datasets: [{
                                                label: 'Revenue (₹)',
                                                data: data.analytics.revenueTrends.map(t => t.revenue),
                                                borderColor: '#6366f1',
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                fill: true,
                                                tension: 0.4
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { beginAtZero: true, grid: { display: false } },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">Loading trends...</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm dark:bg-gray-900/50 bg-indigo-600 text-white">
                            <CardHeader>
                                <CardTitle className="text-white">Organization Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <p className="text-indigo-100 text-xs font-bold uppercase">Current Subscription</p>
                                    <p className="text-xl font-bold">{data?.summary?.planName || "No Active Plan"}</p>
                                    <div className="mt-2 text-xs flex items-center gap-1.5 text-indigo-200">
                                        <CheckCircle2 className="h-3 w-3" /> 
                                        {data?.summary?.planName ? "Auto-renewal Active" : "Action Required"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-indigo-100">Branch Usage</span>
                                        <span className="font-bold">{data?.summary?.totalBranches ?? 0} / {data?.summary?.branchLimit || 10}</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white" style={{ width: `${Math.min((data?.summary?.totalBranches || 1) * (100 / (data?.summary?.branchLimit || 10)), 100)}%` }} />
                                    </div>
                                </div>

                                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold" onClick={() => window.location.href = '/dashboard/group-admin/billing'}>
                                    Manage Billing
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card variant="outline" className="border-indigo-500/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-500" />
                                Branch performance Comparison
                            </CardTitle>
                            <CardDescription>Key metrics segmented by school branch</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100 dark:border-white/5">
                                        <tr>
                                            <th className="px-4 py-3">Branch Name</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3">Attendance</th>
                                            <th className="px-4 py-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {(data?.branchPerformance ?? []).map((branch) => (
                                            <tr key={branch.branchId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{branch.branchName}</td>
                                                <td className="px-4 py-3">{branch.students}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500"
                                                                style={{ width: `${branch.attendance}%` }}
                                                            />
                                                        </div>
                                                        <span>{branch.attendance}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold">₹{branch.revenue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </DashboardLayout>
        </>
    );
}

function MetricCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-500/10",
        emerald: "text-emerald-600 bg-emerald-500/10",
        sky: "text-sky-600 bg-sky-500/10",
        violet: "text-violet-600 bg-violet-500/10",
    };

    return (
        <Card className="border-none shadow-sm dark:bg-gray-900/50">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2 rounded-xl", colors[color])}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <BarChart3 className="h-4 w-4 text-gray-300" />
                </div>
                <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
