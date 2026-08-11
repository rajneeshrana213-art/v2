
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Plus,
    Trash2,
    Edit2,
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    Check,
    X,
    Filter,
    Users,
    BookOpen,
    AlertCircle,
    Download,
    Layers,
    CalendarClock,
    PlusCircle,
    Activity
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes, startOfDay, parse } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getISTDateString, makeISTDateTime, getISTHours, getISTMinutes } from "@/lib/utils/date-utils";

interface Section {
    id: string;
    name: string;
}

interface ClassData {
    id: string;
    name: string;
    Section: Section[];
}

interface Subject {
    id: string;
    name: string;
    code: string;
    classId: string;
}

interface Teacher {
    id: string;
    user: {
        name: string;
        profilePic?: string;
    };
    subjects?: { id: string }[];
}

interface Lesson {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string | null;
    classId: string;
    sectionId: string | null;
    subject: {
        id: string;
        name: string;
        code: string;
    };
    teacher: {
        id: string;
        user: {
            name: string;
            profilePic: string;
        };
    } | null;
    section: {
        id: string;
        name: string;
    } | null;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TimetablePage() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizardView, setShowWizardView] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [lessonToDeleteId, setLessonToDeleteId] = useState<string | null>(null);

    // Filter states
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");

    // Form states (Bulk Wizard)
    const [wizardData, setWizardData] = useState({
        classIds: [] as string[],
        sectionId: "" as string,
        lessons: [] as {
            id: string; // client-side temp id
            day: string;
            startTime: string;
            endTime: string;
            subjectId: string;
            teacherId: string;
        }[]
    });

    const [modalSelectedClassId, setModalSelectedClassId] = useState("");

    const handleAddLesson = () => {
        setEditingLesson(null);
        setModalSelectedClassId(selectedClass);
        setWizardData({
            classIds: selectedClass ? [selectedClass] : [],
            sectionId: selectedSection,
            lessons: [{
                id: Math.random().toString(36).substr(2, 9),
                day: "MONDAY",
                startTime: "09:00",
                endTime: "10:00",
                subjectId: "",
                teacherId: "",
            }]
        });
        setShowWizardView(true);
    };

    const handlePopulateAllSubjects = () => {
        if (!modalSelectedClassId) return;
        const classSubjects = subjects.filter(s => s.classId === modalSelectedClassId);

        let currentTime = parse(configData.schoolOpening, "HH:mm", new Date());
        const lunchStart = parse(configData.lunchStart, "HH:mm", new Date());
        const lunchEnd = parse(configData.lunchEnd, "HH:mm", new Date());
        const duration = configData.periodDuration;

        const newLessons = classSubjects.map(s => {
            const periodEnd = addMinutes(currentTime, duration);
            if (currentTime < lunchEnd && periodEnd > lunchStart) {
                currentTime = lunchEnd;
            }

            const startTimeStr = format(currentTime, "HH:mm");
            const endTimeStr = format(addMinutes(currentTime, duration), "HH:mm");

            const slot = {
                id: Math.random().toString(36).substr(2, 9),
                day: "MONDAY",
                startTime: startTimeStr,
                endTime: endTimeStr,
                subjectId: s.id,
                teacherId: "",
            };


            currentTime = addMinutes(currentTime, duration);
            return slot;
        });

        setWizardData(prev => ({ ...prev, lessons: newLessons }));
        toast.info(`Populated ${newLessons.length} subjects with automated time slots`);
    };

    const addSlot = () => {
        setWizardData(prev => ({
            ...prev,
            lessons: [...prev.lessons, {
                id: Math.random().toString(36).substr(2, 9),
                day: "MONDAY",
                startTime: "09:00",
                endTime: "10:00",
                subjectId: "",
                teacherId: "",
            }]
        }));
    };

    const removeSlot = (id: string) => {
        setWizardData(prev => ({
            ...prev,
            lessons: prev.lessons.filter(l => l.id !== id)
        }));
    };

    const updateSlot = (id: string, field: string, value: any) => {
        setWizardData(prev => ({
            ...prev,
            lessons: prev.lessons.map(l => {
                if (l.id === id) {
                    const updated = { ...l, [field]: value };
                    
                    // Auto-calculate end time if start time changes
                    if (field === "startTime" && value) {
                        try {
                            const start = parse(value, "HH:mm", new Date());
                            const end = addMinutes(start, configData.periodDuration);
                            updated.endTime = format(end, "HH:mm");
                        } catch (e) {
                            console.error("Time parse error", e);
                        }
                    }
                    return updated;
                }
                return l;
            })
        }));
    };

    // Copy form states
    const [copyData, setCopyData] = useState({
        toClassId: "",
        toSectionId: "",
    });

    const [configData, setConfigData] = useState({
        schoolOpening: "08:00",
        schoolClosing: "16:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
        periodDuration: 45
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, subjectsRes, teachersRes] = await Promise.all([
                client.get("/v1/dashboard/admin/classes"),
                client.get("/v1/dashboard/admin/subjects"),
                client.get("/v1/dashboard/admin/teachers"),
            ]);
            setClasses(classesRes.data || []);
            setSubjects(subjectsRes.data || []);
            setTeachers(teachersRes.data.data || []);

            if (classesRes.data.length > 0) {
                setSelectedClass(classesRes.data[0].id);
                if (classesRes.data[0].Section.length > 0) {
                    setSelectedSection(classesRes.data[0].Section[0].id);
                }
            }
        } catch (err: any) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetable = async () => {
        if (!selectedClass) return;
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/timetable", {
                params: {
                    classId: selectedClass,
                    sectionId: selectedSection || undefined,
                },
            });
            setLessons(response.data);
        } catch (err: any) {
            toast.error("Failed to load timetable");
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await client.get("/v1/dashboard/admin/timetable/config");
            if (response.data) {
                setConfigData({
                    schoolOpening: response.data.schoolOpening || "08:00",
                    schoolClosing: response.data.schoolClosing || "16:00",
                    lunchStart: response.data.lunchStart || "12:00",
                    lunchEnd: response.data.lunchEnd || "13:00",
                    periodDuration: response.data.periodDuration || 45
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch timetable config", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchConfig();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchTimetable();
        }
    }, [selectedClass, selectedSection]);


    const handleEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setModalSelectedClassId(lesson.classId);
        const start = new Date(lesson.startTime);
        const end = new Date(lesson.endTime);
        setWizardData({
            classIds: [lesson.classId],
            sectionId: lesson.sectionId || "",
            lessons: [{
                id: lesson.id,
                day: lesson.day,
                startTime: format(start, "HH:mm"),
                endTime: format(end, "HH:mm"),
                subjectId: lesson.subjectId,
                teacherId: lesson.teacherId || "",
            }]
        });
        setShowWizardView(true);
    };

    const handleDeleteLesson = (id: string) => {
        setLessonToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!lessonToDeleteId) return;
        setIsProcessing(true);
        try {
            await client.delete(`/v1/dashboard/admin/timetable/${lessonToDeleteId}`);
            toast.success("Lesson deleted");
            setIsDeleteDialogOpen(false);
            setLessonToDeleteId(null);
            fetchTimetable();
        } catch (err: any) {
            toast.error("Failed to delete lesson");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const activeClassIds = wizardData.classIds.filter(id => !!id);
        if (activeClassIds.length === 0) {
            toast.error("Please select at least one class");
            return;
        }

        if (wizardData.lessons.some(l => !l.subjectId)) {
            toast.error("Please assign subjects to all slots");
            return;
        }

        const overlaps = wizardData.lessons.some((l1, i) =>
            wizardData.lessons.some((l2, j) => {
                if (i === j) return false;
                if (l1.day !== l2.day) return false;
                return (l1.startTime < l2.endTime && l2.startTime < l1.endTime);
            })
        );

        if (overlaps) {
            toast.error("Cannnot save: Multiple subjects are scheduled at overlapping times on the same day");
            return;
        }

        // Strict Constraint Validation
        for (const slot of wizardData.lessons) {
            const startMins = parse(slot.startTime, "HH:mm", new Date()).getHours() * 60 + parse(slot.startTime, "HH:mm", new Date()).getMinutes();
            const endMins = parse(slot.endTime, "HH:mm", new Date()).getHours() * 60 + parse(slot.endTime, "HH:mm", new Date()).getMinutes();
            const duration = endMins - startMins;

            const openingTime = parse(configData.schoolOpening, "HH:mm", new Date());
            const closingTime = parse(configData.schoolClosing, "HH:mm", new Date());
            const openingMins = openingTime.getHours() * 60 + openingTime.getMinutes();
            const closingMins = closingTime.getHours() * 60 + closingTime.getMinutes();
            
            const lunchStartTime = parse(configData.lunchStart, "HH:mm", new Date());
            const lunchEndTime = parse(configData.lunchEnd, "HH:mm", new Date());
            const lunchStartMins = lunchStartTime.getHours() * 60 + lunchStartTime.getMinutes();
            const lunchEndMins = lunchEndTime.getHours() * 60 + lunchEndTime.getMinutes();

            if (duration > configData.periodDuration) {
                toast.error(`Slot at ${slot.startTime} exceeds standard duration of ${configData.periodDuration}m`);
                return;
            }
            if (startMins < openingMins || endMins > closingMins) {
                toast.error(`Slot at ${slot.startTime}-${slot.endTime} is outside school hours (${configData.schoolOpening}-${configData.schoolClosing})`);
                return;
            }
            if (startMins < lunchEndMins && endMins > lunchStartMins) {
                toast.error(`Slot at ${slot.startTime}-${slot.endTime} overlaps with lunch break (${configData.lunchStart}-${configData.lunchEnd})`);
                return;
            }
        }

        setIsProcessing(true);
        try {
            if (editingLesson) {
                const lesson = wizardData.lessons[0];
                const todayIST = getISTDateString();
                const payload = {
                    ...lesson,
                    // Build as IST datetime so server (UTC on Vercel) receives the correct instant.
                    startTime: makeISTDateTime(todayIST, lesson.startTime).toISOString(),
                    endTime: makeISTDateTime(todayIST, lesson.endTime).toISOString(),
                    classId: activeClassIds[0],
                    sectionId: wizardData.sectionId || null,
                };
                await client.put(`/v1/dashboard/admin/timetable/${editingLesson.id}`, payload);
                toast.success("Lesson updated");
            } else {
                await client.post("/v1/dashboard/admin/timetable", {
                    classIds: activeClassIds,
                    lessons: wizardData.lessons,
                    sectionId: wizardData.sectionId || null,
                });
                toast.success(`Schedule created across ${activeClassIds.length} class(es)`);
            }
            setShowWizardView(false);
            fetchTimetable();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await client.post("/v1/dashboard/admin/timetable/copy", {
                fromClassId: selectedClass,
                fromSectionId: selectedSection || null,
                toClassId: copyData.toClassId,
                toSectionId: copyData.toSectionId || null,
            });
            toast.success("Timetable copied successfully");
            setIsCopyModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Copy failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const currentClass = classes.find(c => c.id === selectedClass);

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Timetable Management | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8">
                <AnimatePresence mode="wait">
                    {!showWizardView ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <CalendarClock className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">School Timetable</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge tone="info" variant="soft" className="text-[10px] font-black uppercase px-2 py-0.5">Academic Scheduler</Badge>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">Manage daily periods and faculty distribution</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 h-12 px-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-gray-300 transition-all font-bold uppercase text-[10px] tracking-widest"
                        >
                            <Clock className="h-4 w-4" />
                            School Hours
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCopyModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 h-12 px-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-gray-300 transition-all font-bold uppercase text-[10px] tracking-widest"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Schedule
                        </Button>
                        <Button
                            onClick={handleAddLesson}
                            className="flex items-center gap-3 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[0.1em]"
                        >
                            <Plus className="h-5 w-5 stroke-[3]" />
                            Add Lesson Slot
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-1 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-md">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Class Distribution</label>
                            <div className="relative group">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <select
                                    value={selectedClass}
                                    onChange={(e) => {
                                        setSelectedClass(e.target.value);
                                        const cls = classes.find(c => c.id === e.target.value);
                                        if (cls && cls.Section.length > 0) {
                                            setSelectedSection(cls.Section[0].id);
                                        } else {
                                            setSelectedSection("");
                                        }
                                    }}
                                    className="w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                >
                                    {(classes || []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {currentClass && currentClass.Section.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Specific Section</label>
                                <div className="relative group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    <select
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                    >
                                        {currentClass.Section.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <Button
                            onClick={fetchTimetable}
                            className="h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Refresh View
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="grid" className="space-y-8">
                    <div className="flex items-center justify-center">
                        <TabsList className="p-1.5 h-14 bg-gray-100/50 dark:bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-gray-100 dark:border-white/5">
                            <TabsTrigger
                                value="grid"
                                className="px-8 h-11 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-500 font-bold uppercase text-[10px] tracking-widest transition-all"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Card Grid
                            </TabsTrigger>
                            <TabsTrigger
                                value="calendar"
                                className="px-8 h-11 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-500 font-bold uppercase text-[10px] tracking-widest transition-all"
                            >
                                <CalendarClock className="h-4 w-4 mr-2" />
                                Weekly Calendar
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="grid" className="space-y-8 border-none p-0 outline-none">
                        {/* Timetable Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                            {DAYS.map((day) => (
                                <div key={day} className="space-y-4">
                                    <div className="flex items-center justify-between px-3">
                                        <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{day}</h3>
                                        <Badge tone="info" variant="soft" className="text-[9px] font-black h-5 px-2 rounded-lg">
                                            {lessons.filter(l => l.day === day).length} Slots
                                        </Badge>
                                    </div>
                                    <div className="space-y-3">
                                        <AnimatePresence mode="popLayout">
                                            {lessons
                                                .filter(l => l.day === day)
                                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                                .map((lesson, idx) => (
                                                    <motion.div
                                                        key={lesson.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className={`group relative p-4 rounded-[1.5rem] border transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 ${
                                                            idx % 2 === 0 
                                                                ? "bg-white dark:bg-slate-900 border-gray-100 dark:border-white/10" 
                                                                : "bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20"
                                                        }`}
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20">
                                                                    <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                                                        {format(new Date(lesson.startTime), "hh:mm a")}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                                    <button onClick={() => handleEditLesson(lesson)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                                                        <Edit2 className="h-3 w-3" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight uppercase text-xs tracking-tight group-hover:text-indigo-600 transition-colors">{lesson.subject.name}</h4>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{lesson.subject.code}</p>
                                                            </div>

                                                            <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6 rounded-lg border border-white dark:border-slate-800 shadow-sm">
                                                                        <AvatarImage src={lesson.teacher?.user.profilePic ?? ""} alt={lesson.teacher?.user.name ?? ""} />
                                                                        <AvatarFallback className="text-[8px] font-black bg-indigo-50 text-indigo-600 uppercase">
                                                                            {lesson.teacher?.user.name.charAt(0) || "U"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                                                                        {lesson.teacher?.user.name || "Unassigned"}
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animasi-pulse" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            }
                                        </AnimatePresence>
                                        {lessons.filter(l => l.day === day).length === 0 && (
                                            <div className="border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem] p-8 text-center bg-gray-50/30 dark:bg-white/5 flex flex-col items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-300">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Free Day</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="border-none p-0 outline-none">
                        <div className="p-1 rounded-[3rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-md overflow-hidden">
                            <div className="p-8 overflow-x-auto custom-scrollbar">
                                <div className="min-w-[1000px] relative">
                                    {/* Calendar Header (Days) */}
                                    <div className="grid grid-cols-[80px,repeat(6,1fr)] border-b border-gray-100 dark:border-white/5 pb-6">
                                        <div /> {/* Time Column space */}
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center group">
                                                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] group-hover:text-indigo-500 transition-colors">{day}</div>
                                                <div className="mt-1 text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">{lessons.filter(l => l.day === day).length} Slots</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Body */}
                                    <div className="relative mt-8" style={{ height: "1000px" }}>
                                        {/* Dynamic Time Axis & Grid Lines */}
                                        {(() => {
                                            const startHour = parseInt(configData.schoolOpening.split(":")[0]);
                                            const endHour = parseInt(configData.schoolClosing.split(":")[0]) + 1;
                                            const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

                                            return hours.map((hour, i) => {
                                                const top = (i / (hours.length - 1)) * 100;
                                                return (
                                                    <div key={hour} className="absolute w-full flex items-center group" style={{ top: `${top}%` }}>
                                                        <span className="w-20 text-[9px] font-bold text-gray-400 group-hover:text-indigo-500 transition-colors uppercase pr-4 text-right">
                                                            {format(parse(`${hour}:00`, "HH:mm", new Date()), "hh:mm a")}
                                                        </span>
                                                        <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5 group-hover:bg-indigo-500/10 transition-colors" />
                                                    </div>
                                                );
                                            });
                                        })()}

                                        {/* Lunch Break Indicator */}
                                        {(() => {
                                            const startHour = parseInt(configData.schoolOpening.split(":")[0]);
                                            const endHour = parseInt(configData.schoolClosing.split(":")[0]) + 1;
                                            const totalMinutes = (endHour - startHour) * 60;

                                            const lunchStart = parse(configData.lunchStart, "HH:mm", new Date());
                                            const lunchEnd = parse(configData.lunchEnd, "HH:mm", new Date());

                                            const lunchStartMin = lunchStart.getHours() * 60 + lunchStart.getMinutes() - (startHour * 60);
                                            const lunchEndMin = lunchEnd.getHours() * 60 + lunchEnd.getMinutes() - (startHour * 60);

                                            const top = (lunchStartMin / totalMinutes) * 100;
                                            const height = ((lunchEndMin - lunchStartMin) / totalMinutes) * 100;

                                            return (
                                                <div
                                                    className="absolute inset-x-0 left-20 bg-amber-500/5 dark:bg-amber-500/5 border-y border-dashed border-amber-500/20 z-0 flex items-center justify-center"
                                                    style={{ top: `${top}%`, height: `${height}%` }}
                                                >
                                                    <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.5em]">Lunch Break</span>
                                                </div>
                                            );
                                        })()}

                                        {/* Lesson Blocks */}
                                        <div className="absolute inset-0 left-20">
                                            <div className="grid grid-cols-6 h-full border-l border-gray-100 dark:border-white/5">
                                                {DAYS.map((day) => (
                                                    <div key={day} className="relative h-full border-r border-gray-100 dark:border-white/5">
                                                        {lessons.filter(l => l.day === day).map(lesson => {
                                                            const start = new Date(lesson.startTime);
                                                            const end = new Date(lesson.endTime);

                                                            const startHour = parseInt(configData.schoolOpening.split(":")[0]);
                                                            const endHour = parseInt(configData.schoolClosing.split(":")[0]) + 1;
                                                            const totalMinutes = (endHour - startHour) * 60;

                                                            const startTotalMin = getISTHours(start) * 60 + getISTMinutes(start) - (startHour * 60);
                                                            const endTotalMin = getISTHours(end) * 60 + getISTMinutes(end) - (startHour * 60);

                                                            const top = (startTotalMin / totalMinutes) * 100;
                                                            const height = ((endTotalMin - startTotalMin) / totalMinutes) * 100;

                                                            return (
                                                                <motion.div
                                                                    key={lesson.id}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    whileHover={{ scale: 1.02, zIndex: 50 }}
                                                                    onClick={() => handleEditLesson(lesson)}
                                                                    className="absolute inset-x-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500 transition-all cursor-pointer group overflow-hidden"
                                                                    style={{ top: `${top}%`, height: `${height}%` }}
                                                                >
                                                                    {/* Background Decor */}
                                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors" />

                                                                    {/* Delete Button (Overlay) */}
                                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteLesson(lesson.id);
                                                                            }}
                                                                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>

                                                                    <div className="relative h-full flex flex-col justify-between">
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mb-0.5" />
                                                                                <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-tight truncate">{lesson.subject.name}</h5>
                                                                            </div>
                                                                            <p className="text-[8px] font-bold text-indigo-500/70 dark:text-indigo-400/70 uppercase tracking-widest">{lesson.subject.code}</p>
                                                                        </div>

                                                                        <div className="pt-2 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Avatar className="h-4 w-4 rounded-lg">
                                                                                    <AvatarImage src={lesson.teacher?.user.profilePic ?? ""} alt={lesson.teacher?.user.name ?? ""} />
                                                                                    <AvatarFallback className="text-[6px] font-black">{lesson.teacher?.user.name.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="text-[8px] font-bold text-gray-400 truncate max-w-[60px]">{lesson.teacher?.user.name || "Unassigned"}</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[8px] font-black text-gray-500 dark:text-gray-400">{format(start, "hh:mm a")}</span>
                                                                                <span className="text-[7px] font-bold text-gray-300 dark:text-gray-600 uppercase">Ends {format(end, "hh:mm a")}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
                    ) : (
                        <motion.div
                            key="wizard"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowWizardView(false)}
                                    className="flex items-center gap-2 h-12 px-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-gray-300 transition-all font-bold uppercase text-[10px] tracking-widest"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </div>

                            <Card className="border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Layers className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-bold tracking-tight uppercase">
                                                    {editingLesson ? "Modify Lesson Slot" : "Timetable Creation Wizard"}
                                                </CardTitle>
                                                <CardDescription className="text-gray-500 dark:text-gray-400 font-medium">
                                                    {editingLesson ? "Adjust timing or assigned faculty" : "Build schedules for multiple classes and subjects at once"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {!editingLesson && (
                                            <Button
                                                variant="outline"
                                                onClick={handlePopulateAllSubjects}
                                                className="rounded-xl border-indigo-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 gap-2 font-bold uppercase text-[10px]"
                                            >
                                                <Activity className="h-4 w-4" />
                                                Populate All Subjects
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                        <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
                                            {/* Left Column: Target Selection */}
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                                        Select Class
                                                    </label>
                                                    {!editingLesson ? (
                                                        <select
                                                            value={modalSelectedClassId}
                                                            onChange={e => {
                                                                const newId = e.target.value;
                                                                setModalSelectedClassId(newId);
                                                                setWizardData(prev => ({
                                                                    ...prev,
                                                                    classIds: newId ? [newId] : [],
                                                                    sectionId: "" // Reset section on class change
                                                                }));
                                                                // Reset section to default if class has sections
                                                                const cls = classes.find(c => c.id === newId);
                                                                if (cls && cls.Section.length > 0) {
                                                                    setWizardData(prev => ({ ...prev, sectionId: cls.Section[0].id }));
                                                                }
                                                            }}
                                                            className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">Choose academic class...</option>
                                                            {classes.map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 px-4 flex items-center bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold text-indigo-600 uppercase tracking-tight">
                                                            {classes.find(c => c.id === modalSelectedClassId)?.name}
                                                        </div>
                                                    )}
                                                </div>

                                                {modalSelectedClassId && classes.find(c => c.id === modalSelectedClassId)?.Section.length! > 0 && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Section</label>
                                                        <select
                                                            value={wizardData.sectionId}
                                                            onChange={e => setWizardData(prev => ({ ...prev, sectionId: e.target.value }))}
                                                            className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                                        >
                                                            <option value="">No Section (All)</option>
                                                            {classes.find(c => c.id === modalSelectedClassId)?.Section.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                            </div>

                                            {/* Right Column: Lesson Slots */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Schedule Slots</label>
                                                    {!editingLesson && (
                                                        <button
                                                            type="button"
                                                            onClick={addSlot}
                                                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3" /> Add Slot
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                                    <AnimatePresence mode="popLayout">
                                                        {wizardData.lessons.map((slot, index) => (
                                                            <motion.div
                                                                key={slot.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="p-5 rounded-[2rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 relative group"
                                                            >
                                                                {wizardData.lessons.length > 1 && !editingLesson && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSlot(slot.id)}
                                                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-white/5 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                                                                        <select
                                                                            value={slot.subjectId}
                                                                            onChange={e => updateSlot(slot.id, "subjectId", e.target.value)}
                                                                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        >
                                                                            <option value="">Select subject...</option>
                                                                            {subjects.filter(s => s.classId === modalSelectedClassId).map(s => (
                                                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Teacher</label>
                                                                        <select
                                                                            value={slot.teacherId}
                                                                            onChange={e => updateSlot(slot.id, "teacherId", e.target.value)}
                                                                            className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        >
                                                                            <option value="">Select teacher...</option>
                                                                            {teachers.filter(t =>
                                                                                !slot.subjectId ||
                                                                                t.subjects?.some(s => s.id === slot.subjectId)
                                                                            ).map(t => (
                                                                                <option key={t.id} value={t.id}>{t.user.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Day</label>
                                                                        <select
                                                                            value={slot.day}
                                                                            onChange={e => updateSlot(slot.id, "day", e.target.value)}
                                                                            className="w-full h-9 px-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        >
                                                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Start</label>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.startTime}
                                                                            min={configData.schoolOpening}
                                                                            max={configData.schoolClosing}
                                                                            onChange={e => updateSlot(slot.id, "startTime", e.target.value)}
                                                                            className="w-full h-9 px-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">End</label>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.endTime}
                                                                            min={configData.schoolOpening}
                                                                            max={configData.schoolClosing}
                                                                            onChange={e => updateSlot(slot.id, "endTime", e.target.value)}
                                                                            className="w-full h-9 px-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-0 pt-6 bg-transparent border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-8 rounded-xl px-3 border-indigo-100 dark:border-white/5 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                                                    {wizardData.classIds.length} Classes Select
                                                </Badge>
                                                <Badge variant="outline" className="h-8 rounded-xl px-3 border-indigo-100 dark:border-white/5 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                                                    {wizardData.lessons.length} Slots defined
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setShowWizardView(false)}
                                                    className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                                >
                                                    Discard Changes
                                                </Button>
                                                {editingLesson && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            handleDeleteLesson(wizardData.lessons[0].id);
                                                            setShowWizardView(false);
                                                        }}
                                                        className="h-12 px-6 rounded-2xl border-rose-100 dark:border-rose-500/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Lesson
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    disabled={isProcessing}
                                                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                >
                                                    {isProcessing ? <Loader size="sm" variant="white" /> : editingLesson ? "Update Slot" : "Finalize Timetable"}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem]">
                    <div className="p-8 text-center space-y-6">
                        <div className="mx-auto h-20 w-20 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                            <AlertCircle className="h-10 w-10 stroke-[2.5]" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Remove Lesson?</DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400 font-medium">
                                Are you sure you want to delete this lesson slot? This action cannot be undone.
                            </DialogDescription>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 h-14 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmDelete}
                                disabled={isProcessing}
                                className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-500/20"
                            >
                                {isProcessing ? <Loader size="sm" variant="white" /> : "Confirm Delete"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Copy Modal */}
            <Dialog open={isCopyModalOpen} onOpenChange={(open) => !open && setIsCopyModalOpen(false)}>
                <DialogContent className="max-w-lg p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                                <Copy className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight uppercase">
                                    Replicate Schedule
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 dark:text-gray-400 font-medium">
                                    Clone this timetable to another class
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCopy} className="p-8 pt-6 space-y-6">
                        <div className="p-5 rounded-[1.5rem] bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 flex gap-4">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-900 dark:text-amber-200 font-bold leading-relaxed uppercase tracking-tight">
                                This will migrate all lessons to the destination.
                                <span className="block text-rose-600 dark:text-rose-400 mt-1 underline">Existing records will be overwritten.</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Destination Class</label>
                                <select
                                    required
                                    value={copyData.toClassId}
                                    onChange={e => {
                                        const clsId = e.target.value;
                                        setCopyData(prev => ({ ...prev, toClassId: clsId, toSectionId: "" }));
                                    }}
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                >
                                    <option value="">Select target class...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {copyData.toClassId && classes.find(c => c.id === copyData.toClassId)?.Section.length! > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Destination Section</label>
                                    <select
                                        value={copyData.toSectionId}
                                        onChange={e => setCopyData(prev => ({ ...prev, toSectionId: e.target.value }))}
                                        className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Sections</option>
                                        {classes.find(c => c.id === copyData.toClassId)?.Section.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button type="button" variant="ghost" disabled={isProcessing} onClick={() => setIsCopyModalOpen(false)} className="h-11 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-gray-500">Cancel</Button>
                            <Button type="submit" disabled={isProcessing} className="h-11 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl shadow-indigo-500/20">
                                {isProcessing ? <Loader size="sm" variant="white" /> : "Begin Replication"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Config Modal */}
            <Dialog open={isSettingsModalOpen} onOpenChange={(open) => !open && setIsSettingsModalOpen(false)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight uppercase">
                                    Institutional Timings
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 dark:text-gray-400 font-medium">
                                    Configure core school hours and period durations
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setIsProcessing(true);
                            try {
                                await client.put("/v1/dashboard/admin/timetable/config", configData);
                                toast.success("Institutional hours updated");
                                setIsSettingsModalOpen(false);
                                fetchTimetable();
                            } catch (err: any) {
                                toast.error("Configuration update failed");
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                        className="p-8 pt-6 space-y-8"
                    >
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">School Opening</label>
                                    <Input
                                        type="time"
                                        required
                                        value={configData.schoolOpening}
                                        onChange={e => setConfigData(prev => ({ ...prev, schoolOpening: e.target.value }))}
                                        className="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Lunch Break Start</label>
                                    <Input
                                        type="time"
                                        required
                                        value={configData.lunchStart}
                                        onChange={e => setConfigData(prev => ({ ...prev, lunchStart: e.target.value }))}
                                        className="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">School Closing</label>
                                    <Input
                                        type="time"
                                        required
                                        value={configData.schoolClosing}
                                        onChange={e => setConfigData(prev => ({ ...prev, schoolClosing: e.target.value }))}
                                        className="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Lunch Break End</label>
                                    <Input
                                        type="time"
                                        required
                                        value={configData.lunchEnd}
                                        onChange={e => setConfigData(prev => ({ ...prev, lunchEnd: e.target.value }))}
                                        className="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Default Period Duration (Mins)</label>
                                <Input
                                    type="number"
                                    required
                                    value={configData.periodDuration}
                                    onChange={e => setConfigData(prev => ({ ...prev, periodDuration: parseInt(e.target.value) }))}
                                    className="h-12 bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-white/5 rounded-2xl"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                            <Button type="button" variant="ghost" disabled={isProcessing} onClick={() => setIsSettingsModalOpen(false)} className="h-11 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest text-gray-500">Cancel</Button>
                            <Button type="submit" disabled={isProcessing} className="h-11 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-xl shadow-indigo-500/20">
                                {isProcessing ? <Loader size="sm" variant="white" /> : "Save Configuration"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
            `}</style>
        </DashboardLayout >
    );
}
