
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
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
    BookOpen,
    Users,
    Activity,
    Search,
    Filter,
    X,
    PlusCircle,
    AlertCircle,
    FileSpreadsheet,
    Check,
    Tag,
    Hash,
    Layers
} from "lucide-react";
import client, { getAccessToken } from "@/lib/api/client";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/feedback/Loader";
import * as XLSX from "xlsx";


interface ClassData {
    id: string;
    name: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    type: string;
    status: string;
    classId: string;
    class: {
        name: string;
    };
    createdAt: string;
}

function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number; successCount: number; failCount: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bulkErrors, setBulkErrors] = useState<any[]>([]);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "Theory",
        classId: "",
        status: "ACTIVE"
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subsRes, classesRes] = await Promise.all([
                client.get("/v1/dashboard/admin/subjects"),
                client.get("/v1/dashboard/admin/classes")
            ]);
            setSubjects(subsRes.data);
            setClasses(classesRes.data);
        } catch (err: any) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
                        localStorage.removeItem("bulk_upload_job_id_subjects");
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
                    localStorage.removeItem("bulk_upload_job_id_subjects");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);

                    toast.success(`Processed ${job.progress.total} subjects. ${job.result?.successCount || 0} successful, ${job.result?.failCount || 0} failed.`);

                    // Download error file if available
                    if (job.result?.errorFile) {
                        downloadFile(
                            job.result.errorFile.base64,
                            job.result.errorFile.filename,
                            job.result.errorFile.mimeType
                        );
                        toast("Error file downloaded. Please review and fix the errors.");
                    }

                    if (job.result?.errors && job.result.errors.length > 0) {
                        setBulkErrors(job.result.errors);
                        toast.error(`${job.result.errors.length} items failed to upload.`);
                    } else {
                        setIsBulkModalOpen(false);
                        setBulkErrors([]);
                    }
                    fetchData();
                } else if (job.status === 'failed') {
                    localStorage.removeItem("bulk_upload_job_id_subjects");
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
        fetchData();
    }, []);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_subjects");
        if (savedJobId) {
            console.log("[Job Recovery] Found saved job ID for Subjects:", savedJobId);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classId) {
            toast.error("Please select a class");
            return;
        }
        setIsProcessing(true);
        try {
            if (editingSubject) {
                await client.put(`/v1/dashboard/admin/subjects/${editingSubject.id}`, formData);
                toast.success("Subject updated successfully");
            } else {
                await client.post("/v1/dashboard/admin/subjects", formData);
                toast.success("Subject created successfully");
            }
            setIsAddModalOpen(false);
            setEditingSubject(null);
            setFormData({ name: "", code: "", type: "Theory", classId: "", status: "ACTIVE" });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        setIsProcessing(true);
        try {
            await client.delete(`/v1/dashboard/admin/subjects/${id}`);
            toast.success("Subject deleted");
            fetchData();
        } catch (err: any) {
            toast.error("Failed to delete subject");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredSubjects = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesClass = classFilter === "all" || s.classId === classFilter;
        return matchesSearch && matchesClass;
    });

    const downloadTemplate = () => {
        const templateData = [
            { name: "Mathematics", code: "MATH101", type: "Theory", className: "Class 10" },
            { name: "Physics Lab", code: "PHY201", type: "Practical", className: "Class 10" }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "subject_upload_template.xlsx");
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

                setIsUploading(true);
                setUploadProgress({ current: 0, total: data.length, percentage: 0, successCount: 0, failCount: 0 });

                const response = await fetch("/api/v1/dashboard/admin/subjects/bulk-upload", {
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
                localStorage.setItem("bulk_upload_job_id_subjects", jobId);

                // Start polling...
                resumeJobPolling(jobId);
            } catch (err: any) {
                toast.error(err.message || "Upload failed");
                setIsUploading(false);
                setUploadProgress(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadErrorReport = () => {
        if (bulkErrors.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(bulkErrors.map(err => ({
            "Subject Name": err.name,
            "Class": err.className,
            "Error Message": err.error
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Errors");
        XLSX.writeFile(wb, "subject_upload_errors.xlsx");
    };

    const columns: ColumnDef<Subject>[] = [
        {
            key: "name",
            header: "Subject Name",
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{name}</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">{row.code}</span>
                    </div>
                </div>
            )
        },
        {
            key: "class",
            header: "Class",
            render: (cls) => (
                <Badge variant="soft" tone="info" className="font-bold px-3 py-1">
                    <Layers className="h-3 w-3 mr-1.5" />
                    {cls?.name || "N/A"}
                </Badge>
            )
        },
        {
            key: "type",
            header: "Type",
            render: (type) => (
                <Badge variant="outline" className={`font-semibold border-2 ${type === 'Practical'
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5'
                    : 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-500/20 dark:text-orange-400 dark:bg-orange-500/5'
                    }`}>
                    {type}
                </Badge>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (status) => (
                <Badge variant="soft" tone={status === "ACTIVE" ? "success" : "warning"} className="font-bold">
                    <Activity className="h-3 w-3 mr-1" />
                    {status}
                </Badge>
            )
        },
        {
            key: "id",
            header: "Actions",
            align: "right",
            render: (id, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        className="h-8 w-8 p-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border-none"
                        onClick={() => {
                            setEditingSubject(row);
                            setFormData({
                                name: row.name,
                                code: row.code,
                                type: row.type,
                                classId: row.classId,
                                status: row.status
                            });
                            setIsAddModalOpen(true);
                        }}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        className="h-8 w-8 p-0 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border-none"
                        onClick={() => handleDelete(row.id)}
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
                <title>Subject Management | Admin | LearnXChain</title>
            </Head>

            <div className="space-y-8 p-1 sm:p-0">
                {/* HeaderSection */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Subjects</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Configure academic subjects and requirements</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="flex items-center gap-2 h-12 px-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-all font-bold shadow-sm"
                        >
                            <Upload className="h-4 w-4" />
                            Bulk Upload
                        </Button>
                        <Button
                            onClick={() => router.push("/dashboard/admin/subjects/faculty")}
                            className="flex items-center gap-2 h-12 px-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-all font-bold shadow-sm"
                        >
                            <Users className="h-4 w-4" />
                            Manage Faculty
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingSubject(null);
                                setFormData({ name: "", code: "", type: "Theory", classId: "", status: "ACTIVE" });
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 rounded-2xl transition-all font-bold group"
                        >
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            Add Subject
                        </Button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Subjects" value={subjects.length} icon={BookOpen} color="indigo" />
                    <StatCard title="Theory Subjects" value={subjects.filter(s => s.type === 'Theory').length} icon={Tag} color="orange" />
                    <StatCard title="Practicals" value={subjects.filter(s => s.type === 'Practical').length} icon={Activity} color="emerald" />
                    <StatCard title="Active Classes" value={new Set(subjects.map(s => s.classId)).size} icon={Layers} color="sky" />
                </div>

                <Card variant="outline" className="border-gray-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                            <div className="flex-1 min-w-[300px] max-w-sm">
                                <Input
                                    placeholder="Search subject or code..."
                                    containerClassName="w-full h-11 bg-white/50 dark:bg-slate-950 border-gray-200 dark:border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20"
                                    className="text-sm"
                                    leftIcon={<Search className="h-4 w-4" />}
                                    rightIcon={searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
                                            <X className="h-3.5 w-3.5 text-gray-400" />
                                        </button>
                                    )}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    options={[
                                        { label: "All Classes", value: "all" },
                                        ...classes.map(c => ({ label: c.name, value: c.id }))
                                    ]}
                                    containerClassName="min-w-[180px]"
                                    className="h-11 bg-white/50 dark:bg-slate-950 border-gray-200 dark:border-white/10 rounded-xl"
                                />
                                <Badge tone="info" variant="soft" className="h-11 px-6 flex items-center rounded-xl text-[11px] font-black uppercase tracking-widest bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 shadow-sm">
                                    {filteredSubjects.length} Found
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-24">
                                <div className="flex flex-col items-center gap-5">
                                    <div className="relative">
                                        <Loader size="lg" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="h-6 w-6 text-indigo-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-indigo-600 tracking-wide uppercase">Organizing Academic Data...</p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredSubjects}
                                className="border-none shadow-none bg-transparent"
                                emptyState={
                                    <div className="flex flex-col items-center gap-4 py-24 text-center">
                                        <div className="h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-400 mb-2 border border-indigo-100 dark:border-indigo-500/10">
                                            <BookOpen className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-gray-900 dark:text-white">Curriculum Not Found</h3>
                                            <p className="text-sm text-gray-500 max-w-[280px] mx-auto mt-1 font-medium">No subjects match your current filters or search query.</p>
                                        </div>
                                        <Button
                                            onClick={() => { setSearchQuery(""); setClassFilter("all"); }}
                                            className="mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 h-11 px-6 rounded-2xl font-bold border-none transition-all"
                                        >
                                            Reset View
                                        </Button>
                                    </div>
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingSubject ? "Modify Subject" : "Create Subject"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest ml-1">Academic Class</label>
                            <div className="relative">
                                <Layers className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500 z-10" />
                                <select
                                    required
                                    className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none text-gray-900 dark:text-white"
                                    value={formData.classId}
                                    onChange={e => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                                >
                                    <option value="">Select Target Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Input
                                    label="Subject Name"
                                    required
                                    placeholder="e.g. Mathematics"
                                    leftIcon={<Tag className="h-4 w-4" />}
                                    className="h-12 bg-gray-50 dark:bg-slate-900 rounded-2xl"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    label="Subject Code"
                                    required
                                    placeholder="e.g. MATH-101"
                                    leftIcon={<Hash className="h-4 w-4" />}
                                    className="h-12 bg-gray-50 dark:bg-slate-900 rounded-2xl"
                                    value={formData.code}
                                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest ml-1">Assessment Type</label>
                                <select
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.type}
                                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="Theory">Theory Only</option>
                                    <option value="Practical">Practical / Lab</option>
                                    <option value="Research">Research / Project</option>
                                    <option value="Mandatory">Mandatory / Non-Graded</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest ml-1">Publish Status</label>
                                <select
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.status}
                                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="ACTIVE">Active (Live)</option>
                                    <option value="INACTIVE">Inactive (Hidden)</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5 mt-4">
                        <Button type="button" disabled={isProcessing} onClick={() => setIsAddModalOpen(false)} className="px-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold">Discard</Button>
                        <Button type="submit" disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 font-black tracking-wide">
                            {isProcessing ? (
                                <Loader size="sm" variant="white" />
                            ) : (
                                <Check className="h-5 w-5" />
                            )}
                            {editingSubject ? "Apply Changes" : "Register Subject"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Intelligence Import"
            >
                <div className="space-y-8">
                    <div className="rounded-[2.5rem] border-2 border-dashed border-indigo-200 bg-indigo-50/20 p-10 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-indigo-600 text-white shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                            <FileSpreadsheet className="h-10 w-10" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">Curriculum Bulk Upload</h4>
                        <p className="text-xs text-gray-500 mt-2 max-w-[280px] mx-auto font-medium">Map your entire school's curriculum in seconds using our intelligent Excel importer.</p>

                        <div className="mt-10 flex flex-col gap-4 relative z-10">
                            {isUploading ? (
                                <div className="space-y-5 px-6">
                                    <div className="flex items-center justify-between text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                                            Synchronizing Data
                                        </span>
                                        <span>{uploadProgress?.percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-gray-800 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress?.percentage}%` }}
                                            className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                            Processing Subject {uploadProgress?.current} of {uploadProgress?.total}
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
                                    <label className="relative flex h-14 w-full cursor-pointer items-center justify-center rounded-[1.25rem] bg-indigo-600 px-8 text-sm font-black text-white shadow-2xl shadow-indigo-500/40 transition-all hover:bg-indigo-700 hover:-translate-y-1">
                                        <Upload className="mr-3 h-5 w-5" />
                                        Upload Curriculum File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleBulkUpload}
                                        />
                                    </label>

                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center justify-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                                    >
                                        <Download className="h-4 w-4" />
                                        Get Spreadsheet Template
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-amber-50/50 dark:bg-amber-500/5 p-6 border border-amber-100 dark:border-amber-500/10">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider">Required Schema:</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {['name*', 'code*', 'type', 'className*'].map(col => (
                                        <span key={col} className="bg-white dark:bg-slate-900 px-3 py-1 rounded-xl text-[10px] font-black text-amber-700 dark:text-amber-500 border border-amber-100 dark:border-amber-500/20 shadow-sm">{col}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {bulkErrors.length > 0 && (
                        <div className="rounded-[2rem] border border-rose-100 bg-rose-50/30 p-6 animate-in slide-in-from-bottom-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <span className="text-sm font-black text-rose-900 uppercase tracking-tight">{bulkErrors.length} Anomalies Detected</span>
                                </div>
                                <Button
                                    onClick={() => setBulkErrors([])}
                                    className="h-8 text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-600 border-none rounded-xl px-4 font-black"
                                >
                                    Dismiss Errors
                                </Button>
                            </div>
                            <Button
                                onClick={downloadErrorReport}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-xl shadow-rose-500/30 transition-all active:scale-[0.98]"
                            >
                                <Download className="h-4 w-4" />
                                Download Correction Report
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
            `}</style>
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: "indigo" | "emerald" | "sky" | "orange" }) {
    const colors = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/10",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/10",
        sky: "text-sky-600 bg-sky-50 border-sky-100 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/10",
        orange: "text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/10"
    };

    return (
        <Card variant="outline" className="border-gray-200 dark:border-white/10 overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem]">
            <div className={`absolute -right-6 -top-6 p-10 opacity-[0.03] transition-all duration-700 group-hover:scale-150 group-hover:rotate-12 group-hover:opacity-[0.08]`}>
                <Icon className="h-28 w-28" />
            </div>
            <CardContent className="p-7 flex items-center gap-6 relative z-10">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors[color]} border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-[11px] uppercase font-black tracking-[0.2em] text-gray-400 mb-1 group-hover:text-indigo-500 transition-colors">{title}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
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
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">{title}</h3>
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 transition-all hover:rotate-90"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}


export default dynamic(() => Promise.resolve(SubjectsPage), {
    ssr: false,
});
