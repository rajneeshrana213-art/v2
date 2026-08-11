import { useState } from "react";
import { X, Upload, FileText } from 'lucide-react';
import { useApi } from "@/hooks/useApi";
import { toast } from "react-toastify";
import { clsx } from "clsx";
import Loader from '@/components/ui/feedback/Loader';
import { formatISTDateKey, getISTDateString, parseInstitutionalDate } from "@/lib/utils/date-utils";

interface Category {
    id: string;
    name: string;
}

interface FinanceFormModalProps {
    type?: "income" | "expense";
    onClose: () => void;
    onSuccess: () => void;
    record?: any;
    categories: Category[];
}

export default function FinanceFormModal({ type: initialType = "income", onClose, onSuccess, record, categories }: FinanceFormModalProps) {
    const [type, setType] = useState<"income" | "expense">(record ? (record.source ? "income" : "expense") : initialType);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { post, put } = useApi();

    const [formData, setFormData] = useState({
        source: record?.source || "",
        categoryId: record?.categoryId || "",
        date: record?.date ? formatISTDateKey(new Date(record.date)) : getISTDateString(),
        amount: record?.amount || "",
        description: record?.description || "",
        paymentMethod: record?.paymentMethod || "CASH",
        invoiceNumber: record?.invoiceNumber || "",
    });

    const today = parseInstitutionalDate(getISTDateString());
    const maxDate = getISTDateString();
    const minDate = formatISTDateKey(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual date validation
        const selectedDateStr = formData.date;
        const selectedDate = parseInstitutionalDate(selectedDateStr);

        const minAllowedDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);

        const maxAllowedDate = today;

        if (selectedDate > maxAllowedDate) {
            toast.error("Future dates are not allowed");
            return;
        }

        if (selectedDate < minAllowedDate) {
            toast.error("Records older than 15 days are not allowed");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val) data.append(key, val.toString());
            });
            if (file) data.append("attachment", file);

            const url = record
                ? `/v1/superadmin/finance/${type}/${record.id}`
                : `/v1/superadmin/finance/${type}`;

            if (record) {
                await put(url, data, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await post(url, data, { headers: { "Content-Type": "multipart/form-data" } });
            }

            toast.success(`Record ${record ? "updated" : "created"} successfully`);
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-white/10 scrollbar-hide animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {record ? "Edit Record" : "Add Record"}
                        </h2>
                        {!record && (
                            <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        type === 'income'
                                            ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-800"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >Income</button>
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        type === 'expense'
                                            ? "bg-white text-red-600 shadow-sm dark:bg-gray-800"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    )}
                                >Expense</button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {type === "income" ? (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Source / Payer Name</label>
                            <input
                                required
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                                placeholder="e.g. Google AdSense, Direct Sales"
                            />
                        </div>
                    ) : (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            min={minDate}
                            max={maxDate}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white font-bold"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Payment Method</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="UPI">UPI / QR</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="DEBIT_CARD">Debit Card</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="ONLINE">Other Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Invoice / Receipt #</label>
                        <input
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description / Notes</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-800 dark:text-white resize-none"
                            placeholder="Enter transaction details..."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Bill / Attachment</label>
                        <div className="relative group">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="bill-upload-shared-final"
                                accept="image/*,application/pdf"
                            />
                            <label
                                htmlFor="bill-upload-shared-final"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all group-hover:border-indigo-500/50"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-bold text-indigo-600">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl text-gray-400 mb-2">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-bold text-indigo-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">PDF, PNG, JPG (MAX. 10MB)</p>
                                        </>
                                    )}
                                </div>
                            </label>
                            {record?.attachment && !file && (
                                <div className="mt-2 text-xs text-gray-400 ml-1">
                                    Current: <a href={record.attachment} target="_blank" className="font-bold text-indigo-500 hover:underline">View current bill</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-gray-200 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={clsx(
                                "flex-[2] rounded-2xl py-4 text-sm font-black text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2",
                                type === 'income'
                                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                                    : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                            )}
                        >
                            {loading ? (
                                <Loader className="" />
                            ) : (
                                <>
                                    <span>{record ? "Update Transaction" : `Create ${type === 'income' ? 'Income' : 'Expense'}`}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
