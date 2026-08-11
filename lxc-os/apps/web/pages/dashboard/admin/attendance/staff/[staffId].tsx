import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader } from "@/components/ui/feedback/Loader";
import { ChevronLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, TrendingUp, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatISTDateKey, parseInstitutionalDate } from "@/lib/utils/date-utils";

export default function StaffDetailedAttendance() {
    const router = useRouter();
    const { staffId } = router.query;
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (staffId) {
            fetchData();
        }
    }, [staffId, month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/v1/admin/dashboard/attendance/staff/${staffId}?month=${month}&year=${year}`);
            setData(res.data);
        } catch (err) {
            toast.error("Failed to fetch detailed attendance");
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const timeline = Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
        const dayRecord = data?.attendances?.find(
            (a: any) => formatISTDateKey(new Date(a.date)) === dateStr,
        );
        return {
            date: i + 1,
            dayOfWeek: parseInstitutionalDate(dateStr).toLocaleString('en-US', { weekday: 'narrow' }),
            record: dayRecord
        };
    });

    const presentDays = data?.attendances?.filter((a: any) => a.present).length || 0;
    const totalRecorded = data?.attendances?.length || 0;
    const percentage = totalRecorded > 0 ? Math.round((presentDays / totalRecorded) * 100) : 0;
    const absentDays = totalRecorded - presentDays;

    return (
        <>
            <Head>
                <title>Staff Attendance Detail - Admin</title>
            </Head>
            <DashboardLayout role="admin">
                <div className="space-y-6 pb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin/attendance">
                            <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Detail</h1>
                            <p className="text-sm text-gray-500">View individual staff daily logs</p>
                        </div>
                    </div>

                    {loading && !data ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader size="lg" />
                        </div>
                    ) : data ? (
                        <div className="grid gap-6">
                            {/* Profile Card */}
                            <Card className="p-0 border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden rounded-[2.5rem]">
                                <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {data.profilePic ? (
                                                <img src={data.profilePic} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-black text-indigo-500">{data.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="font-mono text-xs">{data.employeeCode}</Badge>
                                                <span className="text-sm text-gray-500 font-medium">{data.department} • {data.designation}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Month / Year</label>
                                            <input 
                                                type="month" 
                                                value={`${year}-${month.toString().padStart(2, '0')}`}
                                                onChange={(e) => {
                                                    const [y, m] = e.target.value.split('-');
                                                    setYear(parseInt(y));
                                                    setMonth(parseInt(m));
                                                }}
                                                className="bg-transparent text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid gap-4 sm:grid-cols-3 mb-8">
                                        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02] bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Attendance Score</p>
                                                <div className="p-2 rounded-xl bg-white/20">
                                                    <TrendingUp className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black mb-1">{percentage}%</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-indigo-200">For selected month</p>
                                        </div>
                                        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Present</p>
                                                <div className="p-2 rounded-xl bg-white dark:bg-emerald-900/40">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black mb-1 text-gray-900 dark:text-white">{presentDays}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-emerald-500">Days attended</p>
                                        </div>
                                        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02] bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Absent</p>
                                                <div className="p-2 rounded-xl bg-white dark:bg-rose-900/40">
                                                    <XCircle className="h-5 w-5 text-rose-500" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black mb-1 text-gray-900 dark:text-white">{absentDays}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-rose-500">Days missed</p>
                                        </div>
                                    </div>

                                    {/* Month Visual Matrix */}
                                    <div className="space-y-4 border border-gray-100 dark:border-white/5 rounded-3xl p-6 bg-gray-50/50 dark:bg-gray-800/30">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-indigo-500" />
                                            Daily Attendance Matrix
                                        </h3>
                                        
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {timeline.map((day) => {
                                                let pillBg = "bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5";
                                                let textColor = "text-gray-400";
                                                
                                                if (day.record) {
                                                    if (day.record.present) {
                                                        pillBg = "bg-emerald-500 border-emerald-600 shadow-emerald-200 dark:shadow-none";
                                                        textColor = "text-white text-emerald-50";
                                                    } else {
                                                        pillBg = "bg-rose-500 border-rose-600 shadow-rose-200 dark:shadow-none";
                                                        textColor = "text-white text-rose-50";
                                                    }
                                                }

                                                return (
                                                    <div key={day.date} className={`flex flex-col items-center justify-center p-2 rounded-xl border w-11 sm:w-12 h-14 shadow-sm hover:shadow-md transition-shadow relative group cursor-default ${pillBg}`}>
                                                        <span className={`text-xs font-black leading-none ${textColor}`}>{day.date}</span>
                                                        <span className={`text-[9px] font-bold leading-none mt-1 opacity-80 ${textColor}`}>{day.dayOfWeek}</span>
                                                        
                                                        {day.record && (
                                                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                {day.record.subject} ({day.record.status})
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Raw Data Table */}
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            Detailed Records
                                        </h3>
                                        <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50/80 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                                    <tr>
                                                        <th className="px-4 py-3">Date</th>
                                                        <th className="px-4 py-3">Type</th>
                                                        <th className="px-4 py-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                    {data.attendances?.length > 0 ? (
                                                        data.attendances.map((att: any) => (
                                                            <tr key={att.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                                                                <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">
                                                                    {new Date(att.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                                    {att.subject}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {att.present ? (
                                                                        <Badge tone="success" variant="soft" className="text-[10px] font-bold py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> PRESENT</Badge>
                                                                    ) : (
                                                                        <Badge tone="danger" variant="soft" className="text-[10px] font-bold py-0.5"><XCircle className="w-3 h-3 mr-1" /> ABSENT</Badge>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                                No records found for this month.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Staff Member Not Found</h2>
                            <p className="text-gray-500 mt-2">The requested staff member could not be located or you don't have access.</p>
                            <Link href="/dashboard/admin/attendance" className="mt-6">
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                                    Return to Attendance
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
