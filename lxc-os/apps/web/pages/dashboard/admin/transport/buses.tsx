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
import { AlertCircle, Bus, Plus, Trash2, Edit2, Settings } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/context/AuthContext";

interface BusData {
    id: string;
    busNumber: string;
    capacity: number;
    schoolId: string;
    _count?: {
        routes: number;
        drivers: number;
    };
}

function BusesPage() {
    const [buses, setBuses] = useState<BusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [busToDelete, setBusToDelete] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingBus, setEditingBus] = useState<BusData | null>(null);
    const { user, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        busNumber: "",
        capacity: "",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/transport/buses");
            setBuses(res.data);
        } catch (err) {
            console.error("Failed to load buses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            if (editingBus) {
                await client.patch(`/v1/transport/buses/${editingBus.id}`, {
                    busNumber: formData.busNumber,
                    capacity: parseInt(formData.capacity),
                    schoolId: user?.schoolId || editingBus.schoolId,
                });
            } else {
                if (!user?.schoolId) {
                    alert("Session expired or school  not found. Please log in again.");
                    return;
                }
                await client.post("/v1/transport/buses", {
                    busNumber: formData.busNumber,
                    capacity: parseInt(formData.capacity),
                    schoolId: user.schoolId,
                });
            }
            setIsModalOpen(false);
            setFormData({ busNumber: "", capacity: "" });

            if (editingBus) {
                toast.success("Vehicle updated successfully");
            } else {
                toast.success("Vehicle added successfully");
            }

            setEditingBus(null);
            fetchData();
        } catch (err: any) {
            console.error("Operation failed:", err);
            toast.error(err.response?.data?.error || "Failed to save bus");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = (id: string) => {
        setBusToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!busToDelete) return;
        setIsProcessing(true);
        try {
            await client.delete(`/v1/transport/buses/${busToDelete}`);
            setBuses((prev) => prev.filter((b) => b.id !== busToDelete));
            setIsDeleteModalOpen(false);
            setBusToDelete(null);
            toast.success("Vehicle removed successfully");
        } catch (err: any) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.error || "Failed to delete bus");
        } finally {
            setIsProcessing(false);
        }
    };

    const openEditModal = (bus: BusData) => {
        setEditingBus(bus);
        setFormData({
            busNumber: bus.busNumber,
            capacity: bus.capacity.toString(),
        });
        setIsModalOpen(true);
    };

    const filteredBuses = buses.filter((b) =>
        b.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: ColumnDef<BusData>[] = [
        {
            key: "busNumber",
            header: "Vehicle Number",
            render: (value) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Bus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        {value}
                    </span>
                </div>
            ),
        },
        {
            key: "capacity",
            header: "Capacity",
            render: (value) => (
                <Badge tone="info" className="px-3 py-1 text-xs font-semibold">
                    {value} Seats
                </Badge>
            ),
        },
        {
            key: "stats",
            header: "Assignments",
            render: (_, row) => (
                <div className="flex gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                        <Settings className="h-3 w-3" /> {row._count?.routes || 0} Routes
                    </span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "",
            render: (_, row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        onClick={() => openEditModal(row)}
                    >
                        <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                        onClick={() => confirmDelete(row.id)}
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
                <title>Vehicle Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Fleet Management
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Track and manage your school's transport vehicles.
                            </p>
                        </div>
                        <Button
                            className="flex items-center gap-2 rounded-[1.5rem] bg-gray-900 px-6 py-6 text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-gray-900"
                            onClick={() => {
                                setEditingBus(null);
                                setFormData({ busNumber: "", capacity: "" });
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-5 w-5" />
                            Add New Vehicle
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="rounded-[2rem] border-none bg-indigo-600 p-2 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                            <CardContent className="space-y-1 pt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-indigo-100/70">Total Fleet</p>
                                <p className="text-4xl font-black">{buses.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-none bg-white p-2 shadow-xl shadow-gray-200 dark:bg-slate-900 dark:shadow-none">
                            <CardContent className="space-y-1 pt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total Seats</p>
                                <p className="text-4xl font-black text-gray-900 dark:text-white">
                                    {buses.reduce((acc, b) => acc + b.capacity, 0)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2rem] border-none bg-emerald-500 p-2 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                            <CardContent className="space-y-1 pt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-emerald-100/70">Active Status</p>
                                <p className="text-4xl font-black">100%</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/60 shadow-2xl shadow-gray-200/50 backdrop-blur-xl dark:bg-slate-950/40 dark:shadow-none">
                        <CardHeader className="border-b border-gray-100 p-8 dark:border-white/5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <Input
                                        placeholder="Search by vehicle number..."
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
                                    data={filteredBuses}
                                    className="border-none bg-transparent"
                                    emptyState={
                                        <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-500">
                                            <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center dark:bg-white/5">
                                                <Bus className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">No Vehicles Found</p>
                                                <p className="text-sm font-medium">Start building your fleet by adding a bus.</p>
                                            </div>
                                        </div>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {isModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
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
                                    className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border border-white/20 bg-white p-10 shadow-2xl dark:bg-slate-950"
                                >
                                    <div className="mb-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                                {editingBus ? "Edit Fleet Item" : "New Fleet Item"}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-500">
                                                {editingBus ? "Update vehicle specifications." : "Register a new vehicle to the fleet."}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <Input
                                                label="Vehicle Number"
                                                required
                                                placeholder="e.g. DL 01 AB 1234"
                                                value={formData.busNumber}
                                                onChange={(e) => setFormData((p) => ({ ...p, busNumber: e.target.value }))}
                                            />
                                            <Input
                                                label="Seating Capacity"
                                                type="number"
                                                required
                                                placeholder="e.g. 52"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                                            />
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
                                                className="flex-1 rounded-2xl bg-indigo-600 py-6 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {isProcessing ? <Loader size="sm" variant="white" /> : editingBus ? "Update Vehicle" : "Add Vehicle"}
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isDeleteModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => !isProcessing && setIsDeleteModalOpen(false)}
                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-md overflow-hidden rounded-[3rem] border border-white/20 bg-white p-10 shadow-2xl dark:bg-slate-950"
                                >
                                    <div className="mb-6 flex flex-col items-center text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                            <AlertCircle className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                            Remove Vehicle?
                                        </h3>
                                        <p className="mt-2 text-sm font-medium text-gray-500">
                                            Are you sure you want to remove this vehicle? This will affect all assigned routes and drivers. This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isProcessing}
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="flex-1 rounded-2xl py-6 font-bold"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={handleDelete}
                                            className="flex-1 rounded-2xl bg-rose-600 py-6 font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader size="sm" variant="white" /> : "Remove"}
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

export default dynamic(() => Promise.resolve(BusesPage), { ssr: false });
