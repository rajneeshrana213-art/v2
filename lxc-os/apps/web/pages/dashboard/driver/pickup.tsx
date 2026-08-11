import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { Bus, Check, X, Phone, MapPin, ChevronLeft, Search } from "lucide-react";

interface Student {
    id: string;
    name: string;
    stopName: string;
    status?: "BOARDED" | "DROPPED" | "ABSENT";
}

export default function PickupChecklist() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTrip, setActiveTrip] = useState<any>(null);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const overviewRes = await client.get("/v1/dashboard/driver/overview");
            const trip = overviewRes.data.activeTrip;
            setActiveTrip(trip);

            if (trip) {
                const studentsRes = await client.get(`/v1/dashboard/driver/trip/students?routeId=${trip.routeId}`);
                // Combine with current trip attendance if available
                const attendance = trip.busAttendance || [];
                const enriched = (studentsRes.data || []).map((s: any) => ({
                    ...s,
                    status: attendance.find((a: any) => a.studentId === s.id)?.status
                }));
                setStudents(enriched);
            }
        } catch (err) {
            console.error("Failed to load students", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const updateStatus = async (studentId: string, status: string) => {
        if (!activeTrip) return;
        try {
            await client.post("/v1/dashboard/driver/trip/attendance", {
                tripId: activeTrip.id,
                studentId,
                status
            });
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: status as any } : s));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.stopName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!activeTrip && !loading) {
        return (
            <DashboardLayout role="driver">
                <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bus className="h-10 w-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">No Active Trip</h2>
                    <p className="text-sm text-gray-500 font-medium">Please start a trip from your dashboard to begin the pickup checklist.</p>
                    <Button onClick={() => router.push("/dashboard/driver")} className="rounded-2xl px-8">Return to Dashboard</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Student Checklist - LearnXChain</title>
            </Head>
            <DashboardLayout role="driver">
                <div className="max-w-md mx-auto space-y-6 pb-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                            <ChevronLeft className="h-6 w-6 text-gray-900" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Student Checklist</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{activeTrip?.type} Trip In Progress</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            className="h-14 w-full rounded-3xl bg-white border border-gray-100 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                            placeholder="Search by student or stop name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>
                        ) : filteredStudents.map((student) => (
                            <div key={student.id} className="p-4 rounded-[2rem] bg-white border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.name}</h3>
                                            <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                                                <MapPin className="h-2 w-2" /> {student.stopName}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Phone className="h-3 w-3" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => updateStatus(student.id, "BOARDED")}
                                        className={`py-2 rounded-xl text-[10px] font-black ${student.status === "BOARDED" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
                                    >
                                        BOARDED
                                    </button>
                                    <button
                                        onClick={() => updateStatus(student.id, "DROPPED")}
                                        className={`py-2 rounded-xl text-[10px] font-black ${student.status === "DROPPED" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
                                    >
                                        DROPPED
                                    </button>
                                    <button
                                        onClick={() => updateStatus(student.id, "ABSENT")}
                                        className={`py-2 rounded-xl text-[10px] font-black ${student.status === "ABSENT" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
                                    >
                                        ABSENT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
