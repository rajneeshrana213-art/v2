import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { BarChart3, TrendingUp, Wallet, PieChart, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from "next/link";
import Loader from '@/components/ui/feedback/Loader';

const Pie = dynamic(
  () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Pie })),
  { ssr: false }
);
const Line = dynamic(
  () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Line })),
  { ssr: false }
);

const fmt = (n: number) =>
    `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CollectionSummaryReportPage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user?.schoolId) return;
        try {
            setLoading(true);
            setError(null);
            // No academicYearId needed — API resolves the active year automatically
            const res = await client.get("/v1/finance/reports/collection-summary");
            setData(res.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err.message ||
                "Failed to load report data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.schoolId]);

    const pieData = {
        labels: data?.headWise?.map((h: any) => h.headName) || [],
        datasets: [
            {
                data: data?.headWise?.map((h: any) => h.collected) || [],
                backgroundColor: [
                    "#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
                    "#06b6d4", "#84cc16", "#f97316", "#a855f7",
                ],
                borderWidth: 0,
            },
        ],
    };

    const trendData = {
        labels: data?.trend?.map((t: any) => t.month) || [],
        datasets: [
            {
                label: "Collections",
                data: data?.trend?.map((t: any) => t.amount) || [],
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <>
            <Head>
                <title>Collection Summary – Finance | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/admin/finance/reports"
                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                                Collection Summary
                            </h1>
                            <p className="text-sm text-gray-500">
                                Revenue distribution across fee heads and monthly trends.
                            </p>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex h-48 items-center justify-center">
                            <Loader className="" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/30 dark:bg-rose-900/20 dark:text-rose-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && !error && data && (
                        <>
                            {/* Stat cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1">
                                            <Wallet className="h-3 w-3" /> Total Collected
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                            {fmt(data.totalCollected)}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Life-time academic year collection
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] uppercase text-gray-400 font-bold">
                                            Advance Pool
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                            {fmt(data.excessInAdvance)}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Unallocated surplus from parents
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] uppercase text-gray-400 font-bold">
                                            Top Fee Head
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 truncate">
                                            {data.headWise?.[0]?.headName || "N/A"}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Highest revenue generator
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <PieChart className="h-4 w-4 text-indigo-500" />
                                            Revenue by Fee Head
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px] flex items-center justify-center">
                                            {data.headWise?.some((h: any) => h.collected > 0) ? (
                                                <Pie
                                                    data={pieData}
                                                    options={{
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-400">No collection data available.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                                            Monthly Collection Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px]">
                                            <Line
                                                data={trendData}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: {
                                                        y: {
                                                            ticks: {
                                                                callback: (v) => `₹${Number(v).toLocaleString("en-IN")}`,
                                                                font: { size: 10 },
                                                            },
                                                            grid: { color: "rgba(0,0,0,0.05)" },
                                                        },
                                                        x: { ticks: { font: { size: 10 } } },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Head-wise table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Head-wise Breakdown</CardTitle>
                                    <CardDescription>
                                        Demand vs. collection for each fee component.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.headWise?.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-gray-400">
                                            No fee head data found for this academic year.
                                        </p>
                                    ) : (
                                        <div className="rounded-xl border border-gray-100 overflow-hidden dark:border-white/5">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-900">
                                                    <tr className="text-[11px] uppercase text-gray-400">
                                                        <th className="px-4 py-3 font-semibold">Fee Head</th>
                                                        <th className="px-4 py-3 font-semibold text-right">Demand</th>
                                                        <th className="px-4 py-3 font-semibold text-right">Collected</th>
                                                        <th className="px-4 py-3 font-semibold text-right">Outstanding</th>
                                                        <th className="px-4 py-3 font-semibold text-right">Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                                    {data.headWise.map((h: any) => {
                                                        const progress = h.demanded > 0
                                                            ? Math.min(100, (h.collected / h.demanded) * 100)
                                                            : 0;
                                                        return (
                                                            <tr
                                                                key={h.headId}
                                                                className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/5"
                                                            >
                                                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                                    {h.headName}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                                    {fmt(h.demanded)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                                    {fmt(h.collected)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-rose-600">
                                                                    {fmt(h.outstanding)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="inline-flex items-center gap-2">
                                                                        <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
                                                                            <div
                                                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                                                style={{ width: `${progress}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-500 w-8 text-right">
                                                                            {progress.toFixed(0)}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* No data empty state */}
                    {!loading && !error && !data && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                            <p className="mt-3 text-sm font-medium text-gray-500">No report data yet</p>
                            <p className="mt-1 text-xs text-gray-400">
                                Data will appear once fee demands and payments exist.
                            </p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
