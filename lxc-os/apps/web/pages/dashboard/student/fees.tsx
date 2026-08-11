
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
    Wallet,
    ChevronLeft,
    CreditCard,
    History,
    AlertCircle,
    FileText,
    Download,
    IndianRupee,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function StudentFeesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [customAmount, setCustomAmount] = useState("");
    const [isPaying, setIsPaying] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const res = await client.get("/v1/dashboard/student/fees");
            setData(res.data);
            if (res.data?.totalPending) {
                setCustomAmount(res.data.totalPending.toString());
            }
        } catch (error: any) {
            console.error("Failed to fetch fee data", error);
            toast.error(error.response?.data?.error || "Failed to fetch fee data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const amount = parseFloat(customAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            setIsPaying(true);
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error("Failed to load payment gateway");
                return;
            }

            // 1. Create Order
            const orderRes = await client.post("/v1/finance/collect/create-order", {
                studentId: data.personalInfo?.id, // We'll need to make sure personalInfo has ID or fetch it
                schoolId: data.personalInfo?.schoolId,
                amount: amount,
                paymentMethod: "ONLINE"
            });

            const { orderId, totalAmount, currency, keyId } = orderRes.data;

            const options = {
                key: keyId,
                amount: totalAmount,
                currency: currency,
                name: "School Fee Payment",
                description: `Payment for ${data.personalInfo?.name}`,
                order_id: orderId,
                handler: async (response: any) => {
                    setShowPayModal(false);
                    setIsVerifying(true);
                    try {
                        const verifyRes = await client.post("/v1/finance/collect/verify-payment", {
                            ...response,
                            studentId: data.personalInfo?.id,
                            schoolId: data.personalInfo?.schoolId,
                            userId: data.personalInfo?.userId
                        });

                        if (verifyRes.data.success) {
                            toast.success("Payment successful!");
                            fetchFees(); // Refresh data
                        }
                    } catch (error: any) {
                        console.error("Verification failed", error);
                        toast.error("Payment verification failed. Please contact support.");
                    } finally {
                        setIsVerifying(false);
                    }
                },
                prefill: {
                    name: data.personalInfo?.name,
                    email: data.personalInfo?.email,
                    contact: data.personalInfo?.phone
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error("Payment initiation failed", error);
            toast.error(error.response?.data?.error || "Failed to initiate payment");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <>
            <Head>
                <title>Fees & Billing - LearnXChain</title>
            </Head>

            {/* Payment Verification Overlay */}
            {isVerifying && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-6">
                        <Loader size="xl" />
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Verifying Payment</h2>
                            <p className="text-gray-500 text-sm max-w-xs">Please wait while we confirm your payment with the bank. Do not close or refresh this page.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                            Processing securely...
                        </div>
                    </div>
                </div>
            )}

            <DashboardLayout role="student">
                <div className="space-y-8 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/student">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees & Billing</h1>
                            <p className="text-sm text-gray-500">Manage your school fee payments and installments.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {/* Fee Overview Cards */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                                    <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                        <IndianRupee className="h-4 w-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Total Pending</span>
                                    </div>
                                    <h2 className="text-4xl font-black mb-4">₹ {data?.totalPending?.toLocaleString() || "0"}</h2>
                                    <div className="flex items-center gap-2 text-sm text-indigo-100/80">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Next installment due soon</span>
                                    </div>
                                    <button
                                        onClick={() => setShowPayModal(true)}
                                        className="mt-8 w-full rounded-2xl bg-white py-3 font-black text-indigo-600 shadow-sm transition-all hover:bg-indigo-50"
                                    >
                                        Pay Now
                                    </button>
                                </div>

                                <div className="rounded-3xl border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs font-black uppercase tracking-widest">Payment Status</span>
                                    </div>
                                    <h2 className={`text-4xl font-black mb-4 ${data?.totalPending > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                        {data?.totalPending > 0 ? "Due" : "Cleared"}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        You have {data?.pendingFees?.length || 0} pending payment requests.
                                    </p>
                                    <div className="mt-8 flex items-center justify-between">
                                        <Link href="/dashboard/student/profile" className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline">View scholarship details</Link>
                                        <CreditCard className="h-5 w-5 text-gray-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Pending Items */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    Pending Invoices
                                </h3>
                                <div className="space-y-3">
                                    {data?.pendingFees?.length > 0 ? data.pendingFees.map((fee: any, idx: number) => (
                                        <div key={idx} className="group flex items-center justify-between p-5 rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:border-indigo-600 dark:border-white/5 dark:bg-gray-900">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                                                    <AlertCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{fee.title || "Term Fee"}</h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">Due by {format(new Date(fee.dueDate), "MMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-rose-600">₹ {fee.amount.toLocaleString()}</p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedFee(fee);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center bg-gray-50/50 dark:bg-white/2 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Hurray! No pending payments found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <History className="h-5 w-5 text-indigo-500" />
                                    Payment History
                                </h3>
                                <div className="rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                    {data?.paymentHistory?.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-gray-900">
                                            {data.paymentHistory.map((payment: any) => (
                                                <div key={payment.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 flex items-center justify-center rounded-2xl ${payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600'}`}>
                                                            {payment.method === 'ONLINE' ? <CreditCard className="h-5 w-5" /> : <IndianRupee className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">{payment.method || "Fee"} PAYMENT</h4>
                                                            <p className="text-xs text-gray-400 font-bold uppercase">{payment.date ? format(new Date(payment.date), "MMM d, yyyy") : "—"}</p>
                                                            {payment.invoiceNumber && (
                                                                <p className="text-[10px] text-indigo-400 font-bold">Invoice: {payment.invoiceNumber}</p>
                                                            )}
                                                            {payment.receiptNumber && (
                                                                <p className="text-[10px] text-gray-400 font-bold">Receipt: {payment.receiptNumber}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <p className="font-black text-gray-900 dark:text-white">₹ {payment.amount?.toLocaleString()}</p>
                                                        <div className="flex gap-2">
                                                            {payment.invoiceUrl && (
                                                                <a href={payment.invoiceUrl} target="_blank" rel="noreferrer"
                                                                    className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline flex items-center gap-1">
                                                                    <Download className="h-3 w-3" /> Invoice
                                                                </a>
                                                            )}
                                                            {payment.receiptUrl && (
                                                                <a href={payment.receiptUrl} target="_blank" rel="noreferrer"
                                                                    className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline flex items-center gap-1">
                                                                    <Download className="h-3 w-3" /> Receipt
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center bg-white dark:bg-gray-900">
                                            <Download className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No payment history found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Modal */}
                {showPayModal && (() => {
                    const pending = data?.totalPending || 0;
                    const minAmt = Math.ceil(pending * 0.20);
                    const entered = parseFloat(customAmount);
                    const tooHigh = !isNaN(entered) && entered > pending;
                    const tooLow = !isNaN(entered) && entered < minAmt;
                    const isValid = !isNaN(entered) && entered >= minAmt && entered <= pending;

                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 animate-in zoom-in-95 duration-200">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Make Payment</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Total pending: <span className="font-bold text-indigo-600">₹{pending.toLocaleString()}</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    Min: <span className="font-bold text-amber-600">₹{minAmt.toLocaleString()}</span>
                                </p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Amount to Pay</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={customAmount}
                                                onChange={(e) => setCustomAmount(e.target.value)}
                                                className={`w-full rounded-2xl border p-4 pl-12 text-xl font-black focus:outline-none dark:bg-white/5 dark:text-white transition-colors ${tooHigh || tooLow
                                                    ? "border-rose-400 bg-rose-50 focus:border-rose-500 dark:border-rose-600 dark:bg-rose-950/20"
                                                    : "border-gray-100 bg-gray-50 focus:border-indigo-600 dark:border-white/5"
                                                    }`}
                                                placeholder="Enter amount"
                                                min={minAmt}
                                                max={pending}
                                            />
                                        </div>

                                        {/* Validation messages */}
                                        {tooHigh && (
                                            <p className="text-xs font-black text-rose-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Cannot exceed pending amount of ₹{pending.toLocaleString()}
                                            </p>
                                        )}
                                        {tooLow && !tooHigh && (
                                            <p className="text-xs font-black text-amber-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Minimum payment is 20% of dues — ₹{minAmt.toLocaleString()}
                                            </p>
                                        )}

                                        <div className="flex gap-3 flex-wrap">
                                            <button
                                                onClick={() => setCustomAmount(pending.toString())}
                                                className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                                            >
                                                Pay Full (₹{pending.toLocaleString()})
                                            </button>
                                            <button
                                                onClick={() => setCustomAmount(minAmt.toString())}
                                                className="text-[10px] font-black uppercase text-amber-600 hover:underline"
                                            >
                                                Pay Minimum (₹{minAmt.toLocaleString()})
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setShowPayModal(false)}
                                            className="flex-1 rounded-2xl bg-gray-100 py-4 text-sm font-black text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={isPaying || !isValid}
                                            className="flex-[2] rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed dark:shadow-none"
                                        >
                                            {isPaying ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader size="sm" variant="white" />
                                                    <span>Processing...</span>
                                                </div>
                                            ) : "Continue to Pay"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Details Modal */}
                {showDetailsModal && selectedFee && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedFee.title}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fee Details</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                                    <span className="text-sm text-gray-500">Total Amount</span>
                                    <span className="font-black text-gray-900 dark:text-white">₹{selectedFee.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                                    <span className="text-sm text-gray-500">Due Date</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{format(new Date(selectedFee.dueDate), "MMM d, yyyy")}</span>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Account Breakdown</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {selectedFee.description || "This amount includes tuition and administrative charges for the current period."}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
