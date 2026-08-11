import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/feedback/Loader";
import {
    ChevronLeft,
    Users,
    School,
    Search,
    Check,
    X,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";

interface Section {
    id?: string;
    name: string;
    capacity: number;
}

interface ClassData {
    id: string;
    name: string;
    capacity: number;
    roomNumber: string | null;
    Section: Section[];
    _count: { Student: number };
}

function ClassFacultyPage() {
    const router = useRouter();

    const [teachers, setTeachers] = useState<any[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("assign");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchAssignmentsForClass(selectedClassId);
        } else {
            setAssignedIds([]);
        }
    }, [selectedClassId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [teachersRes, classesRes] = await Promise.all([
                client.get("/v1/dashboard/admin/teachers?limit=1000"),
                client.get("/v1/dashboard/admin/classes"),
            ]);
            setTeachers(teachersRes.data.data || teachersRes.data);
            setClasses(classesRes.data);
        } catch {
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignmentsForClass = async (classId: string) => {
        try {
            const response = await client.get(`/v1/dashboard/admin/classes/${classId}/teachers`);
            setAssignedIds(response.data.data.assignedTeacherIds);
        } catch {
            toast.error("Failed to load class assignments");
        }
    };

    const handleToggle = (id: string) => {
        setAssignedIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!selectedClassId) {
            toast.error("Please select a class first");
            return;
        }
        try {
            setSaving(true);
            await client.post(`/v1/dashboard/admin/classes/${selectedClassId}/teachers`, { teacherIds: assignedIds });
            toast.success("Assignments updated successfully");
            fetchInitialData();
        } catch {
            toast.error("Failed to save assignments");
        } finally {
            setSaving(false);
        }
    };

    const handleUnassign = async (classId: string, teacherId: string) => {
        try {
            setSaving(true);
            const response = await client.get(`/v1/dashboard/admin/classes/${classId}/teachers`);
            const currentIds = response.data.data.assignedTeacherIds as string[];
            const newIds = currentIds.filter(id => id !== teacherId);
            await client.post(`/v1/dashboard/admin/classes/${classId}/teachers`, { teacherIds: newIds });
            toast.success("Teacher unassigned");
            fetchInitialData();
        } catch {
            toast.error("Failed to unassign teacher");
        } finally {
            setSaving(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.user.name.toLowerCase().includes(search.toLowerCase()) ||
        t.user.email.toLowerCase().includes(search.toLowerCase())
    );

    const selectedClass = classes.find(c => c.id === selectedClassId);

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Faculty Management | Classes | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => router.push("/dashboard/admin/classes")}
                            className="h-10 w-10 p-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 flex items-center justify-center"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Faculty Management</h1>
                            <p className="text-sm text-gray-500 font-medium">Assign and oversee teacher-class distributions</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl w-fit">
                        <TabsTrigger value="assign" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-gray-500 font-bold transition-all uppercase text-[10px] tracking-widest">
                            Assign Teachers
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-gray-500 font-bold transition-all uppercase text-[10px] tracking-widest">
                            Assignment Overview
                        </TabsTrigger>
                    </TabsList>

                    {/* Assign Tab */}
                    <TabsContent value="assign" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Step 1: Select Class</label>
                                <Select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    options={[
                                        { label: "Choose a class...", value: "" },
                                        ...classes.map(c => ({ label: c.name, value: c.id }))
                                    ]}
                                    containerClassName="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Step 2: Search Faculty</label>
                                <Input
                                    placeholder="Search by name..."
                                    leftIcon={<Search className="h-4 w-4" />}
                                    containerClassName="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                    className="text-sm font-bold"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="min-h-[300px]">
                            {!selectedClassId ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-10 bg-gray-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                                    <div className="h-16 w-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                                        <School className="h-8 w-8" />
                                    </div>
                                    <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest max-w-[240px] leading-relaxed">
                                        Select a class to begin teacher assignment
                                    </p>
                                </div>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                                    <Loader size="lg" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Syncing faculty data...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredTeachers.map((teacher) => (
                                        <div
                                            key={teacher.id}
                                            onClick={() => handleToggle(teacher.id)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${assignedIds.includes(teacher.id)
                                                ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                                                : "bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 rounded-xl border border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                                                    {teacher.user.profilePic && (
                                                        <AvatarImage src={teacher.user.profilePic} alt={teacher.user.name} />
                                                    )}
                                                    <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">
                                                        {teacher.user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className={`text-sm font-bold truncate max-w-[120px] transition-colors uppercase tracking-tight ${assignedIds.includes(teacher.id) ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                                                        {teacher.user.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-70">{teacher.user.email}</p>
                                                </div>
                                            </div>
                                            <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${assignedIds.includes(teacher.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 dark:border-white/10"}`}>
                                                {assignedIds.includes(teacher.id) && <Check className="h-3 w-3 stroke-[3]" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button
                                disabled={saving || !selectedClassId}
                                onClick={handleSave}
                                className="h-11 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl shadow-indigo-500/20"
                            >
                                {saving ? "Updating..." : `Save for ${selectedClass?.name || "Class"}`}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Overview Tab */}
                    <TabsContent value="manage" className="space-y-4 mt-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                                <Loader size="lg" />
                            </div>
                        ) : classes.length > 0 ? (
                            <div className="space-y-3">
                                {classes.map(cls => (
                                    <div key={cls.id} className="p-5 rounded-[2rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                    <School className="h-5 w-5" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{cls.name}</h4>
                                            </div>
                                            <Badge tone="info" variant="soft" className="text-[10px] font-black uppercase tracking-widest px-3">
                                                {(cls as any).Teacher?.length || 0} Assigned
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(cls as any).Teacher?.length > 0 ? (
                                                (cls as any).Teacher.map((teacher: any) => (
                                                    <div key={teacher.id} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 group/item hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm">
                                                        <Avatar className="h-7 w-7 rounded-full border border-gray-50 dark:border-slate-800">
                                                            {teacher.user?.profilePic && (
                                                                <AvatarImage src={teacher.user.profilePic} alt={teacher.user.name ?? ""} />
                                                            )}
                                                            <AvatarFallback className="text-[10px] font-black bg-indigo-50 text-indigo-600 uppercase">{teacher.user?.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{teacher.user?.name}</span>
                                                        <button
                                                            onClick={() => handleUnassign(cls.id, teacher.id)}
                                                            className="ml-1 h-5 w-5 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                            title="Unassign"
                                                        >
                                                            <X className="h-3 w-3 stroke-[3]" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-full py-4 text-center">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">No faculty assigned to this class yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                                <div className="h-16 w-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
                                    <X className="h-8 w-8" />
                                </div>
                                <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">No classes found to manage</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
            `}</style>
        </DashboardLayout>
    );
}

export default dynamic(() => Promise.resolve(ClassFacultyPage), { ssr: false });
