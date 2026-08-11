import React from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HostelReportsPage() {
    const data = [
        { name: 'Hostel A', occupied: 80, capacity: 100 },
        { name: 'Hostel B', occupied: 45, capacity: 60 },
        { name: 'Hostel C', occupied: 90, capacity: 100 },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Hostel Reports</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Occupancy Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
                                    <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    {/* More charts... */}
                </div>
            </div>
        </DashboardLayout>
    );
}
