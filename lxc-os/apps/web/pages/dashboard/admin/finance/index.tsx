import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Ticket,
  HelpCircle,
  CheckCircle2,
  Info,
  Calendar,
  CreditCard,
  Table as TableIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

export default function AdminFinanceDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ["finance-summary", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/outstanding-summary", {
        params: { schoolId: user?.schoolId },
      });
      return res.data as Summary;
    },
    enabled: !!user?.schoolId,
  });

  const { data: aging = [], isLoading: agingLoading } = useQuery({
    queryKey: ["finance-aging", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/aging", {
        params: { schoolId: user?.schoolId },
      });
      return res.data as AgingBucket[];
    },
    enabled: !!user?.schoolId,
  });

  const { data: classReceivables = [], isLoading: classLoading } = useQuery({
    queryKey: ["finance-class-receivables", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/class-receivables", {
        params: { schoolId: user?.schoolId },
      });
      return res.data as ClassReceivable[];
    },
    enabled: !!user?.schoolId,
  });

  const { data: defaulters = [], isLoading: defaultersLoading } = useQuery({
    queryKey: ["finance-defaulters", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/defaulters", {
        params: { schoolId: user?.schoolId },
      });
      return res.data as Defaulter[];
    },
    enabled: !!user?.schoolId,
  });

  const [view, setView] = useState<"modules" | "analytics">("analytics");

  const error = summaryError ? (summaryError as any)?.response?.data?.error || (summaryError as any).message : null;
  const loading = summaryLoading || agingLoading || classLoading || defaultersLoading;

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const agingChartData = {
    labels: aging.map((b: AgingBucket) => b.name),
    datasets: [
      {
        label: "Outstanding",
        data: aging.map((b: AgingBucket) => b.amount),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
    ],
  };

  const classChartData = {
    labels: classReceivables.map((c: ClassReceivable) => c.className),
    datasets: [
      {
        label: "Outstanding",
        data: classReceivables.map((c: ClassReceivable) => c.totalOutstanding),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
      {
        label: "Collected",
        data: classReceivables.map((c: ClassReceivable) => c.totalPaid),
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Fees & Accounts
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Live view of collections, dues, and defaulters for your school.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FinanceUserGuide />
              <div className="flex rounded-full bg-gray-100 p-1 text-xs font-semibold dark:bg-gray-900/60">
                <button
                  type="button"
                  onClick={() => setView("modules")}
                  className={`px-3 py-1 rounded-full transition ${view === "modules"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  Modules
                </button>
                <button
                  type="button"
                  onClick={() => setView("analytics")}
                  className={`px-3 py-1 rounded-full transition ${view === "analytics"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  Analytics
                </button>
              </div>
              <Link
                href="/dashboard/admin/finance/collect"
                className="hidden md:flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] px-5 py-2 text-sm font-semibold whitespace-nowrap"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span>Collect Fee</span>
              </Link>
              <Badge
                variant="soft"
                tone="success"
                className="hidden md:flex items-center gap-1 px-3 py-1 text-xs font-semibold"
              >
                <Wallet className="h-4 w-4" />
                Collection Rate {summary.collectionRate.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {view === "modules" ? (
            <div className="space-y-10">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-1 bg-indigo-500 rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Step 1: Setup & Initialization
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={ArrowRightLeft}
                    title="Data Import"
                    description="Bulk upload accounts, fee structures, and existing balances."
                    href="/dashboard/admin/finance/data-import"
                  />
                  <ModuleCard
                    icon={Layers}
                    title="Fee Setup"
                    description="Create fee structures, configure heads and assign plans to students."
                    href="/dashboard/admin/finance/fee-setup"
                  />
                  <ModuleCard
                    icon={Ticket}
                    title="Concessions"
                    description="Apply fee waivers, discounts and scholarships to students."
                    href="/dashboard/admin/finance/concessions"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Step 2: Daily Operations
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={Wallet}
                    title="Collect Fee"
                    description="Record mid-session payments and generate interactive receipts."
                    href="/dashboard/admin/finance/collect"
                  />
                  <ModuleCard
                    icon={TrendingUp}
                    title="Transactions"
                    description="Manage day-to-day operational expenses and misc. income."
                    href="/dashboard/admin/finance/transactions"
                  />
                  <ModuleCard
                    icon={FileText}
                    title="Ad-hoc Invoices"
                    description="Create and review one-time charges or special billing."
                    href="/dashboard/admin/finance/ad-hoc-invoices"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-1 bg-amber-500 rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Step 3: Monitoring & Records
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={Users}
                    title="Student Dues"
                    description="View student-wise outstanding balances and defaulter lists."
                    href="/dashboard/admin/finance/student-fees"
                  />
                  <ModuleCard
                    icon={Wallet}
                    title="Collections Log"
                    description="Audit historical payment records in a custom date range."
                    href="/dashboard/admin/finance/collections"
                  />
                  <ModuleCard
                    icon={FileText}
                    title="Finance Reports"
                    description="Export key financial statements and fee collection summaries."
                    href="/dashboard/admin/finance/reports"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-1 bg-rose-500 rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Governance & Insights
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ModuleCard
                    icon={LayoutDashboard}
                    title="Finance Dashboard"
                    description="Real-time analytics and collections performance summary."
                    href="/dashboard/admin/finance"
                    onClick={(e) => {
                      e.preventDefault();
                      setView("analytics");
                    }}
                  />
                  <ModuleCard
                    icon={ShieldCheck}
                    title="Audit & Security"
                    description="High-level audit metrics and system activity logs."
                    href="/dashboard/admin/finance/audit"
                  />
                </div>
              </section>
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
                          {defaulters.map((d: Defaulter) => (
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

function FinanceUserGuide() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex shrink-0 items-center gap-2 rounded-full border-indigo-200 bg-indigo-50/50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-400"
                >
                    <HelpCircle className="h-4 w-4" />
                    <span>Quick Help</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <HelpCircle className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">How things work</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">The Finance Engine Guide</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        A friendly guide to managing your school's finances step-by-step.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-8 pb-4">
                    <GuideStep
                        number="01"
                        icon={ArrowRightLeft}
                        title="Step 1: Housekeeping & Initialization"
                        description="Before you start, you'll need a place for your money. If you have existing data (like old balances), use 'Data Import'. If you're starting fresh, click 'Initialize Chart of Accounts' in Data Import to create your main fee accounts (Cash, Bank, Ledger) instantly."
                        color="bg-purple-100 text-purple-600"
                    />

                    <GuideStep
                        number="02"
                        icon={Layers}
                        title="Step 2: Define your Fee Categories (Fee Heads)"
                        description="Head over to 'Fee Setup'. Think about what you charge for: Tuition Fees, Transport, Exams, or Admission. Each category needs to be linked to a 'Revenue Account' (e.g., 'Tuition Income') so the receipts and bank logs match correctly."
                        color="bg-indigo-100 text-indigo-600"
                    />

                    <GuideStep
                        number="03"
                        icon={TableIcon}
                        title="Step 3: Create Fee Structures"
                        description="Still in 'Fee Setup', decide how much to charge for each category and when. You can create different plans for different classes (e.g., 'Grade 10 Monthly Plan'). This is where you set the amounts and the due dates for the whole year."
                        color="bg-emerald-100 text-emerald-600"
                    />

                    <GuideStep
                        number="04"
                        icon={Users}
                        title="Step 4: The Handshake (Assignment)"
                        description="Now, 'Assign' these plans to your students. You can do this one-by-one or in bulk for a whole class. Once assigned, the system automatically calculates exactly how much each child owes and when."
                        color="bg-amber-100 text-amber-600"
                    />

                    <GuideStep
                        number="05"
                        icon={Wallet}
                        title="Step 5: Daily Collections & Operations"
                        description="When a parent arrives, click 'Collect Fee'. Search for the student, enter the amount, choose the payment method (Cash/Bank), and print the receipt. The system handles all the complex accounting (debits/credits) in the background automatically."
                        color="bg-rose-100 text-rose-600"
                    />

                    <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/20">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-white p-1 text-indigo-600 dark:bg-gray-800">
                                <Info className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Pro Tip for Admins</h4>
                                <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
                                    Use the 'Finance Dashboard' toggle to see your collection rate and dues list. It’s a great way to catch your top defaulters early in the month!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function GuideStep({ number, icon: Icon, title, description, color }: any) {
    return (
        <div className="relative flex gap-6 group">
            <div className="flex flex-col items-center">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="h-full w-px bg-gray-100 mt-2 dark:bg-gray-800" />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-black tracking-tighter text-gray-300 group-hover:text-indigo-200 transition-colors uppercase">{number}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </div>
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
            <Card className="group h-full cursor-pointer transition hover:border-indigo-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}

