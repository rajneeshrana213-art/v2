import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import client from "@/lib/api/client";
import { AlertCircle, Activity, Bus, MapPin, Siren, Users } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { useAuth } from "@/lib/context/AuthContext";

interface TransportOverview {
  totalDrivers: number;
  totalVehicles: number;
  activeTrips: number;
  todayTrips: number;
  activeAlerts: number;
  lastUpdated: string;
}

interface SOSIncident {
  id: string;
  description: string;
  createdAt: string;
  driver?: {
    id: string;
    user?: {
      name: string | null;
      phone: string | null;
    } | null;
  } | null;
  trip?: {
    id: string;
  } | null;
}

export default function AdminTransportDashboardPage() {
  const [overview, setOverview] = useState<TransportOverview | null>(null);
  const [sos, setSos] = useState<SOSIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, sosRes] = await Promise.all([
          client.get("/v1/transport/dashboard/overview"),
          client.get("/v1/transport/sos"),
        ]);
        setOverview(overviewRes.data);
        setSos(sosRes.data);
      } catch (err: any) {
        console.error("Transport dashboard error:", err);
        setError(err.response?.data?.error || "Failed to load transport data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.schoolId) {
      fetchData();
    }
  }, [user?.schoolId]);

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await client.patch(`/v1/transport/sos/${id}/resolve`, { schoolId: user?.schoolId });
      setSos((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error("Failed to resolve SOS:", err);
      alert(err.response?.data?.error || "Failed to resolve SOS");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="xl" variant="primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !overview) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Transport Dashboard Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-rose-500">
                {error || "Could not load transport data. Please try again later."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Transport Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                Transport Control Center
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Live overview of drivers, vehicles, active trips and safety alerts.
              </p>
            </div>
            <Badge
              variant="soft"
              tone={overview.activeAlerts > 0 ? "danger" : "success"}
              className="h-9 items-center px-4 text-xs font-semibold uppercase tracking-wide"
            >
              <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
              {overview.activeAlerts > 0 ? `${overview.activeAlerts} Active Alert(s)` : "All Clear"}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-100 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Active Trips
                </CardTitle>
                <Activity className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                  {overview.activeTrips}
                </div>
                <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                  {overview.todayTrips} trip(s) started today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drivers</CardTitle>
                <Users className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{overview.totalDrivers}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Registered drivers for this school
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                <Bus className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{overview.totalVehicles}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Buses and transport vehicles in operation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Alerts</CardTitle>
                <Siren className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{overview.activeAlerts}</div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  High / critical incidents awaiting review
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
            <div className="space-y-4">
              <Card className="overflow-hidden border-none bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black">Live Operations</CardTitle>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <CardDescription className="text-indigo-100">Satellite monitoring of all active missions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button
                    className="w-full rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => window.location.href = "/dashboard/admin/transport/live"}
                  >
                    Launch Live Tracking
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/buses"}
                  className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-white group dark:bg-white/5 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm dark:bg-slate-800 transition-transform group-hover:scale-110">
                    <Bus className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900 group-hover:text-indigo-600 dark:text-indigo-200">Buses</span>
                </button>

                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/stops"}
                  className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-white group dark:bg-white/5 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm dark:bg-slate-800 transition-transform group-hover:scale-110">
                    <MapPin className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900 group-hover:text-indigo-600 dark:text-indigo-200">Stops</span>
                </button>

                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/maintenance"}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-indigo-50 group dark:bg-slate-900 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center dark:bg-amber-900/10 transition-transform group-hover:scale-110">
                    <Siren className="h-6 w-6 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">Maintenance</span>
                </button>

                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/analytics"}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-indigo-50 group dark:bg-slate-900 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center dark:bg-indigo-900/10 transition-transform group-hover:scale-110">
                    <Activity className="h-6 w-6 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">Analytics</span>
                </button>

                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/assignments"}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-indigo-50 group dark:bg-slate-900 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center dark:bg-emerald-900/10 transition-transform group-hover:scale-110">
                    <Users className="h-6 w-6 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">Assignments</span>
                </button>

                <button
                  onClick={() => window.location.href = "/dashboard/admin/transport/routes"}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center gap-3 transition-all hover:border-indigo-200 hover:bg-indigo-50 group dark:bg-slate-900 dark:border-white/5"
                >
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center dark:bg-blue-900/10 transition-transform group-hover:scale-110">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">Routes</span>
                </button>
              </div>
            </div>

            <Card className="rounded-[3rem] border-none bg-white shadow-2xl dark:bg-slate-950/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-semibold">Active SOS / Critical Incidents</CardTitle>
                  <CardDescription>Respond immediately to driver-triggered emergencies.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {sos.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No active SOS incidents. You&apos;re all clear.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sos.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-start justify-between rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs dark:border-rose-500/30 dark:bg-rose-500/5"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                              SOS
                            </span>
                            {incident.trip && (
                              <span className="text-[10px] font-mono text-rose-700/80 dark:text-rose-200/80">
                                Trip #{incident.trip.id.slice(0, 6)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-rose-900 dark:text-rose-100">
                            {incident.description || "Critical transport incident"}
                          </p>
                          <p className="text-[11px] text-rose-700/80 dark:text-rose-200/80">
                            Driver:{" "}
                            {incident.driver?.user?.name || "Unknown"}{" "}
                            {incident.driver?.user?.phone && (
                              <span className="ml-1 text-[10px] font-mono">
                                ({incident.driver.user.phone})
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-rose-500/90 dark:text-rose-300/80">
                            {new Date(incident.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-3 border-rose-300 text-[11px] font-semibold text-rose-700 hover:bg-rose-600 hover:text-white dark:border-rose-500/40 dark:text-rose-200"
                          onClick={() => handleResolve(incident.id)}
                          disabled={resolvingId === incident.id}
                        >
                          {resolvingId === incident.id ? <Loader size="sm" variant="white" /> : "Mark Resolved"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">
            Last updated: {new Date(overview.lastUpdated).toLocaleString()}
          </p>
        </div>
      </DashboardLayout>
    </>
  );
}


