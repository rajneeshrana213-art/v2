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
import Link from "next/link";

import { Users, GraduationCap, Briefcase, School, Building, Bus, Ticket, TrendingUp, TrendingDown, Calendar, Bell, CheckCircle2, Clock, AlertCircle, Sparkles, Zap, Award, Activity, FileText, Settings, UserPlus, ArrowRight, TrendingUp as GrowthIcon, Wallet, BookOpen } from 'lucide-react';
import { Loader } from "@/components/ui/feedback/Loader";
import { motion, AnimatePresence } from "framer-motion";
import client from "@/lib/api/client";

const Line = dynamic(
  () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Line })),
  { ssr: false }
);
const Bar = dynamic(
  () => import("@/lib/chartjs-setup").then(() => import("react-chartjs-2")).then((m) => ({ default: m.Bar })),
  { ssr: false }
);

interface DashboardData {
  keyMetrics: {
    totalStudents: { total: number; active: number; inactive: number; percentageChange: string };
    totalTeachers: { total: number; active: number; inactive: number; percentageChange: string };
    totalStaff: { total: number; active: number; inactive: number; percentageChange: string };
    totalClasses: { total: number; active: number; inactive: number; percentageChange: string };
    totalSubjects: { total: number; active: number; inactive: number; percentageChange: string };
    facilities: { hostels: number; libraries: number; buses: number; drivers: number };
    interactions: { totalTickets: number; openTickets: number; pendingFeedback: number };
  };
  attendance: {
    overallPercentage: number;
    issues: {
      students: { emergency: number };
      teachers: { absent: number };
      staff: { late: number; emergency: number; absent: number };
    };
  };
  earnings: { total: number; graphData: { month: string; value: number }[] };
  expenses: { total: number; graphData: { month: string; value: number }[] };
  notices: { title: string; date: string; daysSince: number; icon: string; color: string }[];
  leaveRequests: {
    requests: {
      id: string;
      user: { name: string; role: string; avatar: string };
      type: string;
      from: string;
      to: string;
      reason: string;
      status: string
    }[]
  };
  performanceMetrics: {
    month: string;
    data: { top: number; average: number; belowAverage: number };
    availableMonths: string[];
  };
  studentActivities: {
    filter: string;
    activities: { title: string; description: string; image: string }[];
  };
  starStudents: {
    name: string;
    class: string;
    image: string;
    averageScore: number;
  };
  bestPerformer: {
    name: string;
    role: string;
    image: string;
    averageScore: number;
  };
  feesCollectionChart: {
    filter: string;
    data: { quarter: string; totalFee: number; collectedFee: number }[];
  };
  aiInsights: {
    summary: string;
    score: number;
    status: string;
    trend: string;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get("/v1/dashboard/school-admin");
        setData(response.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);

        // Extract more detailed error information
        const errorMessage = err?.response?.data?.message
          || err?.response?.data?.error
          || err?.message
          || "An unexpected error occurred";

        // Provide more specific error messages based on status code
        let userFriendlyMessage = errorMessage;
        if (err?.response?.status === 500) {
          userFriendlyMessage = "Server error occurred. Please try again later or contact support if the issue persists.";
        } else if (err?.response?.status === 404) {
          userFriendlyMessage = "Dashboard data not found. Please refresh the page.";
        } else if (err?.response?.status === 403) {
          userFriendlyMessage = "You don't have permission to access this dashboard.";
        } else if (err?.response?.status === 401) {
          userFriendlyMessage = "Your session has expired. Please log in again.";
        }

        setError(userFriendlyMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-sm font-medium text-gray-500 animate-pulse">Loading dashboard intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Error Loading Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-rose-500">{error || "Could not retrieve school data. Please try again later."}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const {
    keyMetrics: _keyMetrics,
    attendance: _attendance,
    earnings,
    expenses,
    notices,
    leaveRequests,
    performanceMetrics,
    studentActivities,
    starStudents,
    bestPerformer,
    feesCollectionChart = { filter: "", data: [] } as DashboardData["feesCollectionChart"],
    aiInsights
  } = data ?? {};

  const keyMetrics = _keyMetrics ?? ({} as DashboardData["keyMetrics"]);
  const attendance = _attendance ?? ({} as DashboardData["attendance"]);

  const earningsGraphData = earnings?.graphData ?? [];
  const expensesGraphData = expenses?.graphData ?? [];

  const financeChartData = {
    labels: earningsGraphData.map(d => d.month),
    datasets: [
      {
        label: "Earnings",
        data: earningsGraphData.map(d => d.value),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: expensesGraphData.map(d => d.value),
        borderColor: "rgb(244, 63, 94)",
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const attendancePercentage = attendance?.overallPercentage ?? 0;

  const attendanceDoughnutData = {
    labels: ["Present", "Issues"],
    datasets: [
      {
        data: [attendancePercentage, 100 - attendancePercentage],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(244, 63, 94, 0.1)"],
        borderWidth: 0,
      }
    ]
  };

  const perfData = performanceMetrics?.data ?? { top: 0, average: 0, belowAverage: 0 };

  const performanceChartData = {
    labels: ["Top Performers", "Average", "Below Average"],
    datasets: [{
      label: 'Students',
      data: [perfData.top, perfData.average, perfData.belowAverage],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(244, 63, 94, 0.8)',
      ],
      borderRadius: 8,
    }]
  };

  const feesChartData = feesCollectionChart?.data ?? [];

  const feesTrendData = {
    labels: feesChartData.map(d => d.quarter),
    datasets: [
      {
        label: 'Total Fee',
        data: feesChartData.map(d => d.totalFee),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Collected',
        data: feesChartData.map(d => d.collectedFee),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }
    ]
  };

  return (
    <>
      <Head>
        <title>School Admin Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout role="admin">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>


            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end mr-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Status</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Operations Fluid</span>
                </div>
              </div>
              <Badge variant="soft" tone="info" className="h-10 px-4 text-sm font-bold border-indigo-200 bg-indigo-50/50">
                <Calendar className="mr-2 h-4 w-4" />
                Session 2025-26
              </Badge>
            </div>
          </div>

          {/* AI Insight Glassmorphic Banner */}


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Students"
              value={keyMetrics.totalStudents?.total ?? 0}
              subValue={`${keyMetrics.totalStudents?.active ?? 0} active enrollment`}
              icon={GraduationCap}
              accent="indigo"
              change={keyMetrics.totalStudents?.percentageChange}
              href="/dashboard/admin/students"
            />
            <StatCard
              title="Instructors"
              value={keyMetrics.totalTeachers?.total ?? 0}
              subValue={`${keyMetrics.totalTeachers?.active ?? 0} currently active`}
              icon={Users}
              accent="emerald"
              change={keyMetrics.totalTeachers?.percentageChange}
              href="/dashboard/admin/teachers"
            />
            <StatCard
              title="Attendance"
              value={`${attendance?.overallPercentage ?? 0}%`}
              subValue="Daily threshold"
              icon={CheckCircle2}
              accent="sky"
              isPercentage
              href="/dashboard/admin/attendance"
            />
            <StatCard
              title="Revenue"
              value={`₹${((earnings?.total ?? 0) / 100000).toFixed(2)}L`}
              subValue="Current session aggregate"
              icon={TrendingUp}
              accent="violet"
              href="/dashboard/admin/finance"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Quick Actions Grid */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  icon={UserPlus}
                  label="Add Student"
                  color="indigo"
                  href="/dashboard/admin/students/register"
                />
                <QuickActionButton
                  icon={Wallet}
                  label="Collect Fee"
                  color="emerald"
                  href="/dashboard/admin/finance/collect"
                />
                <QuickActionButton
                  icon={BookOpen}
                  label="Library"
                  color="indigo"
                  href="/dashboard/admin/library"
                />
                <QuickActionButton
                  icon={FileText}
                  label="New Notice"
                  color="emerald"
                  href="/dashboard/admin/notices"
                />
                <QuickActionButton
                  icon={Calendar}
                  label="Exam Result"
                  color="sky"
                  href="/dashboard/admin/exams"
                />
                <QuickActionButton
                  icon={Clock}
                  label="Leaves"
                  color="violet"
                  href="/dashboard/admin/leave-requests"
                />
                <QuickActionButton
                  icon={Settings}
                  label="Config"
                  color="gray"
                  href="/dashboard/admin/settings"
                />
                <QuickActionButton
                  icon={Zap}
                  label="Broadcast"
                  color="orange"
                  href="/dashboard/admin/notices"
                />
              </div>

              <Card variant="outline" accent="amber" className="bg-amber-500/5 border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2"><Award className="h-4 w-4 text-amber-600" /> Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                  {starStudents?.image ? (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-amber-500 overflow-hidden shadow-lg border-2 border-white dark:border-gray-800">
                        <img src={starStudents.image} alt={starStudents?.name ?? ""} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{starStudents?.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{starStudents?.class}</p>
                      </div>
                      <Badge className="ml-auto bg-amber-500 text-[10px]">{starStudents?.averageScore}%</Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">No spotlight data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card variant="outline" accent="indigo" className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Financial & Growth Analytics</CardTitle>
                  <CardDescription>Comprehensive tracking of school revenue vs operations</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600">Earnings</Badge>
                  <Badge variant="outline" className="border-rose-500 text-rose-500">Expenses</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                <Line
                  data={financeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 10 } } },
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card variant="outline" accent="sky">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Distribution</CardTitle>
                    <CardDescription>Academic health overview based on recent results</CardDescription>
                  </div>
                  <GrowthIcon className="h-6 w-6 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar
                  data={performanceChartData}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { color: "rgba(0,0,0,0.05)" } },
                      y: { grid: { display: false } }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card variant="outline" accent="emerald">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fees Collection Trends</CardTitle>
                    <CardDescription>Quarterly revenue collection mapping</CardDescription>
                  </div>
                  <Badge variant="soft" tone="success">{feesCollectionChart.filter}</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar
                  data={feesTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10 } } } },
                    scales: {
                      y: { stacked: true, grid: { color: "rgba(0,0,0,0.05)" } },
                      x: { stacked: true, grid: { display: false } }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card variant="outline" accent="rose" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Live Activity Feed</CardTitle>
                <CardDescription>Recent academic interactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 space-y-6 pb-6">
                  {(studentActivities?.activities ?? []).map((activity, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
                          <img src={activity.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        {idx !== (studentActivities?.activities?.length ?? 0) - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 h-10 w-px bg-gray-100 dark:bg-gray-800" />
                        )}
                      </div>
                      <div className="space-y-1 pt-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outline" accent="sky" className="lg:col-span-1">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Notices</CardTitle>
                  <CardDescription>Internal communications</CardDescription>
                </div>
                <Link href="/dashboard/admin/notices">
                  <button className="text-xs font-bold text-indigo-600 hover:underline">See All</button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {(notices ?? []).map((notice, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{notice.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">{notice.date} • {notice.daysSince}D AGO</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outline" accent="violet" className="lg:col-span-1">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Leave Pipeline</CardTitle>
                  <CardDescription>Awaiting authorization</CardDescription>
                </div>
                <Link href="/dashboard/admin/leave-requests">
                  <button className="text-xs font-bold text-indigo-600 hover:underline">Review All</button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {(leaveRequests?.requests ?? []).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-indigo-500/10">
                        {req.user.avatar ? (
                          <img src={req.user.avatar} alt={req.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold bg-indigo-500 text-white">{req.user.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{req.user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate font-medium">{req.reason}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="solid" className={req.status === "PENDING" ? "bg-amber-500" : "bg-emerald-500"}>
                          {req.status}
                        </Badge>
                        <p className="mt-1 text-[10px] font-bold text-gray-400">{req.from}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </DashboardLayout >
    </>
  );
}

const colorClassMap: Record<string, { border: string; bg: string; hover: string; text: string }> = {
  indigo: {
    border: "border-indigo-500/10",
    bg: "bg-indigo-500/5",
    hover: "hover:bg-indigo-500",
    text: "text-indigo-600"
  },
  emerald: {
    border: "border-emerald-500/10",
    bg: "bg-emerald-500/5",
    hover: "hover:bg-emerald-500",
    text: "text-emerald-600"
  },
  sky: {
    border: "border-sky-500/10",
    bg: "bg-sky-500/5",
    hover: "hover:bg-sky-500",
    text: "text-sky-600"
  },
  violet: {
    border: "border-violet-500/10",
    bg: "bg-violet-500/5",
    hover: "hover:bg-violet-500",
    text: "text-violet-600"
  },
  gray: {
    border: "border-gray-500/10",
    bg: "bg-gray-500/5",
    hover: "hover:bg-gray-500",
    text: "text-gray-600"
  },
  orange: {
    border: "border-orange-500/10",
    bg: "bg-orange-500/5",
    hover: "hover:bg-orange-500",
    text: "text-orange-600"
  }
};

function QuickActionButton({
  icon: Icon,
  label,
  color,
  href,
}: {
  icon: any;
  label: string;
  color: string;
  href?: string;
}) {
  const colorClasses = colorClassMap[color] || colorClassMap.indigo;

  const content = (
    <>
      <div
        className={`p-2 rounded-xl bg-white/10 ${colorClasses.text} group-hover:text-white transition-colors`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="w-full">
        <button
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-4 transition-all ${colorClasses.hover} hover:text-white group`}
        >
          {content}
        </button>
      </Link>
    );
  }

  return (
    <button
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-4 transition-all ${colorClasses.hover} hover:text-white group`}
    >
      {content}
    </button>
  );
}

const accentClassMap: Record<string, { bg: string; text: string; textDark: string; bgSolid: string }> = {
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600",
    textDark: "dark:text-indigo-400",
    bgSolid: "bg-indigo-500"
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    textDark: "dark:text-emerald-400",
    bgSolid: "bg-emerald-500"
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-600",
    textDark: "dark:text-sky-400",
    bgSolid: "bg-sky-500"
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    textDark: "dark:text-violet-400",
    bgSolid: "bg-violet-500"
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    textDark: "dark:text-rose-400",
    bgSolid: "bg-rose-500"
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    textDark: "dark:text-amber-400",
    bgSolid: "bg-amber-500"
  }
};

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  accent,
  change,
  isPercentage,
  href
}: {
  title: string;
  value: string | number;
  subValue: string;
  icon: any;
  accent: any;
  change?: string;
  isPercentage?: boolean;
  href?: string;
}) {
  const isPositive = change ? !change.startsWith("-") : true;
  const accentClasses = accentClassMap[accent] || accentClassMap.indigo;

  const content = (
    <Card accent={accent} interactive className="group relative overflow-hidden border-indigo-500/5 h-full">
      <div className="absolute top-0 right-0 p-6 transition-transform group-hover:scale-125 group-hover:rotate-12 opacity-20 group-hover:opacity-100">
        <div className={`p-3 rounded-2xl ${accentClasses.bg} ${accentClasses.text} ${accentClasses.textDark} shadow-inner`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tighter">{value}</h2>
          {change && (
            <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {isPositive ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
              {Math.abs(parseFloat(change))}%
            </div>
          )}
        </div>
        <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">{subValue}</p>
      </CardContent>
      {isPercentage && typeof value === 'string' && (
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gray-100 dark:bg-gray-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: value }}
            className={`h-full ${accentClasses.bgSolid} shadow-sm`}
          />
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}
