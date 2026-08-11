import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Building2, Users, BedDouble, CalendarCheck,
    Wallet, ShieldCheck, FileText, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function HostelDashboard() {
    const [stats, setStats] = useState({
        totalHostels: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        pendingRequests: 0,
    });

    // Mock data fetching or real API call here
    useEffect(() => {
        // fetch("/api/v1/hostel/stats")...
        setStats({
            totalHostels: 3,
            totalBeds: 450,
            occupiedBeds: 312,
            pendingRequests: 18,
        });
    }, []);

    const features = [
        { name: "Infrastructure", icon: Building2, href: "/dashboard/admin/hostel/infrastructure", color: "text-blue-500", bg: "bg-blue-100" },
        { name: "Allocations", icon: BedDouble, href: "/dashboard/admin/hostel/allocations", color: "text-green-500", bg: "bg-green-100" },
        { name: "Students", icon: Users, href: "/dashboard/admin/hostel/students", color: "text-purple-500", bg: "bg-purple-100" },
        { name: "Attendance", icon: CalendarCheck, href: "/dashboard/admin/hostel/attendance", color: "text-orange-500", bg: "bg-orange-100" },
        { name: "Fee & Billing", icon: Wallet, href: "/dashboard/admin/hostel/fees", color: "text-emerald-500", bg: "bg-emerald-100" },
        { name: "Security", icon: ShieldCheck, href: "/dashboard/admin/hostel/security", color: "text-red-500", bg: "bg-red-100" },
        { name: "Complaints", icon: AlertTriangle, href: "/dashboard/admin/hostel/complaints", color: "text-yellow-500", bg: "bg-yellow-100" },
        { name: "Reports", icon: FileText, href: "/dashboard/admin/hostel/reports", color: "text-indigo-500", bg: "bg-indigo-100" },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Hostel Management System
                    </h1>
                    <Link href="/dashboard/admin/hostel/settings" className={buttonVariants({ variant: "outline" })}>Settings</Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Hostels" value={stats.totalHostels} icon={Building2} />
                    <StatsCard title="Total Capacity" value={stats.totalBeds} icon={BedDouble} subtext="Beds" />
                    <StatsCard title="Occupancy" value={`${Math.round((stats.occupiedBeds / stats.totalBeds) * 100 || 0)}%`} icon={Users} subtext={`${stats.occupiedBeds} occupied`} />
                    <StatsCard title="Pending Requests" value={stats.pendingRequests} icon={FileText} alert={stats.pendingRequests > 0} />
                </div>

                {/* Feature Grid */}
                <h2 className="text-xl font-semibold text-gray-800 mt-4">Modules</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <Link key={feature.name} href={feature.href} className="group">
                            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-200 hover:border-blue-300 cursor-pointer">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                                    <div className={`p-4 rounded-2xl ${feature.bg} group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 text-center">
                                        {feature.name}
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatsCard({ title, value, icon: Icon, subtext, alert }: any) {
    return (
        <Card className={`border-l-4 ${alert ? "border-l-red-500" : "border-l-blue-500"} shadow-sm`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="flex items-baseline space-x-2">
                        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                        {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
                    </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-400" />
                </div>
            </CardContent>
        </Card>
    );
}
