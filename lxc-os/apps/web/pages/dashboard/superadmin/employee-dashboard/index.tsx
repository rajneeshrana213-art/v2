
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import { Users, Ticket, CheckCircle, Clock, UserCheck, UserMinus, MonitorPlay, Plus, Calendar, AlertCircle, X } from 'lucide-react';
import { clsx } from "clsx";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Loader from '@/components/ui/feedback/Loader';

// Dynamic imports for heavy chart components
const TicketResolutionChart = dynamic(() => import("@/components/dashboard/superadmin/TicketResolutionChart").then(m => ({ default: m.TicketResolutionChart })), { ssr: false });
const EmployeeGrowthChart = dynamic(() => import("@/components/dashboard/superadmin/EmployeeGrowthChart").then(m => ({ default: m.EmployeeGrowthChart })), { ssr: false });

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
    href?: string;
}

function MetricCard({ title, value, icon: Icon, color, trend, href }: MetricCardProps) {
    const content = (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                {trend && <p className="mt-1 text-xs text-green-500">{trend}</p>}
            </div>
            <div className={clsx("rounded-full p-3 bg-opacity-10", color)}>
                <Icon className={clsx("h-6 w-6", color.replace("bg-", "text-").replace("/10", ""))} />
            </div>
        </div>
    );
    if (href) {
        return (
            <Link href={href} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30 block">
                {content}
            </Link>
        );
    }
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/20 dark:border-white/10 dark:bg-gray-900 dark:hover:border-indigo-500/30">
            {content}
        </div>
    );
}

interface EmployeeDashboardData {
    totalEmployees: number;
    activeEmployees: number;
    suspendedEmployees: number;
    employeeGrowth: { month: string; count: number }[];
    ticketStats: Record<string, number>;
    topPerformers: {
        id: string;
        name: string;
        email: string;
        role: string;
        profilePic: string | null;
        resolvedTickets: number;
    }[];
    recentAttendance: {
        id: string;
        employeeName: string;
        profilePic: string | null;
        date: string;
        status: string;
        punchIn: string | null;
        punchOut: string | null;
        workingHours: number | null;
    }[];
    salesMetrics: {
        totalLeads: number;
        newLeads: number;
        totalDemos: number;
    };
}

