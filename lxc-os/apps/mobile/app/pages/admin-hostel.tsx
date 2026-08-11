import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Hostel { id: string; name: string; type?: string; capacity: number; occupancy?: number; status: string }

export default function AdminHostelPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHostels = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/dashboard/admin/hostel");
      const data = Array.isArray(res) ? res : (res as any)?.hostels ?? (res as any)?.data ?? [];
      setHostels(data);
    } catch (err) {
      console.error("Hostel fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHostels(); }, [fetchHostels]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchHostels(); }, [fetchHostels]);

  const renderItem = ({ item, index }: { item: Hostel; index: number }) => {
    const occupancyPct = item.capacity > 0 ? Math.round(((item.occupancy ?? 0) / item.capacity) * 100) : 0;
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: "#6366F120" }]}>
          <Ionicons name="home" size={22} color="#6366F1" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.type ? <Text style={styles.sub}>{item.type}</Text> : null}
          <View style={styles.occupancyRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${occupancyPct}%` as any }]} />
            </View>
            <Text style={styles.occupancyText}>
              {item.occupancy ?? 0}/{item.capacity} beds
            </Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: item.status === "ACTIVE" ? COLORS.success + "20" : COLORS.error + "20" }]}>
          <Text style={[styles.badgeText, { color: item.status === "ACTIVE" ? COLORS.success : COLORS.error }]}>
            {item.status}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Hostel" subtitle={`${hostels.length} blocks`} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={hostels}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="home-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No hostels configured</Text>
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  occupancyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  progressBg: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: "hidden" },
  progressBar: { height: 4, backgroundColor: "#6366F1", borderRadius: 2 },
  occupancyText: { fontSize: 10, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
