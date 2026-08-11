import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, FlatList, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format } from "date-fns";

type Tab = "students" | "teachers" | "staff";

interface AttendanceRecord {
  id: string;
  name: string;
  status: string;
  class?: string;
  department?: string;
  role?: string;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
  records: AttendanceRecord[];
}

const TAB_LABELS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "students", label: "Students", icon: "people-outline" },
  { key: "teachers", label: "Teachers", icon: "school-outline" },
  { key: "staff", label: "Staff", icon: "briefcase-outline" },
];

const STATUS_COLORS: Record<string, string> = {
  PRESENT: COLORS.success,
  ABSENT: COLORS.error,
  LATE: COLORS.warning,
  LEAVE: "#6B7280",
};

export default function AdminAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const endpoint = `/api/v1/admin/dashboard/attendance/${activeTab}?date=${dateStr}`;
      const res = await api.get<any>(endpoint);
      const d = res as any;
      const records: AttendanceRecord[] = d?.records ?? d?.data ?? [];
      const present = records.filter((r) => r.status === "PRESENT").length;
      const absent = records.filter((r) => r.status === "ABSENT").length;
      const late = records.filter((r) => r.status === "LATE").length;
      const total = records.length || d?.total || 0;
      setSummary({
        present: d?.present ?? present,
        absent: d?.absent ?? absent,
        late: d?.late ?? late,
        total: d?.total ?? total,
        percentage: d?.percentage ?? (total > 0 ? Math.round((present / total) * 100) : 0),
        records,
      });
    } catch (err) {
      console.error("Attendance fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, date]);

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    fetchAttendance();
  }, [activeTab, date]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, [fetchAttendance]);

  const statItems = [
    { label: "Present", value: summary?.present ?? 0, color: COLORS.success },
    { label: "Absent", value: summary?.absent ?? 0, color: COLORS.error },
    { label: "Late", value: summary?.late ?? 0, color: COLORS.warning },
    { label: "Total", value: summary?.total ?? 0, color: COLORS.primary },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity style={styles.datePill} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.datePillText}>{format(date, "dd MMM yyyy")}</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      <View style={styles.tabRow}>
        {TAB_LABELS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons name={t.icon} size={15} color={activeTab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            {statItems.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {summary && summary.total > 0 && (
            <View style={styles.pctCard}>
              <View style={styles.pctRow}>
                <Text style={styles.pctLabel}>Attendance Rate</Text>
                <Text style={styles.pctValue}>{summary.percentage}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${summary.percentage}%` as any }]} />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Records ({summary?.records.length ?? 0})</Text>
            {summary?.records.map((r, i) => (
              <Animated.View key={r.id} entering={FadeInDown.delay(i * 30).springify()} style={styles.recordRow}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[r.status] ?? COLORS.textMuted }]} />
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{r.name}</Text>
                  {r.class ? <Text style={styles.recordSub}>{r.class}</Text> : null}
                  {r.department ? <Text style={styles.recordSub}>{r.department}</Text> : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[r.status] ?? COLORS.textMuted) + "20" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] ?? COLORS.textMuted }]}>
                    {r.status}
                  </Text>
                </View>
              </Animated.View>
            ))}
            {(summary?.records.length === 0) && (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No records for this date</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  datePill: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: COLORS.primaryLight, borderRadius: 20,
  },
  datePillText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
  tabRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 9, borderRadius: 12, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.textMuted, marginTop: 2 },
  pctCard: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  pctRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  pctLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  pctValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.primary },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: "hidden" },
  progressBar: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 10 },
  recordRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  recordSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
