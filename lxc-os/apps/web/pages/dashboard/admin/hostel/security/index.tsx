import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { ShieldCheck, UserPlus, LogOut, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HostelSecurityPage() {
    const [visitors, setVisitors] = useState([
        { id: 1, name: "Rajesh Kumar", purpose: "Parent Visit", student: "Rahul Kumar", timeIn: "10:00 AM", timeOut: "-", status: "ACTIVE" },
        { id: 2, name: "Pizza Delivery", purpose: "Delivery", student: "Amit Singh", timeIn: "12:15 PM", timeOut: "12:25 PM", status: "COMPLETED" },
    ]);

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Security & Gate Management</h1>
                        <p className="text-gray-500">Visitor logs and student movements</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="w-4 h-4 mr-2" /> New Visitor Entry
                    </Button>
                </div>

                <Tabs defaultValue="visitors">
                    <TabsList>
                        <TabsTrigger value="visitors">Visitor Log</TabsTrigger>
                        <TabsTrigger value="gatepass">Gate Pass Requests</TabsTrigger>
                        <TabsTrigger value="staff">Security Staff</TabsTrigger>
                    </TabsList>

                    <TabsContent value="visitors" className="space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input placeholder="Search visitor..." className="pl-9 bg-white" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Visitor Name</th>
                                        <th className="px-6 py-4 font-medium">Purpose</th>
                                        <th className="px-6 py-4 font-medium">Student</th>
                                        <th className="px-6 py-4 font-medium">Time In</th>
                                        <th className="px-6 py-4 font-medium">Time Out</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visitors.map((v) => (
                                        <tr key={v.id}>
                                            <td className="px-6 py-4 font-medium">{v.name}</td>
                                            <td className="px-6 py-4">{v.purpose}</td>
                                            <td className="px-6 py-4 text-blue-600">{v.student}</td>
                                            <td className="px-6 py-4">{v.timeIn}</td>
                                            <td className="px-6 py-4 text-gray-500">{v.timeOut}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={v.status === 'ACTIVE' ? 'solid' : 'soft'} className={v.status === 'ACTIVE' ? 'bg-green-600' : ''}>
                                                    {v.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {v.status === 'ACTIVE' && <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Mark Exit</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="gatepass">
                        <Card><CardContent className="p-8 text-center text-gray-500">Gate pass requests (Coming Soon)</CardContent></Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