export default function EmployeeDashboardPage() {
    const { data, loading, error, get } = useApi<EmployeeDashboardData>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const [taskData, setTaskData] = useState({
        assignedToId: ""
    });

    useEffect(() => {
        get("/v1/superadmin/employee-dashboard");
        fetchEmployees();
    }, [get]);

    const fetchEmployees = async () => {
        try {
            const [empRes, ticketRes] = await Promise.all([
                client.get("/v1/superadmin/tasks"),
                client.get("/v1/superadmin/tickets?unassigned=true&status=OPEN")
            ]);
            setEmployees(empRes.data);
            setTickets(ticketRes.data.data || []);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicketId) {
            toast.error("Please select a ticket");
            return;
        }
        try {
            setSubmitting(true);
            // Assign existing ticket to employee
            await client.put(`/v1/superadmin/tickets/${selectedTicketId}`, {
                employeeId: taskData.assignedToId,
            });

            toast.success("Ticket assigned successfully");
            setIsModalOpen(false);
            setTaskData({ assignedToId: "" });
            setSelectedTicketId("");
            get("/v1/superadmin/employee-dashboard");
            fetchEmployees(); // Refresh tickets list
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to assign ticket");
        } finally {
            setSubmitting(false);
        }
    };

    if (error) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-red-600">Error loading data</h2>
                        <p className="text-gray-500">{error.message}</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (loading || !data) {
        return (
            <DashboardLayout role="superadmin">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader className="" />
                </div>
            </DashboardLayout>
        );
    }



    // Default values if data shapes mismatch during dev/hot-reload
    const {
        totalEmployees = 0,
        activeEmployees = 0,
        suspendedEmployees = 0,
        employeeGrowth = [],
        ticketStats = {},
        topPerformers = [],
        recentAttendance = []
    } = data || {};

    // Calculate derived stats
    const totalTickets = Object.values(ticketStats).reduce((a, b) => a + b, 0);
    const resolvedTickets = (ticketStats["RESOLVED"] || 0) + (ticketStats["CLOSED"] || 0);
    const pendingTickets = (ticketStats["OPEN"] || 0) + (ticketStats["IN_PROGRESS"] || 0);

    return (
        <>
            <Head>
                <title>Employee Dashboard - LearnXChain</title>
                <meta name="description" content="LearnXChain employee management dashboard — view employee stats, performance, attendance, top performers, and assign support tickets." />
            </Head>
            <DashboardLayout role="superadmin">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400">Overview of employee performance and attendance</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all w-fit max-w-fit self-start md:self-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Assign Task
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Total Employees"
                            value={totalEmployees}
                            icon={Users}
                            color="bg-blue-500/10 text-blue-500"
                            href="/dashboard/superadmin/employees"
                        />
                        <MetricCard
                            title="Active Employees"
                            value={activeEmployees}
                            icon={UserCheck}
                            color="bg-green-500/10 text-green-500"
                            href="/dashboard/superadmin/employees"
                        />
                        <MetricCard
                            title="Suspended Employees"
                            value={suspendedEmployees}
                            icon={UserMinus}
                            color="bg-red-500/10 text-red-500"
                            href="/dashboard/superadmin/employees"
                        />
                        <MetricCard
                            title="Total Tickets"
                            value={totalTickets}
                            icon={Ticket}
                            color="bg-purple-500/10 text-purple-500"
                            href="/dashboard/superadmin/support-tickets"
                        />
                        <MetricCard
                            title="Resolved Tickets"
                            value={resolvedTickets}
                            icon={CheckCircle}
                            color="bg-indigo-500/10 text-indigo-500"
                            href="/dashboard/superadmin/support-tickets"
                        />
                        <MetricCard
                            title="Pending Tickets"
                            value={pendingTickets}
                            icon={Clock}
                            color="bg-amber-500/10 text-amber-500"
                            href="/dashboard/superadmin/support-tickets"
                        />
                        <MetricCard
                            title="Total Leads"
                            value={data.salesMetrics?.totalLeads || 0}
                            icon={Users}
                            color="bg-blue-600/10 text-blue-600"
                            href="/dashboard/superadmin/leads"
                        />
                        <MetricCard
                            title="Total Demos"
                            value={data.salesMetrics?.totalDemos || 0}
                            icon={MonitorPlay}
                            color="bg-purple-600/10 text-purple-600"
                            href="/dashboard/superadmin/demos"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Employee Growth Chart */}
                        <div className="lg:col-span-2 h-[400px] lg:h-[350px]">
                            <EmployeeGrowthChart data={employeeGrowth} />
                        </div>
                        {/* Ticket Resolution Chart */}
                        <div className="lg:col-span-1 h-[400px] lg:h-[350px]">
                            <TicketResolutionChart stats={ticketStats} />
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="grid gap-6">
                        <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-gray-900">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Top Performers</h3>
                                <Link href="/dashboard/superadmin/employees" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium w-full sm:w-auto text-right sm:text-left">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {topPerformers.map((employee, index) => (
                                    <div key={employee.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 font-bold text-indigo-600 dark:text-indigo-400">
                                                {index + 1}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {employee.profilePic ? (
                                                    <img src={employee.profilePic} alt={employee.name} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <Users className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{employee.name}</p>
                                                    <p className="text-xs text-gray-500">{employee.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{employee.resolvedTickets}</p>
                                            <p className="text-xs text-gray-500">Tickets Resolved</p>
                                        </div>
                                    </div>
                                ))}
                                {topPerformers.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">No data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Attendance Table */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
                        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Attendance</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Latest check-in/check-out activity</p>
                            </div>
                            <Link href="/dashboard/superadmin/employees" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium w-full sm:w-auto text-right sm:text-left">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-white/5 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-3">Employee</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Punch In</th>
                                        <th className="px-6 py-3">Punch Out</th>
                                        <th className="px-6 py-3">Working Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {recentAttendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                {record.profilePic ? (
                                                    <img src={record.profilePic} alt={record.employeeName} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                )}
                                                {record.employeeName}
                                            </td>
                                            <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    record.status === "PRESENT" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                                        record.status === "ABSENT" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                )}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{record.punchIn ? new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                            <td className="px-6 py-4">{record.punchOut ? new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                            <td className="px-6 py-4">{record.workingHours ? `${record.workingHours.toFixed(1)} hrs` : "-"}</td>
                                        </tr>
                                    ))}
                                    {recentAttendance.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4">No recent attendance records</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardLayout>

            {/* Assign Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100 dark:border-white/5 flex items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                                        <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    Assign Ticket
                                </h2>
                                <p className="mt-2 sm:mt-1 text-sm text-gray-500 dark:text-gray-400 sm:ml-12">Choose an employee to handle a support ticket</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="group shrink-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignTask} className="p-8 space-y-8">
                            {/* Step 1: Assignee */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">1</span>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Assignee</label>
                                </div>
                                <select
                                    required
                                    className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white"
                                    value={taskData.assignedToId}
                                    onChange={(e) => setTaskData({ ...taskData, assignedToId: e.target.value })}
                                >
                                    <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Select an employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">
                                            {emp.user.name} — {emp.designation?.name || 'Employee'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Ticket */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">2</span>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose Ticket</label>
                                </div>
                                <select
                                    required
                                    className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white"
                                    value={selectedTicketId}
                                    onChange={(e) => setSelectedTicketId(e.target.value)}
                                >
                                    <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">Select a ticket...</option>
                                    {tickets.map(ticket => (
                                        <option key={ticket.id} value={ticket.id} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200">
                                            #{ticket.ticketNumber} — {ticket.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:flex-1 h-12 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full sm:flex-[2] h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader size="sm" variant="white" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Complete Assignment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
