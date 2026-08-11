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
import { Select } from "@/components/ui/forms/select";
import {
    Users,
    GraduationCap,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    UserMinus,
    UserCheck,
    RefreshCw,
    BarChart3,
    Sparkles,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

interface LifecycleStats {
    overall: {
        active: number;
        alumni: number;
        transferred: number;
        droppedOut: number;
        total: number;
    };
    promotionStats: {
        promoted: number;
        repeated: number;
        graduated: number;
        transferred: number;
        droppedOut: number;
    } | null;
}

interface AcademicYear {
    id: string;
    year: string;
    isActive: boolean;
}

export default function LifecycleReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<LifecycleStats | null>(null);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [schoolId, setSchoolId] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (schoolId) {
            fetchStats();
        }
    }, [schoolId, selectedYear]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [schoolRes, yearsRes] = await Promise.all([
                client.get("/v1/dashboard/admin/school-info"),
                client.get("/v1/admin/settings/academic-years"),
            ]);

            const sid =
                schoolRes.data?.school?.id ||
                schoolRes.data?.schoolId ||
                schoolRes.data?.id;
            if (sid) setSchoolId(sid);

            setAcademicYears(yearsRes.data || []);
            if (yearsRes.data?.length > 0) {
                const activeYear = yearsRes.data.find((y: any) => y.isActive);
                setSelectedYear(activeYear?.year || yearsRes.data[0]?.year || "");
            }
        } catch (err: any) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params: any = { schoolId };
            if (selectedYear) params.academicYear = selectedYear;

            const res = await client.get("/v1/admin/student-lifecycle", { params });
            setStats(res.data);
        } catch (err: any) {
            toast.error("Failed to load lifecycle data");
        }
    };

    const overallCards = [
        {
            label: "Active Students",
            value: stats?.overall?.active ?? 0,
            icon: UserCheck,
            color: "emerald",
            gradient: "from-emerald-500 to-teal-600",
            bgLight: "bg-emerald-50",
            bgDark: "dark:bg-emerald-500/10",
            textLight: "text-emerald-600",
            textDark: "dark:text-emerald-400",
        },
        {
            label: "Alumni",
            value: stats?.overall?.alumni ?? 0,
            icon: GraduationCap,
            color: "indigo",
            gradient: "from-indigo-500 to-purple-600",
            bgLight: "bg-indigo-50",
            bgDark: "dark:bg-indigo-500/10",
            textLight: "text-indigo-600",
            textDark: "dark:text-indigo-400",
        },
        {
            label: "Transferred",
            value: stats?.overall?.transferred ?? 0,
            icon: ArrowUpRight,
            color: "amber",
            gradient: "from-amber-500 to-orange-600",
            bgLight: "bg-amber-50",
            bgDark: "dark:bg-amber-500/10",
            textLight: "text-amber-600",
            textDark: "dark:text-amber-400",
        },
        {
            label: "Dropped Out",
            value: stats?.overall?.droppedOut ?? 0,
            icon: UserMinus,
            color: "rose",
            gradient: "from-rose-500 to-red-600",
            bgLight: "bg-rose-50",
            bgDark: "dark:bg-rose-500/10",
            textLight: "text-rose-600",
            textDark: "dark:text-rose-400",
        },
    ];

    const promotionCards = stats?.promotionStats
        ? [
            {
                label: "Promoted",
                value: stats.promotionStats.promoted,
                icon: ArrowUpRight,
                color: "emerald",
            },
            {
                label: "Repeated",
                value: stats.promotionStats.repeated,
                icon: RefreshCw,
                color: "amber",
            },
            {
                label: "Graduated",
                value: stats.promotionStats.graduated,
                icon: GraduationCap,
                color: "indigo",
            },
            {
                label: "Transferred",
                value: stats.promotionStats.transferred,
                icon: ArrowDownRight,
                color: "orange",
            },
            {
                label: "Dropped Out",
                value: stats.promotionStats.droppedOut,
                icon: UserMinus,
                color: "rose",
            },
        ]
        : [];

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
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                LearnXChain Analytics
                            </p>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Loading lifecycle reports...
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Student Lifecycle Reports | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md shadow-sm">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge
                                tone="accent"
                                variant="soft"
                                className="font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                            >
                                Analytics
                            </Badge>
                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                Student Lifecycle Intelligence
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                            Lifecycle Reports
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md">
                            Comprehensive view of student lifecycle — admissions, promotions,
                            transfers, graduations, and alumni tracking.
                        </p>
                    </div>
                    <div className="w-48">
                        <Select
                            label="Academic Year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={[
                                { label: "All Years", value: "" },
                                ...academicYears.map((y) => ({ label: y.year, value: y.year })),
                            ]}
                            className="h-12 font-bold"
                        />
                    </div>
                </div>

                {/* Overall Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {overallCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card
                                key={card.label}
                                variant="outline"
                                className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl group hover:scale-[1.02] transition-all"
                            >
                                <div
                                    className={`h-1 w-full bg-gradient-to-r ${card.gradient} opacity-80`}
                                />
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {card.label}
                                            </p>
                                            <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                                                {card.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`p-3 rounded-2xl ${card.bgLight} ${card.bgDark} group-hover:scale-110 transition-transform`}
                                        >
                                            <Icon
                                                className={`h-6 w-6 ${card.textLight} ${card.textDark}`}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Total */}
                <Card
                    variant="outline"
                    className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl"
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Total Students (All Time)
                                </p>
                                <p className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                                    {stats?.overall?.total ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Records Preserved
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Session Promotion Breakdown */}
                {stats?.promotionStats && selectedYear && (
                    <Card
                        variant="outline"
                        className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl"
                    >
                        <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-600 opacity-80" />
                        <CardHeader className="bg-gray-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-violet-600 p-2.5 text-white shadow-lg shadow-violet-500/30">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold tracking-tight">
                                        Session Breakdown — {selectedYear}
                                    </CardTitle>
                                    <CardDescription className="text-[11px]">
                                        Promotion outcomes for the selected academic year
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                {promotionCards.map((card) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={card.label}
                                            className="flex flex-col items-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <Icon className="h-5 w-5 text-gray-400 mb-2" />
                                            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                                                {card.value}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                                {card.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
