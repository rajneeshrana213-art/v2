import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { getISTHours } from "@/lib/date-utils";

const { width } = Dimensions.get("window");

interface DashboardData {
  keyMetrics?: {
    totalStudents?: { total: number; active: number; percentageChange: string };
    totalTeachers?: { total: number; active: number; percentageChange: string };
    totalStaff?: { total: number; active: number; percentageChange: string };
    totalClasses?: { total: number; active: number };
    facilities?: { hostels: number; libraries: number; buses: number; drivers: number };
    interactions?: { totalTickets: number; openTickets: number; pendingFeedback: number };
  };
  attendance?: { overallPercentage: number };
  earnings?: { total: number };
  notices?: { title: string; date: string; daysSince: number }[];
  leaveRequests?: {
    requests: {
      id: string;
      user: { name: string; role: string };
      type: string;
      from: string;
      to: string;
      status: string;
    }[];
  };
  aiInsights?: { summary: string; score: number; status: string };
}

function MetricCard({
  label, value, sub, icon, color, index,
}: {
  label: string; value: string | number; sub?: string;
  icon: keyof typeof Ionicons.glyphMap; color: string; index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </Animated.View>
  );
}

function getTimeOfDay() {
  const h = getISTHours(new Date());
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function getScoreColor(score?: number) {
  if (!score) return "#6B7280";
  if (score >= 80) return COLORS.success;
  if (score >= 60) return "#F59E0B";
  return COLORS.error;
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get<DashboardData>("/api/v1/dashboard/school-admin");
      setData(res as any);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLeaveAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await api.post(`/api/v1/admin/leave-requests/${id}/${action}`, {});
      fetchDashboard();
    } catch (err) {
      console.error(`Leave ${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const km = data?.keyMetrics;
  const metrics = [
    { label: "Students", value: km?.totalStudents?.total ?? 0, sub: `${km?.totalStudents?.active ?? 0} active`, icon: "people" as const, color: COLORS.primary },
    { label: "Teachers", value: km?.totalTeachers?.total ?? 0, sub: `${km?.totalTeachers?.active ?? 0} active`, icon: "school" as const, color: "#8B5CF6" },
    { label: "Staff", value: km?.totalStaff?.total ?? 0, sub: `${km?.totalStaff?.active ?? 0} active`, icon: "briefcase" as const, color: "#F59E0B" },
    { label: "Classes", value: km?.totalClasses?.total ?? 0, sub: `${km?.totalClasses?.active ?? 0} active`, icon: "library" as const, color: COLORS.success },
  ];

  const attendancePct = Math.round(data?.attendance?.overallPercentage ?? 0);
  const pendingLeave = (data?.leaveRequests?.requests ?? []).filter((r) => r.status === "PENDING");
  const notices = data?.notices ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={["#1A73B5", "#0D4F8A"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.adminName}>{user?.name ?? "Admin"}</Text>
          </View>
          {data?.aiInsights?.score !== undefined && (
            <View style={[styles.aiScore, { backgroundColor: getScoreColor(data.aiInsights.score) }]}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.aiScoreText}>{data.aiInsights.score}</Text>
            </View>
          )}
        </View>
        <View style={styles.attendanceRow}>
          <Text style={styles.attendanceLabel}>Today's Attendance</Text>
          <Text style={styles.attendancePct}>{attendancePct}%</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} index={i} />
          ))}
        </View>

        {km?.facilities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.facilitiesRow}>
              {[
                { label: "Hostels", val: km.facilities.hostels, icon: "home" as const },
                { label: "Libraries", val: km.facilities.libraries, icon: "library" as const },
                { label: "Buses", val: km.facilities.buses, icon: "bus" as const },
                { label: "Drivers", val: km.facilities.drivers, icon: "person" as const },
              ].map((f) => (
                <View key={f.label} style={styles.facilityChip}>
                  <Ionicons name={f.icon} size={16} color={COLORS.primary} />
                  <Text style={styles.facilityVal}>{f.val}</Text>
                  <Text style={styles.facilityLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data?.earnings?.total !== undefined && (
          <View style={styles.section}>
            <View style={styles.earningsCard}>
              <Ionicons name="trending-up" size={20} color={COLORS.success} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.earningsLabel}>Total Earnings (This Month)</Text>
                <Text style={styles.earningsValue}>
                  ₹{(data.earnings.total / 100000).toFixed(1)}L
                </Text>
              </View>
            </View>
          </View>
        )}

        {data?.aiInsights?.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <View style={styles.insightCard}>
              <Ionicons name="sparkles" size={18} color="#8B5CF6" />
              <Text style={styles.insightText}>{data.aiInsights.summary}</Text>
            </View>
          </View>
        ) : null}

        {pendingLeave.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Leave Requests ({pendingLeave.length})</Text>
            {pendingLeave.slice(0, 5).map((req) => (
              <Animated.View key={req.id} entering={FadeInDown.springify()} style={styles.leaveCard}>
                <View style={styles.leaveTop}>
                  <View style={styles.leaveAvatar}>
                    <Text style={styles.leaveAvatarText}>{req.user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leaveName}>{req.user.name}</Text>
                    <Text style={styles.leaveRole}>{req.user.role} · {req.type}</Text>
                    <Text style={styles.leaveDates}>
                      {format(new Date(req.from), "dd MMM")} — {format(new Date(req.to), "dd MMM")}
                    </Text>
                  </View>
                </View>
                <View style={styles.leaveActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.success + "15" }]}
                    onPress={() => handleLeaveAction(req.id, "approve")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === req.id + "approve" ? (
                      <ActivityIndicator size="small" color={COLORS.success} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.error + "15" }]}
                    onPress={() => handleLeaveAction(req.id, "reject")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === req.id + "reject" ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={16} color={COLORS.error} />
                        <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Reject</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        {notices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            {notices.slice(0, 3).map((n, i) => (
              <View key={i} style={styles.noticeRow}>
                <Ionicons name="megaphone" size={16} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.noticeTitle}>{n.title}</Text>
                  <Text style={styles.noticeDate}>
                    {n.daysSince === 0 ? "Today" : n.daysSince === 1 ? "Yesterday" : `${n.daysSince} days ago`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  adminName: { fontSize: 20, color: "#fff", fontFamily: "Inter_700Bold" },
  aiScore: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  aiScoreText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  attendanceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 12,
  },
  attendanceLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_500Medium" },
  attendancePct: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  metricCard: {
    width: (width - 56) / 2, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  metricValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  metricLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted, marginTop: 2 },
  metricSub: { fontSize: 10, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 10 },
  facilitiesRow: { flexDirection: "row", gap: 8 },
  facilityChip: {
    flex: 1, alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, gap: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  facilityVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  facilityLabel: { fontSize: 9, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  earningsCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  earningsLabel: { fontSize: 12, color: COLORS.textMuted, fontFamily: "Inter_400Regular" },
  earningsValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  insightCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#F5F3FF", borderRadius: 14, padding: 14, gap: 10 },
  insightText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#4C1D95", lineHeight: 20 },
  leaveCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  leaveTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  leaveAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  leaveAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.primary },
  leaveName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  leaveRole: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  leaveDates: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.primary, marginTop: 2 },
  leaveActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  noticeRow: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  noticeTitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
  noticeDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
});
