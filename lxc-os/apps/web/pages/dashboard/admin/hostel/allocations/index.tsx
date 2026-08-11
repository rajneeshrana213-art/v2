import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    BedDouble, Plus, Search, Filter,
    CheckCircle, Clock, AlertCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AllocationsPage() {
    const [allocations, setAllocations] = useState<any[]>([]); // Mock for now
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setAllocations([
            {
                id: "1",
                student: { name: "Rahul Kumar", class: "X-A", img: "" },
                hostel: "Boys Hostel A",
                room: "101",
                bed: "A",
                status: "ACTIVE",
                startDate: "2024-01-01"
            },
            {
                id: "2",
                student: { name: "Amit Singh", class: "XI-B", img: "" },
                hostel: "Boys Hostel A",
                room: "102",
                bed: "B",
                status: "PENDING",
                startDate: "2024-02-01"
            }
        ]);
        setLoading(false);
    }, []);

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Room Allocations</h1>
                        <p className="text-gray-500">Manage student boarding and room assignments</p>
                    </div>
                    <Link href="/dashboard/admin/hostel/allocations/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> New Allocation
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search students..." className="pl-9" />
                    </div>
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                </div>

                {/* Allocation List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Hostel / Room</th>
                                <th className="px-6 py-4 font-medium">Bed</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allocations.map((alloc) => (
                                <tr key={alloc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={alloc.student.img} alt={alloc.student.name} />
                                                <AvatarFallback>{alloc.student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">{alloc.student.name}</p>
                                                <p className="text-xs text-gray-400">{alloc.student.class}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{alloc.hostel}</p>
                                        <p className="text-xs text-gray-400">Room {alloc.room}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline">{alloc.bed}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={alloc.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {alloc.startDate}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        ACTIVE: { color: "text-green-600", bg: "bg-green-100", icon: CheckCircle },
        PENDING: { color: "text-orange-600", bg: "bg-orange-100", icon: Clock },
        LEFT: { color: "text-gray-600", bg: "bg-gray-100", icon: XCircle },
    };
    const s = styles[status] || styles.PENDING;
    const Icon = s.icon;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {status}
        </span>
    )
}
