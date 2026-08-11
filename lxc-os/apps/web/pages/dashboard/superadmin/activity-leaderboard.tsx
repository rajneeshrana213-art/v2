
import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Loader } from "@/components/ui/feedback/Loader";
import { getAccessToken } from "@/lib/api/client";
import { Trophy, ArrowLeft, RefreshCw, School, Activity, Award, Medal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface LeaderboardUser {
    rank: number;
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    schoolName: string;
    score: number;
}

export default function ActivityLeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [days, setDays] = useState(30);

    const fetchData = async (currentDays = days) => {
        try {
            const res = await fetch(`/api/v1/superadmin/activity-leaderboard?days=${currentDays}`, {
                headers: {
                    "Authorization": `Bearer ${getAccessToken()}`
                }
            });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    };

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Activity Leaderboard | LearnXChain</title>
            </Head>

            <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/superadmin/active-users" className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                                <Award className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Engagement Hall of Fame</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tight">System Leaderboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-white/5">
                            {[7, 15, 30, 90].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => { setDays(d); fetchData(d); }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-white/5">
                                    <th className="px-8 py-5 text-center">Rank</th>
                                    <th className="px-6 py-5">User Profile</th>
                                    <th className="px-4 py-5 font-center text-center">Actions</th>
                                    <th className="px-6 py-5 text-right pr-8">Analytics</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {users.map((user, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={user.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center">
                                                {getRankIcon(user.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden relative shadow-sm">
                                                    {user.avatar ? <Image src={user.avatar} alt="" fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center font-bold text-gray-400 text-lg">{user.name[0]}</div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase">{user.role}</span>
                                                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                            <School className="h-2.5 w-2.5" /> {user.schoolName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <div className="inline-flex flex-col items-center px-4 py-1.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <span className="text-lg font-black text-gray-900 dark:text-gray-50">{user.score.toLocaleString()}</span>
                                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Events</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <Link 
                                                href={`/dashboard/superadmin/user-stats/${user.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all"
                                            >
                                                Stats <Activity className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

