import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface SubscriptionStatus {
  status: string;
  planName?: string;
  endDate?: string;
  remainingDays?: number;
  allowedUsers?: number;
  activeUsersCount?: number;
  isInGrace?: boolean;
}

interface Feature {
  key: string;
  name: string;
  status: "ENABLED" | "DISABLED";
  monthlyPrice?: number;
  isMandatory?: boolean;
}

const FEATURE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  people: "people-outline",
  finance: "wallet-outline",
  library: "library-outline",
  transport: "bus-outline",
  hostel: "home-outline",
  exams: "clipboard-outline",
  hrm: "briefcase-outline",
  communication: "chatbubbles-outline",
  events: "calendar-outline",
  reports: "bar-chart-outline",
};

export default function AdminMembershipPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, featuresRes] = await Promise.allSettled([
        api.get<any>("/api/v1/dashboard/admin-subscription-status"),
        api.get<any>("/api/v1/dashboard/admin-features"),
      ]);
      if (statusRes.status === "fulfilled") setStatus(statusRes.value as any);
      if (featuresRes.status === "fulfilled") {
        const d = featuresRes.value as any;
        setFeatures(Array.isArray(d) ? d : d?.features ?? d?.data ?? []);
      }
    } catch (err) { console.error("Membership fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const daysLeft = status?.remainingDays ?? 0;
  const daysColor = daysLeft > 30 ? COLORS.success : daysLeft > 7 ? COLORS.warning : COLORS.error;
  const usagePercent = status?.allowedUsers ? Math.min(100, Math.round(((status.activeUsersCount ?? 0) / status.allowedUsers) * 100)) : 0;

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <PageHeader title="Membership" subtitle="Subscription & features" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {status && (
          <Animated.View entering={FadeInDown.springify()} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{status.planName ?? "Active Plan"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.status === "ACTIVE" ? COLORS.success + "20" : COLORS.warning + "20" }]}>
                  <Text style={[styles.statusText, { color: status.status === "ACTIVE" ? COLORS.success : COLORS.warning }]}>
                    {status.isInGrace ? "Grace Period" : status.status}
                  </Text>
                </View>
              </View>
              <View style={styles.daysBox}>
                <Text style={[styles.daysNum, { color: daysColor }]}>{daysLeft}</Text>
                <Text style={styles.daysLabel}>days left</Text>
              </View>
            </View>

            {status.endDate && (
              <Text style={styles.endDate}>Expires: {new Date(status.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</Text>
            )}

            <View style={styles.userSection}>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Active Users</Text>
                <Text style={styles.userCount}>{status.activeUsersCount ?? 0} / {status.allowedUsers ?? "∞"}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${usagePercent}%` as any, backgroundColor: usagePercent > 90 ? COLORS.error : COLORS.primary }]} />
              </View>
            </View>
          </Animated.View>
        )}

        {features.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Feature Modules</Text>
            {features.map((f, i) => {
              const icon = FEATURE_ICONS[f.key] ?? "cube-outline";
              const isEnabled = f.status === "ENABLED";
              return (
                <Animated.View key={f.key} entering={FadeInDown.delay(i * 40).springify()} style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: isEnabled ? COLORS.primaryLight : COLORS.border + "50" }]}>
                    <Ionicons name={icon} size={20} color={isEnabled ? COLORS.primary : COLORS.textMuted} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.featureName, !isEnabled && { color: COLORS.textMuted }]}>{f.name}</Text>
                    {f.monthlyPrice != null && f.monthlyPrice > 0 && (
                      <Text style={styles.featurePrice}>₹{f.monthlyPrice}/mo</Text>
                    )}
                    {f.isMandatory && <Text style={styles.mandatoryBadge}>Mandatory</Text>}
                  </View>
                  <View style={[styles.featureStatus, { backgroundColor: isEnabled ? COLORS.success + "20" : COLORS.error + "15" }]}>
                    <Ionicons name={isEnabled ? "checkmark-circle" : "close-circle"} size={16} color={isEnabled ? COLORS.success : COLORS.error} />
                    <Text style={[styles.featureStatusText, { color: isEnabled ? COLORS.success : COLORS.error }]}>
                      {isEnabled ? "Active" : "Disabled"}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </>
        )}

        {features.length === 0 && !loading && (
          <View style={styles.center}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No feature data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  planCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  planName: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  daysBox: { alignItems: "center" },
  daysNum: { fontSize: 36, fontFamily: "Inter_700Bold", lineHeight: 40 },
  daysLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  endDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginBottom: 14 },
  userSection: { gap: 8 },
  userRow: { flexDirection: "row", justifyContent: "space-between" },
  userLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  userCount: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  progressBar: { height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 14 },
  featureCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  featureIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  featurePrice: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  mandatoryBadge: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.warning, marginTop: 2 },
  featureStatus: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  featureStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
