import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Bell,
  ChevronRight,
  TrendingUp,
  Wallet,
  FileText,
  AlertCircle,
  ClipboardList,
  Navigation
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get("/v1/dashboard/student");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch student dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    attendancePercentage: 0,
    pendingHomework: 0,
    upcomingExamsCount: 0,
    feeStatus: "N/A",
    feePendingAmount: 0
  };

  return (
    <>
      <Head>
        <title>Student Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout role="student">
        <div className="space-y-8 pb-10">
          {/* Welcome Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Hi, {data?.personalInfo?.name || "Student"}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {data?.personalInfo?.class || "Your Class"} | Roll No: {data?.personalInfo?.rollNo || "N/A"}
            </p>
          </div>

          {/* Motivation Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Attendance"
              value={`${Math.round(stats.attendancePercentage)}%`}
              subtext="Goal: 85%"
              color="emerald"
              href="/dashboard/student/attendance"
            />
            <StatCard
              icon={BookOpen}
              label="Homework"
              value={stats.pendingHomework}
              subtext="To be done"
              color="amber"
              isAlert={stats.pendingHomework > 0}
              href="/dashboard/student/homework"
            />
            <StatCard
              icon={FileText}
              label="Coming Exams"
              value={stats.upcomingExamsCount}
              subtext="Prepare well!"
              color="indigo"
              href="/dashboard/student/exams"
            />
            <StatCard
              icon={Wallet}
              label="Fee Status"
              value={stats.feeStatus}
              subtext={stats.feePendingAmount > 0 ? `₹${stats.feePendingAmount} due` : "All clear"}
              color={stats.feePendingAmount > 0 ? "rose" : "blue"}
              href="/dashboard/student/fees"
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickLink
              href="/dashboard/student/leave"
              icon={ClipboardList}
              label="Leave Request"
              color="indigo"
            />
            <QuickLink
              href="/dashboard/student/timetable"
              icon={Clock}
              label="Timetable"
              color="emerald"
            />
            <QuickLink
              href="/dashboard/student/homework"
              icon={BookOpen}
              label="Homework"
              color="amber"
            />
            <QuickLink
              href="/dashboard/student/notices"
              icon={Bell}
              label="Notices"
              color="rose"
            />
            <QuickLink
              href="/dashboard/student/transport/live"
              icon={Navigation}
              label="Bus Tracking"
              color="indigo"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Classes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Today&apos;s Classes
                </h2>
                <Link href="/dashboard/student/timetable" className="text-sm font-medium text-indigo-600 hover:underline">
                  View Timetable
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                {data?.todaySchedule?.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {data.todaySchedule.map((lesson: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                            <span className="text-xs font-bold leading-none">{format(new Date(lesson.startTime), "HH:mm")}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{lesson.subject}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{lesson.teacher}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{lesson.room !== "N/A" ? `Room ${lesson.room}` : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No classes today. Enjoy your day!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Updates
                </h2>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                  {data?.notices?.length > 0 ? (
                    <div className="space-y-4">
                      {data.notices.map((notice: any, idx: number) => (
                        <Link key={idx} href="/dashboard/student/notices" className="block group cursor-pointer">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{format(new Date(notice.start || notice.createdAt), "MMM d")}</p>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {notice.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent updates.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  Upcoming Exams
                </h2>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                  {data?.upcomingExams?.length > 0 ? (
                    <div className="space-y-4">
                      {data.upcomingExams.map((exam: any, idx: number) => (
                        <Link key={idx} href="/dashboard/student/exams" className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-xl transition-colors -mx-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{exam.subject?.name || exam.subject}</h4>
                            <p className="text-xs text-gray-500">{exam.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-rose-600">{format(new Date(exam.scheduleDate), "MMM d")}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No exams scheduled.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color, isAlert, href }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
  };

  const content = (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900 transition-all hover:shadow-md ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
          <h3 className={`text-2xl font-black ${isAlert ? "text-rose-600 animate-pulse" : "text-gray-900 dark:text-white"}`}>
            {value}
          </h3>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter transition-all hover:translate-x-1 cursor-default">
          {subtext}
        </p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickLink({ href, icon: Icon, label, color }: any) {
  const colors: any = {
    indigo: "hover:bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "hover:bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "hover:bg-amber-50 text-amber-600 border-amber-100",
    rose: "hover:bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 p-4 rounded-2xl border bg-white dark:bg-gray-900 dark:border-white/5 transition-all hover:scale-[1.02] shadow-sm ${colors[color]}`}>
        <Icon className="h-5 w-5" />
        <span className="text-sm font-bold">{label}</span>
      </div>
    </Link>
  );
}
