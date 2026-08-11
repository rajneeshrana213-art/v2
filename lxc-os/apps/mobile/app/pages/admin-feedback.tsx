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

interface Feedback {
  id: string;
  type?: string;
  rating?: number;
  comment: string;
  status: string;
  createdAt: string;
  user?: { name: string; role?: string };
}

const FILTERS = ["ALL", "PENDING", "REVIEWED", "RESOLVED"];
const STATUS_COLORS: Record<string, string> = { PENDING: COLORS.warning, REVIEWED: COLORS.primary, RESOLVED: COLORS.success };
const TYPE_COLORS: Record<string, string> = { COMPLAINT: "#EF4444", SUGGESTION: "#8B5CF6", COMPLIMENT: "#10B981", GENERAL: "#6B7280" };

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const fetchFeedback = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (filter !== "ALL") params.set("status", filter);
      const res = await api.get<any>(`/api/v1/dashboard/admin/feedback?${params}`);
      const data = (res as any)?.feedback ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setFeedback(data);
    } catch (err) { console.error("Feedback fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchFeedback(); }, [filter]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchFeedback(); }, [fetchFeedback]);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Ionicons key={s} name={s <= rating ? "star" : "star-outline"} size={12} color="#F59E0B" />
        ))}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Feedback; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? COLORS.textMuted;
    const typeColor = TYPE_COLORS[item.type ?? ""] ?? COLORS.textSecondary;
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardHeader}>
          {item.type ? (
            <View style={[styles.badge, { backgroundColor: typeColor + "20" }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>{item.type}</Text>
            </View>
          ) : <View />}
          <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        {renderStars(item.rating)}
        <Text style={styles.comment} numberOfLines={4}>{item.comment}</Text>
        <View style={styles.cardFooter}>
          {item.user ? <Text style={styles.sub}>{item.user.name} · {item.user.role}</Text> : null}
          <Text style={styles.sub}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Feedback" subtitle={`${feedback.length} items`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterPill, filter === f && styles.filterPillActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={feedback}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="chatbox-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No feedback received</Text></View>}
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  comment: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textPrimary, lineHeight: 20, marginVertical: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
