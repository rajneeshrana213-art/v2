
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Loader } from "@/components/ui/feedback/Loader";
import { getAccessToken } from "@/lib/api/client";
import { 
    ArrowLeft, 
    Activity, 
    School, 
    Clock, 
    Monitor, 
    Smartphone, 
    Zap, 
    PieChart as PieChartIcon,
    Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid,
    AreaChart,
    Area
} from "recharts";

interface UserStatsData {
    user: {
        name: string;
        email: string;
        role: string;
        profilePic?: string;
        schoolName: string;
        lastOnline: string;
    };
    stats: {
        totalActions: number;
        moduleBreakdown: { name: string; count: number }[];
        timeDistribution: number[];
    };
    logs: {
        module: string;
        device: string;
        timestamp: string;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function UserStatsPage() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchData = async (targetPage = page) => {
        if (!id) return;
        try {
            const res = await fetch(`/api/v1/superadmin/user-stats/${id}?page=${targetPage}`, {
                headers: {
                    "Authorization": `Bearer ${getAccessToken()}`
                }
            });
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error("Error fetching user stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData(1);
    }, [id]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchData(newPage);
    };

    if (loading || !data) {
        return (
            <DashboardLayout role="superadmin">
                <div className="h-[80vh] flex items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    const timeChartData = data.stats.timeDistribution.map((count, hour) => ({
        hour: `${hour}:00`,
        actions: count
    }));

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>{data.user.name}'s Stats | LearnXChain</title>
            </Head>

            <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-8">
                {/* Header & Profile Section */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                    Detailed User Analytics
                                </h1>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">In-depth behavioral tracking</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border-4 border-white dark:border-gray-800 overflow-hidden relative shadow-lg">
                                {data.user.profilePic ? <Image src={data.user.profilePic} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center text-3xl font-black text-indigo-300">{data.user.name[0]}</div>}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-50">{data.user.name}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">{data.user.role}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><School className="h-3 w-3" /> {data.user.schoolName}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Last Active: {new Date(data.user.lastOnline).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{data.user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-80 grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between aspect-square lg:aspect-auto lg:h-32">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Total Interactions</p>
                            <p className="text-4xl font-black">{data.stats.totalActions.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between aspect-square lg:aspect-auto lg:h-32">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Top Module</p>
                            <p className="text-xl font-black text-gray-900 dark:text-gray-50 truncate">{data.stats.moduleBreakdown[0]?.name || "None"}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Time Distribution Chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg">Activity Hotspots (24h)</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeChartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="actions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    <XAxis dataKey="hour" hide />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Module Breakdown Chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <PieChartIcon className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg">Module Usage Frequency</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.stats.moduleBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        cursor={{ fill: '#88888811' }}
                                    />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Interaction History */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg">Detailed Interaction Log</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-gray-400">
                                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} entries)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-1 px-3 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= data.pagination.totalPages}
                                    className="p-1 px-3 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Module</th>
                                    <th className="px-8 py-4">Device</th>
                                    <th className="px-8 py-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {data.logs.map((log, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{log.module || "System"}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {log.device === 'web' ? <Monitor className="h-3.5 w-3.5 text-blue-500" /> : <Smartphone className="h-3.5 w-3.5 text-purple-500" />}
                                                <span className="text-xs font-medium uppercase tracking-tighter text-gray-500">{log.device}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="p-4 bg-gray-50/30 dark:bg-white/5 flex items-center justify-between px-8">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Showing 20 items per page</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-xs font-bold shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= data.pagination.totalPages}
                                className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold shadow-sm"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

