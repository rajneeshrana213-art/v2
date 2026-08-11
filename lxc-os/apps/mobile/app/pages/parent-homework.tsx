import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  PENDING: { color: COLORS.warning, bg: "#FEF3C7", icon: "time-outline" },
  SUBMITTED: { color: "#3B82F6", bg: "#EFF6FF", icon: "checkmark-circle-outline" },
  GRADED: { color: COLORS.success, bg: "#DCFCE7", icon: "ribbon-outline" },
  OVERDUE: { color: COLORS.error, bg: "#FEE2E2", icon: "alert-circle-outline" },
};

export default function ParentHomeworkScreen() {
  const { activeStudentId } = useAuth();
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeStudentId) return;
    try {
      const res = await api.get(`/api/v1/dashboard/parent/homework?studentId=${activeStudentId}`);
      const arr = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setHomework(arr);
    } catch (e) {
      console.error("Parent homework fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStudentId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const pending = homework.filter(h => h.status === "PENDING" || h.status === "OVERDUE");
  const completed = homework.filter(h => h.status === "SUBMITTED" || h.status === "GRADED");

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Child Homework" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Child Homework" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {!activeStudentId && (
          <View style={styles.emptyCard}>
            <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No child selected</Text>
            <Text style={styles.emptySubtext}>Please select a child from your profile</Text>
          </View>
        )}

        {activeStudentId && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>{pending.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
                <Text style={[styles.statValue, { color: COLORS.success }]}>{completed.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: "#3B82F6" }]}>
                <Text style={[styles.statValue, { color: "#3B82F6" }]}>{homework.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            {homework.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No homework assigned</Text>
              </View>
            ) : (
              <>
                {pending.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Pending</Text>
                    {pending.map(hw => <HomeworkCard key={hw.id} hw={hw} />)}
                  </>
                )}
                {completed.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Completed</Text>
                    {completed.map(hw => <HomeworkCard key={hw.id} hw={hw} />)}
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function HomeworkCard({ hw }: { hw: any }) {
  const cfg = STATUS_CONFIG[hw.status] ?? STATUS_CONFIG["PENDING"];
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{hw.subject ?? hw.class ?? "Subject"}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{hw.status}</Text>
        </View>
      </View>
      <Text style={styles.hwTitle}>{hw.title ?? hw.description ?? "Homework"}</Text>
      {hw.description && hw.title && (
        <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text>
      )}
      <View style={styles.hwMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.metaText}>
            Due: {hw.dueDate ? format(new Date(hw.dueDate), "dd MMM yyyy") : "N/A"}
          </Text>
        </View>
        {hw.teacher && (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{hw.teacher}</Text>
          </View>
        )}
      </View>
      {hw.grade && (
        <View style={styles.gradeRow}>
          <Text style={styles.gradeLabel}>Grade: </Text>
          <Text style={[styles.gradeVal, { color: COLORS.success }]}>{hw.grade}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    borderLeftWidth: 3, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  subjectBadge: {
    backgroundColor: COLORS.primaryLight + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  subjectText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  hwTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 4 },
  hwDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  hwMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textMuted },
  gradeRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  gradeLabel: { fontSize: 13, color: COLORS.textSecondary },
  gradeVal: { fontSize: 13, fontWeight: "700" },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32,
    alignItems: "center", marginTop: 20,
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12, textAlign: "center" },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: "center" },
});
