import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/label";
import { Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function LibraryConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [libraryId, setLibraryId] = useState<string | null>(null);
    const [config, setConfig] = useState({
        maxBooksStudent: 5,
        maxBooksTeacher: 10,
        issueDaysStudent: 14,
        issueDaysTeacher: 30,
        finePerDay: 5,
        fineGracePeriod: 1,
        lostBookPenalty: 50
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const libRes = await fetch('/api/v1/library/get-my-library');
            const libData = await libRes.json();

            if (libData.id) {
                setLibraryId(libData.id);
                const res = await fetch(`/api/v1/library/config?libraryId=${libData.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setConfig(prev => ({ ...prev, ...data }));
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch policy", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!libraryId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/library/config?libraryId=${libraryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!res.ok) throw new Error("Failed to save");
            toast.success("Policy updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update policy.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setConfig(prev => ({ ...prev, [key]: num }));
        }
    };

    if (loading) return (
        <DashboardLayout role="admin">
            <div className="flex h-[400px] items-center justify-center">
                <Loader size="xl" variant="primary" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6 max-w-4xl">
                <Head>
                    <title>Library Settings | LearnXChain</title>
                </Head>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configuration</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage borrowing rules and fines.</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {saving ? <Loader size="sm" variant="white" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Student Policy</CardTitle>
                            <CardDescription>Rules applied to student members.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Max Books Allowed per Student</Label>
                                    <Input
                                        type="number"
                                        value={config.maxBooksStudent}
                                        onChange={e => handleChange('maxBooksStudent', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Maximum copies a student can hold at once.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Loan Duration (Days)</Label>
                                    <Input
                                        type="number"
                                        value={config.issueDaysStudent}
                                        onChange={e => handleChange('issueDaysStudent', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Number of days before a book becomes overdue.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Faculty Policy</CardTitle>
                            <CardDescription>Rules applied to teacher members.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Max Books Allowed per Teacher</Label>
                                    <Input
                                        type="number"
                                        value={config.maxBooksTeacher}
                                        onChange={e => handleChange('maxBooksTeacher', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Loan Duration (Days)</Label>
                                    <Input
                                        type="number"
                                        value={config.issueDaysTeacher}
                                        onChange={e => handleChange('issueDaysTeacher', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Fines & Penalties</CardTitle>
                            <CardDescription>System-wide penalty configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Fine Per Day (₹)</Label>
                                    <Input
                                        type="number"
                                        value={config.finePerDay}
                                        onChange={e => handleChange('finePerDay', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Applied daily after grace period.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Grace Period (Days)</Label>
                                    <Input
                                        type="number"
                                        value={config.fineGracePeriod}
                                        onChange={e => handleChange('fineGracePeriod', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Extra days before fine starts.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Lost Book Penalty (Multiplier)</Label>
                                    <Input
                                        type="number"
                                        value={config.lostBookPenalty}
                                        onChange={e => handleChange('lostBookPenalty', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">Multiplier of book cost.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
