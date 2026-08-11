import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface OutstandingSummary {
  totalFees: number;
  collected: number;
  outstanding: number;
  overdue: number;
}

interface AgingBucket { label: string; amount: number; count: number }

interface ClassReceivable { className: string; totalFee: number; collected: number; outstanding: number }

interface Defaulter { id: string; name: string; class: string; outstanding: number; daysOverdue: number }

function formatMoney(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminFinanceScreen() {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<OutstandingSummary | null>(null);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [classReceivables, setClassReceivables] = useState<ClassReceivable[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [sumRes, agingRes, classRes, defRes] = await Promise.allSettled([
        api.get<OutstandingSummary>("/api/v1/finance/reports/outstanding-summary"),
        api.get<AgingBucket[]>("/api/v1/finance/reports/aging"),
        api.get<ClassReceivable[]>("/api/v1/finance/reports/class-receivables"),
        api.get<Defaulter[]>("/api/v1/finance/reports/defaulters"),
      ]);
      if (sumRes.status === "fulfilled") setSummary(sumRes.value as any);
      if (agingRes.status === "fulfilled") {
        const d = agingRes.value as any;
        setAging(Array.isArray(d) ? d : d?.data ?? []);
      }
      if (classRes.status === "fulfilled") {
        const d = classRes.value as any;
        setClassReceivables(Array.isArray(d) ? d : d?.data ?? []);
      }
      if (defRes.status === "fulfilled") {
        const d = defRes.value as any;
        setDefaulters(Array.isArray(d) ? d : d?.defaulters ?? d?.data ?? []);
      }
    } catch (err) {
      console.error("Finance fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const collectionPct = summary && summary.totalFees > 0
    ? Math.round((summary.collected / summary.totalFees) * 100) : 0;

  const agingMax = aging.reduce((m, b) => Math.max(m, b.amount), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance</Text>
        <Text style={styles.headerSub}>Fee overview & reports</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {summary && (
          <>
            <LinearGradient colors={["#1A73B5", "#0D4F8A"]} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Fees</Text>
              <Text style={styles.summaryTotal}>{formatMoney(summary.totalFees)}</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: `${collectionPct}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>{collectionPct}% collected</Text>
            </LinearGradient>

            <View style={styles.metricsRow}>
              {[
                { label: "Collected", value: summary.collected, color: COLORS.success, icon: "checkmark-circle" as const },
                { label: "Outstanding", value: summary.outstanding, color: COLORS.warning, icon: "time" as const },
                { label: "Overdue", value: summary.overdue, color: COLORS.error, icon: "alert-circle" as const },
              ].map((m) => (
                <Animated.View key={m.label} entering={FadeInDown.springify()} style={styles.metricCard}>
                  <Ionicons name={m.icon} size={20} color={m.color} />
                  <Text style={[styles.metricValue, { color: m.color }]}>{formatMoney(m.value)}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </Animated.View>
              ))}
            </View>
          </>
        )}

        {aging.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aging Analysis</Text>
            <View style={styles.card}>
              {aging.map((b, i) => (
                <View key={i} style={styles.agingRow}>
                  <View style={styles.agingLabels}>
                    <Text style={styles.agingLabel}>{b.label}</Text>
                    <Text style={styles.agingCount}>{b.count} students</Text>
                  </View>
                  <View style={styles.agingBarBg}>
                    <View
                      style={[styles.agingBar, {
                        width: `${Math.round((b.amount / agingMax) * 100)}%` as any,
                        backgroundColor: i === 0 ? COLORS.success : i === 1 ? COLORS.warning : COLORS.error,
                      }]}
                    />
                  </View>
                  <Text style={styles.agingAmount}>{formatMoney(b.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {classReceivables.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Class-wise Receivables</Text>
            {classReceivables.map((c, i) => {
              const pct = c.totalFee > 0 ? Math.round((c.collected / c.totalFee) * 100) : 0;
              return (
                <Animated.View key={i} entering={FadeInDown.delay(i * 40).springify()} style={styles.classCard}>
                  <View style={styles.classRow}>
                    <Text style={styles.className}>{c.className}</Text>
                    <Text style={styles.classOutstanding}>{formatMoney(c.outstanding)} due</Text>
                  </View>
                  <View style={styles.classProgressBg}>
                    <View style={[styles.classProgressBar, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={styles.classProgressLabel}>{pct}% — {formatMoney(c.collected)} of {formatMoney(c.totalFee)}</Text>
                </Animated.View>
              );
            })}
          </View>
        )}

        {defaulters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Defaulters</Text>
            {defaulters.slice(0, 10).map((d, i) => (
              <Animated.View key={d.id} entering={FadeInDown.delay(i * 30).springify()} style={styles.defaulterCard}>
                <View style={styles.defaulterAvatar}>
                  <Text style={styles.defaulterAvatarText}>{d.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.defaulterName}>{d.name}</Text>
                  <Text style={styles.defaulterClass}>{d.class}</Text>
                  {d.daysOverdue > 0 ? (
                    <Text style={styles.defaulterDays}>{d.daysOverdue} days overdue</Text>
                  ) : null}
                </View>
                <Text style={styles.defaulterAmount}>{formatMoney(d.outstanding)}</Text>
              </Animated.View>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  summaryCard: { marginHorizontal: 16, borderRadius: 18, padding: 20, marginBottom: 14 },
  summaryTitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_500Medium" },
  summaryTotal: { fontSize: 32, color: "#fff", fontFamily: "Inter_700Bold", marginTop: 4, marginBottom: 14 },
  progressBg: { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  progressBar: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
  progressLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" },
  metricsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1, alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  metricValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary, marginBottom: 10 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  agingRow: { marginBottom: 12 },
  agingLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  agingLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textPrimary },
  agingCount: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  agingBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 3 },
  agingBar: { height: 6, borderRadius: 3 },
  agingAmount: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary, textAlign: "right" },
  classCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 13, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  classRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  className: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  classOutstanding: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.error },
  classProgressBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  classProgressBar: { height: 5, backgroundColor: COLORS.primary, borderRadius: 3 },
  classProgressLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  defaulterCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  defaulterAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.error + "15",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  defaulterAvatarText: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.error },
  defaulterName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  defaulterClass: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  defaulterDays: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.error },
  defaulterAmount: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.error },
});
