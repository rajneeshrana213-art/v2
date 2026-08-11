import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { MapPin, ChevronLeft, Navigation, Clock, Users } from "lucide-react";

interface Stop {
    id: string;
    name: string;
    location: string;
    students?: { id: string }[];
}

export default function RouteStops() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stops, setStops] = useState<Stop[]>([]);
    const [activeTrip, setActiveTrip] = useState<any>(null);

    const fetchStops = useCallback(async () => {
        try {
            setLoading(true);
            const overviewRes = await client.get("/v1/dashboard/driver/overview");
            const trip = overviewRes.data.activeTrip;
            const route = overviewRes.data.assignedRoute;
            setActiveTrip(trip);

            const routeId = trip?.routeId || route?.id;
            if (routeId) {
                const stopsRes = await client.get(`/v1/dashboard/driver/trip/stops?routeId=${routeId}`);
                setStops(stopsRes.data || []);
            }
        } catch (err) {
            console.error("Failed to load stops", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStops();
    }, [fetchStops]);

    return (
        <>
            <Head>
                <title>Route Stops - LearnXChain</title>
            </Head>
            <DashboardLayout role="driver">
                <div className="max-w-md mx-auto space-y-6 pb-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                            <ChevronLeft className="h-6 w-6 text-gray-900" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Route Map</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Planned Stops Sequence</p>
                        </div>
                    </div>

                    <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:dark:bg-white/5">
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>
                        ) : stops.length === 0 ? (
                            <p className="text-center text-gray-400 py-10 font-bold">No stops defined for this route.</p>
                        ) : stops.map((stop, index) => (
                            <div key={stop.id} className="relative">
                                <div className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${index === 0 ? 'bg-emerald-500' : index === stops.length - 1 ? 'bg-rose-500' : 'bg-amber-500'}`} />

                                <div className="p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-white/5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{stop.name}</h3>
                                            <p className="text-xs font-medium text-gray-500">{stop.location}</p>
                                        </div>
                                        <Badge tone="info" className="px-2 py-0 text-[10px]">STOP {index + 1}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-50 dark:border-white/5">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold">{stop.students?.length || 0} Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold">~ {index * 10 + 5} mins</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                        <Navigation className="h-4 w-4" />
                        OPEN IN GOOGLE MAPS
                    </button>
                </div>
            </DashboardLayout>
        </>
    );
}
