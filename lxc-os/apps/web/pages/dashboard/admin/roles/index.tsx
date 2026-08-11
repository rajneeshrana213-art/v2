import { useEffect, useState } from "react";
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
import { Shield, ShieldCheck, ShieldAlert, UserCog, Search, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import client from "@/lib/api/client";
import { PermissionModal } from "@/components/dashboard/admin/roles/PermissionModal";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/feedback/Loader";

export default function RoleManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/dashboard/admin/roles");
            setUsers(response.data);
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "User",
            render: (value, user) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-2 border-indigo-100 dark:border-indigo-500/10 overflow-hidden bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{user.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-slate-100">{user.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{user.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "role",
            header: "Primary Role",
            render: (role) => (
                <Badge variant="soft" className="capitalize bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20">
                    {role}
                </Badge>
            ),
        },
        {
            key: "employee",
            header: "Employment Detail",
            render: (_, user) => {
                const emp = user.Employee?.[0];
                if (!emp) return <span className="text-slate-500 italic text-xs">No employee record</span>;
                return (
                    <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{emp.designation?.name || "N/A"}</p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500">{emp.department?.name || "N/A"} • {emp.employeeCode}</p>
                    </div>
                );
            }
        },
        {
            key: "permissions",
            header: "Permission Status",
            render: (_, user) => {
                const count = user.userPermissions?.length || 0;
                return (
                    <div className="flex items-center gap-2">
                        {count > 0 ? (
                            <>
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-500">{count} Modules Shared</span>
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="h-3 w-3 text-amber-500" />
                                <span className="text-xs font-medium text-amber-500">Default Permissions</span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: "Actions",
            render: (_, user) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                    onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                    }}
                >
                    <UserCog className="h-3.5 w-3.5" />
                    Manage
                </Button>
            ),
        },
    ];

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Role & Permission Management - LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                <Shield className="h-8 w-8 text-indigo-500" />
                                Role & Permission Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                Delegate module-level permissions to teachers, staff, and other employees.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none w-64 text-gray-900 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading} className="rounded-xl border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg bg-white dark:bg-slate-900">
                                {loading ? <Loader size="sm" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <Card className="border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                        <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-gray-900 dark:text-white">Access Control List</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-slate-400">View and manage permissions for all school staff</CardDescription>
                                </div>
                                <Badge variant="soft" className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/30 font-bold px-3 py-1">
                                    {filteredUsers.length} Sharable Users
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {error ? (
                                <div className="p-12 text-center text-rose-400 font-medium">
                                    <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    {error}
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={filteredUsers}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {selectedUser && (
                    <PermissionModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        user={selectedUser}
                        onSuccess={fetchUsers}
                    />
                )}
            </DashboardLayout>
        </>
    );
}
