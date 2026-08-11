import React, { useState, useRef } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useAuth } from "@/lib/context/AuthContext";
import { Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowLeft, Info } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ImportResult {
    success: boolean;
    imported: number;
    errors: Array<{ row: number; reason: string }>;
}

type TabType = "accounts" | "fee-plans" | "balances";

export default function DataImportPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("accounts");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile);
                setResult(null);
            } else {
                alert("Please upload a valid .CSV or .XLSX file.");
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const downloadTemplate = () => {
        window.location.href = `/api/v1/finance/import/template/${activeTab}`;
    };

    const handleUpload = async () => {
        if (!file || !user) return;
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("schoolId", user.schoolId);
        formData.append("userId", user.id);
        if (user.academicYearId) {
            formData.append("academicYearId", user.academicYearId);
        }

        try {
            const response = await fetch(`/api/v1/finance/import/${activeTab}`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                imported: 0,
                errors: [{ row: 0, reason: "Network error or server unavailable." }],
            });
        } finally {
            setLoading(false);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const formatTabClass = (tab: TabType) => {
        const isActive = activeTab === tab;
        return cn(
            "flex-1 md:flex-none flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-300",
            isActive
                ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-[0_4px_12px_rgba(79,70,229,0.15)] scale-105 border border-indigo-100 dark:border-indigo-500/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400"
        );
    };

    const tabContent: Record<TabType, { title: string; desc: string; detail: string }> = {
        "accounts": {
            title: "Chart of Accounts",
            desc: "Import custom Accounts Data (Income, Expense, Liabilities).",
            detail: "Define your entire ledger blueprint in one go. Ensure Account Codes are unique for the active academic year to prevent conflicts.",
        },
        "fee-plans": {
            title: "Student Fee Plans",
            desc: "Bulk assign existing Fee Structures.",
            detail: "Mass assign fee structures to active students accurately using their Admission Numbers. Each student should ideally map to exactly one active structure.",
        },
        "balances": {
            title: "Opening Balances",
            desc: "Inject arrears or pending dues histories.",
            detail: "Seamlessly import outstanding obligations carried over from prior years. This creates exact Demand Ledger nodes matching your accounting snapshot.",
        }
    };

    return (
        <>
            <Head>
                <title>Data Import - Finance | Admin</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

                    {/* Header Section */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"></div>

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <Link
                                    href="/dashboard/admin/finance"
                                    className="mb-4 inline-flex items-center space-x-2 text-sm font-medium text-indigo-200 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Finance Dashboard</span>
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 shadow-inner border border-indigo-400/30">
                                        <FileSpreadsheet className="h-6 w-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Bulk Data Import</h1>
                                        <p className="mt-1 text-indigo-200/80">Batch initialize records into your financial ledger using CSV or Excel payloads.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Sidebar / Tabs Container */}
                        <div className="xl:col-span-1">
                            <div className="sticky top-6 flex flex-col space-y-2 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200 dark:ring-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab("accounts"); setFile(null); setResult(null); }}
                                    className={formatTabClass("accounts")}
                                >
                                    <span className="text-sm">Chart of Accounts</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab("fee-plans"); setFile(null); setResult(null); }}
                                    className={formatTabClass("fee-plans")}
                                >
                                    <span className="text-sm">Student Fee Plans</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab("balances"); setFile(null); setResult(null); }}
                                    className={formatTabClass("balances")}
                                >
                                    <span className="text-sm">Opening Balances</span>
                                </button>
                            </div>

                            <div className="mt-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 p-5 border border-indigo-100 dark:border-indigo-500/20 hidden xl:block">
                                <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300 mb-2">
                                    <Info className="h-4 w-4 shrink-0" />
                                    <h4 className="font-semibold text-sm">Need Help?</h4>
                                </div>
                                <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                                    Always download the template first before attempting an upload. The column headers are strictly validated. Extra columns are permitted but will be ignored. Includes Excel support!
                                </p>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="xl:col-span-3">
                            <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200 dark:ring-slate-800 h-full flex flex-col transition-all duration-300">

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{tabContent[activeTab].title}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">{tabContent[activeTab].desc}</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xl mt-2 leading-relaxed">{tabContent[activeTab].detail}</p>
                                    </div>

                                    <button
                                        onClick={downloadTemplate}
                                        className="group flex flex-none items-center space-x-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 transition-all hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                    >
                                        <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                                        <span>Download Excel Template</span>
                                    </button>
                                </div>

                                {/* Dropzone */}
                                <div
                                    className={cn(
                                        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50/50 dark:bg-slate-800/50 p-12 text-center transition-all duration-300 cursor-pointer",
                                        isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]" : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800",
                                        file !== null && "border-indigo-300 dark:border-indigo-500/50 bg-white dark:bg-slate-900"
                                    )}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        accept=".csv, .xlsx, .xls"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {file ? (
                                        <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                                                <FileSpreadsheet className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{file.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:underline px-2 py-1"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pointer-events-none flex flex-col items-center space-y-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                                    <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pointer-events-auto">Click to browse</span> or drag & drop
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Securely upload a .CSV or .XLSX dataset</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-end flex-1 items-end">
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || loading}
                                        className="relative flex items-center space-x-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/20 transition-all hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader size="sm" variant="white" />
                                                <span>Processing payload...</span>
                                            </>
                                        ) : (
                                            <span>Start Validating & Import</span>
                                        )}
                                    </button>
                                </div>

                            </div>

                            {/* Status Results */}
                            {result && (
                                <div className={cn(
                                    "mt-6 rounded-3xl p-6 shadow-sm border animate-in slide-in-from-top-4 duration-500",
                                    result.success ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50/80 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                )}>
                                    <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                        <div className={cn(
                                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner border",
                                            result.success ? "bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-rose-100/50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                        )}>
                                            {result.success ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className={cn("text-lg font-bold tracking-tight", result.success ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100')}>
                                                    {result.success ? 'Dataset Successfully Processed' : 'Import Partially Completed or Encountered Errors'}
                                                </h3>
                                                <p className={cn("mt-1 text-sm font-medium", result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
                                                    Commited <span className="font-bold px-1.5 py-0.5 bg-white/40 dark:bg-black/20 rounded">{result.imported}</span> authentic records to the database.
                                                </p>
                                            </div>

                                            {result.errors.length > 0 && (
                                                <div className="rounded-2xl border border-rose-200/60 dark:border-rose-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-sm">
                                                    <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/30 px-4 py-3">
                                                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">System Trace Log</h4>
                                                        <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                                                            {result.errors.length} Issue{result.errors.length > 1 ? 's' : ''} detected
                                                        </span>
                                                    </div>
                                                    <ul className="divide-y divide-rose-100/50 dark:divide-rose-800/30 max-h-72 overflow-y-auto w-full">
                                                        {result.errors.map((err, idx) => (
                                                            <li key={idx} className="flex gap-4 p-4 hover:bg-rose-50/30 dark:hover:bg-rose-900/20 transition-colors">
                                                                <span className="flex-none rounded-md bg-rose-100/80 dark:bg-rose-900/50 px-2 py-1 text-xs font-mono font-bold text-rose-700 dark:text-rose-400 mt-0.5 border border-rose-200/50 dark:border-rose-800/50 h-max">
                                                                    L{err.row}
                                                                </span>
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{err.reason}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
