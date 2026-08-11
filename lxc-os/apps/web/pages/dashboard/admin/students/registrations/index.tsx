
import { useEffect, useState } from "react";
import { encodeId } from "@/lib/utils/hashId";
import Head from "next/head";
import { useRouter } from "next/router";
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
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ClipboardList, Link as LinkIcon, Plus, Eye, Check, X, Clock, Share2, Calendar, ChevronLeft, CheckCircle2, History } from 'lucide-react';
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface RegistrationRequest {
    id: string;
    formData: any;
    status: string;
    submittedAt: string;
    registrationLink: {
        token: string;
    };
    academicYear?: {
        year: string;
    };
}

interface RegistrationLink {
    id: string;
    token: string;
    expiresAt: string;
    isActive: boolean;
    academicYear: {
        year: string;
    };
    _count: {
        registrationRequests: number;
    };
}

import { useAuth } from "@/lib/context/AuthContext";
import Loader from '@/components/ui/feedback/Loader';

export default function RegistrationsManagementPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState<RegistrationRequest[]>([]);
    const [links, setLinks] = useState<RegistrationLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [expiryDays, setExpiryDays] = useState("30");

    useEffect(() => {
        if (!authLoading && user?.schoolId) {
            fetchAcademicYears();
            fetchRequests();
            fetchLinks();
        }
    }, [authLoading, user?.schoolId]);

    const fetchAcademicYears = async () => {
        try {
            const response = await client.get("/v1/admin/settings/academic-years");
            const data = response.data || [];
            setAcademicYears(data);
            if (data.length > 0) {
                setSelectedYear(data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch academic years:", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await client.get(`/v1/admin/core/registration/requests?schoolId=${user?.schoolId}`);
            setRequests(response.data?.requests || []);
        } catch (err: any) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchLinks = async () => {
        try {
            const response = await client.get(`/v1/admin/core/registration/links?schoolId=${user?.schoolId}`);
            setLinks(response.data || []);
        } catch (err: any) {
            toast.error("Failed to load registration links");
        } finally {
            setLoadingLinks(false);
        }
    };

    const generateLink = async () => {
        try {
            setIsGenerating(true);
            await client.post("/v1/admin/core/registration/links", {
                schoolId: user?.schoolId,
                academicYearId: selectedYear,
                expiresInDays: Number(expiryDays)
            });
            toast.success("New registration link generated successfully!");
            fetchLinks();
        } catch (err: any) {
            toast.error(err.message || "Failed to generate link");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/register/student/${token}`;
        navigator.clipboard.writeText(url);
        toast.info("Registration link copied to clipboard!");
    };

    const columns: ColumnDef<RegistrationRequest>[] = [
        {
            key: "formData",
            header: "Student",
            render: (formData) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">{formData.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{formData.email}</span>
                </div>
            )
        },
        {
            key: "formData",
            header: "Parents",
            render: (formData) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{formData.guardianName || formData.fatherName || "—"}</span>
                    <span className="text-[10px] text-gray-500">{formData.guardianPhone || formData.fatherPhone || "—"}</span>
                </div>
            )
        },
        {
            key: "academicYear",
            header: "Session",
            render: (academicYear) => (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
                    {academicYear?.year || "—"}
                </span>
            )
        },
        {
            key: "submittedAt",
            header: "Submitted",
            render: (date) => (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock className="h-3 w-3" />
                    {new Date(date).toLocaleDateString()}
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (status) => (
                <Badge
                    tone={status === "PENDING" ? "warning" : status === "APPROVED" ? "success" : "danger"}
                    variant="soft"
                    className="font-black uppercase tracking-widest text-[9px] px-3 py-1"
                >
                    {status}
                </Badge>
            )
        },
        {
            key: "id",
            header: "Actions",
            render: (id) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600"
                    onClick={() => router.push(`/dashboard/admin/students/registrations/${encodeId(id)}`)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Registrations Management - LearnXChain</title>
            </Head>

            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <button
                            onClick={() => router.push('/dashboard/admin/students')}
                            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-2"
                        >
                            <ChevronLeft className="h-3 w-3" /> Student Directory
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            <ClipboardList className="h-10 w-10 text-indigo-600" />
                            Registrations Management
                        </h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Side: Requests List */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Clock className="h-6 w-6 text-indigo-600" />
                                    Review Queue
                                </CardTitle>
                                <CardDescription>Pending and recent registration submissions from the public portal</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <DataTable
                                    columns={columns}
                                    data={requests}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Link Management */}
                    <aside className="space-y-8">
                        <Card className="border-none shadow-xl bg-white dark:bg-indigo-600 text-gray-900 dark:text-white rounded-[2rem] overflow-hidden">
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <LinkIcon className="h-6 w-6 text-indigo-600 dark:text-white" />
                                    Active Portal Link
                                </CardTitle>
                                <CardDescription className="text-gray-500 dark:text-indigo-100/70 font-medium">Generate and share the student registration link</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-indigo-100/80">Academic Session</label>
                                        <Select onValueChange={setSelectedYear} value={selectedYear}>
                                            <SelectTrigger className="bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-indigo-100/50 rounded-xl h-12">
                                                <SelectValue placeholder="Select Session">
                                                    {academicYears.find(ay => ay.id === selectedYear)?.year}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((ay) => (
                                                    <SelectItem key={ay.id} value={ay.id}>{ay.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-indigo-100/80">Link Expiry (Days)</label>
                                        <Input
                                            type="number"
                                            containerClassName="bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/20 text-gray-900 dark:text-white dark:hover:bg-white/20"
                                            className="bg-transparent"
                                            value={expiryDays}
                                            onChange={(e: any) => setExpiryDays(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={generateLink}
                                        disabled={isGenerating || !selectedYear}
                                        className="w-full bg-indigo-600 dark:bg-white text-white dark:text-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-50 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-indigo-700/50"
                                    >
                                        {isGenerating ? <Loader className="" /> : <><Plus className="h-4 w-4 mr-2" /> Refresh Link</>}
                                    </Button>
                                    <p className="text-[10px] text-center text-gray-400 dark:text-red-100/60 font-medium uppercase tracking-widest">* Generating a new link will deactivate the previous one.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Active Link</h3>
                                <button
                                    onClick={() => router.push('/dashboard/admin/students/registrations/history')}
                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                >
                                    <History className="h-3 w-3" /> View History
                                </button>
                            </div>

                            {loadingLinks ? (
                                <div className="flex justify-center p-8"><Loader className="" /></div>
                            ) : (
                                <div className="space-y-3">
                                    {links.filter(l => l.isActive).map((link) => (
                                        <Card key={link.id} className="border-none shadow-md bg-indigo-600 text-white rounded-[2rem] overflow-hidden transition-all duration-300">
                                            <CardContent className="p-8">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80">Current Registration Link</span>
                                                        <span className="text-xl font-black uppercase tracking-tight">{link.academicYear?.year || "Unknown"} Session</span>
                                                    </div>
                                                    <Badge variant="soft" className="bg-white/20 text-white border-none font-black text-[10px]">ACTIVE</Badge>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-100/70">
                                                            <span>Expires On</span>
                                                            <span>{new Date(link.expiresAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => copyLink(link.token)}
                                                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl"
                                                    >
                                                        <Share2 className="h-4 w-4 mr-2" /> Share Registration Link
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {links.filter(l => l.isActive).length === 0 && (
                                        <div className="text-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/10">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No active link found</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Generate a new one above</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}

