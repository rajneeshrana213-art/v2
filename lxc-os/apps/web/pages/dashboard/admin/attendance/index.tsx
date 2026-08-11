
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/forms/input";
import { Users, GraduationCap, UserCheck, BrainCircuit, Search, Calendar, Filter, Camera, Upload, CheckCircle2, XCircle, MapPin, Clock, MoreHorizontal, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from '@/components/ui/feedback/Loader';
import Link from "next/link";
import { getISTDateString, parseInstitutionalDate } from "@/lib/utils/date-utils";

const tabs = [
    { id: "classes", label: "Classes", icon: Users },
    { id: "teachers", label: "Teachers", icon: GraduationCap },
    { id: "staff", label: "Staff members", icon: UserCheck },
    { id: "ai", label: "AI Services", icon: BrainCircuit },
];

export default function AdminAttendancePage() {
    const [activeTab, setActiveTab] = useState("classes");
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(getISTDateString());

    return (
        <>
            <Head>
                <title>Attendance Management - Admin Dashboard</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div id="header-layout" className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">Attendance Management</h1>
                            <p className="text-sm text-gray-500 font-medium">Monitor and manage attendance across your institution</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={date}
                                    max={getISTDateString()}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-10 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div id="tabs-layout" className="flex items-center gap-1 rounded-2xl bg-gray-100/50 dark:bg-gray-800/30 p-1.5 w-fit border border-gray-200 dark:border-white/5 backdrop-blur-md">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 transform scale-[1.02] dark:bg-gray-700 dark:text-indigo-300"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/40 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "classes" && <ClassesTab date={date} />}
                            {activeTab === "teachers" && <TeachersTab date={date} />}
                            {activeTab === "staff" && <StaffTab date={date} />}
                            {activeTab === "ai" && <AIServicesTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DashboardLayout>
        </>
    );
}

// --- Components ---

function ClassesTab({ date }: { date: string }) {
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [viewRange, setViewRange] = useState<string>("daily");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents();
        }
    }, [selectedClass, selectedSection, date, viewRange]);

    const fetchClasses = async () => {
        try {
            const res = await client.get("/v1/dashboard/admin/classes");
            const classData = res.data;
            setClasses(classData);
            if (classData.length > 0) {
                const firstClass = classData[0];
                setSelectedClass(firstClass.id);
                if (firstClass.Section && firstClass.Section.length > 0) {
                    setSections(firstClass.Section);
                    // We don't necessarily want to select the first section by default if we want "All Sections"
                    // But if sections exist, selecting the first one is also fine.
                    // Following existing logic:
                    setSelectedSection(firstClass.Section[0].id);
                } else {
                    setSections([]);
                    setSelectedSection("");
                }
            }
        } catch (err) {
            toast.error("Failed to fetch classes");
        }
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        const cls = classes.find(c => c.id === classId);
        if (cls && cls.Section && cls.Section.length > 0) {
            setSections(cls.Section);
            setSelectedSection(cls.Section[0].id);
        } else {
            setSections([]);
            setSelectedSection("");
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            let url = `/v1/admin/dashboard/attendance/students?classId=${selectedClass}&date=${date}&viewRange=${viewRange}`;
            if (selectedSection) url += `&sectionId=${selectedSection}`;
            const res = await client.get(url);
            setStudents(res.data);
        } catch (err) {
            toast.error("Failed to fetch student attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-0 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50 p-6">
                    <div id="card-layout" className="flex items-stretch justify-between w-full gap-4 min-h-[80px]">
                        <div className="flex flex-col justify-center space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <Users className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Student Attendance</CardTitle>
                            </div>
                            <CardDescription className="font-semibold text-gray-500 flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    {classes.find(c => c.id === selectedClass)?.name || "Select Class"}
                                </span>
                                {selectedSection && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                                            {sections.find(s => s.id === selectedSection)?.name || "Section"}
                                        </span>
                                    </>
                                )}
                                <span className="ml-2 text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-400">
                                    {parseInstitutionalDate(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </CardDescription>
                        </div>

                        <div id="controls-layout" className="flex items-center gap-3 self-center">
                            <div className="flex flex-col">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Target Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer min-w-[120px]"
                                >
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10" />

                            <div className="flex flex-col">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Target Section</label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer min-w-[120px]"
                                    disabled={sections.length === 0}
                                >
                                    <option value="" className="dark:bg-slate-900">All Sections</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10" />

                            <div className="flex flex-col">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">View Range</label>
                                <select
                                    value={viewRange}
                                    onChange={(e) => setViewRange(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer min-w-[100px]"
                                >
                                    <option value="daily" className="dark:bg-slate-900">Daily</option>
                                    <option value="weekly" className="dark:bg-slate-900">Weekly</option>
                                    <option value="monthly" className="dark:bg-slate-900">Monthly</option>
                                    <option value="all" className="dark:bg-slate-900">All Time</option>
                                </select>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20 flex flex-col items-center justify-center min-w-[56px]">
                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{students.length}</span>
                                <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-500 uppercase">Students</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader className="" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Roll No</th>
                                        {viewRange === "daily" ? (
                                            <th className="px-6 py-4">Attendance Highlights</th>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-center">Sessions</th>
                                                <th className="px-6 py-4 text-center">Attendance %</th>
                                                <th className="px-6 py-4">Status</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                                                        {student.profilePic ? (
                                                            <img src={student.profilePic} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Users className="h-5 w-5 text-indigo-500" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="font-mono">{student.rollNo || "N/A"}</Badge>
                                            </td>
                                            {viewRange === "daily" ? (
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {student.attendances.length > 0 ? (
                                                            student.attendances.map((att: any) => (
                                                                <Badge
                                                                    key={att.id}
                                                                    tone={att.present ? "success" : "danger"}
                                                                    variant="soft"
                                                                    className="text-[10px] font-bold"
                                                                >
                                                                    {att.subject}: {att.present ? "P" : "A"}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No records for today</span>
                                                        )}
                                                    </div>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">
                                                        {student.attendances.filter((a: any) => a.present).length} / {student.attendances.length}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                                {student.attendances.length > 0
                                                                    ? Math.round((student.attendances.filter((a: any) => a.present).length / student.attendances.length) * 100)
                                                                    : 0}%
                                                            </span>
                                                            <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500 transition-all"
                                                                    style={{ width: `${student.attendances.length > 0 ? (student.attendances.filter((a: any) => a.present).length / student.attendances.length) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.attendances.length > 0 ? (
                                                            <Badge
                                                                tone={((student.attendances.filter((a: any) => a.present).length / student.attendances.length) * 100) >= 75 ? "success" : "warning"}
                                                                variant="soft"
                                                            >
                                                                {((student.attendances.filter((a: any) => a.present).length / student.attendances.length) * 100) >= 75 ? "Excellent" : "Low Attendance"}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/admin/attendance/student/${student.id}`}>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-gray-500 font-medium">
                                                No students found in this class.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function TeachersTab({ date }: { date: string }) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [viewRange, setViewRange] = useState<string>("daily");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, [date, viewRange]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/v1/admin/dashboard/attendance/teachers?date=${date}&viewRange=${viewRange}`);
            setTeachers(res.data);
        } catch (err) {
            toast.error("Failed to fetch teacher attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-0 border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/50 p-6">
                <div id="card-layout" className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">Teacher Attendance Monitor</CardTitle>
                        <CardDescription>Daily check-in status and geo-fence verification</CardDescription>
                    </div>
                    <div id="controls-layout" className="flex items-center gap-3">
                        <select
                            value={viewRange}
                            onChange={(e) => setViewRange(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="daily" className="dark:bg-slate-900">Daily</option>
                            <option value="weekly" className="dark:bg-slate-900">Weekly</option>
                            <option value="monthly" className="dark:bg-slate-900">Monthly</option>
                            <option value="all" className="dark:bg-slate-900">All Time</option>
                        </select>
                        <div className="flex gap-2">
                            <StatBadge label="Present" value={teachers.filter(t => (viewRange === 'daily' ? t.attendances?.[0]?.status === "PRESENT" : t.attendances?.some((a: any) => a.status === 'PRESENT'))).length} type="success" />
                            <StatBadge label="Total" value={teachers.length} type="info" />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader className="" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Teacher</th>
                                    {viewRange === "daily" ? (
                                        <>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">AI Scan</th>
                                            <th className="px-6 py-4">Location</th>
                                            <th className="px-6 py-4">Time</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-center">Days Present</th>
                                            <th className="px-6 py-4 text-center">Attendance %</th>
                                            <th className="px-6 py-4">Status</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {teachers.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                                                    {t.profilePic ? (
                                                        <img src={t.profilePic} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <GraduationCap className="h-5 w-5 text-indigo-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">{t.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{t.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {viewRange === "daily" ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    {t.attendances?.[0] ? (
                                                        <Badge tone={t.attendances[0].status === "PRESENT" ? "success" : "danger"} variant="solid" className="font-bold">
                                                            {t.attendances[0].status}
                                                        </Badge>
                                                    ) : (
                                                        <Badge tone="neutral" variant="soft" className="font-bold">NOT MARKED</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.attendances?.[0] ? (
                                                        <div className="flex items-center gap-1.5">
                                                            {t.attendances[0].matched ? (
                                                                <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-[10px] font-bold text-emerald-600">VERIFIED</span></>
                                                            ) : (
                                                                <><XCircle className="h-4 w-4 text-rose-500" /> <span className="text-[10px] font-bold text-rose-600">FAILED</span></>
                                                            )}
                                                        </div>
                                                    ) : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.attendances?.[0] ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {t.attendances[0].latitude?.toFixed(4) || "0.0000"}, {t.attendances[0].longitude?.toFixed(4) || "0.0000"}
                                                        </div>
                                                    ) : "-"}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                                                    {t.attendances?.[0] ? new Date(t.attendances[0].date).toLocaleTimeString() : "-"}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">
                                                    {t.attendances.filter((a: any) => a.status === 'PRESENT').length} days
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                            {Math.round((t.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(t.attendances.length, 1)) * 100)}%
                                                        </span>
                                                        <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 transition-all"
                                                                style={{ width: `${(t.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(t.attendances.length, 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        tone={((t.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(t.attendances.length, 1)) * 100) >= 90 ? "success" : "warning"}
                                                        variant="soft"
                                                    >
                                                        {((t.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(t.attendances.length, 1)) * 100) >= 90 ? "Regular" : "Irregular"}
                                                    </Badge>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/admin/attendance/teacher/${t.id}`}>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg outline-none focus:ring-2 ring-indigo-500">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StaffTab({ date }: { date: string }) {
    const [staff, setStaff] = useState<any[]>([]);
    const [viewRange, setViewRange] = useState<string>("daily");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, [date, viewRange]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/v1/admin/dashboard/attendance/staff?date=${date}&viewRange=${viewRange}`);
            setStaff(res.data);
        } catch (err) {
            toast.error("Failed to fetch staff attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-0 border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/50 p-6">
                <div id="card-layout" className="flex items-center justify-between w-full">
                    <div>
                        <CardTitle className="text-lg">Staff Attendance System</CardTitle>
                        <CardDescription>Punch levels, working hours and overtime tracking</CardDescription>
                    </div>
                    <div id="controls-layout" className="flex items-center gap-3">
                        <select
                            value={viewRange}
                            onChange={(e) => setViewRange(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="daily" className="dark:bg-slate-900">Daily</option>
                            <option value="weekly" className="dark:bg-slate-900">Weekly</option>
                            <option value="monthly" className="dark:bg-slate-900">Monthly</option>
                            <option value="all" className="dark:bg-slate-900">All Time</option>
                        </select>
                        <div className="flex gap-2">
                            <StatBadge label="On Duty" value={staff.filter(s => (viewRange === 'daily' ? s.attendances?.[0]?.punchIn && !s.attendances?.[0]?.punchOut : s.attendances?.some((a: any) => a.punchIn && !a.punchOut))).length} type="success" />
                            <StatBadge label="Total" value={staff.length} type="info" />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader className="" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    {viewRange === "daily" ? (
                                        <>
                                            <th className="px-6 py-4">Punch In</th>
                                            <th className="px-6 py-4">Punch Out</th>
                                            <th className="px-6 py-4">Work Hours</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Performance</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-center">Days Present</th>
                                            <th className="px-6 py-4 text-center">Attendance %</th>
                                            <th className="px-6 py-4">Status</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {staff.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center overflow-hidden">
                                                    {s.profilePic ? (
                                                        <img src={s.profilePic} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserCheck className="h-5 w-5 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">{s.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{s.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {viewRange === "daily" ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    {s.attendances?.[0]?.punchIn ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {new Date(s.attendances[0].punchIn).toLocaleTimeString()}
                                                            </span>
                                                            {s.attendances[0].isLateEntry && (
                                                                <Badge tone="danger" variant="soft" className="w-fit text-[9px] h-4 mt-1">LATE</Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {s.attendances?.[0]?.punchOut ? (
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {new Date(s.attendances[0].punchOut).toLocaleTimeString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-orange-500 font-bold italic animate-pulse">On-Going</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-xs font-bold font-mono">
                                                            {s.attendances?.[0]?.workingHours ? `${s.attendances[0].workingHours.toFixed(2)}h` : "-"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {s.attendances?.[0] ? (
                                                        <Badge tone="info" variant="outline" className="font-bold text-[10px]">
                                                            {s.attendances[0].status}
                                                        </Badge>
                                                    ) : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {s.attendances?.[0]?.overtimeHours > 0 && (
                                                        <Badge tone="success" variant="soft" className="text-[9px] font-black italic">
                                                            OT: +{s.attendances[0].overtimeHours.toFixed(1)}h
                                                        </Badge>
                                                    )}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">
                                                    {s.attendances.filter((a: any) => a.status === 'PRESENT').length} days
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                            {Math.round((s.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(s.attendances.length, 1)) * 100)}%
                                                        </span>
                                                        <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 transition-all"
                                                                style={{ width: `${(s.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(s.attendances.length, 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        tone={((s.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(s.attendances.length, 1)) * 100) >= 90 ? "success" : "warning"}
                                                        variant="soft"
                                                    >
                                                        {((s.attendances.filter((a: any) => a.status === 'PRESENT').length / Math.max(s.attendances.length, 1)) * 100) >= 90 ? "Regular" : "Irregular"}
                                                    </Badge>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/admin/attendance/staff/${s.id}`}>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg outline-none focus:ring-2 ring-indigo-500">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AIServicesTab() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [scanMode, setScanMode] = useState<"camera" | "upload" | null>(null);
    const [scanTeacher, setScanTeacher] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [geoLocation, setGeoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await client.get("/v1/admin/dashboard/attendance/face-models");
            setTeachers(res.data);
        } catch (err) {
            toast.error("Failed to fetch face model status");
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            toast.error("Failed to access camera");
            setScanMode(null);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleOpenScan = (teacher: any, mode: "camera" | "upload") => {
        setScanTeacher(teacher);
        setScanMode(mode);
        setGeoLocation(null);
        setGeoError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setGeoLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => setGeoError("Location unavailable — geo-fence will not be stored.")
            );
        } else {
            setGeoError("Geolocation not supported by this browser.");
        }
        if (mode === "camera") {
            startCamera();
        }
    };

    const handleCloseScan = () => {
        stopCamera();
        setScanMode(null);
        setScanTeacher(null);
    };

    const processAndUploadImage = async (base64Image: string, teacherId: string) => {
        setProcessing(teacherId);
        try {

            const aiRes = await client.post("/v1/ai/embedding", { imageUrl: base64Image });
            const aiData = aiRes.data;
            const embedding = aiData.embedding;

            await client.post("/v1/admin/dashboard/attendance/face-models", {
                teacherId,
                faceImage: base64Image,
                embedding,
                latitude: geoLocation?.latitude ?? null,
                longitude: geoLocation?.longitude ?? null,
            });

            toast.success(`Face model registered${geoLocation ? ' with location' : ' (no location)'}`);
            fetchStatus();
            handleCloseScan();
        } catch (err: any) {
            toast.error(err.message || "Failed to register face model");
        } finally {
            setProcessing(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && scanTeacher) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const base64Image = canvasRef.current.toDataURL('image/jpeg');
                processAndUploadImage(base64Image, scanTeacher.id);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && scanTeacher) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                processAndUploadImage(base64Image, scanTeacher.id);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteModel = async (teacherId: string) => {
        if (!confirm("Are you sure you want to delete this face model?")) return;
        setProcessing(teacherId);
        try {
            await client.delete(`/v1/admin/dashboard/attendance/face-models?teacherId=${teacherId}`);
            toast.success("Face model deleted successfully");
            fetchStatus();
        } catch (err) {
            toast.error("Failed to delete face model");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-900">
                    <CardHeader className="border-b border-gray-100 dark:border-white/5 p-6">
                        <div id="card-layout" className="flex items-center justify-between w-full">
                            <div>
                                <CardTitle className="text-lg">Teacher Face Recognition Models</CardTitle>
                                <CardDescription>Manage biometric models for AI-powered attendance</CardDescription>
                            </div>
                            <Badge tone="accent" variant="soft" className="font-bold">AI ACTIVE</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader className="" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Teacher</th>
                                            <th className="px-6 py-4">Biometric Status</th>
                                            <th className="px-6 py-4">Geo-Fence</th>
                                            <th className="px-6 py-4">Last Sync</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {teachers.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden">
                                                            {t.profilePic ? (
                                                                <img src={t.profilePic} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <GraduationCap className="h-5 w-5 text-indigo-500" />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white">{t.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.hasFaceModel ? (
                                                        <Badge tone="success" variant="soft" className="gap-1.5 font-bold">
                                                            <CheckCircle2 className="h-3 w-3" /> REGISTERED
                                                        </Badge>
                                                    ) : (
                                                        <Badge tone="warning" variant="soft" className="gap-1.5 font-bold">
                                                            <XCircle className="h-3 w-3" /> MISSING
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.latitude && t.longitude ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span>{Number(t.latitude).toFixed(4)}, {Number(t.longitude).toFixed(4)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-amber-500">No location</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {t.lastUpdated ? new Date(t.lastUpdated).toLocaleDateString() : "Never"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            onClick={() => handleOpenScan(t, "camera")}
                                                            disabled={processing === t.id}
                                                            variant="outline"
                                                            className="h-8 px-3 text-xs font-bold rounded-lg"
                                                            title="Scan via Camera"
                                                        >
                                                            <Camera className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleOpenScan(t, "upload")}
                                                            disabled={processing === t.id}
                                                            variant="outline"
                                                            className="h-8 px-3 text-xs font-bold rounded-lg"
                                                            title="Upload Image"
                                                        >
                                                            <Upload className="h-3.5 w-3.5" />
                                                        </Button>
                                                        {t.hasFaceModel && (
                                                            <Button
                                                                onClick={() => handleDeleteModel(t.id)}
                                                                disabled={processing === t.id}
                                                                variant="outline"
                                                                className="h-8 px-3 text-xs font-bold rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50"
                                                                title="Delete Face Model"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-white dark:bg-gradient-to-br dark:from-indigo-600 dark:to-purple-700 border border-indigo-100 dark:border-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-white">
                                <BrainCircuit className="h-5 w-5" />
                                AI Services Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-indigo-50 dark:bg-white/10 p-3 rounded-xl border border-indigo-100 dark:border-white/10">
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-100">Face Match Engine</span>
                                <Badge variant="outline" className="border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</Badge>
                            </div>
                            <div className="flex justify-between items-center bg-indigo-50 dark:bg-white/10 p-3 rounded-xl border border-indigo-100 dark:border-white/10">
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-100">Embedding Extraction</span>
                                <Badge variant="outline" className="border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</Badge>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-black/20 rounded-2xl border border-indigo-100 dark:border-white/5 mt-4">
                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400 dark:text-indigo-200/60 mb-2">Metrics</p>
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-indigo-700 dark:text-white">99.8%</span>
                                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-200">Accuracy</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="text-[11px] leading-relaxed text-gray-500 font-medium space-y-3">
                            <p>• Ensure teacher is looking directly at the camera during scan.</p>
                            <p>• Avoid strong backlight or dark environments during face model registration.</p>
                            <p>• Face models are encrypted and stored as vector embeddings for security.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Scan Modal */}
            {scanMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">
                                {scanMode === "camera" ? "Camera Scan" : "Upload Image"} - {scanTeacher?.name}
                            </h3>
                            <button onClick={handleCloseScan} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Geo-fence location status */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mb-4 ${geoLocation
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : geoError
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            }`}>
                            <MapPin className="h-3.5 w-3.5" />
                            {geoLocation
                                ? `Geo-fence set: ${geoLocation.latitude.toFixed(5)}, ${geoLocation.longitude.toFixed(5)}`
                                : geoError ?? 'Acquiring location…'}
                        </div>

                        {scanMode === "camera" ? (
                            <div className="space-y-4 flex flex-col items-center">
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <Button
                                    onClick={capturePhoto}
                                    disabled={processing === scanTeacher?.id}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6"
                                >
                                    {processing === scanTeacher?.id ? <Loader variant="white" /> : "Capture & Save"}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6 flex flex-col items-center py-8">
                                <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl w-full text-center">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                    <label className="cursor-pointer">
                                        <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm">Select Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={processing === scanTeacher?.id} />
                                    </label>
                                </div>
                                {processing === scanTeacher?.id && <Loader />}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBadge({ label, value, type }: { label: string; value: number; type: "success" | "danger" | "info" }) {
    const colors = {
        success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        danger: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        info: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
    };

    return (
        <div className={`h-8 px-3 rounded-lg flex items-center gap-2 border ${colors[type]}`}>
            <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
            <span className="text-xs font-black">{value}</span>
        </div>
    );
}
