import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { Plus, Search, Download, Filter, TrendingUp, TrendingDown, Wallet, Receipt, FileText, Trash2, Edit2, ExternalLink, X, Upload } from 'lucide-react';
import { toast } from "react-toastify";
import { clsx } from "clsx";
import FinanceFormModal from "@/components/dashboard/superadmin/finance/FinanceFormModal";
import { formatCurrency } from "@/lib/utils/currency";
import { Loader } from '@/components/ui/feedback/Loader';
import { ConfirmModal } from "@/components/ui/modals/ConfirmModal";


interface Category {
    id: string;
    name: string;
    _count?: { expenses: number };
}

interface FinanceRecord {
    id: string;
    source?: string;
    categoryId?: string;
    category?: Category;
    date: string;
    amount: number;
    description: string | null;
    paymentMethod: string;
    attachment: string | null;
    invoiceNumber: string | null;
    createdAt: string;
}

interface FinanceResponse {
    data: FinanceRecord[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
        totalAmount: number;
    };
}

export default function IncomeExpensePage() {
    const [activeTab, setActiveTab] = useState<"income" | "expense" | "categories">("income");
    const [search, setSearch] = useState("");
    const [incomePage, setIncomePage] = useState(1);
    const [expensePage, setExpensePage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<"income" | "expense" | "category" | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const { data: incomeData, get: getIncome, del: delIncome, loading: incomeLoading } = useApi<FinanceResponse>();
    const { data: expenseData, get: getExpenses, del: delExpense, loading: expenseLoading } = useApi<FinanceResponse>();
    const { data: categories, get: getCategories, del: delCategory, loading: categoriesLoading } = useApi<Category[]>();

    const income = incomeData?.data;
    const expenses = expenseData?.data;

    useEffect(() => {
        getIncome(`/v1/superadmin/finance/income?page=${incomePage}&limit=10&search=${search}`);
    }, [incomePage, search]);

    useEffect(() => {
        getExpenses(`/v1/superadmin/finance/expense?page=${expensePage}&limit=10&search=${search}`);
    }, [expensePage, search]);

    useEffect(() => {
        getCategories("/v1/superadmin/finance/expense-categories");
    }, []);

    const refreshData = () => {
        getIncome(`/v1/superadmin/finance/income?page=${incomePage}&limit=10&search=${search}`);
        getExpenses(`/v1/superadmin/finance/expense?page=${expensePage}&limit=10&search=${search}`);
        getCategories("/v1/superadmin/finance/expense-categories");
    };

    const totals = {
        income: incomeData?.pagination.totalAmount || 0,
        expense: expenseData?.pagination.totalAmount || 0,
    };
    // Note: Totals here are only for the current page. If we want global totals, 
    // the API should return them separately, but for now we'll stick to this or assume small datasets.
    // Actually, usually dashboard stats are calculated differently, but we'll leave it as is for now.

    const handleDeleteRecord = (type: "income" | "expense", id: string) => {
        setDeleteType(type);
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCategory = (id: string) => {
        setDeleteType("category");
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !deleteType) return;
        setDeleteLoading(true);
        try {
            if (deleteType === "category") {
                await delCategory(`/v1/superadmin/finance/expense-categories/${itemToDelete}`);
                toast.success("Category deleted");
            } else {
                if (deleteType === "income") await delIncome(`/v1/superadmin/finance/income/${itemToDelete}`);
                else await delExpense(`/v1/superadmin/finance/expense/${itemToDelete}`);
                toast.success("Record deleted successfully");
            }
            refreshData();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete");
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            setDeleteType(null);
        }
    };


    return (
        <DashboardLayout role="superadmin">
            <Head>
                <title>Internal Finance - LearnXChain</title>
            </Head>

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internal Finance</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage platform income, expenses and categories</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditingRecord(null);
                                setShowModal(true);
                            }}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Record
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.income, true)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.expense, true)}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.income - totals.expense, true)}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 dark:border-white/10">
                    {(["income", "expense", "categories"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize",
                                activeTab === tab
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === "categories" ? (
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setShowCategoryModal(true);
                                }}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add Category
                            </button>
                        </div>
                    ) : (
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                {activeTab === "categories" ? (
                                    <>
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Name</th>
                                                <th className="px-6 py-4 font-medium">Expenses Count</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                            {categoriesLoading ? (
                                                <TableLoading cols={3} />
                                            ) : categories?.length === 0 ? (
                                                <TableEmpty message="No categories found" cols={3} />
                                            ) : (
                                                categories?.map((cat) => (
                                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat._count?.expenses || 0}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2 text-gray-400">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingCategory(cat);
                                                                        setShowCategoryModal(true);
                                                                    }}
                                                                    className="hover:text-indigo-600"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteCategory(cat.id)} className="hover:text-red-600">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Date</th>
                                                <th className="px-6 py-4 font-medium">{activeTab === "income" ? "Source" : "Category"}</th>
                                                <th className="px-6 py-4 font-medium">Amount</th>
                                                <th className="px-6 py-4 font-medium">Method</th>
                                                <th className="px-6 py-4 font-medium">Bill</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                            {(activeTab === "income" ? incomeLoading : expenseLoading) ? (
                                                <TableLoading cols={6} />
                                            ) : (activeTab === "income" ? income : expenses)?.length === 0 ? (
                                                <TableEmpty message="No records found" cols={6} />
                                            ) : (
                                                (activeTab === "income" ? income : expenses)
                                                    ?.filter((r) =>
                                                        r.description?.toLowerCase().includes(search.toLowerCase()) ||
                                                        (r.source || r.category?.name)?.toLowerCase().includes(search.toLowerCase()) ||
                                                        r.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
                                                    )
                                                    .map((record) => (
                                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                                {new Date(record.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    {activeTab === "income" ? record.source : record.category?.name}
                                                                </div>
                                                                {record.invoiceNumber && (
                                                                    <div className="text-xs text-gray-400">#{record.invoiceNumber}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                ₹{record.amount.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-white/10">
                                                                    {record.paymentMethod.replace(/_/g, " ")}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {record.attachment ? (
                                                                    <button
                                                                        onClick={() => setSelectedAttachment(record.attachment)}
                                                                        className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                                                    >
                                                                        <Receipt className="mr-1 h-3 w-3" />
                                                                        View Bill
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 italic">No bill</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2 text-gray-400">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingRecord(record);
                                                                            setShowModal(true);
                                                                        }}
                                                                        className="hover:text-indigo-600"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteRecord(activeTab as any, record.id)}
                                                                        className="hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {activeTab !== "categories" && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {activeTab === "income" ? (
                                        incomeData?.pagination && (
                                            <>Page {incomeData.pagination.currentPage} of {incomeData.pagination.totalPages}</>
                                        )
                                    ) : (
                                        expenseData?.pagination && (
                                            <>Page {expenseData.pagination.currentPage} of {expenseData.pagination.totalPages}</>
                                        )
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => activeTab === "income" ? setIncomePage(p => Math.max(1, p - 1)) : setExpensePage(p => Math.max(1, p - 1))}
                                        disabled={activeTab === "income" ? incomePage === 1 : expensePage === 1}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => activeTab === "income" ? setIncomePage(p => p + 1) : setExpensePage(p => p + 1)}
                                        disabled={activeTab === "income" ? incomePage >= (incomeData?.pagination.totalPages || 1) : expensePage >= (expenseData?.pagination.totalPages || 1)}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Record Modal */}
            {showModal && (
                <FinanceFormModal
                    type={activeTab === "categories" ? "income" : activeTab}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        refreshData();
                    }}
                    record={editingRecord}
                    categories={categories || []}
                />
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <CategoryModal
                    onClose={() => setShowCategoryModal(false)}
                    onSuccess={() => {
                        setShowCategoryModal(false);
                        refreshData();
                    }}
                    category={editingCategory}
                />
            )}

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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteType === "category" ? "Delete Category" : "Delete Record"}
                description={
                    deleteType === "category"
                        ? "Are you sure? This will only work if no expenses are linked to this category."
                        : "Are you sure you want to delete this financial record? This action cannot be undone."
                }
                isLoading={deleteLoading}
            />
        </DashboardLayout>

    );
}

function TableLoading({ cols }: { cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-12 text-center">
                <div className="flex justify-center">
                    <Loader size="lg" />
                </div>
            </td>
        </tr>
    );
}

function TableEmpty({ message, cols }: { message: string; cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-12 text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 opacity-20 mb-2" />
                {message}
            </td>
        </tr>
    );
}

// Sub-components (could be in separate files for larger projects)

function CategoryModal({ onClose, onSuccess, category }: any) {
    const [name, setName] = useState(category?.name || "");
    const [loading, setLoading] = useState(false);
    const { post, put } = useApi();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (category) {
                await put(`/v1/superadmin/finance/expense-categories/${category.id}`, { name });
                toast.success("Category updated");
            } else {
                await post("/v1/superadmin/finance/expense-categories", { name });
                toast.success("Category created");
            }
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border dark:border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category ? "Edit Category" : "Add Category"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-white/10 dark:bg-gray-800"
                            placeholder="e.g. Marketing, Server Costs"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {loading ? <Loader size="sm" variant="white" /> : category ? "Update" : "Create"}
                    </button>
                </form>
            </div>
        </div>
    );
}

