
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
import { Loader } from "@/components/ui/feedback/Loader";
import client from "@/lib/api/client";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { useRouter } from "next/router";
import { decodeId } from "@/lib/utils/hashId";

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

export default function ParentLiveTrackingPage() {
    const router = useRouter();
    const { studentId } = router.query;
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [trips, setTrips] = useState<ActiveTrip[]>([]);
    const [route, setRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextStop, setNextStop] = useState<any>(null);
    const [eta, setEta] = useState<string>("---");
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [assignedStopId, setAssignedStopId] = useState<string | null>(null);

    // Initialize selectedChildId from URL (decode the hashed ID from the link)
    useEffect(() => {
        if (studentId && typeof studentId === 'string') {
            setSelectedChildId(decodeId(studentId));
        }
    }, [studentId]);

    const fetchData = async (childId: string) => {
        if (!childId) return;
        setLoading(true);
        try {
            // 1. Get Child Details to find routeId
            const childRes = await client.get(`/v1/dashboard/parent/overview?studentId=${childId}`);
            const assignedRouteId = childRes.data?.studentInfo?.routeId;
            const stopId = childRes.data?.studentInfo?.busStopId;
            setAssignedStopId(stopId);

            if (!assignedRouteId) {
                setError("No transport route assigned to this child.");
                setTrips([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Route Details (once)
            let currentRoute = route;
            if (!route || route.id !== assignedRouteId) {
                const routeRes = await client.get(`/v1/transport/routes/${assignedRouteId}`);
                setRoute(routeRes.data);
                currentRoute = routeRes.data;
            }

            // 3. Fetch Active Trips for this route
            const tripsRes = await client.get(`/v1/transport/tracking/trips?activeOnly=true&routeId=${assignedRouteId}`);
            setTrips(tripsRes.data);

            // 4. Calculate personalized ETA
            const activeTrip = tripsRes.data[0];
            if (activeTrip && activeTrip.tripLocations?.[0] && currentRoute?.busStops?.length > 0) {
                const loc = activeTrip.tripLocations[0];
                const stops = [...currentRoute.busStops].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

                const childStop = assignedStopId ? stops.find(s => s.id === assignedStopId) : null;

                let targetStop = null;
                let minDist = Infinity;

                if (childStop && childStop.latitude && childStop.longitude) {
                    targetStop = childStop;
                    minDist = Math.sqrt(Math.pow(childStop.latitude - loc.latitude, 2) + Math.pow(childStop.longitude - loc.longitude, 2));
                } else {
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
                const distKm = minDist * 111;
                const speedKmh = Math.max(loc.speed * 3.6, 25);
                const travelMins = Math.ceil((distKm / speedKmh) * 60);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedChildId) {
            fetchData(selectedChildId);
            const interval = setInterval(() => {
                fetchData(selectedChildId);
            }, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [selectedChildId]);

    useEffect(() => {
        if (typeof window !== "undefined" && "geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error("Parent geo error", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const activeTrip = trips[0];

    return (
        <>
            <Head>
                <title>Live Bus Tracking - LearnXChain</title>
            </Head>
            <DashboardLayout
                role="parent"
                actions={
                    <ChildSelector
                        selectedId={selectedChildId}
                        onSelect={(id) => setSelectedChildId(id)}
                    />
                }
            >
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
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Child Security Protocol Active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => selectedChildId && fetchData(selectedChildId)}
                            disabled={!selectedChildId}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:border-indigo-500 transition-all text-sm font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Node
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl flex items-center gap-3 text-amber-800 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    <div className="flex-1 grid gap-6 lg:grid-cols-4 min-h-0">
                        {/* Map View */}
                        <div className="lg:col-span-3 relative rounded-[3rem] bg-slate-100 dark:bg-slate-900 overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl z-0">
                            {!selectedChildId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="p-6 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-white/5 mb-6">
                                        <UserIcon className="h-12 w-12 text-indigo-400" />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase tracking-[0.2em]">Select child to initiate tracking</p>
                                </div>
                            ) : loading && trips.length === 0 ? (
                                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                    <Loader size="lg" />
                                </div>
                            ) : trips.length > 0 ? (
                                <LiveMap
                                    trips={trips}
                                    selectedTripId={trips[0].id}
                                    route={route || trips[0].route}
                                    currentUserLocation={userLoc}
                                    targetStopId={assignedStopId}
                                    onLocateMe={() => selectedChildId && fetchData(selectedChildId)}
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-gray-100 dark:border-white/5">
                                        <ShieldAlert className="h-10 w-10 text-rose-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">NO ACTIVE SESSIONS</h3>
                                    <p className="text-xs text-gray-400 max-w-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                        The node for this child is currently offline. Sessions are active during transport windows.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Trip Details Side Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="rounded-[2.5rem] border-gray-100 dark:border-white/10 shadow-xl overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Trip Intelligence</h3>

                                    <div className="space-y-8">
                                        <InfoItem
                                            icon={Bus}
                                            label="Vehicle Number"
                                            value={activeTrip?.bus.busNumber || "Pending..."}
                                            color="indigo"
                                        />
                                        <InfoItem
                                            icon={Clock}
                                            label="Personalized ETA"
                                            value={eta}
                                            color="amber"
                                        />
                                        <InfoItem
                                            icon={MapPin}
                                            label="Next Destination"
                                            value={nextStop?.name || activeTrip?.route.name || "N/A"}
                                            color="emerald"
                                        />
                                        <InfoItem
                                            icon={Phone}
                                            label="Hotline Support"
                                            value={activeTrip?.driver.user.phone || "---"}
                                            color="rose"
                                        />
                                    </div>

                                    {activeTrip && (
                                        <div className="mt-10 p-5 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Live Telemetry</span>
                                            </div>
                                            <p className="text-lg font-black text-indigo-900 dark:text-indigo-200">
                                                {(activeTrip.tripLocations[0]?.speed ?? 0).toFixed(0)} <span className="text-xs font-bold uppercase opacity-60">km/h velocity</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 p-6">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed text-center">
                                    Security Protocol: Tracking data is encrypted and only visible to verified guardians.
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
    };

    return (
        <div className="flex items-start gap-5">
            <div className={`p-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-50 dark:border-white/5`}>
                <Icon className={`h-5 w-5 ${colors[color].split(' ')[1]}`} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-base font-black text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}
