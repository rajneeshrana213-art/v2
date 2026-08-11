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
import { AlertCircle, BarChart3, Users, Wallet, Calendar, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";

interface Summary {
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

export default function AdminFinanceStudentFeesPage() {
  const { user, loading: authLoading } = useAuth();
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [classId, setClassId] = useState<string>("all");

  const { data: academicYears = [] } = useQuery({
    queryKey: ["academic-years", user?.schoolId],
    queryFn: async () => {
      const res = await client.get("/v1/admin/settings/academic-years");
      const data = res?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.years)) return data.years;
      return [];
    },
    enabled: !!user?.schoolId
  });

  const activeYearId = academicYears.find((y: any) => y.isActive)?.id || academicYears[0]?.id;

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

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ["finance-summary", user?.schoolId, academicYearId, classId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/outstanding-summary", {
        params: {
          schoolId: user?.schoolId,
          academicYearId,
          classId: classId === "all" ? undefined : classId
        },
      });
      return res.data;
    },
    enabled: !!user?.schoolId && !!academicYearId,
  });

  const { data: defaulters = [], isLoading: defLoading } = useQuery({
    queryKey: ["finance-defaulters", user?.schoolId, academicYearId, classId],
    queryFn: async () => {
      const res = await client.get("/v1/finance/reports/defaulters", {
        params: {
          schoolId: user?.schoolId,
          academicYearId,
          classId: classId === "all" ? undefined : classId
        },
      });
      return res.data || [];
    },
    enabled: !!user?.schoolId && !!academicYearId,
  });

  const formatCurrency = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const initialLoading = (summaryLoading || defLoading) && !summary;
  const loading = summaryLoading || defLoading;
  const error = summaryError ? (summaryError as any).message : null;

  if (initialLoading || authLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader size="lg" />
            <p className="text-sm font-medium text-gray-500">
              Loading student fee overview...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !summary) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Card className="max-w-md border-rose-500/20 bg-rose-500/5">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600" />
              <div>
                <CardTitle>Student Fees Error</CardTitle>
                <CardDescription>
                  Could not load student fee data.
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
        <title>Student Fees – Admin | LearnXChain</title>
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
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                Student Fees & Outstanding
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Monitor fee collection progress and manage defaulters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Viewing Session</p>
                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                  <SelectTrigger className="h-9 w-40 rounded-xl border-indigo-100 bg-white/50 px-4 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300">
                    <SelectValue placeholder="Select Year">
                      {academicYears.find((y: any) => y.id === academicYearId)?.year || (
                        <div className="flex items-center gap-2">
                          <Loader size="sm" />
                          <span>Session...</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y: any) => (
                      <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Class Filter</p>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="h-9 w-40 rounded-xl border-indigo-100 bg-white/50 px-4 text-xs font-bold text-indigo-700 backdrop-blur-sm dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300">
                    <SelectValue placeholder="All Classes">
                      {classId === "all" ? "All Classes" : classes.find((c: any) => c.id === classId)?.name || "Select Class"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-xl border-amber-100 bg-amber-50/50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20"
              >
                <Users className="h-4 w-4" />
                {summary?.defaultersCount || 0} defaulters
              </Badge>
            </div>
          </div>

          <div className={`grid gap-4 md:grid-cols-3 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                  Total Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-50">
                  {formatCurrency(summary?.totalDemand || 0)}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  All fee raised this year.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                  Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary?.totalPaid || 0)}
                </div>
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Collection rate {(summary?.collectionRate || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-rose-600">
                  {formatCurrency(summary?.totalOutstanding || 0)}
                </div>
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Across {summary?.totalStudents || 0} active students.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Defaulters List</CardTitle>
                <CardDescription>
                  Students with pending dues, sorted by highest outstanding.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <BulkNotifyButton schoolId={user?.schoolId} academicYearId={academicYearId} />
                <Badge variant="outline" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {defaulters.length} rows
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Great! There are currently no students with outstanding dues.
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
                      {defaulters.map((d: any) => (
                        <tr
                          key={d.studentId}
                          className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50 dark:border-white/5 dark:hover:bg-white/5"
                        >
                          <td className="py-3 pr-4 font-bold text-indigo-600">
                            <Link
                              href={`/dashboard/admin/finance/student/${d.studentId}`}
                              className="hover:underline"
                            >
                              {d.studentName}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-xs font-bold text-gray-500">
                            {d.className || "N/A"}
                          </td>
                          <td className="py-3 pr-4 text-xs font-bold text-gray-400">
                            {d.admissionNo || "-"}
                          </td>
                          <td className="py-3 pl-4 text-right font-black text-rose-600">
                            {formatCurrency(d.outstandingAmount)}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <NotifyButton studentId={d.studentId} studentName={d.studentName} schoolId={user?.schoolId} academicYearId={academicYearId} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}

function NotifyButton({ studentId, studentName, schoolId, academicYearId }: { studentId: string, studentName: string, schoolId: string | undefined, academicYearId: string }) {
  const [loading, setLoading] = useState(false);

  const handleNotify = async () => {
    try {
      setLoading(true);
      await client.post("/v1/finance/notifications/send-dues", {
        studentId,
        schoolId,
        academicYearId,
        type: "BOTH"
      });
      toast.success(`Demand reminder sent to ${studentName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleNotify}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
    >
      {loading ? <Loader size="sm" variant="white" /> : "Notify"}
    </button>
  );
}

function BulkNotifyButton({ schoolId, academicYearId }: { schoolId: string | undefined, academicYearId: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleBulkNotify = async () => {
    try {
      setLoading(true);
      await client.post("/v1/finance/notifications/send-dues", {
        schoolId,
        academicYearId,
        bulk: true,
        type: "BOTH"
      });
      toast.success("Bulk reminders triggered successfully");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to trigger bulk notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading || !academicYearId}
        className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
      >
        <Users className="h-3 w-3" />
        Bulk Notify
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Notifications?</DialogTitle>
            <DialogDescription>
              This will send fee due reminders to all students with outstanding dues for the selected session. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="rounded-xl border-gray-100 px-6 font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkNotify}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  Sending...
                </>
              ) : (
                "Send Notifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


