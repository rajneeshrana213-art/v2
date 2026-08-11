import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

type TabKey = "upcoming" | "results";

export default function ParentExamsScreen() {
  const { activeStudentId } = useAuth();
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeStudentId) return;
    try {
      const [exRes, resRes] = await Promise.all([
        api.get(`/api/v1/dashboard/parent/exams?studentId=${activeStudentId}`),
        api.get(`/api/v1/dashboard/parent/results?studentId=${activeStudentId}`),
      ]);
      const exArr = (exRes as any)?.data ?? (Array.isArray(exRes) ? exRes : []);
      const resArr = (resRes as any)?.data ?? (Array.isArray(resRes) ? resRes : []);
      setExams(exArr);
      setResults(resArr);
    } catch (e) {
      console.error("Parent exams fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStudentId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getGradeColor = (pct: number) => {
    if (pct >= 90) return COLORS.success;
    if (pct >= 75) return "#3B82F6";
    if (pct >= 60) return COLORS.warning;
    return COLORS.error;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Child Exams" />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Child Exams" />
      <View style={styles.tabBar}>
        {(["upcoming", "results"] as TabKey[]).map(t => (
          <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "upcoming" ? "Upcoming" : "Results"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {!activeStudentId && (
          <View style={styles.emptyCard}>
            <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No child selected</Text>
          </View>
        )}

        {activeStudentId && tab === "upcoming" && (
          exams.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No upcoming exams</Text>
            </View>
          ) : exams.map((exam: any) => (
            <View key={exam.id ?? exam.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{exam.subject ?? "Subject"}</Text>
                </View>
                <Text style={styles.dateText}>
                  {exam.date ? format(new Date(exam.date), "dd MMM yyyy") : "-"}
                </Text>
              </View>
              <Text style={styles.examTitle}>{exam.title ?? exam.name ?? "Exam"}</Text>
              <View style={styles.examMeta}>
                {exam.maxMarks && (
                  <View style={styles.metaItem}>
                    <Ionicons name="trophy-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>Max: {exam.maxMarks}</Text>
                  </View>
                )}
                {exam.duration && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{exam.duration}</Text>
                  </View>
                )}
                {exam.venue && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{exam.venue}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {activeStudentId && tab === "results" && (
          results.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No results yet</Text>
            </View>
          ) : results.map((r: any) => {
            const pct = r.maxMarks ? Math.round((r.obtainedMarks / r.maxMarks) * 100) : 0;
            return (
              <View key={r.id ?? r.subject} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{r.subject ?? "Subject"}</Text>
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(pct) + "22" }]}>
                    <Text style={[styles.gradeText, { color: getGradeColor(pct) }]}>
                      {r.grade ?? `${pct}%`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.examTitle}>{r.examName ?? r.exam ?? "Exam"}</Text>
                {r.maxMarks && (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={[styles.scoreValue, { color: getGradeColor(pct) }]}>
                      {r.obtainedMarks} / {r.maxMarks}
                    </Text>
                  </View>
                )}
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {
                    width: `${pct}%` as any,
                    backgroundColor: getGradeColor(pct),
                  }]} />
                </View>
                {r.remarks && (
                  <Text style={styles.remarks}>{r.remarks}</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: "row", backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textMuted, fontWeight: "500" },
  tabTextActive: { color: COLORS.primary, fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  subjectBadge: {
    backgroundColor: COLORS.primaryLight + "22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  subjectText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  examTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  examMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textMuted },
  gradeBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  gradeText: { fontSize: 13, fontWeight: "700" },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  scoreLabel: { fontSize: 13, color: COLORS.textSecondary },
  scoreValue: { fontSize: 16, fontWeight: "700" },
  progressBar: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  remarks: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic", marginTop: 4 },
  emptyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 32,
    alignItems: "center", marginTop: 20,
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, marginTop: 12, textAlign: "center" },
});
