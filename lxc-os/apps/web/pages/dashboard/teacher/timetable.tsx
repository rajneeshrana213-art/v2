
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    Clock,
    ChevronLeft,
    Calendar,
    Coffee,
    School,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";

export default function TeacherTimetablePage() {
    const [schedule, setSchedule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<string>(
        ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()] === "SUNDAY"
            ? "MONDAY"
            : ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()]
    );

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/timetable");
                setSchedule(res.data);
            } catch (error) {
                console.error("Failed to fetch timetable", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    return (
        <>
            <Head>
                <title>Teacher Timetable - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Timetable</h1>
                            <p className="text-sm text-gray-500">View your teaching schedule.</p>
                        </div>
                    </div>

                    {/* Day Selector */}
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${activeDay === day
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                                    : "bg-white text-gray-500 border border-gray-100 dark:bg-gray-900 dark:border-white/5"
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Timeline Header Info */}
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                                <span>Period / Subject</span>
                                <span>Duration</span>
                            </div>

                            <div className="space-y-3">
                                {schedule?.[activeDay]?.length > 0 ? (
                                    schedule[activeDay].map((lesson: any, idx: number) => (
                                        <div key={idx} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-black dark:bg-indigo-950/30 dark:text-indigo-400">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                            {lesson.subject}
                                                        </h3>
                                                        <p className="text-xs text-gray-400">Class: {lesson.class}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {format(new Date(lesson.startTime), "p")}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                        To {format(new Date(lesson.endTime), "p")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                        <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No classes scheduled for {activeDay}.</p>
                                    </div>
                                )}

                                {/* Lunch Break Mockup */}
                                <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-100 bg-amber-50/30 p-4 dark:border-amber-900/20 dark:bg-amber-950/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                                <Coffee className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-amber-900 dark:text-amber-300">Reschedule / Lunch Break</span>
                                        </div>
                                        <span className="text-xs font-black text-amber-400">12:30 PM - 01:00 PM</span>
                                    </div>
                                </div>

                                {/* School Dismissal Mockup */}
                                <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-900/20 dark:bg-emerald-950/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <LogOut className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-emerald-900 dark:text-emerald-300">School Dismissal</span>
                                        </div>
                                        <span className="text-xs font-black text-emerald-400 text-right">02:30 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
