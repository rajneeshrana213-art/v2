
import Head from "next/head";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Calendar, Zap, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';

enum KPIType {
    LEADS_GENERATED = "LEADS_GENERATED",
    DEMOS_COMPLETED = "DEMOS_COMPLETED",
    SCHOOLS_ONBOARDED = "SCHOOLS_ONBOARDED",
    TICKETS_RESOLVED = "TICKETS_RESOLVED",
    SALES_REVENUE = "SALES_REVENUE"
}

const KPI_LABELS: Record<KPIType, string> = {
    LEADS_GENERATED: "Leads Generated",
    DEMOS_COMPLETED: "Demos Completed",
    SCHOOLS_ONBOARDED: "Schools Onboarded",
    TICKETS_RESOLVED: "Tickets Resolved",
    SALES_REVENUE: "Sales Revenue"
};

const KPI_COLORS: Record<KPIType, { text: string; bg: string; border: string }> = {
    LEADS_GENERATED: { text: "text-blue-600", bg: "bg-blue-600", border: "border-blue-200" },
    DEMOS_COMPLETED: { text: "text-purple-600", bg: "bg-purple-600", border: "border-purple-200" },
    SCHOOLS_ONBOARDED: { text: "text-emerald-600", bg: "bg-emerald-600", border: "border-emerald-200" },
    TICKETS_RESOLVED: { text: "text-indigo-600", bg: "bg-indigo-600", border: "border-indigo-200" },
    SALES_REVENUE: { text: "text-amber-600", bg: "bg-amber-600", border: "border-amber-200" }
};

const ICON_MAP: Record<string, any> = {
    Zap,
    Star,
    Target,
    Award
};

