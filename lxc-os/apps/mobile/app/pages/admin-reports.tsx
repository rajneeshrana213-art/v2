import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface ReportSummary {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  feeCollectionRate: number;
  passPercentage?: number;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get<ReportSummary>("/api/v1/admin/reports");
      setData(res as any);
    } catch (err) { console.error("Reports fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchReports(); }, [fetchReports]);

  const REPORT_TYPES = [
    { label: "Student Progress Report", icon: "trending-up-outline" as const, color: COLORS.primary },
    { label: "Fee Collection Report", icon: "wallet-outline" as const, color: COLORS.success },
    { label: "Attendance Summary", icon: "checkbox-outline" as const, color: "#F59E0B" },
    { label: "Exam Performance", icon: "clipboard-outline" as const, color: "#8B5CF6" },
    { label: "Teacher Productivity", icon: "school-outline" as const, color: "#EC4899" },
    { label: "Student Lifecycle", icon: "git-branch-outline" as const, color: "#06B6D4" },
  ];

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <PageHeader title="Reports" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {data && (
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>School Overview</Text>
            <View style={styles.overviewGrid}>
              {[
                { label: "Students", value: data.totalStudents, icon: "people" as const, color: COLORS.primary },
                { label: "Teachers", value: data.totalTeachers, icon: "school" as const, color: "#8B5CF6" },
                { label: "Attendance", value: `${Math.round(data.attendanceRate)}%`, icon: "checkbox" as const, color: COLORS.success },
                { label: "Fee Collected", value: `${Math.round(data.feeCollectionRate)}%`, icon: "wallet" as const, color: "#F59E0B" },
              ].map((m) => (
                <View key={m.label} style={styles.overviewItem}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                  <Text style={[styles.overviewValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={styles.overviewLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Available Reports</Text>
        {REPORT_TYPES.map((r, i) => (
          <Animated.View key={r.label} entering={FadeInDown.delay(i * 50).springify()}>
            <TouchableOpacity style={styles.reportCard}>
              <View style={[styles.reportIcon, { backgroundColor: r.color + "15" }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text style={styles.reportLabel}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: "center", justifyContent: "center" },
  overviewCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  overviewTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 14 },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  overviewItem: { width: "45%", alignItems: "center", gap: 4 },
  overviewValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  overviewLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 12 },
  reportCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  reportIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  reportLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
});
