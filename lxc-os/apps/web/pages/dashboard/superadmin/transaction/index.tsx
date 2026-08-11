import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { Search, Download, FileText, Receipt, ExternalLink, X, Wallet, TrendingUp, TrendingDown, Building2, Calendar, CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCcw, Layers, Eye } from 'lucide-react';
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils/currency";
import { Loader } from '@/components/ui/feedback/Loader';

interface InternalTransaction {
    id: string;
    source?: string;
    categoryId?: string;
    category?: { name: string };
    date: string;
    amount: number;
    description: string | null;
    paymentMethod: string;
    attachment: string | null;
    invoiceNumber: string | null;
    type: "income" | "expense";
}

interface PlanTransaction {
    id: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    paymentMethod: string | null;
    status: string;
    paymentDate: string | null;
    createdAt: string;
    school: {
        schoolName: string;
        schoolLogo: string | null;
    } | null;
    plan: {
        name: string;
        price: number;
    } | null;
    invoiceNumber: string | null;
    invoiceUrl: string | null;
    receiptUrl: string | null;
}

interface FeatureTransaction {
    id: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    paymentMethod: string | null;
    status: string;
    paymentDate: string | null;
    createdAt: string;
    featureName: string;
    billingPeriod: string;
    school: {
        schoolName: string;
        schoolLogo: string | null;
    } | null;
    invoiceNumber: string | null;
    invoiceUrl: string | null;
    receiptUrl: string | null;
}

