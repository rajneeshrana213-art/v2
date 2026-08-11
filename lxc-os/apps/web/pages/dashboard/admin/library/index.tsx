import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, AlertCircle, TrendingUp, Plus, ScanLine, ArrowRight } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";

export default function LibraryDashboard() {
    const [data, setData] = useState<{
        stats: { totalBooks: number, activeMembers: number, currentlyIssued: number, overdueBooks: number },
        transactions: any[]
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [libraryId, setLibraryId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const libRes = await fetch('/api/v1/library/get-my-library');
                const libData = await libRes.json();

                if (libData.id) {
                    setLibraryId(libData.id);
                    const statsRes = await fetch(`/api/v1/library/dashboard/stats?libraryId=${libData.id}`);
                    const statsData = await statsRes.json();
                    setData(statsData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    const stats = [
        { label: "Total Books", value: data?.stats?.totalBooks || 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Active Members", value: data?.stats?.activeMembers || 0, icon: Users, color: "text-green-500", bg: "bg-green-50" },
        { label: "Currently Issued", value: data?.stats?.currentlyIssued || 0, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Overdue Books", value: data?.stats?.overdueBooks || 0, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Library Dashboard | LearnXChain</title>
                </Head>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Library Management</h1>
                        <p className="text-slate-500 dark:text-slate-400">Overview of inventory, circulation, and members.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/admin/library/circulation">
                            <Button variant="outline" className="gap-2">
                                <ScanLine className="h-4 w-4" />
                                Circulation Desk
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/library/books/add">
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="h-4 w-4" />
                                Add Book
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {stat.label}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${stat.bg} dark:bg-slate-800`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {loading ? <Loader size="sm" /> : stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-2 border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Transactions</CardTitle>
                            <Link href="/dashboard/admin/library/circulation">
                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                    View All <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader size="sm" />
                                    </div>
                                ) : (!data?.transactions || data.transactions.length === 0) ? (
                                    <div className="text-center p-8 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed dark:border-slate-800">
                                        No recent transactions.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {data.transactions.map((tx: any) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${tx.status === 'ISSUED' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {tx.bookCopy?.book?.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {tx.status === 'ISSUED' ? 'Issued to' : 'Returned by'} {tx.member?.user?.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline" className="text-[10px] mb-1">
                                                        {tx.status}
                                                    </Badge>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link href="/dashboard/admin/library/books">
                                <Button variant="ghost" className="w-full justify-start text-indigo-600 dark:text-indigo-400">
                                    View Book Inventory
                                </Button>
                            </Link>
                            <Link href="/dashboard/admin/library/members">
                                <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-300">
                                    Manage Members
                                </Button>
                            </Link>
                            <Link href="/dashboard/admin/library/categories">
                                <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-300">
                                    Manage Categories
                                </Button>
                            </Link>
                            <Link href="/dashboard/admin/library/fines">
                                <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400">
                                    Pending Fines
                                </Button>
                            </Link>
                            <Link href="/dashboard/admin/library/config">
                                <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-300">
                                    Library Settings
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
