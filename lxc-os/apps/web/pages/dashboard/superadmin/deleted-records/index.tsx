import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Loader } from "@/components/ui/feedback/Loader";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Trash2, RotateCcw, X, Filter, Link2 } from "lucide-react";

interface DeletedRecord {
    id: string;
    model: string;
    isDeleted: boolean;
    deletedAt: string;
    deletedBy?: string;
    data: Record<string, any>;
    resolvedNames: Record<string, string>; // fieldName → human-readable name
}

const MODEL_COLORS: Record<string, string> = {
    User: "bg-blue-50 text-blue-700 ring-blue-100",
    School: "bg-purple-50 text-purple-700 ring-purple-100",
    Student: "bg-green-50 text-green-700 ring-green-100",
    Teacher: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    Parent: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    Employee: "bg-orange-50 text-orange-700 ring-orange-100",
    Department: "bg-teal-50 text-teal-700 ring-teal-100",
    SchoolGroup: "bg-pink-50 text-pink-700 ring-pink-100",
};

function formatModelName(model: string): string {
    return model.replace(/([A-Z])/g, " $1").trim();
}

function getModelColor(model: string): string {
    return MODEL_COLORS[model] || "bg-gray-50 text-gray-700 ring-gray-100";
}

function formatKey(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .replace(/_/g, " ")
        .replace(/\bId\b/, "")
        .trim();
}

function isDateString(val: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T/.test(val);
}

function isCuid(val: string): boolean {
    return /^[a-z0-9]{20,}$/.test(val) || /^[a-zA-Z0-9_-]{20,}$/.test(val);
}

