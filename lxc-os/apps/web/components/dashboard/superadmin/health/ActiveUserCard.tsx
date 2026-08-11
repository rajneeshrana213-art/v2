
import Image from "next/image";
import { User, Mail, Calendar, Clock } from "lucide-react";

interface ActiveUserCardProps {
    user: {
        name: string;
        email: string;
        role: string;
        lastActive: string | Date;
        avatar?: string;
        joinedAt: string | Date;
        schoolName?: string;
    } | null;
}

export function ActiveUserCard({ user }: ActiveUserCardProps) {
    if (!user) return null;

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date: string | Date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    Most Active User
                </h3>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-300">
                    Online
                </span>
            </div>

            <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-indigo-50 dark:border-indigo-500/10 relative">
                    {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h4>
                <div className="flex flex-col items-center gap-1 mt-1">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {user.role}
                    </span>
                    {user.schoolName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {user.schoolName}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Last Active</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatTime(user.lastActive)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Joined</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(user.joinedAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
