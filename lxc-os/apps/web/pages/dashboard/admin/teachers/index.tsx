
import { useEffect, useState, useRef, useMemo } from "react";
import { encodeId } from "@/lib/utils/hashId";
import { Loader } from "@/components/ui/feedback/Loader";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
    Users,
    Search,
    Plus,
    Upload,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Filter,
    ChevronRight,
    ChevronLeft,
    Check,
} from "lucide-react";
import client, { getAccessToken } from "@/lib/api/client";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, Download, AlertCircle as AlertCircleIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";

interface Teacher {
    id: string;
    teacherSchoolId: string;
    status: string;
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
    };
}

export default function TeacherManagementPage() {
    const router = useRouter();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number; successCount: number; failCount: number } | null>(null);
    const [bulkErrors, setBulkErrors] = useState<any[]>([]);
    const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const limit = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset to page 1 on filter/search change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchTeachers();
    }, [page, debouncedSearch, statusFilter]);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_teachers");
        if (savedJobId) {
            console.log("[Job Recovery] Found saved job ID for Teachers:", savedJobId);
            setIsUploading(true);
            setIsBulkModalOpen(true);
            resumeJobPolling(savedJobId);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: debouncedSearch,
            });
            if (statusFilter !== "all") params.append("status", statusFilter);

            const response = await client.get(`/v1/dashboard/admin/teachers?${params.toString()}`);
            setTeachers(response.data.data);
            setTotal(response.data.pagination.total);
        } catch (err: any) {
            toast.error(err.message || "Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setTeacherToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!teacherToDelete) return;
        try {
            setIsDeleting(true);
            await client.delete(`/v1/dashboard/admin/teachers/${teacherToDelete}`);
            toast.success("Teacher deleted successfully");
            fetchTeachers();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete teacher");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setTeacherToDelete(null);
        }
    };

    const handleAddTeacherClick = async (e: any) => {
        e.preventDefault();
        try {
            const res = await client.get("/v1/dashboard/admin/usage-stats");
            const stats = res.data.data;
            const totalAllowed = stats.allowedUsers + stats.bonusUsers;

            if (stats.model === 'MODEL_B' && stats.currentUsers >= totalAllowed) {
                setLimitData({ current: stats.currentUsers, allowed: totalAllowed });
                setIsLimitModalOpen(true);
            } else {
                router.push("/dashboard/admin/teachers/register");
            }
        } catch (error) {
            console.error("Failed to check usage stats", error);
            // Fallback to allowing navigation if check fails
            router.push("/dashboard/admin/teachers/register");
        }
    };



    const columns: ColumnDef<Teacher>[] = [
        {
            key: "user",
            header: "Teacher",
            render: (_value, teacher) => {
                return (
                    <Link
                        href={`/dashboard/admin/teachers/${encodeId(teacher.id)}`}
                        className="flex items-center gap-3 group/teacher transition-all"
                    >
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden ring-0 group-hover/teacher:ring-2 ring-indigo-500/50 transition-all">
                            {teacher.user.profilePic ? (
                                <img src={teacher.user.profilePic} alt="" className="h-full w-full object-cover" />
                            ) : (
                                teacher.user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/teacher:text-indigo-600 transition-colors uppercase tracking-tight">{teacher.user.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{teacher.teacherSchoolId}</p>
                        </div>
                    </Link>
                );
            },
        },
        {
            key: "user",
            header: "Email",
            render: (_value, teacher) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {teacher.user.email}
                </span>
            ),
        },
        {
            key: "user",
            header: "Contact",
            render: (_value, teacher) => (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {teacher.user.phone}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (status: string) => {
                const isActive = status?.toLowerCase() === "active";
                return (
                    <Badge
                        tone={isActive ? "success" : "danger"}
                        variant="soft"
                        className="font-bold flex w-fit gap-1 items-center"
                    >
                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {status}
                    </Badge>
                );
            },
        },
        {
            key: "id",
            header: "Actions",
            render: (_value, teacher) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/teachers/${encodeId(teacher.id)}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/teachers/register?edit=${encodeId(teacher.id)}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>


                            <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => handleDelete(teacher.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Teacher
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const downloadTemplate = () => {
        const templateData = [
            {
                "Full Name": "Jane Smith",
                "Email Address": "jane@school.com",
                "Phone Number": "1234567890",
                "Gender": "FEMALE",
                "Blood Group": "O+",
                "Date of Birth": "1985-05-15",
                "Date of Joining": "2023-01-01",
                "Father Name": "John Smith",
                "Mother Name": "Mary Smith",
                "Marital Status": "MARRIED",
                "Languages": "English, Hindi",
                "Qualification": "M.Ed, PhD",
                "Work Experience": "10 Years",
                "Street Address": "456 Residence Ave",
                "City": "Example City",
                "State": "Example State",
                "Country": "India",
                "Postal Code": "654321"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Teachers");
        XLSX.writeFile(wb, "teacher_bulk_upload_template.xlsx");
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

                if (data.length === 0) {
                    toast.error("Spreadsheet is empty");
                    return;
                }

                setIsUploading(true);
                setUploadProgress({ current: 0, total: data.length, percentage: 0, successCount: 0, failCount: 0 });

                // Submit upload and get job ID
                const response = await fetch("/api/v1/dashboard/admin/teachers/bulk-upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getAccessToken()}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to start upload");
                }

                const { data: { jobId } } = await response.json();

                // Save Job ID for recovery
                localStorage.setItem("bulk_upload_job_id_teachers", jobId);

                resumeJobPolling(jobId);
            } catch (err: any) {
                toast.error(err.message || "Bulk upload failed");
                setIsUploading(false);
                setUploadProgress(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    const resumeJobPolling = (jobId: string) => {
        // Helper function to download file from base64
        const downloadFile = (base64: string, filename: string, mimeType: string) => {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        // Poll for job status
        pollIntervalRef.current = setInterval(async () => {
            try {
                const statusResponse = await fetch(`/api/v1/dashboard/admin/bulk-upload/job-status?jobId=${jobId}&t=${Date.now()}`, {
                    headers: {
                        "Authorization": `Bearer ${getAccessToken()}`
                    },
                    cache: 'no-store'
                });

                if (!statusResponse.ok) {
                    if (statusResponse.status === 404) {
                        toast.error("Upload job not found or expired");
                        localStorage.removeItem("bulk_upload_job_id_teachers");
                        setIsUploading(false);
                        setUploadProgress(null);
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                        }
                        return;
                    }
                    throw new Error("Failed to get job status");
                }

                const { data: job } = await statusResponse.json();

                // Update progress
                setUploadProgress({
                    current: job.progress.current,
                    total: job.progress.total,
                    percentage: job.progress.percentage,
                    successCount: job.progress.successCount,
                    failCount: job.progress.failCount
                });

                // Check if job is complete
                if (job.status === 'completed') {
                    localStorage.removeItem("bulk_upload_job_id_teachers");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);

                    toast.success(`Processed ${job.progress.total} teachers. ${job.result?.successCount || 0} successful, ${job.result?.failCount || 0} failed.`);

                    // Download success file if available
                    if (job.result?.successFile) {
                        downloadFile(
                            job.result.successFile.base64,
                            job.result.successFile.filename,
                            job.result.successFile.mimeType
                        );
                        toast.info("Teacher credentials file downloaded successfully!");
                    }

                    // Download error file if available
                    if (job.result?.errorFile) {
                        downloadFile(
                            job.result.errorFile.base64,
                            job.result.errorFile.filename,
                            job.result.errorFile.mimeType
                        );
                        toast.warning("Error file downloaded. Please review and fix the errors.");
                    }

                    if (job.result?.failCount > 0) {
                        setBulkErrors(job.result.errors);
                        toast.error(`${job.result.failCount} teachers failed to upload.`);
                    } else {
                        setIsBulkModalOpen(false);
                    }
                    fetchTeachers();
                } else if (job.status === 'failed') {
                    localStorage.removeItem("bulk_upload_job_id_teachers");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);
                    toast.error(job.error || "Upload failed");
                }
            } catch (pollError: any) {
                console.error("Polling error:", pollError);
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                setIsUploading(false);
                toast.error("Failed to check upload status");
            }
        }, 1000); // Poll every 1 second
    };

    return (
        <>
            <Head>
                <title>Teacher Directory - LearnXChain</title>
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
                                    Teacher Faculty
                                </h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tight">Manage your school faculty and their academic assignments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2 font-bold uppercase text-[10px] tracking-widest px-6 h-11" onClick={() => setIsBulkModalOpen(true)}>
                                <Upload className="h-4 w-4" /> Bulk Import
                            </Button>
                            <Button onClick={handleAddTeacherClick} className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold uppercase text-[10px] tracking-widest px-6 h-11 shadow-lg shadow-indigo-500/20">
                                <Plus className="h-4 w-4" /> Add Teacher
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-4 relative z-50">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                                <Input
                                    placeholder="Find teacher by name, email, or school ID..."
                                    className="h-11 border-none bg-transparent shadow-none w-full"
                                    containerClassName="w-full md:w-[400px] h-11"
                                    leftIcon={<Search className="h-4 w-4" />}
                                    rightIcon={search ? (
                                        <button onClick={() => setSearch("")} className="hover:text-indigo-500 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ) : null}
                                    value={search}
                                    onChange={(e: any) => setSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-2 h-11 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-white/10 px-3 rounded-xl shadow-sm backdrop-blur-xl transition-all duration-200 focus-within:border-indigo-400/80 focus-within:ring-2 focus-within:ring-indigo-500/50">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none h-9 focus:ring-0 px-1 dark:text-slate-100 text-xs font-medium">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={teachers}
                                loading={loading}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                    Showing {teachers.length} of {total} Members
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl px-4"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl px-4"
                                        disabled={teachers.length < limit}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>

            <LimitExceededModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                currentUsers={limitData.current}
                allowedUsers={limitData.allowed}
                userType="Teacher"
            />

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {isBulkModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isUploading && setIsBulkModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 shadow-2xl"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                        <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                                        Teacher Import
                                    </h3>
                                    <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                                </div>
                                {!isUploading && (
                                    <button onClick={() => setIsBulkModalOpen(false)} className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isUploading ? (
                                    <div className="space-y-4 py-10">
                                        <div className="flex items-center justify-between text-xs font-black text-indigo-600 uppercase tracking-widest">
                                            <span>Importing</span>
                                            <span>{uploadProgress?.percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-indigo-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-indigo-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress?.percentage}%` }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                Syncing {uploadProgress?.current} of {uploadProgress?.total} Records
                                            </p>
                                            <div className="flex items-center justify-center gap-4 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                                    <span className="font-semibold text-green-600">{uploadProgress?.successCount || 0} Success</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircleIcon className="h-3.5 w-3.5 text-rose-600" />
                                                    <span className="font-semibold text-rose-600">{uploadProgress?.failCount || 0} Failed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        <div className="p-10 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-[2.5rem] bg-indigo-50/20 dark:bg-indigo-900/10 text-center space-y-4 group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Upload className="h-12 w-12 text-indigo-50 mx-auto group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Drop faculty spreadsheet here</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 tracking-tighter">Support: XLSX, CSV, XLS</p>
                                            </div>
                                            <label className="relative inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 cursor-pointer active:scale-95">
                                                Select Dataset
                                                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <button onClick={downloadTemplate} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                                                <Download className="h-4 w-4" /> Download Template
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {bulkErrors.length > 0 && !isUploading && (
                                    <div className="mt-4 p-5 rounded-[1.5rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                                        <div className="flex items-center justify-between mb-3 text-rose-600">
                                            <div className="flex items-center gap-3">
                                                <AlertCircleIcon className="h-4 w-4" />
                                                <span className="text-xs font-black uppercase tracking-tight">{bulkErrors.length} Upload Failures</span>
                                            </div>
                                            <button onClick={() => setBulkErrors([])} className="text-[10px] font-black uppercase tracking-widest">Clear Log</button>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                            {bulkErrors.map((err, idx) => (
                                                <p key={idx} className="text-[10px] text-rose-500 font-bold">{err.name}: {err.error}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-[2rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-rose-600" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this teacher? This action cannot be undone.
                            This will also remove their associated user account, schedule, and all related data.
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
                            {isDeleting ? <Loader size="sm" variant="white" /> : "Delete Teacher"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
