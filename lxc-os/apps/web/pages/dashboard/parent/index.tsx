
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import {
  Users,
  TrendingUp,
  BookOpen,
  Wallet,
  Bell,
  ArrowRight,
  ChevronRight,
  Star,
  Activity,
  Calendar,
  ClipboardList,
  Navigation
} from "lucide-react";
import Link from "next/link";
import ChildSelector from "@/components/dashboard/parent/ChildSelector";
import { Loader } from "@/components/ui/feedback/Loader";
import { encodeId } from "@/lib/utils/hashId";

export default function parentDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/v1/dashboard/parent/overview?studentId=${selectedChildId}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedChildId]);

  return (
    <>
      <Head>
        <title>Parent Dashboard - LearnXChain</title>
      </Head>
      <DashboardLayout
        role="parent"
        actions={
          <ChildSelector
            selectedId={selectedChildId}
            onSelect={(id) => setSelectedChildId(id)}
          />
        }
      >
        <div className="space-y-8 pb-10">

          {!selectedChildId || loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Status Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                  title="Attendance"
                  value={`${data?.stats?.attendancePercentage}%`}
                  label="Current Monthly Presence"
                  icon={Activity}
                  color="emerald"
                  href="/dashboard/parent/attendance"
                  studentId={selectedChildId}
                />
                <StatusCard
                  title="Homework"
                  value={data?.stats?.pendingHomework}
                  label="Tasks To Be Completed"
                  icon={BookOpen}
                  color="blue"
                  href="/dashboard/parent/homework"
                  studentId={selectedChildId}
                />
                <StatusCard
                  title="Exams"
                  value={data?.stats?.upcomingExamsCount}
                  label="Upcoming Tests Scheduled"
                  icon={TrendingUp}
                  color="indigo"
                  href="/dashboard/parent/exams"
                  studentId={selectedChildId}
                />
                <StatusCard
                  title="Fee Status"
                  value={data?.stats?.feePendingAmount > 0 ? `₹${data.stats.feePendingAmount.toLocaleString()}` : "Clear"}
                  label={data?.stats?.feePendingAmount > 0 ? "Pending Installment" : "All Fees Paid"}
                  icon={Wallet}
                  color={data?.stats?.feePendingAmount > 0 ? "rose" : "emerald"}
                  href="/dashboard/parent/fees"
                  studentId={selectedChildId}
                />
              </div>

              {/* Quick Operations */}
              <div className="flex flex-wrap gap-4">
                <Link href={`/dashboard/parent/leave?studentId=${encodeId(selectedChildId!)}`}>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/10 transition-all hover:scale-[1.02] shadow-sm cursor-pointer">
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-sm font-black uppercase tracking-widest">Apply for Leave</span>
                  </div>
                </Link>
                <Link href={`/dashboard/parent/attendance?studentId=${encodeId(selectedChildId!)}`}>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/10 transition-all hover:scale-[1.02] shadow-sm cursor-pointer">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-black uppercase tracking-widest">View Attendance</span>
                  </div>
                </Link>
                <Link href={`/dashboard/parent/transport/live?studentId=${encodeId(selectedChildId!)}`}>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] border border-amber-100 bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/10 transition-all hover:scale-[1.02] shadow-sm cursor-pointer">
                    <Navigation className="h-5 w-5" />
                    <span className="text-sm font-black uppercase tracking-widest">Live Bus Tracking</span>
                  </div>
                </Link>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Notices Section */}
                  <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 dark:border-white/5 dark:bg-gray-900 shadow-xl shadow-gray-100/20">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">School Updates</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Latest Official Announcements</p>
                      </div>
                      <Link href={`/dashboard/parent/notices?studentId=${encodeId(selectedChildId!)}`}>
                        <button className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                          <ArrowRight className="h-6 w-6" />
                        </button>
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {data?.notices?.length > 0 ? data.notices.map((notice: any, idx: number) => (
                        <div key={idx} className="group flex items-start gap-4 p-4 rounded-3xl transition-colors hover:bg-gray-50 dark:hover:bg-white/2">
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500 group-hover:scale-150 transition-transform" />
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-gray-100">{notice.title}</h4>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notice.message}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10">
                          <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-50 dark:bg-white/2 flex items-center justify-center mb-4">
                            <Bell className="h-6 w-6 text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-400">No recent updates found for your school.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar inside main */}
                <div className="space-y-6">
                  {/* Attendance Card - Visual */}
                  <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                    <Star className="h-8 w-8 text-indigo-200 mb-6" />
                    <h3 className="text-2xl font-black mb-2">Attendance Score</h3>
                    <p className="text-indigo-100/80 font-medium mb-8">Your child's dedication is reflected in thier consistency.</p>

                    <div className="relative h-4 w-full bg-indigo-700/50 rounded-full overflow-hidden mb-2">
                      <div className="absolute top-0 left-0 h-full bg-white transition-all duration-1000" style={{ width: `${data?.stats?.attendancePercentage}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                      <span>Poor</span>
                      <span className="text-indigo-200">{data?.stats?.attendancePercentage}% Excellence</span>
                    </div>
                  </div>

                  {/* Homework Widget */}
                  <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900 overflow-hidden">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Recent Homework
                    </h3>
                    <div className="space-y-3">
                      {data?.recentHomework?.length > 0 ? data.recentHomework.map((hw: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/2">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate w-32">{hw.title}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{hw.subject}</span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${hw.status === "Submitted" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-100 text-rose-600 dark:bg-rose-950/30"}`}>
                            {hw.status}
                          </span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400 text-center py-4">No recent assignments.</p>
                      )}
                    </div>
                    <Link href={`/dashboard/parent/homework?studentId=${encodeId(selectedChildId!)}`} className="block mt-4 text-center text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                      View all items
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout >
    </>
  );
}

function StatusCard({ title, value, label, icon: Icon, color, href, studentId }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/20",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/20",
  };

  return (
    <Link href={`${href}?studentId=${encodeId(studentId)}`}>
      <div className={`group rounded-[2rem] border p-6 transition-all hover:scale-[1.02] hover:shadow-lg dark:shadow-none ${colors[color] || colors.indigo}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </div>
        <h3 className="text-3xl font-black mb-1">{value}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-current opacity-60">{title}</p>
        <div className="mt-4 pt-4 border-t border-current/10 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          <p className="text-[10px] font-bold opacity-80">{label}</p>
        </div>
      </div>
    </Link>
  );
}
