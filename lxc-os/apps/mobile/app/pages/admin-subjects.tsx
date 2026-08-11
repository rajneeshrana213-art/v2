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

interface Subject {
  id: string;
  name: string;
  code?: string;
  type?: string;
  class?: { name: string };
  teacher?: { user: { name: string } };
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (search) params.set("search", search);
      const res = await api.get<any>(`/api/v1/dashboard/admin/subjects?${params}`);
      const data = (res as any)?.subjects ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setSubjects(data);
    } catch (err) { console.error("Subjects fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fetchSubjects, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchSubjects(); }, [fetchSubjects]);

  const TYPE_COLORS: Record<string, string> = {
    THEORY: "#1A73B5",
    PRACTICAL: "#10B981",
    LAB: "#8B5CF6",
    ELECTIVE: "#F59E0B",
  };

  const renderItem = ({ item, index }: { item: Subject; index: number }) => {
    const typeColor = TYPE_COLORS[item.type ?? ""] ?? COLORS.primary;
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: typeColor + "15" }]}>
          <Ionicons name="book-outline" size={20} color={typeColor} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.code ? <Text style={styles.sub}>Code: {item.code}</Text> : null}
          {item.class ? <Text style={styles.sub}>{item.class.name}</Text> : null}
          {item.teacher ? <Text style={styles.sub}>Teacher: {item.teacher.user.name}</Text> : null}
        </View>
        {item.type ? (
          <View style={[styles.badge, { backgroundColor: typeColor + "15" }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>{item.type}</Text>
          </View>
        ) : null}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Subjects" subtitle={`${subjects.length} subjects`} />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search subjects…" placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
        </View>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="book-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No subjects found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 12 },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
