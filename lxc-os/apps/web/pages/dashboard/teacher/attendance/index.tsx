
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ClipboardCheck,
    Search,
    Filter
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader } from "@/components/ui/feedback/Loader";
import { encodeId } from "@/lib/utils/hashId";

export default function AttendanceIndexPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, timetableRes] = await Promise.all([
                    client.get("/v1/dashboard/teacher/attendance/classes"),
                    client.get("/v1/dashboard/teacher/timetable")
                ]);

                // Extract unique class names/IDs from timetable to filter
                const timetableClassNames = new Set();
                Object.values(timetableRes.data || {}).forEach((dayLessons: any) => {
                    dayLessons.forEach((lesson: any) => {
                        if (lesson.class) timetableClassNames.add(lesson.class);
                    });
                });

                // Filter classes that appear in the timetable
                const filtered = classesRes.data.filter((cls: any) =>
                    timetableClassNames.has(cls.name)
                );

                setClasses(filtered);
            } catch (error) {
                console.error("Failed to fetch classes or timetable", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Mark Attendance - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
                        <p className="text-gray-500 dark:text-gray-400">Select a class to record daily attendance.</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-gray-900"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">{format(new Date(), "EEEE, d MMMM")}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredClasses.map((cls) => (
                                <Link key={cls.id} href={`/dashboard/teacher/attendance/mark?classId=${encodeId(cls.id)}`}>
                                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-600 hover:shadow-md dark:border-white/10 dark:bg-gray-900">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <ClipboardCheck className="h-5 w-5" />
                                            </div>
                                            {cls.isMarked ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Marked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                    <Circle className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {cls.name}
                                                </h3>
                                                {cls.Section?.[0] && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Section: {cls.Section[0].name}</p>
                                                )}
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {filteredClasses.length === 0 && !loading && (
                        <div className="text-center py-20">
                            <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No classes found.</p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
