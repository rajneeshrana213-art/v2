import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
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
import {
    ArrowLeft,
    Users,
    GraduationCap,
    Bell,
    Bus,
    Home,
    TrendingUp,
    CheckCircle2,
    Clock,
    School,
    User,
    Settings,
    Activity,
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import { motion } from "framer-motion";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface BranchDetail {
    id: string;
    schoolName: string;
    schoolLogo?: string;
    schoolCode?: string;
    isActive: boolean;
    schoolOpening?: string;
    schoolClosing?: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        profilePic?: string;
    };
    stats: {
        students: number;
        teachers: number;
        notices: number;
        buses: number;
        hostels: number;
        attendanceRate: number;
        totalRevenue: number;
    };
    recentStudents: {
        id: string;
        name: string;
        profilePic?: string;
        admissionNo: string;
    }[];
    recentTeachers: {
        id: string;
        name: string;
        profilePic?: string;
        teacherCode?: string;
    }[];
}

const StatCard = ({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: any;
    label: string;
    value: string | number;
    accent: string;
}) => {
    const colors: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
        violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    };
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", colors[accent] ?? colors.indigo)}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

const AvatarFallback = ({ name, src }: { name: string; src?: string | null }) => {
    if (src) {
        return <img src={src} alt={name} className="h-full w-full object-cover" />;
    }
    return (
        <div className="h-full w-full flex items-center justify-center bg-indigo-500 text-white text-xs font-bold">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
    );
};

export default function BranchDetailPage() {
    const router = useRouter();
    const { branchId } = router.query as { branchId: string };
    const [branch, setBranch] = useState<BranchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        if (!branchId) return;
        const fetchBranch = async () => {
            try {
                setLoading(true);
                const res = await client.get(`/v1/group-admin/branches/${branchId}`);
                setBranch(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.error ?? "Failed to load branch details.");
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [branchId]);

    const toggleStatus = async () => {
        if (!branch) return;
        try {
            setToggling(true);
            await client.patch(`/v1/group-admin/branches/${branchId}/status`, {
                isActive: !branch.isActive,
            });
            setBranch((b) => b ? { ...b, isActive: !b.isActive } : b);
        } catch {
            // silently fail — user sees no change
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="group_admin">
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !branch) {
        return (
            <DashboardLayout role="group_admin">
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-center space-y-3">
                        <p className="text-rose-500 font-medium">{error ?? "Branch not found."}</p>
                        <Link href="/dashboard/group-admin/branches">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Branches
                            </Button>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>{branch.schoolName} — Branch Detail | LearnXChain</title>
            </Head>
            <DashboardLayout role="group_admin">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/group-admin/branches">
                                <button className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-500 transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    {branch.schoolLogo ? (
                                        <img src={branch.schoolLogo} alt={branch.schoolName} className="h-full w-full object-cover" />
                                    ) : (
                                        <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{branch.schoolName}</h1>
                                    <p className="text-sm text-gray-500">{branch.schoolCode ?? "No school code"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge
                                className={cn(
                                    "px-3 py-1 text-sm font-semibold",
                                    branch.isActive
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                                )}
                            >
                                {branch.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={toggleStatus}
                                disabled={toggling}
                            >
                                {toggling ? <Loader size="sm" /> : <Activity className="h-4 w-4" />}
                                {branch.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Link href={`/dashboard/group-admin/branches/${branchId}/settings`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Settings className="h-4 w-4" /> Settings
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard icon={GraduationCap} label="Students" value={branch.stats.students} accent="indigo" />
                        <StatCard icon={Users} label="Teachers" value={branch.stats.teachers} accent="emerald" />
                        <StatCard icon={CheckCircle2} label="Attendance" value={`${branch.stats.attendanceRate}%`} accent="sky" />
                        <StatCard icon={TrendingUp} label="Revenue" value={`₹${(branch.stats.totalRevenue / 1000).toFixed(1)}K`} accent="violet" />
                        <StatCard icon={Bus} label="Buses" value={branch.stats.buses} accent="amber" />
                        <StatCard icon={Home} label="Hostels" value={branch.stats.hostels} accent="rose" />
                    </div>

                    {/* Info + People Row */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Branch Info */}
                        <Card className="border border-gray-100 dark:border-white/5 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Branch Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Admin</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{branch.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Email</span>
                                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{branch.user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Opens</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{branch.schoolOpening ?? "08:00"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Closes</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{branch.schoolClosing ?? "16:00"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Notices</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{branch.stats.notices}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">Registered</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {new Date(branch.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Students */}
                        <Card className="border border-gray-100 dark:border-white/5 shadow-sm">
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="text-base">Recent Students</CardTitle>
                                <Link href={`/dashboard/admin/students?branchId=${branchId}`}>
                                    <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View All</span>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {branch.recentStudents.length === 0 ? (
                                    <p className="px-6 pb-4 text-sm text-gray-400">No students enrolled yet.</p>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                                        {branch.recentStudents.map((s) => (
                                            <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                                                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                                                    <AvatarFallback name={s.name} src={s.profilePic} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                                                    <p className="text-xs text-gray-400">{s.admissionNo}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Teachers */}
                        <Card className="border border-gray-100 dark:border-white/5 shadow-sm">
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="text-base">Recent Teachers</CardTitle>
                                <Link href={`/dashboard/admin/teachers?branchId=${branchId}`}>
                                    <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View All</span>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {branch.recentTeachers.length === 0 ? (
                                    <p className="px-6 pb-4 text-sm text-gray-400">No teachers assigned yet.</p>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                                        {branch.recentTeachers.map((t) => (
                                            <div key={t.id} className="flex items-center gap-3 px-6 py-3">
                                                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                                                    <AvatarFallback name={t.name} src={t.profilePic} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                                                    <p className="text-xs text-gray-400">{t.teacherCode ?? "—"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Links */}
                    <Card className="border border-gray-100 dark:border-white/5 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Navigate</CardTitle>
                            <CardDescription>Jump into branch-specific management areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[
                                    { label: "Students", icon: GraduationCap, href: `/dashboard/admin/students` },
                                    { label: "Teachers", icon: Users, href: `/dashboard/admin/teachers` },
                                    { label: "Notices", icon: Bell, href: `/dashboard/admin/notices` },
                                    { label: "Transport", icon: Bus, href: `/dashboard/admin/transport` },
                                    { label: "Finance", icon: TrendingUp, href: `/dashboard/admin/finance` },
                                    { label: "Attendance", icon: CheckCircle2, href: `/dashboard/admin/attendance` },
                                    { label: "Timetable", icon: Clock, href: `/dashboard/admin/timetable` },
                                    { label: "Settings", icon: Settings, href: `/dashboard/admin/settings` },
                                ].map(({ label, icon: Icon, href }) => (
                                    <Link key={label} href={href}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer group">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                                                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </DashboardLayout>
        </>
    );
}
