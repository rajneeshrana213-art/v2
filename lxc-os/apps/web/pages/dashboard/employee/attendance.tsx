import Head from "next/head";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import client from "@/lib/api/client";
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/feedback/Loader";
import { formatISTDateKey } from "@/lib/utils/date-utils";

interface AttendanceDay {
  date: string;
  status: string;
  punchIn: string | null;
  punchOut: string | null;
  workingHours: number | null;
  isLateEntry: boolean;
  isEarlyExit: boolean;
  overtimeHours: number | null;
  attendanceType: string;
}

interface MonthlyAttendance {
  month: number;
  year: number;
  calendar: AttendanceDay[];
  summary: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    halfDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
    attendancePercentage: number;
  };
}

export default function EmployeeAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyAttendance | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchAttendanceData();
  }, [month, year]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.get(`/v1/employee/attendance?type=monthly&month=${month}&year=${year}`);
      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch attendance:", err);
      setError(err.response?.data?.error || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAttendanceForDate = (date: Date): AttendanceDay | null => {
    if (!data) return null;
    const dateKey = formatISTDateKey(date);
    return (
      data.calendar.find((day) => formatISTDateKey(new Date(day.date)) === dateKey) ||
      null
    );
  };

  const getStatusColor = (status: string, isLate: boolean, isEarly: boolean) => {
    if (status === 'PRESENT') {
      if (isLate) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
    }
    if (status === 'ABSENT') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800';
    if (status === 'LATE') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800';
    return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 border-gray-300 dark:border-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PRESENT' || status === 'LATE') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'ABSENT') return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  };

  const formatHours = (hours: number | null) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const averageWorkingHours = data && data.summary.presentDays > 0
    ? (data.summary.totalWorkingHours / data.summary.presentDays).toFixed(1)
    : '0';

  if (loading) {
    return (
      <DashboardLayout role="employee">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>My Attendance - Employee Dashboard</title>
      </Head>
      <DashboardLayout role="employee">
        <div className="w-full mx-auto space-y-6 pb-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white font-outfit tracking-tight">
                My Attendance
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                View your attendance calendar and working hours
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Average Hours
                    </p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {averageWorkingHours}h
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Present Days
                    </p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {data.summary.presentDays}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Total Hours
                    </p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatHours(data.summary.totalWorkingHours)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Attendance %
                    </p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {data.summary.attendancePercentage}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square" />;
                }

                const attendance = getAttendanceForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isPast = date < new Date() && !isToday;

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square rounded-xl border-2 p-2 cursor-pointer transition-all hover:scale-105",
                      isToday && "ring-2 ring-indigo-500 ring-offset-2",
                      isSelected && "ring-2 ring-indigo-300 dark:ring-indigo-600",
                      attendance
                        ? getStatusColor(attendance.status, attendance.isLateEntry, attendance.isEarlyExit)
                        : isPast
                          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            isToday && "text-indigo-600 dark:text-indigo-400",
                            !isToday && attendance && "text-current",
                            !isToday && !attendance && "text-gray-400 dark:text-gray-500"
                          )}
                        >
                          {date.getDate()}
                        </span>
                        {attendance && (
                          <div className="text-xs">
                            {getStatusIcon(attendance.status)}
                          </div>
                        )}
                      </div>
                      {attendance && attendance.workingHours ? (
                        <div className="text-[8px] sm:text-[10px] font-semibold mt-auto opacity-75 hidden md:block">
                          {formatHours(attendance.workingHours)}
                        </div>
                      ) : null}
                      {attendance && attendance.isLateEntry ? (
                        <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight mt-auto sm:mt-0.5 opacity-75">
                          Late
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              {(() => {
                const attendance = getAttendanceForDate(selectedDate);
                if (!attendance) {
                  return (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-semibold">No attendance record for this date</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Punch Times
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Punch In</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatTime(attendance.punchIn)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Punch Out</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatTime(attendance.punchOut)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Status</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-lg",
                            getStatusColor(attendance.status, attendance.isLateEntry, attendance.isEarlyExit)
                          )}>
                            {attendance.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Working Hours</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatHours(attendance.workingHours)}
                          </span>
                        </div>
                        {attendance.overtimeHours && attendance.overtimeHours > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Overtime</span>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                              {formatHours(attendance.overtimeHours)}
                            </span>
                          </div>
                        )}
                        {attendance.isLateEntry && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Late Entry</span>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Yes</span>
                          </div>
                        )}
                        {attendance.isEarlyExit && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Early Exit</span>
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Additional Stats */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Late Days
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {data.summary.lateDays}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Absent Days
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {data.summary.absentDays}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Overtime Hours
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {formatHours(data.summary.totalOvertimeHours)}
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

