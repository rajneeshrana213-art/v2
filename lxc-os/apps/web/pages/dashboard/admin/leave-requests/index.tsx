
import { useEffect, useState } from "react";
import Head from "next/head";
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
import { ClipboardList, Search, MoreVertical, CheckCircle2, XCircle, Calendar, User as UserIcon, Clock, FileText, Filter } from 'lucide-react';
import client from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/forms/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/feedback/Loader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";

interface LeaveRequest {
    id: string;
    reason: string;
    fromDate: string;
    toDate: string;
    status: string;
    isApproved: string;
    adminNote: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        role: string;
        email: string;
        profilePic: string | null;
    };
    approver: {
        name: string;
    } | null;
}

export default function LeaveRequestsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ staffCount: 0, studentCount: 0 });
    const [activeTab, setActiveTab] = useState<string>("student");
    const [search, setSearch] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchCounts();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await client.get(`/v1/dashboard/admin/management/leave-requests?type=${activeTab}`);
            setRequests(response.data);
        } catch (error: any) {
            toast.error("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const response = await client.get("/v1/dashboard/admin/management/leave-requests?type=counts");
            setCounts(response.data);
        } catch (error) {
            console.error("Failed to fetch pending counts");
        }
    };

    const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedRequest) return;
        try {
            setIsActionSubmitting(true);
            await client.put("/v1/dashboard/admin/management/leave-requests", {
                id: selectedRequest.id,
                status,
                note: adminNote
            });
            toast.success(`Request ${status.toLowerCase()} successfully`);
            setIsDialogOpen(false);
            fetchRequests();
            fetchCounts();
            setAdminNote("");
        } catch (error: any) {
            toast.error("Failed to update request status");
        } finally {
            setIsActionSubmitting(false);
        }
    };

    const columns: ColumnDef<LeaveRequest>[] = [
        {
            key: "user",
            header: "User",
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-inner">
                        {row.user.profilePic ? (
                            <img src={row.user.profilePic} alt="" className="h-full w-full object-cover" />
                        ) : (
                            row.user.name.charAt(0)
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{row.user.name}</span>
                        <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">{row.user.role}</span>
                    </div>
                </div>
            )
        },
        {
            key: "reason",
            header: "Leave Details",
            render: (reason) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Badge tone="accent" variant="soft" className="text-[9px] font-black tracking-widest uppercase">
                            LEAVE
                        </Badge>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[200px]">{reason}</span>
                    </div>
                </div>
            )
        },
        {
            key: "fromDate",
            header: "Duration",
            render: (_, row) => {
                const start = row.fromDate ? new Date(row.fromDate) : null;
                const end = row.toDate ? new Date(row.toDate) : null;
                const created = row.createdAt ? new Date(row.createdAt) : null;

                const isValidStart = start && !isNaN(start.getTime());
                const isValidEnd = end && !isNaN(end.getTime());
                const isValidCreated = created && !isNaN(created.getTime());

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3 text-indigo-400" />
                            {isValidStart ? format(start, "MMM dd") : "N/A"} - {isValidEnd ? format(end, "MMM dd, yyyy") : "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <Clock className="h-3 w-3" />
                            Applied: {isValidCreated ? format(created, "MMM dd") : "N/A"}
                        </div>
                    </div>
                );
            }
        },
        {
            key: "isApproved",
            header: "Status",
            render: (status) => {
                const tone = status === 'APPROVED' ? 'success' : (status === 'REJECTED' ? 'danger' : 'warning');
                return (
                    <Badge tone={tone} variant="soft" className="font-black uppercase tracking-widest py-1 px-3">
                        {status}
                    </Badge>
                );
            }
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => {
                            setSelectedRequest(row);
                            setIsDialogOpen(true);
                        }}>
                            <FileText className="h-4 w-4 mr-2" /> View & Review
                        </DropdownMenuItem>
                        {row.isApproved === 'PENDING' && (
                            <>
                                <DropdownMenuItem className="text-emerald-600" onClick={() => {
                                    setSelectedRequest(row);
                                    handleAction('APPROVED');
                                }}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Quick Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-rose-600" onClick={() => {
                                    setSelectedRequest(row);
                                    setIsDialogOpen(true);
                                }}>
                                    <XCircle className="h-4 w-4 mr-2" /> Quick Reject
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const filteredRequests = requests.filter(r =>
        r.user.name.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <Head>
                <title>Leave Management | Admin Dashboard</title>
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Leave Requests
                            </h1>
                            <p className="text-sm text-gray-500 font-medium tracking-tight">Review and process leave applications from staff and students</p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <TabsList className="bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 h-14 w-fit">
                            <TabsTrigger value="student" className="rounded-xl px-8 font-extrabold text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg h-full transition-all">
                                Student Leaves
                                {counts.studentCount > 0 && (
                                    <span className="ml-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-rose-500/20">
                                        {counts.studentCount}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="rounded-xl px-8 font-extrabold text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg h-full transition-all">
                                Staff Leaves
                                {counts.staffCount > 0 && (
                                    <span className="ml-2 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-rose-500/20">
                                        {counts.staffCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search applications..."
                                className="pl-9 h-12 bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl border-none shadow-inner"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="mt-6 border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-0">
                            <DataTable
                                columns={columns}
                                data={filteredRequests}
                                loading={loading}
                                className="border-none shadow-none rounded-none"
                                emptyState={
                                    <div className="py-24 flex flex-col items-center gap-4">
                                        <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-900 dark:text-white font-bold text-lg">All Caught Up!</p>
                                            <p className="text-gray-500 text-sm">No pending leave requests found for {activeTab === 'staff' ? 'faculty' : 'students'}.</p>
                                        </div>
                                    </div>
                                }
                            />
                        </CardContent>
                    </Card>
                </Tabs>
            </div>

            {/* Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedRequest(null);
            }}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedRequest && (
                        <div className="flex flex-col">
                            <div className="bg-indigo-600 p-8 text-white relative h-40 flex items-end">
                                <div className="absolute top-8 left-8 flex items-center gap-3">
                                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Review Leave</h3>
                                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">General Leave</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 bg-white dark:bg-gray-950">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Applicant</label>
                                            <div className="flex items-center gap-3 mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600">
                                                    {selectedRequest.user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{selectedRequest.user.name}</span>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selectedRequest.user.role}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                                            <div className="flex items-center gap-3 mt-1 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                                <Calendar className="h-5 w-5 text-indigo-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {format(new Date(selectedRequest.fromDate), "MMM dd")} - {format(new Date(selectedRequest.toDate), "MMM dd")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                                        Total: {differenceInDays(new Date(selectedRequest.toDate), new Date(selectedRequest.fromDate)) + 1} Days
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</label>
                                        <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl h-full border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs text-gray-500 leading-relaxed italic">"{selectedRequest.reason || "No reason provided"}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Administrative Note</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="w-full min-h-[100px] p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-400"
                                        placeholder="Add a reason for approval/rejection or internal notes..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button
                                        className="flex-1 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-100 dark:border-rose-900/30 font-black uppercase tracking-widest text-[11px]"
                                        onClick={() => handleAction('REJECTED')}
                                        disabled={isActionSubmitting}
                                    >
                                        {isActionSubmitting ? <Loader size="sm" variant="primary" /> : <><XCircle className="h-5 w-5 mr-3" /> Reject Application</>}
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 font-black uppercase tracking-widest text-[11px]"
                                        onClick={() => handleAction('APPROVED')}
                                        disabled={isActionSubmitting}
                                    >
                                        {isActionSubmitting ? <Loader size="sm" variant="white" /> : <><CheckCircle2 className="h-5 w-5 mr-3" /> Approve Leave</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );

    function differenceInDays(d1: Date, d2: Date) {
        const diffTime = Math.abs(d1.getTime() - d2.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
}
