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

interface Parent {
  id: string;
  user: { name: string; email?: string; phone?: string };
  children?: Array<{ student: { user: { name: string }; admissionNo?: string } }>;
  _count?: { children: number };
}

export default function AdminParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchParents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search) params.set("search", search);
      const res = await api.get<any>(`/api/v1/admin/core/parents?${params}`);
      const data = (res as any)?.parents ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setParents(data);
    } catch (err) { console.error("Parents fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fetchParents, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [search]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchParents(); }, [fetchParents]);

  const childCount = (p: Parent) => p._count?.children ?? p.children?.length ?? 0;

  const renderItem = ({ item, index }: { item: Parent; index: number }) => {
    const isOpen = expanded === item.id;
    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <TouchableOpacity style={styles.card} onPress={() => setExpanded(isOpen ? null : item.id)} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.user.name}</Text>
            {item.user.email ? <Text style={styles.sub}>{item.user.email}</Text> : null}
            {item.user.phone ? <Text style={styles.sub}>{item.user.phone}</Text> : null}
          </View>
          <View style={styles.childBadge}>
            <Ionicons name="people-outline" size={13} color={COLORS.primary} />
            <Text style={styles.childCount}>{childCount(item)}</Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        {isOpen && item.children && item.children.length > 0 && (
          <View style={styles.childrenContainer}>
            {item.children.map((c, i) => (
              <View key={i} style={styles.childRow}>
                <Ionicons name="person-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.childName}>{c.student.user.name}</Text>
                {c.student.admissionNo ? <Text style={styles.admNo}>{c.student.admissionNo}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Parents" subtitle={`${parents.length} registered`} />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search parents…" placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
        </View>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={parents}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="people-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No parents found</Text></View>}
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.primary },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  childBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  childCount: { fontSize: 12, fontFamily: "Inter_700Bold", color: COLORS.primary },
  childrenContainer: { backgroundColor: COLORS.background, borderRadius: 10, marginBottom: 8, marginHorizontal: 4, padding: 10, gap: 6, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  childRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  childName: { fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.textPrimary, flex: 1 },
  admNo: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
