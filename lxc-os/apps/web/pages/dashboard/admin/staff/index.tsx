
import { useState, useEffect } from "react";
import { encodeId } from "@/lib/utils/hashId";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, User, Mail, Phone, Briefcase, Upload, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import StaffBulkUploadModal from "@/components/dashboard/admin/staff/StaffBulkUploadModal";
import { Loader } from "@/components/ui/feedback/Loader";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    profilePic: string | null;
    createdAt: string;
}

export default function StaffDirectoryPage() {
    const router = useRouter();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/dashboard/admin/staff?page=${page}&limit=10`);
            if (response.data.success) {
                setStaff(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalResults(response.data.pagination.total);
            }
        } catch (err) {
            console.error("Failed to fetch staff", err);
            toast.error("Failed to load staff directory");
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_staff");
        if (savedJobId) {
            setIsBulkModalOpen(true);
        }
    }, []);

    // Fetch staff on mount and when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter]);

    // Fetch staff on mount and when filters or page change
    useEffect(() => {
        fetchStaff();
    }, [page, debouncedSearch, roleFilter]);

    const handleDelete = async (id: string) => {
        setStaffToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;
        try {
            setIsDeleting(true);
            const response = await client.delete(`/v1/dashboard/admin/staff/${staffToDelete}`);
            if (response.data.success) {
                toast.success("Staff member deleted");
                fetchStaff();
            }
        } catch (err) {
            toast.error("Failed to delete staff member");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setStaffToDelete(null);
        }
    };

    const handleAddStaffClick = async (e: any) => {
        e.preventDefault();
        try {
            const res = await client.get("/v1/dashboard/admin/usage-stats");
            const stats = res.data.data;
            const totalAllowed = stats.allowedUsers + stats.bonusUsers;

            if (stats.model === 'MODEL_B' && stats.currentUsers >= totalAllowed) {
                setLimitData({ current: stats.currentUsers, allowed: totalAllowed });
                setIsLimitModalOpen(true);
            } else {
                router.push("/dashboard/admin/staff/register");
            }
        } catch (error) {
            console.error("Failed to check usage stats", error);
            // Fallback to allowing navigation if check fails
            router.push("/dashboard/admin/staff/register");
        }
    };

    const columns: ColumnDef<Staff>[] = [
        {
            key: "name",
            header: "Staff Member",
            render: (_value, member) => {
                const roleDisplayNames: { [key: string]: string } = {
                    account: "Accountant",
                    transport: "Transport",
                    hostel: "Hostel Warden",
                    library: "Librarian",
                    driver: "Driver",
                    academics: "Academics",
                };
                return (
                    <Link href={`/dashboard/admin/staff/${encodeId(member.id)}`}>
                        <div className="flex items-center gap-3 group/staff transition-all cursor-pointer">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden ring-0 group-hover/staff:ring-2 ring-indigo-500/50 transition-all">
                                {member.profilePic ? (
                                    <img src={member.profilePic} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    member.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/staff:text-indigo-600 dark:group-hover/staff:text-indigo-400 transition-colors uppercase tracking-tight">{member.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{roleDisplayNames[member.role] || member.role}</p>
                            </div>
                        </div>
                    </Link>
                );
            },
        },
        {
            key: "email",
            header: "Email",
            render: (email: string) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {email}
                </span>
            ),
        },
        {
            key: "phone",
            header: "Contact",
            render: (phone: string) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {phone}
                </span>
            ),
        },
        {
            key: "role",
            header: "Role",
            render: (role: string) => {
                const roleColors: { [key: string]: string } = {
                    account: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    transport: "bg-blue-100 text-blue-700 border-blue-200",
                    hostel: "bg-amber-100 text-amber-700 border-amber-200",
                    library: "bg-purple-100 text-purple-700 border-purple-200",
                    driver: "bg-rose-100 text-rose-700 border-rose-200",
                    academics: "bg-indigo-100 text-indigo-700 border-indigo-200",
                };
                return (
                    <Badge
                        variant="soft"
                        className={`font-bold text-[10px] px-2 py-0.5 border ${roleColors[role] || "bg-gray-100 text-gray-700"}`}
                    >
                        {role}
                    </Badge>
                );
            },
        },
        {
            key: "id",
            header: "Actions",
            render: (_value, member) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-gray-100">
                            <Link href={`/dashboard/admin/staff/${encodeId(member.id)}`} className="w-full">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/staff/register?edit=${encodeId(member.id)}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => handleDelete(member.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Staff
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const filteredStaff = staff.filter(member => {
        const matchesSearch =
            member.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            member.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            member.phone?.includes(debouncedSearch);

        const matchesRole = roleFilter === "all" || member.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <>
            <Head>
                <title>Staff Directory - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    Staff Directory
                                </h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tight">Manage all non-teaching staff members</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsBulkModalOpen(true)}
                                className="gap-2 font-bold uppercase text-[10px] tracking-widest px-6 h-11"
                            >
                                <Upload className="h-4 w-4" /> Bulk Import
                            </Button>
                            <Button
                                onClick={handleAddStaffClick}
                                className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="h-4 w-4" /> Add Staff
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-4 relative z-50">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    className="h-11 border-none bg-transparent shadow-none w-full"
                                    containerClassName="w-full md:w-[400px] h-11"
                                    leftIcon={<Search className="h-4 w-4" />}
                                    rightIcon={searchTerm ? (
                                        <button onClick={() => setSearchTerm("")} className="hover:text-indigo-500 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ) : null}
                                    value={searchTerm}
                                    onChange={(e: any) => setSearchTerm(e.target.value)}
                                />
                                <div className="flex items-center gap-2 h-11 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-white/10 px-3 rounded-xl shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-900/80 focus-within:border-indigo-400/80 focus-within:ring-2 focus-within:ring-indigo-500/50 backdrop-blur-xl min-w-[200px]">
                                    <div className="flex items-center pr-1 border-r border-gray-100 dark:border-white/5 h-5">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="flex-1 border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 px-2 h-full text-xs text-gray-900 dark:text-slate-100">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="account">Accountant</SelectItem>
                                            <SelectItem value="academics">Academics</SelectItem>
                                            <SelectItem value="transport">Transport</SelectItem>
                                            <SelectItem value="library">Librarian</SelectItem>
                                            <SelectItem value="hostel">Hostel Warden</SelectItem>
                                            <SelectItem value="driver">Driver</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={filteredStaff}
                                loading={loading}
                            />
                            <div className="mt-4 flex items-center justify-between px-4 pb-4">
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing {filteredStaff.length} of {totalResults} total staff
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
                                        disabled={page >= totalPages || staff.length < 10}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <StaffBulkUploadModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={fetchStaff}
                />

                <LimitExceededModal
                    isOpen={isLimitModalOpen}
                    onClose={() => setIsLimitModalOpen(false)}
                    currentUsers={limitData.current}
                    allowedUsers={limitData.allowed}
                    userType="Staff"
                />

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="rounded-[2rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-rose-600" />
                                Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete this staff member? This action cannot be undone.
                                This will also remove their associated user account and related records.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-11 px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest h-11 px-6 shadow-lg shadow-rose-500/20"
                            >
                                {isDeleting ? <Loader size="sm" variant="white" /> : "Delete Staff"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </>
    );
}
