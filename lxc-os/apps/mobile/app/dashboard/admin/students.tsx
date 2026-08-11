import { useState, useCallback, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface Student {
  id: string;
  admissionNo: string;
  rollNo?: string;
  status: string;
  user: { name: string; email: string; phone?: string; profilePic?: string | null };
  class?: { name: string };
  section?: string;
}

interface ClassOption { id: string; name: string }

export default function AdminStudentsScreen() {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get<ClassOption[]>("/api/v1/dashboard/admin/classes");
      setClasses(res as any);
    } catch {}
  }, []);

  const fetchStudents = useCallback(async (pageNum = 1, replace = true) => {
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (search) params.set("search", search);
      if (selectedClass !== "all") params.set("classId", selectedClass);
      const res = await api.get<any>(`/api/v1/dashboard/admin/students?${params}`);
      const items: Student[] = (res as any)?.students ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      const tot = (res as any)?.total ?? items.length;
      setTotal(tot);
      setStudents((prev) => replace ? items : [...prev, ...items]);
      setPage(pageNum);
    } catch (err) {
      console.error("Students fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, selectedClass]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    setLoading(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchStudents(1, true), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, selectedClass]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents(1, true);
  }, [fetchStudents]);

  const onLoadMore = useCallback(() => {
    if (loadingMore || students.length >= total) return;
    setLoadingMore(true);
    fetchStudents(page + 1, false);
  }, [loadingMore, students.length, total, page, fetchStudents]);

  const handleDelete = (s: Student) => {
    Alert.alert(
      "Remove Student",
      `Remove ${s.user.name} from the system?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/v1/dashboard/admin/students/${s.id}`);
              setStudents((prev) => prev.filter((x) => x.id !== s.id));
              setTotal((t) => t - 1);
            } catch { Alert.alert("Error", "Could not remove student."); }
          },
        },
      ]
    );
  };

  const statusColor = (s: string) => {
    if (s === "ACTIVE") return COLORS.success;
    if (s === "INACTIVE") return COLORS.error;
    return COLORS.warning;
  };

  const renderItem = ({ item, index }: { item: Student; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.user.name}</Text>
        <Text style={styles.sub}>Adm: {item.admissionNo}</Text>
        {item.class && (
          <Text style={styles.sub}>
            {item.class.name}{item.section ? ` – ${item.section}` : ""}
          </Text>
        )}
        <Text style={styles.email}>{item.user.email}</Text>
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.badge, { backgroundColor: statusColor(item.status) + "20" }]}>
          <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students</Text>
        <Text style={styles.headerSub}>{total} total</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, admission no…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {[{ id: "all", name: "All Classes" }, ...classes].map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, selectedClass === c.id && styles.chipActive]}
            onPress={() => setSelectedClass(c.id)}
          >
            <Text style={[styles.chipText, selectedClass === c.id && styles.chipTextActive]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={COLORS.primary} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No students found</Text>
            </View>
          }
        />
      )}

      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  searchRow: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: COLORS.textPrimary },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textSecondary },
  chipTextActive: { color: "#fff" },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginTop: 4,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.primary },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 1 },
  email: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textSecondary, marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  deleteBtn: { padding: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
