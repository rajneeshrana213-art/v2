import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Plus,
    Search,
    MoreVertical,
    School as SchoolIcon,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Settings,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Branch {
    id: string;
    schoolName: string;
    schoolLogo?: string;
    schoolCode?: string;
    isActive: boolean;
    schoolOpening: string;
    schoolClosing: string;
    _count: {
        students: number;
        teachers: number;
    }
}

const BranchManagementPage = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await client.get("/v1/group-admin/branches");
            setBranches(response.data);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await client.patch(`/v1/group-admin/branches/${id}/status`, { isActive: !currentStatus });
            setBranches(branches.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    const filteredBranches = branches.filter(b =>
        b.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.schoolCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="group_admin">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Branch Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">View and manage all school branches in your organization.</p>
                    </div>
                    <Link href="/dashboard/group-admin/branches/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add New Branch
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by school name or code..."
                            className="pl-10 h-10 border-gray-200 dark:border-gray-600 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-10 border-gray-200 dark:border-gray-600">
                        Filter
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : filteredBranches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBranches.map((branch, index) => (
                            <motion.div
                                key={branch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                        {branch.schoolLogo ? (
                                            <img src={branch.schoolLogo} alt={branch.schoolName} className="w-8 h-8 object-contain" />
                                        ) : (
                                            <SchoolIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                                            branch.isActive
                                                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                        )}>
                                            {branch.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {branch.isActive ? "Active" : "Inactive"}
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{branch.schoolName}</h3>
                                        <span className="text-sm text-gray-500 font-mono">CODE: {branch.schoolCode || "N/A"}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">{branch._count.students} Students</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-medium">{branch.schoolOpening} - {branch.schoolClosing}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                            onClick={() => window.location.href = `/dashboard/group-admin/branches/${branch.id}`}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleStatus(branch.id, branch.isActive)}
                                            className={cn(
                                                "text-xs transition-colors",
                                                branch.isActive ? "hover:border-red-200 hover:text-red-600" : "hover:border-green-200 hover:text-green-600"
                                            )}
                                        >
                                            {branch.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <SchoolIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No branches found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your search or add your first school branch.</p>
                        <Link href="/dashboard/group-admin/branches/create">
                            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">Add First Branch</Button>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BranchManagementPage;
