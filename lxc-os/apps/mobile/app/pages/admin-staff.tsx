import { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface StaffMember {
  id: string;
  employeeId?: string;
  role?: string;
  status: string;
  department?: { name: string };
  user: { name: string; email: string; phone?: string };
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search) params.set("search", search);
      const res = await api.get<any>(`/api/v1/admin/core/staff/accounts?${params}`);
      const data: StaffMember[] = (res as any)?.staff ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setStaff(data);
      setTotal((res as any)?.total ?? data.length);
    } catch (err) {
      console.error("Staff fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchStaff, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStaff();
  }, [fetchStaff]);

  const statusColor = (s: string) => s === "ACTIVE" ? COLORS.success : COLORS.error;

  const renderItem = ({ item, index }: { item: StaffMember; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: "#F59E0B20" }]}>
        <Text style={[styles.avatarText, { color: "#F59E0B" }]}>
          {item.user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.user.name}</Text>
        {item.role ? <Text style={styles.sub}>{item.role}</Text> : null}
        {item.department ? <Text style={styles.sub}>{item.department.name}</Text> : null}
        <Text style={styles.email}>{item.user.email}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + "20" }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Staff" subtitle={`${total} members`} />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-circle-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No staff found</Text>
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
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  email: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
