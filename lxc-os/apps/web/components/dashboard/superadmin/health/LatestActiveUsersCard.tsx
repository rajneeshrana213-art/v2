
import Image from "next/image";
import { User, Clock, Monitor, School } from "lucide-react";
import { motion } from "framer-motion";

import Link from "next/link";

interface ActiveUser {
    name: string;
    email: string;
    role: string;
    loginTime: string | Date;
    lastActive: string | Date;
    duration: number; // ms
    avatar?: string;
    schoolName?: string;
}

interface LatestActiveUsersCardProps {
    users: ActiveUser[];
}

export function LatestActiveUsersCard({ users }: LatestActiveUsersCardProps) {
    const formatDuration = (ms: number) => {
        if (ms < 1000) return "0s";
        if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
        const mins = Math.floor(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;
        return `${hours}h ${remMins}m`;
    };

    const formatTime = (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getTimeAgo = (date: string | Date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/dashboard/superadmin/active-users" className="group/title">
                    <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2 text-lg group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                        <Monitor className="h-5 w-5 text-indigo-500" />
                        Latest Active Users
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 group-hover/title:text-gray-400 transition-colors">Real-time session and activity monitoring</p>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Live Tracking</span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                <th className="pb-2 pl-2">User & School</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Logged In</th>
                                <th className="pb-2">Session Time</th>
                                <th className="pb-2 text-right pr-2">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.slice(0, 10).map((user, idx) => (
                                <motion.tr 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-gray-50/50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors rounded-xl overflow-hidden"
                                >
                                    <td className="py-3 pl-3 rounded-l-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm shrink-0">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.name} width={36} height={36} className="object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-sm font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 max-w-[150px]">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={user.name}>{user.name}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate" title={user.schoolName}>
                                                    <School className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{user.schoolName || 'Global Admin'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatTime(user.loginTime)}</span>
                                            <span className="text-[10px] text-gray-400">{getTimeAgo(user.loginTime)}</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {formatDuration(user.duration)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right pr-3 rounded-r-xl">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                {getTimeAgo(user.lastActive) === 'Just now' ? 'Active now' : getTimeAgo(user.lastActive)}
                                            </span>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1 w-3 rounded-full ${i <= (getTimeAgo(user.lastActive) === 'Just now' ? 3 : 1) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-sm text-gray-500 italic">
                                        No active users yet. Activity will appear here once users log in.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
