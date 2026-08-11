
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    Users,
    School,
    ChevronLeft,
    BookOpen,
    MapPin,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

export default function ClassDetailsPage() {
    const router = useRouter();
    const { id: rawId } = router.query;
    const id = rawId ? decodeId(rawId as string) : undefined;
    const [classInfo, setClassInfo] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("students");

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [classesRes, studentsRes, timetableRes] = await Promise.all([
                client.get("/v1/dashboard/teacher/classes"),
                client.get(`/v1/dashboard/teacher/attendance/students?classId=${id}`),
                client.get("/v1/dashboard/teacher/timetable")
            ]);

            const currentClass = classesRes.data.find((c: any) => c.id === id);
            setClassInfo(currentClass);
            setStudents(studentsRes.data);

            // Filter timetable for this specific class
            const classSchedule: any[] = [];
            Object.entries(timetableRes.data || {}).forEach(([day, lessons]: [string, any]) => {
                lessons.forEach((lesson: any) => {
                    if (lesson.class === currentClass?.name) {
                        classSchedule.push({ ...lesson, day });
                    }
                });
            });
            setSchedule(classSchedule);

        } catch (error) {
            console.error("Failed to fetch class data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="teacher">
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!classInfo) {
        return (
            <DashboardLayout role="teacher">
                <div className="text-center py-20">
                    <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Class not found.</p>
                    <Link href="/dashboard/teacher/classes" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Back to My Classes
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>{classInfo.name} Details - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher/classes">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{classInfo.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {classInfo.Section?.[0]?.name ? `Section ${classInfo.Section[0].name}` : "All Sections"} • Room {classInfo.roomNumber || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Students</p>
                                    <h3 className="text-lg font-bold">{students.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Periods/Week</p>
                                    <h3 className="text-lg font-bold">{schedule.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-2 h-full">
                                <Link href={id ? `/dashboard/teacher/attendance/mark?classId=${encodeId(id)}` : '#'} className="flex-1">
                                    <button className="w-full h-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 dark:shadow-indigo-900/20 flex items-center justify-center gap-3">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Mark Today's Attendance
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-white/10">
                        <nav className="flex gap-8">
                            {["students", "timetable"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    {activeTab === "students" && (
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-white/5">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Roll No</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student Name</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-indigo-500/10 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">{student.rollNo}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                                        {student.user.profilePic ? (
                                                            <img src={student.user.profilePic} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{student.user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                No students found in this class.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "timetable" && (
                        <div className="space-y-4">
                            {schedule.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {schedule.map((lesson, idx) => (
                                        <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-gray-900">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase dark:bg-indigo-900/20 dark:text-indigo-400">
                                                    {lesson.day}
                                                </span>
                                                <Clock className="h-4 w-4 text-gray-300" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{lesson.subject}</h4>
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(lesson.startTime), "p")} - {format(new Date(lesson.endTime), "p")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10">
                                    <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500">No lessons scheduled for this class.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
