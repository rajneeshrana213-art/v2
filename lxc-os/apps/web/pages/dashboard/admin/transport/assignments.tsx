import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/lib/api/client";
import {
    Users, Bus, Map,
    Search, Check, MoveRight,
    X, Filter, Save, Building,
    LayoutGrid as ClassIcon, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { Loader } from "@/components/ui/feedback/Loader";

interface Student {
    id: string;
    user: { name: string };
    rollNo: string;
    buses?: { busNumber: string };
    route?: { name: string };
    class?: { name: string };
}

interface Driver {
    id: string;
    user: { name: string; phone: string };
    bus?: { busNumber: string };
}

interface Class {
    id: string;
    name: string;
}

export default function AssignmentsPage() {
    const [activeTab, setActiveTab] = useState<"students" | "drivers">("students");
    const [students, setStudents] = useState<Student[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [buses, setBuses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [targetBus, setTargetBus] = useState("");
    const [targetRoute, setTargetRoute] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsRes, classesRes, busesRes, routesRes, driversRes] = await Promise.all([
                client.get(`/v1/transport/assignments?search=${search}&classId=${selectedClass}`),
                client.get("/v1/transport/classes"),
                client.get("/v1/transport/buses"),
                client.get("/v1/transport/routes"),
                client.get("/v1/transport/drivers/assignments")
            ]);
            setStudents(studentsRes.data);
            setClasses(classesRes.data);
            setBuses(busesRes.data);
            setRoutes(routesRes.data);
            setDrivers(driversRes.data);
        } catch (err) {
            console.error("Assignment fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, selectedClass, activeTab]);

    if (loading) return (
        <DashboardLayout role="admin">
            <div className="flex h-[400px] items-center justify-center">
                <Loader size="xl" variant="primary" />
            </div>
        </DashboardLayout>
    );

    const handleBulkAssign = async () => {
        if (selectedIds.length === 0) return;
        try {
            setActionLoading(true);
            const endpoint = activeTab === "students"
                ? "/v1/transport/assignments"
                : "/v1/transport/drivers/assignments";

            const payload = activeTab === "students"
                ? {
                    studentIds: selectedIds,
                    busId: targetBus || null,
                    routeId: targetRoute || null
                }
                : {
                    driverIds: selectedIds,
                    busId: targetBus || null
                };

            await client.post(endpoint, payload);
            setSelectedIds([]);
            fetchData();
            toast.success(`Successfully assigned ${selectedIds.length} ${activeTab}`);
        } catch (err) {
            toast.error(`Failed to assign ${activeTab}`);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const studentColumns: ColumnDef<Student>[] = [
        {
            key: "select",
            header: "Select",
            render: (_, row) => (
                <button
                    onClick={() => toggleSelect(row.id)}
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(row.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-white/10'
                        }`}
                >
                    {selectedIds.includes(row.id) && <Check className="h-4 w-4 text-white" />}
                </button>
            )
        },
        {
            key: "name",
            header: "Student Name",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{row.user?.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-gray-400">Roll: {row.rollNo}</span>
                        <Badge tone="accent" className="px-1.5 py-0 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-none">
                            {row.class?.name || "No Class"}
                        </Badge>
                    </div>
                </div>
            )
        },
        {
            key: "buses",
            header: "Assigned Bus",
            render: (val) => val ? (
                <Badge tone="info" className="px-2 py-0.5 text-[10px] font-black uppercase bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-none">BUS {val.busNumber}</Badge>
            ) : (
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase">Not Assigned</span>
            )
        },
        {
            key: "route",
            header: "Route",
            render: (val) => val ? (
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{val.name}</span>
            ) : (
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase">—</span>
            )
        }
    ];

    const driverColumns: ColumnDef<Driver>[] = [
        {
            key: "select",
            header: "Select",
            render: (_, row) => (
                <button
                    onClick={() => toggleSelect(row.id)}
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(row.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-white/10'
                        }`}
                >
                    {selectedIds.includes(row.id) && <Check className="h-4 w-4 text-white" />}
                </button>
            )
        },
        {
            key: "name",
            header: "Driver Details",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{row.user?.name}</span>
                    <span className="text-[11px] font-medium text-gray-400">{row.user?.phone}</span>
                </div>
            )
        },
        {
            key: "bus",
            header: "Assigned Vehicle",
            render: (val) => val ? (
                <Badge tone="info" className="px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-none">
                    {val.busNumber}
                </Badge>
            ) : (
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase">Unassigned</span>
            )
        }
    ];

    return (
        <>
            <Head>
                <title>Transport Assignments - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                Fleet Assignments
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500">Bulk manage student and vehicle correlations.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-4">
                        <div className="lg:col-span-3 space-y-6">
                            <Card className="rounded-[2.5rem] border-none bg-white overflow-hidden shadow-2xl dark:bg-slate-900">
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex border-b border-gray-100 dark:border-white/5 px-6 pt-2">
                                        <button
                                            onClick={() => { setActiveTab("students"); setSelectedIds([]); }}
                                            className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "students" ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Students
                                            {activeTab === "students" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab("drivers"); setSelectedIds([]); }}
                                            className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "drivers" ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            Drivers
                                            {activeTab === "drivers" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                                            <div className="relative flex-1 max-w-md">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder={`Search ${activeTab}...`}
                                                    className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-indigo-500 dark:border-white/5 dark:bg-white/5"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>

                                            {activeTab === "students" && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                        <Filter className="h-4 w-4" />
                                                    </div>
                                                    <select
                                                        value={selectedClass}
                                                        onChange={(e) => setSelectedClass(e.target.value)}
                                                        className="h-10 rounded-xl border-none bg-gray-50 px-4 text-xs font-black uppercase tracking-tight text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-white/5 dark:text-gray-400"
                                                    >
                                                        <option value="">All Classes</option>
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-[1.5rem] border border-gray-50 dark:border-white/5 overflow-hidden">
                                            <DataTable
                                                columns={activeTab === "students" ? studentColumns : (driverColumns as any)}
                                                data={activeTab === "students" ? students : (drivers as any)}
                                                className="border-none"
                                                emptyState={<div className="py-20 text-center font-bold text-gray-400">No {activeTab} found matching criteria.</div>}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] border-none bg-indigo-600 p-8 text-white shadow-2xl dark:bg-indigo-900/40">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <Save className="h-5 w-5 text-indigo-300" />
                                    Bulk Action
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                                        <p className="text-[10px] font-black uppercase text-indigo-200 mb-2">Selected Nodes</p>
                                        <p className="text-2xl font-black">{selectedIds.length} <span className="text-xs text-indigo-200 font-medium uppercase tracking-widest">{activeTab}</span></p>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black uppercase text-indigo-200 px-2">Assign to Bus</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-indigo-400"
                                            value={targetBus}
                                            onChange={(e) => setTargetBus(e.target.value)}
                                        >
                                            <option value="" className="bg-indigo-700">No Bus (Unassign)</option>
                                            {buses.map(b => <option key={b.id} value={b.id} className="bg-indigo-700">Bus {b.busNumber}</option>)}
                                        </select>
                                    </div>

                                    {activeTab === "students" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-indigo-200 px-2">Assign to Route</label>
                                            <select
                                                className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-indigo-400"
                                                value={targetRoute}
                                                onChange={(e) => setTargetRoute(e.target.value)}
                                            >
                                                <option value="" className="bg-indigo-700">No Route (Unassign)</option>
                                                {routes.map(r => <option key={r.id} value={r.id} className="bg-indigo-700">{r.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full py-6 rounded-2xl bg-white text-indigo-600 h-14 text-sm font-black uppercase tracking-wider mt-4 hover:bg-gray-50 focus:ring-offset-2 focus:ring-offset-indigo-600 disabled:opacity-50 transition-all shadow-lg"
                                        disabled={selectedIds.length === 0 || actionLoading}
                                        onClick={handleBulkAssign}
                                    >
                                        {actionLoading ? <Loader size="sm" variant="primary" /> : "COMMIT CHANGES"}
                                    </Button>
                                </div>
                            </Card>

                            <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg dark:bg-slate-800">
                                        <Building className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Pro Tip</h4>
                                </div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {activeTab === "students"
                                        ? "Use the class filter to select entire groups of students for the same route simultaneously."
                                        : "Ensure each bus has exactly one primary driver assigned for accurate live tracking."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
