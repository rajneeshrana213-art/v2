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
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { BarChart } from "@/components/ui/charts/bar-chart";
import {
  BarChart3,
  CalendarDays,
  Filter,
  Download,
  Users,
  GraduationCap,
  CheckSquare,
  Wallet,
  BusFront,
  Library as LibraryIcon,
  Activity,
  AlertCircle,
  Home,
  Package,
  ClipboardList,
  UserCheck,
  ChevronDown,
  FileText,
} from "lucide-react";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ExportUtils } from "@/lib/utils/export-utils";
import { Loader } from "@/components/ui/feedback/Loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ReportTab =
  | "overview"
  | "classes"
  | "attendance"
  | "accounts"
  | "transport"
  | "staff"
  | "library"
  | "hostel"
  | "inventory"
  | "hr"
  | "operations";

type Sector = "academics" | "hr" | "operations" | "finance" | "all";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [activeSector, setActiveSector] = useState<Sector>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [session, setSession] = useState("2025-26");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    let ignore = false;
    const fetchReport = async () => {
      try {
        setLoading(true);
        setReportData(null);
        setError(null);
        const response = await client.get("/v1/admin/reports", {
          params: {
            tab: activeTab,
            from: dateFrom,
            to: dateTo,
            session,
          },
        });
        if (!ignore) {
          setReportData(response.data);
        }
      } catch (err: any) {
        if (!ignore) {
          console.error("Failed to fetch report data", err);
          setError(err?.message || "Unable to load report data.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchReport();
    return () => { ignore = true; };
  }, [activeTab, dateFrom, dateTo, session]);

  const handleQuickRange = (range: "today" | "7d" | "30d" | "session") => {
    const today = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);

    if (range === "today") {
      const s = format(today);
      setDateFrom(s);
      setDateTo(s);
    } else if (range === "7d") {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      setDateFrom(format(from));
      setDateTo(format(today));
    } else if (range === "30d") {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      setDateFrom(format(from));
      setDateTo(format(today));
    } else {
      setDateFrom("");
      setDateTo("");
    }
  };

  const handleExport = async (format: "pdf" | "excel" | "csv", scope: ReportTab | "all") => {
    const fileName = `learnx-report-${scope}-${new Date().toISOString().slice(0, 10)}`;
    const dataToExport = reportData?.data || (Array.isArray(reportData) ? reportData : [reportData]);

    if (format === "csv") {
      ExportUtils.exportToCSV(dataToExport, fileName);
    } else if (format === "excel") {
      ExportUtils.exportToExcel(dataToExport, fileName, scope.toUpperCase());
    } else if (format === "pdf") {
      let columns: { header: string; dataKey: string }[] = [];
      switch (activeTab) {
        case "classes":
          columns = [
            { header: "Class", dataKey: "className" },
            { header: "Students", dataKey: "studentCount" },
            { header: "Sections", dataKey: "sectionCount" },
            { header: "Performance", dataKey: "performanceIndex" },
          ];
          break;
        case "inventory":
          columns = [
            { header: "Item Name", dataKey: "name" },
            { header: "Stock", dataKey: "quantity" },
            { header: "Transactions", dataKey: "transactionCount" },
            { header: "Status", dataKey: "status" },
          ];
          break;
        case "hostel":
          columns = [
            { header: "Hostel", dataKey: "name" },
            { header: "Capacity", dataKey: "capacity" },
            { header: "Occupied", dataKey: "occupiedBeds" },
            { header: "Available", dataKey: "availableBeds" },
          ];
          break;
        default:
          if (dataToExport.length > 0 && typeof dataToExport[0] === 'object') {
            columns = Object.keys(dataToExport[0]).map(key => ({
              header: key.charAt(0).toUpperCase() + key.slice(1),
              dataKey: key
            }));
          }
      }
      ExportUtils.exportToPDF(`${scope.toUpperCase()} REPORT`, columns, dataToExport, fileName);
    }
  };

  const inventoryColumns: ColumnDef<any>[] = [
    { key: "name", header: "Item Name" },
    { key: "quantity", header: "Stock Level", align: "right" },
    { key: "transactionCount", header: "Recent Trans.", align: "right" },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <Badge tone={val === "LOW_STOCK" ? "danger" : "success"}>
          {val}
        </Badge>
      )
    },
  ];

  const classColumns: ColumnDef<any>[] = [
    { key: "className", header: "Class / Stream" },
    { key: "studentCount", header: "Students", align: "right" },
    { key: "sectionCount", header: "Sections", align: "right" },
    {
      key: "performanceIndex",
      header: "Performance Index",
      align: "right",
      render: (value) => `${value}/100`,
    },
  ];

  const transportColumns: ColumnDef<any>[] = [
    { key: "name", header: "Route" },
    { key: "students", header: "Students", align: "right" },
    { key: "buses", header: "Buses", align: "right" },
  ];

  const libraryColumns: ColumnDef<any>[] = [
    { key: "category", header: "Category" },
    { key: "totalBooks", header: "Total Titles", align: "right" },
    { key: "issued", header: "Issued", align: "right" },
    { key: "overdue", header: "Overdue", align: "right" },
  ];

  const hostelColumns: ColumnDef<any>[] = [
    { key: "name", header: "Hostel Name" },
    { key: "capacity", header: "Capacity", align: "right" },
    { key: "totalBeds", header: "Total Beds", align: "right" },
    { key: "occupiedBeds", header: "Occupied", align: "right" },
    { key: "availableBeds", header: "Available", align: "right" },
  ];

  const renderTabContent = () => {
    if (!reportData && !loading && !error) return null;

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <OverviewStatCard
                icon={GraduationCap}
                label="Total Students"
                value={reportData?.metrics?.totalStudents ?? 0}
                subLabel={`${reportData?.metrics?.activeStudents ?? 0} active enrolments`}
              />
              <OverviewStatCard
                icon={Users}
                label="Total Staff"
                value={(reportData?.metrics?.totalTeachers ?? 0) + (reportData?.metrics?.totalStaff ?? 0)}
                subLabel="Teaching + non‑teaching"
              />
              <OverviewStatCard
                icon={CheckSquare}
                label="Avg. Attendance"
                value={`${reportData?.metrics?.avgAttendance ?? 0}%`}
                subLabel="Selected period average"
              />
              <OverviewStatCard
                icon={Wallet}
                label="Total Earnings"
                value={`₹${((reportData?.metrics?.totalEarnings ?? 0) / 100000).toFixed(2)}L`}
                subLabel="Invoiced Payments"
              />
              {/* New Metrics */}
              <OverviewStatCard
                icon={ClipboardList}
                label="Open Tickets"
                value={reportData?.metrics?.openTickets ?? 0}
                subLabel="Needs attention"
              />
              <OverviewStatCard
                icon={Package}
                label="Low Stock Items"
                value={reportData?.metrics?.lowStockItems ?? 0}
                subLabel="Inventory alerts"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Metric Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={[
                      { label: "Students", value: reportData?.metrics?.totalStudents || 0 },
                      { label: "Teachers", value: reportData?.metrics?.totalTeachers || 0 },
                      { label: "Staff", value: reportData?.metrics?.totalStaff || 0 },
                    ]}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Health</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative h-32 w-32">
                    <svg viewBox="0 0 36 36" className="h-full w-full rotate-[-90deg]">
                      <path className="stroke-gray-100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="stroke-indigo-600" strokeDasharray={`${reportData?.metrics?.avgAttendance || 0}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black">{reportData?.metrics?.avgAttendance || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "classes":
        return <DataTable columns={classColumns} data={reportData?.data || []} className="mt-2" />;
      case "attendance":
        return (
          <div className="grid gap-4 sm:grid-cols-4">
            <AttendanceSmallCard label="Overall" value={`${reportData?.overall}%`} color="bg-indigo-600" />
            <AttendanceSmallCard label="Present" value={reportData?.presentCount} color="bg-green-500" />
            <AttendanceSmallCard label="Absent" value={reportData?.absentCount} color="bg-red-500" />
            <AttendanceSmallCard label="Emergency" value={reportData?.emergencyCount} color="bg-amber-500" />
          </div>
        );
      case "accounts":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <FinanceCard label="Total Inflow" value={reportData?.totalInflow} color="text-green-600" />
              <FinanceCard label="Total Outflow" value={reportData?.totalOutflow} color="text-red-600" />
              <FinanceCard label="Net Balance" value={reportData?.netBalance} color="text-indigo-600" />
            </div>
            <BarChart
              data={[
                { label: "Inflow", value: reportData?.totalInflow || 0, color: "bg-green-500" },
                { label: "Outflow", value: reportData?.totalOutflow || 0, color: "bg-red-500" }
              ]}
            />
          </div>
        );
      case "transport":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <OverviewStatCard icon={BusFront} label="Buses" value={reportData?.summary?.buses} subLabel="Total Fleet" />
              <OverviewStatCard icon={Activity} label="Routes" value={reportData?.summary?.routes} subLabel="Active Paths" />
              <OverviewStatCard icon={Users} label="Drivers" value={reportData?.summary?.drivers} subLabel="Certified" />
            </div>
            <DataTable columns={transportColumns} data={reportData?.routes || []} className="mt-2" />
          </div>
        );
      case "staff":
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Teaching Staff</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <StaffMetric label="Total Teachers" value={reportData?.teachers?.total} />
                <StaffMetric label="Active Status" value={reportData?.teachers?.active} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Non-Teaching Staff</CardTitle></CardHeader>
              <CardContent><StaffMetric label="Total Support Staff" value={reportData?.staff?.total} /></CardContent>
            </Card>
          </div>
        );
      case "library":
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <LibraryCard label="Total Books" value={reportData?.totalBooks} icon={LibraryIcon} />
            <LibraryCard label="Issued" value={reportData?.issuedBooks} icon={CheckSquare} />
            <LibraryCard label="Overdue" value={reportData?.overdueBooks} icon={AlertCircle} color="text-red-500" />
          </div>
        );
      case "hostel":
        return <DataTable columns={hostelColumns} data={reportData?.data || []} className="mt-2" />;
      case "inventory":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <OverviewStatCard icon={Package} label="Total Items" value={reportData?.items?.length || 0} subLabel="Categories" />
              <OverviewStatCard icon={AlertCircle} label="Low Stock" value={reportData?.items?.filter((i: any) => i.status === "LOW_STOCK").length || 0} subLabel="Alerts" />
            </div>
            <DataTable columns={inventoryColumns} data={reportData?.items || []} className="mt-2" />
          </div>
        );
      case "hr":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <FinanceCard label="Payroll" value={reportData?.payroll?.totalSalary} color="text-indigo-600" />
              <FinanceCard label="Paid" value={reportData?.payroll?.paidCount} color="text-green-600" />
              <FinanceCard label="Pending" value={reportData?.payroll?.pendingCount} color="text-amber-600" />
            </div>
            <Card>
              <CardHeader><CardTitle>Leaves</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {reportData?.leaves?.map((l: any, i: number) => (
                  <div key={i} className="flex justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="text-xs font-bold">{l.staffName} ({l.days}d)</span>
                    <Badge tone={l.status === "APPROVED" ? "success" : "warning"}>{l.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case "operations":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Visitors</CardTitle></CardHeader>
              <CardContent className="text-2xl font-black">{reportData?.visitors?.total ?? 0}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
              <CardContent className="text-2xl font-black">{reportData?.tickets?.total ?? 0}</CardContent>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <DashboardLayout role="admin">
      <Head>
        <title>Reports & Analytics | Admin | LearnXChain</title>
      </Head>
      <div className="space-y-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Advanced Reports</h1>
            <p className="text-sm text-gray-500">Comprehensive school intelligence.</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-2xl bg-indigo-600 uppercase font-black text-[10px] tracking-widest">
                  <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => handleExport("pdf", activeTab)}>PDF Document</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel", activeTab)}>Excel Sheet</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv", activeTab)}>CSV Data File</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <SectorPill label="All" active={activeSector === "all"} onClick={() => setActiveSector("all")} />
          <SectorPill label="Academics" active={activeSector === "academics"} onClick={() => setActiveSector("academics")} />
          <SectorPill label="HR" active={activeSector === "hr"} onClick={() => setActiveSector("hr")} />
          <SectorPill label="Operations" active={activeSector === "operations"} onClick={() => setActiveSector("operations")} />
          <SectorPill label="Finance" active={activeSector === "finance"} onClick={() => setActiveSector("finance")} />
        </div>

        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-wrap items-center gap-3">
              <QuickRangePill label="Today" onClick={() => handleQuickRange("today")} />
              <QuickRangePill label="7 Days" onClick={() => handleQuickRange("7d")} />
              <QuickRangePill label="30 Days" onClick={() => handleQuickRange("30d")} />
              <QuickRangePill label="Reset" onClick={() => handleQuickRange("session")} />
            </div>
          </CardHeader>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex flex-wrap gap-4">
              {(activeSector === "all" || activeSector === "academics") && (
                <>
                  <ReportTabButton icon={BarChart3} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                  <ReportTabButton icon={Activity} label="Performance" active={activeTab === "classes"} onClick={() => setActiveTab("classes")} />
                  <ReportTabButton icon={CheckSquare} label="Attendance" active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} />
                  <ReportTabButton icon={LibraryIcon} label="Library" active={activeTab === "library"} onClick={() => setActiveTab("library")} />
                </>
              )}
              {(activeSector === "all" || activeSector === "hr") && (
                <>
                  <ReportTabButton icon={Users} label="Staff" active={activeTab === "staff"} onClick={() => setActiveTab("staff")} />
                  <ReportTabButton icon={UserCheck} label="HR" active={activeTab === "hr"} onClick={() => setActiveTab("hr")} />
                </>
              )}
              {(activeSector === "all" || activeSector === "operations") && (
                <>
                  <ReportTabButton icon={BusFront} label="Transport" active={activeTab === "transport"} onClick={() => setActiveTab("transport")} />
                  <ReportTabButton icon={Home} label="Hostel" active={activeTab === "hostel"} onClick={() => setActiveTab("hostel")} />
                  <ReportTabButton icon={Package} label="Inventory" active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} />
                  <ReportTabButton icon={ClipboardList} label="Ops" active={activeTab === "operations"} onClick={() => setActiveTab("operations")} />
                </>
              )}
              {(activeSector === "all" || activeSector === "finance") && (
                <ReportTabButton icon={Wallet} label="Finance" active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")} />
              )}
            </div>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : renderTabContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function AttendanceSmallCard({ label, value, color }: any) {
  return (
    <Card className="p-4 border-none shadow-sm dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      <div className={`mt-2 h-1 w-8 rounded-full ${color}`} />
    </Card>
  );
}

