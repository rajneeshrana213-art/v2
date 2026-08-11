import React from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HostelComplaintsPage() {
    const complaints = [
        { id: 1, type: "Maintenance", title: "Fan not working in Room 101", student: "Rahul Kumar", date: "2024-02-01", status: "OPEN", priority: "HIGH" },
        { id: 2, type: "Food", title: "Dinner quality was poor", student: "Amit Singh", date: "2024-01-30", status: "RESOLVED", priority: "MEDIUM" },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Complaints & Issues</h1>

                <div className="grid gap-4">
                    {complaints.map((c) => (
                        <div key={c.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${c.status === 'OPEN' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {c.status === 'OPEN' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                        <Badge variant="outline">{c.type}</Badge>
                                        <span>• {c.student}</span>
                                        <span>• {c.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {c.status === 'OPEN' ? <Button size="sm">Resolve</Button> : <Button size="sm" variant="ghost" disabled>Reserved</Button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
