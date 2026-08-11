import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import {
    Bus, Map as MapIcon, Navigation, Signal,
    AlertTriangle, User, Clock, MapPin,
    ArrowUpRight, Activity, ShieldCheck, PhoneCall
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";

const LiveMap = dynamic(() => import("@/components/dashboard/transport/LiveMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <Loader size="xl" variant="primary" />
    </div>
});

interface TripLocation {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: string;
}

interface BusStop {
    id: string;
    name: string;
    order: number;
    latitude: number;
    longitude: number;
    lat?: number; // fallback for inconsistent naming
    lng?: number;
}

interface ActiveTrip {
    id: string;
    type: string;
    bus: { busNumber: string; capacity: number };
    driver: { id: string; user: { name: string; phone: string } };
    route: { id: string; name: string; busStops?: BusStop[] } | null;
    tripLocations: TripLocation[];
}

function LiveTrackingPage() {
    const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
    const [sosIncidents, setSosIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<ActiveTrip | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const { user } = useAuth();
    const fetchData = async () => {
        try {
            const [tripsRes, sosRes] = await Promise.all([
                client.get(`/v1/transport/tracking/trips?activeOnly=true${user?.schoolId ? `&schoolId=${user.schoolId}` : ''}`),
                client.get("/v1/transport/sos")
            ]);
            setActiveTrips(tripsRes.data);
            setSosIncidents(sosRes.data);

            // Update selected trip data if it's still active
            setSelectedTrip(prev => {
                if (!prev) return null;
                return tripsRes.data.find((t: any) => t.id === prev.id) || prev;
            });
        } catch (err) {
            console.error("Failed to fetch live data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.schoolId) {
            fetchData();
            const interval = setInterval(fetchData, 10000); // 10s refresh
            return () => clearInterval(interval);
        }
    }, [user?.schoolId]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (selectedTrip?.route?.id) {
                try {
                    const res = await client.get(`/v1/transport/routes/${selectedTrip.route.id}`);
                    setSelectedRoute(res.data);
                } catch (e) {
                    console.error("Failed to fetch route for selected trip", e);
                }
            } else {
                setSelectedRoute(null);
            }
        };
        fetchRoute();
    }, [selectedTrip?.id]);

    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("Admin geo error", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    return (
        <>
            <Head>
                <title>Live Fleet Intelligence - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Fleet Intelligence
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <Signal className="h-3 w-3 animate-pulse" />
                                    Live Telemetry
                                </span>

                                <p className="text-sm font-medium text-gray-500">{activeTrips.length} Active Missions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-4 mr-4 px-4 py-2 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Map Engine</span>
                                    <span className="text-[10px] font-bold text-indigo-600">v2.4 (Enhanced)</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                                <div className="flex gap-2">
                                    {['Tethering', 'Pathing', 'Progress'].map(f => (
                                        <div key={f} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-white/5">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                            <span className="text-[8px] font-bold text-gray-500">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {sosIncidents.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-200"
                                >
                                    <AlertTriangle className="h-5 w-5 animate-bounce" />
                                    <span className="text-sm font-black uppercase tracking-wider">{sosIncidents.length} Emergency Alerts</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 grid gap-6 lg:grid-cols-4 min-h-0">
                        {/* Map Area */}
                        <div className="lg:col-span-3 relative rounded-[3rem] bg-slate-100 dark:bg-slate-900 overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl z-0">
                            <LiveMap
                                trips={activeTrips}
                                selectedTripId={selectedTrip?.id}
                                route={selectedRoute || selectedTrip?.route}
                                currentUserLocation={userLoc}
                                onLocateMe={fetchData}
                            />
                        </div>

                        {/* Right Sidebar: Trip List & Detail */}
                        <div className="flex flex-col gap-6 overflow-hidden">
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-2">Real-time Feed</h3>
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => <div key={i} className="h-24 rounded-[2rem] bg-white/50 animate-pulse" />)
                                ) : activeTrips.length === 0 ? (
                                    <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 text-center dark:bg-white/5 dark:border-white/5">
                                        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-gray-500">No active trips detected</p>
                                    </div>
                                ) : activeTrips.map((trip) => {
                                    if (!trip) return null;
                                    const latestLoc = trip.tripLocations?.[0];
                                    const r = trip.route;
                                    const stops = (r && r.busStops) ? r.busStops : [];
                                    let nextStop = "End of Route";
                                    let progress = 0;

                                    if (latestLoc && stops.length > 0) {
                                        // Calculate nearest stop idx
                                        let minD = Infinity;
                                        let nearestIdx = 0;
                                        const busPos = { lat: latestLoc.latitude, lng: latestLoc.longitude };

                                        stops.forEach((s, i) => {
                                            const sLat = (s.latitude || s.lat || 0);
                                            const sLng = (s.longitude || s.lng || 0);
                                            const d = Math.sqrt(Math.pow(busPos.lat - sLat, 2) + Math.pow(busPos.lng - sLng, 2));
                                            if (d < minD) { minD = d; nearestIdx = i; }
                                        });

                                        // If we are very close to a stop, consider it "reached"
                                        const atStop = minD < 0.0015; // ~150m

                                        if (atStop) {
                                            if (nearestIdx < stops.length - 1) {
                                                nextStop = stops[nearestIdx + 1].name;
                                                progress = ((nearestIdx + 1) / stops.length) * 100;
                                            } else {
                                                nextStop = "Arriving at End";
                                                progress = 100;
                                            }
                                        } else {
                                            // En route to nearestIdx or passing it
                                            nextStop = stops[nearestIdx].name;
                                            progress = (nearestIdx / stops.length) * 100;
                                        }
                                    }

                                    return (
                                        <Card
                                            key={trip.id}
                                            onClick={() => setSelectedTrip(trip)}
                                            className={`overflow-hidden rounded-[2rem] border-none transition-all cursor-pointer ${selectedTrip?.id === trip.id
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                                : 'bg-white hover:bg-gray-50 hover:scale-[1.02] dark:bg-slate-900 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge className={selectedTrip?.id === trip.id ? 'bg-indigo-400 text-white' : 'bg-emerald-50 text-emerald-600'}>
                                                        {trip.type}
                                                    </Badge>
                                                    <span className="text-[10px] font-black opacity-60 flex items-center gap-1">
                                                        <Bus className="h-3 w-3" /> BUS-{trip.bus?.busNumber || "???"}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-sm truncate mb-3">{r ? r.name : "No Assigned Route"}</h4>

                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex flex-col items-center gap-1 mt-1">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10" />
                                                            <div className="h-2 w-2 rounded-full border-2 border-indigo-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Current Location</p>
                                                            <p className="text-[11px] font-bold truncate opacity-80">
                                                                {latestLoc ? `Speed: ${(latestLoc.speed || 0).toFixed(0)} km/h` : 'Connecting...'}
                                                            </p>
                                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mt-1">Next Stop</p>
                                                            <p className="text-[11px] font-bold truncate">{nextStop}</p>
                                                        </div>
                                                    </div>

                                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            className="h-full bg-emerald-400"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between opacity-60">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-3 w-3" />
                                                            <span className="text-[10px] font-bold">{trip.driver?.user?.name || "Unknown Driver"}</span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{(progress || 0).toFixed(0)}% Done</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Selected Trip Quick Stats */}
                            <AnimatePresence mode="wait">
                                {selectedTrip && (
                                    <motion.div
                                        key={selectedTrip.id}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 50, opacity: 0 }}
                                        className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-xl font-black">Mission Control</h4>
                                            <button onClick={() => setSelectedTrip(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Commander</p>
                                                    <p className="text-sm font-bold truncate">{selectedTrip.driver.user.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-400">{selectedTrip.driver.user.phone}</p>
                                                </div>
                                                <a href={`tel:${selectedTrip.driver.user.phone}`} className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                                                    <PhoneCall className="h-5 w-5" />
                                                </a>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Velocity</p>
                                                        <p className="text-2xl font-black">{(selectedTrip.tripLocations[0]?.speed ?? 0).toFixed(0)} <span className="text-xs text-slate-500">km/h</span></p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telemetry Status</p>
                                                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            Active Link
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10">
                                                    <Navigation
                                                        className="h-8 w-8 text-indigo-400 mb-2 transition-transform duration-1000"
                                                        style={{ transform: `rotate(${(selectedTrip.tripLocations[0]?.heading || 0) + 45}deg)` }}
                                                    />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Heading</p>
                                                    <p className="text-xs font-bold uppercase tracking-tighter">
                                                        {selectedTrip.tripLocations[0]?.heading ? `${selectedTrip.tripLocations[0].heading.toFixed(0)}°` : 'Stabilizing...'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex gap-2">
                                                <button
                                                    onClick={async (e) => {
                                                        const btn = e.currentTarget;
                                                        const originalContent = btn.innerHTML;
                                                        try {
                                                            btn.disabled = true;
                                                            btn.innerHTML = "Pinging...";
                                                            await client.post(`/v1/transport/drivers/${selectedTrip.driver.id}/ping`, {
                                                                type: "PING",
                                                                content: "Admin is requesting location confirmation."
                                                            });
                                                            btn.innerHTML = "Pinged!";
                                                            setTimeout(() => {
                                                                btn.disabled = false;
                                                                btn.innerHTML = originalContent;
                                                            }, 2000);
                                                        } catch (err) {
                                                            btn.innerHTML = "Error!";
                                                            setTimeout(() => {
                                                                btn.disabled = false;
                                                                btn.innerHTML = originalContent;
                                                            }, 2000);
                                                        }
                                                    }}
                                                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    Direct Ping
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Recall BUS-${selectedTrip.bus.busNumber}? This will signal the driver to return immediately.`)) {
                                                            client.post(`/v1/transport/drivers/${selectedTrip.driver.id}/ping`, {
                                                                type: "URGENT",
                                                                content: "RECALL INITIATED. Return to base immediately."
                                                            });
                                                        }
                                                    }}
                                                    className="flex-1 py-4 rounded-2xl bg-rose-600/20 text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-600/30 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    Recall Bus
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DashboardLayout>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        
        .leaflet-container {
            border-radius: 2.5rem;
            z-index: 1;
        }
      `}</style>
        </>
    );
}

export default dynamic(() => Promise.resolve(LiveTrackingPage), { ssr: false });
