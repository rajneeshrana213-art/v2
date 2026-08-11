import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { getISTDayOfWeek } from "@/lib/date-utils";

type DayStatus = "Present" | "Absent" | "Late" | "Holiday" | "None";

const STATUS_COLORS: Record<DayStatus, string> = {
  Present: COLORS.success,
  Absent: COLORS.error,
  Late: COLORS.warning,
  Holiday: "#D1D5DB",
  None: "transparent",
};

const STATUS_BG: Record<DayStatus, string> = {
  Present: "#DCFCE7",
  Absent: "#FEE2E2",
  Late: "#FEF3C7",
  Holiday: "#F3F4F6",
  None: "transparent",
};

export default function ParentAttendanceScreen() {
  const { activeStudentId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!activeStudentId) return;
    try {
      const res = await api.get(`/api/v1/dashboard/parent/attendance?studentId=${activeStudentId}`);
      setData((res as any)?.data ?? res);
    } catch (e) {
      console.error("Parent attendance fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStudentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getDayStatus = (date: Date): DayStatus => {
    if (!data?.attendance) return "None";
    const record = data.attendance.find((r: any) => isSameDay(new Date(r.date), date));
    if (!record) return "None";
    return record.status as DayStatus;
  };

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = getISTDayOfWeek(startOfMonth(currentMonth));
  const stats = data?.stats ?? {};

  const prevMonth = () => setCurrentMonth(d => subMonths(d, 1));
  const nextMonth = () => setCurrentMonth(d => addMonths(d, 1));

  if (loading) {
    return (
      <View style={styles.centered}>
        <PageHeader title="Child Attendance" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Child Attendance" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {!activeStudentId && (
          <View style={styles.emptyCard}>
            <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No child selected</Text>
            <Text style={styles.emptySubtext}>Please select a child from your profile</Text>
          </View>
        )}

        {activeStudentId && (
          <>
            <View style={styles.statsRow}>
              {[
                { label: "Present", value: stats.present ?? 0, color: COLORS.success },
                { label: "Absent", value: stats.absent ?? 0, color: COLORS.error },
                { label: "Late", value: stats.late ?? 0, color: COLORS.warning },
                { label: "Holidays", value: stats.holidays ?? 0, color: COLORS.textMuted },
              ].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.percentCard}>
              <Text style={styles.percentLabel}>Attendance Rate</Text>
              <Text style={[styles.percentValue, {
                color: (stats.percentage ?? 0) >= 75 ? COLORS.success : COLORS.error
              }]}>
                {stats.percentage ?? 0}%
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${Math.min(stats.percentage ?? 0, 100)}%` as any,
                  backgroundColor: (stats.percentage ?? 0) >= 75 ? COLORS.success : COLORS.error,
                }]} />
              </View>
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Pressable onPress={prevMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
                </Pressable>
                <Text style={styles.monthTitle}>{format(currentMonth, "MMMM yyyy")}</Text>
                <Pressable onPress={nextMonth} style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
                </Pressable>
              </View>
              <View style={styles.weekRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <Text key={i} style={styles.weekLabel}>{d}</Text>
                ))}
              </View>
              <View style={styles.grid}>
                {Array(firstDayOfWeek).fill(null).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}
                {daysInMonth.map(day => {
                  const status = getDayStatus(day);
                  return (
                    <View key={day.toISOString()} style={[
                      styles.dayCell,
                      { backgroundColor: STATUS_BG[status], borderRadius: 6 }
                    ]}>
                      <Text style={[styles.dayNum, {
                        color: status !== "None" ? STATUS_COLORS[status] : COLORS.textMuted
                      }]}>
                        {format(day, "d")}
                      </Text>
                      {status !== "None" && (
                        <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status] }]} />
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={styles.legend}>
                {(["Present", "Absent", "Late", "Holiday"] as DayStatus[]).map(s => (
                  <View key={s} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[s] }]} />
                    <Text style={styles.legendText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            {(data?.recentAbsences ?? []).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Absences</Text>
                {data.recentAbsences.map((r: any) => (
                  <View key={r.date} style={styles.absenceRow}>
                    <Ionicons name="close-circle" size={18} color={COLORS.error} />
                    <Text style={styles.absenceDate}>{format(new Date(r.date), "EEE, dd MMM yyyy")}</Text>
                    {r.reason && <Text style={styles.absenceReason}>{r.reason}</Text>}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  percentCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  percentLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  percentValue: { fontSize: 32, fontWeight: "700", marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  calendarCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  calendarHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navBtn: { padding: 4 },
  monthTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  weekRow: { flexDirection: "row", marginBottom: 6 },
  weekLabel: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600", color: COLORS.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", padding: 2 },
  dayNum: { fontSize: 12, fontWeight: "500" },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.textSecondary },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  absenceRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 8, padding: 10, marginBottom: 6,
  },
  absenceDate: { fontSize: 13, color: COLORS.textPrimary, flex: 1 },
  absenceReason: { fontSize: 12, color: COLORS.textMuted },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32,
    alignItems: "center", marginTop: 20,
  },
  emptyText: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: "center" },
});
