import { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

interface ClassData {
  id: string;
  name: string;
  order?: number;
  sections?: { id: string; name: string; studentCount?: number }[];
  _count?: { students: number; subjects: number };
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get<ClassData[]>("/api/v1/dashboard/admin/classes");
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.classes ?? [];
      setClasses(data);
    } catch (err) {
      console.error("Classes fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, [fetchClasses]);

  const renderItem = ({ item, index }: { item: ClassData; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => setExpanded(expanded === item.id ? null : item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.classIconBox}>
          <Text style={styles.classIconText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classMeta}>
            {item.sections?.length ?? 0} sections
            {item._count ? ` · ${item._count.students} students · ${item._count.subjects} subjects` : ""}
          </Text>
        </View>
        <Ionicons
          name={expanded === item.id ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {expanded === item.id && item.sections && item.sections.length > 0 && (
        <View style={styles.sectionsBox}>
          {item.sections.map((s) => (
            <View key={s.id} style={styles.sectionRow}>
              <Ionicons name="git-branch-outline" size={14} color={COLORS.primary} />
              <Text style={styles.sectionName}>Section {s.name}</Text>
              {s.studentCount !== undefined && (
                <Text style={styles.sectionCount}>{s.studentCount} students</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <PageHeader title="Classes & Sections" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="layers-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No classes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  classCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  classIconBox: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.primaryLight,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  classIconText: { fontSize: 18, fontFamily: "Inter_700Bold", color: COLORS.primary },
  className: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  classMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  sectionsBox: {
    backgroundColor: COLORS.primaryLight + "80",
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    padding: 12, marginBottom: 8, gap: 8,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: COLORS.primary },
  sectionCount: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
