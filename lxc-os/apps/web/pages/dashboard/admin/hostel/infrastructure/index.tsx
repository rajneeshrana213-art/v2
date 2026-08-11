import React, { useState, useEffect } from "react";
import { encodeId } from "@/lib/utils/hashId";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Building2, Plus, Users, Search,
    MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HostelInfrastructureList() {
    const [hostels, setHostels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchHostels = async () => {
        try {
            setLoading(true);
            // This relies on the API we created: /api/v1/hostel?schoolId=...
            // Assuming we can get schoolId from session/context. 
            // For now hardcoding or simulating.
            const res = await fetch("/api/v1/hostel?schoolId=school_id_placeholder");
            const data = await res.json();
            if (data.data) {
                setHostels(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Hostel Infrastructure</h1>
                        <p className="text-gray-500">Manage hostels, buildings, and room inventory</p>
                    </div>
                    <Link href="/dashboard/admin/hostel/infrastructure/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add New Hostel
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search hostels..."
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Add more filters if needed */}
                </div>

                {/* Hostel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hostels.map((hostel) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                    {!loading && hostels.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>No hostels found. Create your first hostel to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function HostelCard({ hostel }: { hostel: any }) {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${hostel.type === 'GIRLS' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{hostel.name}</h3>
                                <Badge variant="soft" className="mt-1 text-xs">
                                    {hostel.type} HOSTEL
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/admin/hostel/${encodeId(hostel.id)}`}>Manage Infrastructure</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{hostel._count?.rooms || 0}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Rooms</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">{hostel.capacity || 0}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Capacity</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{hostel._count?.allocation || 0} Occupied</span>
                        </div>
                        <span className="text-green-600 font-medium">
                            {Math.round(((hostel._count?.allocation || 0) / (hostel.capacity || 1)) * 100)}% Full
                        </span>
                    </div>

                    <Link href={`/dashboard/admin/hostel/${encodeId(hostel.id)}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 w-full bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
                        Manage Infrastructure
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
