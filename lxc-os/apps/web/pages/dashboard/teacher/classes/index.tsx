
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { encodeId } from "@/lib/utils/hashId";
import {
    Users,
    School,
    ChevronRight,
    BookOpen,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/feedback/Loader";

export default function MyClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await client.get("/v1/dashboard/teacher/classes");
                setClasses(res.data);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    return (
        <>
            <Head>
                <title>My Classes - LearnXChain</title>
            </Head>
            <DashboardLayout role="teacher">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Classes</h1>
                        <p className="text-gray-500 dark:text-gray-400">View and manage your assigned classes and students.</p>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {classes.map((cls) => (
                                <Link key={cls.id} href={`/dashboard/teacher/classes/${encodeId(cls.id)}`}>
                                    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:border-indigo-600 hover:shadow-xl dark:border-white/10 dark:bg-gray-900">
                                        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 p-6 flex items-start justify-between">
                                            <School className="h-8 w-8 text-white/40" />
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                                Active
                                            </span>
                                        </div>
                                        <div className="p-6 -mt-8 relative">
                                            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-white/5 flex items-center justify-center text-3xl font-black text-indigo-600 mb-4">
                                                {cls.name.charAt(0)}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {cls.name}
                                            </h3>
                                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                                {cls.Section?.[0]?.name ? `Section ${cls.Section[0].name}` : "All Sections"}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-white/5 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-semibold">{cls._count?.students || 0} Students</span>
                                                </div>
                                                {cls.roomNumber && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-semibold">RM {cls.roomNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {classes.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl">
                            <School className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">No classes assigned to you.</p>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