function formatDate(val: string): string {
    return new Date(val).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

const SKIP_KEYS = ["isDeleted", "deletedAt", "deletedBy", "password", "passwordHash", "__v"];
const PREVIEW_PRIORITY = ["name", "schoolName", "title", "busNumber", "routeName", "email", "phone", "code", "userName"];

function getPreviewText(data: Record<string, any>, resolvedNames: Record<string, string>): string {
    // Check resolved names first — prefer the school/user name over raw ID
    for (const [field, name] of Object.entries(resolvedNames)) {
        if (field !== "deletedBy" && name) return name;
    }
    for (const key of PREVIEW_PRIORITY) {
        if (data[key] && typeof data[key] === "string" && !data[key].includes("_deleted_")) {
            return data[key];
        }
    }
    const first = Object.entries(data).find(
        ([k, v]) => !SKIP_KEYS.includes(k) && typeof v === "string" && v.length > 0 && v.length < 80 && !isCuid(v) && !isDateString(v)
    );
    return first ? first[1] : data.id || "—";
}

function getSecondaryText(data: Record<string, any>, resolvedNames: Record<string, string>): string | null {
    // If primary came from resolvedNames, show the actual name field (email/phone etc.)
    for (const key of ["email", "phone", "code", "userName"]) {
        if (data[key] && typeof data[key] === "string" && !data[key].includes("_deleted_")) {
            return data[key];
        }
    }
    return null;
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function FieldRow({ fieldKey, value, resolvedName }: { fieldKey: string; value: any; resolvedName?: string }) {
    const label = formatKey(fieldKey);
    const isIdField = fieldKey.endsWith("Id") || fieldKey === "deletedBy";

    let display: React.ReactNode;

    if (value === null || value === undefined) {
        display = <span className="text-gray-400 italic">—</span>;
    } else if (typeof value === "boolean") {
        display = (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${value ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {value ? "Yes" : "No"}
            </span>
        );
    } else if (typeof value === "string" && isDateString(value)) {
        display = <span className="text-gray-800 dark:text-gray-200">{formatDate(value)}</span>;
    } else if (isIdField && resolvedName) {
        display = (
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-800 dark:text-gray-100">{resolvedName}</span>
                <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1">
                    <Link2 size={9} /> {String(value)}
                </span>
            </div>
        );
    } else if (typeof value === "string" && isCuid(value) && !resolvedName) {
        display = (
            <span className="font-mono text-xs text-gray-500 break-all">{value}</span>
        );
    } else if (typeof value === "object") {
        display = (
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 rounded p-2 max-h-24 overflow-auto">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    } else if (typeof value === "string" && value.includes("_deleted_")) {
        display = <span className="text-gray-500">{value.split("_deleted_")[0]} <span className="text-xs text-orange-400">(was modified on delete)</span></span>;
    } else {
        display = <span className="text-gray-800 dark:text-gray-200 break-all">{String(value)}</span>;
    }

    return (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                {label}
            </p>
            <div className="text-sm">{display}</div>
        </div>
    );
}

function RecordDetailModal({
    record,
    open,
    onClose,
    onRestore,
    onDelete,
    isRestoring,
    isDeleting,
}: {
    record: DeletedRecord | null;
    open: boolean;
    onClose: () => void;
    onRestore: (id: string, model: string) => void;
    onDelete: (id: string, model: string) => void;
    isRestoring: boolean;
    isDeleting: boolean;
}) {
    if (!record) return null;

    const displayEntries = Object.entries(record.data).filter(
        ([key]) => !SKIP_KEYS.includes(key)
    );

    // Sort: non-ID, non-cuid fields first; ID fields after; huge object fields last
    const sorted = [...displayEntries].sort(([aKey, aVal], [bKey, bVal]) => {
        const aIsId = aKey.endsWith("Id") || aKey === "deletedBy";
        const bIsId = bKey.endsWith("Id") || bKey === "deletedBy";
        const aIsObj = typeof aVal === "object";
        const bIsObj = typeof bVal === "object";
        if (aIsObj && !bIsObj) return 1;
        if (!aIsObj && bIsObj) return -1;
        if (aIsId && !bIsId) return 1;
        if (!aIsId && bIsId) return -1;
        return 0;
    });

    const primaryName = getPreviewText(record.data, record.resolvedNames);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getModelColor(record.model)}`}>
                                {formatModelName(record.model)}
                            </span>
                            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white truncate">
                                {primaryName}
                            </DialogTitle>
                        </div>
                        <button onClick={onClose} className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-2.5">
                        <span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">Deleted:</span>{" "}
                            {formatDate(record.deletedAt)}
                        </span>
                        {(record.resolvedNames?.deletedBy || record.deletedBy) && (
                            <span>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Deleted by:</span>{" "}
                                {record.resolvedNames?.deletedBy ?? (
                                    <code className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{record.deletedBy}</code>
                                )}
                            </span>
                        )}
                        <span>
                            <span className="font-medium text-gray-600 dark:text-gray-400">ID:</span>{" "}
                            <code className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{record.id}</code>
                        </span>
                    </div>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sorted.map(([key, value]) => (
                        <FieldRow
                            key={key}
                            fieldKey={key}
                            value={value}
                            resolvedName={record.resolvedNames?.[key]}
                        />
                    ))}
                </div>

                <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <Button variant="outline" size="sm" onClick={onClose} className="text-gray-600">
                        Close
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        disabled={isRestoring || isDeleting}
                        onClick={() => onRestore(record.id, record.model)}
                    >
                        <RotateCcw size={13} />
                        {isRestoring ? "Restoring..." : "Restore"}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        disabled={isRestoring || isDeleting}
                        onClick={() => onDelete(record.id, record.model)}
                    >
                        <Trash2 size={13} />
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, limit, loading, onPage }: {
    page: number; totalPages: number; total: number; limit: number; loading: boolean; onPage: (p: number) => void;
}) {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{start}–{end}</span> of{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span> records
            </p>
            <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed" disabled={page === 1 || loading} onClick={() => onPage(page - 1)}>
                    <ChevronLeft size={16} />
                </button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`el-${i}`} className="px-1 text-xs text-gray-400">…</span>
                    ) : (
                        <button key={p} onClick={() => onPage(p as number)} disabled={loading}
                            className={`min-w-[30px] h-7 rounded-md text-xs font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                            {p}
                        </button>
                    )
                )}
                <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed" disabled={page >= totalPages || loading} onClick={() => onPage(page + 1)}>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeletedRecordsPage() {
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);
    const [page, setPage] = useState(1);
    const [filterModel, setFilterModel] = useState("");
    const limit = 20;

    const { data, loading, error, get, post } = useApi<{
        records: DeletedRecord[];
        availableModels: string[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
    }>();

    const [selectedRecord, setSelectedRecord] = useState<DeletedRecord | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const fetchRecords = useCallback(() => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (filterModel) params.set("model", filterModel);
        get(`/v1/superadmin/deleted-records?${params.toString()}`);
    }, [get, page, limit, filterModel]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleRestore = async (id: string, model: string) => {
        setIsRestoring(true);
        try {
            await post("/v1/superadmin/deleted-records/restore", { id, model });
            toast.success("Record restored successfully.");
            setSelectedRecord(null);
            fetchRecords();
        } catch (err) { 
            console.error(err); 
            toast.error("Failed to restore record.");
        }
        finally { setIsRestoring(false); }
    };

    const handlePermanentDelete = async (id: string, model: string) => {
        if (!confirm("Permanently delete this record? This cannot be undone.")) return;
        setIsDeletingId(id);
        try {
            const res = await fetch("/api/v1/superadmin/deleted-records/permanent-delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, model }),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
            toast.success("Record permanently deleted.");
            setSelectedRecord(null);
            fetchRecords();
        } catch (err: any) { 
            toast.error(err.message || "Failed to permanently delete record.");
        }
        finally { setIsDeletingId(null); }
    };

    const handleFilterChange = (model: string) => { setFilterModel(model); setPage(1); };

    return (
        <>
            <Head><title>Deleted Records Manager - LearnXChain</title></Head>
            <DashboardLayout role="superadmin">
                <div className="flex flex-col gap-6 w-full p-4 lg:p-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Deleted Records</h1>
                            <p className="text-sm text-gray-500 mt-0.5">View, restore, or permanently remove soft-deleted records.</p>
                        </div>
                        <button onClick={fetchRecords}
                            className="self-start flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>

                    {/* Model filter chips */}
                    {data?.availableModels && data.availableModels.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter size={13} className="text-gray-400 shrink-0" />
                            <button onClick={() => handleFilterChange("")}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filterModel ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                All
                            </button>
                            {data.availableModels.map((model) => (
                                <button key={model} onClick={() => handleFilterChange(model)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterModel === model ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                    {formatModelName(model)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Table */}
                    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center"><Loader /></div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-500 text-sm">Failed to load records.</div>
                        ) : !data?.records?.length ? (
                            <div className="p-12 text-center">
                                <Trash2 size={36} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm font-medium">No deleted records found</p>
                                <p className="text-gray-400 text-xs mt-1">{filterModel ? `No deleted ${formatModelName(filterModel)} records.` : "All records are active."}</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                            <tr>
                                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</th>
                                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Record</th>
                                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Belongs To</th>
                                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Deleted On</th>
                                                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {data.records.map((record) => {
                                                const primary = getPreviewText(record.data, record.resolvedNames);
                                                const secondary = getSecondaryText(record.data, record.resolvedNames);
                                                const school = record.resolvedNames?.schoolId;
                                                const parentEntity = school || record.resolvedNames?.userId || record.resolvedNames?.groupId || null;

                                                return (
                                                    <tr key={`${record.model}-${record.id}`}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                                                        onClick={() => setSelectedRecord(record)}>
                                                        <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getModelColor(record.model)}`}>
                                                                {formatModelName(record.model)}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 max-w-[220px]">
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{primary}</p>
                                                            {secondary && <p className="text-xs text-gray-400 truncate mt-0.5">{secondary}</p>}
                                                        </td>
                                                        <td className="px-5 py-4 max-w-[160px]">
                                                            {parentEntity ? (
                                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate block">{parentEntity}</span>
                                                            ) : (
                                                                <span className="text-xs text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {mounted ? formatDate(record.deletedAt) : 'Loading...'}
                                                        </td>
                                                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => setSelectedRecord(record)}
                                                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                                                    <Eye size={12} /> View
                                                                </button>
                                                                <button onClick={() => handleRestore(record.id, record.model)} disabled={isRestoring || !!isDeletingId}
                                                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                                                                    <RotateCcw size={12} /> Restore
                                                                </button>
                                                                <button onClick={() => handlePermanentDelete(record.id, record.model)} disabled={isRestoring || !!isDeletingId}
                                                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50">
                                                                    <Trash2 size={12} />
                                                                    {isDeletingId === record.id ? "Deleting..." : "Delete"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {data.pagination && (
                                    <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} limit={limit} loading={loading} onPage={setPage} />
                                )}
                            </>
                        )}
                    </div>
                </div>

                <RecordDetailModal
                    record={selectedRecord}
                    open={!!selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    onRestore={handleRestore}
                    onDelete={handlePermanentDelete}
                    isRestoring={isRestoring}
                    isDeleting={!!isDeletingId}
                />
            </DashboardLayout>
        </>
    );
}
