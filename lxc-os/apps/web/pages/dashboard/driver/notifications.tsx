
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    Bell,
    Calendar,
    AlertCircle,
    Megaphone,
    UserX,
    Bus,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function driverNotifications() {
    const [notices, setNotices] = useState<any[]>([]);
    const [pings, setPings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const overview = await client.get("/v1/dashboard/driver/overview");
            const schoolId = overview.data.activeTrip?.schoolId || overview.data.assignedRoute?.schoolId;

            const [noticeRes, pingRes] = await Promise.all([
                schoolId ? client.get(`/v1/dashboard/parent/notices`) : Promise.resolve({ data: [] }),
                client.get(`/v1/transport/driver/notices`)
            ]);

            setNotices(noticeRes.data);
            setPings(pingRes.data);
        } catch (err) {
            console.error("Failed to fetch notices", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await client.patch(`/v1/transport/driver/notices`, { id });
            setPings(prev => prev.map(p => p.id === id ? { ...p, isRead: true } : p));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Head>
                <title>Notifications - LearnXChain Driver</title>
            </Head>
            <DashboardLayout role="driver">
                <div className="max-w-md mx-auto space-y-6 pb-20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/driver">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">School Alerts</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Status & Announcements</p>
                        </div>
                    </div>

                    {!notices || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {/* Admin Pings */}
                            {pings.map((ping) => (
                                <div
                                    key={ping.id}
                                    onClick={() => !ping.isRead && markAsRead(ping.id)}
                                    className={`p-5 rounded-[2rem] border transition-all ${ping.type === 'URGENT'
                                        ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40'
                                        : 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40'
                                        } ${!ping.isRead ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-950' : 'opacity-80'}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${ping.type === 'URGENT' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                            }`}>
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-black text-sm ${ping.type === 'URGENT' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {ping.type === 'URGENT' ? 'INCOMING RECALL' : 'ADMIN MESSAGE'}
                                                </h4>
                                                <span className="text-[10px] font-bold opacity-40">{format(new Date(ping.createdAt), "HH:mm")}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{ping.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* General Notices Section */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-gray-50 dark:bg-gray-950 px-3 text-[10px] font-black uppercase text-gray-400">General Notices</span>
                                </div>
                            </div>

                            {notices.length > 0 ? notices.map((notice, idx) => (
                                <div key={idx} className="p-6 rounded-[2rem] border border-gray-100 bg-white dark:bg-gray-900 dark:border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center dark:bg-amber-900/20">
                                            <Megaphone className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(notice.publishDate || notice.createdAt), "MMM dd")}</span>
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{notice.title}</h4>
                                    <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{notice.message}</p>

                                    <button className="mt-4 flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase">
                                        Read Full <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-40">
                                    <Bell className="h-10 w-10 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase">No more notices</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
