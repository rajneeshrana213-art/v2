import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { AttendanceData } from "@/lib/types/student";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { getISTDayOfWeek } from "@/lib/date-utils";

type DayStatus = "Present" | "Absent" | "Late" | "Holiday" | "None";

const STATUS_COLORS: Record<DayStatus, string> = {
  Present: COLORS.success,
  Absent: COLORS.error,
  Late: COLORS.warning,
  Holiday: "#D1D5DB",
  None: "transparent",
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function AttendancePage() {
  const insets = useSafeAreaInsets();
  const { user, activeStudentId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [selectedDate] = useState(new Date());

  const fetchAttendance = useCallback(async () => {
    try {
      let response;
      if (user?.role === "parent") {
        if (!activeStudentId) return;
        response = await api.get<AttendanceData>(`/api/v1/dashboard/parent/attendance?studentId=${activeStudentId}`);
      } else if (user?.role === "teacher") {
        response = await api.get<AttendanceData>("/api/v1/dashboard/teacher/attendance");
      } else {
        response = await api.get<AttendanceData>("/api/v1/dashboard/student/attendance");
      }
      setAttendanceData(response as any);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role, activeStudentId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const percentage = Math.round(attendanceData?.percentage || 0);
  const filledSegments = Math.round((percentage / 100) * 36);

  // Generate calendar days for current month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getISTDayOfWeek(monthStart);

  const calendarDays = [
    ...Array(startDay).fill(null),
    ...daysInMonth,
  ];

  const getDayStatus = (date: Date): DayStatus => {
    if (!attendanceData) return "None";
    const record = attendanceData.recentRecords.find((r) => isSameDay(new Date(r.date), date));
    return (record?.status as DayStatus) || "None";
  };

  const stats = [
    { label: "Present", value: attendanceData?.presentDays.toString() || "0", color: COLORS.success, bg: "#DCFCE7", icon: "checkmark-circle-outline" as const },
    { label: "Absent", value: ((attendanceData?.totalDays || 0) - (attendanceData?.presentDays || 0)).toString(), color: COLORS.error, bg: "#FEE2E2", icon: "close-circle-outline" as const },
    { label: "Late", value: attendanceData?.lateDays?.toString() || "0", color: COLORS.warning, bg: "#FEF3C7", icon: "time-outline" as const },
    { label: "Total Days", value: attendanceData?.totalDays.toString() || "0", color: COLORS.primary, bg: COLORS.primaryLight, icon: "calendar-outline" as const },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="Attendance" subtitle={`Overall Achievement: ${percentage}%`} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 + 16 : insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.circularCard}>
          <View style={styles.circularContainer}>
            <View style={styles.circleOuter}>
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10 - 90) * (Math.PI / 180);
                const radius = 52;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isFilled = i < filledSegments;
                return (
                  <View
                    key={i}
                    style={[
                      styles.circleSegment,
                      {
                        backgroundColor: isFilled ? COLORS.success : COLORS.border,
                        transform: [
                          { translateX: x },
                          { translateY: y },
                        ],
                      },
                    ]}
                  />
                );
              })}
              <View style={styles.circleInner}>
                <Text style={styles.percentageText}>{percentage}%</Text>
                <Text style={styles.percentageLabel}>Attendance</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textPrimary} />
            <Text style={styles.calendarTitle}>{format(selectedDate, "MMMM yyyy")}</Text>
          </View>
          <View style={styles.calendarGrid}>
            {DAY_LABELS.map((label, idx) => (
              <View key={`label-${idx}`} style={styles.calendarDayLabel}>
                <Text style={styles.calendarDayLabelText}>{label}</Text>
              </View>
            ))}
            {calendarDays.map((date, idx) => {
              const status = date ? getDayStatus(date) : "None";
              return (
                <View key={`day-${idx}`} style={styles.calendarCell}>
                  {date ? (
                    <View
                      style={[
                        styles.calendarDot,
                        { backgroundColor: STATUS_COLORS[status] === "transparent" ? "transparent" : STATUS_COLORS[status] },
                        status === "None" && { borderWidth: 1, borderColor: COLORS.border }
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          {
                            color: status === "Holiday" || status === "None" ? COLORS.textMuted : "#FFFFFF",
                          },
                        ]}
                      >
                        {format(date, "d")}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.calendarEmpty} />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            {[
              { label: "Present", color: COLORS.success },
              { label: "Absent", color: COLORS.error },
              { label: "Late", color: COLORS.warning },
              { label: "Holiday", color: "#D1D5DB" },
            ].map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {attendanceData?.recentRecords && attendanceData.recentRecords.length > 0 && (
          <View style={styles.recentLogsCard}>
            <Text style={styles.recentLogsTitle}>Recent Logs</Text>
            {attendanceData.recentRecords.slice(0, 5).map((record, idx) => (
              <View key={idx} style={styles.logRow}>
                <View style={styles.logDateInfo}>
                  <Text style={styles.logDate}>{format(new Date(record.date), "EEEE, MMM d")}</Text>
                </View>
                <View style={[styles.logStatusBadge, { backgroundColor: STATUS_COLORS[record.status as DayStatus] + "15" }]}>
                  <Text style={[styles.logStatusText, { color: STATUS_COLORS[record.status as DayStatus] }]}>{record.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}
    </View>
  );
}

export default AttendancePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularCard: {
    margin: 16,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  circularContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSegment: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  circleInner: {
    alignItems: "center",
  },
  percentageText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  percentageLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "46%",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  calendarCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textPrimary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayLabel: {
    width: "14.28%",
    alignItems: "center",
    paddingBottom: 8,
  },
  calendarDayLabelText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.textMuted,
  },
  calendarCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
  },
  calendarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  calendarEmpty: {
    width: 32,
    height: 32,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  recentLogsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentLogsTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logDateInfo: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: COLORS.textPrimary,
  },
  logStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logStatusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
