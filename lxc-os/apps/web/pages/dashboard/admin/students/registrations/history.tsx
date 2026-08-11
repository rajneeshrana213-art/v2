import { useEffect, useState } from "react";
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
import {
    History,
    Share2,
    Calendar,
    ChevronLeft,
    Clock,
    Link as LinkIcon,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";

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

export default function RegistrationHistoryPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [links, setLinks] = useState<RegistrationLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user?.schoolId) {
            fetchLinks();
        }
    }, [authLoading, user?.schoolId]);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/admin/core/registration/links?schoolId=${user?.schoolId}`);
            setLinks(response.data || []);
        } catch (err: any) {
            toast.error("Failed to load registration history");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/register/student/${token}`;
        navigator.clipboard.writeText(url);
        toast.info("Registration link copied to clipboard!");
    };

    const columns: ColumnDef<RegistrationLink>[] = [
        {
            key: "academicYear",
            header: "Academic Session",
            render: (ay) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{ay.year}</span>
                </div>
            )
        },
        {
            key: "expiresAt",
            header: "Expiry Date",
            render: (date) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{new Date(date).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(date).toLocaleTimeString()}</span>
                </div>
            )
        },
        {
            key: "_count",
            header: "Submissions",
            render: (count) => (
                <Badge variant="soft" className="font-black text-[10px]">
                    {count.registrationRequests} Requests
                </Badge>
            )
        },
        {
            key: "isActive",
            header: "Status",
            render: (isActive) => (
                <Badge
                    tone={isActive ? "success" : "neutral"}
                    variant="soft"
                    className="font-black uppercase tracking-widest text-[9px] px-3 py-1"
                >
                    {isActive ? "Active" : "Expired/Inactive"}
                </Badge>
            )
        },
        {
            key: "token",
            header: "Actions",
            render: (token, item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={!item.isActive}
                    className="h-8 flex items-center gap-2 px-4 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 font-bold text-[10px] uppercase tracking-widest"
                    onClick={() => copyLink(token)}
                >
                    <Share2 className="h-3 w-3" /> Share
                </Button>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Registration History - LearnXChain</title>
            </Head>

            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <button
                            onClick={() => router.push('/dashboard/admin/students/registrations')}
                            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-2"
                        >
                            <ChevronLeft className="h-3 w-3" /> Back to Management
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            <History className="h-10 w-10 text-indigo-600" />
                            Registration History & Stats
                        </h1>
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <LinkIcon className="h-6 w-6 text-indigo-600" />
                            Generated Links Archive
                        </CardTitle>
                        <CardDescription>View all previously generated registration links and their performance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <DataTable
                            columns={columns}
                            data={links}
                            loading={loading}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
