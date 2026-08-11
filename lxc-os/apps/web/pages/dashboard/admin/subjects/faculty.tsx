import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import {
    BookOpen,
    Users,
    Search,
    X,
    Check,
    Layers,
    ChevronLeft,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClassData {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
    classId: string;
    class: { name: string };
    teachers?: any[];
    createdAt: string;
}

function FacultyManagementPage() {
    const router = useRouter();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Assign tab state
    const [activeTab, setActiveTab] = useState("assign");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [teachers, setTeachers] = useState<any[]>([]);
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    // Fetch subjects and classes on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, classesRes] = await Promise.all([
                    client.get("/v1/dashboard/admin/subjects"),
                    client.get("/v1/dashboard/admin/classes"),
                ]);
                setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
                setClasses(classesRes.data?.data || classesRes.data || []);
            } catch (err: any) {
                toast.error("Failed to load data");
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch teachers when subject changes
    useEffect(() => {
        if (selectedSubjectId && activeTab === "assign") {
            fetchAssignmentData();
        }
    }, [selectedSubjectId, activeTab]);

    // Reset subject when class changes
    useEffect(() => {
        setSelectedSubjectId("");
        setTeachers([]);
        setAssignedIds([]);
    }, [selectedClassId]);

    const fetchAssignmentData = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/dashboard/admin/subjects/${selectedSubjectId}/teachers`);
            setTeachers(response.data.data.allTeachers);
            setAssignedIds(response.data.data.assignedTeacherIds);
        } catch (err: any) {
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: string) => {
        setAssignedIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await client.post(`/v1/dashboard/admin/subjects/${selectedSubjectId}/teachers`, { teacherIds: assignedIds });
            toast.success("Faculty assigned successfully");
        } catch (err: any) {
            toast.error("Failed to save assignments");
        } finally {
            setSaving(false);
        }
    };

    const handleUnassign = async (subjectId: string, teacherId: string) => {
        try {
            setSaving(true);
            const response = await client.get(`/v1/dashboard/admin/subjects/${subjectId}/teachers`);
            const currentIds = response.data.data.assignedTeacherIds;
            const updatedIds = currentIds.filter((id: string) => id !== teacherId);
            await client.post(`/v1/dashboard/admin/subjects/${subjectId}/teachers`, { teacherIds: updatedIds });
            toast.success("Teacher unassigned");
            // Refresh overview data
            const subjectsRes = await client.get("/v1/dashboard/admin/subjects");
            setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
        } catch (err: any) {
            toast.error("Failed to unassign");
        } finally {
            setSaving(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.user.name.toLowerCase().includes(search.toLowerCase()) ||
        t.user.email.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSubjectsByClass = subjects.filter(s => s.classId === selectedClassId);
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    return (
        <>
            <Head>
                <title>Faculty Management | Admin | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 pb-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/dashboard/admin/subjects")}
                                className="h-10 w-10 p-0 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                                    Faculty Management
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                    Assign and oversee teacher-subject distributions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl w-fit mb-6">
                            <TabsTrigger
                                value="assign"
                                className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-gray-500 font-bold transition-all uppercase text-[10px] tracking-widest"
                            >
                                Assign Teachers
                            </TabsTrigger>
                            <TabsTrigger
                                value="manage"
                                className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white text-gray-500 font-bold transition-all uppercase text-[10px] tracking-widest"
                            >
                                Assignment Overview
                            </TabsTrigger>
                        </TabsList>

                        {/* Assign Tab */}
                        <TabsContent value="assign" className="space-y-6 mt-0">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 space-y-6 shadow-sm">
                                {/* Step filters */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Step 1: Select Class</label>
                                        <select
                                            value={selectedClassId}
                                            onChange={(e) => setSelectedClassId(e.target.value)}
                                            className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                        >
                                            <option value="">Choose a class...</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Step 2: Select Subject</label>
                                        <select
                                            disabled={!selectedClassId}
                                            value={selectedSubjectId}
                                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                                            className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white disabled:opacity-50"
                                        >
                                            <option value="">{selectedClassId ? "Choose a subject..." : "Select class first"}</option>
                                            {filteredSubjectsByClass.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Step 3: Search Faculty</label>
                                        <Input
                                            disabled={!selectedSubjectId}
                                            placeholder="Search by name..."
                                            leftIcon={<Search className="h-4 w-4" />}
                                            containerClassName="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                            className="text-sm font-bold"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Teacher list */}
                                <div className="min-h-[300px]">
                                    {!selectedSubjectId ? (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-10 bg-gray-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                                            <div className="h-16 w-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                                                <BookOpen className="h-8 w-8" />
                                            </div>
                                            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest max-w-[240px] leading-relaxed">
                                                {!selectedClassId ? "Select a class to begin" : "Select a subject to manage assignments"}
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
                                                        : "bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30"
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
                                                            <p className={`text-sm font-bold truncate max-w-[160px] transition-colors uppercase tracking-tight ${assignedIds.includes(teacher.id) ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                                                                {teacher.user.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-70">{teacher.user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${assignedIds.includes(teacher.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 dark:border-white/10"}`}>
                                                        {assignedIds.includes(teacher.id) && <Check className="h-3 w-3 stroke-[3]" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Save bar */}
                                {selectedSubjectId && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <Button
                                            disabled={saving || !selectedSubjectId}
                                            onClick={handleSave}
                                            className="h-11 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl shadow-indigo-500/20"
                                        >
                                            {saving ? "Updating..." : `Save — ${selectedSubject?.name || "Subject"}`}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Overview Tab */}
                        <TabsContent value="manage" className="mt-0">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                                {pageLoading ? (
                                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
                                        <Loader size="lg" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading data...</p>
                                    </div>
                                ) : subjects.length > 0 ? (
                                    <div className="space-y-6">
                                        {classes.map(cls => {
                                            const classSubjects = subjects.filter(s => s.classId === cls.id);
                                            if (classSubjects.length === 0) return null;
                                            return (
                                                <div key={cls.id} className="space-y-3">
                                                    <div className="flex items-center gap-3 px-2">
                                                        <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                            <Layers className="h-4 w-4" />
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{cls.name}</h4>
                                                    </div>
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {classSubjects.map(s => (
                                                            <div key={s.id} className="p-5 rounded-[2rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                                            <BookOpen className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-bold text-gray-700 dark:text-gray-200 uppercase text-xs tracking-tight">{s.name}</h5>
                                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.code}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge tone="info" variant="soft" className="text-[10px] font-black uppercase px-3">
                                                                        {s.teachers?.length || 0} Assigned
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {s.teachers && s.teachers.length > 0 ? (
                                                                        s.teachers.map((teacher: any) => (
                                                                            <div key={teacher.id} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 group/item hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm">
                                                                                <Avatar className="h-6 w-6 rounded-full border border-gray-50 dark:border-slate-800">
                                                                                    {teacher.user?.profilePic && (
                                                                                        <AvatarImage src={teacher.user.profilePic} alt={teacher.user.name ?? ""} />
                                                                                    )}
                                                                                    <AvatarFallback className="text-[8px] font-black bg-indigo-50 text-indigo-600 uppercase">{teacher.user?.name?.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{teacher.user?.name}</span>
                                                                                <button
                                                                                    onClick={() => handleUnassign(s.id, teacher.id)}
                                                                                    className="ml-1 h-4 w-4 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                                                    title="Unassign"
                                                                                >
                                                                                    <X className="h-2.5 w-2.5 stroke-[3]" />
                                                                                </button>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 ml-2 py-2">No faculty assigned.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                                        <div className="h-16 w-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300">
                                            <X className="h-8 w-8" />
                                        </div>
                                        <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">No subjects found to manage</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DashboardLayout>
        </>
    );
}

export default dynamic(() => Promise.resolve(FacultyManagementPage), { ssr: false });
