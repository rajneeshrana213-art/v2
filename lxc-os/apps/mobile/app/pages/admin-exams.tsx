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
import { format, isPast, isFuture } from "date-fns";

interface Exam {
  id: string;
  title: string;
  type?: string;
  startDate: string;
  endDate?: string;
  status: string;
  class?: { name: string };
  subject?: { name: string };
  _count?: { results: number };
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: COLORS.primary,
  ONGOING: "#F59E0B",
  COMPLETED: COLORS.success,
  DECLARED: "#8B5CF6",
  CANCELLED: COLORS.error,
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [declaring, setDeclaring] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get<any>("/api/v1/admin/exams");
      const data = (res as any)?.exams ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setExams(data);
    } catch (err) {
      console.error("Exams fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExams();
  }, [fetchExams]);

  const handleDeclare = (exam: Exam) => {
    Alert.alert(
      "Declare Results",
      `Declare results for "${exam.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Declare", style: "default",
          onPress: async () => {
            setDeclaring(exam.id);
            try {
              await api.post(`/api/v1/admin/exams/${exam.id}/declare`, {});
              setExams((prev) =>
                prev.map((e) => e.id === exam.id ? { ...e, status: "DECLARED" } : e)
              );
            } catch { Alert.alert("Error", "Failed to declare results."); }
            finally { setDeclaring(null); }
          },
        },
      ]
    );
  };

  const resolveStatus = (exam: Exam): string => {
    if (exam.status) return exam.status;
    if (isFuture(new Date(exam.startDate))) return "UPCOMING";
    if (exam.endDate && isPast(new Date(exam.endDate))) return "COMPLETED";
    return "ONGOING";
  };

  const renderItem = ({ item, index }: { item: Exam; index: number }) => {
    const status = resolveStatus(item);
    const color = STATUS_COLORS[status] ?? "#6B7280";
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.typeBox, { backgroundColor: color + "15" }]}>
            <Ionicons name="clipboard" size={20} color={color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.examTitle}>{item.title}</Text>
            <Text style={styles.examMeta}>
              {item.class?.name ?? "All Classes"}
              {item.subject ? ` · ${item.subject.name}` : ""}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.statusText, { color }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.datesRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.dates}>
            {format(new Date(item.startDate), "dd MMM yyyy")}
            {item.endDate ? ` — ${format(new Date(item.endDate), "dd MMM yyyy")}` : ""}
          </Text>
        </View>

        {item._count?.results !== undefined && (
          <Text style={styles.resultCount}>{item._count.results} results recorded</Text>
        )}

        {status === "COMPLETED" && (
          <TouchableOpacity
            style={styles.declareBtn}
            onPress={() => handleDeclare(item)}
            disabled={declaring === item.id}
          >
            {declaring === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="megaphone" size={15} color="#fff" />
                <Text style={styles.declareBtnText}>Declare Results</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Exams" subtitle={`${exams.length} scheduled`} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="clipboard-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No exams found</Text>
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
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  typeBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  examTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textPrimary },
  examMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  datesRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dates: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textSecondary },
  resultCount: { fontSize: 11, fontFamily: "Inter_400Regular", color: COLORS.textMuted, marginTop: 2, marginBottom: 10 },
  declareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#8B5CF6", borderRadius: 10, paddingVertical: 10, marginTop: 8 },
  declareBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: COLORS.textMuted },
});
