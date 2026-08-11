
import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Loader } from "@/components/ui/feedback/Loader";
import { getAccessToken } from "@/lib/api/client";
import { Monitor, Smartphone, Layout, ArrowLeft, RefreshCw, School, Clock, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface ActiveUser {
    name: string;
    email: string;
    role: string;
    schoolName: string;
    loginTime: string;
    lastActive: string;
    duration: number;
    avatar?: string;
    module: string;
}

interface ActiveUsersData {
    webUsers: ActiveUser[];
    appUsers: ActiveUser[];
    topUser: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        schoolName: string;
        score: number;
    } | null;
}

export default function ActiveUsersPage() {
    const [data, setData] = useState<ActiveUsersData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [days, setDays] = useState(5);
    const [isCustomDate, setIsCustomDate] = useState(false);

    const fetchData = async (currentDays = days) => {
        try {
            const res = await fetch(`/api/v1/superadmin/active-users?days=${currentDays}`, {
                headers: {
                    "Authorization": `Bearer ${getAccessToken()}`
                }
            });
            const jsonData = await res.json();
            setData(jsonData);
        } catch (error) {
            console.error("Error fetching active users:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatDuration = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        return `${hours}h ${mins % 60}m`;
    };

    const getTimeAgo = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        return `${mins}m ago`;
    };

    const UserTable = ({ users, type }: { users: ActiveUser[], type: 'web' | 'app' }) => (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm h-full flex flex-col">
            <div className={`p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r ${type === 'web' ? 'from-blue-50 to-transparent dark:from-blue-500/5' : 'from-purple-50 to-transparent dark:from-purple-500/5'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type === 'web' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20'}`}>
                        {type === 'web' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-50">{type === 'web' ? 'Web Portal Users' : 'Mobile App Users'}</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{users.length} Active Now</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {users.slice(0, 5).map((u, i) => (
                        <div key={i} className="h-7 w-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                             {u.avatar ? <Image src={u.avatar} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">{u.name[0]}</div>}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-white/5">
                            <th className="px-6 py-4">User</th>
                            <th className="px-4 py-4">School</th>
                            <th className="px-4 py-4">Module</th>
                            <th className="px-4 py-4 text-center">Duration</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {users.length > 0 ? users.map((user, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={idx} 
                                className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
                                            {user.avatar ? <Image src={user.avatar} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-gray-400">{user.name[0]}</div>}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</span>
                                            <span className="text-[11px] text-gray-500 truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <School className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{user.schoolName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${type === 'web' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'}`}>
                                        {user.module}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-200">{formatDuration(user.duration)}</span>
                                        <span className="text-[9px] text-gray-400 font-medium tracking-tighter uppercase">in session</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                                        <span className="text-[10px] text-gray-400">{getTimeAgo(user.lastActive)}</span>
                                    </div>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Activity className="h-10 w-10" />
                                        <p className="text-sm font-medium">No active {type === 'web' ? 'web' : 'app'} users</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const ActivityChampionCard = ({ topUser, currentDays }: { topUser: ActiveUsersData['topUser'], currentDays: number }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl relative group"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="h-32 w-32 rotate-12" />
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full p-1.5 bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 shadow-2xl relative">
                        <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 overflow-hidden relative">
                            {topUser?.avatar ? (
                                <div className="h-full w-full relative">
                                    <Image src={topUser.avatar} alt={topUser.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl font-black text-gray-400">
                                    {topUser?.name[0]}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 p-2 rounded-xl shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping"></span>
                        Activity Champion (Last {currentDays} Days)
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-50 mb-1 tracking-tight">
                        {topUser?.name || "No data yet"}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                            {topUser?.role || "User"}
                        </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                        <School className="h-4 w-4" /> {topUser?.schoolName || "System Monitoring"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Actions Performed</p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{topUser?.score?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Community Rank</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-50">#1 Top Tier</p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                    <Link 
                        href={data?.topUser?.id ? `/dashboard/superadmin/user-stats/${data.topUser.id}` : '#'} 
                        className="w-full px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-lg hover:scale-[1.02] transition-transform text-center"
                    >
                        Detailed Stats
                    </Link>
                    <Link 
                        href="/dashboard/superadmin/activity-leaderboard"
                        className="w-full px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
                    >
                        Leaderboard
                    </Link>
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> High Engagement Pattern Detected</span>
                <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden md:block"></span>
                <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Consistent Daily Activity</span>
            </div>
        </motion.div>
    );

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Real-time Active Users | LearnXChain</title>
            </Head>

            <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/superadmin/system-health" className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                                <Activity className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Real-time Monitor</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Active User Sessions</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-white/5">
                            {[5, 7, 15, 30].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => { setDays(d); setIsCustomDate(false); fetchData(d); }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${days === d && !isCustomDate ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                                >
                                    {d}d
                                </button>
                            ))}
                            <button
                                onClick={() => setIsCustomDate(true)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isCustomDate ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                Custom
                            </button>
                        </div>

                        {isCustomDate && (
                            <input 
                                type="number" 
                                value={days}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setDays(val);
                                    fetchData(val);
                                }}
                                className="w-20 px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Days"
                            />
                        )}

                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-bold shadow-sm"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Syncing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <ActivityChampionCard topUser={data?.topUser || null} currentDays={days} />
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                            <UserTable users={data?.webUsers || []} type="web" />
                            <UserTable users={data?.appUsers || []} type="app" />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

