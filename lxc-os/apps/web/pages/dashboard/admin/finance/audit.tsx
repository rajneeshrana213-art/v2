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
import { AlertCircle, ShieldCheck, Users, ArrowLeft } from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import Link from "next/link";

interface SecurityReport {
  totalOperations: number;
  largeAmountOperations: number;
  failedOperations: number;
  suspiciousActivities: number;
  topUsers: Array<{ userId: string; userName?: string; operationCount: number }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string | null;
    amount: number;
    createdBy: string;
  }>;
}

export default function AdminFinanceAuditPage() {
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.schoolId) {
          throw new Error("Missing school context for current user");
        }

        const res = await client.get("/v1/finance/audit/security", {
          params: { schoolId: user.schoolId },
        });
        setReport(res.data);
      } catch (err: any) {
        console.error("Audit report load error:", err);
        setError(
          err?.response?.data?.error ||
          err.message ||
          "Failed to load audit report"
        );
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError("You must be logged in as a school accounts user to view this.");
      return;
    }

    fetchReport();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600" />
              <div>
                <CardTitle>Audit Error</CardTitle>
                <CardDescription>
                  Could not load audit/security report.
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
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Audit & Security – Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <Link
            href="/dashboard/admin/finance"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Finance Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Audit & Security
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                High-level view of financial activity volume and top operators.
              </p>
            </div>
            <Badge
              variant="soft"
              tone="warning"
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold"
            >
              <ShieldCheck className="h-4 w-4" />
              Last 30 days
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Metric
              label="Total Operations"
              value={report.totalOperations}
              tone="indigo"
            />
            <Metric
              label="Large Amount Ops"
              value={report.largeAmountOperations}
              tone="amber"
            />
            <Metric
              label="Failed Ops (tracked)"
              value={report.failedOperations}
              tone="rose"
            />
            <Metric
              label="Suspicious Flags"
              value={report.suspiciousActivities}
              tone="emerald"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Top Users */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Top Finance Users</CardTitle>
                <CardDescription className="text-[10px]">Active operators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topUsers.map(u => (
                    <div key={u.userId} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">{u.userName || u.userId}</p>
                        <p className="text-[10px] text-gray-400">ID: {u.userId.slice(0, 8)}...</p>
                      </div>
                      <Badge variant="soft" tone="neutral" className="text-[10px]">
                        {u.operationCount} ops
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transaction Log */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Financial Audit Trail</CardTitle>
                    <CardDescription className="text-[10px]">Most recent 10 operations across the school.</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[9px]">LATEST ACTIVITY</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                        <th className="py-2 text-left font-medium">Date</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-left font-medium">Operator</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {report.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="py-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tx.type.includes('PAYMENT') ? 'bg-emerald-50 text-emerald-600' :
                              tx.type.includes('DEMAND') ? 'bg-indigo-50 text-indigo-600' :
                                'bg-gray-50 text-gray-600'
                              }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600">{tx.createdBy}</td>
                          <td className="py-2 text-right font-bold">₹{tx.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "indigo" | "amber" | "rose" | "emerald";
}) {
  const toneMap: Record<typeof tone, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
  } as any;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {value}
          </div>
          <div
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneMap[tone]}`}
          >
            Ops
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


