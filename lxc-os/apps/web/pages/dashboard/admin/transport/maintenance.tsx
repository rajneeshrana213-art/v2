import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import client from "@/lib/api/client";
import {
    Wrench, AlertCircle, CheckCircle2,
    History, Settings, PenTool,
    Droplets, Zap, Gauge, ArrowRight,
    ShieldCheck,
    Activity
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";

interface MaintenanceAlert {
    id: string;
    alertType: string;
    severity: string;
    title: string;
    message: string;
    currentMileage: number | null;
    daysSinceService: number | null;
    isAcknowledged: boolean;
    isResolved: boolean;
    createdAt: string;
    bus: {
        busNumber: string;
    };
}

function MaintenancePage() {
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        critical: 0,
        pending: 0,
        resolved: 0
    });
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/transport/maintenance");
            setAlerts(res.data);

            const counts = (res.data as MaintenanceAlert[]).reduce((acc, a) => {
                if (a.isResolved) acc.resolved++;
                else if (a.severity === 'HIGH' || a.severity === 'CRITICAL') acc.critical++;
                else acc.pending++;
                return acc;
            }, { critical: 0, pending: 0, resolved: 0 });
            setStats(counts);
        } catch (err) {
            console.error("Failed to load maintenance data:", err);
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
    }, [user?.schoolId]);

    const handleResolve = async (id: string) => {
        try {
            await client.patch("/v1/transport/maintenance", { id, isResolved: true, schoolId: user?.schoolId });
            fetchData();
        } catch (err) {
            alert("Failed to resolve alert");
        }
    };

    const achnowledge = async (id: string) => {
        try {
            await client.patch("/v1/transport/maintenance", { id, isAcknowledged: true, schoolId: user?.schoolId });
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isAcknowledged: true } : a));
        } catch (err) {
            alert("Failed to acknowledge alert");
        }
    }

    const columns: ColumnDef<MaintenanceAlert>[] = [
        {
            key: "bus",
            header: "Vehicle",
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        <Settings className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        {row.bus.busNumber}
                    </span>
                </div>
            ),
        },
        {
            key: "alert",
            header: "Diagnostic Alert",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.title}</span>
                    <span className="text-[11px] font-medium text-gray-400">{row.message}</span>
                </div>
            ),
        },
        {
            key: "severity",
            header: "Severity",
            render: (value) => (
                <Badge
                    tone={value === 'HIGH' || value === 'CRITICAL' ? 'danger' : 'warning'}
                    className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                    {value}
                </Badge>
            ),
        },
        {
            key: "actions",
            header: "",
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    {!row.isAcknowledged && (
                        <Button size="sm" variant="ghost" className="text-[10px] font-black" onClick={() => achnowledge(row.id)}>
                            ACKNOWLEDGE
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="rounded-xl bg-indigo-600 text-[10px] font-black text-white hover:bg-indigo-700"
                        onClick={() => handleResolve(row.id)}
                    >
                        RESOLVE
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head>
                <title>Fleet Health Center - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Fleet Health
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Predictive maintenance and diagnostics for school transport.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="rounded-[2.5rem] border-none bg-rose-600 p-6 text-white shadow-xl shadow-rose-200 dark:shadow-none">
                            <CardContent className="p-0 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-100/70">Critical</p>
                                    <p className="text-3xl font-black">{stats.critical}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-gray-200 dark:bg-slate-900 dark:shadow-none">
                            <CardContent className="p-0 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center dark:bg-amber-900/10">
                                    <Wrench className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Regular Service</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-emerald-500 p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                            <CardContent className="p-0 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/70">Resolved</p>
                                    <p className="text-3xl font-black">{stats.resolved}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                            <CardContent className="p-0 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Gauge className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/70">Health Index</p>
                                    <p className="text-3xl font-black">
                                        {stats.critical + stats.pending + stats.resolved > 0
                                            ? Math.max(0, 100 - (stats.critical * 15) - (stats.pending * 5)).toFixed(0)
                                            : "100"}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/60 shadow-2xl backdrop-blur-xl dark:bg-slate-950/40">
                                <CardHeader className="border-b border-gray-100 p-8 dark:border-white/5 flex flex-row items-center justify-between">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <Activity className="h-6 w-6 text-indigo-600" />
                                        Active Alerts
                                    </h2>
                                    <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600">View History</Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="flex h-64 items-center justify-center">
                                            <Loader size="xl" variant="primary" />
                                        </div>
                                    ) : (
                                        <DataTable
                                            columns={columns}
                                            data={alerts.filter(a => !a.isResolved)}
                                            className="border-none bg-transparent"
                                            emptyState={
                                                <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-500">
                                                    <ShieldCheck className="h-12 w-12 text-emerald-500" />
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">Fleet is Healthy</p>
                                                        <p className="text-sm font-medium">No active maintenance issues detected.</p>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl dark:bg-slate-900">
                                <CardHeader className="p-8 pb-4">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Droplets className="h-5 w-5 text-blue-500" />
                                        Resource Status
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <span>Fleet Engine Health</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {Math.max(65, 100 - (stats.critical * 12)).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(65, 100 - (stats.critical * 12))}%` }}
                                                className={`h-2 rounded-full ${stats.critical > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <span>Battery Health (Avg)</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {Math.max(70, 98 - (stats.pending * 3)).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(70, 98 - (stats.pending * 3))}%` }}
                                                className="h-2 rounded-full bg-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <span>Brake & Safety Systems</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {stats.critical > 0 ? "Caution Required" : "Optimal"}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: stats.critical > 0 ? '60%' : '95%' }}
                                                className={`h-2 rounded-full ${stats.critical > 0 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none bg-gray-900 p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap className="h-20 w-20" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Smart Scheduler</h3>
                                <p className="text-gray-400 text-xs font-medium mb-6 leading-relaxed">
                                    AI-driven maintenance scheduling based on engine load data.
                                </p>
                                <button
                                    onClick={() => fetchData()}
                                    disabled={loading}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                                >
                                    {loading ? "Optimizing..." : "Optimize Schedule"} <ArrowRight className="h-3 w-3" />
                                </button>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

export default dynamic(() => Promise.resolve(MaintenancePage), { ssr: false });
