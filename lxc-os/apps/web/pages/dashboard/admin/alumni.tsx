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
import { Select } from "@/components/ui/forms/select";
import {
    Users,
    GraduationCap,
    Search,
    MapPin,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

interface AlumniRecord {
    id: string;
    admissionNo: string;
    batch: string;
    lastClass: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
        city: string;
        state: string;
    };
    academicRecords: Array<{
        id: string;
        academicYear: string;
        rollNumber: string;
        promotionStatus: string;
        class: { id: string; name: string };
    }>;
}

export default function AlumniPage() {
    const [loading, setLoading] = useState(true);
    const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecord | null>(
        null,
    );

    useEffect(() => {
        fetchSchoolInfo();
    }, []);

    useEffect(() => {
        if (schoolId) {
            fetchAlumni();
        }
    }, [schoolId, selectedBatch, pagination.page]);

    const fetchSchoolInfo = async () => {
        try {
            const res = await client.get("/v1/dashboard/admin/school-info");
            const sid =
                res.data?.school?.id || res.data?.schoolId || res.data?.id;
            if (sid) setSchoolId(sid);
        } catch {
            toast.error("Failed to load school info");
        }
    };

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            const params: any = {
                schoolId,
                page: pagination.page,
                limit: pagination.limit,
            };
            if (selectedBatch) params.batch = selectedBatch;
            if (searchQuery) params.search = searchQuery;

            const res = await client.get("/v1/admin/alumni", { params });
            setAlumni(res.data.alumni || []);
            setBatches(res.data.batches || []);
            setPagination(res.data.pagination || pagination);
        } catch {
            toast.error("Failed to load alumni");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchAlumni();
    };

    if (loading && alumni.length === 0) {
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
                                LearnXChain Alumni Network
                            </p>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Loading alumni data...
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
                <title>Alumni Portal | Admin | LearnXChain</title>
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
                                Network
                            </Badge>
                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                Alumni Management System
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                            Alumni Portal
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md">
                            View and manage alumni records. Track graduated students across
                            batches and maintain school legacy connections.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 rounded-xl shadow-sm">
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-black text-gray-700 dark:text-gray-300">
                                {pagination.total} Alumni
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search alumni by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="w-48">
                        <Select
                            value={selectedBatch}
                            onChange={(e) => {
                                setSelectedBatch(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            options={[
                                { label: "All Batches", value: "" },
                                ...batches.map((b) => ({ label: `Batch ${b}`, value: b })),
                            ]}
                            className="h-12 font-bold"
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        className="h-12 px-8 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </div>

                {/* Alumni Grid */}
                {alumni.length === 0 ? (
                    <Card
                        variant="outline"
                        className="border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden"
                    >
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="h-20 w-20 rounded-[36px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/10 flex items-center justify-center mb-6">
                                <GraduationCap className="h-10 w-10 text-indigo-200 dark:text-indigo-900/50" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                No Alumni Found
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2 text-center font-medium">
                                There are no graduated students matching your filters. Alumni
                                are automatically created when students graduate through the
                                promotion system.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {alumni.map((alum) => (
                            <Card
                                key={alum.id}
                                variant="outline"
                                className="border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden rounded-3xl group hover:scale-[1.02] transition-all cursor-pointer"
                                onClick={() =>
                                    setSelectedAlumni(
                                        selectedAlumni?.id === alum.id ? null : alum,
                                    )
                                }
                            >
                                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0">
                                            {alum.user.profilePic ? (
                                                <img
                                                    src={alum.user.profilePic}
                                                    alt=""
                                                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-indigo-500/10"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 dark:from-indigo-500/10 dark:to-indigo-500/20 dark:text-indigo-400">
                                                    <GraduationCap className="h-7 w-7" />
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex items-center justify-center">
                                                <GraduationCap className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
                                                {alum.user.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge
                                                    tone="accent"
                                                    variant="soft"
                                                    className="text-[8px] px-1.5 py-0 font-black uppercase tracking-tighter"
                                                >
                                                    Batch {alum.batch}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400 font-bold">
                                                    •
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold">
                                                    {alum.lastClass}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={`h-4 w-4 text-gray-300 transition-transform ${selectedAlumni?.id === alum.id ? "rotate-90" : ""}`}
                                        />
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{alum.user.email}</span>
                                        </div>
                                        {alum.user.phone && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="h-3 w-3" />
                                                <span>{alum.user.phone}</span>
                                            </div>
                                        )}
                                        {alum.user.city && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {alum.user.city}, {alum.user.state}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Academic History */}
                                    {selectedAlumni?.id === alum.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2 mb-3">
                                                <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    Academic Journey
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {alum.academicRecords.map((record, idx) => (
                                                    <div
                                                        key={record.id}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5"
                                                    >
                                                        <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 flex items-center justify-center text-[9px] font-black text-gray-400 shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                    {record.class.name}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    •
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                                    <Calendar className="h-2.5 w-2.5" />
                                                                    {record.academicYear}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            tone={
                                                                record.promotionStatus === "GRADUATED"
                                                                    ? "success"
                                                                    : "neutral"
                                                            }
                                                            variant="soft"
                                                            className="text-[7px] px-1.5 py-0 font-black uppercase tracking-tighter"
                                                        >
                                                            {record.promotionStatus}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                            }
                            className="rounded-xl font-bold"
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-bold text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() =>
                                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                            }
                            className="rounded-xl font-bold"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
