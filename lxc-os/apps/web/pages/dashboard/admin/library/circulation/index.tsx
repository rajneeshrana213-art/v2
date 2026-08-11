import React, { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Loader } from '@/components/ui/feedback/Loader';

export default function CirculationDesk() {
    const [loading, setLoading] = useState(false);
    const [issuedBooks, setIssuedBooks] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [library, setLibrary] = useState<any>(null);

    React.useEffect(() => {
        fetch('/api/v1/library/get-my-library')
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setLibrary(data);
                    fetchIssuedBooks(data.id);
                }
            })
            .catch(err => console.error("Error fetching library:", err));
    }, []);

    const fetchIssuedBooks = async (libId: string) => {
        try {
            const res = await fetch(`/api/v1/library/circulation/issued?libraryId=${libId}`);
            const data = await res.json();
            if (Array.isArray(data)) setIssuedBooks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReservations = async (libId: string) => {
        try {
            const res = await fetch(`/api/v1/library/circulation/reservations?libraryId=${libId}`);
            const data = await res.json();
            if (Array.isArray(data)) setReservations(data);
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        if (library?.id) {
            fetchReservations(library.id);
        }
    }, [library?.id]);

    // Issue State
    const [issueData, setIssueData] = useState({ memberId: '', bookCopyId: '' });

    // Return State
    const [returnData, setReturnData] = useState({ barcode: '', transactionId: '' });

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!library?.id) {
            alert("Library not initialized.");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`/api/v1/library/circulation/issue?libraryId=${library.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issueData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            toast.success(`Book Issued! Due: ${new Date(data.dueDate).toLocaleDateString()}`);
            setIssueData({ memberId: '', bookCopyId: '' });
            if (library?.id) fetchIssuedBooks(library.id);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/v1/library/circulation/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(returnData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');

            let msg = "Book Returned successfully.";
            if (data.fineAmount > 0) {
                toast.warning(`Book Returned. FINE APPLICABLE: ₹${data.fineAmount}`);
            } else {
                toast.success(msg);
            }

            setReturnData({ barcode: '', transactionId: '' });
            if (library?.id) fetchIssuedBooks(library.id);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300";

    return (
        <DashboardLayout role="admin">
            <div className="p-4 md:p-6 space-y-6">
                <Head>
                    <title>Circulation Desk | LearnXChain</title>
                </Head>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Circulation Desk</h1>
                    <p className="text-slate-500 dark:text-slate-400">Fast issue and return processing.</p>
                </div>

                <Tabs defaultValue="issue" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-slate-200 bg-transparent p-0 dark:border-slate-800 mb-6 mt-4">
                        <TabsTrigger
                            value="issue"
                            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 focus-visible:ring-0 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none dark:text-slate-400 dark:hover:text-slate-100 dark:data-[state=active]:border-indigo-500 dark:data-[state=active]:text-indigo-500"
                        >
                            Issue Book
                        </TabsTrigger>
                        <TabsTrigger
                            value="return"
                            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 focus-visible:ring-0 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none dark:text-slate-400 dark:hover:text-slate-100 dark:data-[state=active]:border-indigo-500 dark:data-[state=active]:text-indigo-500"
                        >
                            Return Book
                        </TabsTrigger>
                        <TabsTrigger
                            value="reservations"
                            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 focus-visible:ring-0 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none dark:text-slate-400 dark:hover:text-slate-100 dark:data-[state=active]:border-indigo-500 dark:data-[state=active]:text-indigo-500"
                        >
                            Reservations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="issue">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Issue Book</CardTitle>
                                <CardDescription>Assign a book copy to a member.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleIssue} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="memberId" className={labelClass}>Member ID</label>
                                        <Input
                                            id="memberId"
                                            placeholder="Scan Member Card or Enter ID"
                                            value={issueData.memberId}
                                            onChange={e => setIssueData({ ...issueData, memberId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="bookCopyId" className={labelClass}>Book Copy ID (Barcode)</label>
                                        <Input
                                            id="bookCopyId"
                                            placeholder="Scan Book Barcode"
                                            value={issueData.bookCopyId}
                                            onChange={e => setIssueData({ ...issueData, bookCopyId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                                        {loading ? <Loader size="sm" variant="white" /> : "Issue Book"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="return">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Return Book</CardTitle>
                                <CardDescription>Scan book barcode or enter transaction ID.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleReturn} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="barcode" className={labelClass}>Book Barcode</label>
                                        <Input
                                            id="barcode"
                                            placeholder="Scan Book Barcode"
                                            value={returnData.barcode}
                                            onChange={e => setReturnData({ ...returnData, barcode: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="transactionId" className={labelClass}>Transaction ID</label>
                                        <Input
                                            id="transactionId"
                                            placeholder="Enter Transaction ID"
                                            value={returnData.transactionId}
                                            onChange={e => setReturnData({ ...returnData, transactionId: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader size="sm" variant="white" /> : "Process Return"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reservations">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Book Reservations</CardTitle>
                                <CardDescription>View all pending book reservations by students or teachers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-x-auto rounded-lg border dark:border-slate-800">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3">Book</th>
                                                <th className="px-4 py-3">Member</th>
                                                <th className="px-4 py-3">Reserved At</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservations.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No active reservations at the moment.</td>
                                                </tr>
                                            ) : reservations.map(resv => (
                                                <tr key={resv.id} className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{resv.book?.title}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs font-semibold">{resv.member?.user?.name || "Unknown"}</div>
                                                        <div className="text-[10px] text-slate-400">
                                                            {resv.member?.user?.student?.admissionNo || resv.member?.user?.teacher?.employeeCode || resv.memberId}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        {new Date(resv.requestedAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${resv.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                            {resv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                                            onClick={async () => {
                                                                if (confirm(`Approve reservation for ${resv.member?.user?.name || "Member"}? This does not issue the book physically yet.`)) {
                                                                    // We can implement fullfillment/approval logic later
                                                                    alert("Functionality to fulfill/approve reservation coming soon.");
                                                                }
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Currently Issued Books</CardTitle>
                        <CardDescription>Track books that are out with members.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto rounded-lg border dark:border-slate-800">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Book</th>
                                        <th className="px-4 py-3">Barcode</th>
                                        <th className="px-4 py-3">Member</th>
                                        <th className="px-4 py-3">Due Date</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issuedBooks.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No books currently issued.</td>
                                        </tr>
                                    ) : issuedBooks.map(tx => (
                                        <tr key={tx.id} className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{tx.bookCopy?.book?.title}</td>
                                            <td className="px-4 py-3 text-xs">{tx.bookCopy?.barcode}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs">{tx.member?.user?.name}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {tx.member?.user?.student?.admissionNo || tx.member?.user?.teacher?.employeeCode || tx.memberId}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 text-xs ${new Date(tx.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                {new Date(tx.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs hove:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                                    onClick={() => {
                                                        setReturnData({ ...returnData, transactionId: tx.id });
                                                        // We'll let the user click the Process Return button or we could trigger it directly
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </DashboardLayout>
    );
}
