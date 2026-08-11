import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
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
import Link from "next/link";
import {
  Wallet,
  AlertCircle,
  ArrowRightLeft,
  TrendingUp,
  BarChart3,
  Users,
  GraduationCap,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";

const Bar = dynamic(
  () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Bar })),
  { ssr: false }
);

interface Summary {
  totalOutstanding: number;
  totalPaid: number;
  totalDemand: number;
  defaultersCount: number;
  totalStudents: number;
  collectionRate: number;
}

interface AgingBucket {
  name: string;
  amount: number;
}

interface ClassReceivable {
  className: string;
  totalOutstanding: number;
  totalPaid: number;
  totalDemand: number;
  defaultersCount: number;
  totalStudents: number;
  collectionRate: number;
}

interface Defaulter {
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  outstandingAmount: number;
}

export default function AdminAccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [classReceivables, setClassReceivables] = useState<ClassReceivable[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"modules" | "analytics">("analytics");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In current APIs schoolId & academicYearId are expected as query.
        // We derive schoolId from the authenticated user and let backend
        // infer the active academic year for that school.
        if (!user?.schoolId) {
          throw new Error("Missing school context for current user");
        }

        const schoolId = user.schoolId;

        const [summaryRes, agingRes, classRes, defRes] = await Promise.all([
          client.get("/v1/finance/reports/outstanding-summary", {
            params: { schoolId },
          }),
          client.get("/v1/finance/reports/aging", {
            params: { schoolId },
          }),
          client.get("/v1/finance/reports/class-receivables", {
            params: { schoolId },
          }),
          client.get("/v1/finance/reports/defaulters", {
            params: { schoolId },
          }),
        ]);

        setSummary(summaryRes.data);
        setAging(agingRes.data || []);
        setClassReceivables(classRes.data || []);
        setDefaulters(defRes.data || []);
      } catch (err: any) {
        console.error("Failed to load accounts dashboard:", err);
        setError(err?.response?.data?.error || err.message || "Failed to load accounts data");
      } finally {
        setLoading(false);
      }
    };

    // Wait for auth to resolve before deciding what to do
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("You must be logged in as a school admin to view accounts.");
      return;
    }

    fetchData();
  }, [user, authLoading]);

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const agingChartData = {
    labels: aging.map((b) => b.name),
    datasets: [
      {
        label: "Outstanding",
        data: aging.map((b) => b.amount),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
    ],
  };

  const classChartData = {
    labels: classReceivables.map((c) => c.className),
    datasets: [
      {
        label: "Outstanding",
        data: classReceivables.map((c) => c.totalOutstanding),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
      {
        label: "Collected",
        data: classReceivables.map((c) => c.totalPaid),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
    ],
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !summary) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600" />
              <div>
                <CardTitle>Finance Dashboard Error</CardTitle>
                <CardDescription>
                  Could not load fee & accounts data.
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
        <title>Fees & Accounts – Admin | LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:from-indigo-950/80 dark:via-slate-900 dark:to-emerald-950/80 dark:text-indigo-300">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
                Finance Workspace
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-3xl">
                  Fees & Accounts
                </h1>
                <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  A calm, single place to see collections, dues, and defaulters for your school&apos;s fees engine.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              {/* View toggle */}
              <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-semibold shadow-sm ring-1 ring-black/5 dark:bg-gray-900/60 dark:ring-white/5">
                <button
                  type="button"
                  onClick={() => setView("modules")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${view === "modules"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Modules
                </button>
                <button
                  type="button"
                  onClick={() => setView("analytics")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${view === "analytics"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </button>
              </div>

              {/* Key stat pill */}
              <Badge
                variant="soft"
                tone="success"
                className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm md:inline-flex"
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <Wallet className="h-3.5 w-3.5" />
                Collection Rate
                <span className="font-bold">
                  {summary.collectionRate.toFixed(1)}%
                </span>
              </Badge>
            </div>
          </div>

          {view === "modules" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ModuleCard
                icon={LayoutDashboard}
                title="Finance Dashboard"
                description="Overview of demand, collections, dues and defaulters."
                href="/dashboard/admin/finance"
                onClick={(e) => {
                  e.preventDefault();
                  setView("analytics");
                }}
              />
              <ModuleCard
                icon={Layers}
                title="Fee Setup"
                description="Create fee structures, configure fee heads and map them to students."
                href="/dashboard/admin/finance/fee-setup"
              />
              <ModuleCard
                icon={Wallet}
                title="Collections"
                description="See all payments collected in a date range."
                href="/dashboard/admin/finance/collections"
              />
              <ModuleCard
                icon={Users}
                title="Student Fees"
                description="Monitor student-wise dues and defaulters list."
                href="/dashboard/admin/finance/student-fees"
              />
              <ModuleCard
                icon={FileText}
                title="Finance Reports"
                description="Jump into collections and dues reports quickly."
                href="/dashboard/admin/finance/reports"
              />
              <ModuleCard
                icon={Wallet}
                title="Collect Fee"
                description="Record mid-session fee payments and receipts."
                href="/dashboard/admin/finance/collect"
              />
              <ModuleCard
                icon={FileText}
                title="Ad-hoc Invoices"
                description="Create one-time charges and view history."
                href="/dashboard/admin/finance/ad-hoc-invoices"
              />
              <ModuleCard
                icon={ShieldCheck}
                title="Audit & Security"
                description="High-level audit metrics for finance operations."
                href="/dashboard/admin/finance/audit"
              />
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-4">
                <MetricCard
                  title="Total Demand"
                  value={formatCurrency(summary.totalDemand)}
                  icon={TrendingUp}
                  tone="indigo"
                  subtitle="All fee raised this year"
                />
                <MetricCard
                  title="Collected"
                  value={formatCurrency(summary.totalPaid)}
                  icon={ArrowRightLeft}
                  tone="emerald"
                  subtitle="Total fee collected"
                />
                <MetricCard
                  title="Outstanding"
                  value={formatCurrency(summary.totalOutstanding)}
                  icon={BarChart3}
                  tone="rose"
                  subtitle="Pending receivables"
                />
                <MetricCard
                  title="Defaulters"
                  value={summary.defaultersCount}
                  icon={Users}
                  tone="amber"
                  subtitle={`${summary.totalStudents} active students`}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Class-wise Receivables</CardTitle>
                      <CardDescription>
                        Compare dues and collections across classes.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <Bar
                      data={classChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                        },
                        scales: {
                          y: {
                            grid: { color: "rgba(0,0,0,0.05)" },
                          },
                          x: {
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Aging of Dues</CardTitle>
                    <CardDescription>
                      How long outstanding balances have been pending.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    <Bar
                      data={agingChartData}
                      options={{
                        indexAxis: "y" as const,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { color: "rgba(0,0,0,0.05)" } },
                          y: { grid: { display: false } },
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Defaulters</CardTitle>
                    <CardDescription>
                      Students with the highest outstanding balances.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <GraduationCap className="h-3 w-3" />
                    {defaulters.length} records
                  </Badge>
                </CardHeader>
                <CardContent>
                  {defaulters.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Great! There are currently no major outstanding dues.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                            <th className="py-2 text-left">Student</th>
                            <th className="py-2 text-left">Class</th>
                            <th className="py-2 text-left">Admission No</th>
                            <th className="py-2 text-right">Outstanding</th>
                          </tr>
                        </thead>
                        <tbody>
                          {defaulters.map((d) => (
                            <tr
                              key={d.studentId}
                              className="border-b border-gray-50 last:border-0"
                            >
                              <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-50">
                                {d.studentName}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {d.className || "N/A"}
                              </td>
                              <td className="py-2 pr-4 text-gray-500">
                                {d.admissionNo || "-"}
                              </td>
                              <td className="py-2 pl-4 text-right font-semibold text-rose-600">
                                {formatCurrency(d.outstandingAmount)}
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

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  tone: "indigo" | "emerald" | "rose" | "amber";
}) {
  const toneMap: Record<typeof tone, string> = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
  } as any;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
          {title}
        </CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${toneMap[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-50">
          {value}
        </div>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <Card className="group relative h-full cursor-pointer overflow-hidden border-transparent bg-gradient-to-b from-white/90 via-white to-slate-50/90 text-left shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg hover:ring-indigo-100 dark:from-slate-950/80 dark:via-slate-950 dark:to-slate-900/80 dark:ring-white/5 dark:hover:border-indigo-500/40 dark:hover:ring-indigo-500/40">
        <div className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity group-hover:opacity-100 dark:opacity-100 dark:group-hover:opacity-80">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>
        <CardHeader className="relative z-10 flex flex-row items-center gap-3 space-y-0 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-400/10 text-indigo-600 ring-1 ring-indigo-500/15 group-hover:from-indigo-500/20 group-hover:via-sky-500/20 group-hover:to-emerald-400/20 dark:text-indigo-200">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              {title}
            </CardTitle>
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-300">
              Finance Module
            </span>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 flex items-end justify-between gap-2 pt-1">
          <CardDescription className="max-w-[70%] text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </CardDescription>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200">
            Open
            <ArrowRightLeft className="h-3 w-3" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}