function FinanceCard({ label, value, color }: any) {
  return (
    <Card className="p-5 border-none dark:bg-slate-800">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>₹{value?.toLocaleString()}</p>
    </Card>
  );
}

function StaffMetric({ label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/5">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function LibraryCard({ label, value, icon: Icon, color = "text-indigo-600" }: any) {
  return (
    <Card className="p-6 flex items-center gap-4 dark:bg-slate-800 border-none">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5 ${color}`}><Icon size={24} /></div>
      <div><p className="text-xs font-semibold text-gray-500">{label}</p><p className="text-2xl font-black">{value}</p></div>
    </Card>
  );
}

function OverviewStatCard({ icon: Icon, label, value, subLabel }: any) {
  return (
    <Card className="relative overflow-hidden border-none bg-white dark:bg-slate-800 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
          <p className="mt-1 text-xl font-black">{value}</p>
          <p className="mt-0.5 text-[10px] text-gray-500">{subLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickRangePill({ label, onClick }: any) {
  return (
    <button onClick={onClick} className="rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
      {label}
    </button>
  );
}

function ReportTabButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-1 pb-2 border-b-2 transition-all", active ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400")}>
      <Icon className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SectorPill({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all", active ? "bg-indigo-600 text-white shadow-lg" : "bg-white border text-gray-400")}>
      {label}
    </button>
  );
}

export async function getServerSideProps() { return { props: {} }; }
