
import { useEffect, useState } from "react";
import { encodeId } from "@/lib/utils/hashId";
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
import { Input } from "@/components/ui/forms/input";
import { FileText, Plus, Calendar, Search, MoreVertical, Edit2, Trash2, Eye, TrendingUp, CheckCircle2, AlertCircle, BookOpen, Clock, MapPin, Trophy, Layers, Printer, Download } from 'lucide-react';
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/feedback/modal";
import { format } from "date-fns";
import Link from "next/link";
import { Loader } from '@/components/ui/feedback/Loader';
import { getISTDateString, makeISTDateTime, parseInstitutionalDate } from "@/lib/utils/date-utils";

interface Exam {
    id: string;
    title: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    classId: string;
    subjectId: string;
    passMark: number | null;
    totalMarks: number | null;
    duration: number | null;
    roomNumber: number | null;
    isPublished: boolean;
    class: { name: string };
    subject: { name: string };
    _count: { results: number };
}

export default function AdminExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkExams, setBulkExams] = useState<any[]>([
        { subjectId: "", title: "", scheduleDate: "", startTime: "", endTime: "" }
    ]);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        scheduleDate: "",
        startTime: "",
        endTime: "",
        classId: "",
        subjectId: "",
        passMark: "",
        totalMarks: "",
        duration: "",
        roomNumber: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [examsRes, classesRes, subjectsRes] = await Promise.all([
                client.get("/v1/admin/exams"),
                client.get("/v1/dashboard/admin/classes"),
                client.get("/v1/dashboard/admin/subjects")
            ]);
            setExams(examsRes.data.data);
            setFilteredExams(examsRes.data.data);
            setClasses(classesRes.data);
            setSubjects(subjectsRes.data);
        } catch (err: any) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = exams.filter(exam =>
            exam.title.toLowerCase().includes(lowercasedSearch) ||
            exam.subject.name.toLowerCase().includes(lowercasedSearch) ||
            exam.class.name.toLowerCase().includes(lowercasedSearch)
        );
        setFilteredExams(filtered);
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        handleFilter();
    }, [searchTerm, exams]);

    const handleOpenModal = (exam: Exam | null = null) => {
        if (exam) {
            setIsEditMode(true);
            setSelectedExam(exam);
            setFormData({
                title: exam.title,
                scheduleDate: format(new Date(exam.scheduleDate), "yyyy-MM-dd"),
                startTime: format(new Date(exam.startTime), "HH:mm"),
                endTime: format(new Date(exam.endTime), "HH:mm"),
                classId: exam.classId,
                subjectId: exam.subjectId,
                passMark: exam.passMark?.toString() || "",
                totalMarks: exam.totalMarks?.toString() || "",
                duration: exam.duration?.toString() || "",
                roomNumber: exam.roomNumber?.toString() || ""
            });
        } else {
            setIsEditMode(false);
            setIsBulkMode(false);
            setSelectedExam(null);
            setFormData({
                title: "",
                scheduleDate: getISTDateString(),
                startTime: "09:00",
                endTime: "12:00",
                classId: "",
                subjectId: "",
                passMark: "33",
                totalMarks: "100",
                duration: "180",
                roomNumber: ""
            });
            setBulkExams([{ subjectId: "", title: "", scheduleDate: getISTDateString(), startTime: "09:00", endTime: "12:00" }]);
        }
        setIsModalOpen(true);
    };

    const handleSaveExam = async (e: React.FormEvent) => {
        e.preventDefault();

        const today = getISTDateString();

        try {
            if (isBulkMode) {
                if (!formData.classId) return toast.error("Please select a class first");
                const validExams = bulkExams.filter(e => e.subjectId && e.scheduleDate);
                if (validExams.length === 0) return toast.error("Please add at least one valid exam");

                for (const ex of validExams) {
                    if (ex.scheduleDate < today) {
                        return toast.error(`Exam for ${subjects.find(s => s.id === ex.subjectId)?.name || 'Subject'} cannot be in the past`);
                    }
                }

                for (let i = 0; i < validExams.length; i++) {
                    for (let j = i + 1; j < validExams.length; j++) {
                        const e1 = validExams[i];
                        const e2 = validExams[j];
                        if (e1.scheduleDate === e2.scheduleDate) {
                            if (e1.subjectId === e2.subjectId) {
                                return toast.error(`Duplicate subject exam for ${subjects.find(s => s.id === e1.subjectId)?.name} on ${e1.scheduleDate}`);
                            }

                            if (e1.startTime < e2.endTime && e2.startTime < e1.endTime) {
                                return toast.error(`Scheduling conflict on ${e1.scheduleDate}: ${subjects.find(s => s.id === e1.subjectId)?.name} overlaps with ${subjects.find(s => s.id === e2.subjectId)?.name}`);
                            }
                        }
                    }
                }

                for (const ex of validExams) {
                    const conflict = exams.find(existing =>
                        existing.classId === formData.classId &&
                        format(new Date(existing.scheduleDate), "yyyy-MM-dd") === ex.scheduleDate &&
                        ((existing.subjectId === ex.subjectId) ||
                            (ex.startTime < format(new Date(existing.endTime), "HH:mm") && format(new Date(existing.startTime), "HH:mm") < ex.endTime)) &&
                        (!isEditMode || existing.id !== selectedExam?.id)
                    );
                    if (conflict) {
                        return toast.error(`Conflict with existing exam: ${conflict.subject.name} is already scheduled on this date/time`);
                    }
                }

                const payload = {
                    classId: formData.classId,
                    exams: validExams.map(ex => ({
                        ...ex,
                        title: formData.title,
                        totalMarks: formData.totalMarks,
                        passMark: formData.passMark,
                        duration: formData.duration,
                        startTime: makeISTDateTime(ex.scheduleDate, ex.startTime || "09:00").toISOString(),
                        endTime: makeISTDateTime(ex.scheduleDate, ex.endTime || "12:00").toISOString(),
                    }))
                };
                await client.post("/v1/admin/exams/bulk", payload);
                toast.success("Exams scheduled successfully");
            } else {
                if (formData.scheduleDate < today) {
                    return toast.error("Exam date cannot be in the past");
                }


                const conflict = exams.find(existing =>
                    existing.classId === formData.classId &&
                    format(new Date(existing.scheduleDate), "yyyy-MM-dd") === formData.scheduleDate &&
                    ((existing.subjectId === formData.subjectId) ||
                        (formData.startTime < format(new Date(existing.endTime), "HH:mm") && format(new Date(existing.startTime), "HH:mm") < formData.endTime)) &&
                    (!isEditMode || existing.id !== selectedExam?.id)
                );

                if (conflict) {
                    return toast.error(`Conflict: ${conflict.subject.name} already scheduled on this date/time`);
                }

                const payload = {
                    ...formData,
                    startTime: makeISTDateTime(formData.scheduleDate, formData.startTime).toISOString(),
                    endTime: makeISTDateTime(formData.scheduleDate, formData.endTime).toISOString(),
                    scheduleDate: parseInstitutionalDate(formData.scheduleDate).toISOString(),
                };

                if (isEditMode && selectedExam) {
                    await client.put(`/v1/admin/exams/${selectedExam.id}`, payload);
                    toast.success("Exam updated successfully");
                } else {
                    await client.post("/v1/admin/exams", payload);
                    toast.success("Exam created successfully");
                }
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save exam");
        }
    };

    const addBulkRow = () => setBulkExams([...bulkExams, { subjectId: "", title: "", scheduleDate: "", startTime: "", endTime: "" }]);
    const removeBulkRow = (index: number) => setBulkExams(bulkExams.filter((_, i) => i !== index));
    const updateBulkRow = (index: number, field: string, value: string) => {
        const newExams = [...bulkExams];
        newExams[index][field] = value;
        setBulkExams(newExams);
    };

    const handleDeleteExam = async (id: string) => {
        if (!confirm("Are you sure you want to delete this exam? This will delete all associated results.")) return;
        try {
            setIsDeleting(true);
            await client.delete(`/v1/admin/exams/${id}`);
            toast.success("Exam deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to delete exam");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleDeclare = async (id: string) => {
        try {
            const res = await client.patch(`/v1/admin/exams/${id}/declare`);
            toast.success(res.data.message);
            fetchData();
        } catch (error: any) {
            toast.error("Failed to toggle status");
        }
    };

    const columns: ColumnDef<Exam>[] = [
        {
            key: "title",
            header: "Exam Details",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">{row.title}</span>
                    <span className="text-[10px] uppercase font-black text-indigo-500 tracking-wider">
                        {row.subject.name} • {row.class.name}
                    </span>
                </div>
            )
        },
        {
            key: "scheduleDate",
            header: "Schedule",
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Calendar className="h-3 w-3 text-rose-500" />
                        {format(new Date(val), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {format(new Date(row.startTime), "hh:mm a")} - {format(new Date(row.endTime), "hh:mm a")}
                    </div>
                </div>
            )
        },
        {
            key: "marks",
            header: "Marks",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 leading-none">{row.totalMarks}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Max</span>
                    </div>
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{row.passMark}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Pass</span>
                    </div>
                </div>
            )
        },
        {
            key: "isPublished",
            header: "Status",
            render: (val) => (
                <Badge tone={val ? "success" : "warning"} variant="soft" className="font-black text-[10px] uppercase rounded-lg px-2.5 py-1">
                    {val ? "Published" : "Pending"}
                </Badge>
            )
        },
        {
            key: "results",
            header: "Submissions",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Badge tone="accent" variant="outline" className="font-bold border-indigo-200">
                        {row._count.results} Entries
                    </Badge>
                </div>
            )
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/admin/exams/results/${encodeId(row.id)}`}>
                        <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                            <Plus className="h-3 w-3 mr-1.5 text-indigo-500" />
                            Marks
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 px-3 rounded-lg text-xs font-bold ${row.isPublished ? 'text-amber-500' : 'text-emerald-600'}`}
                        onClick={() => handleToggleDeclare(row.id)}
                    >
                        {row.isPublished ? "Retract" : "Declare"}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleOpenModal(row)}
                    >
                        <Edit2 className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        onClick={() => handleDeleteExam(row.id)}
                    >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Exam Management | Admin | LearnXChain</title>
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-registry, #printable-registry * { visibility: visible; }
                        #printable-registry {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: auto;
                            background: white !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}</style>
            </Head>

            <div className="space-y-8 pb-10">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 p-8 md:p-12 text-gray-900 dark:text-white shadow-xl shadow-gray-200/50 dark:shadow-2xl dark:shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <FileText className="h-64 w-64 transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-white/10 dark:text-white dark:border-white/20 hover:bg-indigo-100 dark:hover:bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">
                                Examination Portal v2.0
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none text-gray-900 dark:text-white">
                            Assessments & <br /> <span className="text-indigo-500 dark:text-indigo-400">Excellence</span>
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 max-w-xl font-medium text-lg leading-relaxed mb-8">
                            Coordinate school-wide examinations with precision. Manage schedules, enter student marks, and declare results with a click.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={() => handleOpenModal()}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-indigo-500/40 text-xs uppercase tracking-widest transition-all active:scale-95"
                            >
                                <Plus className="h-5 w-5 mr-3" />
                                Schedule New Exam
                            </Button>
                            <Link href="/dashboard/admin/exams/report-cards">
                                <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-black px-8 h-14 rounded-2xl backdrop-blur-md text-xs uppercase tracking-widest transition-all">
                                    <Trophy className="h-5 w-5 mr-3 text-amber-500" />
                                    Generate Report Cards
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Total Exams", value: exams.length, icon: FileText, color: "indigo" },
                        { label: "Published", value: exams.filter(e => e.isPublished).length, icon: CheckCircle2, color: "emerald" },
                        { label: "Pending results", value: exams.filter(e => !e.isPublished).length, icon: Clock, color: "amber" },
                        { label: "Classes Active", value: new Set(exams.map(e => e.classId)).size, icon: BookOpen, color: "purple" }
                    ].map((stat, i) => (
                        <Card key={i} className="rounded-3xl border-gray-100 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all h-full">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <Badge variant="soft" tone="neutral" className="text-[10px] font-black uppercase">Stat</Badge>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Exam Table */}
                <Card id="printable-registry" className="rounded-[40px] border-none shadow-xl shadow-indigo-500/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <div id="card-layout" className="flex items-center justify-between w-full gap-4">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    Examination Registry
                                    <Badge tone="accent" className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Automated</Badge>
                                </CardTitle>
                                <CardDescription className="text-sm font-medium">Monitoring all scheduled and past assessments</CardDescription>
                            </div>
                            <div id="controls-layout" className="flex items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Filter by title, subject or class..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                        className="h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-medium w-64 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleFilter}
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl font-black text-xs uppercase tracking-widest border-gray-200 dark:border-white/10 transition-all"
                                >
                                    Filter
                                </Button>
                                <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 mx-1" />
                                <Button
                                    onClick={handlePrint}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={handlePrint}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns}
                            data={filteredExams}
                            loading={loading}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                {isEditMode ? <Edit2 className="h-6 w-6" /> : isBulkMode ? <Layers className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">
                                    {isEditMode ? "Edit Examination" : isBulkMode ? "Bulk Schedule Exams" : "Schedule New Exam"}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pipeline Configuration v1.2</p>
                            </div>
                        </div>
                        {!isEditMode && (
                            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/5 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkMode(false)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${!isBulkMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Single
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsBulkMode(true)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${isBulkMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Bulk
                                </button>
                            </div>
                        )}
                    </div>
                }
                size={isBulkMode ? "xl" : "lg"}
            >
                <form onSubmit={handleSaveExam} className="space-y-6 pt-6">
                    {!isBulkMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-full">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Exam Type</label>
                                <Select
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    options={[
                                        { label: "Select Exam Type", value: "" },
                                        { label: "Mid Semester Exam", value: "Mid Semester Exam" },
                                        { label: "End Semester Exam", value: "End Semester Exam" },
                                        { label: "Internal Assessment", value: "Internal Assessment" },
                                        { label: "Unit Test", value: "Unit Test" },
                                        { label: "Weekly Test", value: "Weekly Test" },
                                        { label: "Mock Test", value: "Mock Test" },
                                        { label: "Final Exam", value: "Final Exam" },
                                    ]}
                                    className="h-12 font-bold rounded-2xl border-gray-200 text-xs"
                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Target Class</label>
                                <Select
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                    required
                                    options={[
                                        { label: "Select Class", value: "" },
                                        ...classes.map(c => ({ label: `🏫 ${c.name}`, value: c.id }))
                                    ]}
                                    className="h-12 font-bold rounded-2xl border-gray-200 text-xs"
                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subject</label>
                                <Select
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    required
                                    options={[
                                        { label: "Select Subject", value: "" },
                                        ...subjects.map(s => ({ label: `📚 ${s.name}`, value: s.id }))
                                    ]}
                                    className="h-12 font-bold rounded-2xl border-gray-200 text-xs"
                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Schedule Date</label>
                                <Input
                                    type="date"
                                    value={formData.scheduleDate}
                                    min={getISTDateString()}
                                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                                    required
                                    className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Start Time</label>
                                    <Input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                        className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">End Time</label>
                                    <Input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                        className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 col-span-full">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Marks</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                        className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pass Marks</label>
                                    <Input
                                        type="number"
                                        placeholder="33"
                                        value={formData.passMark}
                                        onChange={(e) => setFormData({ ...formData, passMark: e.target.value })}
                                        className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Room No.</label>
                                    <Input
                                        type="number"
                                        placeholder="Optional"
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        className="h-12 font-bold px-4 rounded-2xl border-gray-200 text-xs"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Target Class</label>
                                    <Select
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        required
                                        options={[
                                            { label: "Select Class", value: "" },
                                            ...classes.map(c => ({ label: `🏫 ${c.name}`, value: c.id }))
                                        ]}
                                        className="h-12 font-bold rounded-2xl border-gray-200 bg-white dark:bg-slate-900"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Exam Type</label>
                                    <Select
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        options={[
                                            { label: "Select Exam Type", value: "" },
                                            { label: "Mid Semester Exam", value: "Mid Semester Exam" },
                                            { label: "End Semester Exam", value: "End Semester Exam" },
                                            { label: "Internal Assessment", value: "Internal Assessment" },
                                            { label: "Unit Test", value: "Unit Test" },
                                            { label: "Weekly Test", value: "Weekly Test" },
                                            { label: "Mock Test", value: "Mock Test" },
                                            { label: "Final Exam", value: "Final Exam" },
                                        ]}
                                        className="h-12 font-bold rounded-2xl border-gray-200 bg-white dark:bg-slate-900"
                                        containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Default Total Marks</label>
                                    <Input
                                        type="number"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                        className="h-12 font-bold rounded-2xl border-gray-200 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Default Pass Marks</label>
                                    <Input
                                        type="number"
                                        value={formData.passMark}
                                        onChange={(e) => setFormData({ ...formData, passMark: e.target.value })}
                                        className="h-12 font-bold rounded-2xl border-gray-200 bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Exam Entries</h4>
                                    <Button type="button" size="sm" onClick={addBulkRow} className="h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase">
                                        <Plus className="h-3 w-3 mr-1.5" />
                                        Add Subject
                                    </Button>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {bulkExams.map((exam, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-white/5 relative group">
                                            <div className="col-span-4 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Subject</label>
                                                <Select
                                                    value={exam.subjectId}
                                                    onChange={(e) => updateBulkRow(idx, "subjectId", e.target.value)}
                                                    required
                                                    options={[
                                                        { label: "Subject", value: "" },
                                                        ...subjects.map(s => ({ label: s.name, value: s.id }))
                                                    ]}
                                                    className="h-10 text-xs font-bold rounded-xl"
                                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                                />
                                            </div>
                                            <div className="col-span-3 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Date</label>
                                                <Input
                                                    type="date"
                                                    value={exam.scheduleDate}
                                                    min={getISTDateString()}
                                                    onChange={(e) => updateBulkRow(idx, "scheduleDate", e.target.value)}
                                                    required
                                                    className="h-10 text-[10px] font-bold rounded-xl"
                                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Start</label>
                                                <Input
                                                    type="time"
                                                    value={exam.startTime}
                                                    onChange={(e) => updateBulkRow(idx, "startTime", e.target.value)}
                                                    className="h-10 text-[10px] font-bold rounded-xl"
                                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">End</label>
                                                <Input
                                                    type="time"
                                                    value={exam.endTime}
                                                    onChange={(e) => updateBulkRow(idx, "endTime", e.target.value)}
                                                    className="h-10 text-[10px] font-bold rounded-xl"
                                                    containerClassName="bg-white dark:bg-slate-900 dark:text-white dark:border-white/10"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center pb-2">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeBulkRow(idx)}
                                                    className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
                                                    disabled={bulkExams.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20"
                        >
                            {isEditMode ? "Update Assessment Record" : isBulkMode ? "Save All Scheduled Exams" : "Confirm Schedule Publication"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
