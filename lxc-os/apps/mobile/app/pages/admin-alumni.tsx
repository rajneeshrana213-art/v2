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

interface Alumni {
  id: string;
  admissionNo?: string;
  passingYear?: number;
  currentOccupation?: string;
  user: { name: string; email: string };
  class?: { name: string };
}

export default function AdminAlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAlumni = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search) params.set("search", search);
      const res = await api.get<any>(`/api/v1/admin/alumni?${params}`);
      const data = (res as any)?.alumni ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setAlumni(data);
    } catch (err) { console.error("Alumni fetch failed:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchAlumni, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchAlumni(); }, [fetchAlumni]);

  const renderItem = ({ item, index }: { item: Alumni; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.user.name}</Text>
        {item.class ? <Text style={styles.sub}>{item.class.name}</Text> : null}
        {item.passingYear ? <Text style={styles.sub}>Batch {item.passingYear}</Text> : null}
        {item.currentOccupation ? <Text style={styles.occupation}>{item.currentOccupation}</Text> : null}
        <Text style={styles.email}>{item.user.email}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Alumni" subtitle={`${alumni.length} registered`} />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search alumni…" placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
        </View>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={alumni}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<View style={styles.center}><Ionicons name="school-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>No alumni found</Text></View>}
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#10B98120", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#10B981" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  occupation: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.primary, marginTop: 2 },
  email: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginTop: 1 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
