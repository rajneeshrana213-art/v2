
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
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
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import {
    Plus,
    Trash2,
    Edit2,
    Upload,
    Download,
    School,
    Users,
    DoorOpen,
    Search,
    Filter,
    X,
    PlusCircle,
    AlertCircle,
    FileSpreadsheet,
    Check,
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import client, { getAccessToken } from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";


interface Section {
    id?: string;
    name: string;
    capacity: number;
}

interface ClassData {
    id: string;
    name: string;
    capacity: number;
    roomNumber: string | null;
    Section: Section[];
    _count: {
        students: number;
    };
}

const CLASS_OPTIONS = [
    { label: "Select Class", value: "" },
    { label: "Nursery", value: "Nursery" },
    { label: "Pre Nursery", value: "Pre Nursery" },
    { label: "KG", value: "KG" },
    { label: "LKG", value: "LKG" },
    { label: "UKG", value: "UKG" },
    ...Array.from({ length: 12 }, (_, i) => ({
        label: `Class ${i + 1}`,
        value: `Class ${i + 1}`
    }))
];

const SECTION_OPTIONS = [
    { label: "Select Section", value: "" },
    { label: "Section A", value: "A" },
    { label: "Section B", value: "B" },
    { label: "Section C", value: "C" },
    { label: "Section D", value: "D" },
    { label: "Section E", value: "E" }
];

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassData | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number; successCount: number; failCount: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bulkErrors, setBulkErrors] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Form states
    const [formData, setFormData] = useState<{
        name: string;
        capacity: number | "";
        roomNumber: string;
        sections: { id?: string; name: string; capacity: number | "" }[];
    }>({
        name: "",
        capacity: 0,
        roomNumber: "",
        sections: [{ name: "", capacity: 0 }]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/classes");
            setClasses(response.data);
            return response.data;
        } catch (err: any) {
            toast.error("Failed to load classes");
        } finally {
            setLoading(false);
        }
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
                        localStorage.removeItem("bulk_upload_job_id_classes");
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
                    localStorage.removeItem("bulk_upload_job_id_classes");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);

                    toast.success(`Processed ${job.progress.total} classes. ${job.result?.successCount || 0} successful, ${job.result?.failCount || 0} failed.`);

                    // Download error file if available
                    if (job.result?.errorFile) {
                        downloadFile(
                            job.result.errorFile.base64,
                            job.result.errorFile.filename,
                            job.result.errorFile.mimeType
                        );
                        toast.error("Error file downloaded. Please review and fix the errors.");
                    }

                    if (job.result?.errors && job.result.errors.length > 0) {
                        setBulkErrors(job.result.errors);
                        toast.error(`${job.result.errors.length} items failed to upload.`);
                    } else {
                        setIsBulkModalOpen(false);
                        setBulkErrors([]);
                    }
                    fetchClasses();
                } else if (job.status === 'failed') {
                    localStorage.removeItem("bulk_upload_job_id_classes");
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

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_classes");
        if (savedJobId) {
            console.log("[Job Recovery] Found saved job ID for Classes:", savedJobId);
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

    const handleAddSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { name: "", capacity: 0 }]
        }));
    };

    const handleRemoveSection = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const handleSectionChange = (index: number, field: "name" | "capacity", value: string | number) => {
        const newSections = [...formData.sections];
        const val = field === "capacity" && value === "" ? "" : value;
        (newSections[index] as any)[field] = val;

        // Auto-calculate total capacity
        const totalCapacity = newSections.reduce((acc, s) => acc + (Number(s.capacity) || 0), 0);

        setFormData(prev => ({
            ...prev,
            sections: newSections,
            capacity: totalCapacity === 0 && newSections.every(s => s.capacity === "" || s.capacity === 0) ? "" : totalCapacity
        }));
    };

    const handleAutoDistribute = () => {
        if (formData.sections.length === 0 || formData.capacity === "" || Number(formData.capacity) <= 0) return;
        const totalCap = Number(formData.capacity);
        const baseCapacity = Math.floor(totalCap / formData.sections.length);
        const remainder = totalCap % formData.sections.length;

        const newSections = formData.sections.map((sec, idx) => ({
            ...sec,
            capacity: idx === 0 ? baseCapacity + remainder : baseCapacity
        }));

        setFormData(prev => ({ ...prev, sections: newSections }));
        toast.success("Capacity distributed evenly among sections");
    };

    const handleFixAllMismatches = async () => {
        try {
            setLoading(true);
            await client.post("/v1/dashboard/admin/classes/fix-data");
            toast.success("All capacity mismatches fixed!");
            fetchClasses();
        } catch (err: any) {
            toast.error("Failed to fix mismatches");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out sections without names
        const activeSections = formData.sections.filter(s => s.name.trim() !== "");

        // Field-level validation
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Class Name is required";
        if (!formData.capacity || Number(formData.capacity) <= 0) newErrors.capacity = "Total Capacity must be greater than 0";

        // Section validation (only for sections with a name or if they have non-zero capacity but no name)
        activeSections.forEach((sec, idx) => {
            if (Number(sec.capacity) < 0) newErrors[`section_${idx}_capacity`] = "Capacity cannot be negative";
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the errors in the form");
            return;
        }

        setErrors({});
        setIsProcessing(true);
        try {
            const submissionData = {
                name: formData.name,
                capacity: formData.capacity,
                roomNumber: formData.roomNumber,
                sections: activeSections.map(s => ({
                    id: s.id,
                    name: s.name,
                    capacity: Number(s.capacity) || 0
                }))
            };

            if (editingClass) {
                await client.put(`/v1/dashboard/admin/classes/${editingClass.id}`, submissionData);
                toast.success("Class updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/classes", submissionData);
                toast.success("Class created successfully");
            }
            setIsAddModalOpen(false);
            setEditingClass(null);
            setFormData({ name: "", capacity: 0, roomNumber: "", sections: [{ name: "", capacity: 0 }] });
            setErrors({});
            fetchClasses();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!classToDelete) return;
        setIsProcessing(true);
        try {
            await client.delete(`/v1/dashboard/admin/classes/${classToDelete}`);
            toast.success("Class deleted");
            setIsDeleteModalOpen(false);
            setClassToDelete(null);
            fetchClasses();
        } catch (err: any) {
            toast.error("Failed to delete class");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.roomNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const paginatedClasses = filteredClasses.slice((page - 1) * pageSize, page * pageSize);

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { className: "Class 1", capacity: 40, roomNumber: "101", sections: "A,B,C" },
            { className: "Class 2", capacity: 35, roomNumber: "102", sections: "A,B" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "class_upload_template.xlsx");
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
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const formattedData = data.map((row: any) => ({
                    className: String(row.className),
                    capacity: Number(row.capacity),
                    roomNumber: String(row.roomNumber || ""),
                    sections: row.sections
                        ? String(row.sections).split(",").map((s: string) => ({
                            name: s.trim(),
                            capacity: Math.floor(Number(row.capacity) / String(row.sections).split(",").length)
                        }))
                        : []
                }));

                setIsUploading(true);
                setUploadProgress({ current: 0, total: formattedData.length, percentage: 0, successCount: 0, failCount: 0 });

                // Submit upload and get job ID
                const response = await fetch("/api/v1/dashboard/admin/classes/bulk-upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getAccessToken()}`
                    },
                    body: JSON.stringify(formattedData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to start upload");
                }

                const responseData = await response.json();
                console.log("Bulk upload response:", responseData);

                if (!responseData.data || !responseData.data.jobId) {
                    throw new Error("No job ID received from server");
                }

                const { data: { jobId } } = responseData;

                // Save Job ID for recovery
                localStorage.setItem("bulk_upload_job_id_classes", jobId);

                resumeJobPolling(jobId);
            } catch (err: any) {
                toast.error(err.message || "Upload failed. Verify template format.");
                setIsUploading(false);
                setUploadProgress(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadErrorReport = () => {
        if (bulkErrors.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(bulkErrors.map(err => ({
            "Class Name": err.className,
            "Error Message": err.error
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Errors");
        XLSX.writeFile(wb, "bulk_upload_errors.xlsx");
    };

    const columns: ColumnDef<ClassData>[] = [
        {
            key: "name",
            header: "Class Name",
            render: (name) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <School className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{name}</span>
                </div>
            )
        },
        {
            key: "Section",
            header: "Sections & Capacity",
            render: (sections: Section[]) => (
                <div className="flex flex-wrap gap-2.5">
                    {sections.length > 0 ? (
                        sections.map(s => (
                            <div
                                key={s.id}
                                className="group relative flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 shadow-sm transition-all hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase leading-none">{s.name}</span>
                                        <div className="h-2 w-[1px] bg-gray-200 dark:bg-white/10" />
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] font-bold leading-none ${s.capacity === 0 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{s.capacity || 0}</span>
                                            <span className="text-[8px] font-medium text-gray-400 uppercase tracking-tighter leading-none">Seats</span>
                                        </div>
                                        {s.capacity === 0 && (
                                            <span title="Capacity not set">
                                                <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <div className="h-full bg-indigo-500/50" style={{ width: s.capacity > 0 ? '100%' : '0%' }} title="Section Capacity Indicator" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400 italic bg-gray-50/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-dashed border-gray-200 dark:border-white/10">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[10px]">No sections defined</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "capacity",
            header: "Capacity",
            render: (capacity, row) => {
                const totalSectionCapacity = row.Section.reduce((acc, s) => acc + (s.capacity || 0), 0);
                const mismatch = row.Section.length > 0 && totalSectionCapacity !== capacity;

                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{capacity} Seats</span>
                            {mismatch && (
                                <Badge tone="warning" variant="soft" className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter animate-pulse">
                                    <AlertCircle className="h-2 w-2 mr-1" />
                                    Mismatch
                                </Badge>
                            )}
                        </div>
                        <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${mismatch ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: '100%' }} />
                        </div>
                    </div>
                );
            }
        },
        {
            key: "roomNumber",
            header: "Room No",
            render: (room) => room ? <Badge variant="outline" className="font-mono text-[10px] border-gray-200">{room}</Badge> : "-"
        },
        {
            key: "_count",
            header: "Students",
            render: (count) => (
                <div className="flex justify-start">
                    <Badge tone="success" className="font-bold flex items-center gap-1.5 w-fit px-3 py-1">
                        <Users className="h-3 w-3" />
                        {count?.students || 0}
                    </Badge>
                </div>
            )
        },
        {
            key: "id",
            header: "Actions",
            align: "right",
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        // size="sm"
                        className="h-8 w-8 p-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border-none"
                        onClick={() => {
                            setEditingClass(row);
                            setFormData({
                                name: row.name,
                                capacity: row.capacity ?? 0,
                                roomNumber: row.roomNumber || "",
                                sections: row.Section.length > 0
                                    ? row.Section.map(s => ({ id: s.id, name: s.name, capacity: s.capacity ?? 0 }))
                                    : [{ name: "", capacity: 0 }]
                            });
                            setErrors({});
                            setIsAddModalOpen(true);
                        }}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        // size="sm"
                        className="h-8 w-8 p-0 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border-none"
                        onClick={() => {
                            setClassToDelete(row.id);
                            setIsDeleteModalOpen(true);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Classes & Sections | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8">
                {/* HeaderSection */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Classes & Sections</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage academic structure, rooms and student capacity</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {classes.some(c => c.Section.length > 0 && c.Section.reduce((acc, s) => acc + (s.capacity || 0), 0) !== c.capacity) && (
                            <Button
                                onClick={handleFixAllMismatches}
                                className="flex items-center gap-2 h-11 px-4 sm:px-6 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 rounded-xl transition-all font-bold border-none shadow-sm"
                            >
                                {isProcessing && <Loader size="sm" className="mr-2" />}
                                Fix Mismatches
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex items-center gap-2 h-11 px-4 sm:px-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-all font-semibold"
                        >
                            <Upload className="h-4 w-4" />
                            <span className="hidden sm:inline">Bulk Upload</span>
                        </Button>
                        <Button
                            onClick={() => router.push("/dashboard/admin/classes/faculty")}
                            className="flex items-center gap-2 h-11 px-4 sm:px-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-all font-semibold"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Assign Teachers</span>
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingClass(null);
                                setFormData({ name: "", capacity: 0, roomNumber: "", sections: [{ name: "", capacity: 0 }] });
                                setErrors({});
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 h-11 px-4 sm:px-7 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl transition-all font-bold"
                        >
                            {isProcessing ? <Loader size="sm" className="mr-2" /> : <Plus className="h-5 w-5" />}
                            <span className="hidden sm:inline">Add Class</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatMiniCard title="Total Classes" value={classes.length} icon={School} color="indigo" />
                    <StatMiniCard title="Total Students" value={classes.reduce((acc, c) => acc + (c._count?.students || 0), 0)} icon={Users} color="emerald" />
                    <StatMiniCard title="Total Capacity" value={classes.reduce((acc, c) => acc + c.capacity, 0)} icon={DoorOpen} color="sky" />
                    <StatMiniCard title="Total Sections" value={classes.reduce((acc, c) => acc + c.Section.length, 0)} icon={Filter} color="amber" />
                </div>

                <Card variant="outline" className="border-gray-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                            <Input
                                placeholder="Search class name or room..."
                                className="h-11 border-none bg-transparent shadow-none w-full"
                                containerClassName="w-full md:w-[400px] h-11"
                                leftIcon={<Search className="h-4 w-4" />}
                                rightIcon={searchQuery ? (
                                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-indigo-500 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <Badge tone="info" variant="soft" className="px-3 py-1 h-11 flex items-center bg-indigo-50/50 dark:bg-indigo-500/10 border-gray-100 dark:border-white/5 uppercase tracking-wider text-[10px] font-bold rounded-xl whitespace-nowrap">
                                    {filteredClasses.length} Result{filteredClasses.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader size="lg" />
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <DataTable
                                    columns={columns}
                                    data={paginatedClasses}
                                    className="border-none shadow-none bg-transparent"
                                    emptyState={
                                        <div className="flex flex-col items-center gap-3 py-20 text-center">
                                            <div className="h-16 w-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-2">
                                                <DoorOpen className="h-8 w-8" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">No classes found</h3>
                                            <p className="text-sm text-gray-500 max-w-[200px]">We couldn't find any classes matching your criteria.</p>
                                            <Button
                                                onClick={() => setSearchQuery("")}
                                                className="mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 h-9 px-4 rounded-lg font-bold border-none"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    }
                                />
                                {filteredClasses.length > 0 && (
                                    <div className="mt-4 flex items-center justify-between px-4 pb-4">
                                        <p className="text-xs text-gray-500 font-medium">
                                            Showing {paginatedClasses.length} of {filteredClasses.length} total classes
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
                                                disabled={paginatedClasses.length < pageSize}
                                                onClick={() => setPage(p => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingClass ? "Edit Class" : "Create New Class"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                            label="Class Name"
                            required
                            error={errors.name}
                            options={CLASS_OPTIONS}
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                            label="Room Number"
                            placeholder="e.g. 101"
                            value={formData.roomNumber}
                            onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                        />
                        <Input
                            label="Total Capacity"
                            type="number"
                            required
                            error={errors.capacity}
                            description={formData.sections.length > 1 ? "Sum of section capacities" : "Total class capacity"}
                            value={formData.capacity}
                            onFocus={(e) => e.target.select()}
                            onChange={e => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setFormData(prev => {
                                    const newSections = [...prev.sections];
                                    if (newSections.length === 1) {
                                        newSections[0].capacity = val;
                                    }
                                    return {
                                        ...prev,
                                        capacity: val,
                                        sections: newSections
                                    };
                                });
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Manage Sections & Capacity</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    className="h-7 text-[10px] gap-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border-none rounded-lg font-bold"
                                    onClick={handleAutoDistribute}
                                >
                                    <DoorOpen className="h-3 w-3" /> Auto-Distribute
                                </Button>
                                <Button
                                    type="button"
                                    className="h-7 text-[10px] gap-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border-none rounded-lg font-bold"
                                    onClick={handleAddSection}
                                >
                                    <PlusCircle className="h-3 w-3" /> Add Section
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {formData.sections.map((sec, idx) => (
                                <div key={idx} className="flex flex-col gap-2 p-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 group relative transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            label="Section Name"
                                            required
                                            options={SECTION_OPTIONS}
                                            error={errors[`section_${idx}_name`]}
                                            className="flex-1"
                                            value={sec.name}
                                            onChange={e => handleSectionChange(idx, "name", e.target.value)}
                                        />
                                        <Input
                                            label="Capacity"
                                            type="number"
                                            error={errors[`section_${idx}_capacity`]}
                                            placeholder="Cap"
                                            className="w-24"
                                            value={sec.capacity}
                                            onFocus={(e) => e.target.select()}
                                            onChange={e => handleSectionChange(idx, "capacity", e.target.value === "" ? "" : Number(e.target.value))}
                                        />
                                        {formData.sections.length > 1 && (
                                            <Button
                                                type="button"
                                                className="h-9 w-9 mt-6 flex-shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border-none p-0"
                                                onClick={() => handleRemoveSection(idx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                        <Button type="button" disabled={isProcessing} onClick={() => setIsAddModalOpen(false)} className="px-6 rounded-xl w-full sm:w-auto border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold h-11">Cancel</Button>
                        <Button type="submit" disabled={isProcessing} className="bg-indigo-600 w-full sm:w-auto hover:bg-indigo-700 text-white px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 h-11">
                            {isProcessing ? (
                                <Loader size="sm" variant="white" className="mr-2" />
                            ) : editingClass ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            {editingClass ? "Update Class" : "Create Class"}
                        </Button>
                    </div>
                </form>
            </Modal>



            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Upload Classes"
            >
                <div className="space-y-6">
                    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-xl mb-4">
                            <FileSpreadsheet className="h-7 w-7" />
                        </div>
                        <h4 className="font-bold text-gray-900">Import Class Data</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto">Upload an Excel file with class and section details to populate your database instantly.</p>

                        <div className="mt-8 flex flex-col gap-3">
                            {isUploading ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress?.percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress?.percentage}%` }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400">
                                            Processing {uploadProgress?.current} of {uploadProgress?.total} classes
                                        </p>
                                        <div className="flex items-center justify-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5 text-green-600" />
                                                <span className="font-semibold text-green-600">{uploadProgress?.successCount || 0} Success</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                                                <span className="font-semibold text-rose-600">{uploadProgress?.failCount || 0} Failed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className="relative flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Excel File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleBulkUpload}
                                        />
                                    </label>

                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        <Download className="h-3 w-3" />
                                        Download Spreadsheet Template
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">Required Columns:</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-700">className*</span>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-700">capacity*</span>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-700">roomNumber</span>
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-700">sections (A,B,C)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {bulkErrors.length > 0 && (
                        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-rose-600" />
                                    <span className="text-sm font-bold text-rose-900">{bulkErrors.length} Errors Found</span>
                                </div>
                                <Button
                                    onClick={() => setBulkErrors([])}
                                    className="h-7 text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-600 border-none rounded-lg px-2"
                                >
                                    Clear
                                </Button>
                            </div>
                            <Button
                                onClick={downloadErrorReport}
                                className="w-full flex items-center justify-center gap-2 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20"
                            >
                                <Download className="h-4 w-4" />
                                Download Error Report (Excel)
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Delete Class?</h4>
                            <p className="text-sm text-gray-500 max-w-[280px]">
                                Are you sure you want to delete this class? This action cannot be undone and will delete all associated sections.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                        <Button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-6 h-11 w-full sm:w-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteClass}
                            disabled={isProcessing}
                            className="bg-rose-600 h-11 w-full sm:w-auto hover:bg-rose-700 text-white px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                        >
                            {isProcessing ? (
                                <Loader size="sm" variant="white" className="mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
        </DashboardLayout >
    );
}

function StatMiniCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: "indigo" | "emerald" | "sky" | "amber" }) {
    const colors = {
        indigo: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10",
        emerald: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
        sky: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/10",
        amber: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
    };

    const gradientColors = {
        indigo: "from-indigo-500/5 to-transparent",
        emerald: "from-emerald-500/5 to-transparent",
        sky: "from-sky-500/5 to-transparent",
        amber: "from-amber-500/5 to-transparent"
    };

    return (
        <Card variant="outline" className="border-gray-200 dark:border-white/10 overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:shadow-none hover:-translate-y-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`absolute -right-4 -top-4 p-8 opacity-[0.03] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-[0.08]`}>
                <Icon className="h-24 w-24" />
            </div>
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]} shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-1 group-hover:text-gray-500 transition-colors">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Modal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl border border-white/10"
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

