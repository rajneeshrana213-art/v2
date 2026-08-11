
import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/select";
import { Users, GraduationCap, ArrowRight, Search, School, FileCheck, AlertCircle, ChevronRight, CheckCircle2, Calendar, Layers, Sparkles, BookOpen, UserX, UserCheck, RefreshCw, Filter, X } from 'lucide-react';
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/feedback/modal";
import { cn } from "@/lib/utils";
import { Loader } from '@/components/ui/feedback/Loader';

interface Section {
    id: string;
    name: string;
}

interface ClassData {
    id: string;
    name: string;
    Section: Section[];
}

interface AcademicYear {
    id: string;
    year: string;
    isActive: boolean;
}

interface Student {
    id: string;
    admissionNo: string;
    section: string;
    academicYear: string;
    user: {
        name: string;
        email: string;
        profilePic: string | null;
    };
    class: {
        name: string;
    };
}

interface AlumniStudent {
    id: string;
    admissionNo: string;
    status: "ALUMNI" | "TRANSFERRED" | "DROPPED_OUT";
    updatedAt: string;
    user: { name: string; email: string; profilePic: string | null };
    class: { name: string } | null;
    academicRecords: Array<{ section: { name: string } | null; academicYear: string }>;
    StudentPromotion: Array<{ academicYear: string; toClassId: string }>;
}

