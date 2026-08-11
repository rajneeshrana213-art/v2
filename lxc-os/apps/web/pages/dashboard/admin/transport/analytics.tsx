import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "@/lib/api/client";
import {
    BarChart3, TrendingUp, PieChart,
    Download, Calendar, Users,
    Map, Fuel, Timer,
    AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";

function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("monthly");
    const { user } = useAuth();

    const fetchData = async (refresh = false) => {
        try {
            setLoading(true);
            const res = await client.get(`/v1/transport/analytics?periodType=${period}${refresh ? '&refresh=true' : ''}`);
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to load analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.schoolId) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // 30s refresh
            return () => clearInterval(interval);
        }
    }, [period, user?.schoolId]);

    const current = analytics[0] || {};
    const previous = analytics[1] || {};

    const getTrend = (curr: number, prev: number) => {
        if (!prev || prev === 0) return { val: 0, up: true };
        const diff = ((curr - prev) / prev) * 100;
        return { val: Math.abs(diff).toFixed(1), up: diff >= 0 };
    };

    const fuelTrend = getTrend(current.totalCost || 0, previous.totalCost || 0);
    const onTimeTrend = getTrend(current.onTimePercentage || 0, previous.onTimePercentage || 0);
    const utilizationTrend = getTrend(current.busUtilizationRate || 0, previous.busUtilizationRate || 0);
    const incidentTrend = getTrend(current.totalIncidents || 0, previous.totalIncidents || 0);

    return (
        <>
            <Head>
                <title>Transport Intelligence - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Logistics Analytics
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Data-driven insights into your school's transport efficiency.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex p-1 rounded-2xl bg-gray-100 dark:bg-white/5">
                                {['weekly', 'monthly', 'yearly'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800' : 'text-gray-400'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-2xl h-10 w-10"
                                onClick={() => fetchData(true)}
                                disabled={loading}
                            >
                                {loading ? <Loader size="sm" variant="primary" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl dark:bg-slate-900">
                            <CardContent className="p-0 space-y-2">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center dark:bg-blue-900/10">
                                    <Fuel className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Est. Fuel Cost</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">₹{current.totalCost?.toLocaleString() || 0}</p>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${fuelTrend.up ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    <TrendingUp className={`h-3 w-3 ${!fuelTrend.up && 'rotate-180'}`} /> {fuelTrend.val}% vs last {period}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl dark:bg-slate-900">
                            <CardContent className="p-0 space-y-2">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center dark:bg-emerald-900/10">
                                    <Timer className="h-5 w-5 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">On-Time Performance</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{current.onTimePercentage?.toFixed(1) || 0}%</p>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${onTimeTrend.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <TrendingUp className={`h-3 w-3 ${!onTimeTrend.up && 'rotate-180'}`} /> {onTimeTrend.val}% stability shift
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl dark:bg-slate-900">
                            <CardContent className="p-0 space-y-2">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center dark:bg-indigo-900/10">
                                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asset Utilization</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{current.busUtilizationRate?.toFixed(1) || 0}%</p>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${utilizationTrend.up ? 'text-indigo-500' : 'text-amber-500'}`}>
                                    <TrendingUp className={`h-3 w-3 ${!utilizationTrend.up && 'rotate-180'}`} /> {utilizationTrend.val}% resource utilization
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl dark:bg-slate-900">
                            <CardContent className="p-0 space-y-2">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center dark:bg-amber-900/10">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Incidents</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{current.totalIncidents || 0}</p>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${incidentTrend.up && current.totalIncidents > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    <AlertCircle className="h-3 w-3" /> {incidentTrend.val}% incident rate change
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {loading && analytics.length === 0 ? (
                        <div className="flex h-[60vh] items-center justify-center">
                            <Loader size="xl" variant="primary" />
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="rounded-[2.5rem] border-none bg-gray-900 p-8 text-white shadow-2xl min-h-[400px]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-indigo-400" />
                                        Trip Punctuality Curve
                                    </h3>
                                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-slate-500" />
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end justify-between h-48 gap-4">
                                    {(analytics.length > 0 ? [...analytics].reverse().slice(-7) : [0, 0, 0, 0, 0, 0, 0]).map((item: any, i) => {
                                        const h = typeof item === 'number' ? 0 : item.onTimePercentage;
                                        const date = typeof item === 'number' ? `Day ${i + 1}` : new Date(item.periodStart).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                                <div className="relative w-full">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        className="w-full bg-indigo-500 rounded-t-xl group-hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
                                                    />
                                                </div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-12 flex gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">On-Time %</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-slate-700" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target (95%)</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-[3rem] border-none bg-white p-8 shadow-xl dark:bg-slate-900">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <Users className="h-6 w-6 text-emerald-500" />
                                        Fleet Occupancy
                                    </h3>
                                </div>
                                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {current.routeEfficiency && Object.keys(current.routeEfficiency).length > 0 ? (
                                        Object.values(current.routeEfficiency as any).map((r: any, i: number) => (
                                            <div key={r.routeId} className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                                                    <span>{r.routeName}</span>
                                                    <span>{r.occupancyRate.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${r.occupancyRate}%` }}
                                                        className={`h-full rounded-full ${r.occupancyRate > 90 ? 'bg-rose-500' : r.occupancyRate > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center text-gray-400 text-sm font-medium">
                                            No route data available for this period.
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">Observation</p>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {current.busUtilizationRate < 50
                                            ? "Fleet utilization is lower than average. Consider reviewing route overlaps to optimize fuel costs."
                                            : current.onTimePercentage < 80
                                                ? "On-time performance has dropped. Check for traffic patterns or route delays in active routes."
                                                : "Fleet performance is stable. Maintain current maintenance schedules for optimal reliability."}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

export default dynamic(() => Promise.resolve(AnalyticsPage), { ssr: false });
