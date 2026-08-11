import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { Plus, TrendingDown, TrendingUp, Filter, Trash2, MoreVertical, RefreshCcw, Wallet, Calendar, ArrowUpRight, ArrowDownLeft, Search, FileText, Receipt, X, ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/currency";
import { clsx } from "clsx";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/feedback/Loader";
import { formatISTDateKey, getISTDateString } from "@/lib/utils/date-utils";

type Transaction = {
    id: string;
    type: "INCOME" | "EXPENSE" | "FEE";
    source?: string;
    categoryId?: string;
    category?: { name: string };
    date: string;
    amount: number;
    description: string;
    invoiceNumber?: string;
    paymentMethod: string;
    billUrl?: string;
    receiptUrl?: string;
    student?: any;
};

type Category = {
    id: string;
    name: string;
};

export default function AdminFinanceTransactionsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"ALL" | "INCOME" | "EXPENSE" | "FEE">("ALL");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

    const fetchTransactions = async () => {
        if (!user?.schoolId) return;
        try {
            setLoading(true);
            const [incomeRes, expenseRes, categoriesRes, schoolTxRes] = await Promise.all([
                client.get("/v1/finance/income", { params: { schoolId: user.schoolId } }),
                client.get("/v1/finance/expenses", { params: { schoolId: user.schoolId } }),
                client.get("/v1/finance/expense-categories", { params: { schoolId: user.schoolId } }),
                client.get(`/v1/finance/transactions/school/${user.schoolId}`)
            ]);

            const income = (incomeRes.data || []).map((i: any) => ({ ...i, type: "INCOME" }));
            const expenses = (expenseRes.data || []).map((e: any) => ({ ...e, type: "EXPENSE" }));
            const fees = (schoolTxRes.data?.data || []).map((p: any) => ({
                id: p.id,
                type: "FEE",
                date: p.paymentDate || p.createdAt,
                amount: p.amount,
                description: `Student Fee - ${p.student?.user?.name || 'Unknown'}`,
                paymentMethod: p.paymentMethod,
                student: p.student,
                receiptUrl: p.receiptUrl,
                invoiceNumber: p.id.slice(-8).toUpperCase()
            }));

            const combined = [...income, ...expenses, ...fees].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setTransactions(combined);
            setCategories(categoriesRes.data || []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user?.schoolId]);

    const filtered = transactions.filter((t) => {
        const matchesTab = activeTab === "ALL" || t.type === activeTab;
        const matchesSearch = (t.source || t.category?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (t.invoiceNumber || "").toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const totalIncome = transactions
        .filter((t) => t.type === "INCOME" || t.type === "FEE")
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <>
            <Head>
                <title>Transactions – Admin | LearnXChain</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 pb-12">
                    <Link
                        href="/dashboard/admin/finance"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Finance Dashboard
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">Monitor all financial activities across the institution</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchTransactions}
                                className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:bg-gray-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                                disabled={loading}
                            >
                                {loading ? <Loader size="sm" className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                                Refresh Data
                            </button>
                            <AddTransactionDialog
                                type="INCOME"
                                schoolId={user?.schoolId!}
                                onSuccess={fetchTransactions}
                            />
                            <AddTransactionDialog
                                type="EXPENSE"
                                categories={categories}
                                schoolId={user?.schoolId!}
                                onSuccess={fetchTransactions}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome - totalExpense, true)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <ArrowUpRight className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome, true)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                    <ArrowDownLeft className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpense, true)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Search */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-1">
                            {(["ALL", "INCOME", "EXPENSE", "FEE"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                                        activeTab === tab
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    )}
                                >
                                    {tab === "FEE" ? "School Fees" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by source, category, invoice..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">Type</th>
                                            <th className="px-6 py-4 font-medium">Category / Source</th>
                                            <th className="px-6 py-4 font-medium">Description</th>
                                            <th className="px-6 py-4 font-medium">Method</th>
                                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            <th className="px-6 py-4 font-medium text-right">Invoice/Bill</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                        {loading ? (
                                            <TableLoading cols={7} />
                                        ) : filtered.length === 0 ? (
                                            <TableEmpty message="No transactions found" cols={7} />
                                        ) : (
                                            filtered.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {new Date(t.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase",
                                                            t.type === 'INCOME' || t.type === 'FEE'
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                                : "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                                        )}>
                                                            {t.type === 'INCOME' || t.type === 'FEE' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {t.type === "INCOME" ? t.source : t.type === "FEE" ? "Student Fee" : t.category?.name}
                                                        </div>
                                                        {t.invoiceNumber && (
                                                            <div className="text-xs text-gray-400">#{t.invoiceNumber}</div>
                                                        )}
                                                    </td>
                                                    <td className="max-w-xs truncate px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {t.description}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                            {t.paymentMethod}
                                                        </div>
                                                    </td>
                                                    <td className={clsx("px-6 py-4 text-right font-bold", t.type === 'INCOME' || t.type === 'FEE' ? "text-emerald-600" : "text-rose-600")}>
                                                        {t.type === 'INCOME' || t.type === 'FEE' ? "+" : "-"}{formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {t.type === "FEE" ? (
                                                            <button
                                                                onClick={() => setSelectedAttachment(t.receiptUrl || `/api/v1/finance/receipt/fee/${t.id}`)}
                                                                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-500 decoration-indigo-600/30 hover:underline"
                                                            >
                                                                <Receipt className="mr-1 h-3.5 w-3.5" />
                                                                View Receipt
                                                            </button>
                                                        ) : t.billUrl ? (
                                                            <button
                                                                onClick={() => setSelectedAttachment(t.billUrl!)}
                                                                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-500 decoration-indigo-600/30 hover:underline"
                                                            >
                                                                <FileText className="mr-1 h-3.5 w-3.5" />
                                                                View Bill
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">N/A</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachment Preview Modal */}
                {selectedAttachment && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
                        onClick={() => setSelectedAttachment(null)}
                    >
                        <div
                            className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Preview</h3>
                                <button
                                    onClick={() => setSelectedAttachment(null)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="h-[calc(85vh-73px)] w-full bg-gray-50 dark:bg-gray-950">
                                <iframe
                                    src={selectedAttachment}
                                    className="h-full w-full border-0"
                                    title="Document Preview"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}

function TableLoading({ cols }: { cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                    <Loader size="lg" />
                    <p className="text-sm text-gray-500 animate-pulse">Loading transaction data...</p>
                </div>
            </td>
        </tr>
    );
}

function TableEmpty({ message, cols }: { message: string; cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-20 text-center text-gray-500">
                <FileText className="mx-auto h-16 w-16 text-gray-400 opacity-20 mb-4" />
                <p className="text-lg font-medium text-gray-400">{message}</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
            </td>
        </tr>
    );
}

interface AddTransactionDialogProps {
    type: "INCOME" | "EXPENSE";
    categories?: Category[];
    schoolId: string;
    onSuccess: () => void;
}

function AddTransactionDialog({ type, categories, schoolId, onSuccess }: AddTransactionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        date: getISTDateString(),
        description: "",
        paymentMethod: "CASH",
        source: "",
        categoryId: "",
        newCategoryName: "",
        invoiceNumber: "",
    });
    const [billFile, setBillFile] = useState<File | null>(null);
    const [useNewCategory, setUseNewCategory] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const url = type === "INCOME" ? "/v1/finance/income" : "/v1/finance/expenses";

            const data = new FormData();
            data.append("amount", formData.amount);
            data.append("date", formData.date);
            data.append("description", formData.description);
            data.append("paymentMethod", formData.paymentMethod);
            data.append("schoolId", schoolId);

            if (type === "INCOME") {
                data.append("source", formData.source);
            } else {
                if (useNewCategory) {
                    data.append("newCategoryName", formData.newCategoryName);
                } else {
                    data.append("categoryId", formData.categoryId);
                }
            }

            if (formData.invoiceNumber) {
                data.append("invoiceNumber", formData.invoiceNumber);
            }

            if (billFile) {
                data.append("bill", billFile);
            }

            await client.post(url, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setIsOpen(false);
            setFormData({
                amount: "",
                date: getISTDateString(),
                description: "",
                paymentMethod: "CASH",
                source: "",
                categoryId: "",
                newCategoryName: "",
                invoiceNumber: "",
            });
            setBillFile(null);
            setUseNewCategory(false);
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                    }`}>
                    <Plus className="h-4 w-4" />
                    Add {type === "INCOME" ? "Income" : "Expense"}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add {type === "INCOME" ? "Income" : "Expense"}</DialogTitle>
                    <DialogDescription>
                        Record a new {type.toLowerCase()} entry for the school ledger.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                required
                                min={formatISTDateKey(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))}
                                max={getISTDateString()}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>{type === "INCOME" ? "Income Source" : "Expense Category"}</Label>
                        {type === "INCOME" ? (
                            <Input
                                placeholder="e.g. Sales, Rental, Donation"
                                required
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            />
                        ) : (
                            <div className="space-y-2">
                                {!useNewCategory ? (
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(v) => {
                                                if (v === "NEW") {
                                                    setUseNewCategory(true);
                                                } else {
                                                    setFormData({ ...formData, categoryId: v });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="NEW" className="font-bold text-indigo-600">+ Create New Category</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="New Category Name"
                                            value={formData.newCategoryName}
                                            onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setUseNewCategory(false)}
                                            className="text-xs text-gray-500 hover:text-indigo-600 font-bold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label>Payment Method</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Description</Label>
                        <Input
                            placeholder="Internal notes..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Upload Bill/Receipt</Label>
                        <Input
                            type="file"
                            onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                            className="text-xs"
                        />
                    </div>

                    <DialogFooter>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                                }`}
                        >
                            {loading && <Loader size="sm" />}
                            Save Transaction
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
