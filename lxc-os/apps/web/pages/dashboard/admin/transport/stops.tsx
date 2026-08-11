import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import client from "@/lib/api/client";
import { AlertCircle, MapPin, Plus, Trash2, Search, Map as MapIcon, Crosshair, Pencil } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/context/AuthContext";


const LocationPickerMap = dynamic(() => import("@/components/dashboard/transport/LocationPickerMap"), {
  ssr: false
});

interface BusStop {
  id: string;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  routeId?: string | null;
  schoolId: string;
}

function StopsPage() {
  const { user } = useAuth();
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; stopId: string | null }>({ isOpen: false, stopId: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
    routeId: "",
    schoolId: user?.schoolId || "",
  });


  useEffect(() => {
    if (user?.schoolId) {
      setFormData((prev) => ({ ...prev, schoolId: user.schoolId }));
    }
  }, [user?.schoolId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stopsRes, routesRes] = await Promise.all([
        client.get("/v1/transport/stops"),
        client.get("/v1/transport/routes")
      ]);
      setStops(stopsRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      console.error("Failed to load stops or routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }
  };

  const handleOpenModal = (stop?: BusStop) => {
    if (stop) {
      setEditId(stop.id);
      setFormData({
        name: stop.name,
        location: stop.location,
        latitude: stop.latitude?.toString() || "",
        longitude: stop.longitude?.toString() || "",
        routeId: stop.routeId || "",
        schoolId: stop.schoolId,
      });
    } else {
      setEditId(null);
      setFormData({ name: "", location: "", latitude: "", longitude: "", routeId: "", schoolId: "cl_dummy_school_id" });
    }
    setIsAddModalOpen(true);

    // Auto-fetch location if empty and creating a new stop
    if (!stop && !formData.latitude && !formData.longitude) {
      fetchCurrentLocation();
    }
  };

  // Implement Geocoding (Auto-update map coordinates from location text)
  useEffect(() => {
    // Combine Name and Location Description for a hierarchical search (e.g., "Village, District")
    // Deduplicate so if the user types the exact same thing in both fields, it doesn't search "A, A".
    const rawTerms = [formData.name.trim(), formData.location.trim()].filter(Boolean);
    const uniqueTerms = Array.from(new Set(rawTerms)).join(", ");

    // Fallback: if they are not identical, but one is a substring of the other, just use the longer one.
    const searchTerms = rawTerms.length === 2 && (rawTerms[0].includes(rawTerms[1]) || rawTerms[1].includes(rawTerms[0]))
      ? (rawTerms[0].length > rawTerms[1].length ? rawTerms[0] : rawTerms[1])
      : uniqueTerms;

    if (searchTerms.length < 3) return;

    // Use a tighter debounce (800ms) for a more real-time feel without spamming Nominatim
    const timeoutId = setTimeout(async () => {
      try {
        // Pass requests through our secure backend proxy route
        const query = encodeURIComponent(searchTerms);
        let url = `/api/v1/transport/geocode?q=${query}`;
        if (formData.latitude && formData.longitude) {
          url += `&lat=${formData.latitude}&lon=${formData.longitude}`;
        }
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.length > 0 && isAddModalOpen) {
          // Only update if it's actually different to prevent map jitter
          if (formData.latitude !== data[0].lat || formData.longitude !== data[0].lon) {
            setFormData((prev) => ({
              ...prev,
              latitude: data[0].lat,
              longitude: data[0].lon,
            }));
          }
        }
      } catch (err) {
        console.error("Geocoding fetch failed:", err);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.name, formData.location, isAddModalOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        ...formData,
        schoolId: user?.schoolId || formData.schoolId,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editId) {
        await client.put(`/v1/transport/stops/${editId}`, payload);
        toast.success("Transport point updated successfully!");
      } else {
        await client.post("/v1/transport/stops", payload);
        toast.success("Transport point created successfully!");
      }

      setIsAddModalOpen(false);
      setFormData({ name: "", location: "", latitude: "", longitude: "", routeId: "", schoolId: user?.schoolId || "" });
      fetchData();
    } catch (err: any) {
      console.error("Save stop failed:", err);
      toast.error(err.response?.data?.error || "Failed to save stop");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.stopId) return;
    setIsProcessing(true);
    try {
      await client.delete(`/v1/transport/stops/${deleteModal.stopId}`);
      setStops((prev) => prev.filter((s) => s.id !== deleteModal.stopId));
      toast.success("Transport point deleted successfully!");
      setDeleteModal({ isOpen: false, stopId: null });
    } catch (err: any) {
      console.error("Delete stop failed:", err);
      toast.error(err.response?.data?.error || "Failed to delete stop");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredStops = stops.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      (s.routeId || "").toLowerCase().includes(q)
    );
  });

  const columns: ColumnDef<BusStop>[] = [
    {
      key: "name",
      header: "Stop Identity",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{value}</span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Geographic Location",
      render: (value) => (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 italic">
          {value}
        </span>
      ),
    },
    {
      key: "routeId",
      header: "Active Mapping",
      render: (value) =>
        value ? (
          <Badge tone="info" className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Mapped to Route
          </Badge>
        ) : (
          <span className="text-[11px] font-medium text-gray-400 italic">Floating Stop</span>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (_, row) => (
        <div className="flex justify-end gap-2 pr-4">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            onClick={() => handleOpenModal(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            onClick={() => setDeleteModal({ isOpen: true, stopId: row.id })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Transport Terminals - LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Transport Points
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Configure pickup and drop locations for your routes.
              </p>
            </div>
            <Button
              className="flex items-center gap-2 rounded-[1.5rem] bg-indigo-600 px-6 py-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-5 w-5" />
              Register Stop
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="rounded-[2.5rem] border-none bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
              <CardContent className="p-0 flex flex-col items-center">
                <div className="mb-4 h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <MapIcon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100/70">Total Points</p>
                <p className="text-3xl font-black">{stops.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/60 shadow-2xl shadow-gray-200/50 backdrop-blur-xl dark:bg-slate-950/40 dark:shadow-none">
            <CardHeader className="border-b border-gray-100 p-8 dark:border-white/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Search by stop name or location..."
                    className="h-14 rounded-2xl bg-gray-50/50 border-none pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader size="xl" variant="primary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredStops}
                  className="border-none bg-transparent"
                  emptyState={
                    <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-500">
                      <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center dark:bg-white/5">
                        <MapPin className="h-10 w-10 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">No Points Registered</p>
                        <p className="text-sm font-medium">Define stops to provide clear guidance for drivers.</p>
                      </div>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-5xl overflow-hidden rounded-[3rem] border border-white/20 bg-white p-10 shadow-2xl dark:bg-slate-950 flex flex-col max-h-[90vh]"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        {editId ? "Update Transport Point" : "New Transport Point"}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        Define a named location and pick coordinates from the map.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-white/5"
                    >
                      <AlertCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0 overflow-y-auto pr-2">
                      {/* Left Column: Form Details */}
                      <div className="space-y-5">
                        <Input
                          label="Point Name"
                          required
                          placeholder="e.g. City Mall Gate 1"
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        />
                        <div>
                          <Input
                            label="Location Description"
                            required
                            placeholder="e.g. New Delhi, Connaught Place"
                            value={formData.location}
                            onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                          />
                          <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                            ✨ Map automatically updates when you type a city or address.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Latitude"
                            type="number"
                            step="any"
                            placeholder="e.g. 28.6139"
                            value={formData.latitude}
                            onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value }))}
                          />
                          <Input
                            label="Longitude"
                            type="number"
                            step="any"
                            placeholder="e.g. 77.2090"
                            value={formData.longitude}
                            onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Route Assignment
                          </label>
                          <select
                            className="h-14 w-full rounded-2xl border-none bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white transition-all appearance-none"
                            value={formData.routeId}
                            onChange={(e) => setFormData((p) => ({ ...p, routeId: e.target.value }))}
                          >
                            <option value="">Floating Stop (No Route)</option>
                            {routes.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-2xl bg-gray-50/80 p-5 dark:bg-slate-900/50 mt-4 border border-gray-100 dark:border-white/5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-indigo-500" /> Map Instructions
                          </h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            You can search for a location automatically by typing in the Description box above, or click the "Locate Me" button to use your current GPS location. For extremely high precision, manually click on the detailed map on the right side.
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Interactive Map */}
                      <div className="flex flex-col h-full space-y-3 min-h-[350px]">
                        <div className="flex items-center justify-between mt-1">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Interactive Map Preview
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors"
                            onClick={fetchCurrentLocation}
                          >
                            <Crosshair className="mr-2 h-4 w-4" /> Locate Me
                          </Button>
                        </div>

                        <div className="flex-1 w-full rounded-[1.5rem] border-2 border-gray-100 dark:border-white/10 overflow-hidden relative shadow-inner">
                          <LocationPickerMap
                            position={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : null}
                            onPositionChange={(lat, lng) => setFormData(p => ({ ...p, latitude: lat.toString(), longitude: lng.toString() }))}
                          />
                        </div>
                        <p className="text-[11px] text-center font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Click Map to Pin coordinates
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 mt-auto border-t border-gray-100 dark:border-white/10">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 rounded-2xl py-6 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-[2] rounded-2xl bg-indigo-600 py-6 font-bold text-white shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98]"
                      >
                        {isProcessing ? <Loader size="sm" variant="white" /> : "Finalize Mapping Configuration"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteModal.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isProcessing && setDeleteModal({ isOpen: false, stopId: null })}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-gray-100 dark:border-white/10"
                >
                  <div className="mb-6 flex items-center gap-4 text-rose-600 dark:text-rose-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Point</h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="mb-8 text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete this transport point? If this point is currently assigned to any active bus routes, those mappings may be permanently affected.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl py-6 font-bold"
                      onClick={() => setDeleteModal({ isOpen: false, stopId: null })}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 rounded-2xl bg-rose-600 py-6 font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 dark:shadow-none"
                      onClick={confirmDelete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader size="sm" variant="white" /> : "Yes, Delete"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </>
  );
}

export default dynamic(() => Promise.resolve(StopsPage), { ssr: false });
