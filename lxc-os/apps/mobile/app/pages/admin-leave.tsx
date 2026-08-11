import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface LeaveRequest {
  id: string;
  type: string;
  reason?: string;
  from: string;
  to: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string; role: string; email: string };
  createdAt: string;
}

const STATUS_COLORS = {
  PENDING: COLORS.warning,
  APPROVED: COLORS.success,
  REJECTED: COLORS.error,
};

type FilterStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function AdminLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get<any>(`/api/v1/admin/leave-requests?status=${filter}`);
      const data = (res as any)?.requests ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setRequests(data);
    } catch (err) {
      console.error("Leave requests fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await api.post(`/api/v1/admin/leave-requests/${id}/${action}`, {});
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert("Done", `Request ${action === "approve" ? "approved" : "rejected"}.`);
    } catch {
      Alert.alert("Error", `Could not ${action} request.`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderItem = ({ item, index }: { item: LeaveRequest; index: number }) => {
    const statusColor = STATUS_COLORS[item.status];
    const days = Math.ceil((new Date(item.to).getTime() - new Date(item.from).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.user.name}</Text>
            <Text style={styles.role}>{item.user.role}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailChip}>
            <Ionicons name="document-text-outline" size={13} color={COLORS.primary} />
            <Text style={styles.detailText}>{item.type}</Text>
          </View>
          <View style={styles.detailChip}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {format(new Date(item.from), "dd MMM")} — {format(new Date(item.to), "dd MMM")} ({days}d)
            </Text>
          </View>
        </View>

        {item.reason ? (
          <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>
        ) : null}

        {item.status === "PENDING" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.success + "15" }]}
              onPress={() => handleAction(item.id, "approve")}
              disabled={!!actionLoading}
            >
              {actionLoading === item.id + "approve" ? (
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
              onPress={() => handleAction(item.id, "reject")}
              disabled={!!actionLoading}
            >
              {actionLoading === item.id + "reject" ? (
                <ActivityIndicator size="small" color={COLORS.error} />
              ) : (
                <>
                  <Ionicons name="close-circle" size={16} color={COLORS.error} />
                  <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Leave Requests" />

      <View style={styles.filterRow}>
        {(["PENDING", "APPROVED", "REJECTED"] as FilterStatus[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: STATUS_COLORS[f] + "20", borderColor: STATUS_COLORS[f] }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && { color: STATUS_COLORS[f], fontFamily: "Inter_700Bold" }]}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No {filter.toLowerCase()} requests</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: COLORS.primary },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  role: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  detailsRow: { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  detailChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 11, fontFamily: "Inter_500Medium", color: COLORS.primary },
  reason: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 9, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