const STATUS_META: Record<string, { label: string; tone: any; icon: React.ReactNode; bg: string }> = {
    ALUMNI: {
        label: "Alumni",
        tone: "success",
        icon: <GraduationCap className="h-3.5 w-3.5" />,
        bg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    TRANSFERRED: {
        label: "Transferred",
        tone: "info",
        icon: <ArrowRight className="h-3.5 w-3.5" />,
        bg: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    DROPPED_OUT: {
        label: "Dropped Out",
        tone: "danger",
        icon: <UserX className="h-3.5 w-3.5" />,
        bg: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
};

export default function StudentPromotionPage() {
    const [activeTab, setActiveTab] = useState<"promotion" | "alumni">("promotion");

    // Promotion
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [processingPromotion, setProcessingPromotion] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Filter states
    const [sourceClass, setSourceClass] = useState("");
    const [sourceSection, setSourceSection] = useState("");
    const [sourceYear, setSourceYear] = useState("");

    // Promotion states
    const [targetClass, setTargetClass] = useState("");
    const [targetSection, setTargetSection] = useState("");
    const [targetYear, setTargetYear] = useState("");

    // Alumni
    const [alumni, setAlumni] = useState<AlumniStudent[]>([]);
    const [alumniLoading, setAlumniLoading] = useState(false);
    const [alumniStatusFilter, setAlumniStatusFilter] = useState("");
    const [alumniSearch, setAlumniSearch] = useState("");
    const [markingStatus, setMarkingStatus] = useState<string | null>(null);
    const [markModalStudent, setMarkModalStudent] = useState<AlumniStudent | null>(null);
    const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
    const [markStatus, setMarkStatus] = useState<"ALUMNI" | "TRANSFERRED" | "DROPPED_OUT">("ALUMNI");
    const [alumniPagination, setAlumniPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    // Mark active student as alumni/transferred/dropped-out
    const [isMarkActiveModalOpen, setIsMarkActiveModalOpen] = useState(false);
    const [markActiveStudent, setMarkActiveStudent] = useState<Student | null>(null);
    const [markActiveStatus, setMarkActiveStatus] = useState<"ALUMNI" | "TRANSFERRED" | "DROPPED_OUT">("ALUMNI");
    const [markActiveRemarks, setMarkActiveRemarks] = useState("");
    const [markingActiveStatus, setMarkingActiveStatus] = useState(false);
    const [alumniStats, setAlumniStats] = useState({ total: 0, ALUMNI: 0, TRANSFERRED: 0, DROPPED_OUT: 0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, yearsRes] = await Promise.all([
                client.get("/v1/dashboard/admin/classes"),
                client.get("/v1/admin/settings/academic-years")
            ]);
            setClasses(classesRes.data);
            setAcademicYears(yearsRes.data);
            // Auto-select first active or first available year
            if (yearsRes.data.length > 0) {
                const activeYear = yearsRes.data.find((y: any) => y.isActive);
                const yearId = activeYear ? activeYear.id : yearsRes.data[0].id;
                setSourceYear(yearId);
                setTargetYear(yearId);
            }
        } catch (err: any) {
            toast.error("Failed to load configuration data");
        } finally {
            setLoading(false);
        }
    };

    const fetchAlumni = async (resetPage = false) => {
        setAlumniLoading(true);
        try {
            const page = resetPage ? 1 : alumniPagination.page;
            const params: any = { page, limit: alumniPagination.limit };
            if (alumniStatusFilter) params.status = alumniStatusFilter;
            if (alumniSearch) params.search = alumniSearch;
            const res = await client.get("/v1/admin/alumni", { params });
            setAlumni(res.data.data || []);
            if (res.data.pagination) setAlumniPagination(res.data.pagination);
            if (res.data.stats) setAlumniStats(res.data.stats);
        } catch {
            toast.error("Failed to fetch alumni records");
        } finally {
            setAlumniLoading(false);
        }
    };

    const handleMarkStatus = async () => {
        if (!markModalStudent) return;
        setMarkingStatus(markModalStudent.id);
        try {
            await client.patch("/v1/admin/alumni", { studentId: markModalStudent.id, status: markStatus });
            toast.success(`Student marked as ${STATUS_META[markStatus].label}`);
            setIsMarkModalOpen(false);
            fetchAlumni();
        } catch {
            toast.error("Failed to update student status");
        } finally {
            setMarkingStatus(null);
        }
    };

    const handleMarkActiveStudent = async () => {
        if (!markActiveStudent) return;
        setMarkingActiveStatus(true);
        try {
            await client.patch("/v1/admin/student-lifecycle", {
                studentId: markActiveStudent.id,
                status: markActiveStatus,
                remarks: markActiveRemarks || undefined,
            });
            toast.success(`${markActiveStudent.user.name} marked as ${STATUS_META[markActiveStatus].label}`);
            setIsMarkActiveModalOpen(false);
            setMarkActiveRemarks("");
            // Remove from local list and refresh alumni tab data
            setStudents(prev => prev.filter(s => s.id !== markActiveStudent.id));
            setSelectedStudents(prev => prev.filter(id => id !== markActiveStudent.id));
        } catch {
            toast.error("Failed to update student status");
        } finally {
            setMarkingActiveStatus(false);
        }
    };

    const handleReactivate = async (studentId: string) => {
        setMarkingStatus(studentId);
        try {
            await client.patch("/v1/admin/alumni", { studentId, status: "ACTIVE" });
            toast.success("Student reactivated successfully");
            fetchAlumni();
        } catch {
            toast.error("Failed to reactivate student");
        } finally {
            setMarkingStatus(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === "alumni") fetchAlumni();
    }, [activeTab, alumniStatusFilter, alumniPagination.page]);

    const handleFetchStudents = async () => {
        if (!sourceClass) {
            toast.error("Please select a source class");
            return;
        }
        try {
            setFetchingStudents(true);
            const selectedSourceYearLabel = academicYears.find(y => y.id === sourceYear)?.year || "";
            const res = await client.get("/v1/admin/student-promotion", {
                params: {
                    classId: sourceClass,
                    section: sourceSection || undefined,
                    academicYear: selectedSourceYearLabel
                }
            });
            setStudents(res.data.data);
            setSelectedStudents([]);
            if (res.data.data.length === 0) {
                toast("No students found for the selected criteria");
            }
        } catch (err: any) {
            toast.error("Failed to fetch students");
        } finally {
            setFetchingStudents(false);
        }
    };

    const handlePromote = async () => {
        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }
        if (!targetClass || !targetSection || !targetYear) {
            toast.error("Please complete all destination fields: Class, Section, and Academic Year");
            return;
        }

        const selectedYearLabel = academicYears.find(y => y.id === targetYear)?.year || "";

        try {
            setProcessingPromotion(true);
            await client.post("/v1/admin/student-promotion", {
                studentIds: selectedStudents,
                toClassId: targetClass,
                toSection: targetSection,
                toAcademicYear: selectedYearLabel,
                toSession: selectedYearLabel
            });
            toast.success(`${selectedStudents.length} students promoted successfully`);
            setIsConfirmModalOpen(false);
            setStudents([]);
            setSelectedStudents([]);
            setTargetClass("");
            setTargetSection("");
            setTargetYear("");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Promotion failed");
        } finally {
            setProcessingPromotion(false);
        }
    };

    const toggleSelectStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const columns: ColumnDef<Student>[] = [
        {
            key: "selection",
            header: (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 bg-transparent transition-all"
                        checked={students.length > 0 && selectedStudents.length === students.length}
                        onChange={toggleSelectAll}
                    />
                </div>
            ),
            width: "60px",
            align: "center",
            render: (_, row) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 bg-transparent transition-all"
                        checked={selectedStudents.includes(row.id)}
                        onChange={() => toggleSelectStudent(row.id)}
                    />
                </div>
            )
        },
        {
            key: "user",
            header: "Student Profile",
            render: (user) => (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="" className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/10" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 dark:from-indigo-500/10 dark:to-indigo-500/20 dark:text-indigo-400">
                                <Users className="h-5 w-5" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{user.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: "admissionNo",
            header: "Admission ID",
            render: (val) => (
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5 px-2 py-1 rounded-lg w-fit">
                    <span className="opacity-50 text-[9px] uppercase tracking-tighter">ID:</span>
                    {val}
                </div>
            )
        },
        {
            key: "section",
            header: "Curr. Section",
            render: (val) => (
                <Badge tone="neutral" variant="soft" className="px-2.5 py-1 font-bold rounded-lg border border-gray-100 dark:border-white/5">
                    {val || "N/A"}
                </Badge>
            )
        },
        {
            key: "academicYear",
            header: "Current Session",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <Calendar className="h-3 w-3 opacity-50" />
                    {val}
                </div>
            )
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (_, row) => (
                <button
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-orange-200 dark:border-orange-500/20 bg-orange-50/60 dark:bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                    onClick={() => {
                        setMarkActiveStudent(row);
                        setMarkActiveStatus("ALUMNI");
                        setMarkActiveRemarks("");
                        setIsMarkActiveModalOpen(true);
                    }}
                >
                    <UserX className="h-3.5 w-3.5 flex-shrink-0" />
                    Mark as…
                </button>
            )
        }
    ];

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-5">
                        <div className="relative">
                            <Loader size="xl" variant="primary" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-indigo-400 opacity-50" />
                            </div>
                        </div>
                        <div className="text-center animate-pulse">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">LearnXChain Academics</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Initializing promotion system...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const alumniColumns: ColumnDef<AlumniStudent>[] = [
        {
            key: "user",
            header: "Student",
            render: (user, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profilePic
                            ? <img src={user.profilePic} className="h-full w-full object-cover" />
                            : <Users className="h-5 w-5 text-gray-400" />
                        }
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
                        <span className="text-[11px] text-gray-500">{user.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: "admissionNo",
            header: "Admission No",
            render: (val) => (
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">{val}</span>
            )
        },
        {
            key: "class",
            header: "Last Class",
            render: (cls, row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{cls?.name || "—"}</span>
                    {row.academicRecords?.[0] && (
                        <span className="text-[10px] text-gray-500">{row.academicRecords[0].academicYear}</span>
                    )}
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (val) => {
                const meta = STATUS_META[val];
                return (
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black", meta?.bg)}>
                        {meta?.icon}
                        {meta?.label || val}
                    </div>
                );
            }
        },
        {
            key: "updatedAt",
            header: "Left On",
            render: (val) => (
                <span className="text-xs text-gray-500 font-medium">
                    {new Date(val).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </span>
            )
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 rounded-xl text-xs font-bold border-gray-200 dark:border-white/10"
                        disabled={markingStatus === row.id}
                        onClick={() => { setMarkModalStudent(row); setMarkStatus(row.status); setIsMarkModalOpen(true); }}
                    >
                        Change Status
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        disabled={markingStatus === row.id}
                        onClick={() => handleReactivate(row.id)}
                    >
                        {markingStatus === row.id ? <Loader size="sm" /> : <><UserCheck className="h-3.5 w-3.5 mr-1.5" />Reactivate</>}
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Student Promotion & Alumni | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md shadow-sm">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge tone="accent" variant="soft" className="font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full">Academic Tools</Badge>
                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Promotion & Alumni Registry</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                            {activeTab === "promotion" ? "Student Promotion" : "Alumni Registry"}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md">Seamlessly transition your students to their next academic level with automatic record synchronization.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-2 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                        <div className="flex -space-x-3 overflow-hidden p-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-indigo-500" />
                                </div>
                            ))}
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                {selectedStudents.length}
                            </div>
                        </div>
                        <div className="pr-4 border-r border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedStudents.length} Selected</p>
                        </div>
                        {selectedStudents.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedStudents([])}
                                className="text-[10px] h-8 font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 p-1.5 bg-gray-100/80 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/10 w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab("promotion")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === "promotion"
                                ? "bg-white dark:bg-slate-900 shadow-md text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-white/10"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <ArrowRight className="h-3.5 w-3.5" />
                        Student Promotion
                    </button>
                    <button
                        onClick={() => setActiveTab("alumni")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === "alumni"
                                ? "bg-white dark:bg-slate-900 shadow-md text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-white/10"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Alumni Registry
                    </button>
                </div>

                {activeTab === "promotion" && (
                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Configuration Card */}
                        <div className="space-y-6 lg:col-span-4">
                            <Card variant="outline" className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl group">
                                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
                                <CardHeader className="bg-gray-50/50 dark:bg-white/5 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold tracking-tight">Source Pipeline</CardTitle>
                                            <CardDescription className="text-[11px]">Identify student cohort for promotion</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-8 pb-8 px-7">
                                    <Select
                                        label="From Class"
                                        required
                                        value={sourceClass}
                                        onChange={(e) => {
                                            setSourceClass(e.target.value);
                                            setSourceSection("");
                                        }}
                                        options={[
                                            { label: "Select From Class", value: "" },
                                            ...classes.map(c => ({ label: `🏫 ${c.name}`, value: c.id }))
                                        ]}
                                        className="h-12 font-bold"
                                    />
                                    <Select
                                        label="From Section"
                                        placeholder="All Sections Combined"
                                        value={sourceSection}
                                        onChange={(e) => setSourceSection(e.target.value)}
                                        disabled={!sourceClass}
                                        options={[
                                            { label: "All Sections", value: "" },
                                            ...(classes.find(c => c.id === sourceClass)?.Section.map(s => ({ label: `💠 Section ${s.name}`, value: s.id })) || [])
                                        ]}
                                        className="h-12 font-bold"
                                    />
                                    <Select
                                        label="From Academic Session"
                                        required
                                        value={sourceYear}
                                        onChange={(e) => setSourceYear(e.target.value)}
                                        options={[
                                            { label: "Select Year", value: "" },
                                            ...academicYears.map(y => ({ label: `📅 ${y.year}`, value: y.id }))
                                        ]}
                                        className="h-12 font-bold"
                                    />
                                    <div className="pt-2">
                                        <Button
                                            className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                                            onClick={handleFetchStudents}
                                            disabled={fetchingStudents || !sourceClass}
                                        >
                                            {fetchingStudents ? <Loader size="sm" variant="white" /> : <Search className="h-5 w-5 mr-3" />}
                                            Fetch Records
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card variant="outline" className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl group">
                                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
                                <CardHeader className="bg-gray-50/50 dark:bg-white/5 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold tracking-tight">Destination Logic</CardTitle>
                                            <CardDescription className="text-[11px]">Define where students will land</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-8 pb-8 px-7">
                                    <Select
                                        label="Promote to Class"
                                        required
                                        value={targetClass}
                                        onChange={(e) => {
                                            setTargetClass(e.target.value);
                                            setTargetSection("");
                                        }}
                                        options={[
                                            { label: "Select Destination Class", value: "" },
                                            ...classes.map(c => ({ label: `✨ ${c.name}`, value: c.id }))
                                        ]}
                                        className="h-12 font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Target Section"
                                            required
                                            placeholder="Select"
                                            value={targetSection}
                                            onChange={(e) => setTargetSection(e.target.value)}
                                            disabled={!targetClass}
                                            options={[
                                                { label: "Section", value: "" },
                                                ...(classes.find(c => c.id === targetClass)?.Section.map(s => ({ label: s.name, value: s.id })) || [])
                                            ]}
                                            className="h-12 font-bold"
                                        />
                                        <Select
                                            label="Academic Session"
                                            required
                                            placeholder="Select"
                                            value={targetYear}
                                            onChange={(e) => setTargetYear(e.target.value)}
                                            options={[
                                                { label: "Year", value: "" },
                                                ...academicYears.map(y => ({ label: y.year, value: y.id }))
                                            ]}
                                            className="h-12 font-bold"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            className={cn(
                                                "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl",
                                                "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20",
                                                "disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none dark:disabled:from-slate-800 dark:disabled:to-slate-900"
                                            )}
                                            onClick={() => setIsConfirmModalOpen(true)}
                                            disabled={selectedStudents.length === 0 || processingPromotion}
                                        >
                                            Init Promotion Sequence
                                            <ArrowRight className="h-5 w-5 ml-3" />
                                        </Button>
                                        <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Security Encrypted Action</span>
                                            <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Student List Section */}
                        <div className="lg:col-span-8">
                            <Card variant="outline" className="border-gray-100 dark:border-white/5 overflow-hidden h-full flex flex-col rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
                                <CardHeader className="py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 px-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                                                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black tracking-tight">Student Inventory</CardTitle>
                                                <CardDescription className="font-medium">Managing cohort for {sourceClass ? classes.find(c => c.id === sourceClass)?.name : "unspecified class"}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 rounded-xl shadow-sm">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-black text-gray-700 dark:text-gray-300">{students.length} Total</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                                className="h-9 px-4 rounded-xl font-bold bg-white dark:bg-slate-950 border-gray-200 dark:border-white/10"
                                                disabled={students.length === 0}
                                            >
                                                {selectedStudents.length === students.length ? "Deselect All" : "Select All Available"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative min-h-[500px]">
                                    {fetchingStudents ? (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader size="lg" variant="primary" />
                                                <span className="text-xs font-black uppercase tracking-widest text-indigo-600/60 dark:text-indigo-400/60">Syncing Records</span>
                                            </div>
                                        </div>
                                    ) : null}
                                    <DataTable
                                        columns={columns}
                                        data={students}
                                        dense={false}
                                        className="border-none shadow-none rounded-none bg-transparent"
                                        emptyState={
                                            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                                                <div className="relative mb-8">
                                                    <div className="h-24 w-24 rounded-[36px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/10 flex items-center justify-center transform rotate-6 scale-110 shadow-inner">
                                                        <Users className="h-10 w-10 text-indigo-200 dark:text-indigo-900/50" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white dark:bg-slate-950 shadow-xl border border-gray-50 dark:border-white/10 flex items-center justify-center animate-bounce duration-1000">
                                                        <Search className="h-5 w-5 text-indigo-500" />
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Awaiting Selection</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[320px] mt-2 font-medium leading-relaxed">Please configure the <span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-300 underline-offset-4">Source Pipeline</span> on the left to display students eligible for promotion.</p>
                                                <div className="mt-8 flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">01</div>
                                                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Set Class</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 mt-2 text-gray-200 dark:text-white/10" />
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">02</div>
                                                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Fetch</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 mt-2 text-gray-200 dark:text-white/10" />
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">03</div>
                                                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Promote</span>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>)}

                {activeTab === "alumni" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card variant="outline" className="border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Graduated / Alumni</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{alumniStats.ALUMNI}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="outline" className="border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <ArrowRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transferred</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{alumniStats.TRANSFERRED}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="outline" className="border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                            <UserX className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dropped Out</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{alumniStats.DROPPED_OUT}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or admission no..."
                                    value={alumniSearch}
                                    onChange={(e) => setAlumniSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && fetchAlumni(true)}
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="w-48">
                                <Select
                                    value={alumniStatusFilter}
                                    onChange={(e) => setAlumniStatusFilter(e.target.value)}
                                    options={[
                                        { label: "All Statuses", value: "" },
                                        { label: "Alumni / Graduated", value: "ALUMNI" },
                                        { label: "Transferred", value: "TRANSFERRED" },
                                        { label: "Dropped Out", value: "DROPPED_OUT" },
                                    ]}
                                    className="h-12 font-bold"
                                />
                            </div>
                            <Button
                                onClick={() => fetchAlumni(true)}
                                className="h-12 px-8 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                            <Button
                                onClick={() => fetchAlumni(false)}
                                variant="outline"
                                className="h-12 px-4 rounded-2xl font-bold border-gray-200 dark:border-white/10"
                                disabled={alumniLoading}
                                title="Refresh list"
                            >
                                <RefreshCw className={cn("h-4 w-4", alumniLoading && "animate-spin")} />
                            </Button>
                        </div>

                        {/* Alumni Table */}
                        <Card variant="outline" className="border-gray-100 dark:border-white/5 overflow-hidden rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none">
                            <CardHeader className="py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black tracking-tight">Alumni Registry</CardTitle>
                                            <CardDescription className="text-xs font-medium">Students who left, transferred, or graduated from the institution</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 rounded-xl shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300">{alumniPagination.total} Total</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 relative min-h-[400px]">
                                {alumniLoading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm rounded-b-3xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size="lg" variant="primary" />
                                            <span className="text-xs font-black uppercase tracking-widest text-indigo-600/60 dark:text-indigo-400/60">Loading Records</span>
                                        </div>
                                    </div>
                                )}
                                <DataTable
                                    columns={alumniColumns}
                                    data={alumni}
                                    dense={false}
                                    className="border-none shadow-none rounded-none bg-transparent"
                                    emptyState={
                                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                            <div className="h-16 w-16 rounded-[28px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/10 flex items-center justify-center mb-4">
                                                <GraduationCap className="h-8 w-8 text-indigo-200 dark:text-indigo-900/50" />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">No Records Found</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1.5 font-medium">
                                                No alumni match your current filters. Try a different name or clear the status filter.
                                            </p>
                                        </div>
                                    }
                                />
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {alumniPagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={alumniPagination.page <= 1 || alumniLoading}
                                    onClick={() => setAlumniPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    className="rounded-xl font-bold"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-bold text-gray-500">
                                    Page {alumniPagination.page} of {alumniPagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={alumniPagination.page >= alumniPagination.totalPages || alumniLoading}
                                    onClick={() => setAlumniPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    className="rounded-xl font-bold"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Confirmation Modal */}
            <Modal
                open={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title={
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Final Authorization</h3>
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest leading-none">Record Permanency Check</p>
                        </div>
                    </div>
                }
                size="md"
                footer={
                    <div className="flex w-full gap-4 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl border border-gray-100 dark:border-white/10 font-bold text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5"
                            onClick={() => setIsConfirmModalOpen(false)}
                        >
                            Secondary Inspection
                        </Button>
                        <Button
                            className="flex-[1.5] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                            onClick={handlePromote}
                            disabled={processingPromotion}
                        >
                            {processingPromotion ? <Loader size="sm" variant="white" /> : <CheckCircle2 className="h-4 w-4 mr-3" />}
                            Execute Promotion
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6 py-4">
                    <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <AlertCircle className="h-16 w-16" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 animate-pulse pt-1">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">Irreversible Action Warning</h4>
                                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1 font-medium leading-relaxed">
                                    You are promoting <span className="font-black text-amber-600 underline underline-offset-2">{selectedStudents.length} students</span>.
                                    The system will update their unique enrollment tokens and create a permanent ledger in the <span className="font-bold underline decoration-amber-400/50">Promotion History</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-stretch justify-between p-1 rounded-[32px] bg-slate-950/5 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="flex-1 p-5 text-center bg-white dark:bg-slate-900 rounded-[28px] shadow-sm m-1 border border-gray-50 dark:border-white/5">
                            <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-black">Origin</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">Class {classes.find(c => c.id === sourceClass)?.name}</span>
                                <Badge tone="neutral" className="w-fit mx-auto mt-2 text-[8px] px-1.5 font-black uppercase tracking-tighter">Sec {sourceSection || "ALL"}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center px-2">
                            <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-lg border border-gray-100 dark:border-white/10 z-10 scale-110">
                                <ChevronRight className="h-5 w-5 text-indigo-500" />
                            </div>
                        </div>
                        <div className="flex-1 p-5 text-center bg-white dark:bg-slate-900 rounded-[28px] shadow-sm m-1 border border-gray-50 dark:border-white/5">
                            <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-black">Destination</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Class {classes.find(c => c.id === targetClass)?.name}</span>
                                <Badge tone="success" className="w-fit mx-auto mt-2 text-[8px] px-1.5 font-black uppercase tracking-tighter">Sec {targetSection}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-indigo-500 border border-gray-100 dark:border-white/10 shadow-sm">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest leading-none">Target Session</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{academicYears.find(y => y.id === targetYear)?.year}</span>
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10" />
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-emerald-500 border border-gray-100 dark:border-white/10 shadow-sm">
                                <FileCheck className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest leading-none">Security Log</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">Automated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Mark Status Modal */}
            <Modal
                open={isMarkModalOpen}
                onClose={() => setIsMarkModalOpen(false)}
                title={
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Update Student Status</h3>
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest leading-none">{markModalStudent?.user.name}</p>
                        </div>
                    </div>
                }
                size="sm"
                footer={
                    <div className="flex w-full gap-4 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl border border-gray-100 dark:border-white/10 font-bold"
                            onClick={() => setIsMarkModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[1.5] h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                            onClick={handleMarkStatus}
                            disabled={!!markingStatus}
                        >
                            {markingStatus ? <Loader size="sm" variant="white" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Update Status
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5 py-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {markModalStudent?.user.profilePic
                                    ? <img src={markModalStudent.user.profilePic} className="h-full w-full object-cover" alt="" />
                                    : <Users className="h-5 w-5 text-gray-400" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{markModalStudent?.user.name}</p>
                                <p className="text-xs text-gray-500">{markModalStudent?.admissionNo} · {markModalStudent?.class?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select New Status</p>
                        <div className="grid grid-cols-3 gap-3">
                            {(["ALUMNI", "TRANSFERRED", "DROPPED_OUT"] as const).map((s) => {
                                const meta = STATUS_META[s];
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setMarkStatus(s)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs",
                                            markStatus === s
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                                : "border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-white/20"
                                        )}
                                    >
                                        <span className={cn("p-2 rounded-xl", meta.bg)}>{meta.icon}</span>
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Mark Active Student as Alumni / Transferred / Dropped Out */}
            <Modal
                open={isMarkActiveModalOpen}
                onClose={() => setIsMarkActiveModalOpen(false)}
                title={
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <UserX className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight">Mark Student as Departed</h3>
                            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest leading-none">{markActiveStudent?.user.name}</p>
                        </div>
                    </div>
                }
                size="md"
                footer={
                    <div className="flex w-full gap-4 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl border border-gray-100 dark:border-white/10 font-bold"
                            onClick={() => setIsMarkActiveModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[1.5] h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                            onClick={handleMarkActiveStudent}
                            disabled={markingActiveStatus}
                        >
                            {markingActiveStatus ? <Loader size="sm" variant="white" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Confirm — Mark as {markActiveStatus === "ALUMNI" ? "Alumni" : markActiveStatus === "TRANSFERRED" ? "Transferred" : "Dropped Out"}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-5 py-4">
                    {/* Student preview */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {markActiveStudent?.user.profilePic
                                    ? <img src={markActiveStudent.user.profilePic} className="h-full w-full object-cover" alt="" />
                                    : <Users className="h-5 w-5 text-gray-400" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{markActiveStudent?.user.name}</p>
                                <p className="text-xs text-gray-500">{markActiveStudent?.admissionNo} · {markActiveStudent?.class?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status picker */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">What happened to this student?</p>
                        <div className="grid grid-cols-3 gap-3">
                            {(["ALUMNI", "TRANSFERRED", "DROPPED_OUT"] as const).map((s) => {
                                const meta = STATUS_META[s];
                                const desc = s === "ALUMNI"
                                    ? "Graduated / completed"
                                    : s === "TRANSFERRED"
                                        ? "Moved to another school"
                                        : "Left without completing";
                                const selected = markActiveStatus === s;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setMarkActiveStatus(s)}
                                        className={cn(
                                            "flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all w-full",
                                            selected
                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                                                : "border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 bg-white dark:bg-white/5"
                                        )}
                                    >
                                        <span className={cn("p-2 rounded-xl", meta.bg)}>{meta.icon}</span>
                                        <div>
                                            <p className={cn("text-sm font-black", selected ? "text-orange-700 dark:text-orange-300" : "text-gray-800 dark:text-gray-200")}>{meta.label}</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-tight mt-0.5">{desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optional remarks */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Remarks <span className="normal-case font-medium text-gray-400">(optional)</span></p>
                        <textarea
                            value={markActiveRemarks}
                            onChange={(e) => setMarkActiveRemarks(e.target.value)}
                            placeholder="e.g. Moved to another city, fee defaulter..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                            This student will be moved to the <strong>Alumni Registry</strong>. You can reactivate them at any time from there.
                        </p>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
