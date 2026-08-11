
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
  Play,
  Square,
  Users,
  MapPin,
  PhoneCall,
  AlertTriangle,
  Clock,
  Bus,
  ChevronRight,
  Navigation,
  Signal,
  Activity,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const LiveMap = dynamic(() => import("@/components/dashboard/transport/LiveMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[2.5rem] flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400">Initializing Node...</div>
});

export default function driverDashboard() {
  const [data, setData] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [pings, setPings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  const fetchDashboard = async () => {
    try {
      const [dashRes, pingRes] = await Promise.all([
        client.get("/v1/dashboard/driver/overview"),
        client.get("/v1/transport/driver/notices")
      ]);

      setData(dashRes.data);
      setPings(pingRes.data);

      const routeId = dashRes.data?.assignedRoute?.id || dashRes.data?.activeTrip?.routeId;
      if (routeId) {
        const routeRes = await client.get(`/v1/transport/routes/${routeId}`);
        setRoute(routeRes.data);
      }
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const inv = setInterval(fetchDashboard, 20000);
    return () => clearInterval(inv);
  }, []);

  const unreadCount = pings.filter(p => !p.isRead).length;

  const handleStartTrip = async (type: string) => {
    setActionLoading(true);
    try {
      await client.post("/v1/transport/trips/start", {
        driverId: data?.driverId,
        routeId: data?.assignedRoute?.id,
        busId: data?.busId,
        schoolId: data?.schoolId,
        type: type
      });
      fetchDashboard();
    } catch (err) {
      console.error("Failed to start trip", err);
      alert("Failed to start trip. Ensure route and bus are assigned.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!confirm("Are you sure you want to end this trip?")) return;
    setActionLoading(true);
    try {
      await client.post("/v1/transport/trips/end", {
        tripId: data?.activeTrip?.id
      });
      fetchDashboard();
    } catch (err) {
      console.error("Failed to end trip", err);
      alert("Failed to end trip.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (!confirm("Are you sure you want to trigger SOS? This will alert admins immediately.")) return;
    setActionLoading(true);
    try {
      let lat = null, lng = null;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn("Could not get location for SOS", e);
      }

      await client.post("/v1/transport/sos", {
        tripId: data?.activeTrip?.id,
        latitude: lat,
        longitude: lng,
        reason: "Driver Emergency Triggered"
      });
      alert("SOS ALERT SENT SUCCESSFULLY!");
    } catch (err) {
      alert("Failed to send SOS alert");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    let watchId: number;
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });

          if (data?.activeTrip?.id) {
            try {
              await client.post("/v1/transport/trips/location", {
                tripId: data.activeTrip.id,
                latitude: lat,
                longitude: lng,
                speed: pos.coords.speed || 0,
                heading: pos.coords.heading || 0
              });
            } catch (e) {
              console.error("Location report failed", e);
            }
          }
        },
        (err) => console.error("Geo error", err),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [data?.activeTrip?.id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  const activeTrip = data?.activeTrip;

  return (
    <>
      <Head>
        <title>Driver Intelligence Center - LearnXChain</title>
      </Head>
      <DashboardLayout role="driver">
        <div className="max-w-md mx-auto space-y-6 pb-20">
          {/* Header Area */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  Fleet Control
                </h1>
                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Signal className="h-3 w-3 animate-pulse" />
                    Live Telemetry
                  </span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Protocol Active</p>
                </div>
              </div>
              <Link href="/dashboard/driver/notifications">
                <div className="relative h-14 w-14 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-white/5 shadow-xl flex items-center justify-center group">
                  <Bus className="h-7 w-7 text-indigo-500 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 border-4 border-gray-50 dark:border-gray-950 rounded-full animate-bounce" />
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-950/20 shadow-inner border border-indigo-100/50 dark:border-indigo-500/10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Bus Number</p>
              <p className="text-xl font-black text-indigo-900 dark:text-indigo-200">#{data?.busNumber || '---'}</p>
            </div>
            <div className="p-5 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 shadow-inner border border-emerald-100/50 dark:border-emerald-500/10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Station Status</p>
              <p className="text-xl font-black text-emerald-900 dark:text-emerald-200">Online</p>
            </div>
          </div>

          {/* Main Controls Section */}
          <div className="rounded-[3rem] bg-gray-900 p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <AnimatePresence mode="wait">
              {activeTrip ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      Trip: {activeTrip.type}
                    </span>
                    <button
                      onClick={() => setFollowMode(!followMode)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${followMode
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                        : 'bg-white/10 text-gray-400 border border-white/5'
                        }`}
                    >
                      <Navigation className={`h-3 w-3 ${followMode ? 'animate-pulse' : ''}`} />
                      {followMode ? 'Locked' : 'Free View'}
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-[2.5rem] p-1 border border-white/10 overflow-hidden shadow-2xl min-h-[280px]">
                    <div className="h-[280px] rounded-[2.3rem] overflow-hidden">
                      <LiveMap
                        trips={activeTrip ? [activeTrip] : []}
                        selectedTripId={activeTrip?.id}
                        route={route}
                        followMode={followMode}
                        currentUserLocation={userLoc}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Reporting Live GPS</p>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500">Route: {route?.name?.toUpperCase() || 'BUS TRANSPORT'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleEmergency}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 py-4 rounded-3xl bg-rose-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/20 active:scale-95 transition-all"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        SOS
                      </button>
                      <button
                        onClick={handleEndTrip}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 py-4 rounded-3xl bg-white text-gray-900 font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        <Square className="h-4 w-4" />
                        END TRIP
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 py-4 text-center"
                >
                  <div className="p-6 rounded-full bg-indigo-500/10 inline-flex items-center justify-center mb-2">
                    <Activity className="h-12 w-12 text-indigo-400" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-black mb-2">Ready to move?</h3>
                    <p className="text-gray-400 font-medium px-4">Initialize tracking protocols by starting your assigned shift.</p>
                  </div>

                  <div className="grid gap-4 px-2">
                    <button
                      onClick={() => handleStartTrip('MORNING')}
                      disabled={actionLoading}
                      className="w-full py-5 rounded-[2rem] bg-emerald-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      MORNING SHIFT
                    </button>
                    <button
                      onClick={() => handleStartTrip('RETURN')}
                      disabled={actionLoading}
                      className="w-full py-5 rounded-[2rem] border-2 border-white/10 bg-white/5 text-white font-black text-lg flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      RETURN SHIFT
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Intelligence Links */}
          <div className="grid gap-4">
            <Link href="/dashboard/driver/pickup">
              <div className="p-6 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">Student Roster</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance Checklist</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>

            <Link href="/dashboard/driver/route">
              <div className="p-6 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 flex items-center justify-between group cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg">Mission Manifest</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Intelligence</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Security Banner */}
          <div className="p-6 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-gray-400">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Protocol Active</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Tracking data is encrypted and securely relayed to HQ.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
