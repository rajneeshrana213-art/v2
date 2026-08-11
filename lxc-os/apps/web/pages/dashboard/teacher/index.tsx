import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bell,
  ArrowRight,
  PlusCircle,
  ClipboardCheck,
  FileText,
  UserCog,
  School
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";
import Link from "next/link";
import { format } from "date-fns";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get("/v1/dashboard/teacher");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    todayClasses: 0,
    homeworkToReview: 0,
    attendancePending: true,
    noticesCount: 0
  };

  return (
    <>
      <Head>
        <title>Teacher Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout
        role="teacher"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/teacher/attendance">
              <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
                <ClipboardCheck className="h-4 w-4" />
                Mark Attendance
              </button>
            </Link>
            <Link href="/dashboard/teacher/homework/create">
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-all">
                <PlusCircle className="h-4 w-4" />
                New Homework
              </button>
            </Link>
          </div>
        }
        customSubGreeting={
          <p>
            You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats.todayClasses}</span> classes scheduled for today.
          </p>
        }
      >
        <div className="space-y-8 pb-10">

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Calendar}
              label="Today's Classes"
              value={stats.todayClasses}
              subtext="Schedule is ready"
              color="blue"
            />
            <StatCard
              icon={stats.attendancePending ? AlertCircle : CheckCircle2}
              label="Attendance Status"
              value={stats.attendancePending ? "Pending" : "Marked"}
              subtext={stats.attendancePending ? "Daily task remaining" : "Well done!"}
              color={stats.attendancePending ? "amber" : "emerald"}
              isAlert={stats.attendancePending}
            />
            <StatCard
              icon={BookOpen}
              label="Homework Review"
              value={stats.homeworkToReview}
              subtext="Submissions to check"
              color="indigo"
            />
            <StatCard
              icon={Bell}
              label="Admin Notices"
              value={stats.noticesCount}
              subtext="Stay updated"
              color="purple"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Today&apos;s Schedule
                </h2>
                <Link href="/dashboard/teacher/timetable" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  View Full Timetable
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
                {data?.todaySchedule?.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {data.todaySchedule.map((lesson: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center h-12 w-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                            <span className="text-sm font-bold">{format(new Date(lesson.startTime), "p")}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{lesson.subject}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Class: {lesson.class} • Room {lesson.room}</p>
                          </div>
                        </div>
                        <Link href={`/dashboard/teacher/attendance?classId=${lesson.classId}`}>
                          <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Mark Attendance
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notices & Quick Actions */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  Recent Notices
                </h2>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900">
                  {data?.notices?.length > 0 ? (
                    <div className="space-y-4">
                      {data.notices.map((notice: any, idx: number) => (
                        <div key={idx} className="group relative">
                          <p className="text-xs text-gray-400 mb-1">{format(new Date(notice.createdAt), "MMM d, yyyy")}</p>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">
                            {notice.title}
                          </h4>
                        </div>
                      ))}
                      <Link href="/dashboard/teacher/notices" className="block text-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pt-2">
                        View All Notices
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent notices.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction title="My Classes" icon={School} href="/dashboard/teacher/classes" />
                  <QuickAction title="Assign Work" icon={FileText} href="/dashboard/teacher/homework" />
                  <QuickAction title="Leave Request" icon={Calendar} href="/dashboard/teacher/leaves" />
                  <QuickAction title="My Profile" icon={UserCog} href="/dashboard/teacher/profile" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color, isAlert }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-bold ${isAlert ? "text-amber-600" : "text-gray-900 dark:text-white"}`}>
              {value}
            </h3>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400">{subtext}</p>
    </div>
  );
}

function QuickAction({ title, icon: Icon, href }: any) {
  return (
    <Link href={href} className="group rounded-2xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-indigo-600 hover:bg-indigo-50 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
      <Icon className="h-6 w-6 mx-auto mb-2 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
      <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-900 dark:text-gray-400 dark:group-hover:text-indigo-300">{title}</span>
    </Link>
  );
}
