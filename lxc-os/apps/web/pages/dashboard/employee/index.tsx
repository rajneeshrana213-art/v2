
import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import Link from "next/link";
import {
  Users,
  MonitorPlay,
  LifeBuoy,
  CheckSquare,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/feedback/Loader";

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [dashRes, attRes] = await Promise.all([
          client.get("/v1/dashboard/employee"),
          client.get("/v1/employee/attendance")
        ]);
        setData(dashRes.data);
        setAttendance(attRes.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePunch = async (type: 'in' | 'out') => {
    try {
      setProcessing(true);
      await client.post("/v1/employee/attendance", { type });
      const attRes = await client.get("/v1/employee/attendance");
      setAttendance(attRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to process attendance");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="employee">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const personalInfo = data?.personalInfo;
  const metrics = [
    { label: "Active Leads", value: data?.leads?.totalCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/dashboard/employee/leads" },
    { label: "Demos Today", value: data?.demos?.length || 0, icon: MonitorPlay, color: "text-purple-600", bg: "bg-purple-50", href: "/dashboard/employee/demos" },
    { label: "Open Tickets", value: data?.assignedTickets?.openCount || 0, icon: LifeBuoy, color: "text-amber-600", bg: "bg-amber-50", href: "/dashboard/employee/tickets" },
    { label: "Pending Tasks", value: data?.assignedTasks?.length || 0, icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50", href: "/dashboard/employee/tasks" },
  ];

  return (
    <>
      <Head>
        <title>Employee Dashboard - LearnXChain</title>
        <meta name="description" content="LearnXChain employee dashboard — track leads, demos, support tickets, tasks, and attendance in one place." />
      </Head>
      <DashboardLayout role="employee">
        <div className="w-full mx-auto space-y-8 pb-8">
          {/* Header Section */}


          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Punch In/Out Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Link href="/dashboard/employee/attendance">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Attendance
                  </h3>
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center">
                {attendance?.punchIn ? (
                  <div className="text-center w-full">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Date(attendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Punch In Time</div>

                    {attendance?.punchOut ? (
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {new Date(attendance.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Punch Out Time</div>
                        <div className="mt-2 text-indigo-600 font-bold text-sm">
                          Worked: {attendance.workingHours}h
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePunch('out')}
                        disabled={processing}
                        className="mt-6 w-full py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
                      >
                        {processing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader size="sm" className="text-red-600" />
                            <span>Processing...</span>
                          </div>
                        ) : "Punch Out Now"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <div className="text-gray-400 text-sm mb-6">You haven't punched in yet.</div>
                    <button
                      onClick={() => handlePunch('in')}
                      disabled={processing}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                    >
                      {processing ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader size="sm" variant="white" />
                          <span>Processing...</span>
                        </div>
                      ) : "Punch In for Today"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Existing Metrics (Condensed) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {metrics.map((metric, i) => (
                <Link key={i} href={metric.href}>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", metric.bg)}>
                        <metric.icon className={cn("h-5 w-5", metric.color)} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{metric.label}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Work & Leads */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Demos */}
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4 text-purple-500" />
                    Scheduled Demos
                  </h2>
                  <Link href="/dashboard/employee/demos" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {data?.demos?.length > 0 ? (
                    data.demos.map((demo: any) => (
                      <div key={demo.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                              {new Date(demo.scheduledAt).getDate()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{demo.lead?.schoolName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {new Date(demo.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span>•</span>
                                <span>Contact: {demo.lead?.name}</span>
                              </div>
                            </div>
                          </div>
                          <Link href="/dashboard/employee/demos" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors inline-flex items-center justify-center" aria-label="View demo details">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <MonitorPlay className="h-12 w-12 text-gray-200 mx-auto" />
                      <p className="text-gray-500 mt-2">No demos scheduled for today</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Leads */}
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Focus Leads
                  </h2>
                  <Link href="/dashboard/employee/leads" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Pipeline
                  </Link>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {data?.leads?.leads?.length > 0 ? (
                    data.leads.leads.map((lead: any) => (
                      <div key={lead.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{lead.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lead.schoolName}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              lead.status === "NEW" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                              {lead.status}
                            </span>
                            <Link href="/dashboard/employee/leads" className="text-xs font-medium text-gray-400 hover:text-indigo-500">
                                Follow up
                              </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No active leads assigned
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar Column - Performance & Activity */}
            <div className="space-y-8">
              {/* Performance / KPI Card */}
              <Link href="/dashboard/employee/performance">
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Monthly KPI</span>
                    </div>
                    <div className="mt-8">
                      <div className="text-sm opacity-90">Progress this Month</div>
                      <div className="text-4xl font-bold mt-1">84%</div>
                      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '84%' }}></div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="opacity-80">Target: 20 Leads</span>
                        <span className="font-bold">17 Achieved</span>
                      </div>
                    </div>
                  </div>
                </section>
              </Link>

              {/* Priority Tickets */}
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-amber-500" />
                    Urgent Tickets
                  </h2>
                </div>
                <div className="p-2">
                  {data?.assignedTickets?.tickets?.filter((t: any) => (t.priority === "HIGH" || t.priority === "URGENT") && t.status !== "CLOSED" && t.status !== "RESOLVED").map((ticket: any) => (
                    <Link key={ticket.id} href="/dashboard/employee/tickets">
                      <div className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{ticket.title}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                              <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">#MT-{ticket.ticketNumber}</span>
                              <span>•</span>
                              <span>2h ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(!data?.assignedTickets?.tickets || data.assignedTickets.tickets.filter((t: any) => (t.priority === "HIGH" || t.priority === "URGENT") && t.status !== "CLOSED" && t.status !== "RESOLVED").length === 0) && (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No urgent tickets!
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
