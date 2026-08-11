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
import client from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { Wallet, AlertCircle, ArrowLeft, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/feedback/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CollectionPayment {
  id: string;
  amount: number;
  paymentDate: string | null;
  student?: {
    user?: { name: string };
    admissionNo?: string;
    class?: { name: string };
  } | null;
}

interface CollectionsResponse {
  total: number;
  payments: CollectionPayment[];
  pendingDues: number;
}

export default function AdminFinanceCollectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [classId, setClassId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [data, setData] = useState<CollectionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: academicYears = [] } = useQuery({
    queryKey: ["academic-years", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/admin/settings/academic-years");
      const d = res?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.years)) return d.years;
      return [];
    },
    enabled: !!user?.schoolId,
  });

  const activeYearId =
    academicYears.find((y: any) => y.isActive)?.id || academicYears[0]?.id;

  useEffect(() => {
    if (activeYearId && !academicYearId) {
      setAcademicYearId(activeYearId);
    }
  }, [activeYearId, academicYearId]);

  const { data: classes = [] } = useQuery({
    queryKey: ["admin-classes", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/dashboard/admin/classes");
      return res.data || [];
    },
    enabled: !!user?.schoolId,
  });

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.schoolId) {
        throw new Error("Missing school context for current user");
      }

      const res = await client.get("/v1/finance/reports/collections", {
        params: {
          schoolId: user.schoolId,
          startDate,
          endDate,
          classId: classId === "all" ? undefined : classId,
          academicYearId: academicYearId || undefined,
        },
      });

      setData(res.data);
    } catch (err: any) {
      console.error("Collections fetch error:", err);
      setError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to load collections"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    // Don't fetch until the active academic year has been resolved and set.
    if (!academicYearId) return;
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, academicYearId, classId, startDate, endDate]);

  return (
    <>
      <Head>
        <title>Collections – Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Back link */}
          <Link
            href="/dashboard/admin/finance"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Finance Dashboard
          </Link>

          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Collections Report
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Detailed view of fee payments and outstanding dues.
              </p>
            </div>
          </div>

          {/* ── Single centered loader while data is in-flight ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-24 shadow-sm dark:border-white/10 dark:bg-gray-900">
              <Loader size="lg" />
              <p className="mt-4 text-sm font-medium text-gray-400 dark:text-gray-500">
                Loading collections…
              </p>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Collected
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(data?.total || 0)}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-gray-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Total Pending
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(data?.pendingDues || 0)}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Transactions
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {data?.payments?.length || 0}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters + table */}
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                      Refine your collection report.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Session */}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                        Session
                      </p>
                      <Select
                        value={academicYearId}
                        onValueChange={setAcademicYearId}
                      >
                        <SelectTrigger className="h-9 w-32 rounded-xl border-indigo-100 bg-white/50 px-4 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300">
                          <SelectValue placeholder="Session">
                            {academicYears.find(
                              (y: any) => y.id === academicYearId
                            )?.year ||
                              (academicYears.length === 0
                                ? "Loading..."
                                : "Select Session")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((y: any) => (
                            <SelectItem key={y.id} value={y.id}>
                              {y.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Class */}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                        Class
                      </p>
                      <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger className="h-9 w-32 rounded-xl border-indigo-100 bg-white/50 px-4 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300">
                          <SelectValue placeholder="All Classes">
                            {classId === "all"
                              ? "All Classes"
                              : classes.find((c: any) => c.id === classId)
                                  ?.name || "Select Class"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* From */}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                        From
                      </p>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 rounded-xl border border-gray-100 bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/5 dark:bg-gray-800"
                      />
                    </div>

                    {/* To */}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                        To
                      </p>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 rounded-xl border border-gray-100 bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/5 dark:bg-gray-800"
                      />
                    </div>

                    {/* Refresh */}
                    <div className="pt-5">
                      <button
                        onClick={fetchCollections}
                        disabled={loading}
                        className="flex h-9 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-60"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!data || data.payments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No collections found for the selected range.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-2 text-left">Date</th>
                            <th className="py-2 text-left">Student</th>
                            <th className="py-2 text-left">Class</th>
                            <th className="py-2 text-left">Admission No</th>
                            <th className="py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.payments.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b border-gray-50 last:border-0"
                            >
                              <td className="py-2 pr-4 text-gray-500">
                                {p.paymentDate
                                  ? new Date(p.paymentDate).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "-"}
                              </td>
                              <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-50">
                                {p.student?.user?.name || "N/A"}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {p.student?.class?.name || "N/A"}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {p.student?.admissionNo || "-"}
                              </td>
                              <td className="py-2 pl-4 text-right font-semibold text-emerald-600">
                                {formatCurrency(p.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
