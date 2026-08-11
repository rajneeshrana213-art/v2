import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Wallet, TrendingUp, TrendingDown, FileText,
    Search, Filter, Plus, Download, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function HostelFeesPage() {
    const [fees, setFees] = useState([
        { id: 1, student: "Rahul Kumar", type: "Hostel Fee", amount: 25000, status: "PAID", date: "2024-01-15" },
        { id: 2, student: "Amit Singh", type: "Mess Fee", amount: 4500, status: "PENDING", date: "2024-02-01" },
        { id: 3, student: "Sneha Gupta", type: "Utility Charge", amount: 500, status: "OVERDUE", date: "2023-12-20" },
    ]);

    return (
        <DashboardLayout role="admin">
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Fee & Billing</h1>
                        <p className="text-gray-500">Manage hostel fees, invoices, and payments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Create Invoice
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Collections</CardTitle>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹12,45,000</div>
                            <p className="text-xs text-gray-500">+15% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending Dues</CardTitle>
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹3,20,000</div>
                            <p className="text-xs text-gray-500">45 Students remaining</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Upcoming Invoices</CardTitle>
                            <FileText className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹8,50,000</div>
                            <p className="text-xs text-gray-500">Due next week</p>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="Search student or invoice..." className="pl-9" />
                        </div>
                        <Button variant="ghost" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Fee Type</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{fee.student}</td>
                                    <td className="px-6 py-4">{fee.type}</td>
                                    <td className="px-6 py-4">₹{fee.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500">{fee.date}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={fee.status === 'PAID' ? 'outline' : fee.status === 'PENDING' ? 'soft' : 'solid'}
                                            tone={fee.status === 'OVERDUE' ? 'danger' : 'success'}
                                            className={fee.status === 'PAID' ? 'text-green-600 bg-green-50 border-green-200' : ''}>
                                            {fee.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Invoice</DropdownMenuItem>
                                                <DropdownMenuItem>Record Payment</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
