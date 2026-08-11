
import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
    Bus,
    MapPin,
    AlertCircle,
    RefreshCcw,
    Navigation,
    Phone,
    User as UserIcon,
    ShieldAlert,
    Clock,
    Signal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";
import client from "@/lib/api/client";

const LiveMap = dynamic(() => import("@/components/dashboard/transport/LiveMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center"><Loader /></div>
});

interface TripLocation {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    timestamp: string;
}

interface ActiveTrip {
    id: string;
    type: string;
    bus: { busNumber: string; capacity: number };
    driver: { user: { name: string; phone: string } };
    route: { id: string; name: string; busStops?: any[] };
    tripLocations: TripLocation[];
}

export default function StudentLiveTrackingPage() {
    const [trips, setTrips] = useState<ActiveTrip[]>([]);
    const [route, setRoute] = useState<any>(null); // Store route with stops
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [routeId, setRouteId] = useState<string | null>(null);
    const [nextStop, setNextStop] = useState<any>(null);
    const [eta, setEta] = useState<string>("---");
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [studentStopId, setStudentStopId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            // 1. Get Student Profile to find routeId
            const profileRes = await client.get("/v1/dashboard/student");
            const assignedRouteId = profileRes.data?.personalInfo?.routeId;
            const assignedStopId = profileRes.data?.personalInfo?.busStopId;
            setRouteId(assignedRouteId);
            setStudentStopId(assignedStopId);

            if (!assignedRouteId) {
                setError("No transport route assigned to your profile.");
                setLoading(false);
                return;
            }

            // 2. Fetch Route Details (once or on refresh)
            let currentRoute = route;
            if (!route) {
                const routeRes = await client.get(`/v1/transport/routes/${assignedRouteId}`);
                setRoute(routeRes.data);
                currentRoute = routeRes.data;
            }

            // 3. Fetch Active Trips for this route
            const tripsRes = await client.get(`/v1/transport/tracking/trips?activeOnly=true&routeId=${assignedRouteId}`);
            setTrips(tripsRes.data);

            // Calculate Next Stop and ETA for the sidebar
            const activeTrip = tripsRes.data[0];
            if (activeTrip && activeTrip.tripLocations?.[0] && currentRoute?.busStops?.length > 0) {
                const loc = activeTrip.tripLocations[0];
                const stops = [...currentRoute.busStops].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

                // 1. Check if student has an assigned stop on this route
                const assignedStopId = profileRes.data?.personalInfo?.busStopId;
                const studentStop = assignedStopId ? stops.find(s => s.id === assignedStopId) : null;

                let targetStop = null;
                let minDist = Infinity;

                if (studentStop && studentStop.latitude && studentStop.longitude) {
                    targetStop = studentStop;
                    minDist = Math.sqrt(Math.pow(studentStop.latitude - loc.latitude, 2) + Math.pow(studentStop.longitude - loc.longitude, 2));
                } else {
                    // Fallback: Simple distance calculation for the closest stop
                    let minIdx = 0;
                    stops.forEach((s: any, i: number) => {
                        const d = Math.sqrt(Math.pow(s.latitude - loc.latitude, 2) + Math.pow(s.longitude - loc.longitude, 2));
                        if (d < minDist) {
                            minDist = d;
                            minIdx = i;
                        }
                    });
                    targetStop = stops[minIdx];
                }

                setNextStop(targetStop);

                // Estimate time (1 degree is approx 111km, assume 25km/h = 0.41km/min)
                const distKm = minDist * 111;
                const speedKmh = Math.max(loc.speed * 3.6, 25);
                const travelMins = Math.ceil((distKm / speedKmh) * 60);

                // Special case: if at the stop
                if (distKm < 0.1) {
                    setEta("Arriving Now");
                } else {
                    setEta(travelMins < 1 ? "Arriving" : `${travelMins} mins`);
                }
            } else {
                setNextStop(null);
                setEta("---");
            }
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch tracking data", err);
            setError("Unable to load live tracking data.");
            setNextStop(null);
            setEta("---");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("User geolocation error", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const activeTrip = trips[0]; // For student, we only expect one active trip for their route

    return (
        <>
            <Head>
                <title>Live Bus Tracking - LearnXChain</title>
            </Head>
            <DashboardLayout role="student">
                <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Navigation className="h-8 w-8 text-indigo-600" />
                                Live Bus Tracking
                            </h1>
                            <div className="mt-1 flex items-center gap-3">
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <Signal className="h-3 w-3 animate-pulse" />
                                    Live Telemetry
                                </span>
                                <p className="text-sm font-medium text-gray-500">Track your assigned school bus in real-time.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setLoading(true); fetchData(); }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm hover:border-indigo-500 transition-all text-sm font-black uppercase tracking-widest"
                        >
                            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Node
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex-1 grid gap-6 lg:grid-cols-4 min-h-0">
                        {/* Map View */}
                        <div className="lg:col-span-3 relative rounded-[3rem] bg-slate-100 dark:bg-slate-900 overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl z-0">
                            {loading && trips.length === 0 ? (
                                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                    <Loader size="lg" />
                                </div>
                            ) : trips.length > 0 ? (
                                <LiveMap
                                    trips={trips}
                                    selectedTripId={trips[0].id}
                                    route={route || trips[0].route}
                                    currentUserLocation={userLoc}
                                    targetStopId={studentStopId}
                                    onLocateMe={fetchData}
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-gray-100 dark:border-white/5">
                                        <ShieldAlert className="h-10 w-10 text-rose-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">NO ACTIVE SESSIONS</h3>
                                    <p className="text-xs text-gray-400 max-w-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                        The bus for your assigned route is not currently on a trip. Tracking is available during scheduled pick-up and drop-off times.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Trip Details Side Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="rounded-3xl border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Bus Information</h3>

                                    <div className="space-y-6">
                                        <InfoItem
                                            icon={Bus}
                                            label="Bus Number"
                                            value={activeTrip?.bus.busNumber || "Waiting..."}
                                            color="indigo"
                                        />
                                        <InfoItem
                                            icon={MapPin}
                                            label="Route"
                                            value={activeTrip?.route.name || "N/A"}
                                            color="emerald"
                                        />
                                        <InfoItem
                                            icon={UserIcon}
                                            label="Driver Name"
                                            value={activeTrip?.driver.user.name || "TBD"}
                                            color="amber"
                                        />
                                        <InfoItem
                                            icon={Phone}
                                            label="Emergency Contact"
                                            value={activeTrip?.driver.user.phone || "---"}
                                            color="rose"
                                        />
                                        <InfoItem
                                            icon={Clock}
                                            label="Estimated Arrival"
                                            value={eta === 'Arriving' ? 'Arriving Now' : eta}
                                            color="blue"
                                        />
                                        <InfoItem
                                            icon={Navigation}
                                            label="Next Stop"
                                            value={nextStop?.name || "Detecting..."}
                                            color="emerald"
                                        />
                                    </div>

                                    {activeTrip && (
                                        <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Status</span>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                                                Bus is moving at {(activeTrip.tripLocations[0]?.speed || 0).toFixed(0)} km/h
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-white/10 p-6 text-center">
                                <p className="text-xs text-gray-400">
                                    Location updates every 10 seconds. For safety, avoid using mobile phones while boarding the bus.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

function InfoItem({ icon: Icon, label, value, color }: any) {
    const colors: any = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
        rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    };

    return (
        <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl ${colors[color]}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}
