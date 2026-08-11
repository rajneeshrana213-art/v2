import { useEffect, useState } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { AlertCircle, FileText, Plus, ArrowLeft, Download, CheckCircle2, X, Receipt, ClipboardList, IndianRupee, Calendar } from 'lucide-react';
import Link from "next/link";
import StudentSearchPicker from "@/components/dashboard/shared/StudentSearchPicker";
import { Loader } from "@/components/ui/feedback/Loader";

interface AdHocInvoice {
  id: string;
  amount: number;
  createdAt: string;
  description?: string | null;
  invoiceUrl?: string | null;
  debitAccount?: { name: string; code: string } | null;
  creditAccount?: { name: string; code: string } | null;
}

export default function AdHocInvoicesPage() {
  const { user } = useAuth();

  const [studentId, setStudentId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<AdHocInvoice[]>([]);
  const [lastInvoiceUrl, setLastInvoiceUrl] = useState<string | null>(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const fetchInvoices = async () => {
    if (!user?.schoolId || !studentId) return;
    try {
      setListLoading(true);
      setListError(null);
      const res = await client.get("/v1/finance/ad-hoc-invoice", {
        params: { schoolId: user.schoolId, studentId },
      });
      setInvoices(res.data || []);
    } catch (err: any) {
      setListError(err?.response?.data?.error || err.message || "Failed to load invoices");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && user?.schoolId) fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, user?.schoolId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLastInvoiceUrl(null);

    if (!user?.schoolId || !user.id) {
      setError("Missing school context.");
      return;
    }
    const numericAmount = parseFloat(amount);
    if (!studentId || !description || !numericAmount || numericAmount <= 0) {
      setError("Student, description and a positive amount are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await client.post("/v1/finance/ad-hoc-invoice", {
        studentId,
        items: [{ description, amount: numericAmount }],
        schoolId: user.schoolId,
        userId: user.id,
      });

      const url = res.data?.invoiceUrl || res.data?.data?.invoiceUrl;
      if (url) setLastInvoiceUrl(url);

      setSuccess(true);
      setDescription("");
      setAmount("");
      await fetchInvoices();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const totalCharged = invoices.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <>
      <Head>
        <title>Ad-hoc Invoices – Finance | LearnXChain</title>
      </Head>

      <DashboardLayout role={(user?.role as any) ?? "admin"}>
        <div className="space-y-6">

          {/* ── Back link ── */}
          <Link
            href="/dashboard/admin/finance"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Finance
          </Link>

          {/* ── Page header ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-6 py-7 shadow-lg shadow-indigo-500/20">
            {/* decorative circles */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Ad-hoc Invoices</h1>
                <p className="mt-0.5 text-sm text-indigo-100">
                  Issue one-time charges for uniforms, trips, events and more.
                </p>
              </div>
            </div>
          </div>

          {/* ── Main two-col grid ── */}
          <div className="grid gap-6 lg:grid-cols-5">

            {/* ── Create form (left, narrower) ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                <div className="border-b border-gray-100 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">New Invoice</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Creates a ledger entry and generates a PDF receipt.
                  </p>
                </div>

                <div className="p-5">
                  {/* Error banner */}
                  {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-800/30 dark:bg-rose-900/20 dark:text-rose-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreate} className="space-y-4">
                    {/* Student picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Student
                      </label>
                      <StudentSearchPicker
                        onSelect={(s) => {
                          setStudentId(s?.id || "");
                          setSuccess(false);
                          setLastInvoiceUrl(null);
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Charge Description
                      </label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-gray-800 dark:focus:bg-gray-700"
                        placeholder="e.g. Winter Uniform Set"
                        required
                      />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Amount (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-gray-800 dark:focus:bg-gray-700"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader size="lg" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Invoice
                        </>
                      )}
                    </button>
                  </form>

                  {/* Success card */}
                  {success && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Invoice created!</p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {lastInvoiceUrl ? "PDF has been generated." : "Ledger entry posted successfully."}
                          </p>
                          {lastInvoiceUrl && (
                            <button
                              onClick={() => setPdfViewerUrl(lastInvoiceUrl)}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Invoice PDF
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── History table (right, wider) ── */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
                {/* header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Invoice History</h2>
                  </div>
                  {invoices.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 dark:bg-indigo-900/30">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {invoices.length} {invoices.length === 1 ? "entry" : "entries"}
                      </span>
                      <span className="text-[10px] text-indigo-400 dark:text-indigo-500">·</span>
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        {formatCurrency(totalCharged)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {listError && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800/30 dark:bg-rose-900/20 dark:text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{listError}</span>
                    </div>
                  )}

                  {!studentId ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <ClipboardList className="h-7 w-7 text-gray-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        No student selected
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Search for a student on the left to view their invoice history.
                      </p>
                    </div>
                  ) : listLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader size="sm" variant="white" />
                      <p className="mt-3 text-sm text-gray-500">Loading invoices…</p>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30">
                        <Receipt className="h-7 w-7 text-indigo-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        No invoices yet
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Create the first ad-hoc charge for this student.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-1">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-white/10">
                            <th className="pb-3 pl-1 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              Date
                            </th>
                            <th className="pb-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              Description
                            </th>
                            <th className="pb-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              Amount
                            </th>
                            <th className="pb-3 pr-1 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                          {invoices.map((inv) => {
                            const cleanDesc = inv.description?.replace(/\|\|\|url:.+/, "").trim() || "—";
                            return (
                              <tr
                                key={inv.id}
                                className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/5"
                              >
                                {/* Date */}
                                <td className="py-3 pl-1 pr-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </td>

                                {/* Description */}
                                <td className="py-3 pr-4 max-w-[220px]">
                                  <p
                                    className="truncate text-sm font-medium text-gray-800 dark:text-gray-200"
                                    title={cleanDesc}
                                  >
                                    {cleanDesc}
                                  </p>
                                </td>

                                {/* Amount */}
                                <td className="py-3 pr-4 text-right">
                                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {formatCurrency(inv.amount)}
                                  </span>
                                </td>

                                {/* Invoice PDF */}
                                <td className="py-3 pr-1 text-center">
                                  {inv.invoiceUrl ? (
                                    <button
                                      onClick={() => setPdfViewerUrl(inv.invoiceUrl!)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 active:scale-95 transition-all dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      View
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* ── In-page PDF Viewer Modal ── */}
      {pdfViewerUrl && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPdfViewerUrl(null);
          }}
        >
          {/* Modal top bar */}
          <div className="flex items-center justify-between bg-gray-950 px-5 py-3 shadow-lg">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Invoice Preview
            </span>
            <div className="flex items-center gap-2">
              <a
                href={pdfViewerUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
              <button
                onClick={() => setPdfViewerUrl(null)}
                className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* PDF iframe */}
          <iframe
            src={pdfViewerUrl}
            className="flex-1 w-full border-0 bg-gray-200"
            title="Invoice PDF"
          />
        </div>
      )}
    </>
  );
}
