import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, Download, Search, Filter, ShieldCheck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { toast } from "react-toastify";
import client from "@/lib/api/client";

interface IssuedDocument {
    id: string;
    documentNo: string;
    createdAt: string;
    pdfUrl: string;
    template: {
        name: string;
        type: string;
    };
    targetUser: {
        name: string;
        profilePic: string;
    };
    issuedBy: {
        name: string;
    };
}

export default function HistoryTable({ schoolId }: { schoolId?: string }) {
    const [history, setHistory] = useState<IssuedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchHistory();
    }, [schoolId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = schoolId ? { schoolId } : {};
            const response = await client.get("/v1/dashboard/admin/documents/history", { params });
            setHistory(response.data);
        } catch (err: any) {
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<IssuedDocument>[] = [
        {
            key: "createdAt",
            header: "Date",
            render: (value) => <span className="hidden sm:inline-block">{new Date(value).toLocaleDateString()}</span>,
        },
        {
            key: "documentNo",
            header: "Doc No",
            render: (value) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[10px] md:text-xs text-indigo-600 font-bold tracking-tighter">{value}</span>
                    <span className="text-[10px] text-gray-400 sm:hidden">{history.find(h => h.documentNo === value)?.createdAt && new Date(history.find(h => h.documentNo === value)!.createdAt).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            key: "targetUser",
            header: "Issued To",
            render: (_value, doc) => (
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/5 overflow-hidden shrink-0 shadow-sm relative">
                        {doc.targetUser.profilePic ? (
                            <Image src={doc.targetUser.profilePic} alt={doc.targetUser.name} fill className="object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] uppercase font-bold text-gray-400">
                                {doc.targetUser.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs md:text-sm font-bold truncate dark:text-white">{doc.targetUser.name}</span>
                        <span className="text-[10px] text-gray-500 sm:hidden truncate">{doc.template.name}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "template",
            header: "Document Type",
            render: (_value, doc) => (
                <div className="hidden sm:flex flex-col min-w-0">
                    <span className="text-xs md:text-sm font-bold truncate dark:text-white">{doc.template.name}</span>
                    <Badge variant="outline" className="text-[9px] w-fit h-4 uppercase tracking-tighter mt-1 border-gray-100 dark:border-white/10">
                        {doc.template.type}
                    </Badge>
                </div>
            ),
        },
        {
            key: "issuedBy",
            header: "Issued By",
            render: (value) => <span className="hidden lg:inline-block text-xs text-gray-500 font-medium">{value.name}</span>,
        },
        {
            key: "pdfUrl",
            header: "Actions",
            render: (url, doc) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg md:rounded-xl"
                        onClick={() => window.open(url, '_blank')}
                    >
                        <Download className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:h-10 md:w-10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg md:rounded-xl"
                        onClick={() => window.open(`/verify/${doc.documentNo}`, '_blank')}
                    >
                        <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
            ),
        },
    ];

    const filteredHistory = history.filter(doc =>
        doc.documentNo.toLowerCase().includes(search.toLowerCase()) ||
        doc.targetUser.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.template.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-6 min-h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search logs..."
                        className="pl-9 bg-white dark:bg-slate-900/50 border-gray-100 dark:border-white/5 h-11 rounded-xl"
                        value={search}
                        onChange={(e: any) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 font-bold gap-2 text-[10px] md:text-xs h-10 px-4"
                        onClick={fetchHistory}
                    >
                        <Filter className="h-4 w-4" /> Filter Range
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto [ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
                    <div className="min-w-[800px] md:min-w-full">
                        <DataTable
                            columns={columns}
                            data={filteredHistory}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
