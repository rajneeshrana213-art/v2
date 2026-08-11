import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Plus, Search, Trash2, GraduationCap, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function LibraryMembers() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('Class');
    const [classes, setClasses] = useState<any[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<any>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const classParam = classFilter !== 'Class' ? `&classId=${classFilter}` : '';
            const searchParam = searchQuery ? `&search=${searchQuery}` : '';
            const res = await fetch(`/api/v1/library/members?${classParam}${searchParam}`);
            const data = await res.json();
            if (Array.isArray(data)) setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [classFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMembers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetch('/api/v1/library/classes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setClasses(data);
            })
            .catch(console.error);
    }, []);

    const handleDelete = async () => {
        if (!memberToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/v1/library/members?id=${memberToDelete.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
                setDeleteModalOpen(false);
                toast.success("Member removed successfully");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to remove member");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error removing member");
        } finally {
            setIsDeleting(false);
            setMemberToDelete(null);
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            key: "user", header: "Member", render: (v, row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.user?.profilePic} alt={row.user?.name ?? ""} />
                        <AvatarFallback>{row.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{row.user?.name}</p>
                        <p className="text-xs text-slate-500">{row.user?.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: "id", header: "Member ID", render: (v, row) => (
                <span className="text-xs font-mono text-slate-500">
                    {row.user?.student?.admissionNo || row.user?.teacher?.employeeCode || v}
                </span>
            )
        },
        {
            key: "memberType", header: "Type", render: (v, row) => (
                <div className="space-y-1">
                    <Badge variant="outline">{v}</Badge>
                </div>
            )
        },
        {
            key: "status", header: "Status", render: (v) => (
                <Badge className={v === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'}>
                    {v}
                </Badge>
            )
        },
        {
            key: "loans", header: "Active Loans", render: (v, row) => (
                <span className="font-medium">{row._count?.transactions || 0}</span>
            )
        },
        {
            key: "fines", header: "Pending Fines", render: (v, row) => (
                row._count?.fineLedger > 0 ? (
                    <span className="text-red-500 font-bold">{row._count.fineLedger} Unpaid</span>
                ) : (
                    <span className="text-slate-400">None</span>
                )
            )
        },
        { key: "joined", header: "Joined", render: (v, row) => new Date(row.joinedAt).toLocaleDateString() },
        {
            key: "actions", header: "Actions", render: (_, row) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        setMemberToDelete(row);
                        setDeleteModalOpen(true);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Library Members | LearnXChain</title>
                </Head>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Members</h1>
                        <p className="text-slate-500 dark:text-slate-400">View and manage library membership.</p>
                    </div>
                    <Link href="/dashboard/admin/library/members/add">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" />
                            Add Member
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={classFilter} onValueChange={setClassFilter}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                    <SelectValue placeholder="Class">
                                        {classFilter === 'Class' ? 'All Classes' : classes.find(c => c.id === classFilter)?.name}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Class">All Classes</SelectItem>
                                {classes.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(searchQuery || classFilter !== 'Class') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSearchQuery('');
                                    setClassFilter('Class');
                                }}
                                className="text-slate-500"
                            >
                                <FilterX className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Member Directory</CardTitle>
                        <CardDescription>Total {members.length} registered members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={members}
                            loading={loading}
                            emptyState="No members found."
                        />
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Library Member</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove <strong>{memberToDelete?.user?.name}</strong> from the library? This will delete their library membership and all related records.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <Loader size="sm" variant="white" /> : "Remove Member"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
