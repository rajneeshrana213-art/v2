
import { useEffect, useState } from "react";
import { encodeId } from "@/lib/utils/hashId";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
    Users,
    Search,
    MoreVertical,
    Eye,
    X,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Parent {
    id: string;
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
    };
    students: {
        id: string;
        user: {
            name: string;
        };
        class: {
            name: string;
        };
    }[];
}

export default function ParentManagementPage() {
    const router = useRouter();
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [schoolId, setSchoolId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const fetchSchoolId = async () => {
            try {
                const response = await client.get("/v1/dashboard/school-admin");

                // Assuming school data has an id, or we can get it from the user's current school
                // Looking at the dashboard data, it seems to be implicit in the token but many APIs use schoolId in path
                // For now, let's try to get it from the user's profile if available or just hit the school API
                if (response.data?.school?.id) {
                    setSchoolId(response.data.school.id);
                } else {
                    // Fallback to fetch current user's schoolId
                    const userResponse = await client.get("/users/profile");
                    setSchoolId(userResponse.data?.user?.schoolId);
                }
            } catch (err) {
                console.error("Failed to fetch school context:", err);
            }
        };
        fetchSchoolId();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/admin/parents/school/${schoolId}?page=${page}&limit=10`);
            setParents(response.data.data);
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalResults(response.data.pagination.total || 0);
        } catch (err: any) {
            toast.error(err.message || "Failed to load parents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (schoolId) {
            fetchParents();
        }
    }, [schoolId, page, debouncedSearch]);

    const filteredParents = parents.filter(parent =>
        parent.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        parent.user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        parent.user.phone.includes(debouncedSearch)
    );

    const columns: ColumnDef<Parent>[] = [
        {
            key: "user",
            header: "Parent",
            render: (_value, parent) => {
                return (
                    <div className="flex items-center gap-3 group/parent">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden ring-0 group-hover/parent:ring-2 ring-indigo-500/50 transition-all">
                            {parent.user.profilePic ? (
                                <img src={parent.user.profilePic} alt="" className="h-full w-full object-cover" />
                            ) : (
                                parent.user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <p
                                className="text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer group-hover/parent:text-indigo-600 dark:group-hover/parent:text-indigo-400 transition-colors uppercase tracking-tight"
                                onClick={() => router.push(`/dashboard/admin/parents/${encodeId(parent.id)}`)}
                            >
                                {parent.user.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">{parent.user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "user",
            header: "Contact",
            render: (_value, parent) => (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {parent.user.phone}
                </span>
            ),
        },
        {
            key: "students",
            header: "Children",
            render: (_value, parent) => (
                <div className="flex flex-wrap gap-1">
                    {parent.students.map((student) => (
                        <Badge key={student.id} variant="soft" tone="info" className="text-[10px] py-0">
                            {student.user?.name} {student.class?.name ? `(${student.class.name})` : ""}
                        </Badge>
                    ))}
                    {parent.students.length === 0 && <span className="text-xs text-gray-400">No children linked</span>}
                </div>
            ),
        },
        {
            key: "id",
            header: "Actions",
            render: (_value, parent) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/parents/${encodeId(parent.id)}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <>
            <Head>
                <title>Parent Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    Parent Directory
                                </h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tight">Manage and view parent profiles and their connected students</p>
                            </div>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-4 relative z-50">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                                <Input
                                    placeholder="Search by name, email, phone..."
                                    className="h-11 border-none bg-transparent shadow-none w-full"
                                    containerClassName="w-full md:w-[400px] h-11"
                                    leftIcon={<Search className="h-4 w-4" />}
                                    rightIcon={search ? (
                                        <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    ) : null}
                                    value={search}
                                    onChange={(e: any) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={filteredParents}
                                loading={loading}
                            />
                            <div className="mt-4 flex items-center justify-between px-4 pb-4">
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing {filteredParents.length} of {totalResults} total parents
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages || parents.length < 10}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </>
    );
}
