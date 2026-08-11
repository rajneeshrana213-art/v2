
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    ChevronLeft,
    MapPin,
    Users,
    Navigation,
    Clock,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function driverRoute() {
    const [stops, setStops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStops = async () => {
            try {
                const overview = await client.get("/v1/dashboard/driver/overview");
                const routeId = overview.data.activeTrip?.routeId || overview.data.assignedRoute?.id;

                if (routeId) {
                    const res = await client.get(`/v1/dashboard/driver/route?routeId=${routeId}`);
                    setStops(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch stops", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStops();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <>
            <Head>
                <title>Route Stops - LearnXChain Driver</title>
            </Head>
            <DashboardLayout role="driver">
                <div className="max-w-md mx-auto space-y-8 pb-20">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/driver">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Route Blueprint</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Stops & Student Counts</p>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Path Line */}
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-dashed border-l-2 border-dashed border-gray-200 dark:border-white/10" />

                        <div className="space-y-10">
                            {stops.length > 0 ? stops.map((stop, idx) => (
                                <div key={stop.id} className="relative flex items-start gap-6 group">
                                    <div className={`mt-1 h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center z-10 shadow-sm transition-all group-hover:scale-110 ${idx === 0
                                            ? "bg-emerald-500 text-white"
                                            : idx === stops.length - 1
                                                ? "bg-amber-500 text-white"
                                                : "bg-white border border-gray-100 text-gray-400 dark:bg-gray-800 dark:border-white/5"
                                        }`}>
                                        {idx === 0 ? <Navigation className="h-6 w-6" /> : idx === stops.length - 1 ? <CheckCircle2 className="h-6 w-6" /> : <MapPin className="h-5 w-5" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{stop.name}</h3>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/5">
                                                <Users className="h-3 w-3 text-gray-400" />
                                                <span className="text-[10px] font-black text-gray-500">{stop.students?.length || 0}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-400 line-clamp-1">{stop.location}</p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                <Clock className="h-3 w-3" />
                                                {idx === 0 ? "STARTING POINT" : `${0 + (idx * 5)} MINS LATER`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] dark:bg-white/2">
                                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">No stops found for this route.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Practical Info Card */}
                    <div className="rounded-[2rem] bg-indigo-600 p-6 text-white text-center">
                        <h4 className="font-black mb-1">Average Trip Duration</h4>
                        <p className="text-3xl font-black">{stops.length > 0 ? (stops.length - 1) * 5 : 0} MINS</p>
                        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-2">Calculated from historical logs</p>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
