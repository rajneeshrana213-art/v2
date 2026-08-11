import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Ticket {
  id: string;
  ticketNo?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
  user?: { name: string; role?: string };
}

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STATUS_COLORS: Record<string, string> = { OPEN: "#EF4444", IN_PROGRESS: "#F59E0B", RESOLVED: "#10B981", CLOSED: "#6B7280" };
const PRIORITY_COLORS: Record<string, string> = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#10B981", URGENT: "#7C3AED" };

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (filter !== "ALL") params.set("status", filter);
      const res = await api.get<any>(`/api/v1/dashboard/admin/tickets?${params}`);
      const data = (res as any)?.tickets ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setTickets(data);
    } catch (err) { console.error("Tickets fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchTickets(); }, [filter]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchTickets(); }, [fetchTickets]);

  const renderItem = ({ item, index }: { item: Ticket; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? COLORS.textMuted;
    const priorityColor = PRIORITY_COLORS[item.priority] ?? COLORS.textMuted;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketNo}>{item.ticketNo ?? `#${item.id.slice(-6)}`}</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={[styles.badge, { backgroundColor: priorityColor + "20" }]}>
              <Text style={[styles.badgeText, { color: priorityColor }]}>{item.priority}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{item.status.replace("_", " ")}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
        <View style={styles.cardFooter}>
          {item.user ? <Text style={styles.sub}>{item.user.name}</Text> : null}
          <Text style={styles.sub}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Support Tickets" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {STATUSES.map((s) => (
          <TouchableOpacity key={s} style={[styles.filterPill, filter === s && styles.filterPillActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s.replace("_", " ")}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="help-buoy-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No tickets found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  filterScroll: { maxHeight: 48, marginBottom: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  filterTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  ticketNo: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: COLORS.primary },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary, marginBottom: 4 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
