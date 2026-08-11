import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import client from "@/lib/api/client";
import { AlertCircle, MapPin, Plus, Trash2, Edit2, Route as RouteIcon, Bus, CheckCircle2, Map as MapIcon } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/context/AuthContext";


interface BusStop {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
}

const RouteMapPreview = dynamic(() => import("@/components/dashboard/transport/RouteMapPreview"), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl"><Loader size="md" variant="primary" /></div>
});

interface Bus {
    id: string;
    busNumber: string;
}

interface TransportRoute {
    id: string;
    name: string;
    distance: number | null;
    busId: string;
    schoolId: string;
    bus?: Bus | null;
    busStops: BusStop[];
}

function RoutesPage() {
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [stops, setStops] = useState<BusStop[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; routeId: string | null }>({ isOpen: false, routeId: null });
    const [mapPreviewModal, setMapPreviewModal] = useState<{ isOpen: boolean; route: TransportRoute | null }>({ isOpen: false, route: null });
const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        busId: "",
        distance: "",
        selectedStopIds: [] as string[],
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [routesRes, busesRes, stopsRes] = await Promise.all([
                client.get("/v1/transport/routes"),
                client.get("/v1/transport/buses"),
                client.get("/v1/transport/stops"),
            ]);
            setRoutes(routesRes.data);
            setBuses(busesRes.data);
            setStops(stopsRes.data);
        } catch (err) {
            console.error("Failed to load transport data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.busId) {
            toast.warning("Please assign a bus to the route.");
            return;
        }
        setIsProcessing(true);
        try {
            const payload = {
                name: formData.name,
                busId: formData.busId,
                distance: formData.distance ? parseFloat(formData.distance) : undefined,
                busStopIds: formData.selectedStopIds,
                schoolId: user?.schoolId,
            };

            if (!payload.schoolId) {
                alert("Session expired. Please log in again.");
                return;
            }

            if (editingRoute) {
                await client.put(`/v1/transport/routes/${editingRoute.id}`, payload);
                toast.success("Transport route updated successfully!");
            } else {
                await client.post("/v1/transport/routes", payload);
                toast.success("Transport route created successfully!");
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            console.error("Operation failed:", err);
            toast.error(err.response?.data?.error || "Failed to save route");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            busId: "",
            distance: "",
            selectedStopIds: [],
        });
        setEditingRoute(null);
    };

    const confirmDelete = async () => {
        if (!deleteModal.routeId) return;
        setIsProcessing(true);
        try {
            await client.delete(`/v1/transport/routes/${deleteModal.routeId}`);
            setRoutes((prev) => prev.filter((r) => r.id !== deleteModal.routeId));
            toast.success("Transport route deleted successfully!");
            setDeleteModal({ isOpen: false, routeId: null });
        } catch (err: any) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.error || "Failed to delete route");
        } finally {
            setIsProcessing(false);
        }
    };

    const openEditModal = (route: TransportRoute) => {
        setEditingRoute(route);
        setFormData({
            name: route.name,
            busId: route.busId,
            distance: route.distance?.toString() || "",
            selectedStopIds: route.busStops.map((s) => s.id),
        });
        setIsModalOpen(true);
    };

    const toggleStop = (stopId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedStopIds: prev.selectedStopIds.includes(stopId)
                ? prev.selectedStopIds.filter((id) => id !== stopId)
                : [...prev.selectedStopIds, stopId],
        }));
    };

    const filteredRoutes = routes.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: ColumnDef<TransportRoute>[] = [
        {
            key: "name",
            header: "Route Name",
            render: (value) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <RouteIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                        {value}
                    </span>
                </div>
            ),
        },
        {
            key: "bus",
            header: "Assigned Bus",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {row.bus?.busNumber || "N/A"}
                    </span>
                </div>
            ),
        },
        {
            key: "stops",
            header: "Stops",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Badge tone="success" className="px-2 py-0.5 text-[10px]">
                        {row.busStops.length} STOPS
                    </Badge>
                    <div className="flex -space-x-2 overflow-hidden">
                        {row.busStops.slice(0, 3).map((stop, i) => (
                            <div key={i} className="inline-block h-6 w-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center dark:border-slate-900 dark:bg-indigo-900/30">
                                <MapPin className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        ))}
                        {row.busStops.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 dark:border-slate-900 dark:bg-white/5 dark:text-gray-400">
                                +{row.busStops.length - 3}
                            </div>
                        )}
                    </div>
                </div>
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
                        className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        onClick={() => setMapPreviewModal({ isOpen: true, route: row })}
                        title="View Route Map"
                    >
                        <MapIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        onClick={() => openEditModal(row)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        onClick={() => setDeleteModal({ isOpen: true, routeId: row.id })}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head>
                <title>Route Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Transport Routes
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Designated paths and schedules for student transit.
                            </p>
                        </div>
                        <Button
                            className="flex items-center gap-2 rounded-[1.5rem] bg-indigo-600 px-6 py-6 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-5 w-5" />
                            Build New Route
                        </Button>
                    </div>

                    <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/60 shadow-2xl shadow-gray-200/50 backdrop-blur-xl dark:bg-slate-950/40 dark:shadow-none">
                        <CardHeader className="border-b border-gray-100 p-8 dark:border-white/5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Input
                                        placeholder="Search routes by name..."
                                        className="h-14 rounded-2xl bg-gray-50/50 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/50"
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
                                    data={filteredRoutes}
                                    className="border-none bg-transparent"
                                    emptyState={
                                        <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-500">
                                            <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center dark:bg-white/5">
                                                <RouteIcon className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">No Routes Defined</p>
                                                <p className="text-sm font-medium">Create routes and link them to vehicles and stops.</p>
                                            </div>
                                        </div>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {isModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] border border-white/20 bg-white p-10 shadow-2xl dark:bg-slate-950"
                                >
                                    <div className="mb-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                                {editingRoute ? "Modify Route" : "Define Route"}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-500">
                                                Map out stops and assign a vehicle to this path.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-white/5"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Input
                                                label="Route Name"
                                                required
                                                placeholder="e.g. North Side Express"
                                                value={formData.name}
                                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                            />
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                    Assigned Vehicle
                                                </label>
                                                <select
                                                    className="h-14 w-full rounded-2xl border-none bg-gray-50/50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900/50 dark:text-white"
                                                    value={formData.busId}
                                                    onChange={(e) => setFormData((p) => ({ ...p, busId: e.target.value }))}
                                                    required
                                                >
                                                    <option value="">Choose a bus</option>
                                                    {buses.map((b) => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.busNumber}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                Route Stops ({formData.selectedStopIds.length} Selected)
                                            </label>
                                            <div className="max-h-48 overflow-y-auto rounded-[1.5rem] bg-gray-50/50 p-4 dark:bg-slate-900/50 grid grid-cols-2 gap-2">
                                                {stops.map((stop) => (
                                                    <button
                                                        key={stop.id}
                                                        type="button"
                                                        onClick={() => toggleStop(stop.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl transition-all border ${formData.selectedStopIds.includes(stop.id)
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                                            : "bg-white border-gray-100 text-gray-600 hover:border-indigo-300 dark:bg-slate-900 dark:border-white/5 dark:text-gray-400"
                                                            }`}
                                                    >
                                                        <span className="text-xs font-bold truncate">{stop.name}</span>
                                                        {formData.selectedStopIds.includes(stop.id) && <CheckCircle2 className="h-3 w-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isProcessing}
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 rounded-2xl py-6 font-bold"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="flex-1 rounded-2xl bg-indigo-600 py-6 font-bold text-white shadow-lg shadow-indigo-200"
                                            >
                                                {isProcessing ? <Loader size="sm" variant="white" /> : editingRoute ? "Save Changes" : "Activate Route"}
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
                                    onClick={() => !isProcessing && setDeleteModal({ isOpen: false, routeId: null })}
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
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Route</h3>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                                        </div>
                                    </div>
                                    <p className="mb-8 text-sm text-gray-600 dark:text-gray-300">
                                        Are you sure you want to delete this transport route? It will instantly orphan any linked students, and the assigned driver will lose access to this route's tracking dashboard.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-2xl py-6 font-bold"
                                            onClick={() => setDeleteModal({ isOpen: false, routeId: null })}
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

                    {/* Route Map Preview Modal */}
                    <AnimatePresence>
                        {mapPreviewModal.isOpen && mapPreviewModal.route && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMapPreviewModal({ isOpen: false, route: null })}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[3rem] border border-white/20 bg-white p-8 shadow-2xl dark:bg-slate-950"
                                >
                                    <div className="mb-6 flex items-center justify-between shrink-0">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                    <MapIcon className="h-5 w-5" />
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                    {mapPreviewModal.route.name}
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm font-medium text-gray-500">
                                                Live map rendering of {mapPreviewModal.route.busStops.length} stops for Vehicle {mapPreviewModal.route.bus?.busNumber}.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setMapPreviewModal({ isOpen: false, route: null })}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 shrink-0 dark:bg-white/5"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-slate-900">
                                        <RouteMapPreview stops={mapPreviewModal.route.busStops} />
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

export default dynamic(() => Promise.resolve(RoutesPage), { ssr: false });
