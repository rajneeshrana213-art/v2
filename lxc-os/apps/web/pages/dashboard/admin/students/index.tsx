import { useEffect, useState, useRef } from "react";
import { encodeId } from "@/lib/utils/hashId";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Users, Search, Plus, Upload, MoreVertical, Eye, Edit, Trash2, Filter, GraduationCap, School as SchoolIcon, ClipboardList } from 'lucide-react';
import { Loader } from "@/components/ui/feedback/Loader";
import client, { getAccessToken } from "@/lib/api/client";

import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { LimitExceededModal } from "@/components/dashboard/admin/membership/LimitExceededModal";
import { X, FileSpreadsheet, Download, Check, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatISTDateKey } from "@/lib/utils/date-utils";

interface Student {
    id: string;
    admissionNo: string;
    rollNo: string;
    status: string;
    user: {
        name: string;
        email: string;
        phone: string;
        profilePic: string | null;
    };
    class: {
        name: string;
    };
    section?: string;
}

export default function StudentManagementPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number; successCount: number; failCount: number } | null>(null);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitData, setLimitData] = useState({ current: 0, allowed: 0 });
    const [bulkErrors, setBulkErrors] = useState<any[]>([]);
    const [validationErrorFile, setValidationErrorFile] = useState<{ filename: string; base64: string; mimeType: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const limit = 10;

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedClass]);

    useEffect(() => {
        fetchStudents();
    }, [page, debouncedSearch, selectedClass]);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_students");
        if (savedJobId) {
            console.log("[Job Recovery] Found saved job ID:", savedJobId);
            setIsUploading(true);
            setIsBulkModalOpen(true);
            resumeJobPolling(savedJobId);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearTimeout(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await client.get("/v1/dashboard/admin/classes");
            setClasses(response.data);
        } catch (err) {
            console.error("Failed to fetch classes:", err);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: debouncedSearch,
            });
            if (selectedClass !== "all") params.append("classId", selectedClass);

            const response = await client.get(`/v1/dashboard/admin/students?${params.toString()}`);
            setStudents(response.data.data);
            setTotal(response.data.pagination.total);
        } catch (err: any) {
            toast.error(err.message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudentClick = async (e: any) => {
        e.preventDefault();
        try {
            const res = await client.get("/v1/dashboard/admin/usage-stats");
            const stats = res.data.data;
            const totalAllowed = stats.allowedUsers + stats.bonusUsers;

            if (stats.model === 'MODEL_B' && stats.currentUsers >= totalAllowed) {
                setLimitData({ current: stats.currentUsers, allowed: totalAllowed });
                setIsLimitModalOpen(true);
            } else {
                router.push("/dashboard/admin/students/register");
            }
        } catch (error) {
            console.error("Failed to check usage stats", error);
            // Fallback to allowing navigation if check fails
            router.push("/dashboard/admin/students/register");
        }
    };

    const handleDelete = async () => {
        if (!studentToDelete) return;
        try {
            setIsDeleting(true);
            await client.delete(`/v1/dashboard/admin/students/${studentToDelete.id}`);
            toast.success("Student deleted successfully");
            setShowDeleteModal(false);
            setStudentToDelete(null);
            fetchStudents();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete student");
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: ColumnDef<Student>[] = [
        {
            key: "user",
            header: "Student",
            render: (_value, student) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden ring-0 group-hover/student:ring-2 ring-indigo-500/50 transition-all">
                            {student.user.profilePic ? (
                                <img src={student.user.profilePic} alt="" className="h-full w-full object-cover" />
                            ) : (
                                student.user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <Link
                                href={`/dashboard/admin/students/${encodeId(student.id)}`}
                                className="block group/student"
                            >
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover/student:text-indigo-600 dark:group-hover/student:text-indigo-400 transition-colors cursor-pointer uppercase tracking-tight">{student.user.name}</p>
                            </Link>
                            <p className="text-[10px] text-gray-500 font-medium">{student.admissionNo}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "class",
            header: "Class",
            render: (_value, student) => (
                <div className="flex flex-col gap-1">
                    {student.class ? (
                        <Badge variant="soft" tone="info" className="font-bold w-fit">
                            {student.class.name}
                        </Badge>
                    ) : (
                        <span className="text-xs text-gray-400 italic">No class</span>
                    )}
                    {student.section && (
                        <span className="text-[10px] font-bold text-gray-400 px-1 uppercase tracking-tighter">
                            Section {student.section}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "rollNo",
            header: "Roll No",
        },
        {
            key: "status",
            header: "Status",
            render: (status) => (
                <Badge
                    className={status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}
                >
                    {status}
                </Badge>
            ),
        },
        {
            key: "user",
            header: "Contact",
            render: (_value, student) => (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {student.user.phone}
                </span>
            ),
        },
        {
            key: "id",
            header: "Actions",
            render: (_value, student) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/students/${encodeId(student.id)}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/students/register?edit=${encodeId(student.id)}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => {
                                    setStudentToDelete(student);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                // Step 1: Personal Information
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "1234567890",
                sex: "MALE", // MALE, FEMALE, or OTHERS
                dateOfBirth: "2010-01-01", // Format: YYYY-MM-DD
                bloodType: "O+",

                // Step 2: Parent/Guardian Information
                guardianName: "Mike Doe",
                guardianRelation: "Father", // e.g., Father, Mother, Guardian
                guardianEmail: "mike.doe@example.com",
                guardianPhone: "9876543210",
                guardianOccupation: "Business",
                guardianAddress: "123 Main Street, Downtown",

                // Step 3: Academic Configuration
                className: "Class 11", // Must match an existing class name
                section: "A", // Optional
                academicYear: "2024-2025",
                rollNo: "101",
                admissionDate: "2024-01-01", // Format: YYYY-MM-DD

                // Step 4: Health & Demographics
                Religion: "Hindu",
                allergies: "None",
                medicalCondition: "None",
                medicationName: "None",

                // Address Information
                currentAddress: "123 Main Street, Downtown",
                city: "Mumbai",
                state: "Maharashtra",
                country: "India",
                pincode: "400001",

                // Other Details (Optional)
                permanentAddress: "123 Main Street, Downtown",
                category: "General",
                caste: "General",
                motherTongue: "Hindi",
                languagesKnown: "Hindi, English",
                vehicleNumber: "",
                hostelName: "",
                roomNumber: "",
                areSiblingStudying: "No",
                siblingName: "",
                siblingClass: "",
                siblingRollNo: "",
                siblingAdmissionNo: "",
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
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

                // Normalize and process data
                const processedData = data.map((item: any, index: number) => {
                    // Convert numeric fields that should be strings to strings
                    // Excel often stores phone numbers, dates, roll numbers, etc. as numbers
                    const convertToString = (value: any): string | undefined => {
                        if (value === null || value === undefined) return undefined;
                        if (typeof value === 'number') {
                            return String(value);
                        }
                        return String(value);
                    };

                    // Convert Excel date serial numbers to YYYY-MM-DD format
                    const convertDate = (value: any): string | undefined => {
                        if (value === null || value === undefined) return undefined;

                        // If it's already a string in date format, try to parse and normalize
                        if (typeof value === 'string') {
                            // Try to parse common date formats
                            const dateStr = value.trim();
                            // Check if it's already in YYYY-MM-DD format
                            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                                return dateStr;
                            }
                            // Try parsing other formats
                            const parsed = new Date(dateStr);
                            if (!isNaN(parsed.getTime())) {
                                return formatISTDateKey(parsed);
                            }
                            return dateStr; // Return as-is if can't parse
                        }

                        // If it's a number, it might be an Excel serial date
                        if (typeof value === 'number') {
                            // Excel epoch: January 1, 1900 = 1
                            // JavaScript epoch: January 1, 1970
                            // Excel serial numbers > 1 are dates
                            if (value > 1 && value < 1000000) {
                                try {
                                    // Excel incorrectly treats 1900 as a leap year, so we adjust
                                    const excelEpoch = new Date(1899, 11, 30);
                                    const date = new Date(excelEpoch.getTime() + (value - 1) * 86400000);
                                    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                                        return formatISTDateKey(date);
                                    }
                                } catch (e) {
                                    // If date conversion fails, convert to string
                                }
                            }
                            return String(value);
                        }

                        return String(value);
                    };

                    // Normalize sex field to match enum (MALE, FEMALE, OTHERS)
                    let normalizedSex = item.sex;
                    if (item.sex) {
                        const sexUpper = item.sex.toString().trim().toUpperCase();
                        if (sexUpper === 'MALE' || sexUpper === 'M') {
                            normalizedSex = 'MALE';
                        } else if (sexUpper === 'FEMALE' || sexUpper === 'F') {
                            normalizedSex = 'FEMALE';
                        } else if (sexUpper === 'OTHERS' || sexUpper === 'OTHER' || sexUpper === 'O') {
                            normalizedSex = 'OTHERS';
                        } else {
                            normalizedSex = sexUpper; // Try as-is if it matches enum
                        }
                    }

                    // Map className to classId
                    const matchedClass = classes.find((c: any) => {
                        const className = item.className?.toString().trim().toLowerCase();
                        const classDbName = c.name?.toString().trim().toLowerCase();
                        return className === classDbName;
                    });

                    if (!matchedClass && item.className) {
                        toast.warning(`Row ${index + 2}: Class "${item.className}" not found. Please ensure the class exists.`);
                    }

                    return {
                        ...item,
                        // Convert phone numbers and IDs to strings
                        phone: convertToString(item.phone) || item.phone,
                        rollNo: convertToString(item.rollNo) || item.rollNo,
                        admissionNo: convertToString(item.admissionNo) || item.admissionNo,
                        fatherPhone: convertToString(item.fatherPhone) || item.fatherPhone,
                        motherPhone: convertToString(item.motherPhone) || item.motherPhone,
                        guardianPhone: convertToString(item.guardianPhone) || item.guardianPhone,
                        pincode: convertToString(item.pincode) || item.pincode,
                        // Convert dates (handles Excel serial dates)
                        dateOfBirth: convertDate(item.dateOfBirth) || item.dateOfBirth,
                        admissionDate: convertDate(item.admissionDate) || item.admissionDate,
                        // Other string fields
                        name: item.name ? String(item.name) : item.name,
                        email: item.email ? String(item.email) : item.email,
                        userName: item.userName ? String(item.userName) : item.userName,
                        bloodType: item.bloodType ? String(item.bloodType) : item.bloodType,
                        academicYear: item.academicYear ? String(item.academicYear) : item.academicYear,
                        sex: normalizedSex,
                        classId: matchedClass ? matchedClass.id : item.classId || null,
                    };
                });

                // Submit upload and get job ID
                const response = await fetch("/api/v1/dashboard/admin/students/bulk-upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getAccessToken()}`
                    },
                    body: JSON.stringify(processedData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    // Handle both string errors and error arrays
                    let errorMessage = "Failed to start upload";
                    if (errorData.error) {
                        if (typeof errorData.error === 'string') {
                            errorMessage = errorData.error;
                        } else if (Array.isArray(errorData.error)) {
                            errorMessage = errorData.error.map((err: any) => {
                                if (typeof err === 'string') return err;
                                if (err.path && err.message) {
                                    return `${err.path.join('.')}: ${err.message}`;
                                }
                                return JSON.stringify(err);
                            }).join(', ');
                        } else {
                            errorMessage = JSON.stringify(errorData.error);
                        }
                    }

                    // If there's an error file, store it and show error
                    if (errorData.errorFile) {
                        setValidationErrorFile(errorData.errorFile);
                        toast.error(errorMessage);
                        toast.info("Validation failed. Click 'Download Error File' to see detailed errors.");
                    } else if (response.status === 403 && errorData.limitExceeded) {
                        toast.error("Student limit reached! Please upgrade your plan.");
                        if (errorData.details) {
                            setLimitData({ 
                                current: errorData.details.current, 
                                allowed: errorData.details.allowed 
                            });
                        }
                        setIsLimitModalOpen(true);
                    } else {
                        setValidationErrorFile(null);
                        throw new Error(errorMessage);
                    }
                    setIsUploading(false);
                    setUploadProgress(null);
                    return; // Exit early if we handled the error file
                }

                const { data: { jobId } } = await response.json();

                // Save Job ID for recovery
                localStorage.setItem("bulk_upload_job_id_students", jobId);

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


        let isPollingActive = true;
        const pollJobStatus = async () => {
            if (!isPollingActive) return;
            try {
                const statusResponse = await fetch(`/api/v1/dashboard/admin/bulk-upload/job-status?jobId=${jobId}`, {
                    headers: {
                        "Authorization": `Bearer ${getAccessToken()}`
                    }
                });

                if (!statusResponse.ok) {
                    if (statusResponse.status === 404) {
                        toast.error("Upload job not found or expired");
                        localStorage.removeItem("bulk_upload_job_id_students");
                        setIsUploading(false);
                        setUploadProgress(null);
                        return;
                    }
                    throw new Error("Failed to get job status");
                }

                const { data: job } = await statusResponse.json();

                // Prevent proceeding if modal closed or stopped
                if (!isPollingActive) return;

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
                    isPollingActive = false;
                    localStorage.removeItem("bulk_upload_job_id_students");
                    if (pollIntervalRef.current) {
                        clearTimeout(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);

                    const sCount = job.result?.successCount ?? job.progress.successCount ?? 0;
                    const fCount = job.result?.failCount ?? job.progress.failCount ?? 0;
                    toast.success(`Processed ${job.progress.total} students. ${sCount} successful, ${fCount} failed.`);

                    // Download success file if available
                    if (job.result?.successFile) {
                        downloadFile(
                            job.result.successFile.base64,
                            job.result.successFile.filename,
                            job.result.successFile.mimeType
                        );
                        toast.info("Credentials file downloaded successfully!");
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
                        toast.error(`${job.result.failCount} students failed to upload.`);
                    } else {
                        setIsBulkModalOpen(false);
                    }
                    fetchStudents();
                } else if (job.status === 'failed') {
                    isPollingActive = false;
                    localStorage.removeItem("bulk_upload_job_id_students");
                    if (pollIntervalRef.current) {
                        clearTimeout(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);
                    toast.error(job.error || "Upload failed");
                } else {
                    if (isPollingActive) {
                        pollIntervalRef.current = setTimeout(pollJobStatus, 1000);
                    }
                }
            } catch (pollError: any) {
                isPollingActive = false;
                console.error("Polling error:", pollError);
                if (pollIntervalRef.current) {
                    clearTimeout(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                setIsUploading(false);
                toast.error("Failed to check upload status");
            }
        };
        pollIntervalRef.current = setTimeout(pollJobStatus, 1000);
    };

    return (
        <>
            <Head>
                <title>Student Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="h-8 w-8 text-indigo-600" />
                                Student Directory
                            </h1>
                            <p className="text-sm text-gray-500">Manage all registered students and their academic records</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2" onClick={() => setIsBulkModalOpen(true)}>
                                <Upload className="h-4 w-4" /> Bulk Upload
                            </Button>
                            <Link href="/dashboard/admin/students/registrations">
                                <Button variant="outline" className="gap-2 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-indigo-600">
                                    <ClipboardList className="h-4 w-4" /> Public Registration
                                </Button>
                            </Link>
                            <Button onClick={handleAddStudentClick} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4" /> Add Student
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-4 relative z-50">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
                                <Input
                                    placeholder="Search by name, email, admission no..."
                                    className="h-11 border-none bg-transparent shadow-none w-full"
                                    containerClassName="w-full md:w-[400px] h-11"
                                    leftIcon={<Search className="h-4 w-4" />}
                                    rightIcon={search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    value={search}
                                    onChange={(e: any) => setSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-2 h-11 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-white/10 px-3 rounded-xl shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-900/80 focus-within:border-indigo-400/80 focus-within:ring-2 focus-within:ring-indigo-500/50 backdrop-blur-xl min-w-[200px]">
                                    <div className="flex items-center pr-1 border-r border-gray-100 dark:border-white/5 h-5">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger className="flex-1 border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 px-2 h-full text-xs text-gray-900 dark:text-slate-100">
                                            <SelectValue placeholder="All Classes">
                                                {selectedClass === "all"
                                                    ? "All Classes"
                                                    : classes.find(c => c.id === selectedClass)?.name || "All Classes"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700 shadow-xl">
                                            <SelectItem value="all">All Classes</SelectItem>
                                            {classes.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={students}
                                loading={loading}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing {students.length} of {total} total students
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
                                        disabled={students.length < limit}
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

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-[2rem] border-none shadow-2xl p-0">
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-8 flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 shadow-inner">
                            <Trash2 className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Delete Student?</h3>
                            <p className="text-sm text-gray-500 font-medium">You are about to permanently remove this student from the directory. This action cannot be undone.</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {studentToDelete && (
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                    {studentToDelete.user.profilePic ? (
                                        <img src={studentToDelete.user.profilePic} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        studentToDelete.user.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{studentToDelete.user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{studentToDelete.admissionNo}</p>
                                </div>
                                <Badge variant="soft" tone="info" className="text-[10px] font-black uppercase">
                                    {studentToDelete.class.name}
                                </Badge>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full rounded-2xl h-12 font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
                            >
                                {isDeleting ? (
                                    <><Loader size="sm" variant="white" className="" /> Deleting...</>
                                ) : (
                                    "Confirm Deletion"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="w-full rounded-2xl h-12 font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <LimitExceededModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                currentUsers={limitData.current}
                allowedUsers={limitData.allowed}
                userType="Student"
            />

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {isBulkModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!isUploading) {
                                    // Clear any active polling
                                    if (pollIntervalRef.current) {
                                        clearTimeout(pollIntervalRef.current);
                                        pollIntervalRef.current = null;
                                    }
                                    setIsBulkModalOpen(false);
                                    setValidationErrorFile(null);
                                    setBulkErrors([]);
                                    setUploadProgress(null);
                                }
                            }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900 p-8 shadow-2xl"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                        <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                                        Student Import
                                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Until Upload You can leave this page creadentail shared to your mail id
                                    </p> */}
                                    </h3>
                                    <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={() => {
                                            // Clear any active polling
                                            if (pollIntervalRef.current) {
                                                clearTimeout(pollIntervalRef.current);
                                                pollIntervalRef.current = null;
                                            }
                                            setIsBulkModalOpen(false);
                                            setValidationErrorFile(null);
                                            setBulkErrors([]);
                                            setUploadProgress(null);
                                        }}
                                        className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isUploading ? (
                                    <div className="space-y-4 py-10">
                                        <div className="flex items-center justify-between text-xs font-black text-indigo-600 uppercase tracking-widest">
                                            <span>Synchronizing</span>
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
                                                Processing {uploadProgress?.current} of {uploadProgress?.total}
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
                                            <Upload className="h-12 w-12 text-indigo-500 mx-auto group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Click to upload spreadsheet</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Accepts XLSX, XLS, CSV</p>
                                            </div>
                                            <label className="relative inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 cursor-pointer active:scale-95">
                                                Select File
                                                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <button onClick={downloadTemplate} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                                                <Download className="h-4 w-4" /> Get Template
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {validationErrorFile && !isUploading && (
                                    <div className="mt-4 p-5 rounded-[1.5rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                                        <div className="flex items-center justify-between mb-3 text-rose-600">
                                            <div className="flex items-center gap-2">
                                                <AlertCircleIcon className="h-4 w-4" />
                                                <span className="text-xs font-black uppercase tracking-tight">Validation Errors</span>
                                            </div>
                                            <button
                                                onClick={() => {
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
                                                    downloadFile(
                                                        validationErrorFile.base64,
                                                        validationErrorFile.filename,
                                                        validationErrorFile.mimeType
                                                    );
                                                    toast.success("Error file downloaded");
                                                }}
                                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                <Download className="h-3 w-3" />
                                                Download Error File
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-rose-500 font-medium">
                                            Please download the error file to see detailed validation errors for each row. Fix the errors and upload again.
                                        </p>
                                    </div>
                                )}

                                {bulkErrors.length > 0 && !isUploading && (
                                    <div className="mt-4 p-5 rounded-[1.5rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                                        <div className="flex items-center justify-between mb-3 text-rose-600">
                                            <div className="flex items-center gap-2">
                                                <AlertCircleIcon className="h-4 w-4" />
                                                <span className="text-xs font-black uppercase tracking-tight">{bulkErrors.length} Anomalies</span>
                                            </div>
                                            <button onClick={() => setBulkErrors([])} className="text-[10px] font-black uppercase">Clear</button>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                            {bulkErrors.map((err, idx) => (
                                                <p key={idx} className="text-[10px] text-rose-500 font-medium">{err.name}: {err.error}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