export default function PerformancePage() {
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");

    useEffect(() => {
        fetchPerformanceData();
    }, [selectedPeriod]);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (selectedPeriod) params.period = selectedPeriod;

            const res = await client.get("/v1/employee/performance", { params });
            setPerformanceData(res.data);
        } catch (err: any) {
            console.error("Failed to fetch performance data:", err);
            toast.error(err.response?.data?.error || "Failed to load performance data");
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (value: number, type: KPIType): string => {
        if (type === KPIType.SALES_REVENUE) {
            return `₹${(value / 1000).toFixed(1)}K`;
        }
        return Math.round(value).toString();
    };

    const getTrendIcon = (trend: number) => {
        if (trend > 5) return <ArrowUp className="h-3 w-3 text-emerald-500" />;
        if (trend < -5) return <ArrowDown className="h-3 w-3 text-red-500" />;
        return <Minus className="h-3 w-3 text-gray-400" />;
    };

    const getPerformanceLevel = (score: number): { label: string; color: string; bg: string } => {
        if (score >= 90) return { label: "Elite Performer", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
        if (score >= 75) return { label: "Top Performer", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" };
        if (score >= 60) return { label: "Good Performer", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" };
        if (score >= 40) return { label: "Average", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" };
        return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" };
    };

    const chartData = useMemo(() => {
        if (!performanceData?.trends) return [];

        const months = performanceData.trends.LEADS_GENERATED?.map((t: any) => t.period) || [];
        return months.map((period: string) => {
            const monthData: any = { period };
            Object.keys(KPI_LABELS).forEach(type => {
                const trend = performanceData.trends[type]?.find((t: any) => t.period === period);
                monthData[type] = trend?.value || 0;
            });
            return monthData;
        });
    }, [performanceData]);

    const maxChartValue = useMemo(() => {
        if (!chartData.length) return 100;
        let max = 0;
        chartData.forEach((month: any) => {
            Object.values(KPI_LABELS).forEach((_, idx) => {
                const type = Object.keys(KPI_LABELS)[idx] as KPIType;
                max = Math.max(max, month[type] || 0);
            });
        });
        return Math.ceil(max * 1.1);
    }, [chartData]);

    if (loading) {
        return (
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-8 pb-8 flex items-center justify-center min-h-[60vh]">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    const performanceLevel = performanceData?.overallScore
        ? getPerformanceLevel(performanceData.overallScore)
        : { label: "No Data", color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-900/20" };

    return (
        <>
            <Head>
                <title>Performance Metrics - LearnXChain</title>
            </Head>
            <DashboardLayout role="employee">
                <div className="w-full mx-auto space-y-8 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Track your monthly targets, achievements, and performance trends.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {performanceData?.availablePeriods && performanceData.availablePeriods.length > 0 && (
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                    <option value="">Current Period</option>
                                    {performanceData.availablePeriods.map((period: string) => (
                                        <option key={period} value={period}>{period}</option>
                                    ))}
                                </select>
                            )}
                            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border", performanceLevel.bg, performanceLevel.color, "border-current/20")}>
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-bold">{performanceLevel.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Overall Score */}
                    {performanceData?.overallScore !== undefined && (
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Overall Performance Score</div>
                                    <div className="text-5xl font-bold">{performanceData.overallScore}%</div>
                                    <div className="text-sm opacity-80 mt-2">Based on all KPIs for {performanceData.currentPeriod}</div>
                                </div>
                                <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                                    <Target className="h-12 w-12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {Object.entries(KPI_LABELS).map(([type, label]) => {
                            const kpiType = type as KPIType;
                            const kpi = performanceData?.kpiData?.[kpiType];
                            const current = kpi?.current;
                            const colors = KPI_COLORS[kpiType];

                            // Always show the card, even if value is 0 (0 is valid data)
                            // Only show "No data" if current is null/undefined (not calculated)
                            if (!current) {
                                return (
                                    <div key={type} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                                            <Target className={cn("h-4 w-4", colors.text)} />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">-</div>
                                        <div className="mt-4 text-xs text-gray-500">No data available</div>
                                    </div>
                                );
                            }

                            // Use the calculated value (even if 0)
                            const value = current.value ?? 0;

                            const progress = current.target && current.target > 0
                                ? Math.min((value / current.target) * 100, 100)
                                : 0;

                            const trend = kpi?.trend || 0;
                            const trendValue = Math.abs(trend).toFixed(1);

                            return (
                                <div key={type} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(trend)}
                                            {trend !== 0 && (
                                                <span className={cn("text-[10px] font-bold", trend > 0 ? "text-emerald-500" : "text-red-500")}>
                                                    {trendValue}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatValue(value, kpiType)}
                                        {current.target && (
                                            <span className="text-lg text-gray-400">/{formatValue(current.target, kpiType)}</span>
                                        )}
                                    </div>
                                    {current.target && (
                                        <>
                                            <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000", colors.bg)}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {progress.toFixed(0)}% of target
                                            </div>
                                        </>
                                    )}
                                    {kpi?.average && (
                                        <div className="mt-2 text-[10px] text-gray-400">
                                            Avg: {formatValue(kpi.average, kpiType)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Trends Section */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                                    Performance Trend (Last 6 Months)
                                </h2>
                            </div>

                            {chartData.length > 0 ? (
                                <div className="h-80 flex items-end justify-between gap-2 px-4 pb-2 border-b border-gray-100 dark:border-white/5">
                                    {chartData.map((month: any, idx: number) => {
                                        const periodLabel = month.period.split(' ')[0]; // Get month abbreviation
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                                <div className="w-full flex items-end justify-center gap-1" style={{ height: '200px' }}>
                                                    {Object.entries(KPI_LABELS).slice(0, 5).map(([type], typeIdx) => {
                                                        const value = month[type] || 0;
                                                        const height = maxChartValue > 0 ? (value / maxChartValue) * 100 : 0;
                                                        const colors = KPI_COLORS[type as KPIType];
                                                        return (
                                                            <div
                                                                key={type}
                                                                className={cn(
                                                                    "flex-1 rounded-t transition-all duration-500 group-hover:opacity-80",
                                                                    colors.bg,
                                                                    "opacity-60"
                                                                )}
                                                                style={{ height: `${Math.max(height, 2)}%` }}
                                                                title={`${KPI_LABELS[type as KPIType]}: ${value}`}
                                                            ></div>
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{periodLabel}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No trend data available</p>
                                    </div>
                                </div>
                            )}

                            {/* Legend */}
                            {chartData.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                    {Object.entries(KPI_LABELS).slice(0, 5).map(([type, label]) => {
                                        const colors = KPI_COLORS[type as KPIType];
                                        return (
                                            <div key={type} className="flex items-center gap-2">
                                                <div className={cn("h-3 w-3 rounded", colors.bg)}></div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Achievements & Rewards */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Badges & Achievements</h3>
                                {performanceData?.achievements && performanceData.achievements.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {performanceData.achievements.map((achievement: any, i: number) => {
                                            const Icon = ICON_MAP[achievement.icon] || Award;
                                            return (
                                                <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                                                    <Icon className={cn("h-3 w-3", achievement.color)} />
                                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">{achievement.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic">No achievements yet. Keep performing to unlock badges!</div>
                                )}
                            </div>

                            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold">Performance Insights</h3>
                                    <p className="text-xs opacity-80 mt-1">
                                        {performanceData?.overallScore && performanceData.overallScore >= 90
                                            ? "Outstanding performance! You're exceeding expectations."
                                            : performanceData?.overallScore && performanceData.overallScore >= 75
                                                ? "Great work! You're on track to meet your goals."
                                                : performanceData?.overallScore && performanceData.overallScore >= 60
                                                    ? "Good progress. Focus on areas that need improvement."
                                                    : "Keep pushing! Review your targets and plan your approach."}
                                    </p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        {performanceData?.overallScore && performanceData.overallScore < 100 && (
                                            <div className="text-xs opacity-80">
                                                {100 - performanceData.overallScore}% to perfect score
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Period Summary */}
                            {performanceData?.currentPeriod && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Period Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Current Period</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{performanceData.currentPeriod}</span>
                                        </div>
                                        {performanceData.kpis && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Active KPIs</span>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{performanceData.kpis.length}</span>
                                            </div>
                                        )}
                                        {performanceData.overallScore !== undefined && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Overall Score</span>
                                                <span className={cn("text-sm font-bold", performanceLevel.color)}>{performanceData.overallScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
