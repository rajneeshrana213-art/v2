import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react';
import { Loader } from '@/components/ui/feedback/Loader';

export default function FinesManagement() {
    const [fines, setFines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [library, setLibrary] = useState<any>(null);

    useEffect(() => {
        fetch('/api/v1/library/get-my-library')
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setLibrary(data);
                    fetchFines(data.id);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const fetchFines = async (libId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/library/fines?libraryId=${libId}`);
            const data = await res.json();
            if (Array.isArray(data)) setFines(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettleFine = async (fineId: string) => {
        if (!confirm("Confirm payment received?")) return;
        try {
            const res = await fetch(`/api/v1/library/fines?fineId=${fineId}`, { method: 'POST' });
            if (res.ok) {
                if (library?.id) fetchFines(library.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Fines Management | LearnXChain</title>
                </Head>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Fines Management</h1>
                    <p className="text-slate-500">Track and collect overdue fines from members.</p>
                </div>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Pending Fines</CardTitle>
                        <CardDescription>All outstanding dues from library members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12">
                                <Loader size="lg" variant="primary" />
                                <p className="text-slate-400">Loading fine records...</p>
                            </div>
                        ) : fines.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                No pending fines found! Good job.
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto rounded-lg border dark:border-slate-800">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Reason</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-slate-800">
                                        {fines.map(fine => (
                                            <tr key={fine.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900 dark:text-white">{fine.member?.user?.name}</div>
                                                    <div className="text-[10px] text-slate-400">{fine.memberId}</div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {fine.reason}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">
                                                    ₹{fine.amount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-400">
                                                    {new Date(fine.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                                        onClick={() => handleSettleFine(fine.id)}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Settle
                                                    </Button>
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
        </DashboardLayout>
    );
}
