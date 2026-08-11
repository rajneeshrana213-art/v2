
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { useRouter } from "next/router";
import {
    ChevronLeft,
    Wallet,
    Calendar,
    CreditCard,
    Download,
    AlertCircle,
    Clock,
    CheckCircle2,
    IndianRupee
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { toast } from "react-hot-toast";
import { Loader } from "@/components/ui/feedback/Loader";
import { decodeId, encodeId } from "@/lib/utils/hashId";

declare global {
    interface Window { Razorpay: any; }
}

export default function parentFees() {
    const router = useRouter();
    const queryId = router.query.studentId as string;
    const [studentId, setStudentId] = useState<string | null>(queryId ? decodeId(queryId) : null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [customAmount, setCustomAmount] = useState("");
    const [isPaying, setIsPaying] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (queryId) setStudentId(decodeId(queryId));
    }, [queryId]);

    const fetchFees = async (id: string) => {
        setLoading(true);
        try {
            const res = await client.get(`/v1/dashboard/parent/fees?studentId=${id}`);
            setData(res.data);
            if (res.data?.totalPending) setCustomAmount(res.data.totalPending.toString());
        } catch (error) {
            console.error("Failed to fetch fee data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!studentId) return;
        fetchFees(studentId);
    }, [studentId]);

    const loadRazorpay = () => new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePayment = async () => {
        const amount = parseFloat(customAmount);
        if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount"); return; }

        try {
            setIsPaying(true);
            const isLoaded = await loadRazorpay();
            if (!isLoaded) { toast.error("Failed to load payment gateway"); return; }

            const orderRes = await client.post("/v1/finance/collect/create-order", {
                studentId,
                schoolId: data?.schoolId,
                amount,
                paymentMethod: "ONLINE"
            });

            const { orderId, totalAmount, currency, keyId } = orderRes.data;

            const options = {
                key: keyId,
                amount: totalAmount,
                currency,
                name: "School Fee Payment",
                description: "Fee Payment",
                order_id: orderId,
                handler: async (response: any) => {
                    setShowPayModal(false);
                    setIsVerifying(true);
                    try {
                        const verifyRes = await client.post("/v1/finance/collect/verify-payment", {
                            ...response,
                            studentId,
                            schoolId: data?.schoolId,
                            userId: data?.userId
                        });
                        if (verifyRes.data.success) {
                            toast.success("Payment successful!");
                            fetchFees(studentId!);
                        }
                    } catch (err: any) {
                        toast.error("Payment verification failed. Please contact support.");
                    } finally {
                        setIsVerifying(false);
                    }
                },
                theme: { color: "#4f46e5" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to initiate payment");
        } finally {
            setIsPaying(false);
        }
    };

    const pending = data?.totalPending || 0;
    const minAmt = Math.ceil(pending * 0.20);
    const entered = parseFloat(customAmount);
    const tooHigh = !isNaN(entered) && entered > pending;
    const tooLow = !isNaN(entered) && entered < minAmt;
    const isValid = !isNaN(entered) && entered >= minAmt && entered <= pending;

    return (
        <>
            <Head>
                <title>Fees &amp; Billing - LearnXChain</title>
            </Head>

            {/* Verification Overlay */}
            {isVerifying && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-6">
                        <Loader size="xl" />
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Verifying Payment</h2>
                            <p className="text-gray-500 text-sm max-w-xs">Please wait while we confirm your payment. Do not close this page.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                            Processing securely...
                        </div>
                    </div>
                </div>
            )}

            <DashboardLayout role="parent">
                <div className="space-y-8 pb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/parent">
                                <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Fees &amp; Billing</h1>
                                <p className="text-sm text-gray-500 font-medium tracking-tighter uppercase">Manage school fee payments and history</p>
                            </div>
                        </div>
                        <ChildSelector
                            selectedId={studentId}
                            onSelect={(id) => {
                                setStudentId(id);
                                router.push(`/dashboard/parent/fees?studentId=${encodeId(id)}`, undefined, { shallow: true });
                            }}
                        />
                    </div>

                    {!studentId || loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {/* Summary Card */}
                            <div className="rounded-[3rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
                                <div className="flex flex-col md:flex-row justify-between gap-10">
                                    <div className="space-y-4">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/30 text-indigo-100">
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Total Pending Amount</p>
                                            <h2 className="text-5xl font-black">₹{data?.totalPending?.toLocaleString() || "0"}</h2>
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold bg-indigo-700/50 w-fit px-4 py-2 rounded-2xl">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Next Installment Due: {data?.pendingFees?.[0] ? format(new Date(data.pendingFees[0].dueDate), "MMM dd, yyyy") : "N/A"}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => pending > 0 && setShowPayModal(true)}
                                            disabled={pending <= 0}
                                            className="h-16 w-full md:w-56 rounded-3xl bg-white px-8 text-lg font-black text-indigo-600 transition-transform active:scale-95 hover:shadow-xl shadow-indigo-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pending & Upcoming Installments */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white ml-2">Fee Schedule</h3>
                                <div className="grid gap-4">
                                    {data?.pendingFees?.length > 0 ? data.pendingFees.map((fee: any, idx: number) => (
                                        <div key={idx} className={`flex items-center justify-between rounded-[2rem] border p-6 transition-all ${fee.status === 'PAID' ? 'bg-gray-50/50 border-gray-100 opacity-80' : 'bg-white border-gray-100 dark:border-white/5 dark:bg-gray-900 shadow-sm'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fee.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' :
                                                        fee.status === 'OVERDUE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                                                    }`}>
                                                    {fee.status === 'PAID' ? <CheckCircle2 className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 dark:text-gray-100">{fee.title}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {fee.status === 'PAID' ? 'Settled' : `Due ${format(new Date(fee.dueDate), "MMM dd, yyyy")}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-gray-900 dark:text-white">₹{fee.amount.toLocaleString()}</p>
                                                <div className="flex items-center justify-end gap-2">
                                                    {fee.totalAmount > fee.amount && fee.amount > 0 && (
                                                        <span className="text-[9px] font-bold text-gray-400">Total ₹{fee.totalAmount.toLocaleString()}</span>
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${fee.status === 'PAID' ? 'text-emerald-500' :
                                                            fee.status === 'OVERDUE' ? 'text-rose-500' : 'text-amber-500'
                                                        }`}>
                                                        {fee.status === 'UNPAID' && <Clock className="h-3 w-3" />}
                                                        {fee.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 bg-emerald-50/30 rounded-[2rem] dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/10">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                                            <p className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest text-xs">All Clear! No Pending Fees</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment History */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white ml-2 flex items-center gap-2">
                                    Payment History
                                </h3>
                                <div className="rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
                                    {data?.paymentHistory?.length > 0 ? (
                                        <div className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-gray-900">
                                            {data.paymentHistory.map((payment: any) => (
                                                <div key={payment.id} className="flex items-center justify-between p-5 hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                            <CreditCard className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 dark:text-white text-sm">{payment.method || "Fee Payment"}</h4>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{payment.date ? format(new Date(payment.date), "MMM dd, yyyy") : "—"}</p>
                                                            {payment.invoiceNumber && <p className="text-[10px] text-indigo-400 font-bold">Invoice: {payment.invoiceNumber}</p>}
                                                            {payment.receiptNumber && <p className="text-[10px] text-gray-400 font-bold">Receipt: {payment.receiptNumber}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <p className="text-lg font-black text-emerald-600">₹{payment.amount?.toLocaleString()}</p>
                                                        <div className="flex gap-2">
                                                            {payment.invoiceUrl && (
                                                                <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline flex items-center gap-1">
                                                                    <Download className="h-3 w-3" /> Invoice
                                                                </a>
                                                            )}
                                                            {payment.receiptUrl && (
                                                                <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-tighter text-indigo-600 hover:underline flex items-center gap-1">
                                                                    <Download className="h-3 w-3" /> Receipt
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-[2.5rem] bg-white dark:bg-gray-900 p-10">
                                            <div className="flex flex-col items-center text-center">
                                                <Download className="h-8 w-8 text-gray-300 mb-4" />
                                                <h4 className="font-black text-gray-400 uppercase tracking-widest text-sm">Payment History</h4>
                                                <p className="text-xs text-gray-400 mt-1">No payments recorded yet.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Modal */}
                {showPayModal && (
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
                                        <button onClick={() => setCustomAmount(pending.toString())} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">
                                            Pay Full (₹{pending.toLocaleString()})
                                        </button>
                                        <button onClick={() => setCustomAmount(minAmt.toString())} className="text-[10px] font-black uppercase text-amber-600 hover:underline">
                                            Pay Minimum (₹{minAmt.toLocaleString()})
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setShowPayModal(false)} className="flex-1 rounded-2xl bg-gray-100 py-4 text-sm font-black text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10">
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
                )}
            </DashboardLayout>
        </>
    );
}