interface PlanResponse {
    data: PlanTransaction[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

interface FeatureResponse {
    data: FeatureTransaction[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export default function TransactionPage() {
    const [activeTab, setActiveTab] = useState<"internal" | "plans" | "features">("internal");
    const [search, setSearch] = useState("");
    const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const downloadInvoice = async (url: string, filename: string, id: string) => {
        setDownloadingId(id);
        try {
            const proxyUrl = url.startsWith('http') 
                ? `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/superadmin/attachment/view?url=${encodeURIComponent(url)}` 
                : url;
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, "_blank");
        } finally {
            setDownloadingId(null);
        }
    };

    const [internalPage, setInternalPage] = useState(1);
    const [plansPage, setPlansPage] = useState(1);
    const [featuresPage, setFeaturesPage] = useState(1);

    const { data: incomeData, get: getIncome, loading: incomeLoading } = useApi<{ data: any[], pagination: any }>();
    const { data: expenseData, get: getExpenses, loading: expenseLoading } = useApi<{ data: any[], pagination: any }>();
    const { data: plansData, get: getPlanTransactions, loading: plansLoading } = useApi<PlanResponse>();
    const { data: featuresData, get: getFeatureTransactions, loading: featuresLoading } = useApi<FeatureResponse>();

    const internalIncome = incomeData?.data;
    const internalExpense = expenseData?.data;
    const planTransactions = plansData?.data;
    const featureTransactions = featuresData?.data;

    useEffect(() => {
        if (activeTab === "internal") {
            getIncome(`/v1/superadmin/finance/income?page=${internalPage}&limit=10&search=${search}`);
            getExpenses(`/v1/superadmin/finance/expense?page=${internalPage}&limit=10&search=${search}`);
        } else if (activeTab === "plans") {
            getPlanTransactions(`/v1/superadmin/transactions/plans?page=${plansPage}&limit=10&search=${search}`);
        } else {
            getFeatureTransactions(`/v1/superadmin/transactions/features?page=${featuresPage}&limit=10&search=${search}`);
        }
    }, [activeTab, internalPage, plansPage, featuresPage, search]);

    const refreshData = () => {
        if (activeTab === "internal") {
            getIncome(`/v1/superadmin/finance/income?page=${internalPage}&limit=10&search=${search}`);
            getExpenses(`/v1/superadmin/finance/expense?page=${internalPage}&limit=10&search=${search}`);
        } else if (activeTab === "plans") {
            getPlanTransactions(`/v1/superadmin/transactions/plans?page=${plansPage}&limit=10&search=${search}`);
        } else {
            getFeatureTransactions(`/v1/superadmin/transactions/features?page=${featuresPage}&limit=10&search=${search}`);
        }
    };

    const combinedInternal: InternalTransaction[] = [
        ...(internalIncome || []).map(i => ({ ...i, type: 'income' as const })),
        ...(internalExpense || []).map(e => ({ ...e, type: 'expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredInternal = combinedInternal.filter(t =>
        (t.source || t.category?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.invoiceNumber || "").toLowerCase().includes(search.toLowerCase())
    );

    const filteredPlans = (planTransactions || []).filter(t =>
        (t.school?.schoolName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.plan?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.razorpayOrderId || "").toLowerCase().includes(search.toLowerCase())
    );

    const filteredFeatures = (featureTransactions || []).filter(t =>
        (t.school?.schoolName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.featureName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.razorpayOrderId || "").toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        totalInternal: combinedInternal.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0),
        totalPlanRevenue: (planTransactions || []).reduce((acc, curr) => acc + curr.amount, 0),
        totalFeatureRevenue: (featureTransactions || []).filter(t => t.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0),
        pendingPlans: (planTransactions || []).filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length,
    };

    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Transactions - LearnXChain</title>
            </Head>

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Monitor all financial activities across the platform</p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 dark:bg-gray-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                    >
                        <RefreshCcw className={clsx("mr-2 h-4 w-4", (activeTab === 'internal' ? (incomeLoading || expenseLoading) : activeTab === 'plans' ? plansLoading : featuresLoading) && "animate-spin")} />
                        Refresh Data
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Internal Balance</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalInternal, true)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalPlanRevenue, true)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Feature Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalFeatureRevenue, true)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Subscriptions</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPlans} Requests</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setActiveTab("internal")}
                        className={clsx(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                            activeTab === "internal"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        LXC Internal Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab("plans")}
                        className={clsx(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                            activeTab === "plans"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        Plan Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab("features")}
                        className={clsx(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                            activeTab === "features"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        Feature Transactions
                    </button>
                </div>

                {/* Search & Content */}
                <div className="space-y-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'internal' ? "Search by source, category, invoice..."
                                : activeTab === 'plans' ? "Search by school, plan, order ID..."
                                : "Search by school, feature, order ID..."
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                    {activeTab === 'internal' ? (
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">Source / Category</th>
                                            <th className="px-6 py-4 font-medium">Type</th>
                                            <th className="px-6 py-4 font-medium">Amount</th>
                                            <th className="px-6 py-4 font-medium">Method</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    ) : activeTab === 'plans' ? (
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">School / Plan</th>
                                            <th className="px-6 py-4 font-medium">Order Details</th>
                                            <th className="px-6 py-4 font-medium">Amount</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium text-right">Invoice</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">School</th>
                                            <th className="px-6 py-4 font-medium">Feature</th>
                                            <th className="px-6 py-4 font-medium">Order ID</th>
                                            <th className="px-6 py-4 font-medium">Amount</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium text-right">Invoice</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {activeTab === 'features' ? (
                                        featuresLoading ? (
                                            <TableLoading cols={7} />
                                        ) : filteredFeatures.length === 0 ? (
                                            <TableEmpty message="No feature transactions found" cols={7} />
                                        ) : (
                                            filteredFeatures.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {t.school?.schoolLogo ? (
                                                                <img src={t.school.schoolLogo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                                            ) : (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-white/5">
                                                                    <Building2 className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                            <div className="font-medium text-gray-900 dark:text-white">{t.school?.schoolName || 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-violet-700 dark:text-violet-300 text-sm">{t.featureName || '—'}</div>
                                                        {t.billingPeriod && (
                                                            <div className="mt-0.5 inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-300">
                                                                {t.billingPeriod}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{t.razorpayOrderId}</div>
                                                        {t.razorpayPaymentId && (
                                                            <div className="text-xs text-gray-400 italic mt-0.5">{t.razorpayPaymentId}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                            t.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                                t.status === 'PENDING' || t.status === 'PROCESSING' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                                                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                        )}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {t.invoiceUrl ? (
                                                            <button
                                                                onClick={() => setSelectedAttachment(t.invoiceUrl!)}
                                                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                <Receipt className="mr-1 h-3.5 w-3.5" />
                                                                View Invoice
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No invoice</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    ) : activeTab === 'internal' ? (
                                        (incomeLoading || expenseLoading) ? (
                                            <TableLoading cols={6} />
                                        ) : filteredInternal.length === 0 ? (
                                            <TableEmpty message="No internal transactions found" cols={6} />
                                        ) : (
                                            filteredInternal.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {new Date(t.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {t.type === 'income' ? t.source : t.category?.name}
                                                        </div>
                                                        {t.invoiceNumber && (
                                                            <div className="text-xs text-gray-400">#{t.invoiceNumber}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                                                            t.type === 'income'
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                                : "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                                        )}>
                                                            {t.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                            {t.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className={clsx("px-6 py-4 font-semibold", t.type === 'income' ? "text-emerald-600" : "text-red-600")}>
                                                        {t.type === 'income' ? "+" : "-"}{formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            {t.paymentMethod.replace(/_/g, ' ')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {t.attachment ? (
                                                            <button
                                                                onClick={() => setSelectedAttachment(t.attachment)}
                                                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                <Receipt className="mr-1 h-3.5 w-3.5" />
                                                                View Bill
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No bill</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    ) : (
                                        plansLoading ? (
                                            <TableLoading cols={6} />
                                        ) : filteredPlans.length === 0 ? (
                                            <TableEmpty message="No plan transactions found" cols={6} />
                                        ) : (
                                            filteredPlans.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {t.school?.schoolLogo ? (
                                                                <img src={t.school.schoolLogo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                                            ) : (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-white/5">
                                                                    <Building2 className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-white">{t.school?.schoolName || "N/A"}</div>
                                                                <div className="text-xs text-indigo-500 font-medium">{t.plan?.name || "Premium Plan"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Order: <span className="font-mono text-gray-700 dark:text-gray-200">{t.razorpayOrderId}</span></div>
                                                        {t.razorpayPaymentId && (
                                                            <div className="text-xs text-gray-400 italic">Payment: {t.razorpayPaymentId}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(t.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                            t.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                                t.status === 'PENDING' || t.status === 'PROCESSING' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                                                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                        )}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {t.invoiceUrl ? (
                                                            <button
                                                                onClick={() => setSelectedAttachment(t.invoiceUrl!)}
                                                                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                                            >
                                                                <Receipt className="mr-1 h-3.5 w-3.5" />
                                                                View Invoice
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No invoice</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {activeTab === "internal" ? (
                                    incomeData?.pagination && (
                                        <>Page {incomeData.pagination.currentPage} of {incomeData.pagination.totalPages}</>
                                    )
                                ) : activeTab === "plans" ? (
                                    plansData?.pagination && (
                                        <>Page {plansData.pagination.currentPage} of {plansData.pagination.totalPages}</>
                                    )
                                ) : (
                                    featuresData?.pagination && (
                                        <>Page {featuresData.pagination.currentPage} of {featuresData.pagination.totalPages}</>
                                    )
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (activeTab === "internal") setInternalPage(p => Math.max(1, p - 1));
                                        else if (activeTab === "plans") setPlansPage(p => Math.max(1, p - 1));
                                        else setFeaturesPage(p => Math.max(1, p - 1));
                                    }}
                                    disabled={activeTab === "internal" ? internalPage === 1 : activeTab === "plans" ? plansPage === 1 : featuresPage === 1}
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        if (activeTab === "internal") setInternalPage(p => p + 1);
                                        else if (activeTab === "plans") setPlansPage(p => p + 1);
                                        else setFeaturesPage(p => p + 1);
                                    }}
                                    disabled={
                                        activeTab === "internal" ? internalPage >= (incomeData?.pagination.totalPages || 1) :
                                        activeTab === "plans" ? plansPage >= (plansData?.pagination.totalPages || 1) :
                                        featuresPage >= (featuresData?.pagination.totalPages || 1)
                                    }
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
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
                                src={selectedAttachment.startsWith('https') 
                                    ? `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/superadmin/attachment/view?url=${encodeURIComponent(selectedAttachment)}` 
                                    : selectedAttachment}
                                className="h-full w-full border-0"
                                title="Document Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
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
