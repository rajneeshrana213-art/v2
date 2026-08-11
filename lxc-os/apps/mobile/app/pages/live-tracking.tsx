import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ON_ROUTE: { label: "On Route", color: COLORS.success, bg: "#DCFCE7", icon: "navigate-circle" },
  STOPPED: { label: "Stopped", color: COLORS.warning, bg: "#FEF3C7", icon: "pause-circle" },
  AT_STOP: { label: "At Stop", color: "#3B82F6", bg: "#EFF6FF", icon: "location" },
  IDLE: { label: "Idle", color: COLORS.textMuted, bg: "#F3F4F6", icon: "ellipse" },
  COMPLETED: { label: "Trip Completed", color: "#7C3AED", bg: "#EDE9FE", icon: "checkmark-circle" },
};

export default function LiveTrackingScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start(() => pulse());
  }, [pulseAnim]);

  useEffect(() => { pulse(); }, [pulse]);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = user?.role === "parent"
        ? "/api/v1/dashboard/parent/transport/live"
        : "/api/v1/dashboard/student/transport/live";
      const res = await api.get(endpoint);
      setData((res as any)?.data ?? res);
    } catch (e) {
      console.error("Live tracking fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const statusInfo = STATUS_CONFIG[data?.status ?? "IDLE"] ?? STATUS_CONFIG.IDLE;

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Live Bus Tracking" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!data || !data.busNumber) {
    return (
      <View style={styles.container}>
        <PageHeader title="Live Bus Tracking" />
        <View style={styles.emptyState}>
          <Ionicons name="bus-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Bus Assigned</Text>
          <Text style={styles.emptySubtext}>
            You don't have an active bus route assigned. Please contact the school admin.
          </Text>
          <Pressable style={styles.refreshBtn} onPress={fetchData}>
            <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Live Bus Tracking" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={[styles.statusCard, { borderColor: statusInfo.color + "40" }]}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusIconBox, { backgroundColor: statusInfo.bg }]}>
              <Animated.View style={{ transform: [{ scale: data.status === "ON_ROUTE" ? pulseAnim : 1 }] }}>
                <Ionicons name={statusInfo.icon as any} size={28} color={statusInfo.color} />
              </Animated.View>
            </View>
            <View>
              <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              <Text style={styles.updatedAt}>
                Updated: {data.lastUpdated ? format(new Date(data.lastUpdated), "hh:mm a") : "Just now"}
              </Text>
            </View>
          </View>
          {data.status === "ON_ROUTE" && (
            <View style={styles.liveDot}>
              <Animated.View style={[styles.livePulse, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.3], outputRange: [0.6, 0] }) }]} />
              <View style={styles.liveCore} />
            </View>
          )}
        </View>

        <View style={styles.busCard}>
          <Text style={styles.busCardTitle}>Bus Details</Text>
          <View style={styles.busGrid}>
            {[
              { label: "Bus Number", value: data.busNumber, icon: "bus-outline" },
              { label: "Route", value: data.routeName ?? data.route, icon: "map-outline" },
              { label: "Driver", value: data.driverName, icon: "person-outline" },
              { label: "Driver Contact", value: data.driverPhone, icon: "call-outline" },
            ].filter(r => r.value).map(row => (
              <View key={row.label} style={styles.busRow}>
                <View style={styles.busRowLeft}>
                  <Ionicons name={row.icon as any} size={16} color={COLORS.textMuted} />
                  <Text style={styles.busRowLabel}>{row.label}</Text>
                </View>
                <Text style={styles.busRowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {(data.latitude && data.longitude) && (
          <View style={styles.coordCard}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <View>
              <Text style={styles.coordTitle}>Current Location</Text>
              <Text style={styles.coordText}>
                {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
              </Text>
              {data.speed && (
                <Text style={styles.coordMeta}>Speed: {data.speed} km/h</Text>
              )}
            </View>
          </View>
        )}

        {data.eta && (
          <View style={styles.etaCard}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaValue}>{data.eta}</Text>
            </View>
          </View>
        )}

        {(data.stops ?? []).length > 0 && (
          <View style={styles.stopsCard}>
            <Text style={styles.stopsTitle}>Route Stops</Text>
            {data.stops.map((stop: any, idx: number) => {
              const isPassed = stop.status === "PASSED";
              const isCurrent = stop.status === "CURRENT";
              const isNext = stop.status === "NEXT";
              return (
                <View key={stop.id ?? idx} style={styles.stopRow}>
                  <View style={styles.stopLine}>
                    <View style={[
                      styles.stopDot,
                      isPassed && { backgroundColor: COLORS.success },
                      isCurrent && { backgroundColor: "#3B82F6", width: 14, height: 14, borderRadius: 7 },
                      isNext && { backgroundColor: COLORS.warning },
                      !isPassed && !isCurrent && !isNext && { backgroundColor: COLORS.border },
                    ]} />
                    {idx < data.stops.length - 1 && (
                      <View style={[styles.stopConnector, isPassed && { backgroundColor: COLORS.success }]} />
                    )}
                  </View>
                  <View style={styles.stopInfo}>
                    <Text style={[
                      styles.stopName,
                      isCurrent && { color: "#3B82F6", fontWeight: "700" },
                      isPassed && { color: COLORS.textMuted },
                    ]}>
                      {stop.name}
                    </Text>
                    {stop.time && <Text style={styles.stopTime}>{stop.time}</Text>}
                    {isCurrent && <Text style={[styles.stopBadge, { color: "#3B82F6" }]}>● Bus is here</Text>}
                    {isNext && <Text style={[styles.stopBadge, { color: COLORS.warning }]}>Next stop</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.autoRefresh}>Auto-refreshes every 30 seconds</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statusCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  statusIconBox: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  statusLabel: { fontSize: 18, fontWeight: "700" },
  updatedAt: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  liveDot: { alignItems: "center", justifyContent: "center", width: 24, height: 24 },
  livePulse: {
    position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.error,
  },
  liveCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.error },
  busCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  busCardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 },
  busGrid: { gap: 10 },
  busRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  busRowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  busRowLabel: { fontSize: 13, color: COLORS.textSecondary },
  busRowValue: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  coordCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12,
  },
  coordTitle: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  coordText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  coordMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  etaCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#EFF6FF", borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#BFDBFE",
  },
  etaLabel: { fontSize: 13, color: "#3B82F6" },
  etaValue: { fontSize: 22, fontWeight: "700", color: "#1D4ED8" },
  stopsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 14,
  },
  stopsTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 16 },
  stopRow: { flexDirection: "row", gap: 14, marginBottom: 8 },
  stopLine: { alignItems: "center", width: 14 },
  stopDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border },
  stopConnector: { width: 2, flex: 1, backgroundColor: COLORS.border, minHeight: 20, marginTop: 4 },
  stopInfo: { flex: 1, paddingBottom: 12 },
  stopName: { fontSize: 14, fontWeight: "500", color: COLORS.textPrimary },
  stopTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  stopBadge: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  refreshBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 20, marginTop: 24,
  },
  refreshBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  autoRefresh: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 8 },
});
