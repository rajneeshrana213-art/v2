
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    User,
    Bus,
    ShieldCheck,
    Phone,
    Settings,
    LogOut,
    Car
} from "lucide-react";
import Link from "next/link";

export default function driverProfile() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await client.get("/v1/dashboard/driver/overview");
                setData(res.data);
            } catch (err) {
                console.error("Profile fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <>
            <Head>
                <title>My Profile - LearnXChain Driver</title>
            </Head>
            <DashboardLayout role="driver">
                <div className="max-w-md mx-auto space-y-8 pb-20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/driver">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        </Link>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">My Identity</h1>
                    </div>

                    <div className="relative text-center space-y-4">
                        <div className="mx-auto h-24 w-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-white shadow-2xl overflow-hidden">
                            <User className="h-12 w-12" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Driver #{data?.driverName?.substring(0, 5)}</h2>
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mt-1">Certified Transport Professional</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-6 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/30 flex items-center justify-center">
                                    <Bus className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Assigned Vehicle</p>
                                    <h4 className="text-lg font-black">BUS NO. {data?.busNumber}</h4>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-700/50">
                                <span className="text-[10px] font-black uppercase">Fleet ID</span>
                                <span className="text-sm font-bold opacity-80">LXC-FLEET-449</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2.5rem] border border-gray-100 bg-white dark:bg-gray-900 dark:border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Professional Data</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">License Status</span>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20">VALID</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Car className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Exp. Year</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">2029</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-6 rounded-[2rem] border border-gray-100 bg-white dark:bg-gray-900 dark:border-white/5 flex flex-col items-center gap-2 hover:border-amber-500 transition-all">
                                <Settings className="h-6 w-6 text-gray-400" />
                                <span className="text-[10px] font-black uppercase mt-1">Settings</span>
                            </button>
                            <button className="p-6 rounded-[2rem] border border-gray-100 bg-white dark:bg-gray-900 dark:border-white/5 flex flex-col items-center gap-2 hover:border-rose-500 transition-all group">
                                <LogOut className="h-6 w-6 text-gray-400 group-hover:text-rose-500" />
                                <span className="text-[10px] font-black uppercase mt-1 group-hover:text-rose-500">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
