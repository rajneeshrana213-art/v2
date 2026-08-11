import { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { AlertCircle, CheckCircle2, Wallet, ArrowLeft, Info, Receipt, User, CreditCard, Banknote, Building2, Smartphone, FileText, ChevronRight, BadgeCheck, Clock, TrendingDown } from 'lucide-react';
import Link from "next/link";
import StudentSearchPicker from "@/components/dashboard/shared/StudentSearchPicker";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { getISTDateString, parseInstitutionalDate } from "@/lib/utils/date-utils";

type PaymentMethod = "CASH" | "CHEQUE" | "UPI" | "BANK_TRANSFER" | "DD" | "CARD";

const METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  CASH: {
    label: "Cash",
    icon: <Banknote className="h-5 w-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  UPI: {
    label: "UPI / QR",
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  CARD: {
    label: "Card",
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  BANK_TRANSFER: {
    label: "Bank Transfer",
    icon: <Building2 className="h-5 w-5" />,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  CHEQUE: {
    label: "Cheque",
    icon: <FileText className="h-5 w-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  DD: {
    label: "Demand Draft",
    icon: <FileText className="h-5 w-5" />,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
};

export default function AdminFinanceCollectPage() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [shouldSendReceipt, setShouldSendReceipt] = useState(true);
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [outstandingBalance, setOutstandingBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ paymentId: string; receiptUrl?: string } | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const isOnline = ["UPI", "CARD", "BANK_TRANSFER"].includes(paymentMethod);
  const numericAmount = parseFloat(amount) || 0;
  const transactionFee = isOnline ? numericAmount * 0.02 : 0;
  const totalAmount = numericAmount + transactionFee;
  const methodCfg = METHOD_CONFIG[paymentMethod];
  const maxAmount = outstandingBalance ?? Infinity;

  // ── inline field errors ──────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!studentId) errs.student = "Please select a student.";

    if (!amount || numericAmount <= 0)
      errs.amount = "Enter a valid amount greater than ₹0.";
    else if (numericAmount < 1)
      errs.amount = "Minimum payment amount is ₹1.";
    else if (outstandingBalance !== null && numericAmount > outstandingBalance)
      errs.amount = `Amount cannot exceed outstanding balance of ₹${outstandingBalance.toLocaleString("en-IN")}.`;

    if (paymentMethod === "CHEQUE" || paymentMethod === "DD") {
      if (!bankName.trim()) errs.bankName = "Bank name is required.";
      if (!branchName.trim()) errs.branchName = "Branch name is required.";
      if (!chequeDate) errs.chequeDate = `${paymentMethod === "CHEQUE" ? "Cheque" : "DD"} date is required.`;
      else if (parseInstitutionalDate(chequeDate) > parseInstitutionalDate(getISTDateString()))
        errs.chequeDate = "Date cannot be in the future.";
      if (!referenceNumber.trim()) errs.referenceNumber = `${paymentMethod === "CHEQUE" ? "Cheque" : "DD"} number is required.`;
    }



    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const fetchBalance = async (sid: string) => {
    if (!sid || !user?.schoolId) return;
    try {
      setBalanceLoading(true);
      const res = await client.get("/v1/finance/reports/outstanding-summary", {
        params: { schoolId: user.schoolId, studentId: sid },
      });
      const data = Array.isArray(res.data)
        ? res.data.find((s: any) => s.studentId === sid)
        : res.data;
      setOutstandingBalance(data?.outstandingAmount || data?.totalOutstanding || 0);
    } catch {
      setOutstandingBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchBalance(studentId);
    else setOutstandingBalance(null);
  }, [studentId, user?.schoolId]);

  const handleOnlinePayment = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const orderRes = await client.post("/v1/finance/collect/create-order", {
        studentId,
        amount: numericAmount,
        schoolId: user?.schoolId,
        paymentMethod,
      });
      const { orderId, keyId, amount: razorpayAmount, currency } = orderRes.data;
      const anyWindow = window as any;
      if (!anyWindow.Razorpay) throw new Error("Razorpay SDK not loaded");
      const rz = new anyWindow.Razorpay({
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayAmount,
        currency: currency || "INR",
        name: "LearnXChain",
        description: `Fee Collection`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            setSubmitting(true);
            const verifyRes = await client.post("/v1/finance/collect/verify-payment", {
              ...response,
              studentId,
              schoolId: user?.schoolId,
              userId: user?.id,
              shouldSendReceipt,
            });
            if (verifyRes.data.success) {
              setSuccess({ paymentId: verifyRes.data.paymentId, receiptUrl: verifyRes.data.receipt?.receiptUrl });
              setAmount("");
              toast.success("Payment collected successfully!");
            }
          } catch (err: any) {
            setError(err?.response?.data?.error || "Payment verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      rz.open();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to initiate payment");
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;
    if (!user?.schoolId || !user.id) return setError("Missing school context.");
    if (isOnline) return handleOnlinePayment();
    try {
      setSubmitting(true);
      const res = await client.post("/v1/finance/collect", {
        studentId,
        amount: numericAmount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        bankName: bankName || undefined,
        branchName: branchName || undefined,
        chequeDate: chequeDate || undefined,
        remarks: remarks || undefined,
        shouldSendReceipt,
        schoolId: user.schoolId,
        userId: user.id,
        idempotencyKey,
      });
      const data = res.data?.data;
      setSuccess({ paymentId: data?.paymentId, receiptUrl: data?.receipt?.receiptUrl });
      setAmount("");
      setReferenceNumber("");
      setRemarks("");
      setBankName("");
      setBranchName("");
      setChequeDate("");
      setIdempotencyKey(crypto.randomUUID());
      toast.success("Payment recorded successfully!");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to collect payment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudentId("");
    setStudentName("");
    setSuccess(null);
    setError(null);
    setAmount("");
    setOutstandingBalance(null);
  };

  return (
    <>
      <Head>
        <title>Collect Fee – Admin | LearnXChain</title>
      </Head>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <DashboardLayout role="admin">
        {/* Full‑screen container */}
        <div className="flex h-full min-h-[calc(100vh-64px)] flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-white/5 dark:bg-gray-900/80">
            <Link
              href="/dashboard/admin/finance"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Finance Dashboard
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span>Finance</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-indigo-600 dark:text-indigo-400">Collect Fee</span>
            </div>
          </div>

          {/* Main split layout */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* Gradient background */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20" />

            {/* LEFT PANEL — Student & Outstanding */}
            <div className="relative flex w-full flex-col gap-5 overflow-y-auto border-r border-gray-100 bg-white/60 p-6 backdrop-blur-sm dark:border-white/5 dark:bg-gray-900/50 md:w-2/5 lg:w-[38%]">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                  Collect Fee
                </h1>
                <p className="mt-0.5 text-sm text-gray-400">
                  Search a student to begin the payment process.
                </p>
              </div>

              {/* Student Search */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Student
                </p>
                <StudentSearchPicker
                  onSelect={(s) => {
                    setStudentId(s?.id || "");
                    setStudentName((s as any)?.name || (s as any)?.user?.name || "");
                  }}
                  className="w-full"
                />
              </div>

              {/* Outstanding balance card */}
              {studentId && (
                <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-xl shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-2">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-200">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Outstanding Balance</span>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">
                      {balanceLoading ? (
                        <Loader size="lg" />
                      ) : (
                        `₹${(outstandingBalance || 0).toLocaleString("en-IN")}`
                      )}
                    </div>
                    {studentName && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-indigo-100">
                        <User className="h-3.5 w-3.5" />
                        <span>{studentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!studentId && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-100 py-12 text-center dark:border-white/5">
                  <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
                    <Wallet className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-300">No student selected</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Search above to view outstanding dues
                    </p>
                  </div>
                </div>
              )}

              {/* Quick tips */}
              <div className="mt-auto rounded-xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-900/20 dark:bg-amber-950/10">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <p className="font-bold">Payment tips</p>
                    <p>• Online payments (UPI, Card, Bank Transfer) have a 2% platform fee.</p>
                    <p>• Receipt will be auto-sent via Email / WhatsApp if enabled.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Payment Form */}
            <div className="relative flex-1 overflow-y-auto p-6 md:p-8">
              {/* Success state */}
              {success ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 text-center animate-in fade-in zoom-in-95">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                    <BadgeCheck className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">Payment Recorded!</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Reference: <span className="font-mono font-semibold text-gray-600 dark:text-gray-300">{success.paymentId}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {success.receiptUrl && (
                      <a
                        href={success.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
                      >
                        <Receipt className="h-4 w-4" />
                        Download Receipt
                      </a>
                    )}
                    <button
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Collect Another Payment
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-50">Payment Details</h2>
                    <p className="mt-0.5 text-sm text-gray-400">Fill in the details to record this payment.</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-600 animate-in fade-in slide-in-from-top-2 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-300 select-none">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        max={outstandingBalance ?? undefined}
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (outstandingBalance !== null && parseFloat(val) > outstandingBalance) {
                            setAmount(String(outstandingBalance));
                          } else {
                            setAmount(val);
                          }
                          clearFieldError("amount");
                        }}
                        className={`w-full rounded-xl border py-3.5 pl-9 pr-4 text-xl font-bold text-gray-900 outline-none transition-all focus:ring-4 dark:text-gray-50 ${fieldErrors.amount
                          ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10 dark:bg-rose-950/10"
                          : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                          }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {fieldErrors.amount && (
                      <p className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                        <AlertCircle className="h-3.5 w-3.5" /> {fieldErrors.amount}
                      </p>
                    )}
                    {outstandingBalance !== null && !fieldErrors.amount && numericAmount > 0 && (
                      <p className="text-xs font-semibold text-emerald-500">
                        ✓ ₹{(outstandingBalance - numericAmount).toLocaleString("en-IN")} will remain outstanding
                      </p>
                    )}
                    {outstandingBalance !== null && (
                      <p className="text-[11px] text-gray-400">
                        Max payable: <span className="font-bold text-gray-600 dark:text-gray-300">₹{outstandingBalance.toLocaleString("en-IN")}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment Method selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(METHOD_CONFIG) as PaymentMethod[]).map((m) => {
                        const cfg = METHOD_CONFIG[m];
                        const selected = paymentMethod === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-bold transition-all ${selected
                              ? `${cfg.border} ${cfg.bg} ${cfg.color} scale-[1.03] shadow-md`
                              : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50 dark:border-white/5 dark:bg-gray-800/50 dark:hover:border-white/10"
                              }`}
                          >
                            <span className={selected ? cfg.color : "text-gray-300"}>{cfg.icon}</span>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Online fee breakdown */}
                  {isOnline && numericAmount > 0 && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm dark:border-indigo-500/20 dark:bg-indigo-500/5 animate-in fade-in slide-in-from-top-2">
                      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <Info className="h-3.5 w-3.5" /> Fee Breakdown
                      </p>
                      <div className="space-y-1.5 text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Base Amount</span>
                          <span>₹{numericAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (2%)</span>
                          <span>₹{transactionFee.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-indigo-100 pt-2 font-extrabold text-indigo-800 dark:border-indigo-500/20 dark:text-indigo-200">
                          <span>Total</span>
                          <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === "CHEQUE" || paymentMethod === "DD") && (
                    <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-left-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bank Name</label>
                        <input
                          value={bankName}
                          onChange={(e) => { setBankName(e.target.value); clearFieldError("bankName"); }}
                          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 ${fieldErrors.bankName ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10" : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                            }`}
                          placeholder="e.g. HDFC Bank"
                        />
                        {fieldErrors.bankName && <p className="text-xs text-rose-500">{fieldErrors.bankName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Branch Name</label>
                        <input
                          value={branchName}
                          onChange={(e) => { setBranchName(e.target.value); clearFieldError("branchName"); }}
                          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 ${fieldErrors.branchName ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10" : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                            }`}
                          placeholder="e.g. MG Road"
                        />
                        {fieldErrors.branchName && <p className="text-xs text-rose-500">{fieldErrors.branchName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {paymentMethod === "CHEQUE" ? "Cheque" : "DD"} Date
                        </label>
                        <input
                          type="date"
                          max={getISTDateString()}
                          value={chequeDate}
                          onChange={(e) => { setChequeDate(e.target.value); clearFieldError("chequeDate"); }}
                          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 ${fieldErrors.chequeDate ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10" : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                            }`}
                        />
                        {fieldErrors.chequeDate && <p className="text-xs text-rose-500">{fieldErrors.chequeDate}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {paymentMethod === "CHEQUE" ? "Cheque" : "DD"} No.
                        </label>
                        <input
                          value={referenceNumber}
                          onChange={(e) => { setReferenceNumber(e.target.value); clearFieldError("referenceNumber"); }}
                          className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-4 ${fieldErrors.referenceNumber ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10" : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                            }`}
                          placeholder="Number"
                        />
                        {fieldErrors.referenceNumber && <p className="text-xs text-rose-500">{fieldErrors.referenceNumber}</p>}
                      </div>
                    </div>
                  )}

                  {/* Reference for UPI / Bank Transfer */}
                  {(paymentMethod === "UPI" || paymentMethod === "BANK_TRANSFER") && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        UTR / Transaction Reference
                      </label>
                      <input
                        value={referenceNumber}
                        onChange={(e) => { setReferenceNumber(e.target.value); clearFieldError("referenceNumber"); }}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 ${fieldErrors.referenceNumber ? "border-rose-400 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-500/10" : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                          }`}
                        placeholder="12-digit UTR or transaction ID"
                      />
                      {fieldErrors.referenceNumber && <p className="text-xs text-rose-500">{fieldErrors.referenceNumber}</p>}
                    </div>
                  )}

                  {/* Reference for CASH (optional) */}
                  {paymentMethod === "CASH" && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Reference No. <span className="normal-case font-normal text-gray-300">(optional)</span>
                      </label>
                      <input
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                        placeholder="Transaction reference"
                      />
                    </div>
                  )}

                  {/* Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Remarks <span className="normal-case font-normal text-gray-300">(optional)</span>
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-gray-900"
                      placeholder="Internal notes..."
                    />
                  </div>

                  {/* Send Receipt toggle */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition-colors hover:bg-gray-50 dark:border-white/5 dark:bg-white/5">
                    <div className="relative h-5 w-10 shrink-0">
                      <input
                        type="checkbox"
                        id="sendReceipt"
                        checked={shouldSendReceipt}
                        onChange={(e) => setShouldSendReceipt(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-10 rounded-full bg-gray-200 transition-colors peer-checked:bg-indigo-500 dark:bg-gray-700" />
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Auto-send receipt</p>
                      <p className="text-xs text-gray-400">Email &amp; WhatsApp the parent automatically</p>
                    </div>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !studentId}
                    className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* Shimmer */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full" />
                    {submitting ? (
                      <>
                        <Loader size="sm" variant="white" />
                        <span>{isOnline ? "Processing..." : "Recording..."}</span>
                      </>
                    ) : !studentId ? (
                      <>
                        <User className="h-5 w-5 opacity-50" />
                        <span>Select a Student First</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5" />
                        <span>
                          {isOnline
                            ? `Pay ₹${totalAmount.toLocaleString("en-IN")}`
                            : `Record ₹${numericAmount.toLocaleString("en-IN") || "–"}`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Timestamps hint */}
                  {numericAmount > 0 && studentId && (
                    <p className="flex items-center gap-1.5 text-center text-xs text-gray-400 justify-center">
                      <Clock className="h-3 w-3" />
                      Dated {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
