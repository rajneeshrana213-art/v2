
import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/feedback/modal";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/api/client";
import { Upload, AlertCircle, CheckCircle2, Check, FileText, X, Download, FileSpreadsheet, FileUp, ShieldCheck } from 'lucide-react';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Loader } from "@/components/ui/feedback/Loader";

interface StaffBulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StaffBulkUploadModal({ isOpen, onClose, onSuccess }: StaffBulkUploadModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number; successCount: number; failCount: number } | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [results, setResults] = useState<any>(null);
    const [bulkErrors, setBulkErrors] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check for existing job on mount
    useEffect(() => {
        const savedJobId = localStorage.getItem("bulk_upload_job_id_staff");
        if (savedJobId) {
            console.log("[Job Recovery] Found saved job ID for Staff:", savedJobId);
            setIsUploading(true);
            setStatus("processing");
            resumeJobPolling(savedJobId);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []);

    const downloadTemplate = () => {
        const templateData = [
            {
                "Full Name": "John Doe",
                "Email Address": "john@school.com",
                "Username": "johndoe",
                "Phone Number": "1234567890",
                "Role": "account",
                "Gender": "MALE",
                "Blood Group": "O+",
                "Street Address": "123 Main St",
                "City": "Mumbai",
                "State": "Maharashtra",
                "Country": "India",
                "Postal Code": "400001",
                "Hostel Name (For Hostel Role)": "",
                "Capacity (For Hostel Role)": "",
                "License (For Driver Role)": "",
                "Bus ID (For Driver Role)": ""
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff");
        XLSX.writeFile(wb, "staff_bulk_upload_template.xlsx");
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const rawData: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

                if (rawData.length === 0) {
                    toast.error("Spreadsheet is empty");
                    return;
                }

                // Map headers to field names
                const mappedData = rawData.map(row => {
                    // Role normalization
                    let role = row["Role"]?.toLowerCase().trim();
                    if (role === "accountant") role = "account";
                    if (role === "transport manager") role = "transport";
                    if (role === "hostel manager") role = "hostel";
                    if (role === "librarian") role = "library";
                    if (role === "academics staff") role = "academics";

                    return {
                        name: row["Full Name"],
                        email: row["Email Address"],
                        userName: row["Username"] || undefined,
                        phone: row["Phone Number"]?.toString(),
                        role: role,
                        sex: row["Gender"]?.toUpperCase().trim() === "MALE" ? "MALE" :
                            row["Gender"]?.toUpperCase().trim() === "FEMALE" ? "FEMALE" : "OTHERS",
                        bloodType: row["Blood Group"] || "Unknown",
                        address: row["Street Address"] || "N/A",
                        city: row["City"] || "N/A",
                        state: row["State"] || "N/A",
                        country: row["Country"] || "India",
                        pincode: row["Postal Code"]?.toString() || "000000",
                        hostelName: row["Hostel Name (For Hostel Role)"],
                        capacity: row["Capacity (For Hostel Role)"]?.toString(),
                        license: row["License (For Driver Role)"],
                        busId: row["Bus ID (For Driver Role)"]
                    };
                });

                startBulkProcessing(mappedData);
            } catch (err) {
                console.error("File processing error:", err);
                toast.error("Failed to parse Excel file");
            }
        };
        reader.readAsBinaryString(file);
    };

    const startBulkProcessing = async (data: any[]) => {
        try {
            setIsUploading(true);
            setStatus("processing");
            setUploadProgress({ current: 0, total: data.length, percentage: 0, successCount: 0, failCount: 0 });

            // Submit upload and get job ID
            const response = await fetch("/api/v1/dashboard/admin/staff/bulk-upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = "Bulk upload failed";
                if (Array.isArray(errorData.error)) {
                    errorMessage = `Validation Error: ${errorData.error[0]?.path?.join('.')} - ${errorData.error[0]?.message}`;
                } else if (typeof errorData.error === 'string') {
                    errorMessage = errorData.error;
                }
                throw new Error(errorMessage);
            }

            const { data: { jobId } } = await response.json();

            // Save Job ID for recovery
            localStorage.setItem("bulk_upload_job_id_staff", jobId);

            resumeJobPolling(jobId);
        } catch (err: any) {
            toast.error(err.message || "Bulk upload failed");
            setIsUploading(false);
            setStatus("error");
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
                        localStorage.removeItem("bulk_upload_job_id_staff");
                        setIsUploading(false);
                        setStatus("error");
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
                    localStorage.removeItem("bulk_upload_job_id_staff");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);
                    setResults(job.result);
                    setStatus("success");
                    toast.success("Bulk upload completed successfully!");

                    // Download success file if available
                    if (job.result?.successFile) {
                        downloadFile(
                            job.result.successFile.base64,
                            job.result.successFile.filename,
                            job.result.successFile.mimeType
                        );
                    }

                    // Download error file if available
                    if (job.result?.errorFile) {
                        downloadFile(
                            job.result.errorFile.base64,
                            job.result.errorFile.filename,
                            job.result.errorFile.mimeType
                        );
                    }

                    if (job.result?.failCount > 0) {
                        setBulkErrors(job.result.errors);
                    }

                    onSuccess();
                } else if (job.status === 'failed') {
                    localStorage.removeItem("bulk_upload_job_id_staff");
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                    }
                    setIsUploading(false);
                    setStatus("error");
                    toast.error(job.error || "Upload failed");
                }
            } catch (pollError: any) {
                console.error("Polling error:", pollError);
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                setIsUploading(false);
                setStatus("error");
            }
        }, 1000);
    };

    const resetModal = () => {
        setStatus("idle");
        setIsUploading(false);
        setUploadProgress(null);
        setResults(null);
        setBulkErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Modal
            open={isOpen}
            onClose={() => {
                if (!isUploading) {
                    onClose();
                    resetModal();
                }
            }}
            title="Import Staff Directory"
            description="Quickly populate your school directory by uploading an Excel or CSV file with staff details."
            size="lg"
        >
            <div className="py-4">
                <AnimatePresence mode="wait">
                    {status === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="p-8 border-2 border-dashed border-indigo-100 dark:border-indigo-900/40 rounded-[2rem] bg-indigo-50/30 dark:bg-indigo-900/10 text-center space-y-4 group transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
                                <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                    <FileUp className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-white">Upload Staff Dataset</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">XLSX, XLS or CSV</p>
                                </div>
                                <label className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95">
                                    Browse Files
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    <Download className="h-4 w-4" /> Download Excel Template
                                </button>
                                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-tight">Ensure column headers match exactly as in the template.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 py-10"
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative h-24 w-24">
                                    <svg className="h-full w-full rotate-[-90deg]">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="transparent"
                                            className="text-gray-100 dark:text-gray-800"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 44}
                                            strokeDashoffset={2 * Math.PI * 44 * (1 - (uploadProgress?.percentage || 0) / 100)}
                                            strokeLinecap="round"
                                            className="text-indigo-600 transition-all duration-300"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">
                                        {uploadProgress?.percentage}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Importing Records...</h3>
                                    <p className="text-xs text-gray-500 font-medium">Syncing {uploadProgress?.current} of {uploadProgress?.total} staff members</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col items-center">
                                    <Check className="h-5 w-5 text-emerald-600 mb-1" />
                                    <span className="text-xl font-black text-emerald-600 leading-none">{uploadProgress?.successCount}</span>
                                    <span className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest mt-1">Success</span>
                                </div>
                                <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 flex flex-col items-center">
                                    <AlertCircle className="h-5 w-5 text-rose-600 mb-1" />
                                    <span className="text-xl font-black text-rose-600 leading-none">{uploadProgress?.failCount}</span>
                                    <span className="text-[10px] font-bold text-rose-700/60 uppercase tracking-widest mt-1">Failed</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10">
                                    <ShieldCheck className="h-10 w-10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Import Successful</h3>
                                    <p className="text-sm text-gray-500 font-medium">We've successfully processed {results?.successCount} new staff records.</p>
                                </div>
                            </div>

                            {bulkErrors.length > 0 && (
                                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30">
                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Failed Sync Log ({bulkErrors.length})</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                        {bulkErrors.map((err, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-[10px] p-3 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-rose-100/50">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">{err.staffName}</span>
                                                <span className="text-rose-500 font-bold ml-4 text-right uppercase tracking-tight">{err.errorMessage}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center pt-2">
                                <Button onClick={() => { onClose(); resetModal(); }} className="bg-indigo-600 px-10 py-6 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20">
                                    Close & Refresh
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-10 space-y-6"
                        >
                            <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <X className="h-10 w-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">System Halted</h3>
                                <p className="text-sm text-gray-500 font-medium">A critical error occurred during the import process.</p>
                            </div>
                            <Button variant="outline" onClick={() => setStatus("idle")} className="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]">Retry Upload</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
}

