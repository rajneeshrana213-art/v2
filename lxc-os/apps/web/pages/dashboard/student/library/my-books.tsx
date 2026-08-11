import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle, Clock, Wallet, CheckCircle2, IndianRupee } from "lucide-react";
import { useAuth } from '@/lib/context/AuthContext';

export default function MyBooksPage() {
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;

        fetch(`/api/v1/library/members?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setMember(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user?.id]);

    const activeLoans = member?.transactions || [];
    const fines = member?.fineLedger || [];

    return (
        <DashboardLayout role="student">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>My Books | LearnXChain</title>
                </Head>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Library Activity</h1>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                            Member ID: {member?.user?.student?.admissionNo || member?.user?.teacher?.employeeCode || member?.id || '...'}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-none shadow-sm bg-indigo-50/50 dark:bg-indigo-900/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Active Loans</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{activeLoans.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-red-50/50 dark:bg-red-900/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Overdue</p>
                                <p className="text-xl font-bold text-red-600">
                                    {activeLoans.filter((l: any) => new Date(l.dueDate) < new Date()).length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-900/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Total Fines</p>
                                <p className="text-xl font-bold text-emerald-600 flex items-center">
                                    ₹{fines.reduce((acc: number, f: any) => acc + f.amount, 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                Active Loans
                            </CardTitle>
                            <CardDescription>Books you are currently borrowing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 border-b font-medium">Book</th>
                                            <th className="px-4 py-3 border-b font-medium">Due Date</th>
                                            <th className="px-4 py-3 border-b font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeLoans.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 border-b text-center text-slate-500">No active loans.</td>
                                            </tr>
                                        ) : activeLoans.map((tx: any) => (
                                            <tr key={tx.id} className="bg-white dark:bg-slate-950 border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                    {tx.bookCopy?.book?.title || "Unknown Book"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={new Date(tx.dueDate) < new Date() ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}>
                                                        {new Date(tx.dueDate) < new Date() ? "Overdue" : "On Time"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Fines & Dues
                            </CardTitle>
                            <CardDescription>Outstanding payments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fines.length === 0 ? (
                                <div className="text-center py-8 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                                    No pending fines. Great job!
                                </div>
                            ) : (
                                <div className="w-full overflow-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 border-b font-medium">Reason</th>
                                                <th className="px-4 py-3 border-b font-medium text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fines.map((fine: any) => (
                                                <tr key={fine.id} className="bg-white dark:bg-slate-950 border-b">
                                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{fine.reason}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-red-600 border-b">
                                                        ₹{fine.amount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
