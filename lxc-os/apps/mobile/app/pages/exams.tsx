import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { ParentBottomNav } from "@/components/ParentBottomNav";
import { TeacherBottomNav } from "@/components/TeacherBottomNav";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Exam, ResultRecord, ExamSchedule } from "@/lib/types/student";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

const { height } = Dimensions.get("window");

const SUBJECT_THEMES: Record<string, { primary: string; secondary: string }> = {
  Mathematics: { primary: "#3B82F6", secondary: "#DBEAFE" },
  Physics: { primary: "#8B5CF6", secondary: "#EDE9FE" },
  English: { primary: "#10B981", secondary: "#D1FAE5" },
  Chemistry: { primary: "#F59E0B", secondary: "#FEF3C7" },
  "Computer Science": { primary: "#06B6D4", secondary: "#CFFAFE" },
  Hindi: { primary: "#EC4899", secondary: "#FCE7F3" },
  Default: { primary: COLORS.primary, secondary: COLORS.primary + "15" },
};

function ExamsPage() {
  const insets = useSafeAreaInsets();
  const { user, activeStudentId } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingExams, setUpcomingExams] = useState<ExamSchedule[]>([]);
  const [pastExams, setPastExams] = useState<ResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedExam, setSelectedExam] = useState<ResultRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchExams = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      let upcomingRes, pastRes;

      if (user?.role === "parent") {
        if (!activeStudentId) return;
        upcomingRes = await api.get<{ data: ExamSchedule[] }>(`/api/v1/dashboard/parent/exams?studentId=${activeStudentId}`);
        pastRes = await api.get<{ data: ResultRecord[] }>(`/api/v1/dashboard/parent/results?studentId=${activeStudentId}`);
      } else if (user?.role === "teacher") {
        upcomingRes = await api.get<{ data: ExamSchedule[] }>("/api/v1/dashboard/teacher/exams");
        pastRes = [];
      } else {
        upcomingRes = await api.get<{ data: ExamSchedule[] }>("/api/v1/dashboard/student/exams");
        pastRes = await api.get<{ data: ResultRecord[] }>("/api/v1/dashboard/student/results");
      }

      setUpcomingExams((upcomingRes as any) || []);
      setPastExams((pastRes as any) || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.role, activeStudentId]);

  useEffect(() => {
    if (user?.role === "teacher") {
      router.replace("/pages/teacher-exams" as any);
      return;
    }
    fetchExams();
  }, [fetchExams, activeStudentId, user?.role]);

  const onRefresh = useCallback(() => fetchExams(true), [fetchExams]);

  const overallScore = pastExams.length > 0
    ? pastExams.reduce((acc, curr) => acc + curr.score, 0) / pastExams.length
    : 0;

  const getGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const overallGrade = pastExams.length > 0 ? getGrade(overallScore) : "N/A";

  return (
    <View style={styles.container}>
      <PageHeader title="Exams & Results" subtitle="Your Academic Journey" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing records...</Text>
          </View>
        ) : (
          <>
            {/* Performance Hero */}
            <Animated.View entering={FadeInDown.duration(600)} style={styles.heroSection}>
              <LinearGradient
                colors={[COLORS.secondary, "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.performanceCard}
              >
                <View style={styles.heroLeft}>
                  <Text style={styles.heroTitle}>Overall Grade</Text>
                  <Text style={styles.heroValue}>{Math.round(overallScore)}%</Text>
                  <Text style={styles.heroSubtitle}>Based on {pastExams.length} assessments</Text>
                </View>
                <View style={styles.heroRight}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{overallGrade}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Upcoming Exams */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Exam Schedule</Text>
              </View>

              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, idx) => {
                  const subjectName = typeof exam.subject === "string" ? exam.subject : exam.subject.name;
                  const theme = SUBJECT_THEMES[subjectName] || SUBJECT_THEMES.Default;

                  return (
                    <Animated.View key={exam.id || idx} entering={FadeInUp.delay(idx * 100)} layout={Layout.springify()} style={styles.examCard}>
                      <View style={[styles.examIcon, { backgroundColor: theme.secondary }]}>
                        <Ionicons name="document-text" size={24} color={theme.primary} />
                      </View>
                      <View style={styles.examContent}>
                        <View style={styles.examHeader}>
                          <Text style={[styles.examSubject, { color: theme.primary }]}>{subjectName}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: theme.primary + "10" }]}>
                            <Text style={[styles.typeText, { color: theme.primary }]}>{exam.title}</Text>
                          </View>
                        </View>
                        <View style={styles.examMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>{format(new Date(exam.scheduleDate), "MMM d, yyyy")}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>
                              {exam.time?.includes("T") ? format(new Date(exam.time), "hh:mm aa") : exam.time}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="notifications-off-outline" size={32} color={COLORS.border} />
                  <Text style={styles.emptyText}>No exams scheduled yet</Text>
                </View>
              )}
            </View>

            {/* Results */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="ribbon" size={20} color={COLORS.secondary} />
                <Text style={styles.sectionTitle}>Academic Results</Text>
              </View>

              {pastExams.length > 0 ? (
                pastExams.map((result, idx) => {
                  const subjectName = result.exam?.subject?.name || result.assignment?.subject?.name || "Unknown";
                  const theme = SUBJECT_THEMES[subjectName] || SUBJECT_THEMES.Default;

                  return (
                    <Animated.View key={result.id || idx} entering={FadeInUp.delay((upcomingExams.length + idx) * 100)} style={styles.resultCard}>
                      <View style={styles.resultMain}>
                        <View style={styles.resultSubjectInfo}>
                          <View style={[styles.resultIndicator, { backgroundColor: theme.primary }]} />
                          <View>
                            <Text style={styles.resultSubject}>{subjectName}</Text>
                            <Text style={styles.resultTitle}>{result.exam?.title || result.assignment?.title}</Text>
                          </View>
                        </View>
                        <View style={styles.scoreContainer}>
                          <Text style={[styles.scoreValue, { color: theme.primary }]}>{result.score}%</Text>
                          <View style={[styles.gradeMiniBadge, { backgroundColor: theme.secondary }]}>
                            <Text style={[styles.gradeMiniText, { color: theme.primary }]}>{getGrade(result.score)}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.scoreBarBg}>
                        <Animated.View style={[styles.scoreBarFill, { width: `${result.score}%`, backgroundColor: theme.primary }]} />
                      </View>
                    </Animated.View>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No results posted</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {user?.role === "parent" ? <ParentBottomNav /> : user?.role === "teacher" ? <TeacherBottomNav /> : <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroSection: { padding: 16 },
  performanceCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  heroValue: { fontSize: 36, fontFamily: "Inter_900Black", color: "#FFFFFF", marginBottom: 4 },
  heroSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  heroRight: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  gradeBadge: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  gradeText: { fontSize: 32, fontFamily: "Inter_800ExtraBold", color: "#FFFFFF" },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: COLORS.textPrimary },

  examCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  examIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  examContent: { flex: 1, marginLeft: 16 },
  examHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  examSubject: { fontSize: 14, fontFamily: "Inter_700Bold", textTransform: "uppercase" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  examMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: COLORS.textMuted },

  resultCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  resultMain: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  resultSubjectInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  resultIndicator: { width: 4, height: 32, borderRadius: 2 },
  resultSubject: { fontSize: 15, fontFamily: "Inter_700Bold", color: COLORS.textPrimary },
  resultTitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: COLORS.textMuted },
  scoreContainer: { alignItems: "flex-end", gap: 4 },
  scoreValue: { fontSize: 18, fontFamily: "Inter_800ExtraBold" },
  gradeMiniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  gradeMiniText: { fontSize: 10, fontFamily: "Inter_800ExtraBold" },
  scoreBarBg: { height: 6, backgroundColor: COLORS.background, borderRadius: 3, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 3 },

  emptyCard: { padding: 32, backgroundColor: COLORS.surface, borderRadius: 20, alignItems: "center", borderStyle: "dashed", borderWidth: 1, borderColor: COLORS.border },
  emptyText: { marginTop: 8, fontSize: 14, fontFamily: "Inter_500Medium", color: COLORS.textMuted },

  loaderContainer: { paddingVertical: 100, alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 14, fontFamily: "Inter_600SemiBold", color: COLORS.textSecondary },
});

export default ExamsPage;
