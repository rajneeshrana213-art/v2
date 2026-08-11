import { useState } from "react";
import { useRouter } from "next/router";
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
import { AlertCircle, ArrowLeft, BarChart3, Wallet, FileText, Download, X, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Balance {
  receivable: number;
  advance: number;
  netBalance: number;
  collected: number;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: string;
  description: string | null;
  amount: number;
  debit: string;
  credit: string;
  invoiceUrl?: string;
}

interface LedgerResponse {
  studentId: string;
  studentProfile?: {
    name: string;
    admissionNo: string;
    className: string;
  };
  balance: Balance;
  ledger: LedgerEntry[];
}

export default function StudentLedgerPage() {
  const router = useRouter();
  const { studentId } = router.query;
  const { user } = useAuth();
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["student-ledger", studentId, user?.schoolId],
    queryFn: async () => {
      const res = await client.get(`/v1/finance/ledger/${studentId}`, {
        params: { schoolId: user?.schoolId },
      });
      return res.data as LedgerResponse;
    },
    enabled: !!studentId && !!user?.schoolId,
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["student-invoices", studentId, user?.schoolId],
    queryFn: async () => {
      // First get active academic year if not clear
      const ayRes = await client.get("/v1/admin/settings/academic-years");
      const activeAY = ayRes.data?.find((y: any) => y.isActive) || ayRes.data?.[0];

      if (!activeAY) return [];

      const res = await client.get(`/v1/finance/student-invoices`, {
        params: { studentId, academicYearId: activeAY.id },
      });
      return res.data;
    },
    enabled: !!studentId && !!user?.schoolId,
  });

  const error = queryError ? (queryError as any)?.response?.data?.error || (queryError as any).message : null;

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (!studentId) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-4">
          <Link
            href="/dashboard/admin/finance/student-fees"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to Student Fees
          </Link>
          <div className="flex h-[50vh] items-center justify-center">
            <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
              <CardHeader className="flex flex-row items-center gap-3">
                <AlertCircle className="h-6 w-6 text-rose-600" />
                <div>
                  <CardTitle>Student Ledger Error</CardTitle>
                  <CardDescription>
                    Could not load fee ledger for this student.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rose-500">
                  {error || "Please try again in a moment."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { balance, ledger } = data;

  return (
    <>
      <Head>
        <title>Student Ledger – Accounts | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin/finance/student-fees"
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-900/60 dark:text-gray-200"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Student Finance Profile
                </h1>
                {data.studentProfile ? (
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{data.studentProfile.name}</span>
                    <span>•</span>
                    <span> {data.studentProfile.className}</span>
                    <span>•</span>
                    <span>Adm: {data.studentProfile.admissionNo}</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Student ID: {studentId}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200"
              >
                <Wallet className="h-3.5 w-3.5" />
                Print Statement
              </button>
              <Badge
                variant="soft"
                tone={balance.netBalance > 0 ? "warning" : "success"}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold"
              >
                <BarChart3 className="h-4 w-4" />
                Net Balance {formatCurrency(balance.netBalance)}
              </Badge>
            </div>
          </div>

          <style jsx global>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
              .Card { border: none !important; box-shadow: none !important; }
              table { width: 100% !important; border: 1px solid #eee !important; }
              th, td { border-bottom: 1px solid #eee !important; }
            }
          `}</style>

          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total Demand" value={formatCurrency(balance.receivable)} />
            <Metric label="Collected" value={formatCurrency(balance.collected)} />
            <Metric
              label="Advance"
              value={formatCurrency(balance.advance)}
            />
            <Metric
              label="Net Balance"
              value={formatCurrency(balance.netBalance)}
              highlight
            />
          </div>

          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="bg-gray-100/50 p-1 dark:bg-gray-900/50">
              <TabsTrigger value="schedule" className="text-xs font-bold px-6">Installment Schedule</TabsTrigger>
              <TabsTrigger value="ledger" className="text-xs font-bold px-6">Ledger Account</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Installment Schedule</CardTitle>
                  <CardDescription>
                    Upcoming and past installments for the current session.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingInvoices ? (
                    <div className="flex h-40 items-center justify-center"><Loader size="sm" /></div>
                  ) : invoices.length === 0 ? (
                    <p className="text-sm text-gray-500 py-10 text-center">No installments generated yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-2 text-left">Month / Period</th>
                            <th className="py-2 text-left">Fee Category</th>
                            <th className="py-2 text-left">Due Date</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2 text-right">Paid</th>
                            <th className="py-2 text-right">Balance</th>
                            <th className="py-2 text-center w-32">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv: any) => {
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const period = inv.month ? months[inv.month - 1] + " " + inv.year : "ONE-TIME";

                            return (
                              <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 pr-4 font-bold text-gray-900 dark:text-gray-100">{period}</td>
                                <td className="py-3 pr-4 text-xs font-medium text-gray-500">{inv.feeHead?.name}</td>
                                <td className="py-3 pr-4 text-xs text-gray-500">
                                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "-"}
                                </td>
                                <td className="py-3 px-4 text-right font-bold">{formatCurrency(inv.grossAmount)}</td>
                                <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatCurrency(inv.paidAmount)}</td>
                                <td className="py-3 pl-4 text-right font-black text-rose-600">{formatCurrency(inv.balanceAmount)}</td>
                                <td className="py-3 px-4 text-center">
                                  <Badge
                                    variant="soft"
                                    tone={
                                      inv.status === "PAID" ? "success" :
                                        inv.status === "OVERDUE" ? "danger" :
                                          inv.status === "PARTIALLY_PAID" ? "warning" : "info"
                                    }
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    {inv.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ledger">
              <Card>
                <CardHeader>
                  <CardTitle>Ledger Entries</CardTitle>
                  <CardDescription>
                    All finance ledger entries for this student in the active
                    academic year.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ledger.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No ledger entries found for this student.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-2 text-left">Date</th>
                            <th className="py-2 text-left">Type</th>
                            <th className="py-2 text-left">Debit</th>
                            <th className="py-2 text-left">Credit</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2 text-center w-24">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledger.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-gray-50 last:border-0"
                            >
                              <td className="py-2 pr-4 text-gray-500">
                                {new Date(entry.date).toLocaleDateString("en-IN")}
                              </td>
                              <td className="py-2 pr-4 text-xs font-semibold text-gray-700">
                                {entry.type}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {entry.debit}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {entry.credit}
                              </td>
                              <td className="py-2 pl-4 text-right font-semibold text-gray-900 dark:text-gray-50">
                                {formatCurrency(entry.amount)}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {entry.invoiceUrl ? (
                                  <button
                                    onClick={() => setPdfViewerUrl(entry.invoiceUrl!)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    View
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* PDF Viewer Modal */}
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
      </DashboardLayout>
    </>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`text-xl font-bold ${highlight
            ? "text-rose-600 dark:text-rose-400"
            : "text-gray-900 dark:text-gray-50"
            }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}


